# -*- coding: utf-8 -*-
"""Конвертирует JS regex-литералы в строковые паттерны в сценариях песочницы
(построчно: команды `[/re/, out, cls]` и решения `{re:/re/, l:"..."}`)."""
import pathlib
import re

DIR = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\docs\21-playground")

FILES = ["scenarios-linux.js", "scenarios-k8s.js", "scenarios-iac-cicd.js",
         "scenarios-obs-sec.js", "scenarios-mesh-cloud.js"]


def to_str(src: str) -> str:
    return '"' + src.replace("\\", "\\\\").replace('"', '\\"') + '"'


def fix_line(line: str) -> str:
    # команды: [ /re/ , output , cls ],
    m = re.match(r"^(\s*\[)/(.*)/(\s*,.*)$", line)
    if m and not line.lstrip().startswith("[{"):
        return m.group(1) + to_str(m.group(2)) + m.group(3)
    # решения/проверки: {re:/re/flags, l:"..."},
    m = re.match(r"^(\s*\{re:)/(.*?)/([a-z]*)(,\s*l:.*)$", line)
    if m:
        return m.group(1) + to_str(m.group(2)) + m.group(4)
    return line


for name in FILES:
    p = DIR / name
    lines = p.read_text(encoding="utf-8").splitlines()
    out = [fix_line(l) for l in lines]
    p.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"{name}: processed")
