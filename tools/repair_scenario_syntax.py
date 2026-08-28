#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P0-восстановление Playground: чинит JS-синтаксис файлов сценариев.

Причина поломки: брифы сценариев записаны как JS template literals (`...`),
внутри которых стоят НЕэкранированные обратные кавычки markdown-разметки
(`main.py`, `systemctl` и т.п.). Первый же внутренний бэктик закрывает
литерал -> SyntaxError -> весь файл сценариев не загружается в браузере
(терялись ~1000 сценариев, оставались десятки).

Стратегия:
  - бриф начинается с первого бэктика после 4-го строкового аргумента S(...)
  - внутри брифа все бэктики экранируются как \`
  - бриф заканчивается последовательностью `,$  в КОНЦЕ строки
    (генератор всегда писал `,\n"prompt")
Идемпотентно: уже экранированные \` не трогаем (обрабатываем сырой текст
по-символьно, поэтому повторный запуск безопасен).
"""
import re
import sys
import os

DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "docs", "21-playground")

S_RE = re.compile(r'^S\(\s*"[^"]*"\s*,\s*"[^"]*"\s*,\s*"(?:[^"\\]|\\.)*"\s*,\s*"[^"]*"\s*,')
TERM_RE = re.compile(r'`,$')


def esc_body(body):
    """Идемпотентно экранирует внутренние бэктики в теле брифа:
    1) сворачивает уже экранированные (в т.ч. двойные) в одинарные \\`
    2) экранирует оставшиеся «голые» бэктики
    3) экранирует ${ -> \\${ (интерполяция template literal)
    4) удваивает одиночные бэкслеши перед цифрами (октальные escape запрещены)
    """
    body = re.sub(r'\\+`', lambda m: "\\`", body)
    body = re.sub(r'(?<!\\)`', lambda m: "\\`", body)
    body = DOLLAR_BRACE.sub(lambda m: "\\${", body)
    body = re.sub(r'(?<!\\)\\(?=[0-7])', lambda m: "\\\\", body)
    return body


def fix_source(src, fname):
    lines = src.split("\n")
    out = []
    in_brief = False
    changed = 0
    for line in lines:
        if not in_brief:
            m = S_RE.match(line)
            if m:
                i = line.find("`", m.end())
                if i != -1:
                    # открыли бриф на этой же строке: остальная часть строки — тело брифа
                    if TERM_RE.search(line[i + 1:]):
                        # весь бриф на одной строке
                        j = line.rfind("`,")
                        before = line[i + 1:j]
                        out.append(line[:i] + "`" + esc_body(before) + line[j:])
                        changed += 1
                        continue
                    out.append(line[:i] + "`" + esc_body(line[i + 1:]))
                    changed += 1
                    in_brief = True
                    continue
            out.append(line)
        else:
            if TERM_RE.search(line):
                j = line.rfind("`,")
                out.append(esc_body(line[:j]) + line[j:])
                changed += 1
                in_brief = False
            else:
                out.append(esc_body(line))
                changed += 1
    return "\n".join(out), changed, in_brief


DOLLAR_BRACE = re.compile(r'(?<!\\)\$\{')


def escape_dollar_brace(src):
    """Экранирует ${ внутри брифов (template literals), не трогая уже экранированные."""
    lines = src.split("\n")
    out = []
    in_brief = False
    n = 0
    for line in lines:
        if not in_brief and S_RE.match(line) and "`" in line:
            i = line.find("`", S_RE.match(line).end())
            out.append(line[:i] + "`" + DOLLAR_BRACE.sub(r'\\${', line[i + 1:]))
            in_brief = not TERM_RE.search(line[i + 1:])
            n += len(DOLLAR_BRACE.findall(line[i + 1:]))
        elif in_brief:
            if TERM_RE.search(line):
                j = line.rfind("`,")
                out.append(DOLLAR_BRACE.sub(r'\\${', line[:j]) + line[j:])
                n += len(DOLLAR_BRACE.findall(line[:j]))
                in_brief = False
            else:
                out.append(DOLLAR_BRACE.sub(r'\\${', line))
                n += len(DOLLAR_BRACE.findall(line))
        else:
            out.append(line)
    return "\n".join(out), n



def main():
    total_changed = 0
    files = sorted(f for f in os.listdir(DIR) if f.startswith("scenarios-") and f.endswith(".js"))
    unclosed = []
    for f in files:
        path = os.path.join(DIR, f)
        with open(path, encoding="utf-8") as fh:
            src = fh.read()
        fixed, changed, still_open = fix_source(src, f)
        fixed, ndollar = escape_dollar_brace(fixed)
        if still_open:
            unclosed.append(f)
        if changed or ndollar:
            with open(path, "w", encoding="utf-8", newline="") as fh:
                fh.write(fixed)
        total_changed += changed
        print(f"{f}: escaped_backticks={changed} escaped_dollar_brace={ndollar}"
              + ("  !! UNCLOSED BRIEF" if still_open else ""))
    print(f"TOTAL escaped: {total_changed}")
    if unclosed:
        print("FILES WITH UNCLOSED BRIEFS:", ", ".join(unclosed))
        sys.exit(1)


if __name__ == "__main__":
    main()
