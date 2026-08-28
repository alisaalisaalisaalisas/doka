# 🏪 23.5 Feature Store: Feast

> Цель: один код фич для обучения и продакшна — убить feature skew.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация) · [2.3 Troubleshooting](#23-troubleshooting) · [2.5 Вопросы](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

**Feature Store** решает две проблемы ML: (1) feature skew — фичи для обучения и инференса считаются разным кодом; (2) point-in-time correctness — при обучении «утечка будущего» (leakage), если фича посчитана по данным позже момента предсказания.

**Feast** — OSS feature store:
- **FeatureView** — декларация фичи: источник (parquet/BigQuery), сущность (entity: user_id), TTL.
- **Offline store** — исторические данные (обучение): point-in-time join `get_historical_features`.
- **Online store** — низколатентное хранилище (Redis/DynamoDB) для инференса: `get_online_features`.
- **Материализация** — перенос данных offline → online по расписанию.

| | Без feature store | С Feast |
| :--- | :--- | :--- |
| Обучение | SQL руками | `get_historical_features(entity_df)` — корректно по времени |
| Инференс | свой код в микросервисе | `get_online_features([...])` из Redis |
| Переиспользование | копипаста между командами | каталог фич с владельцем и описанием |

---

### 2.2 Конфигурация

```python
# feature_store.yaml — конфиг репозитория Feast
project: shop
registry: s3://mlflow-artifacts/feast-registry.db     # реестр в S3
provider: local                                        # или gcp/aws
online_store:
  type: redis
  connection_string: "redis:6379"
entity_key_serialization_version: 2
```

```python
# features.py — декларации
from feast import Entity, FeatureView, Field, FileSource
from feast.types import Float32, Int64

user = Entity(name="user_id", join_keys=["user_id"])

src = FileSource(path="data/processed/features.parquet",
                 timestamp_field="event_timestamp")

user_features = FeatureView(
    name="user_features",
    entities=[user],
    schema=[Field(name="tenure_months", dtype=Int64),
            Field(name="avg_charges", dtype=Float32)],
    source=src,
    ttl=timedelta(days=2),          # фича старше TTL = недоступна
)
```

```bash
feast apply                                   # зарегистрировать в registry
feast materialize-incremental $(date -u +%Y-%m-%dT%H:%M:%S)   # offline → online
```

```python
# Обучение: point-in-time join (без leakage!)
training_df = store.get_historical_features(
    entity_df=entity_df,                      # user_id + event_timestamp
    features=["user_features:tenure_months", "user_features:avg_charges"],
).to_df()

# Инференс: тот же код, online-стор
online = store.get_online_features(
    features=["user_features:tenure_months", "user_features:avg_charges"],
    entity_rows=[{"user_id": 42}],
).to_dict()
```

**Частые ошибки:** нет `event_timestamp` в источнике (point-in-time невозможен); TTL меньше частоты материализации → фичи «пропадают»; online-store не материализовали → `get_online_features` пустой.

---

### 2.3 Troubleshooting

```bash
feast apply                                    # применить изменения
feast registry-dump | head                     # что в registry
feast feature-views list                       # каталог фич
# Пустой online-ответ → материализация:
feast materialize-incremental $(date -u +%Y-%m-%dT%H:%M:%S)
# Расхождение offline vs online → сверить timestamp'ы и TTL
```

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| `FeastEntityError: missing entity` | entity_rows без join_key | добавить user_id в запрос |
| Данные в online старые | не запущена materialization | cron/airflow на materialize-incremental |
| Обучающие фичи «из будущего» | нет timestamp_field / entity_df без event_timestamp | point-in-time join обязателен |
| Redis растёт бесконечно | TTL не задан / нет очистки | ttl в FeatureView + чистка ключей |

---

### 2.5 Проверь себя — 5 вопросов

**В1. Что такое point-in-time correctness и какой вызов Feast её обеспечивает?**

<details><summary>Ответ</summary>
При обучении каждая строка получает значения фич «какими они были НА момент event_timestamp», а не последние — иначе утечка будущего. Обеспечивает get_historical_features (point-in-time join).
</details>

**В2. Найдите ошибку: get_online_features возвращает пустые значения для всех пользователей.**

<details><summary>Ответ</summary>
Online-store не материализован: данные лежат только в offline-источнике. Нужен feast materialize-incremental по расписанию.
</details>

**В3. Зачем FeatureView поле ttl?**

<details><summary>Ответ</summary>
TTL — срок годности фичи в online-сторе: значения старше TTL считаются протухшими и не отдаются. Защита от инференса на устаревших данных при сбое материализации.
</details>

**В4. Сценарий: DS добавил фичу в features.py и сделал feast apply, модель в проде её не видит. Почему?**

<details><summary>Ответ</summary>
Фича зарегистрирована, но не материализована в online-store и не включена в get_online_features запрос сервиса. Apply ≠ materialize: нужен шаг переноса + обновление списка фич в клиенте.
</details>

**В5. Когда feature store НЕ нужен?**

<details><summary>Ответ</summary>
Когда фичей мало, они простые (SQL-агрегаты) и считаются одним кодом в одном сервисе — оверхед Feast/инфраструктуры дороже выгоды. Feature store окупается при нескольких моделях/командах и online-инференсе.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Feast-репозиторий с Redis online-store

```bash
pip install "feast[redis]"
feast init shop && cd shop/feature_repo
# feature_store.yaml: online_store.type=redis, connection_string="redis:6379"
feast apply
feast feature-views list                        # user_features зарегистрирован ✅
```

**Проверь себя:** `feast apply` повторный — «no changes»; registry содержит user_features.

**Разбор:** Feast-репозиторий — код в Git (декларации фич), registry — скомпилированное состояние (в S3 для команды).

#### Задание 2: Материализация + online-чтение

```bash
feast materialize-incremental $(date -u +%Y-%m-%dT%H:%M:%S)
python -c "
from feast import FeatureStore
s = FeatureStore(repo_path='.')
r = s.get_online_features(['user_features:tenure_months'], [{'user_id': 1}]).to_dict()
print(r)"
# Ожидание: {'user_id': [1], 'tenure_months': [N]} ✅
```

**Проверь себя:** значения непустые; после materialize с новой датой значения обновились.

**Разбор:** материализация — «синк» offline→online. В проде это Airflow-джоб каждые N минут; мониторить свежесть (max event_timestamp в online).

#### Задание 3: Point-in-time join без утечки

```python
entity_df = pd.DataFrame({
    "user_id": [1, 2],
    "event_timestamp": [pd.Timestamp("2026-08-01"), pd.Timestamp("2026-08-10")],
})
train = store.get_historical_features(
    entity_df=entity_df,
    features=["user_features:avg_charges"]).to_df()
```

**Проверь себя:** для user с event 2026-08-01 значения avg_charges взяты из записи ДО этой даты, не последней.

**Разбор:** это и есть защита от leakage: модель обучается только на том, что «знала бы» в момент предсказания. Ручной SQL почти всегда даёт утечку.

---

*Далее: [23.6 GPU на Kubernetes](06-gpu-k8s.md)*


---

## 🗄️ Дополнение: Offline/Online stores, Materialization и BigQuery

### Point-in-time correctness

```python
# feature_store.yaml
project: shop
provider: gcp   # или local
online_store:
  type: redis
  connection_string: redis:6379
offline_store:
  type: bigquery  # вместо file — BigQuery/Snowflake/Redshift
  project_id: prod-bq
  dataset: feast
entity_key_serialization_version: 2

# feature_view.py
from feast import Entity, FeatureView, FileSource, BigQuerySource, Field
from feast.types import Float32, Int64
from datetime import timedelta

user = Entity(name="user", join_keys=["user_id"])
user_source = BigQuerySource(
  table="prod-bq.feast.user_features",
  timestamp_field="event_timestamp",
  created_timestamp_column="created",
)
user_view = FeatureView(
  name="user_features",
  entities=[user],
  ttl=timedelta(days=1),
  schema=[Field(name="avg_order", dtype=Float32), Field(name="orders_7d", dtype=Int64)],
  source=user_source,
  online=True,
)
```

```bash
feast materialize 2026-01-01T00:00:00 2026-08-28T00:00:00
feast materialize-incremental $(date -u +%Y-%m-%dT%H:%M:%S)
feast validate  # point-in-time join correctness check

# Online vs offline: same code
from feast import FeatureStore
store = FeatureStore(repo_path=".")
print(store.get_online_features(features=["user_features:avg_order"], entity_rows=[{"user_id": 42}]).to_dict())
print(store.get_historical_features(entity_df=orders_df, features=["user_features:avg_order"]).to_df().head())

# Freshness: check staleness
feast feature-view describe user_features | grep -A5 freshness
```
