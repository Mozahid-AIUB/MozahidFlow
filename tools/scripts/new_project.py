"""Create a project folder for one video (one topic = one project) from projects\\_TEMPLATE.

  D:\\Video\\projects\\YYYY-MM-DD_<slug>\\
    raw\\        original footage, never modified
    reference\\  style examples (clips, screenshots) the user wants it to look like
    assets\\     logos, product photos, screenshots, scripts for this video
    work\\       intermediates - safe to delete after delivery
    out\\        deliverables (final videos, thumbnail, captions, metadata)
    brief.md     the user's brief (Bengali form) + Claude's analysis and plan

usage:
  python new_project.py <slug> [--src FILE ...] [--move] [--open]
  --src   copy these files into raw\\ (add --move to move instead, e.g. when disk is tight)
  --open  open the new folder in Explorer
"""
import argparse
import datetime as dt
import os
import re
import shutil
from pathlib import Path

PROJECTS = Path(__file__).resolve().parents[2] / "projects"
TEMPLATE = PROJECTS / "_TEMPLATE"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug")
    ap.add_argument("--src", nargs="*", default=[])
    ap.add_argument("--move", action="store_true")
    ap.add_argument("--open", action="store_true")
    args = ap.parse_args()

    slug = re.sub(r"[^\w\-]+", "-", args.slug.strip(), flags=re.UNICODE).strip("-").lower() or "video"
    proj = PROJECTS / f"{dt.date.today():%Y-%m-%d}_{slug}"
    if proj.exists():
        print(f"already exists, left as is: {proj}")
    else:
        shutil.copytree(TEMPLATE, proj, ignore=shutil.ignore_patterns(".gitkeep"))
        brief = proj / "brief.md"
        brief.write_text(brief.read_text(encoding="utf-8").replace("{name}", proj.name), encoding="utf-8")
        print(f"created: {proj}")

    for f in map(Path, args.src):
        target = proj / "raw" / f.name
        if target.exists():
            print(f"exists, skipped: {target}")
            continue
        (shutil.move if args.move else shutil.copy2)(str(f), str(target))
        print(f"{'moved' if args.move else 'copied'}: {f} -> {target}")

    if args.open:
        os.startfile(proj)  # Windows Explorer
    print(proj)


if __name__ == "__main__":
    main()
