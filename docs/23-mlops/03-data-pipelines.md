# 🗃️ 23.3 Данные и пайплайны: DVC, Airflow/Kubeflow

> Уровень: Middle→Senior. Цель: версионировать данные рядом с кодом и превратить «ноутбук» в воспроизводимый пайплайн prepare→train→eval.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### DVC: Git для данных

DVC хранит **содержимое** файлов в кэше/remote (S3/MinIO), а в Git оставляет крошечные `.dvc`-указатели (md5 + путь). Итог: `git checkout v1.2 && dvc checkout` = точное состояние данных для этого релиза.

| Команда | Аналог git | Что делает |
| :--- | :--- | :--- |
| `dvc add data/raw/x.csv` | git add | файл → кэш, создаётся `x.csv.dvc` |
| `dvc push` / `dvc pull` | push/pull | кэш ↔ remote (MinIO) |
| `dvc repro` | make | пересобрать пайплайн по dvc.yaml |
| `dvc diff` / `dvc status` | git diff/status | что изменилось в данных |

**dvc.yaml — пайплайн с зависимостями:** DVC строит DAG по `deps`/`outs` и пересобирает только изменившиеся шаги (кэширование этапов).

#### Оркестрация обучения

| | **Airflow** | **Kubeflow Pipelines** |
| :--- | :--- | :--- |
| Модель исполнения | Python-DAG по расписанию/триггеру | контейнер на шаг, DAG в K8s |
| Сильная сторона | зрелость, экосистема, ретраи/SLA | артефакты шагов, кэш, эксперименты, GPU-ноды |
| Когда | ETL/переобучение по cron | Level 2: каждый шаг = образ, полный трейсинг |

**Data validation:** Great Expectations / Deep Learning по данным — шаг пайплайна «данные валидны?» до обучения (схема, диапазоны, дубли). Падение валидации = стоп пайплайна, а не обучение на мусоре.

**Ключевые термины:** `remote` (хранилище кэша DVC), `pipeline stage` (шаг с deps/outs), `cache` (content-addressable хранилище), `experiment tracking` связка: DVC-версия данных ↔ MLflow run (логировать `git sha` + `dvc rev`).

---

### 2.2 Конфигурация и синтаксис

#### DVC + MinIO remote

```bash
pip install dvc[s3]
dvc init
dvc add data/raw/orders.csv          # → data/raw/orders.csv.dvc + кэш
git add data/raw/orders.csv.dvc .gitignore && git commit -m "data: raw orders"

dvc remote add -d minio s3://dvc-data
dvc remote modify minio endpointurl http://minio:9000
dvc push                              # содержимое → MinIO
```

#### dvc.yaml: пайплайн

```yaml
stages:
  prepare:
    cmd: python src/prepare.py
    deps:
      - data/raw/orders.csv
      - src/prepare.py
      - params.yaml
    outs:
      - data/processed/dataset.parquet
  train:
    cmd: python src/train.py
    deps:
      - data/processed/dataset.parquet
      - src/train.py
      - params.yaml
    metrics:
      - metrics.json:
          cache: false                # метрики сравнимы через `dvc metrics diff`
    outs:
      - models/model.pkl
```

```bash
# Изменили params.yaml → пересоберутся только затронутые шаги:
vim params.yaml && dvc repro          # prepare (если данные/параметры менялись) → train
dvc metrics diff HEAD~1               # как изменились метрики между версиями
```

#### Airflow DAG: еженедельное переобучение

```python
# dags/retrain.py
from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime

with DAG("ml-retrain", schedule="0 3 * * 1", start_date=datetime(2026, 1, 1),
         catchup=False, default_args={"retries": 2}) as dag:
    pull = BashOperator(task_id="dvc_pull",
        bash_command="cd /opt/ml && dvc pull")
    validate = BashOperator(task_id="validate",
        bash_command="cd /opt/ml && great_expectations checkpoint run data_checks")
    train = BashOperator(task_id="train",
        bash_command="cd /opt/ml && dvc repro train")
    gate = BashOperator(task_id="metric_gate",
        bash_command="cd /opt/ml && python src/gate.py")   # порог метрики → fail = стоп

    pull >> validate >> train >> gate
```

**Частые ошибки:** большие файлы всё же в git (`.gitignore` без data/); remote не default → `dvc push` «работает», но никуда не пишет; Airflow-таски без `cd` — DVC ищет .dvc не там; валидация данных после обучения, а не до.

---

### 2.3 Troubleshooting

```bash
dvc status                    # расхождение workspace ↔ кэш/remote
dvc remote list               # default remote помечен (D)?
dvc cache dir && df -h $(dvc cache dir)   # кэш на отдельном диске?
dvc dag                       # граф пайплайна
dvc repro prepare             # пересобрать один шаг

# Airflow: scheduler жив? задачи в queued?
airflow dags list-import-errors
airflow tasks list ml-retrain --tree
kubectl -n airflow logs deploy/airflow-scheduler --tail=20
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| `dvc push` молча ничего не пушит | remote не default (`-d` при add) | `dvc remote default minio` |
| Кэш съел диск | кэш на системном разделе | `dvc cache dir /mnt/data/dvc-cache` + symlink |
| `dvc repro` пересобирает всё всегда | deps меняются каждый раз (timestamp в файле) | убрать недетерминизм из deps |
| Airflow DAG не появляется | синтаксис-ошибка в файле DAG | `airflow dags list-import-errors` |
| Обучение на «протухших» данных | нет шага валидации | Great Expectations checkpoint ДО train |

---

### 2.4 Интеграция со стеком

- **MinIO (20.8):** DVC remote и MLflow-артефакты — соседние бакеты одного объектного хранилища.
- **GitLab CI:** `dvc repro` + `dvc metrics diff` в MR — виден эффект изменения параметров/кода; push данных — только из доверенных job'ов.
- **MLflow (23.2):** в run логировать `dvc rev` и `git sha` — полная связка «код+данные→модель».
- **K8s:** Airflow/Kubeflow в кластере; GPU-ноды для train-шага (см. roadmap).

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: `git checkout v1.2` сделал, а датасеты «старые». Что забыли и какая команда завершает откат?**

<details><summary>Ответ</summary>
Git вернул только .dvc-указатели; содержимое лежит в кэше/remote. Завершает: dvc checkout (подтягивает версии файлов по указателям; при отсутствии в кэше — dvc pull).
</details>

**В2. Найдите ошибку: `dvc remote add minio s3://dvc-data`, потом `dvc push` — «Everything is up to date», хотя данных в MinIO нет.**

<details><summary>Ответ</summary>
Remote добавлен без флага -d и не назначен default: push без явного имени уходит в default-remote (которого нет/другой). Фикс: dvc remote default minio (или перев добавить с -d).
</details>

**В3. Зачем в dvc.yaml у metrics.json стоит `cache: false`?**

<details><summary>Ответ</summary>
Метрики нужны в рабочей копии для `dvc metrics diff` и сравнения коммитов; если кэшировать — файл живёт в кэше, и сравнение версий теряет смысл/удобство.
</details>

**В4. Почему валидацию данных ставят ДО train, а не после, если «и так есть метрика качества»?**

<details><summary>Ответ</summary>
Метрика качества скажет «модель плохая» уже после траты GPU-часов; валидация схемы/диапазонов ловит «данные сломаны» сразу и дёшево, предотвращая обучение на мусоре и ложный откат модели.
</details>

**В5. Airflow или Kubeflow Pipelines для ML-обучения: назовите решающий фактор выбора.**

<details><summary>Ответ</summary>
Если шаги — скрипты по расписанию и важна зрелая экосистема ETL → Airflow. Если каждый шаг должен быть контейнером с артефактами/кэшем/экспериментами в K8s (Level 2, GPU-ноды, канареечные пайплайны) → Kubeflow Pipelines.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: DVC + MinIO — данные под версионным контролем

```bash
# Шаг 0: старт (проект из 23.1, MinIO из 20.8)
pip install "dvc[s3]"
dvc init && git add .dvc && git commit -m "dvc init"

# Шаг 1: данные под DVC
dvc add data/raw/orders.csv
git add data/raw/orders.csv.dvc .gitignore && git commit -m "data: raw v1"

# Шаг 2: remote в MinIO
dvc remote add -d minio s3://dvc-data
dvc remote modify minio endpointurl http://localhost:9000
dvc push
mc ls local/dvc-data | head -3      # файлы в MinIO ✅

# Шаг 3: проверка отката
echo "новая строка" >> data/raw/orders.csv
git commit -am "data: v2" && dvc add data/raw/orders.csv && dvc push
git checkout HEAD~1 -- data/raw/orders.csv.dvc && dvc checkout
wc -l data/raw/orders.csv           # строк меньше — данные откатились вместе с кодом ✅
```

**Проверь себя:** `dvc status` — «Data and pipelines are up to date»; после checkout старого .dvc + dvc checkout содержимое соответствует v1.

**Разбор:** связка «git для указателей + DVC для содержимого» даёт атомарный откат кода вместе с данными — то, чего в 23.1 добивались хэшем, здесь становится штатной операцией.

#### Задание 2: Пайплайн prepare→train в dvc.yaml

```yaml
# dvc.yaml (стартовое состояние: скрипты из 23.1)
stages:
  prepare:
    cmd: python src/prepare.py
    deps: [data/raw/orders.csv, src/prepare.py, params.yaml]
    outs: [data/processed/dataset.parquet]
  train:
    cmd: python src/train.py
    deps: [data/processed/dataset.parquet, src/train.py, params.yaml]
    metrics: [{ metrics.json: { cache: false } }]
    outs: [models/model.pkl]
```

```bash
dvc repro                # первый прогон: prepare → train
dvc repro                # второй: «Data and pipelines are up to date» (кэш шагов ✅)
sed -i 's/max_depth: 8/max_depth: 12/' params.yaml
dvc repro                # пересобрался ТОЛЬКО train (prepare закэширован) ✅
dvc metrics diff         # изменение метрики между версиями
```

**Проверь себя:** после изменения только params.yaml шаг prepare не выполняется; `dvc metrics diff` показывает дельту roc_auc.

**Разбор:** DAG по deps/outs — ядро воспроизводимости: изменение параметра автоматически пересобирает только зависимую часть, а `dvc metrics diff` делает эксперименты сравнимыми в Git.

#### Задание 3: Airflow — еженедельное переобучение с гейтом

```python
# dags/retrain.py — из 2.2; добавить ветвление по гейту:
from airflow.operators.python import PythonOperator, BranchPythonOperator

def check_gate(**ctx):
    import json
    m = json.load(open("/opt/ml/metrics.json"))
    return "deploy" if m.get("roc_auc", 0) > 0.85 else "skip_deploy"

gate = BranchPythonOperator(task_id="gate", python_callable=check_gate)
deploy = BashOperator(task_id="deploy",
    bash_command="cd /opt/ml && dvc push && ./scripts/promote.sh")
skip = BashOperator(task_id="skip", bash_command="echo 'quality gate failed'")
train >> gate >> [deploy, skip]
```

```bash
airflow dags list-import-errors          # пусто
airflow dags trigger ml-retrain
airflow tasks states-for-dag-run ml-retrain  # pull→validate→train→gate→deploy|skip
```

**Проверь себя:** при roc_auc ≤ 0.85 выполняется ветка skip (deploy не запускается); при >0.85 — deploy.

**Разбор:** BranchPythonOperator превращает метрический порог в управление пайплайном: переобучение без улучшения не доезжает до деплоя. Полный цикл CT (23.1 Level 1→2).

---

*Следующая страница: [23.4 Сервинг и мониторинг моделей](04-serving-monitoring.md)*
