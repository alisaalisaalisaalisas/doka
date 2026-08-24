# 📈 23.2 Experiment Tracking: MLflow

> Уровень: Middle→Senior. Цель: поднять self-hosted MLflow (Tracking + Registry) с MinIO как artifact store и встроить его в пайплайн обучения.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Компоненты MLflow

| Компонент | Что делает |
| :--- | :--- |
| **Tracking Server** | HTTP-сервис: хранит эксперименты, runs, параметры, метрики (в БД) и указатели на артефакты |
| **Registry** | версионированный каталог моделей: `name/version/stage` (None→Staging→Production→Archived) + lineage (какой run породил) |
| **Projects** | упаковка кода обучения (conda/docker) — используется редко |
| **Models** | формат упаковки (MLmodel + веса + env) — умеет сервить `mlflow models serve` |

**Ключевые термины:** `experiment` (группа runs, например «churn-v3»), `run` (один прогон: params + metrics + artifacts + git commit), `artifact` (модель, графики, датасеты), `source` (какой run/версия кода породили модель в registry).

**Backend выбор:**
- Метаданные: **SQLite** (лабы) / **PostgreSQL** (прод — тот же Patroni-стек из [11.4](../11-data-and-storage/04-postgresql-ha-and-patroni.md)).
- Артефакты: **MinIO/S3** (см. [20.8](../20-senior-stack/08-storage-s3-etcd-longhorn.md)) — не локальный диск!

**vs Weights&Biases:** W&B удобнее UI/коллаборация, но SaaS; MLflow — self-hosted, registry из коробки, стандарт де-факто on-prem.

#### Жизненный цикл модели в registry

```text
run (эксперимент) ──register──> Model v1 (None)
    └─> transition Staging  ← тесты/валидация на staging-данных
        └─> transition Production  ← деплой сервисом
              └─> при новой версии: архивируем старую (архив = откат)
```

---

### 2.2 Конфигурация и синтаксис

#### Запуск сервера (docker-compose, прод-минимум)

```yaml
# docker-compose.yml
services:
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.17.0
    command: >
      server --host 0.0.0.0 --port 5000
      --backend-store-uri postgresql://mlflow:pass@db:5432/mlflow
      --default-artifact-root s3://mlflow-artifacts
      --serve-artifacts
    ports: ["5000:5000"]
    environment:
      AWS_ACCESS_KEY_ID: minioadmin
      AWS_SECRET_ACCESS_KEY: minioadmin
      MLFLOW_S3_ENDPOINT_URL: http://minio:9000     # MinIO вместо AWS
  db:
    image: postgres:16-alpine
    environment: { POSTGRES_USER: mlflow, POSTGRES_PASSWORD: pass, POSTGRES_DB: mlflow }
```

```bash
docker compose up -d
# Первый запуск: применить миграции схемы
docker compose exec mlflow mlflow db upgrade postgresql://mlflow:pass@db:5432/mlflow
```

#### Логирование из кода обучения

```python
import mlflow, os
mlflow.set_tracking_uri("http://mlflow:5000")
mlflow.set_experiment("churn-v3")

with mlflow.start_run() as run:
    mlflow.set_tag("git_commit", os.environ.get("GIT_COMMIT", "dev"))
    mlflow.log_params({"n_estimators": 200, "max_depth": 8, "seed": 42})
    mlflow.log_param("data_sha256", data_hash)          # см. 23.1
    # ... обучение ...
    mlflow.log_metrics({"roc_auc": 0.87, "precision": 0.81})
    mlflow.sklearn.log_model(model, artifact_path="model")
    print(run.info.run_id)
```

#### Registry: регистрация и промоушен

```python
result = mlflow.register_model(
    f"runs:/{run.info.run_id}/model", "churn-classifier")

from mlflow.tracking import MlflowClient
c = MlflowClient()
c.transition_model_version_stage("churn-classifier", 1, "Staging")
c.transition_model_version_stage("churn-classifier", 1, "Production",
                                 archive_existing_versions=True)   # старую — в Archived

# Сервис читает «текущую продакшн» версию:
model = mlflow.pyfunc.load_model(
    models:/churn-classifier/Production")
```

**Частые ошибки конфигурации:**
1. Артефакты пишутся на локальный диск сервера (`--default-artifact-root ./mlruns`) → потеря при пересоздании пода. Только S3/MinIO.
2. Забыли `mlflow db upgrade` после обновления образа → «schema mismatch».
3. Клиент не знает про S3-endpoint (нет `MLFLOW_S3_ENDPOINT_URL`) → артефакты «уезжают» в AWS.
4. Промоушен в Production без валидации метрик — «кто-то кликнул в UI».
5. `serve-artifacts` выключен → клиенты тянут артефакты напрямую из MinIO (нужно раздавать креды всем).

---

### 2.3 Troubleshooting

```bash
# Здоровье сервера и список экспериментов
curl -s localhost:5000/health
curl -s -X POST localhost:5000/api/2.0/mlflow/experiments/search \
  -H 'Content-Type: application/json' -d '{"max_results":5}' | jq '.experiments[].name'

# Миграции БД после апгрейда образа
docker compose exec mlflow mlflow db upgrade $BACKEND_URI

# Артефакт не скачивается клиентом
docker compose exec mlflow env | grep MLFLOW_S3   # endpoint задан?
mc ls local/mlflow-artifacts | head               # артефакт физически есть?

# Кто в Production? (для деплой-автоматики)
curl -s "localhost:5000/api/2.0/mlflow/model-versions/get-latest?name=churn-classifier&stages=Production" | jq .
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| `409: Experiment already exists` при старте | гонка двух воркеров создают эксперимент | `set_experiment` идемпотентен — ловить и продолжать |
| Артефакты пропали после пересоздания контейнера | локальный artifact root | S3/MinIO + `--serve-artifacts` |
| `AttributeError: module 'mlflow' has no attribute ...` | версия клиента ≠ сервера | пиновать mlflow в requirements = версии сервера |
| Registry: две Production-версии | промоушен без archive_existing_versions | всегда `archive_existing_versions=True` |
| Медленный UI, тысячи runs | нет очистки/агрегации | удалять дубли, `--gunicorn-opts` воркеров, БД-индексы |

---

### 2.4 Интеграция со стеком

- **CI (GitLab CI):** job `train` запускает контейнер обучения → run в MLflow → если метрика > порога: register + Staging. Отдельный job валидации → промоушен в Production.
- **GitOps:** деплой-манифест сервиса модели ссылается на версию registry (или digest образа, собранного от Production-модели) — смена модели = коммит в Git (см. [20.5 Renovate-подход](../20-senior-stack/05-registries-dependencies.md)).
- **Мониторинг:** MLflow отдаёт `/metrics`? Нет — мониторить сам сервер (postgres, диск MinIO) стандартно; метрики **модели** — через сервис (см. [23.4](04-serving-monitoring.md)).
- **Секреты:** креды MinIO/БД — через ESO (см. [20.3](../20-senior-stack/03-secrets-runtime-security.md)), не в compose-файле.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: пересоздали контейнер MLflow — все графики и runs исчезли. Что настроено неправильно и как должно быть?**

<details><summary>Ответ</summary>
Backend-store и артефакты были локальными внутри контейнера. Правильно: backend в PostgreSQL, артефакты в S3/MinIO (--default-artifact-root s3://... + --serve-artifacts), контейнер — stateless.
</details>

**В2. Найдите ошибку: модель зарегистрировали, перевели в Production, но сервис грузит старую версию.**

<details><summary>Ответ</summary>
Сервис, вероятно, грузит модель по зафиксированной версии/пути, а не по алиасу stage. Загружать по `models:/name/Production` (или алиасу champion) и перечитывать при смене версии — иначе промоушен ничего не меняет.
</details>

**В3. Почему `--serve-artifacts` важен при MinIO-бэкенде, и что меняется для клиентов?**

<details><summary>Ответ</summary>
Клиенты скачивают артефакты через Tracking Server (прокси), а не напрямую из S3 — раздача кредов MinIO всем DS/CI не нужна. Клиенту достаточно tracking_uri.
</details>

**В4. Чем registry-подход «Staging→Production» лучше «положить model.pkl на шару»? Назовите минимум три свойства.**

<details><summary>Ответ</summary>
Версионирование и lineage (какой run/данные породили), стадии с историей переходов и авторизацией, атомарный откат через архивирование, единая точка для автоматики деплоя (API вместо файловой шары).
</details>

**В5. В CI-джобе обучения два воркера стартовали одновременно и оба делают `set_experiment("churn")`. Что произойдёт и как правильно?**

<details><summary>Ответ</summary>
Возможна гонка создания эксперимента (409 already exists). `mlflow.set_experiment` идемпотентен — обёртка try/except: при 409 получить существующий эксперимент и продолжить.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Поднять MLflow + MinIO и проверить артефакты

**Условие:** compose из 2.2 (замените db на sqlite для лабы: `--backend-store-uri sqlite:///mlflow.db`), MinIO из [20.8](../20-senior-stack/08-storage-s3-etcd-longhorn.md).

```bash
docker compose up -d
curl -s localhost:5000/health          # OK
mc mb local/mlflow-artifacts           # бакет для артефактов

# Шаг 1: логирование из одноразового контейнера
docker run --rm --network lab_default \
  -e MLFLOW_TRACKING_URI=http://mlflow:5000 \
  -e MLFLOW_S3_ENDPOINT_URL=http://minio:9000 \
  -e AWS_ACCESS_KEY_ID=minioadmin -e AWS_SECRET_ACCESS_KEY=minioadmin \
  ghcr.io/mlflow/mlflow:v2.17.0 bash -c "
    python -c \"
import mlflow
mlflow.set_experiment('lab')
with mlflow.start_run():
    mlflow.log_param('lr', 0.01)
    mlflow.log_metric('auc', 0.9)
\"
  "

# Шаг 2: проверка в UI http://localhost:5000 и в MinIO
mc ls local/mlflow-artifacts | head -3   # появился run-каталог ✅
```

**Проверь себя:** run виден в UI с параметром lr=0.01 и метрикой auc=0.9; в MinIO бакете — артефактный каталог этого run'а.

**Разбор:** клиенту нужны только tracking_uri + S3-креды (или --serve-artifacts, тогда только tracking). Эксперимент/метрики — в БД, артефакты — в объектном хранилище: stateless-сервер.

#### Задание 2: Обучение с логированием + регистрация модели

**Условие:** скрипт train.py (sklearn) логирует params/metrics и регистрирует модель; затем промоушен в Production через API.

```python
# train.py (фрагмент)
import mlflow
from mlflow.tracking import MlflowClient
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("churn-v3")
with mlflow.start_run() as run:
    # ... обучение на данных ...
    mlflow.log_metric("roc_auc", 0.91)
    mlflow.sklearn.log_model(model, "model")
    mv = mlflow.register_model(f"runs:/{run.info.run_id}/model", "churn")
    MlflowClient().transition_model_version_stage("churn", mv.version, "Staging")
```

```bash
python train.py
# Промоушен после валидации:
python -c "
from mlflow.tracking import MlflowClient
c = MlflowClient()
c.transition_model_version_stage('churn', '1', 'Production', archive_existing_versions=True)
"
curl -s "localhost:5000/api/2.0/mlflow/model-versions/get-latest?name=churn&stages=Production" | jq '.model_versions[0].version'   # "1" ✅
```

**Проверь себя:** в UI у модели churn v1 — стадия Production; у предыдущей Production-версии стадия Archived.

**Разбор:** промоушен — это API-операция с lineage (видно run и метрику roc_auc=0.91). archive_existing_versions гарантирует единственную Production-версию.

#### Задание 3: CI-гейт «модель лучше текущей Production»

**Условие:** в пайплайне после обучения сравнить метрику нового run'а с Production-версией; регистрировать только при улучшении.

```python
# gate.py
import mlflow
from mlflow.tracking import MlflowClient
c = MlflowClient()
new_auc = float(input())   # или из run
try:
    prod = c.get_latest_versions("churn", stages=["Production"])[0]
    old_auc = float(c.get_run(prod.run_id).data.metrics["roc_auc"])
except Exception:
    old_auc = 0.0
assert new_auc > old_auc, f"гейт не пройден: {new_auc} <= {old_auc}"
print("GATE OK:", new_auc, ">", old_auc)
```

```bash
python train.py && echo 0.93 | python gate.py     # GATE OK → register
echo 0.80 | python gate.py; echo "exit=$?"        # exit=1 → CI красный, регистрация не случилась
```

**Проверь себя:** при 0.80 CI-job падает до register_model; в registry нет новой версии.

**Разбор:** registry без гейта превращается в свалку. Гейт «новая ≥ текущая Production по валидационной метрике» — минимальная автоматизация промоушена; следующий уровень — валидация на отложенных данных + drift-отчёт (23.4).

---

*Следующая страница: [23.3 Данные и пайплайны: DVC, Airflow/Kubeflow](03-data-pipelines.md)*
