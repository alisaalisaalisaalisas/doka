# -*- coding: utf-8 -*-
"""Патчит движок playground.html: строковые паттерны -> RegExp через RE()."""
import pathlib

p = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\docs\21-playground\playground.html")
t = p.read_text(encoding="utf-8")

repl = [
    ("const rule = current.commands.find(r => r.re.test(cmd));",
     "const rule = current.commands.find(r => RE(r.re).test(cmd));"),
    ("const ok = executed.some(c=>s.re.test(c));",
     "const ok = executed.some(c=>RE(s.re).test(c));"),
    ("const all = sol.every(s=>executed.some(c=>s.re.test(c)));",
     "const all = sol.every(s=>executed.some(c=>RE(s.re).test(c)));"),
    ("const ok = c.re.test(val);",
     "const ok = RE(c.re).test(val);"),
]
for old, new in repl:
    assert old in t, "NOT FOUND: " + old[:50]
    t = t.replace(old, new)

p.write_text(t, encoding="utf-8")
print("engine patched: 4/4")
