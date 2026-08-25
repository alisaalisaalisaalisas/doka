# 🏛️ 23.9 Model Governance: A/B, shadow, lineage, откат

> Цель: модели в проде управляются так же строго, как код: версионирование, постепенный rollout, аудит, откат за минуты.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация) · [2.3 Troubleshooting](#23-troubleshooting) · [2.5 Вопросы](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

**Governance** отвечает на вопросы регулятора/руководства: какая модель принимает решения? на каких данных обучена? кто и когда её выкатил? как откатить?

**Инструменты управления жизненным циклом:**

| Паттерн | Механизм | Риск |
| :--- | :--- | :--- |
| **Shadow** | новая модель считает параллельно, решения принимает старая | минимальный (только ресурсы) |
| **A/B тест** | трафик делится, сравниваются бизнес-метрики | средний (половина пользователей) |
| **Canary** | 5%→25%→100% с автопорогом ошибок | управляемый |
| **Blue-Green** | полная смена окружения одним переключателем | откат мгновенный, но «всё или ничего» |

**Lineage (происхождение):** модель ↔ run (MLflow) ↔ данные (DVC rev) ↔ код (git sha) ↔ образ (digest). Цепочка должна собираться автоматикой, а не «вспоминать по памяти».

**Approval-флоу:** Production-стейдж в MLflow Registry требует апрува (защищённая ветка/окружение в CI) — как деплой прод-инфры (см. [20.5](../20-senior-stack/05-registries-dependencies.md), [разд. 05](../05-gitops-and-cicd/01-gitops-argocd-flux.md)).

**Ключевые термины:** `model card` (паспорт модели: назначение, данные, метрики, ограничения), `champion/challenger` (текущая/претендент), `traffic mirroring` (копия трафика в тень), `rollback window` (сколько старых версий храним для отката).

---

### 2.2 Конфигурация

#### Canary через Argo Rollouts (модель как обычный сервис)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata: { name: model-api, namespace: ml }
spec:
  replicas: 4
  strategy:
    canary:
      steps:
        - setWeight: 5
        - pause: { duration: 10m }
        - analysis: { templates: [ { templateName: model-metrics } ] }   # проверка метрик
        - setWeight: 50
        - pause: { duration: 30m }
        - setWeight: 100
  selector: { matchLabels: { app: model-api } }
  template:
    spec:
      containers:
        - name: api
          image: registry.corp/ml/churn-api@sha256:DIGEST   # digest, не latest!
          env: [{ name: MODEL_VERSION, value: "churn@Production#2" }]
```

```yaml
# AnalysisTemplate: автооткат при деградации
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata: { name: model-metrics, namespace: ml }
spec:
  metrics:
    - name: error-rate
      interval: 1m
      failureLimit: 2
      successCondition: result[0] < 0.01
      provider:
        prometheus:
          address: http://prometheus.monitoring:9090
          query: |
            sum(rate(model_api_errors_total[2m])) / sum(rate(model_api_requests_total[2m]))
```

#### Model Card (паспорт) — шаблон в репозитории модели

```markdown
# Model Card: churn-classifier v3
- Назначение: прогноз оттока абонентов; решения: маркетинговые офферы (НЕ автоматические блокировки)
- Данные: train 2026-01..2026-06 (DVC rev abc123), 2.4M строк
- Метрики: roc_auc 0.91 (val), precision@k 0.78; fairness: disparity < 5% по полу/возрасту
- Ограничения: не валидна для корпоративных тарифов (нет в train)
- Владелец: @team-churn; Runbook: wiki/churn-runbook
- Rollback: MLflow stage Archived v2 → Production (runbook §3)
```

**Частые ошибки:** latest-тег вместо digest; Production-стейдж меняется без апрува/лога; нет model card; откат не репетировался; shadow-модель пишет в ту же таблицу решений, что и основная.

---

### 2.3 Troubleshooting

```bash
# Какая модель сейчас в проде? (три источника должны совпадать)
curl -s model-api:8000/info | jq '.model_version'          # сервис
curl -s "mlflow:5000/api/2.0/mlflow/model-versions/get-latest?name=churn&stages=Production" | jq '.model_versions[0].version'
kubectl -n ml get deploy model-api -o jsonpath='{.spec.template.spec.containers[0].image}'

# Откат: registry stage → рестарт → проверка
python -c "from mlflow.tracking import MlflowClient as C; C().transition_model_version_stage('churn','2','Production',archive_existing_versions=True)"
kubectl -n ml rollout restart deploy model-api
curl -s model-api:8000/info | jq '.model_version'          # v2 ✅

# Аудит: кто и когда менял stage (MLflow хранит историю)
curl -s "mlflow:5000/api/2.0/mlflow/model-versions/get?name=churn&version=3" | jq '.tags, .run_id'
```

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| «Какая модель в проде?» — три разных ответа | сервис/registry/манифест разъехались | источник правды = манифест+registry; сверять автоматикой |
| Откат занял 2 часа | старые веса не хранятся / не репетировали | retention в registry + drill отката |
| A/B «показал» победу за 1 день | мало трафика/времени — шум | заранее считать объём выборки; минимум 2 недели |
| Shadow-модель влияет на прод | пишет в общие таблицы / ест общий лимит API | отдельные таблицы/квоты, fire-and-forget |
| Регулятор спрашивает «почему отказ» | нет логов решений и model card | логировать входы/выходы/версию на каждое решение |

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: новая модель v3 в Production, через день метрики деградировали. Перечислите шаги отката за 10 минут.**

<details><summary>Ответ</summary>
1) MLflow: предыдущей версии вернуть Production (archive_existing_versions). 2) Рестарт/переключение сервиса (или GitOps-коммит версии). 3) Проверить /info и метрики. Возможно всё это одной командой runbook'а — если drill проводился заранее.
</details>

**В2. Найдите ошибку: деплой-манифест модели ссылается на `image: ml-api:latest`, а версия модели — env MODEL_NAME=churn@Production.**

<details><summary>Ответ</summary>
latest в образе ломает воспроизводимость отката (что там сейчас — неизвестно); версия модели по stage — ок, но образ обязан быть пином по digest. Итог: digest образа + версия модели из registry, оба зафиксированы в Git.
</details>

**В3. Чем shadow-деплой отличается от canary и какой выбрать при первом релизе радикально новой модели?**

<details><summary>Ответ</summary>
Shadow не влияет на решения (только собирает статистику) — нулевой пользовательский риск; canary отдаёт реальный трафик части пользователей. Радикально новая модель → сначала shadow (сравнить распределения предсказаний), затем canary с порогами.
</details>

**В4. Зачем model card, если все метрики и так в MLflow?**

<details><summary>Ответ</summary>
MLflow — технический lineage; model card — человеческий контракт: назначение, ограничения, недопустимые применения, fairness-оценки, владелец и runbook. Его читает бизнес/аудитор, а не только инженер.
</details>

**В5. Аудит-вопрос регулятора: «почему клиенту X отказано в кредите 12 марта?». Что должно существовать, чтобы ответить за 5 минут?**

<details><summary>Ответ</summary>
Prediction logging: запись решения (входы, версия модели, выход, порог) с retention; lineage версии модели (run → данные → код); model card с объяснением логики. Без лога решений вопрос неразрешим.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Сверка «три источника правды»

**Условие:** скрипт сверяет версию модели в сервисе, MLflow Registry и деплой-манифесте.

```bash
#!/usr/bin/env bash
set -euo pipefail
SVC=$(curl -s model-api:8000/info | jq -r .model_version)
REG=$(curl -s "http://mlflow:5000/api/2.0/mlflow/model-versions/get-latest?name=churn&stages=Production" | jq -r '.model_versions[0].version')
MAN=$(kubectl -n ml get deploy model-api -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="MODEL_VERSION")].value}')
echo "svc=$SVC registry=$REG manifest=$MAN"
[ "$SVC" = "$REG" ] && [ "$REG" = "$MAN" ] || { echo "DRIFT!"; exit 1; }
echo "IN SYNC"
```

**Проверь себя:** после промоушена в MLflow БЕЗ рестарта сервиса — скрипт ловит DRIFT; после rollout — IN SYNC.

**Разбор:** дрейф между источниками — типовой «тихий» инцидент MLOps. Сверка по расписанию (Pushgateway → алерт) закрывает вопрос «какая модель в проде» навсегда.

#### Задание 2: Model card + lineage-ссылки

**Условие:** оформить model_card.md для своей модели со ссылками на lineage.

```markdown
# Model Card: churn-classifier v3
- **Назначение:** прогноз оттока; решения — маркетинг (не блокировки)
- **Lineage:**
  - Код: git sha `a1b2c3d` (репо ml-churn)
  - Данные: DVC rev `def456` (data/raw/orders.csv, 2.4M строк)
  - Эксперимент: MLflow run `8f7a...` (roc_auc 0.91)
  - Образ: `registry.corp/ml/churn-api@sha256:9f2e...`
- **Ограничения:** не применять к корпоративным тарифам; retrain не чаще 1/нед
- **Rollback:** MLflow stage v2→Production + `kubectl rollout restart`
- **Владелец:** @team-churn, runbook: wiki/churn
```

**Проверь себя:** каждая ссылка кликабельна и открывает реальный артефакт (run в MLflow, DVC rev, digest в registry).

**Разбор:** model card без живых ссылок — мёртвый документ. Линк на run/данные/образ = доказуемый lineage, который и спрашивает аудитор.

#### Задание 3: Репетиция отката (drill)

**Условие:** откатить Production на предыдущую версию за ≤10 минут, по runbook.

```bash
# Шаг 0 (заранее): в registry минимум 2 версии; runbook написан; таймер запущен
# Шаг 1: stage предыдущей версии → Production
python -c "from mlflow.tracking import MlflowClient as C; C().transition_model_version_stage('churn','2','Production',archive_existing_versions=True)"
# Шаг 2: рестарт сервиса
kubectl -n ml rollout restart deploy model-api && kubectl -n ml rollout status deploy model-api
# Шаг 3: сверка трёх источников (Задание 1) + smoke /predict
./topology-check.sh && curl -s -X POST model-api:8000/predict -d '{...}'
# Шаг 4: зафиксировать фактическое время в runbook
```

**Проверь себя:** от «python -c ...» до зелёного smoke — ≤10 минут; версия в /info сменилась; drill повторён дважды.

**Разбор:** откат модели = stage-переключение + рестарт; но без drill'а всплывают «мелочи»: кэш сервиса, несовпадение схемы фич, отсутствие старых весов. Репетиция — единственный способ узнать RTO честно.

---

*Раздел: [23. MLOps — план и roadmap](00-plan.md)*
