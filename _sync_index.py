# -*- coding: utf-8 -*-
"""Sync docs/index.md with new sections."""
import pathlib

p = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\docs\index.md")
t = p.read_text(encoding="utf-8")
t = t.replace("pages-42+", "pages-50+")

row14 = "| **14** | [Подготовка к собеседованиям DevOps / SRE](14-interview-prep/) | 2 |"
if row14 not in t:
    # find any row 14 line
    import re
    m = re.search(r"^\| \*\*14\*\* .*$", t, re.M)
    if not m:
        raise SystemExit("row 14 not found!")
    row14_line = m.group(0)
else:
    row14_line = [l for l in t.splitlines() if l.startswith("| **14**")][0]

BT = chr(96)
new_row = ("| **15** | [Практика: 100 боевых задач](15-hands-on-practice/) | 2 | "
           "Bash/Python/Go/Docker/K8s/Terraform/Ansible задачи с решениями | " + BT + "Practice" + BT + " |")

if "| **15**" not in t:
    t = t.replace(row14_line, row14_line + "\n" + new_row)
    print("row 15 added")

p.write_text(t, encoding="utf-8")
print("done")
