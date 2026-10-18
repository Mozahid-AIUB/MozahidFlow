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
- `D:\Video\projects\<YYYY-MM-DD_slug>\{raw,reference,assets,work,out}` + `brief.md`: one folder per video,
  copied from `projects\_TEMPLATE` (by `NEW-PROJECT.bat` or `new_project.py`).
- `D:\Video\references\`: the user's global style library (thumbnails, intros-outros, ads-promos,
  motion-graphics, editing-style, captions, plus `links.md`).
- `D:\Video\PROMPTS.md` and `HOW-TO-USE.md`: the user's Bengali prompt library and guide. Keep them in sync when
  the workflow changes.

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
  media-use): HTML/GSAP motion graphics and full ad/promo builds. CLI pinned at 0.8.169 in `D:\Video\hyperframes`.
  See "HyperFrames rules" below.
- **remotion-*** (official): Remotion knowledge; used with `D:\Video\studio`.
- **motion-broll**: speech-timed motion-graphic B-roll for talking-head videos.
- **sound-effects**: measured SFX pass with a bundled CC0 kit, music beat-sync, -16 LUFS mix checks.

## Remotion templates (`D:\Video\studio`, all 1920×1080, Bengali-ready)
Brand settings: `studio/src/brand.ts`, already filled for Mozahidul Islam (see "Brand" below).
- Brand: `LogoSting` (3 s, landscape) and `LogoStingVertical` (9:16). Props `line: tagline|taglineBn|website`,
  `showName`.
- `components/LogoMark.tsx` is the logo as live SVG with a build-on `progress`: use it in any new composition
  instead of a PNG.
- Fonts load through `loadBrandFonts()`, called in Root.tsx. A bare `import "./fonts"` is tree-shaken away,
  because package.json's `sideEffects` lists only CSS. After any font change, render `FontCheck` (Diagnostics)
  and confirm no line is in serif.
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

## Brand: Mozahidul Islam (apply to every video unless the brief says otherwise)
- Kit is in `assets\brand\` (details in `brand.md`):
  - `logo.svg/.png`: light backgrounds
  - `logo-on-dark`: the default on our navy canvas
  - `logo-white`: watermark
  - `logo-badge`: profile pictures and icons
  - `brand.json`: pass `--brand D:\Video\assets\brand\brand.json` to ffmpeg-skill caption, overlay and graphics
- Identity:
  - Name: "Mozahidul Islam"
  - Website: mozahidulislam.pro.bd
  - Tagline: "Software Engineer · Web, Mobile & AI"; Bengali "সফটওয়্যার ইঞ্জিনিয়ার · ওয়েব, মোবাইল ও AI"
    (`tagline` / `taglineBn` in brand.ts). The user chose it: don't add "Researcher" or change it unasked.
  - Work covered: websites, web apps, Android and iOS apps, AI, SaaS and dev tools.
  - YouTube: `@Mozahid_AIUB` (https://www.youtube.com/@Mozahid_AIUB). This is `brand.handle`.
  - Facebook page: https://www.facebook.com/profile.php?id=61592240008689 (no vanity name, so show the link,
    not a made-up page name).
  - Every `metadata.md` description ends with the YouTube, Facebook and website links.
  - LogoSting `line: "handle"` shows "YouTube @Mozahid_AIUB".
- Palette:
  - navy `#0A0F1C` (canvas), surface `#101726`
  - text `#E9EEF6`, muted `#8A97AB`
  - amber `#F5B841` (highlights, CTAs)
  - emerald `#2BB683` / `#147A5C` (logo on dark, glows)
  - logo on light: `#16805B` / `#0C4D46`
- Type: Inter for Latin; Hind Siliguri for Bengali body and captions; Anek Bangla for Bengali display. Never let
  a system fallback font through.
- Defaults in every video:
  1. LogoSting after the opening hook. Reels and ads under 30 s get it only at the end, `line: "website"`.
  2. Watermark, from the end of the intro to the start of the outro:
     `overlay.py IN --brand D:\Video\assets\brand\brand.json --logo --start S --end E --fade 0.5`
     (white logo, top-right, about 84 px, 65 %).
  3. Outro with the logo, name and website.
  4. Thumbnail badge with the logo and name.
- Premium look:
  - Dark navy canvas and generous spacing.
  - At most two accent colours per frame (amber and emerald).
  - Ease-out entrances of 0.4–0.8 s. No bouncy easing, except the logo dot.
  - At most about 7 words per graphic; respect title-safe margins.
  - No clip-art, stock-template looks or SFX overload.
- HyperFrames projects: copy the logo SVG and fonts into the project's `assets/`, and use the same palette and
  type.

## Scratch files (`D:\Video\_temp\`)
- `D:\Video\_temp\<task>\` is Claude's scratch area: tests, previews, quick renders, inspected downloads.
  Create a subfolder per task and **delete it when the task ends**; keep `README.txt`.
- A project's intermediates belong in that project's `work\`, not here.
- If D: has under 3 GB free, put big scratch files in the session scratchpad on C: instead.
- `_temp` is gitignored. Never leave anything there that the user needs.

## HyperFrames rules (local-only; these override what its skills suggest)
- Create HyperFrames projects in `D:\Video\hyperframes\<slug>` and always run the CLI through the wrapper:
  `D:\Video\hyperframes\hf.cmd …` (PowerShell) or `/d/Video/hyperframes/hf …` (Git Bash). Never use bare `npx
  hyperframes` from `D:\Video`, and never use the `npm run …` scripts that `init` writes: both download other
  versions.
- The wrappers set: no telemetry, no update checks, no auto-installs, and `HYPERFRAMES_SKIP_SKILLS=1`. So skip
  the skills' instructions to run `hyperframes skills update` or to install skills globally.
- Scaffold and check:
  - `hf.cmd init <slug> --non-interactive --resolution portrait|landscape`
  - `hf.cmd lint`, then `hf.cmd check`
- Preview: `hf.cmd preview --background --no-open` (and `--stop` afterwards).
- Render:
  - `hf.cmd render --quality draft --workers 1 -o renders\draft.mp4`, then `--quality delivery`
  - Always `--workers 1`: more workers hang on Windows, and the CPU has 2 cores.
  - A chrome console window may appear during renders. Closing it aborts the render.
- Alpha overlays: `render --format mov` (ProRes 4444) or `--format webm`. The root, html and body need
  `background: transparent`.
- Fonts: copy the TTF into the project's `assets/fonts/` and declare an `@font-face`. Media uses relative
  `assets/…` paths; every `<audio>` needs an `id`; videos need `muted playsinline`.
- Never run these:
  - `publish`, `cloud render`, `lambda`, `cloudrun` (they upload the project)
  - `npx hyperframes usage` (it reads the Claude login token)
  - `hyperframes open` / the desktop app
- media-use: use `--local-only`. Never use its music *generator*: it silently pip-installs torch and
  transformers (several GB). Take music from `assets\music` and SFX from the sound-effects skill. HeyGen
  cloud, TTS and stock search need the user's own account; ask first.
- Copy final renders into the video's `projects\<slug>\out\`.

## Using references (do this every time a reference is given)
Sources, in order:
- the project's `reference\` folder
- links in `brief.md` or the prompt
- the global `references\` library (subfolders plus `links.md`) whose category matches the job (ads, intros,
  thumbnails, …)

1. **Local clips** (`.mp4/.mov/.webm` in `reference\` or `references\`):
   - `look.py <clip> --tiles 4x3`, then view the sheet.
   - `scenes.py <clip>`: cuts per minute = pace.
   - `probe.py`: aspect and fps.
   - Optional librosa tempo on the audio for music BPM.
   - For a close look at a moment, extract frames at 0.5–1 s steps over that span.
2. **Images and screenshots**: view them directly.
3. **YouTube / Facebook / Instagram links**:
   - **If the `mcp__claude-in-chrome__*` tools exist** (load the `anthropic-skills:chrome-browser` skill
     first):
     - Run `tabs_context_mcp`, then open a **new** tab and navigate to the link.
     - Wait for or skip any ad, pause the video, and move the pointer off the player so the controls hide.
     - Take screenshots at roughly 10 points across the video. On YouTube: press `k` to pause, then number keys
       `0`–`9` jump to 0–90 %. Or reload with `&t=<seconds>s`.
     - For a fast sequence (an intro or a transition), take 4–6 shots about 0.5 s apart; use `,` / `.` to step
       frames while paused.
     - Also grab the thumbnail via oEmbed (below).
     - Close the tabs you opened, and never touch the user's own tabs. If your tab group disappears, the user
       closed it: don't silently reopen it mid-task; say so and continue only when the task needs it.
     - The user's Chrome is signed in to their YouTube channel. Owner controls (Customise channel, Manage
       videos, Studio) are visible: never click them.
     - Never log in, like, comment, subscribe or change anything on the user's accounts.
     - If a site asks for permission or a login, or shows a captcha, stop and ask the user.
   - **If the Chrome tools are not connected**:
     - YouTube: `curl "https://www.youtube.com/oembed?url=<link>&format=json"` gives the title and channel.
       Download `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` (fallback `hqdefault.jpg`) to `work\reference\`
       and view it.
     - Tell the user that the inside of the video can't be seen without Chrome. Ask them to type `@browser` in
       the prompt box (connects this session) or to send a 10–30 s clip or screenshots.
   - Don't download other people's videos (yt-dlp etc.): the platforms' terms forbid it. Use it only for the
     user's own videos, and only if they ask.
4. **Website or product links**: read them with WebFetch (text, features, colours) or the Chrome tools (layout
   and screenshots of the UI).
5. **Write the analysis** into `brief.md` under "রেফারেন্স বিশ্লেষণ": one block per reference covering
   - pace (cuts per minute and shot length)
   - typography (weight, size, case, placement, how text enters and exits)
   - colour palette (approximate hex) and grade (warm/cool, contrast)
   - motion (zooms, camera moves, transitions)
   - captions style
   - graphics (lower thirds, callouts, overlays)
   - thumbnail composition
   - music feel (only from a local file you can analyse; say so when you can't hear it)

   End with **"what we will borrow"** and **"what we will not"**. The edit plan must cite these choices.
6. **Style only.** Never copy a reference's footage, music, logos, characters or exact text into the output, and
   never trace a thumbnail one-to-one. Rebuild the *style* with our own templates, fonts, music and SFX.
7. Save the reference frames you capture to `work\reference\` (screenshots, contact sheets) so later revisions
   can reuse them without re-opening the links.

## Standard workflow (raw video + prompt)
1. **Project and brief**:
   - The user usually creates the project with `NEW-PROJECT.bat` (a copy of `projects\_TEMPLATE`), drops files
     into `raw\`, `reference\` and `assets\`, and fills the Bengali form in `brief.md`.
   - If they only give a path and a prompt, run `python D:\Video\tools\scripts\new_project.py <slug> --src <files>`
     (`--move` if D: is tight) and paste the prompt into section ১ of `brief.md`. Never modify files in `raw\`.
   - Read `brief.md` first. Fill the gaps with sensible defaults; ask only about choices that change the output.
   - Brand: `assets\brand\` (`logo.png`, `brand.md`). If `studio\src\brand.ts` still has placeholders and brand
     files exist, apply them first.
   - **References are mandatory input.** Whenever the brief, the prompt, `reference\` or `references\` holds any
     reference, analyse it before writing the plan. Follow "Using references" below.
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
