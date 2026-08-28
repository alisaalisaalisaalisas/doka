#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CI-скрипт проверки дрейфа цифр между реальностью и docs/index.md
Проверяет: число страниц, число карточек тренажёра, число сценариев песочницы,
число лаб, число блоков инцидентов.

Запуск: py tools/check_nav_drift.py  (выход 0 — ок, 1 — дрейф)
"""

import pathlib
import re
import sys
# Ensure UTF-8 output on Windows cp1251 console
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
INDEX = DOCS / "index.md"

def count_pages():
    return len(list(DOCS.rglob("*.md")))

def count_cards():
    Q_RE = re.compile(r"\*\*(?:В)?\d+\.\s*(.+?)\*\*\s*\n+<details><summary>Ответ</summary>\s*\n(.*?)</details>", re.S)
    cnt = 0
    for src in DOCS.iterdir():
        if not src.is_dir() or src.name == "22-trainer":
            continue
        for p in sorted(src.glob("*.md")):
            if p.stem == "00-plan":
                continue
            txt = p.read_text(encoding="utf-8")
            cnt += len(Q_RE.findall(txt))
    return cnt

def count_scenarios():
    total = 0
    for p in (DOCS / "21-playground").glob("scenarios-*.js"):
        txt = p.read_text(encoding="utf-8", errors="ignore")
        total += len(re.findall(r'\bS\s*\(\s*["\']', txt))
        total += len(re.findall(r'\bS2\s*\(', txt))
    return total

def count_labs():
    return len(list((DOCS / "16-guided-labs").glob("*.md")))

def count_incidents():
    return len(list((DOCS / "17-break-fix").glob("*.md")))

def parse_index_stats():
    txt = INDEX.read_text(encoding="utf-8")
    # look for <!-- stats --> block
    m = re.search(r"<!-- stats -->(.*?)<!-- /stats -->", txt, re.S)
    if not m:
        return {}
    block = m.group(1)
    # extract numbers: **299 страниц** etc
    nums = {}
    for pat, key in [
        (r"\*\*(\d+)\s+страниц", "pages"),
        (r"\*\*(\d+)\s+лаб", "labs"),
        (r"\*\*(\d+)\s+блок", "incidents"),
        (r"\*\*(\d+)\s+сценари", "scenarios"),
        (r"\*\*(\d+)\s+карточ", "cards"),
    ]:
        mm = re.search(pat, block)
        if mm:
            nums[key] = int(mm.group(1))
    return nums

def main():
    real = {
        "pages": count_pages(),
        "labs": count_labs(),
        "incidents": count_incidents(),
        "scenarios": count_scenarios(),
        "cards": count_cards(),
    }
    indexed = parse_index_stats()
    print(f"Real counts: {real}")
    print(f"Index counts: {indexed}")
    drift = False
    for k in real:
        if k not in indexed:
            print(f"⚠️  {k}: отсутствует в index.md")
            drift = True
        elif real[k] != indexed[k]:
            print(f"❌ {k}: real={real[k]} vs index={indexed[k]} — ДРЕЙФ!")
            drift = True
        else:
            print(f"✅ {k}: {real[k]}")
    # check badges in index.md and playground etc.
    # also check playground badge count vs real scenarios
    playground_idx = DOCS / "21-playground" / "index.md"
    if playground_idx.exists():
        pt = playground_idx.read_text(encoding="utf-8")
        mm = re.search(r"\*\*(\d+)\s+сценари", pt)
        if mm and int(mm.group(1)) != real["scenarios"]:
            print(f"❌ playground/index.md сценариев: {mm.group(1)} vs real {real['scenarios']}")
            drift = True
    trainer_idx = DOCS / "22-trainer" / "index.md"
    if trainer_idx.exists():
        tt = trainer_idx.read_text(encoding="utf-8")
        mm = re.search(r"# 🎯 Тренажёр вопросов:\s*(\d+)", tt)
        if mm and int(mm.group(1)) != real["cards"]:
            print(f"❌ trainer/index.md карточек: {mm.group(1)} vs real {real['cards']}")
            drift = True

    if drift:
        print("\n💡 Исправьте: py tools/build_home.py && py tools/build_trainer.py")
        sys.exit(1)
    else:
        print("\n✅ Дрейфа нет — всё синхронно.")
        sys.exit(0)

if __name__ == "__main__":
    main()
