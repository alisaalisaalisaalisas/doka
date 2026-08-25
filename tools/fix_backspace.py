# -*- coding: utf-8 -*-
"""Чинит 0x08 (сломанный \\b) в enrich_tasks.py и MD-файлах; перегенерирует виджеты."""
import pathlib

ROOT = pathlib.Path(r"C:\Users\User\Desktop\papka\doka")

# 1) чиним исходник генератора: 0x08 -> корректный \b в исходнике
src = ROOT / "tools" / "enrich_tasks.py"
t = src.read_text(encoding="utf-8")
if "\x08" in t:
    t = t.replace("\x08", "\\" + "b")   # в исходнике должно быть "\\b" (2 символа)
    src.write_text(t, encoding="utf-8")
    print("enrich_tasks.py: \\b исправлен")

# 2) в MD-файлах атрибут должен содержать \b (backslash + b), не 0x08
BS = "\\" + "b"
for name in ["01-100-devops-practical-tasks-part1.md", "02-100-devops-practical-tasks-part2.md"]:
    p = ROOT / "docs" / "15-hands-on-practice" / name
    t = p.read_text(encoding="utf-8")
    if "\x08" in t:
        t = t.replace("\x08", BS)
        p.write_text(t, encoding="utf-8")
        print(name, ": 0x08 -> \\b")

# 3) проверка
for name in ["01-100-devops-practical-tasks-part1.md", "02-100-devops-practical-tasks-part2.md"]:
    p = ROOT / "docs" / "15-hands-on-practice" / name
    t = p.read_text(encoding="utf-8")
    print(name, ": 0x08 остался?", "\x08" in t, "| виджетов:", t.count("answer-check"))
