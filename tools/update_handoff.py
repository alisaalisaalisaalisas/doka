# -*- coding: utf-8 -*-
"""Финальное обновление HANDOFF.md."""
import pathlib

p = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\HANDOFF.md")
t = p.read_text(encoding="utf-8")

BT = "`"

old_tool = "| " + BT + "tools/build_trainer.py" + BT + " | генератор тренажёра (запуск: " + BT + "py tools/build_trainer.py" + BT + ") |"
add_tools = (
    "| " + BT + "tools/fold_solutions.py" + BT + " | сворачивает решения 100 задач в details (идемпотентно) |\n"
    "| " + BT + "tools/enrich_tasks.py" + BT + " | добавляет к задачам подсказку + поле ввода ответа (JS-проверка) |\n"
    "| " + BT + "tools/validate_scenarios.js" + BT + " | валидатор паттернов сценариев (node) |\n"
    "| " + BT + "tools/test_playground.js" + BT + " и др. | e2e-тесты песочницы/задач (playwright, npm i playwright) |"
)
if "fold_solutions" not in t:
    assert old_tool in t
    t = t.replace(old_tool, old_tool + "\n" + add_tools)

t = t.replace(
    "Сейчас **225 карточек** (в т.ч. MLOps 23.1–23.4). После правки материалов — перегенерировать скриптом.",
    "Сейчас **250 карточек**. Anki-TSV УДАЛЁН по решению пользователя — всё в SRS-квизе на сайте.\n"
    "MLOps полный: 23.1–23.4 (база) + 23.5 Feast · 23.6 GPU/Kueue · 23.7 Kubeflow · 23.8 LLMOps/RAG · 23.9 Governance.")

old_pg = "- 120 сценариев по всем темам. MySQL-сценарии заменены на PostgreSQL (конфликт recovery, pg_basebackup, PITR, EXPLAIN)."
add_pg = (
    "- Решения 100 задач (разд. 15) свёрнуты в details + у каждой задачи подсказка-инструменты и поле ввода ответа с JS-проверкой (класс .answer-check, data-answer=regex).\n"
    "- Движок песочницы: команды могут быть массивами [pattern,out,cls] (pattern — СТРОКА) или объектами; паттерны через RE() (new RegExp(p,\"i\")). loadScenario принимает id и индекс; защита от гонки Monaco/fallback (editorReady/monacoStarted). Ввод очищается до выполнения (submitCommand, try/catch). В брифе авто-блоки «Стартовое состояние» и «Цели задания» (из solution)."
)
if "answer-check" not in t:
    assert old_pg in t
    t = t.replace(old_pg, old_pg + "\n" + add_pg)

p.write_text(t, encoding="utf-8")
print("HANDOFF updated:", "fold_solutions" in t and "answer-check" in t)
