#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate homepage stats for docs/index.md."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

def count_md_pages():
    return len(list(DOCS.rglob("*.md")))

def count_scenarios():
    # Count scenario definitions: S("cat","id",... at line start
    total = 0
    for p in (DOCS / "21-playground").glob("scenarios-*.js"):
        txt = p.read_text(encoding="utf-8", errors="ignore")
        # strict: line starts with S( or S2( with optional whitespace
        total += len(re.findall(r'^\s*S\s*\(\s*["\']', txt, flags=re.M))
        total += len(re.findall(r'^\s*S2\s*\(', txt, flags=re.M))
    # fallback if strict gives 0, use loose but filter to S(" pattern
    if total == 0:
        for p in (DOCS / "21-playground").glob("scenarios-*.js"):
            txt = p.read_text(encoding="utf-8", errors="ignore")
            total += len(re.findall(r'\bS\s*\(\s*["\']', txt))
    return total

def count_trainer_cards():
    # Parse from trainer index or via build_trainer scan
    try:
        from collections import Counter
        import pathlib as pl
        # quick scan using same logic as build_trainer
        Q_RE = re.compile(r"\*\*(?:В)?\d+\.\s*(.+?)\*\*\s*\n+<details><summary>Ответ</summary>\s*\n(.*?)</details>", re.S)
        cnt = 0
        for src in DOCS.iterdir():
            if not src.is_dir() or src.name in {"22-trainer"}:
                continue
            for path in sorted(src.glob("*.md")):
                if path.stem == "00-plan":
                    continue
                txt = path.read_text(encoding="utf-8")
                cnt += len(Q_RE.findall(txt))
        return cnt
    except Exception:
        return 0

def count_labs():
    return len(list((DOCS / "16-guided-labs").glob("*.md")))

def count_incidents():
    # 17-break-fix files + chaos drills
    return len(list((DOCS / "17-break-fix").glob("*.md")))

def main():
    pages = count_md_pages()
    scenarios = count_scenarios()
    cards = count_trainer_cards()
    labs = count_labs()
    incidents = count_incidents()

    stats_line = f"**{pages} страниц** • **{labs} лаб** • **{incidents} блока инцидентов** • **{scenarios} сценариев песочницы** • **{cards} карточек тренажёра**"

    index_path = DOCS / "index.md"
    text = index_path.read_text(encoding="utf-8")

    marker = "<!-- stats -->"
    new_stats = f"<!-- stats -->\n> 📊 {stats_line}\n<!-- /stats -->"

    if marker in text:
        # replace between markers if exists
        text = re.sub(r"<!-- stats -->.*?<!-- /stats -->", new_stats, text, flags=re.S)
    else:
        # insert after first heading
        text = text.replace("# 🚀 DevOps Knowledge Base & Handbook (Docs-as-Code)", "# 🚀 DevOps Knowledge Base & Handbook (Docs-as-Code)\n\n" + new_stats, 1)

    # Also update hardcoded numbers in index if present (e.g., "9 Labs", "100 вопросов")
    # Leave manual text; stats is authoritative.

    index_path.write_text(text, encoding="utf-8")
    print(f"Pages: {pages}, Labs: {labs}, Incidents blocks: {incidents}, Scenarios: {scenarios}, Cards: {cards}")
    print("Homepage stats updated")

if __name__ == "__main__":
    main()
