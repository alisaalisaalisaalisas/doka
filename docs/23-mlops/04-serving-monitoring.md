# 🚀 23.4 Сервинг и мониторинг моделей

> Уровень: Middle→Senior. Цель: обернуть модель в сервис, выкатить как обычное приложение и не пропустить дрейф.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Паттерны сервинга

| Паттерн | Как | Когда |
| :--- | :--- | :--- |
| **Batch scoring** | Airflow/Spark: предсказания пачкой в таблицу | латентность не важна (скоринг ночью) |
| **Real-time API** | FastAPI/MLflow serve: HTTP-эндпоинт | онлайн-решения (fraud, recommend) |
| **Managed платформа** | KServe / Seldon на K8s | канарейки, autoscale по RPS, трансформеры |

**Упаковка модели:** сервис тянет веса из MLflow Registry (по stage) при старте; или образ собирается с весами внутри (immutable, но рестарт при каждой модели). Компромисс: образ без весов + версия модели как env/аргумент.

**ONNX** — переносимый формат графа: обучили в sklearn/pytorch → экспорт в ONNX → инференс на runtime без Python-стека (быстрее, меньше образ).

#### Мониторинг ML: три слоя

1. **Сервисный** (обычный DevOps): RPS, latency, ошибки, память — Prometheus.
2. **Data drift**: распределение входных фич уплыло от train (PSI, KS-тест) — Evidently по расписанию.
3. **Concept drift / качество**: метрики на свежей размеченной выборке или прокси (доля отменённых решений, конверсия) — бизнес-метрики.

**Evidently** генерирует drift-отчёт сравнением двух выборок: `reference` (train) vs `current` (прод-логи фич). Отчёт — артефакт CI/расписания; порог PSI > 0.2 → алерт → триггер переобучения (см. CT в [23.1](01-intro-lifecycle.md)).

**Ключевые термины:** `feature skew` (train≠serving код фич), `prediction logging` (логирование входов+выходов для мониторинга), `shadow deploy` (новая модель считает «в тень», решения принимает старая), `canary` (5% трафика новой модели).

---

### 2.2 Конфигурация и синтаксис

#### FastAPI-обёртка модели (продакшн-минимум)

```python
# src/serve.py
import os, mlflow
from fastapi import FastAPI
from pydantic import BaseModel

MLFLOW_URI = os.environ["MLFLOW_TRACKING_URI"]
MODEL_NAME = os.environ["MODEL_NAME", "churn-classifier"]

app = FastAPI()
model = None

@app.on_event("startup")
def load():
    global model
    mlflow.set_tracking_uri(MLFLOW_URI)
    model = mlflow.pyfunc.load_model(f"models:/{MODEL_NAME}/Production")

class Features(BaseModel):
    tenure_months: int
    monthly_charges: float

@app.get("/healthz")
def health(): return {"status": "ok"}

@app.post("/predict")
def predict(f: Features):
    pred = float(model.predict([[f.tenure_months, f.monthly_charges]])[0])
    return {"churn_probability": pred, "model": MODEL_NAME}
```

```dockerfile
# Dockerfile: образ без весов, версия — из registry при старте
FROM python:3.11-slim
WORKDIR /app
COPY requirements-serve.txt .
RUN pip install --no-cache-dir -r requirements-serve.txt
COPY src/serve.py src/
EXPOSE 8000
CMD ["uvicorn", "src.serve:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# k8s: Deployment + probes; версия модели — env
env:
  - { name: MLFLOW_TRACKING_URI, value: http://mlflow:5000 }
  - { name: MODEL_NAME, value: churn-classifier }
readinessProbe: { httpGet: { path: /healthz, port: 8000 } }
```

#### Evidently: drift-отчёт по расписанию

```python
# src/drift_report.py
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset
import pandas as pd

ref = pd.read_parquet("data/processed/reference.parquet")   # train-выборка
cur = pd.read_parquet("logs/current_features.parquet")      # прод-логи фич

report = Report(metrics=[DataDriftPreset(stattest="psi")])
report.run(reference_data=ref, current_data=cur)
report.save_html("reports/drift.html")
result = report.as_dict()
drifted = sum(1 for c in result["metrics"] if c["result"]["drift_share"] > 0.2)
raise SystemExit(1 if drifted > len(result["metrics"]) * 0.3 else 0)   # гейт
```

**Частые ошибки:** модель грузится при каждом запросе (грузить на startup); логирование предсказаний выключено → мониторить дрейф нечем; пороги drift «на глаз» без baseline; FastAPI без `workers`/лимитов → GIL-бутылочное горлышко.

---

### 2.3 Troubleshooting

```bash
# Сервис модели жив?
curl -s localhost:8000/healthz
curl -s -X POST localhost:8000/predict -H 'Content-Type: application/json' \
  -d '{"tenure_months": 12, "monthly_charges": 70.0}'

# Какая модель реально загружена? (лог старта + endpoint)
kubectl -n ml logs deploy/model-api | grep -i "loaded model"

# OOM при загрузке большой модели
kubectl -n ml describe pod model-api | grep -A3 "Last State"   # OOMKilled?
#   → limits.memory = размер модели × 3 (веса + десериализация + запас)

# Дрейф: отчёт упал или порог превышен?
python src/drift_report.py; echo "exit=$?"
ls -la reports/drift.html
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Метрики качества упали, сервис зелёный | data/concept drift — мониторинг только сервисный | Evidently по расписанию + алерты |
| Предсказания «странные» после релиза | feature skew (другой код фич) | логировать фичи в проде, сравнить с train |
| Pod OOMKilled при старте | веса + десериализация > лимит | поднять лимиты; ленивая загрузка |
| p99 растёт под нагрузкой | Python-инференс в одном процессе | uvicorn workers, ONNX/batch inference, KServe autoscale |
| Модель «не поменялась» после промоушена | сервис кэширует модель на startup | рестарт деплоя или hot-reload по версии registry |

---

### 2.4 Интеграция со стеком

- **MLflow Registry (23.2):** сервис грузит `models:/name/Production`; промоушен + рестарт = деплой новой модели.
- **GitOps:** Deployment/Ingress/HPA модели — в Git; смена версии модели — env-переменная или отдельный коммит (см. [разд. 05](../05-gitops-and-cicd/01-gitops-argocd-flux.md)).
- **Observability (разд. 09):** `prometheus-fastapi-instrumentator` → RPS/latency в Grafana; алерты: p99 > SLO, доля ошибок, drift-гейт упал.
- **Kyverno/секреты (20.x):** MLFLOW_TRACKING_URI и креды — через ESO; образ подписан (cosign) — supply chain как у обычных сервисов.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: модель в Production, сервис зелёный, но бизнес-метрика (конверсия) упала за 2 недели. Какие три слоя мониторинга проверить и в каком порядке?**

<details><summary>Ответ</summary>
1) Сервисный (латентность/ошибки — исключить техническое). 2) Data drift по логам фич (Evidently: входы уплыли?). 3) Concept drift/качество на свежей разметке или прокси-метриках. Порядок от дешёвого к дорогому.
</details>

**В2. Найдите ошибку: FastAPI грузит модель внутри функции predict при каждом запросе.**

<details><summary>Ответ</summary>
Загрузка модели (десериализация весов) на каждый запрос = сотни миллисекунд и мусор в памяти. Модель грузится один раз на startup; predict — только инференс.
</details>

**В3. Почему «образ с весами внутри» и «образ + веса из Registry» — оба валидных подхода, и когда какой?**

<details><summary>Ответ</summary>
Образ с весами — immutable-артефакт, максимум воспроизводимости, но пересборка образа на каждую модель. Веса из Registry при старте — один образ на много версий, смена модели = env/рестарт. Первый — строгий комплаенс; второй — частые переобучения.
</details>

**В4. Зачем prediction logging, если есть логи приложения?**

<details><summary>Ответ</summary>
Для дрейфа нужны именно входные фичи и выходы модели в структурированном виде (чтобы сравнить распределение с train). Общие текстовые логи для этого непригодны. Prediction logging — сырьё для Evidently/переобучения.
</details>

**В5. KServe vs «свой FastAPI»: назовите решающий фактор в пользу KServe.**

<details><summary>Ответ</summary>
Нужны платформенные фичи из коробки: canary/traffic-split по ревизиям, autoscale-to-zero, стандартные пред/пост-процессоры (трансформеры), мульти-модельный endpoint. Если модель одна и паттерн простой — FastAPI дешевле в эксплуатации.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: FastAPI-сервис модели + probes

**Условие:** обернуть модель из MLflow (23.2) в сервис с /healthz и /predict.

```bash
# Шаг 1: код serve.py — из 2.2; локальный запуск
pip install fastapi uvicorn mlflow scikit-learn
MLFLOW_TRACKING_URI=http://localhost:5000 MODEL_NAME=churn-classifier \
  uvicorn src.serve:app --port 8000 &

# Шаг 2: проверка
curl -s localhost:8000/healthz                       # {"status":"ok"}
curl -s -X POST localhost:8000/predict -H 'Content-Type: application/json' \
  -d '{"tenure_months": 24, "monthly_charges": 85.0}'
# Ожидание: {"churn_probability": 0.73, "model": "churn-classifier"} ✅

# Шаг 3: образ + k8s-манифест (Deployment с probes и env из 2.2)
docker build -t registry.corp/ml/churn-api:1.0.0 .
kubectl -n ml apply -f k8s/deployment.yaml
kubectl -n ml rollout status deploy/model-api
```

**Проверь себя:** `kubectl -n ml get pod -l app=model-api` — Ready 1/1 (readiness по /healthz); POST /predict через Service возвращает вероятность; при остановленном MLflow уже запущенный сервис продолжает отвечать (модель в памяти).

**Разбор:** модель грузится на startup — сервис жив даже при недоступности MLflow (но новая версия не подхватится: рестарт после промоушена). Probes — стандартные, как у любого сервиса (разд. 04).

#### Задание 2: Evidently — drift-гейт в CI

```bash
# Шаг 0: подготовить reference (train) и current (прод-логи) parquet'ы
pip install evidently pandas

# Шаг 1: скрипт drift_report.py из 2.2 (гейт: >30% фич с drift_share>0.2 → exit 1)
python src/drift_report.py; echo "exit=$?"
# Ожидание: reports/drift.html создан; exit 0 при малом дрейфе

# Шаг 2: смоделировать дрейф — подменить current выборку сдвинутым распределением
python -c "
import pandas as pd
df = pd.read_parquet('logs/current_features.parquet')
df['monthly_charges'] = df['monthly_charges'] * 3   # сдвиг
df.to_parquet('logs/current_features.parquet')"
python src/drift_report.py; echo "exit=$?"
# Ожидание: exit 1 → CI-гейт красный → триггер переобучения (CT из 23.1) ✅
```

**Проверь себя:** в drift.html столбцы с drift_share>0.2 подсвечены; exit-код меняется при искусственном дрейфе.

**Разбор:** drift-отчёт — это тест, как unit-тест, только над данными. Гейт в CI/расписании замыкает цикл CT: дрейф → переобучение → гейт метрики (23.2) → деплой.

#### Задание 3: Shadow-деплой новой версии без риска

**Условие:** новая модель v2 должна считать «в тень»: решения принимает v1, но предсказания v2 логируются для сравнения.

```yaml
# k8s: второй Deployment (shadow) с той же моделью v2, БЕЗ Service
metadata: { name: model-api-shadow }
spec:
  template:
    metadata:
      labels: { app: model-api, role: shadow }
    spec:
      containers:
        - name: api
          env: [{ name: MODEL_VERSION, value: "2" }]
```

```bash
kubectl -n ml apply -f k8s/shadow.yaml
# Приложение дублирует запросы в shadow через отдельный endpoint (fire-and-forget):
kubectl -n ml exec deploy/web -- sh -c '
  curl -s -X POST model-api:8000/predict -d "{...}" &   # v1 — основной
  curl -s -m1 -X POST model-api-shadow:8000/predict -d "{...}" || true'  # v2 в тень
# Сравнение распределений предсказаний v1 vs v2 — Evidently по логам
```

**Проверь себя:** ошибки/латентность shadow не влияют на пользователей (fire-and-forget, таймаут 1с); в логах обоих сервисов накапливаются предсказания для сравнения; переключение трафика на v2 — отдельное осознанное действие (GitOps-коммит).

**Разбор:** shadow-деплой — безопасный способ получить прод-статистику новой модели до того, как она начнёт принимать решения. Следующие ступени: canary 5% (KServe/Argo Rollouts, см. [20.5](../20-senior-stack/05-registries-dependencies.md) и [разд. 05](../05-gitops-and-cicd/02-cicd-pipelines-patterns.md)).

---

*Далее: [План развития раздела MLOps](00-plan.md) · [Senior Stack](../20-senior-stack/00-senior-stack-summary.md)*
