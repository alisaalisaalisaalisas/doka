# 📋 HANDOFF: состояние проекта (для продолжения с другой сессии/нейронкой)

> Скопируйте этот файл в новый чат — он содержит полный контекст. Обновляйте после крупных изменений.

## Что это за проект

**DevOps Knowledge Base & Handbook** — личная база знаний Docs-as-Code (MkDocs Material) для подготовки к уровню Senior DevOps/SRE и использования как production-справочник.

- **Каталог:** `C:\Users\User\Desktop\papka\doka`
- **Запуск:** `mkdocs serve` → http://127.0.0.1:8000 (сервер может быть уже запущен фоном; убить: `Get-Process mkdocs | Stop-Process`)
- **Проверка:** `mkdocs build --strict` — ОБЯЗАТЕЛЬНО чисто после любых правок
- **Стек:** MkDocs Material, Mermaid-диаграммы, Python 3.14 (`py`), PowerShell 7. Язык контента — русский.

## Структура (главное)

| Путь | Что там |
|---|---|
| `mkdocs.yml` | навигация + тема. ⚠️ Ключи YAML с двоеточием внутри — брать в кавычки! |
| `USAGE.md` | инструкция по запуску/использованию сайта |
| `docs/index.md` | главная (карта знаний, learning paths, глоссарий) |
| `docs/00-roadmap/` | путь от нуля до DevOps (этапы, ресурсы, чек-листы) |
| `docs/01..14-*/` | теория: Linux, Git, Docker, K8s (7 стр.), GitOps/CI (4), Terraform (3), Ansible (3), Python/Go, Observability (9), Security (3), Data (5), Mesh (3), DR, Interview |
| `docs/15-hands-on-practice/` | банк 100 практических задач (2 файла) |
| `docs/16-guided-labs/` | 7 пошаговых лабораторных (Linux→ArgoCD) |
| `docs/17-break-fix/` | 10 инцидент-симуляций «сломай и почини» |
| `docs/18-templates/` | production-шаблоны (K8s/IaC/Obs) |
| `docs/19-career/` | homelab, портфолио, сертификаты, резюме |
| `docs/20-senior-stack/` | **Senior Stack: 17 тем + 3 свода** (см. ниже) |
| `docs/21-playground/` | **Песочница**: терминал+Monaco, **1033 сценария** (2026-08, UX v1: прогресс, 🔗 копирование, optgroup, light/dark, a11y, focus-режим, печать) |
| `docs/22-trainer/` | **Тренажёр SRS**: quiz.html (**831 карточка**, SRS, undo, Space/1-2-3/←→, streak, light/dark) + Anki TSV |
| `docs/javascripts/answer-check.js` | фикс instant-nav для задач (Phase 2) |
| `docs/stylesheets/extra.css` | тема, card-grid, badges, hero (Phase 3) |
| `tools/build_home.py` | генератор статистики главной (Phase 4) |
| `tools/check_nav_drift.py` | CI-чек дрейфа цифр (Phase 7) |
| `docs/23-mlops/` | **MLOps**: план + 4 темы (intro, MLflow, DVC/пайплайны, сервинг) |
| `tools/build_trainer.py` | генератор тренажёра (запуск: `py tools/build_trainer.py`) |
| `tools/fold_solutions.py` | сворачивает решения 100 задач в details (идемпотентно) |
| `tools/enrich_tasks.py` | добавляет к задачам подсказку + поле ввода ответа (JS-проверка) |
| `tools/validate_scenarios.js` | валидатор паттернов сценариев (node) |
| `tools/test_playground.js` и др. | e2e-тесты песочницы/задач (playwright, npm i playwright) |

## Senior Stack (раздел 20) — формат и содержание

Каждая тема — структура **2.1 Теория / 2.2 Конфигурация / 2.3 Troubleshooting / 2.4 Интеграция / 2.5 Пять вопросов (details) / 2.6 Три практики (quest: стартовое состояние → шаги с ожидаемым выводом → «Проверь себя» → разбор)**. Маркер конца файла: `<!-- enriched:v1 -->`.

Темы: 01 OPA/Rego+Kyverno · 02 Thanos/VM/OTel-Tempo · 03 ESO/cert-manager/Falco · 04 Terratest/Molecule/k6 · 05 Harbor/Nexus/Renovate · 06 RabbitMQ/NATS · 07 CoreDNS/MetalLB/WireGuard/HAProxy/Envoy · 08 MinIO/etcd/Longhorn · 09 Pulumi/Packer/Crossplane · 10 CLI (k9s/stern/tmux/jq) · 11 Jsonnet/CUE/Sentry · 12 AWS/GCP/Azure/Cloudflare · 13 GitLab admin · 14 Rancher/k3s · 15 KVM/Proxmox/VMware · 16 MySQL HA · 17 хвосты (Linkerd/Locust/Grype/CRI-O). Своды: 40 вопросов + 10 задач на часть.

## Песочница (21) — как устроена

- `playground.html` — самодостаточная страница: терминал-симулятор + Monaco (CDN, fallback textarea).
- Сценарии — в `scenarios-*.js`, формат:
  ```js
  S("Категория","id","Название","Уровень", brief_html, "prompt",
    [ [/^команда/, `вывод`, "ok|err|warn|dim"], ... ],           // commands
    [ {re:/команда/, l:"шаг решения"}, ... ],                     // solution
    {file:"x.yaml", files:{...}, start:"...", checks:[{re:/.../, l:"..."}]} // editor (опц.)
  );
  ```
- ⚠️ **Паттерны команд/решений — СТРОКИ, не regex-литералы** (слэши путей ломают литералы; движок делает `new RegExp(p,"i")`).
- Проверка: «Проверить решение» матчит выполненные команды по `solution`; «Проверить код» — по `editorChecks`.
- 120 сценариев по всем темам. MySQL-сценарии заменены на PostgreSQL (конфликт recovery, pg_basebackup, PITR, EXPLAIN).
- Решения 100 задач (разд. 15) свёрнуты в details + у каждой задачи подсказка-инструменты и поле ввода ответа с JS-проверкой (класс .answer-check, data-answer=regex).
- Движок песочницы: команды могут быть массивами [pattern,out,cls] (pattern — СТРОКА) или объектами; паттерны через RE() (new RegExp(p,"i")). loadScenario принимает id и индекс; защита от гонки Monaco/fallback (editorReady/monacoStarted). Ввод очищается до выполнения (submitCommand, try/catch). В брифе авто-блоки «Стартовое состояние» и «Цели задания» (из solution).

## Тренажёр (22) — как устроен

- `tools/build_trainer.py` сканирует `docs/20-senior-stack/` + `docs/23-mlops/`, извлекает Q/A (`**ВN. вопрос**` + `<details><summary>Ответ</summary>`) и генерирует:
  - `docs/22-trainer/quiz.html` — **SRS-тренажёр**: режимы Anki (Снова/Хорошо/Легко, интервалы 1→3→7→16→35→70 дней, due-очередь) и экзамен; прогресс в localStorage (ключ `devops-handbook-srs-v2`)
  - `docs/22-trainer/anki-devops-senior-stack.txt` — Anki TSV (импорт: Файл→Импорт)
  - `docs/22-trainer/index.md` — страница-описание
- Сейчас **250 карточек**. Anki-TSV УДАЛЁН по решению пользователя — всё в SRS-квизе на сайте.
MLOps полный: 23.1–23.4 (база) + 23.5 Feast · 23.6 GPU/Kueue · 23.7 Kubeflow · 23.8 LLMOps/RAG · 23.9 Governance.

## MLOps (раздел 23)

План и roadmap — `docs/23-mlops/00-plan.md`. Готово: 23.1 жизненный цикл/зрелость/репозиторий, 23.2 MLflow (Tracking+Registry+MinIO), 23.3 DVC/Airflow/Kubeflow/data validation, 23.4 FastAPI/KServe/drift/Evidently. Roadmap Ч.2: Feast, GPU на K8s (Kueue), Kubeflow deep, **LLMOps/RAG**, governance.

## Соглашения и грабли

1. Любая новая страница → добавить в `nav` в mkdocs.yml (иначе strict-варнинг «not in nav»).
2. YAML-ключи с `:` внутри — в кавычки: `- "23.2 Experiment Tracking: MLflow": path`.
3. Ссылки в md — относительные без префикса `docs/`; на каталоги — на конкретный файл.
4. Стиль контента: плотно, без воды; каждый блок — с командами, которые копипастятся; Mermaid вместо картинок; секреты — placeholder'ы.
5. После правок: `mkdocs build --strict` + при изменении Q/A — `py tools/build_trainer.py`.
6. Инструменты-генераторы: `tools/build_trainer.py`, `tools/fix_scenario_regex.py`, `tools/update_docs.py`, `tools/patch_engine.py` (последние два — разовые, можно удалить).

## ✨ UX Redesign v1 (2026-08, готово, 7 фаз)

- **Phase 0 Подготовка:** ветка `ux/redesign-v1`, `.gitignore` (site/.venv), `git rm --cached site/`, `mkdocs build --strict` ок.
- **Phase 1 Quick wins:** скрыт `repo_url/edit_uri`, сняты `content.action.edit/view`, `205→831` в nav, `1.py/_sync_index.py → tools/legacy/`, `includes/mkdocs.md` UTF-8, удалён `tags` плагин, back-link `← Назад` в playground/quiz.
- **Phase 2 Bug-fix instant-nav:** `docs/javascripts/answer-check.js` + `document$.subscribe(...)`, `extra_javascript`, удалены inline `<script>` из задач, стили в `answer-check.css`.
- **Phase 3 Тема/навигация:** `extra.css` (CSS-переменные, :focus-visible, .card-grid/.badge), `toc.integrate` убран (вернулся правый ToC), `navigation.prune`, группировка мелких разделов в таб `Ещё` (10-13+18+19), шрифт fallback, `nav-stats.js`.
- **Phase 4 Главная:** `overrides/home.html` hero + `handbook-hero` CTA (Roadmap/Playground/SRS) + поиск, карточки 6 разделов, авто-статистика `tools/build_home.py` (299 стр/12 лаб/4 блока/1033 сцена/831 карт), дрейф-чек.
- **Phase 5 Песочница:** прогресс `playground-solved-v1` + ✓ в select + счётчик, 🔗 копировать ссылку `?scenario=id` + тост, light-тема, a11y (aria-live/label, focus-ring), focus-режим, `@media print`, стабильность Monaco/fallback + fix double-click.
- **Phase 6 Тренажёр:** шорткаты Space/1/2/3/←→/Ctrl+Z, undo history 20, `undo` кнопка, streak `devops-handbook-srs-stats-v1` (`📊 Streak/неделя/повторы`), light+autodetect, динамический `<h1> Тренажёр: ${topic}`, kbd-badges, nav-метка авто (831).
- **Phase 7 Полировка:** `search.stop_words` (RU), `theme.icon.admonition` кастом, `tools/check_nav_drift.py` + CI `.github/workflows/ci.yml` + `.pre-commit-config.yaml`, HANDOFF/USAGE обновлены. Валидация: `mkdocs build --strict` + `py tools/check_nav_drift.py` + ручная 6 страниц.

## Что НЕ сделано / кандидаты на продолжение

- **Волна 6b (2026-08, готово): хвосты добиты.** +22 страницы получили самопроверки (k8s 05/06/07 internals, terraform 03, ansible 03, obs 03–06, security 02/03, clickhouse/mongodb, cilium-calico, traefik-nginx + финал: roadmap, practice-projects, все 5 страниц interview-prep). Покрытие «Проверь себя»: **127 из 127 (100%)**.
- **Anki-экспорт УДАЛЁН по решению пользователя**: `.apkg` и `tools/build_apkg.py` снесены — весь Anki-функционал (SRS-интервалы, Снова/Хорошо/Легко, due-очередь) живёт в quiz.html на сайте. Тренажёр: **678 карточек**.
- **Волна 6c (2026-08, готово): интерактивные лабы.**
  - `docs/21-playground/scenarios-labs.js`: **10 сценариев «Labs»** (lab01…lab10) — сжатые симуляции ключевых шагов всех Guided Labs с автопроверкой (solution-чеклисты).
  - `playground.html`: **deep-link** `?scenario=<id>` — открытие песочницы сразу на нужном сценарии; каждая страница раздела 16 получила плашку «Интерактивная версия» со ссылкой.
  - **Исправлен предсуществующий баг** scenarios-mlops.js: непарные бэктики в брифе gpu1 рвали template literal — GPU/Kueue и LLMOps сценарии не загружались в браузере. Валидатор: **136 сценариев, badPatterns=0**.

- **Волна 6 (2026-08, готово): стандарт лаб + инфраструктура экспорта.**
  - `tools/add_selfcheck.py` (Pass A): страницам с готовыми Q/A без заголовка вставляет блок «✅ Проверь себя». Обновлено **43 страницы**.
  - Pass B: hand-written самопроверки (4–5 Q/A, кормят тренажёр) добавлены в **23 ключевые страницы**: linux 03/04, git 01/02, docker 01–04, k8s 02/03/04, gitops 01/02, terraform 02, ansible 02, obs 02, security 01, ceph/kafka/pg/redis, istio, velero. Временные генераторы `_selfcheck_b*.py` удалены.
  - Покрытие «Проверь себя»: было 43 стр. (~35%) → стало ~110+ стр. (~85% теоретических).
  - USAGE.md дополнен: gh-deploy, VPS+nginx, PDF через mkdocs-print-site-page, стандарт «Проверь себя».
  - Остаток для итераций: страницы без Q/A вообще (obs 03–06/09? нет — они Pass A; остались 11-data 03/06, mesh 02/03, dr 02, security 02–04 частично) — дотягивать по стандарту при правках.

- **Волна 5 (2026-08, готово): глубокая прокачка Git/Python/Go + закрытие пробелов.**
  - Git (02): +8 страниц (03–10): internals/packfiles/GC · branching/release engineering · merge-rebase-конфликты (+rerere) · hooks/pre-commit/commitlint · submodules/subtrees/монорепо (sparse checkout) · большие репо/LFS/filter-repo · security (SSH-подписи, gitleaks/trufflehog) · археология (bisect/worktree/blame).
  - Python (08): +9 страниц (02–10): uv/pyproject/wheel/multi-stage Docker · pytest (fixtures/mocks/respx/hypothesis) · asyncio+GIL+to_thread · mypy strict/ruff · Typer CLI · Kopf-операторы · FastAPI webhook-API · boto3 deep+moto · cProfile/py-spy/tracemalloc.
  - Go (08): +9 страниц (02–10): interfaces/typed-nil/%w/generics · channels/context/errgroup · table-driven/fuzz/benchstat · modules/GOPRIVATE/govulncheck/trimpath · Cobra/goreleaser/distroless · client-go informers/workqueue · kubebuilder/envtest/finalizers · net-http timeouts/graceful/gRPC · pprof/GOMEMLIMIT/race.
  - Пробелы закрыты: **04.10 Serverless Knative/OpenFaaS** · **05.05 Progressive Delivery Argo Rollouts/Flagger** · **05.06 Argo Workflows/Tekton** · **09.10 SRE-процессы** (SEV, IC, постмортем-шаблон, on-call, error budget policy) · **10.05 Compliance** (PCI DSS/SOC2/ISO27001/152-ФЗ) · **12.04 eBPF Deep Dive** (XDP/bpftrace/Cilium/Tetragon) · **20.20 Nomad+Windows-ноды+AD/LDAP** (enriched:v1 формат).
  - Тренажёр: 485 карточек (было 320). Все новые страницы с Q/A «Пять вопросов» попадают автоматически.
  - Jenkins и GitHub Actions сознательно НЕ добавлены (решение пользователя).
- Расширения 2026-08 (готово, strict проходит): 06.3 Terraform testing/Atlantis/state ops · 07.3 Ansible collections/perf/AWX · 05.3 GitLab CI deep dive · 05.4 GitOps multi-env/promotion · 09.7 Alloy cookbook · 09.8 Grafana as Code · 09.9 Архитектура стека мониторинга.
- Волна 2 (2026-08, готово): 04.8 Автоскейлинг (HPA/VPA/KEDA) · 04.9 Эксплуатация кластера (etcd, апгрейды) · 13.2 Бэкапы БД + DR-план/RPO-RTO/runbook · 01.5 Диагностика производительности Linux (полный арсенал команд) · 10.4 Supply Chain (SBOM/cosign/Kyverno) · Lab 08 Ansible+Molecule · шаблоны 18.4 GitLab CI/Ansible.
- Волна 3 (2026-08, готово): сквозные блоки «Что дальше» в 57 теоретических страницах · Q/A-блоки «Пять вопросов» в 10 новых страницах (кормят тренажёр) · 20.18 Platform Engineering/Backstage · 20.19 FinOps/OpenCost/Infracost · 11.6 MongoDB (RS/sharding/PBM) · Lab 09 автоскейлинг на kind · Break-Fix партия №2 (6 сценариев: HPA unknown, drain+PDB, пустой WAL, Kyverno block, IO-шторм, etcd restore) · 18.5 Production Readiness Review · песочница +6 MLOps-сценариев (scenarios-mlops.js, 126 всего).
- Волна 4 (2026-08, готово): Lab 10 Vault end-to-end (KV→AppRole→динамические креды БД→ESO) · Break-Fix №3 сетевая (6 сценариев: ndots-DNS, PMTU, conntrack, TLS handshake, QoS, CNI после ребута) · Банк 20 system-design задач с критериями (14.5) · tools/chaos-lab.sh + страница Chaos Drills (17.4) · Мини-проекты Python/Go (08.3) · **Стандарт лаб/чек-листов** (18.6): лаб = шаги+ожидаемый вывод+???-вопросы+«Проверь себя», чек-лист = каждый пункт с ??? «Как закрыть пункт». Апгрейд по стандарту применён к 6 флагманским страницам (01.1, 01.2, 04.1, 06.1, 07.1, 09.1) — остальные страницы можно дотягивать итеративно.
- Тренажёр: build_trainer.py теперь сканирует ВСЕ docs/*/ (формат `**ВN**`+`<details>Ответ`); сейчас **320 карточек**. Новые Q/A в любых темах попадают автоматически после `py tools/build_trainer.py`.
- MLOps Часть 2: Feast, GPU/Kueue, Kubeflow deep, LLMOps/RAG (pgvector, Ragas), model governance — план в `23-mlops/00-plan.md`.
- MLOps-сценарии в песочницу (mlflow/dvc/drift) — по формату S().
- Публикация сайта: `mkdocs gh-deploy` или VPS+nginx (в USAGE.md).
- PDF-экспорт (mkdocs-print-site-page), интерактив по Labs 01-07.
- Мелочь: 20.16 MySQL HA остался как справочник (в песочнице MySQL заменён на PG) — спросить пользователя, удалять ли.

## Команды быстрого старта (для новой сессии)

```powershell
cd C:\Users\User\Desktop\papka\doka
Get-Process mkdocs -ErrorAction SilentlyContinue | Stop-Process
mkdocs serve            # → http://127.0.0.1:8000
mkdocs build --strict   # проверка (обязательно после Phase 1+)
py tools/build_trainer.py   # перегенерация тренажёра (831 карт → обновляет nav + index.md)
py tools/build_home.py      # пересчитать статистику главной (299 стр/1033 сцена/831 карт)
py tools/check_nav_drift.py # CI-чек дрейфа цифр

# UX-горячие клавиши (песочница/тренажёр):
# Песочница: 🔗 копировать ссылку, ⛶ фокус, прогресс в localStorage playground-solved-v1
# Тренажёр: Space→ответ, 1/2/3→оценка, Z/← undo, → skip, streak в devops-handbook-srs-stats-v1
```
