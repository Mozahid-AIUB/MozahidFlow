"""Transcribe a video/audio file locally with faster-whisper (Bengali by default).

Writes next to each other in OUTDIR:
  transcript.txt  plain text with [mm:ss] per segment (for reading the content)
  <name>.srt      subtitle file (cue length capped for on-screen reading)
  words.json      {"language", "words": [{word,start,end}], "segments": [...]}  (ffmpeg-skill silence.py --words)
  words.txt       "start:word" per cue line (motion-broll skill format)

usage:
  D:\\Video\\tools\\.venv\\Scripts\\python.exe transcribe.py INPUT OUTDIR [--model large-v3] [--lang bn]
models (cached in %USERPROFILE%\\.cache\\huggingface): large-v3 (best Bengali, slow), large-v3-turbo (fast draft)
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")


def fmt_srt(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def cues_from_words(words, max_chars=42, max_dur=5.0, gap=0.6):
    """Group words into readable subtitle cues: break on long pauses, length or duration."""
    cues, cur = [], []
    for w in words:
        if cur:
            text_len = sum(len(x["word"]) for x in cur) + len(w["word"])
            if (w["start"] - cur[-1]["end"] > gap or text_len > max_chars
                    or w["end"] - cur[0]["start"] > max_dur):
                cues.append(cur)
                cur = []
        cur.append(w)
    if cur:
        cues.append(cur)
    return [{"start": c[0]["start"], "end": c[-1]["end"],
             "text": "".join(x["word"] for x in c).strip(), "words": c} for c in cues]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("outdir")
    ap.add_argument("--model", default="large-v3")
    ap.add_argument("--lang", default="bn", help="language code, or 'auto' to detect")
    ap.add_argument("--threads", type=int, default=4)
    ap.add_argument("--prompt", default=None,
                    help="initial prompt: topic words, names and English terms the speaker uses (improves spelling)")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    src = Path(args.input)
    out = Path(args.outdir)
    out.mkdir(parents=True, exist_ok=True)

    # 16 kHz mono WAV: what Whisper wants, and decoding once is faster than letting it read the video.
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "audio.wav"
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(src), "-vn", "-ac", "1",
                        "-ar", "16000", str(wav)], check=True)

        t0 = time.time()
        model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=args.threads)
        segments, info = model.transcribe(
            str(wav),
            language=None if args.lang == "auto" else args.lang,
            word_timestamps=True,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
            beam_size=5,
            condition_on_previous_text=False,  # stops one hallucinated line repeating to the end
            initial_prompt=args.prompt,
        )
        segs, words = [], []
        for s in segments:
            sw = [{"word": w.word, "start": round(w.start, 3), "end": round(w.end, 3),
                   "probability": round(w.probability, 3)} for w in (s.words or [])]
            segs.append({"start": round(s.start, 3), "end": round(s.end, 3), "text": s.text.strip(), "words": sw})
            words.extend(sw)
            print(f"[{s.start:7.1f}s] {s.text.strip()}", flush=True)

    elapsed = time.time() - t0
    (out / "words.json").write_text(json.dumps(
        {"language": info.language, "language_probability": round(info.language_probability, 3),
         "model": args.model, "duration": round(info.duration, 3), "words": words, "segments": segs},
        ensure_ascii=False, indent=1), encoding="utf-8")

    lines = [f"[{int(s['start'] // 60):02d}:{int(s['start'] % 60):02d}] {s['text']}" for s in segs]
    (out / "transcript.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    cues = cues_from_words(words)
    srt = "\n".join(f"{i}\n{fmt_srt(c['start'])} --> {fmt_srt(c['end'])}\n{c['text']}\n"
                    for i, c in enumerate(cues, 1))
    (out / f"{src.stem}.srt").write_text(srt, encoding="utf-8")

    (out / "words.txt").write_text(
        "\n".join(" ".join(f"{w['start']:.2f}:{w['word'].strip()}" for w in c["words"] if w["word"].strip())
                  for c in cues) + "\n",
        encoding="utf-8")

    low = sum(1 for w in words if w["probability"] < 0.5)
    print(f"\nDone: {len(segs)} segments, {len(words)} words, {len(cues)} cues; language={info.language} "
          f"({info.language_probability:.2f}); audio {info.duration:.0f}s in {elapsed:.0f}s; "
          f"low-confidence words: {low}", file=sys.stderr)
    print(f"Wrote: {out / 'transcript.txt'}, {out / (src.stem + '.srt')}, {out / 'words.json'}, {out / 'words.txt'}",
          file=sys.stderr)


if __name__ == "__main__":
    main()
