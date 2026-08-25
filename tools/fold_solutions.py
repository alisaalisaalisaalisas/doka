# -*- coding: utf-8 -*-
"""Оборачивает решения задач (15-hands-on-practice) в свёрнутые <details>.
Идемпотентно: уже завёрнутые блоки не трогает."""
import pathlib
import re

DIR = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\docs\15-hands-on-practice")
FILES = ["01-100-devops-practical-tasks-part1.md", "02-100-devops-practical-tasks-part2.md"]

HEAD = re.compile(r"^(#{2,3}\s|\*\*Условие)")


def transform(text: str) -> tuple[str, int]:
    lines = text.splitlines()
    out, count, inside = [], 0, False
    for line in lines:
        if re.match(r"^\*\*Решени[еия]", line.strip()):
            out.append("<details>")
            out.append("<summary>👁 <b>Показать решение</b></summary>")
            out.append("")
            count += 1
            inside = True
            continue
        if inside and (line.startswith("### ") or line.startswith("## ")):
            out.append("")
            out.append("</details>")
            inside = False
        out.append(line)
    if inside:
        out.append("")
        out.append("</details>")
    return "\n".join(out) + "\n", count


for name in FILES:
    p = DIR / name
    t = p.read_text(encoding="utf-8")
    if "<summary>👁" in t:
        print(name, ": уже свёрнуто — skip")
        continue
    new, n = transform(t)
    p.write_text(new, encoding="utf-8")
    print(f"{name}: свёрнуто решений — {n}")
