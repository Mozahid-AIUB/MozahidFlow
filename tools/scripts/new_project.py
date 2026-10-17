"""Create a project folder for one video (one topic = one project).

  D:\\Video\\projects\\YYYY-MM-DD_<slug>\\
    raw\\     original footage, never modified
    work\\    intermediates (transcripts, cleaned audio, cuts, overlays) - safe to delete after delivery
    out\\     deliverables (final videos, thumbnail, captions, metadata)
    assets\\  logos, product photos, screenshots, music picked for this video
    brief.md the user's prompt + decisions, kept up to date

usage:
  python new_project.py <slug> [--src FILE ...] [--move]
  --src   copy these files into raw\\ (add --move to move instead, e.g. when disk is tight)
"""
import argparse
import datetime as dt
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "projects"

BRIEF = """# {name}

## Prompt (user's words)


## Platform & format
- Destination: YouTube / Facebook / Instagram Reels / Shorts
- Aspect: 16:9 / 9:16 / 1:1
- Language: বাংলা

## Analysis notes


## Edit plan (approved)


## Deliverables
- [ ] final video(s)
- [ ] captions (.srt)
- [ ] thumbnail
- [ ] title / description / tags / chapters (metadata.md)
"""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug")
    ap.add_argument("--src", nargs="*", default=[])
    ap.add_argument("--move", action="store_true")
    args = ap.parse_args()

    slug = re.sub(r"[^\w\-]+", "-", args.slug.strip(), flags=re.UNICODE).strip("-").lower() or "video"
    proj = ROOT / f"{dt.date.today():%Y-%m-%d}_{slug}"
    for sub in ("raw", "work", "out", "assets"):
        (proj / sub).mkdir(parents=True, exist_ok=True)
    brief = proj / "brief.md"
    if not brief.exists():
        brief.write_text(BRIEF.format(name=proj.name), encoding="utf-8")

    for f in map(Path, args.src):
        target = proj / "raw" / f.name
        if target.exists():
            print(f"exists, skipped: {target}")
            continue
        (shutil.move if args.move else shutil.copy2)(str(f), str(target))
        print(f"{'moved' if args.move else 'copied'}: {f} -> {target}")
    print(proj)


if __name__ == "__main__":
    main()
