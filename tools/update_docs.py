# -*- coding: utf-8 -*-
"""Обновляет описания тренажёра/песочницы (index.md, USAGE.md)."""
import pathlib

# 1) trainer index template
p = pathlib.Path("tools/build_trainer.py")
t = p.read_text(encoding="utf-8")
t = t.replace(
    "| **Интерактивный квиз** | [quiz.html](quiz.html) | Браузер: перемешивание, фильтр по темам, трекинг «знаю/не знаю» (прогресс в localStorage) |",
    "| **Интерактивный SRS-тренажёр** | [quiz.html](quiz.html) | Браузер: Anki-алгоритм (Снова/Хорошо/Легко, интервалы 1→3→7→16→35→70 дней), фильтр по темам, прогресс в localStorage |")
t = t.replace(
    "4. Рекомендуемый режим: 20 карточек/день, повторение по кривой забывания (1 → 3 → 7 → 21 день).",
    "4. Альтернатива без установки — режим **Anki (по расписанию)** прямо в quiz.html: те же интервалы, прогресс в браузере.")
t = t.replace(
    "3. Честно отмечайте «Знал / Не знал» — прогресс сохраняется в браузере.\n4. Режим «только проблемные» — повторение только того, что было «Не знал».",
    "3. Честно отмечайте «Снова / Хорошо / Легко» — SRS-расписание само решит, что повторить завтра.\n4. Режим «экзамен» — все карточки подряд без расписания.")
p.write_text(t, encoding="utf-8")

# 2) playground index
p2 = pathlib.Path("docs/21-playground/index.md")
t2 = p2.read_text(encoding="utf-8")
t2 = t2.replace(
    "| **5 сценариев** | CrashLoopBackOff (K8s) · jq-аудит · MySQL-реплика (GTID) · Docker registry push · Terraform drift |",
    "| **120 сценариев** по всем темам: Linux/Bash/Git/Сети · Docker/K8s/Helm · Terraform/Ansible/CI · Prometheus/Loki/Vault/Kyverno · Kafka/RabbitMQ/PG/MySQL/Redis/CH · Istio/облака/Proxmox и др. |")
p2.write_text(t2, encoding="utf-8")

# 3) USAGE
p3 = pathlib.Path("USAGE.md")
t3 = p3.read_text(encoding="utf-8")
t3 = t3.replace(
    "5 сценариев (K8s CrashLoop, jq, MySQL-реплика, Docker push, Terraform drift). Кнопка «Проверить решение» сверяет ваши действия с целью.",
    "120 сценариев по всем темам handbook'а. «Проверить решение» сверяет действия с целью; «Проверить код» — написанное в редакторе (Monaco).")
t3 = t3.replace(
    "205 карточек по всему Senior Stack: интерактивный квиз (прогресс в браузере) + Anki-колода (импорт через Файл → Импорт).",
    "205 карточек по всему Senior Stack: SRS-тренажёр в браузере (Anki-алгоритм: Снова/Хорошо/Легко, интервалы 1→70 дней, прогресс в localStorage) + экспорт Anki-колоды (TSV).")
p3.write_text(t3, encoding="utf-8")
print("docs updated")
