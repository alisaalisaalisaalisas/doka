# -*- coding: utf-8 -*-
"""Движок песочницы: поддержка команд-массивов [pattern, out, cls] со СТРОКОВЫМ pattern."""
import pathlib

p = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\docs\21-playground\playground.html")
t = p.read_text(encoding="utf-8")

old1 = "const rule = current.commands.find(r => RE(r.re).test(cmd));"
new1 = ("const rule = current.commands\n"
        "      .map(r => Array.isArray(r) ? {re: r[0], out: r[1], cls: r[2]} : r)\n"
        "      .find(r => RE(r.re).test(cmd));")

old2 = "const cand=current.commands.map(r=>r.re.source).find("
new2 = "const cand=current.commands.map(r=>{const p=Array.isArray(r)?r[0]:r.re; return (typeof p===\"string\")?new RegExp(p,\"i\").source:p.source;}).find("

assert old1 in t and old2 in t
t = t.replace(old1, new1).replace(old2, new2)
p.write_text(t, encoding="utf-8")
print("engine: array+string commands supported")
