# 📨 20.6 Message Brokers: RabbitMQ и NATS

> Уровень: Middle→Senior. Kafka уже разобран в [11.2](../11-data-and-storage/02-kafka-and-strimzi.md); здесь — когда брать RabbitMQ/NATS вместо него, и как их эксплуатировать.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### RabbitMQ: модель маршрутизации

**AMQP 0-9-1:** продюсер **никогда не пишет в очередь напрямую**. Он публикует в **exchange**, а очереди получают сообщения через **bindings** по **routing key**:

```text
Producer → Exchange → [binding: routing key] → Queue → Consumer
```

| Exchange | Логика | Пример |
| :--- | :--- | :--- |
| `direct` | точное совпадение routing key | `order.paid` → очередь биллинга |
| `topic` | маски: `order.*.paid`, `#` = всё | события домена по иерархии |
| `fanout` | всем очередям без разбора | broadcast инвалидации кэшей |
| `headers` | по заголовкам сообщения | редкие случаи |

**Критичные концепции продакшена:**

- **Quorum queues** — реплицируемые очереди на Raft (замена deprecated mirrored). Classic queues — только для non-critical.
- **Dead Letter Exchange (DLX)** — куда попадают отклонённые (`basic.reject`) и протухшие (TTL) сообщения. Без DLX «ядовитые» сообщения убивают консьюмер бесконечным retry.
- **Prefetch (basic.qos)** — сколько unacked сообщений консьюмер может держать. `prefetch=∞` = один медленный консьюмер забирает всё; `prefetch=1` — медленно. Типично 10-100.
- **Alarms**: при исчерпании памяти/диска брокер **блокирует публикаторов** (connection blocked) — «тихая» деградация, которую надо мониторить.
- **Vhost** — изоляция (мульти-аренда): свои очереди, exchange'и, права.

#### NATS: лёгкий messaging-backbone

**Core NATS** — fire-and-forget pub/sub + request/reply по **subject'ам** (`orders.created.eu`), wildcard'ы: `*` = один токен, `>` = хвост. Без персистентности — максимум производительность.

**JetStream** — надстройка персистентности: **Stream** (хранение по subject'ам, retention: `limits`/`interest`/`workqueue`) + **Consumer** (push/pull, ack политики, exactly-once через dedup window).

**Сравнение трёх брокеров:**

| | **Kafka** | **RabbitMQ** | **NATS/JetStream** |
| :--- | :--- | :--- | :--- |
| Модель | распределённый лог, партиции | умная маршрутизация в очереди | subjects, RPC, лёгкий стриминг |
| Replay истории | ✅ (offset) | ❌ (сообщение удаляется после ack) | ✅ (JetStream) |
| Сложные маршруты | нет (только партиции) | ✅ (exchange/bindings) | ограничено (subject-маски) |
| Порядок | в партиции | в очереди (FIFO с оговорками) | по subject (JetStream) |
| Ресурсы | тяжёлый (JVM, ZooKeeper/KRaft) | средний (Erlang) | минимальные (Go, ~15MB RAM) |
| Когда выбирать | event streaming, аналитика, высокая пропускная | task-очереди, сложная маршрутизация, RPC-задержки | инфраструктурные события, IoT, edge, микросервисный RPC |

---

### 2.2 Конфигурация и синтаксис

#### RabbitMQ: production definitions.json

RabbitMQ импортирует топологию (vhosts, users, exchanges, queues, bindings, policies) из JSON — версионируйте его в Git:

```json
{
  "vhosts": [{ "name": "shop" }],
  "users": [
    { "name": "app", "password_hash": "...", "hashing_algorithm": "rabbit_password_hashing_sha256",
      "tags": "", "permissions": [{ "vhost": "shop", "configure": "orders.*",
      "write": "orders.*", "read": "orders.*" }] }
  ],
  "policies": [
    {
      "vhost": "shop", "name": "quorum-default", "pattern": "^orders\\.",
      "apply-to": "queues", "definition": { "queue-mode": "quorum" }
    }
  ],
  "exchanges": [
    { "vhost": "shop", "name": "orders.events", "type": "topic", "durable": true }
  ],
  "queues": [
    { "vhost": "shop", "name": "orders.billing", "durable": true,
      "arguments": {
        "x-queue-type": "quorum",
        "x-dead-letter-exchange": "orders.dlx",
        "x-message-ttl": 86400000
      } }
  ],
  "bindings": [
    { "vhost": "shop", "source": "orders.events", "destination": "orders.billing",
      "destination_type": "queue", "routing_key": "order.paid.#" }
  ]
}
```

```bash
# Применение топологии (idempotent import)
rabbitmqadmin import definitions.json   # или через management API
```

#### NATS: JetStream stream + consumer (CLI и конфиг)

```bash
# Создание stream (декларация сохраняется в сервере)
nats stream add ORDERS \
  --subjects "orders.>" \
  --storage file --retention limits --max-age 72h \
  --replicas 3 --discard old --max-msgs -1

# Pull-консьюмер для воркеров
nats consumer add ORDERS BILLING \
  --pull --ack explicit --max-deliver 5 \
  --ack-wait 30s --deliver all \
  --dlq   # DLQ для ядовитых сообщений после max-deliver

# Проверка
nats stream info ORDERS
nats consumer info ORDERS BILLING
```

```yaml
# Helm values: rabbitmq cluster operator (K8s-native)
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata: { name: shop-rabbit }
spec:
  replicas: 3
  resources: { requests: { cpu: "1", memory: 2Gi }, limits: { memory: 4Gi } }
  rabbitmq:
    additionalPlugins: [rabbitmq_prometheus, rabbitmq_management]
    additionalConfig: |
      vm_memory_high_watermark.relative = 0.6     # alarm при 60% RAM
      disk_free_limit.absolute = 2GB              # alarm при <2GB диска
      consumer_timeout = 1800000                  # 30 мин max на ack
  persistence: { storageClassName: fast-ssd, storage: 50Gi }
```

**Частые ошибки конфигурации:**
1. Очередь без DLX + `max-deliver` → бесконечный redeliver ядовитого сообщения, консьюмер крутится впустую.
2. `prefetch` не настроен (unlimited) → один консьюмер держит 100k unacked, память брокера растёт.
3. RabbitMQ: `inequivalent arg 'x-queue-type'` при redeploy — попытка сменить аргументы существующей очереди (надо удалить/переименовать очередь).
4. NATS: retention `interest` без активных консьюмеров → сообщения выбрасываются мгновенно.
5. Нет `consumer_timeout` → долгая обработка > 30 мин по умолчанию → канал закрыт брокером, сообщения requeued.

---

### 2.3 Troubleshooting

```bash
# === RabbitMQ ===
rabbitmqctl cluster_status                     # кворум, партиционирование сети!
rabbitmq-diagnostics check_running && rabbitmq-diagnostics check_virtual_hosts
rabbitmqctl list_queues name type messages_ready messages_unacknowledged consumers
#   messages_unacknowledged растёт → консьюмер висит/медленный
rabbitmqctl list_connections name state channels | head
#   state=blocked → сработал memory/disk ALARM, публикаторы заблокированы
rabbitmqctl list_channel_statistics | head     # или management API

# Сетевое партиционирование (Erlang) — классика кластера RabbitMQ:
rabbitmq-diagnostics cluster_status | grep -A5 Partitions
#   Partitions: [node2] → требуется стратегия pause_minority и рестарт меньшинства

# === NATS ===
nats stream info ORDERS          # Msgs, Bytes, First/Last Seq, кластер-статус
nats consumer info ORDERS BILLING
#   Num Pending / Ack Floor: лаг консьюмеров
nats server list && nats server report jetstream   # использование диска по аккаунтам
curl -s localhost:8222/connz | jq '.connections[:3]'   # активные соединения
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Паблишеры «зависли», ошибки нет | memory/disk alarm → connection blocked | `rabbitmqctl list_connections` (state=blocked); чистить/масштабировать |
| Очередь растёт, консьюмер жив | обработка медленнее притока / prefetch=1 | метрики времени обработки, поднять prefetch, масштабировать консьюмеров |
| `PRECONDITION_FAILED - inequivalent arg` | смена аргументов существующей очереди | новая очередь (blue/green) или удалить старую |
| Сообщения «исчезли» без консьюмера | TTL истёк → ушли в DLX | проверить DLX-очередь, это фича |
| NATS: `no responders` | нет подписчиков на subject (core NATS) | проверить subject/queue group, JetStream для персистентности |
| RabbitMQ: узлы «не видят» друг друга | Erlang cookie / порты 4369, 25672 закрыты | firewall + один cookie на кластер |

---

### 2.4 Интеграция со стеком

- **Prometheus:** плагин `rabbitmq_prometheus` (порт 15692) — очереди, алармы, кворум; NATS — `/metrics` на 8222. Алерты: `messages_unacknowledged > N`, `blocked_connections > 0`, JetStream `pending > threshold`.
- **K8s:** RabbitMQ Cluster Operator / NATS Operator или helm; StatefulSet + headless service; PodDisruptionBudget обязателен (кворум!).
- **Приложения:** retry с exponential backoff + DLX/DLQ; idempotent-консьюмеры (at-least-once гарантия у обоих брокеров).
- **Vault:** креды брокера через ESO (20.3), динамические пользователи RabbitMQ через Vault secrets engine.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: продюсер не получает ошибок, но сообщения не доходят до очереди. Где искать?**

<details><summary>Ответ</summary>
Соединение заблокировано alarm'ом (memory/disk) — RabbitMQ блокирует публикаторов без разрыва соединения. Проверить `rabbitmqctl list_connections` (state=blocked) и сработавшие алармы.
</details>

**В2. Найдите ошибку: очередь создали с `"x-queue-type": "classic"`, в новом релизе манифеста поменяли на `"quorum"` — деплой топологии падает.**

<details><summary>Ответ</summary>
Аргументы существующей очереди неизменяемы: брокер отвечает PRECONDITION_FAILED inequivalent arg. Нужна новая очередь (другое имя или blue-green) с переносом потребителей, старую — слить и удалить.
</details>

**В3. Почему в NATS Core (без JetStream) подписчик, подключившийся после публикации, не получит сообщение?**

<details><summary>Ответ</summary>
Core NATS — at-most-once без хранения: сообщение доставляется только текущим подписчикам. Для персистентности и replay нужен JetStream stream с retention limits/interest.
</details>

**В4. Что означает растущий `messages_unacknowledged` при живом консьюмере и как prefetch влияет на это?**

<details><summary>Ответ</summary>
Консьюмер забрал сообщения, но не шлёт ack — обработка висит или слишком медленная. С prefetch=unlimited он заберёт всё подряд, усугубляя; ограниченный prefetch создаёт backpressure — брокер перестаёт отдавать новые, пока не ack'нуты старые.
</details>

**В5. Задача: «переслать все события заказов в новую очередь аналитики, включая историю за неделю». RabbitMQ или Kafka/JetStream — и почему?**

<details><summary>Ответ</summary>
RabbitMQ не хранит историю (сообщение удаляется после ack) — не подходит. Kafka или NATS JetStream хранят лог сообщений: новая очередь-консьюмер прочитает с начала ретеншена (offset/deliver all).
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: RabbitMQ в docker с DLX и проверкой маршрутизации

**Условие:** поднять брокер, создать topic-exchange `orders.events`, очередь `orders.billing` с DLX, проверить маршрутизацию и dead-lettering.

**Шаг 1** — старт и топология (стартовое состояние — чистый брокер):

```bash
docker run -d --name rmq -p 5672:5672 -p 15672:15672 rabbitmq:3.13-management
sleep 10
docker exec rmq rabbitmqctl add_vhost shop
docker exec rmq rabbitmqctl set_permissions -p shop guest ".*" ".*" ".*"

docker exec rmq rabbitmqadmin -V shop declare exchange name=orders.events type=topic
docker exec rmq rabbitmqadmin -V shop declare exchange name=orders.dlx type=fanout
docker exec rmq rabbitmqadmin -V shop declare queue name=orders.billing \
  arguments='{"x-queue-type":"quorum","x-dead-letter-exchange":"orders.dlx","x-message-ttl":60000}'
docker exec rmq rabbitmqadmin -V shop declare queue name=orders.dead
docker exec rmq rabbitmqadmin -V shop declare binding source=orders.events \
  destination=orders.billing routing_key="order.paid.#"
docker exec rmq rabbitmqadmin -V shop declare binding source=orders.dlx \
  destination=orders.dead routing_key=""
```

**Шаг 2** — публикация и проверка маршрута (симуляция терминала):

```bash
docker exec rmq rabbitmqadmin -V shop publish exchange=orders.events \
  routing_key="order.paid.eu" payload="test-1"
# Ожидание: {"routing_key":"order.paid.eu","payload":"test-1","payload_bytes":6}

docker exec rmq rabbitmqctl -p shop list_queues name messages_ready
# Ожидание: orders.billing  1     ← сообщение смаршрутизировано ✅
```

**Шаг 3** — проверка TTL→DLX: подождите 60с (message-ttl) и повторите list_queues:

```text
orders.billing  0      ← протухло
orders.dead     1      ← улетело в DLX ✅
```

**Проверь себя:** `rabbitmqctl -p shop list_queues name messages_ready` показывает ровно описанную картину; в UI (localhost:15672, guest/guest) на orders.billing видна политика quorum.

**Разбор:** TTL на уровне очереди + DLX — стандартный паттерн «отложенная обработка + изоляция мусора». В проде TTL обычно на сообщении, а DLX-очередь мониторится алертом (рост = проблемы консьюмера).

#### Задание 2: NATS JetStream — stream, pull-консьюмер, replay

**Условие:** развернуть NATS с JetStream, создать stream `ORDERS`, убедиться в replay: новый консьюмер читает «историю».

**Шаг 1** — сервер и CLI (стартовое состояние: пусто):

```bash
docker run -d --name nats -p 4222:4222 -p 8222:8222 nats:2.10 -js
docker run --rm --network host -it natsio/nats-box:latest
# внутри nats-box:
nats --server nats://host.docker.internal:4222 --creds "" stream add ORDERS \
  --subjects "orders.>" --storage file --retention limits --max-age 1h --replicas 1 \
  --defaults
nats pub orders.created.1 "msg-a" && nats pub orders.created.2 "msg-b"
```

**Шаг 2** — replay для нового консьюмера:

```bash
nats consumer add ORDERS ANALYTICS --pull --deliver all --ack explicit --defaults
nats consumer next ORDERS ANALYTICS
# Ожидание: --- receive on ORDERS.ANALYTICS ---
#   [#1] Received on subject: orders.created.1  → msg-a   ← история доступна ✅
nats consumer next ORDERS ANALYTICS   # → msg-b
```

**Шаг 3** — лаг и состояние:

```bash
nats consumer info ORDERS ANALYTICS | grep -E "Num Pending|Ack Floor|Delivered"
#   Num Pending: 0 (всё ack'нуто), Ack Floor: 2
nats stream info ORDERS | grep -E "Messages|FirstSeq"
```

**Проверь себя:** `nats stream info ORDERS` показывает 2 сообщения; новый pull-консьюмер получил их с начала (deliver all).

**Разбор:** JetStream = «мини-Kafka» без JVM: replay, ack, DLQ. Отличие от Core NATS принципиально для интеграций, где подписчик может отстать или появиться позже.

#### Задание 3: Диагностика «затухающей» очереди (сценарий инцидента в миниатюре)

**Условие (стартовое состояние):** очередь `orders.billing` растёт ~500 msg/мин; консьюмер один, живой; алертов нет.

```bash
# Шаг 1: скорость потребления vs притока (два замера с интервалом)
docker exec rmq rabbitmqctl -p shop list_queues name messages_ready messages_unacknowledged
sleep 60
docker exec rmq rabbitmqctl -p shop list_queues name messages_ready messages_unacknowledged
# Ожидание-диагноз: ready растёт, unacked ≈ prefetch (константа) → консьюмер узкое место
#   Если unacked растёт до тысяч → консьюмер «завис» на обработке (см. consumer_timeout)

# Шаг 2: кто консьюмер и с каким prefetch
docker exec rmq rabbitmqctl -p shop list_consumers queue_name prefetch_count
#   orders.billing  1   ← prefetch=1: по одному сообщению за раз, RTT убивает throughput

# Шаг 3: фикс на лету (приложение должно вызывать basic.qos; проверяем эффект)
#   перезапустить консьюмер с prefetch=50 → throughput вырастает в ~20 раз
```

**Проверь себя:** после изменения prefetch разница двух замеров через 60с: `ready` перестало расти или падает; `messages_unacknowledged ≈ 50` (не 1).

**Разбор:** prefetch=1 при сетевой задержке 5мс и обработке 20мс даёт ~40 msg/s на консьюмера; prefetch=50 конвейеризует ack'и. Диагностика всегда по двум замерам: скорость изменения важнее абсолютного значения.

---

*Следующая подтема: [20.7 Network Edge](07-network-edge.md)*
