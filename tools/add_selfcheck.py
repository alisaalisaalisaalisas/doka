# -*- coding: utf-8 -*-
"""Pass A стандарта лаб (18.6): страницам, у которых уже есть блок «Пять вопросов»
(`**В1.`), но нет заголовка «Проверь себя», вставляет стандартный заголовок
перед первым вопросом. Идемпотентно.

Запуск: py tools/add_selfcheck.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SKIP_DIRS = {"18-templates", "19-career", "21-playground", "22-trainer"}

HEADINGS = ("## ✅ Проверь себя", "### Шаг N. Проверь себя", "**Проверь себя:**")


def main() -> int:
    changed = []
    for path in sorted(DOCS.rglob("*.md")):
        rel = path.relative_to(DOCS)
        if rel.parts[0] in SKIP_DIRS or path.name.startswith("00-"):
            continue
        text = path.read_text(encoding="utf-8")
        if "Проверь себя" in text or "**В1." not in text:
            continue
        m = re.search(r"^(\s*)\*\*В1\.", text, flags=re.M)
        if not m:
            continue
        indent = m.group(1)
        new = (
            f"{indent}## ✅ Проверь себя\n\n"
            "> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.\n\n"
        )
        # вставляем перед строкой **В1.**, сохраняя предыдущий разделитель ---
        idx = m.start()
        prefix = text[:idx]
        stripped = prefix.rstrip("\n")
        if not stripped.endswith("---"):
            new_text = stripped + "\n\n---\n\n" + new + text[idx:]
        else:
            new_text = stripped + "\n\n" + new + text[idx:]
        path.write_text(new_text, encoding="utf-8")
        changed.append(str(rel))

    print(f"Обновлено страниц: {len(changed)}")
    for c in changed:
        print(" ", c)
    return 0


if __name__ == "__main__":
    sys.exit(main())
