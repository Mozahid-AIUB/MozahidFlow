# Video studio: raw footage + prompt → professional YouTube / Facebook / Reels videos

The user (a Bangladeshi creator) drops raw video and writes a prompt; Claude does the whole edit with the
local tools below. **Reply to the user in Bengali script (বাংলা হরফ)** even when they type Banglish.
Commands, code and paths stay in English.

Typical jobs:
- Bengali topic videos and tutorials (screen recording or talking head).
- SaaS / tech product promos (HyperFrames `product-launch-video`, plus screen recordings with zooms and
  callouts).
- Faceless animated explainers (`faceless-explainer`).
- Short motion graphics (`motion-graphics`).
- Premium 9:16 product ads for Facebook and Instagram Reels.

A fresh machine is set up with `setup.ps1` (see README.md).

## Machine limits (plan around them)
- Intel i5-5200U (2 cores / 4 threads), Intel HD 5500, no NVIDIA GPU, 12 GB RAM, slow disk.
- Never run two heavy jobs at once (renders, encodes, transcription). Run long jobs with `run_in_background`
  and tell the user roughly how long they will take.
- Disk: D: is small (check `Get-PSDrive D` before big renders). Models and caches live on C:.
- Remotion/HyperFrames render roughly a few frames per second at 1080p: use them for **short graphics**
  (titles, overlays, cards, ad scenes), and let FFmpeg do long-form cutting/compositing/encoding.
- Transcription is slow on this CPU: the 16 s test clip took ~100 s with `large-v3-turbo` (model load
  included). `large-v3` is several times slower than turbo. Default to turbo for drafts and analysis;
  use `large-v3` for final Bengali captions, in the background.

## Paths
- PowerShell sessions must refresh PATH first:
  `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`
- FFmpeg 9 full build + ffprobe: on user PATH.
- Python: `D:\Video\tools\.venv\Scripts\python.exe` (3.12; faster-whisper, auto-editor, librosa, pillow, pysubs2,
  color-grading CLI). Use it for **every** skill script that says `python3` (ffmpeg-skill, sound-effects, …).
  `av` is pinned to 16.0.1: 16.1+ breaks faster-whisper (`metadata_errors`). Don't upgrade it.
- Whisper models (HF cache, C:): `large-v3-turbo`, `large-v3`.
- `D:\Video\tools\bin\deep-filter.exe`: DeepFilterNet3 voice denoiser.
- `D:\Video\tools\scripts\`: `new_project.py`, `transcribe.py`, `clean_audio.py` (run with `--help`).
- `D:\Video\tools\bn_fillers.txt`: Bengali/English filler list for `silence.py --filler --filler-words`.
- `D:\Video\tools\motion\node_modules`: Playwright for the motion-broll skill (`NODE_PATH` there).
- `D:\Video\studio\`: Remotion project with branded Bengali templates (see below).
- `D:\Video\hyperframes\`: HyperFrames workspace (see the hyperframes skills).
- `D:\Video\assets\fonts\{bangla,english}`: OFL fonts. `assets\music\` (with `LICENSES.md`), `assets\brand\`.
- `D:\Video\projects\<YYYY-MM-DD_slug>\{raw,work,out,assets}` + `brief.md`: one folder per video.

## Skills installed (.claude/skills)
- **ffmpeg-skill**: the editing workhorse: probe, look (contact sheets), cut, silence/filler removal, fit/reframe,
  captions, overlays, B-roll insert, audio ducking, loudness, platform export, check, report, render.py project
  files. Follow its workflow (probe → plan → execute → check → look).
- **color-grading**: executes a JSON grade through ffmpeg-skill's color.py. It has no named looks, so Claude
  picks the numbers. Always pass `--ffmpeg-skill D:\Video\.claude\skills\ffmpeg-skill` and run it with
  `D:\Video\tools\.venv\Scripts\color-grading.exe`. Temperature is inverted vs Lightroom (higher K = cooler;
  6500 = no change). Starting recipes: `D:\Video\tools\grading\{luxury_warm,clean_neutral}.template.json`
  (fill the paths; `luts\warm_luxury_split_33.cube` is self-made, no licence issue). Tune the numbers by looking
  at before/after frames. Watch for crushed blacks, clipped highlights and steel/white turning cream. Correct a
  colour cast, but leave already-clean screen recordings ungraded. Delete `<workspace>\.color-grading\` after.
- **hyperframes** (+ `hyperframes-*`, motion-graphics, product-launch-video, general-video, faceless-explainer,
  media-use): HTML/GSAP motion graphics and full ad/promo builds. Local rendering only: don't use HeyGen
  cloud, TTS or other paid/API features unless the user asks and provides the account.
- **remotion-*** (official): Remotion knowledge; used with `D:\Video\studio`.
- **motion-broll**: speech-timed motion-graphic B-roll for talking-head videos.
- **sound-effects**: measured SFX pass with a bundled CC0 kit, music beat-sync, -16 LUFS mix checks.

## Remotion templates (`D:\Video\studio`, all 1920×1080, Bengali-ready)
Brand settings: `studio/src/brand.ts` (channel name, handle, logo, colours, fonts). Ask the user once for their
channel name, handle, logo and colours, then fill it in.
- Full-screen: `Intro`, `ChapterCard`, `Outro` (has YouTube end-screen guide boxes).
- Alpha overlays (ProRes 4444 `.mov`): `LowerThird`, `Callout` (spotlight a screen region: x/y/w/h),
  `KeyPoints`, `SubscribeReminder` (`platform: youtube|facebook`), `ChapterPanel`.
- Still: `Thumbnail` (1280×720).
- Every composition takes `durationSec` and `fps` props, so match the footage fps.
- Render from `D:\Video\studio`:
  - `npx remotion render <Id> <out.mov> --props=<file.json> --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444` (alpha)
  - `npx remotion render <Id> <out.mp4> --props=<file.json> --codec=h264 --crf=16` (opaque)
  - `npx remotion still Thumbnail <out.png> --props=<file.json>`
- Assets a render needs (logo, product photo) go in `studio/public/` (and `staticFile()`).
  Never put whole footage files there: the public folder is copied on every render.
- Vertical (9:16) ad graphics are bespoke per project: build them in HyperFrames (preferred for ads) or a new
  Remotion composition.

## Standard workflow (raw video + prompt)
1. **Project**: `python D:\Video\tools\scripts\new_project.py <slug> --src <files>` (`--move` if D: is tight).
   Paste the user's prompt into `brief.md`. Never modify files in `raw\`.
2. **Ingest check**: run ffmpeg-skill `probe.py`. Browser and phone screen recordings are often VFR or have
   `duration=N/A`. Normalise those once to a CFR mezzanine in `work\` (x264 CRF 18, matching or 30 fps,
   AAC 48 kHz) before any cutting, so audio stays in sync.
3. **Analyse first, and get approval**:
   - Run `look.py` (contact sheet) and look at it, plus `scenes.py` and `loudness.py` (measure).
   - Run `silence.py --list` and `transcribe.py` with turbo. Read the transcript.
   - Write findings and an edit plan into `brief.md`: structure, cuts, pacing, graphics per timestamp, music
     mood, colour, captions and deliverables.
   - Show the user the plan in Bengali and wait for their OK before long renders.
4. **Audio**: run `clean_audio.py` on voice footage (`--atten 25–35` keeps the voice natural). Skip it for
   music-only or product footage.
5. **Cut**: remove retakes and mistakes from the transcript (`cut.py --segments`), then
   `silence.py --speech-aware` and optionally `--filler --words work\words.json --filler-words D:\Video\tools\bn_fillers.txt`.
6. **Colour**: use the color-grading skill (see above).
7. **Graphics**: Remotion templates or HyperFrames compositions, rendered as short clips or alpha overlays.
   Composite with ffmpeg-skill (`overlay.py`, `insert.py`, `broll.py` or `render.py` with a project.json).
   Never invent numbers, quotes or claims in graphics: use only what the user said or provided.
8. **Music & SFX**:
   - Pick from `assets\music\` (6 mood folders; read `README.md` and `LICENSES.md`) and record the track and
     licence in `brief.md`.
   - Mixkit tracks are OK for YouTube, FB and IG posts, Reels and **online** ads. They are not OK for TV,
     radio or cinema. The folder must never be shared. Track loudness varies (-7 to -25 LUFS), so always set
     the level.
   - Duck the music under the voice (ffmpeg-skill audio.py).
   - Add SFX via the sound-effects skill. Never register these tracks with Content ID.
9. **Captions**:
   - Make the final transcript with `large-v3` when time allows.
   - Proofread it yourself (names, English terms, Bengali spelling); never paraphrase what was said.
   - Burn styled captions for Facebook and Reels with `caption.py` and a Bengali font (Hind Siliguri, from
     `assets\fonts\bangla`). Also deliver the `.srt` for YouTube upload.
10. **Export**:
    - YouTube: `export.py --preset youtube --normalize`.
    - Facebook: `--preset facebook`.
    - Reels/Shorts: `render.py --template reels|shorts`.
    - Run `check.py --platform …` on every deliverable.
11. **Package** into `out\`:
    - the videos and `.srt`
    - the thumbnail (Remotion `Thumbnail` still, JPG under 2 MB)
    - `metadata.md`: 3 title options, a description with chapters (timestamps from the final cut), tags and
      hashtags, in Bengali
12. **Report**:
    - Probe numbers per file (duration, resolution, fps, LUFS).
    - A `look.py` contact sheet of the final.
    - 3–5 timestamps for the user to check by eye and ear.
    - What is illustrative or uncertain.
13. **Clean up** `work\` only after the user approves the final, and ask first.

## House rules
- Ask before deleting anything outside a project's `work\`, and never touch folders outside `D:\Video`.
- Use music and SFX only with a recorded licence that allows YouTube/Facebook monetisation and ads.
- Prefer one high-quality re-encode chain: intermediates at CRF 18 (or ProRes for alpha), final export last.
