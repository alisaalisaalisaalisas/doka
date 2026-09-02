# 🔎 18. LogQL и пайплайны обработки логов

LogQL (Log Query Language) — это мощный язык запросов в Grafana Loki, сочетающий синтаксис селекторов потоков в стиле PromQL с конвейерной моделью фильтрации, парсинга и агрегации логов в числовые метрики.

---

## 🏛️ Пайплайн выполнения LogQL (Log Pipeline Stages)

Выполнение запроса LogQL происходит последовательно слева направо в виде конвейера преобразований.

```mermaid
graph LR
    subgraph S1["1. Stream Selector"]
        Raw["{app='api', env='prod'} (Поиск по TSDB индексу)"]
    end

    subgraph S2["2. Line Filters"]
        LF["|= 'error' != 'healthz' (Быстрый строковый grep)"]
    end

    subgraph S3["3. Parsers"]
        P["| json | logfmt | pattern | regexp (Извлечение полей)"]
    end

    subgraph S4["4. Label Filters"]
        LbF["| duration > 500ms and status >= 500"]
    end

    subgraph S5["5. Formatter / Metric Aggregation"]
        F["| line_format '...' ИЛИ rate(...[5m])"]
    end

    Raw --> LF --> P --> LbF --> F
```

---

## 📝 Селекторы, строковые фильтры и парсеры

### 1. Селекторы потоков (Stream Selectors)
Селекторы определяют, какие чанки логов будут прочитаны с диска/S3:
```logql
# Точное совпадение и регулярные выражения
{namespace="production", container=~"api-.*", env!="dev"}
```

### 2. Строковые фильтры (Line Filter Expressions)
Применяются до этапа парсинга, эффективно отсекая терабайты ненужных строк:
- `|= "string"` — строка **содержит** подстроку (case-sensitive).
- `!= "string"` — строка **не содержит** подстроку.
- `|~ "regex"` — совпадение по **регулярному выражению**.
- `!~ "regex"` — отрицание регулярного выражения.

### 3. Парсеры структурированных логов

#### А. JSON Parser (`| json`)
Автоматически извлекает все поля верхнего уровня в экстрагированные переменные или выборочные атрибуты:
```logql
# Извлечение только необходимых полей с переименованием
{app="checkout"} |= "payment_failed" | json status="response.code", err="error.message"
```

#### Б. Logfmt Parser (`| logfmt`)
Парсит формат ключ-значение (`ts=2026-09-02 level=info msg="user login" user_id=42`):
```logql
{app="auth"} | logfmt | level = "error" and user_id != ""
```

#### В. Pattern Parser (`| pattern`)
В разы быстрее регулярных выражений извлекает структурированные данные из логов фиксированного формата (например, стандартный Nginx / Apache):
```logql
# Парсинг Nginx access лога без Regex
{app="ingress-nginx"} | pattern `<remote_ip> - - [<_>] "<method> <path> <_>" <status> <bytes> <_> "<user_agent>" <request_time>`
```

#### Г. Regular Expression Parser (`| regexp`)
Используется для сложных кастомных форматов:
```logql
{app="legacy-app"} | regexp `^\[(?P<ts>.*?)\] (?P<level>[A-Z]+) (?P<msg>.*)$`
```

---

## 🎨 Форматирование вывода: `line_format` и `label_format`

```logql
# Преобразование громоздкого JSON в компактный читаемый лог
{app="payment-gateway"} 
| json 
| line_format "{{.timestamp}} [{{.level | ToUpper}}] {{.method}} {{.path}} -> {{.status}} ({{.duration_ms}}ms)"
```

---

## 📈 Метрики из логов (Log-Derived Metrics)

LogQL позволяет извлекать количественные метрики из неструктурированных логов в реальном времени без необходимости изменения кода приложения.

```mermaid
graph TD
    subgraph LogInput["Логи приложения"]
        L1["status=200 duration=0.04s"]
        L2["status=500 duration=1.25s"]
        L3["status=200 duration=0.12s"]
    end

    subgraph LogQLUnwrap["LogQL: | unwrap duration"]
        U["Извлечение числового float значения задержки"]
    end

    subgraph Aggregations["Метрические агрегации"]
        P99["quantile_over_time(0.99, ...[5m]) -> p99 Latency = 1.25s"]
        RPS["rate({app='api'}[1m]) -> 3 req/min"]
    end

    LogInput --> LogQLUnwrap
    LogQLUnwrap --> P99
    LogInput --> RPS
```

### 1. Подсчет частоты событий (`rate`, `count_over_time`)

```logql
# 1. RPS ошибок 5xx по эндпоинтам из Nginx логов
sum by (path) (
  rate({app="ingress-nginx"} | pattern `<_> - - [<_>] "<_> <path> <_>" <status> <_>` | status >= 500 [5m])
)

# 2. Объем переданного трафика в секунду (bytes_rate)
sum by (app) (
  bytes_rate({namespace="production"}[5m])
)
```

### 2. Числовой Unwrap и расчет квантилей (`quantile_over_time`)

```logql
# 99-й процентиль задержки обработки запросов (в секундах) из JSON логов
quantile_over_time(0.99,
  {app="billing-service"}
  | json
  | unwrap duration_seconds
  [5m]
) by (handler)
```

---

## ⚠️ Anti-Patterns кардинальности в Loki

```mermaid
graph TD
    subgraph BAD["❌ АНТИПАТТЕРН: Взрыв кардинальности"]
        B1["{app='api', request_id='a4f8-12', user_id='99812'}"]
        B2["Создает миллионы уникальных стримов в TSDB"]
        B3["Ingesters падают по OOM, падает весь кластер"]
        B1 --> B2 --> B3
    end

    subgraph GOOD["✅ ПРАВИЛЬНЫЙ ПОДХОД: Статические стримы + Парсинг"]
        G1["Селектор стрима: {app='api', env='prod'} (2-5 стримов)"]
        G2["Парсинг на лету: | json | request_id = 'a4f8-12'"]
        G3["Loki фильтрует миллионы строк за миллисекунды без OOM"]
        G1 --> G2 --> G3
    end
```

---

## 🛠️ Готовые продакшн LogQL рецепты

```logql
# 1. Топ-10 IP адресов с наибольшим количеством 401 Unauthorized запросов
topk(10,
  sum by (client_ip) (
    rate({app="api-gateway"} | json | status == 401 [10m])
  )
)

# 2. Поиск Stack Trace и Panic в Go приложениях
{env="prod"} |~ "(?i)panic: runtime error|goroutine [0-9]+ \\[running\\]"

# 3. Средний размер передаваемого Payload в килобайтах
avg_over_time(
  {app="file-service"}
  | json
  | unwrap body_bytes_sent
  [15m]
) / 1024
```

---

## 🔧 Диагностика и разрешение проблем (Troubleshooting)

### Сценарий 1: Ошибка "Query Processing Deadline Exceeded"
- **Симптом:** Длинный LogQL запрос за большой диапазон времени завершается с таймаутом.
- **Причина:** Широкий селектор `{namespace="prod"}` заставляет Loki читать все терабайты логов кластера.
- **Решение:**
  1. Добавьте строковый фильтр **перед** парсером: `{app="api"} |= "POST /checkout" | json | status >= 500`.
  2. Увеличьте `query_timeout` в `loki.yaml` и настройте `query_frontend.split_queries_by_interval: 30m`.

### Сценарий 2: Ошибка "Pipeline Error: JSON parsing failed"
- **Симптом:** При применении `| json` часть строк отбрасывается с пометкой `JSON parsing failed`.
- **Причина:** В поток попадают неструктурированные строки (например, логи запуска runtime или паники).
- **Решение:**
  Используйте строковый фильтр для предварительной валидации:
  ```logql
  {app="api"} |= "{" | json
  ```

---

## 🧠 Проверь себя

1. В каком порядке LogQL выполняет конвейер: строковые фильтры (`|=`), селекторы потоков или JSON-парсер?
2. Почему использование `| pattern` предпочтительнее `| regexp` при обработке сотен гигабайт логов в секунду?
3. Как с помощью выражения `| unwrap` вычислить медианное ($p50$) время ответа базы данных из текстовых логов?
4. Почему добавление `user_id` в лейблы селектора `{user_id="..."}` уничтожает производительность Loki?
5. Как с помощью `line_format` объединить несколько JSON-полей в одну форматированную строку?
