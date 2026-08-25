# ⚙️ 23.7 Kubeflow Pipelines: deep dive

> Цель: ML-пайплайн как код — шаги-контейнеры, артефакты, кэш, эксперименты. Уровень Level 2 зрелости.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация) · [2.3 Troubleshooting](#23-troubleshooting) · [2.5 Вопросы](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

**Kubeflow Pipelines (KFP)** — оркестратор ML-пайплайнов поверх Kubernetes. Пайплайн = граф шагов; **каждый шаг — отдельный Pod/контейнер**.

**Архитектура исполнения:**

```text
Compile (Python → YAML-спека Argo Workflows)
  → ML Metadata (реестр артефактов и исполнений)
  → Argo Workflows (исполняет шаги как Pod'ы)
  → Артефакты в MinIO/S3 (модели, метрики, отчёты)
  → UI (линии графа, логи, сравнение запусков)
```

**Ключевые понятия KFP v2:**
- `@dsl.component` — функция → контейнер (код упаковывается автоматически);
- `@dsl.pipeline` — граф из шагов;
- `Output[Artifact]` / `Input[Artifact]` — типизированные артефакты между шагами (модель, датасет, метрики);
- **Кэширование шагов** — шаг с теми же входами не перезапускается;
- `dsl.ParallelFor` — fan-out (гиперпараметры по сетке).

**vs Airflow (см. [23.3](03-data-pipelines.md)):** Airflow — шаги-процессы на воркерах, силён в ETL/расписаниях; KFP — каждый шаг контейнер с артефактами в K8s, силён в ML-экспериментах и масштабировании. Часто: Airflow триггерит KFP-пайплайн.

---

### 2.2 Конфигурация

```python
# pipeline.py — prepare → train → evaluate → condition
from kfp import dsl, compiler

@dsl.component(base_image="python:3.11-slim", packages_to_install=["pandas"])
def prepare(data_path: str) -> str:
    import pandas as pd
    df = pd.read_csv(data_path)
    # ... подготовка ...
    out = "/tmp/dataset.parquet"
    df.to_parquet(out)
    return out                      # small outputs можно строкой

@dsl.component(base_image="python:3.11-slim",
               packages_to_install=["scikit-learn", "joblib"])
def train(dataset: dsl.Input[dsl.Dataset]) -> dsl.Output[dsl.Model]:
    import joblib, pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    df = pd.read_parquet(dataset.path)
    X, y = df.drop("y", axis=1), df["y"]
    model = RandomForestClassifier(n_estimators=200).fit(X, y)
    joblib.dump(model, model.path)          # артефакт модели

@dsl.component
def evaluate(dataset: dsl.Input[dsl.Dataset],
             model: dsl.Input[dsl.Model]) -> float:
    import joblib, pandas as pd
    df = pd.read_parquet(dataset.path)
    acc = (joblib.load(model.path).predict(df.drop("y", axis=1)) == df["y"]).mean()
    return float(acc)

@dsl.pipeline(name="churn-training")
def pipeline(data_path: str, threshold: float = 0.85):
    ds = prepare(data_path=data_path).output
    model = train(dataset=ds).output
    acc = evaluate(dataset=ds, model=model).output

    with dsl.Condition(acc >= threshold):        # гейт: ниже порога — стоп
        dsl.ContainerOp(...)                     # например, register-шаг

compiler.Compiler().compile(pipeline_func=pipeline,
                            package_path="pipeline.yaml")
```

```bash
# Загрузка и запуск (UI → Upload pipeline → Run)
kfp pipeline upload -p churn pipeline.yaml
kfp run create -e default -r run1 -p churn
# Или из Python: kfp.Client().create_run_from_pipeline_func(pipeline, arguments={...})
```

**Частые ошибки:** шаг возвращает большой DataFrame строкой (лимит!) — используйте артефакты; забытые `packages_to_install` → ImportError в шаге; артефакт пишется не в `artifact.path` → шаг не передаст данные; кэш шага «сработал» при изменившихся данных (вход не объявлен как Input).

---

### 2.3 Troubleshooting

```bash
kubectl -n kubeflow get pods | grep churn     # шаги = поды
kubectl -n kubeflow logs <step-pod> --tail=20 # лог конкретного шага
kfp run list -e default
kfp run describe run1                          # статус, артефакты, ошибки

# Кэш: почему шаг переисполнился/не переисполнился?
#   UI → шаг → Execution Details → cached execution id

# MinIO: артефакты на месте?
mc ls local/ml-pipeline | head
```

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Шаг ImagePullBackOff | образ недоступен из кластера | пушить в доступный registry |
| `ImportError` внутри шага | нет пакета в base_image | packages_to_install или свой образ |
| Output артефакт пустой | писали не в artifact.path | писать строго в model.path/dataset.path |
| Шаг всегда из кэша | вход не объявлен / данные вне deps | объявить Input, включить данные в deps |
| OOM на шаге train | лимит пода по умолчанию | `@dsl.component(..., memory_limit="16G", cpu_limit="4")` |

---

### 2.5 Проверь себя — 5 вопросов

**В1. Чем шаг KFP принципиально отличается от task в Airflow?**

<details><summary>Ответ</summary>
Шаг KFP — отдельный контейнер-под с типизированными артефактами (ML Metadata), изоляцией и кэшем по входам. Airflow-таск — процесс на воркере с XCom (маленькие payload'ы) без артефактной модели.
</details>

**В2. Найдите ошибку: шаг train возвращает DataFrame через return, следующий шаг получает пустоту.**

<details><summary>Ответ</summary>
Большие данные нельзя возвращать строкой (лимит метаданных) — нужен Output[Dataset]: писать в artifact.path и объявлять Input[Dataset] у потребителя.
</details>

**В3. Как работает кэширование шагов KFP и когда оно опасно?**

<details><summary>Ответ</summary>
KFP хеширует спецификацию шага (образ, команда, входы): совпало — берёт прошлый результат. Опасно, когда вход не объявлен (внешние данные изменились, а хеш тот же) — отключать кэш для недетерминированных шагов или объявлять все входы.
</details>

**В4. Сценарий: шаг evaluate упал с OOM на датасете 20GB. Варианты решения?**

<details><summary>Ответ</summary>
Поднять ресурсы шага (memory_limit), читать данные чанками/выборочно, или вынести evaluate в Spark/DuckDB-шаг. Также проверить, что не грузите весь датасет ради метрики — считайте по батчам.
</details>

**В5. Зачем Condition в пайплайне и чем это отличается от гейта в CI (23.2)?**

<details><summary>Ответ</summary>
Condition в KFP — ветвление графа по значению (метрика < порога → не деплоим): гейт внутри ML-пайплайна ДО регистрации. Гейт в CI (MLflow-метрика vs Production) — второй рубеж перед промоушеном. Defense in depth.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Пайплайн из 3 шагов с артефактами

```bash
# Установка (lightweight: только KFP SDK + standalone-бэкенд или полный Kubeflow)
pip install kfp
# Компиляция и загрузка в ваш инстанс (kind: kubeflow или standalone KFP):
python -c "
from pipeline import pipeline
from kfp import compiler
compiler.Compiler().compile(pipeline, 'pipeline.yaml')"
# UI → Pipelines → Upload → Run с data_path=/data/orders.csv
```

**Проверь себя:** в UI граф prepare→train→evaluate зелёный; у train виден артефакт модели (скачивается из MinIO); evaluate показал метрику.

**Разбор:** каждый шаг — под; артефакты передаются через ML Metadata + MinIO. Изменили prepare → train/evaluate перезапустятся, prepare закэшируется при повторе без изменений.

#### Задание 2: ParallelFor — сетка гиперпараметров

```python
@dsl.pipeline(name="grid")
def grid_pipeline(data_path: str):
    with dsl.ParallelFor([50, 100, 200]):
        train(dataset=..., )     # три параллельных train с разными n_estimators
# Сравнение метрик в UI → выбрать лучшую (или добавить шаг select-best)
```

**Проверь себя:** в UI три параллельные ветки train; метрики сравнимы в Run Overview.

**Разбор:** fan-out по сетке параметров — базовый AutoML-паттерн; артефакты каждой ветки изолированы, сравнение — в UI/ML Metadata.

#### Задание 3: Условие-гейт по метрике

```python
with dsl.Condition(acc.output >= 0.85):
    register(model=model)        # шаг регистрации в MLflow/registry
```

**Проверь себя:** при acc<0.85 шаг register помечается Skipped; при >=0.85 выполняется.

**Разбор:** гейт внутри пайплайна + гейт в CI (23.2) + drift-мониторинг (23.4) = полный контур CT из 23.1 Level 2.

---

*Далее: [23.8 LLMOps и RAG](08-llmops-rag.md)*
