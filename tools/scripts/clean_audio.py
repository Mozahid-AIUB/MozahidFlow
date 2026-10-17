"""Studio-style voice cleanup for a video (or audio) file, video stream copied untouched.

Chain: DeepFilterNet3 noise removal -> 80 Hz high-pass -> gentle de-ess -> light compression.
Loudness is NOT normalised here; do that once at final export (ffmpeg-skill export.py --normalize
or loudness.py), after music and SFX are mixed.

usage:
  D:\\Video\\tools\\.venv\\Scripts\\python.exe clean_audio.py INPUT OUTPUT [--atten 30] [--no-denoise]
  --atten  max noise reduction in dB (100 = full; 25-35 keeps the voice natural; 0 = off)
"""
import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

DEEP_FILTER = Path(__file__).resolve().parents[1] / "bin" / "deep-filter.exe"
VOICE_CHAIN = (
    "highpass=f=80,"
    "deesser=i=0.4:m=0.5:f=0.5,"
    "acompressor=threshold=-20dB:ratio=3:attack=10:release=150:makeup=2,"
    "alimiter=limit=0.95"
)


def run(cmd):
    print("+", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--atten", type=float, default=30.0)
    ap.add_argument("--no-denoise", action="store_true")
    args = ap.parse_args()

    src, dst = Path(args.input), Path(args.output)
    if dst.exists():
        sys.exit(f"refusing to overwrite {dst}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    has_video = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                "stream=codec_type", "-of", "csv=p=0", str(src)],
                               capture_output=True, text=True).stdout.strip() == "video"

    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        wav = td / "voice.wav"
        # DeepFilterNet works at 48 kHz.
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "48000", wav])
        if not args.no_denoise and args.atten > 0:
            run([DEEP_FILTER, "--compensate-delay", "-a", str(args.atten), "-o", td / "df", wav])
            wav = td / "df" / "voice.wav"
        clean = td / "clean.wav"
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", wav, "-af", VOICE_CHAIN, "-ac", "2", clean])

        if has_video:
            run(["ffmpeg", "-nostdin", "-v", "error", "-i", src, "-i", clean, "-map", "0:v:0", "-map", "1:a:0",
                 "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", dst])
        elif dst.suffix.lower() == ".wav":
            shutil.copy(clean, dst)
        else:
            run(["ffmpeg", "-nostdin", "-v", "error", "-i", clean, "-c:a", "aac", "-b:a", "256k", dst])
    print(f"Done: {dst}")


if __name__ == "__main__":
    main()
