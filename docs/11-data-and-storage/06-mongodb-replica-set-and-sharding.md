# 🍃 06. MongoDB: Replica Set, Sharding и Бэкапы

> Документная СУБД: когда данные — объекты без жёсткой схемы. Фокус страницы — эксплуатация и HA, как у остальных СУБД раздела 11.

## 🏛️ Архитектура: Replica Set

```mermaid
graph TB
    APP[Драйвер приложения] -->|"write: primary"| P["PRIMARY"]
    P -->|"oplog (async)"| S1[SECONDARY]
    P --> S2[SECONDARY]
    S2 -->|"priority=0, hidden"| H[HIDDEN: для бэкапов/аналитики]
```

- **Replica Set** = минимум 3 узла данных (или 2 данных + arbiter — но arbiter не хранит данные и не спасает от split-brain-рисков чтения).
- **Oplog** (operations log) — кольцевой журнал операций primary; secondary наигрывают его асинхронно. Это одновременно механизм репликации И основа инкрементальных бэкапов.
- **Выборы**: при недоступности primary оставшиеся голосуют; нужен кворум. `readPreference` управляет, откуда читать (primary / primaryPreferred / secondaryPreferred / nearest) — «читать со secondary» даёт масштаб чтений ценой eventual consistency.

## 📝 Sharding: когда один replica set больше не вмещает

```mermaid
graph LR
    R[Router: mongos] --> CS["Config Servers<br/>(реплика метаданных чанков)"]
    R --> S0[Shard 0: replica set]
    R --> S1[Shard 1: replica set]
    APP -->|"shard key в запросе!"| R
```

| Компонент | Роль |
| :--- | :--- |
| mongos | Маршрутизатор: знает, в каком шарде какой чанк |
| Config servers | Метаданные распределения чанков (3 узла, сами по себе RS) |
| Shard | Обычный replica set с частью данных |

**Выбор shard key — решение на годы:**

- **Хорошо**: `{user_id: hashed}` — равномерное распределение, нет hot spots, но range-запросы бьют во все шарды.
- **Плохо**: `{_id: 1}` (ObjectId монотонный → все вставки в последний чанк), низкокардиональные поля (`country`).
- Монотонные ключи лечатся **hashed sharding**; запросы без shard key — scatter-gather по всем шардам (медленно).

## ⚡ Эксплуатация: команды дня

```bash
# Статус репликации: главный индикатор здоровья
rs.status()                       # stateStr каждого узла: PRIMARY/SECONDARY/(STARTUP2|RECOVERING = тревога)
rs.printSecondaryReplicationInfo()   # отставание secondary в секундах

# Размер oplog — определяет допустимое окно сбоя secondary
use local && db.oplog.rs.stats().maxSize   # дефолт ~5% диска; при больших объёмах записи увеличить

# Задержка репликации и лаг вторички перед её обслуживанием
rs.conf().members.forEach(m => print(m.host, m.priority, m.hidden))

# Переключение primary без простоя (перед апгрейдом узла)
rs.stepDown(60)

# Шардирование: балансировка чанков
sh.status()                                   # карта чанков
db.settings.updateOne({_id:"balancer"},{$set:{stopped:false}})
sh.balancerCollectionStatus("shop.orders")
```

Правило обслуживания: secondary выводим из ротации (replSetStepDown + stop), обслуживаем, возвращаем, ждём догоняния оплога (`rs.printSecondaryReplicationInfo()` → lag 0), только потом следующий узел. Никогда не обслуживать primary первым.

## 💾 Бэкапы: oplog вместо WAL

Аналог PITR из [13.2](../13-disaster-recovery-and-tools/02-database-backups-and-dr-plan.md):

```bash
# Полный дамп (блокирует? нет: --oplog фиксирует точку согласованности)
mongodump --uri="mongodb://user:pass@rs1/shop?replicaSet=rs0" \
  --oplog --gzip --archive=/backup/full-$(date +%F).archive.gz

# Инкремент через Percona Backup for MongoDB (PBM) — продакшн-стандарт:
pbm config --set storage.type=s3,storage.s3.bucket=mongo-backups
pbm backup                          # базовый снапшот
pbm backup --type=incremental       # инкременты по оплогу каждые N минут (агентом)
pbm list                            # точки восстановления
pbm restore 2026-08-25T03:00:00Z --namespace=shop.orders   # восстановление выборочно!

# Point-in-time: восстановление на момент времени по оплогу
pbm restore 2026-08-25T03:00:00Z --time-limit "2026-08-25T11:46:30+03:00"
```

Мониторинг бэкапной системы: `pbm status`, размер последнего снапшота относительно среднего, **ежемесячный restore-тест** — как и для PostgreSQL, бэкап без проверенного восстановления не существует.

## 🔬 Deep Dive: write concern и read concern — цена гарантий

Гарантии записи настраиваются на уровне операции:

```js
// Максимальная надёжность: подтверждение большинства + запись в journal
db.orders.insertOne({...}, { writeConcern: { w: "majority", j: true } })
// Быстро, но можно потерять при фейловере:
db.events.insertOne({...}, { writeConcern: { w: 1 } })
// Чтение собственных записей после смены primary:
db.orders.find({...}).readConcern("majority")
```

Классический инцидент: `w:1` + падение primary сразу после ack → операция «успешна» для клиента, но не дошла до majority → при выборах нового primary откатывается. Для денег/заказов — всегда `w:"majority"`. Цена — латентность: majority-ack ждёт медленнейшую из живых вторичек.

Синтаксис транзакций (с 4.0, только для replica set/sharded):

```js
const session = db.getMongo().startSession()
session.startTransaction({ readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } })
try {
  session.getDatabase("shop").accounts.updateOne({_id:1}, {$inc:{balance:-100}})
  session.getDatabase("shop").accounts.updateOne({_id:2}, {$inc:{balance:100}})
  session.commitTransaction()
} catch (e) { session.abortTransaction() }
```

Транзакции дороже реляционных аналогов (размер ограничен, производительность ниже) — если они нужны везде, возможно, документную модель выбрали неправильно.

---

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Secondary не догоняет после обслуживания | Оплог «провернулся» раньше, чем узел вернулся | Увеличить oplog size; пересинхронизация `resync`/initial sync |
| Выборы происходят «сами» периодически | Нестабильная сеть / heartbeat таймауты | `net.ping()` между узлами; проверить heartbeatIntervalMillis в rs.status() |
| После failover приложение теряет записи | writeConcern w:1 | Перейти на w:"majority" для критичных коллекций |
| Вставки всё медленнее при росте | Монотонный shard key / hot chunk | Hashed sharding; перешардирование заранее, не при пожаре |
| mongodump тормозит прод | Дамп с primary под нагрузкой | Дампить с hidden secondary или использовать PBM-агента |
| Config servers деградировали, sh.status() врёт | Потерян кворум конфиг-серверов | Восстановить кворум прежде любых операций шардинга |

## 🧪 Hands-on Lab

```bash
# Replica set из 3 узлов локально за 2 минуты
docker compose up -d   # mongo1, mongo2, mongo3 (см. шаблон ниже)
docker exec -it mongo1 mongosh --eval 'rs.initiate({_id:"rs0", members:[{_id:0,host:"mongo1:27017"},{_id:1,host:"mongo2:27017"},{_id:2,host:"mongo3:27017"}]})'

# Ломаем primary — наблюдаем выборы
docker stop mongo1 && sleep 5
docker exec -it mongo2 mongosh --eval 'rs.status().members.map(m=>({h:m.name,s:m.stateStr}))'
docker start mongo1    # вернётся SECONDARY — primary остался тот, что выбран

# Бэкап и восстановление
docker exec -it mongo2 mongodump --archive --gzip --db shop > shop.archive.gz
docker exec -i mongo2 mongosh shop --eval 'db.orders.drop()'
docker exec -i mongo2 mongorestore --archive --gzip --db shop < shop.archive.gz
```

<details><summary>compose.yaml для лабы</summary>

```yaml
services:
  mongo1: { image: mongo:7, command: "--replSet rs0 --bind_ip_all", hostname: mongo1, ports: ["27017:27017"] }
  mongo2: { image: mongo:7, command: "--replSet rs0 --bind_ip_all", hostname: mongo2 }
  mongo3: { image: mongo:7, command: "--replSet rs0 --bind_ip_all", hostname: mongo3 }
```
</details>

## ✅ Чек-лист зрелости темы

- [ ] Replica set ≥3 узла данных, arbiter'ов нет; узлы разнесены по AZ
- [ ] Критичные записи с w:"majority", readConcern осознанно выбран
- [ ] Oplog достаточного размера (лаг вторичек < окна обслуживания)
- [ ] Бэкапы: PBM/Snapshots + инкременты по оплогу, restore-тест ежемесячно
- [ ] Мониторинг: lag репликации, число выборов за сутки, состояние баланса шардов
- [ ] Shard key выбран с запасом на рост; запросы без shard key известны и оптимизированы

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 💪 Практика | [Задачи по БД](../15-hands-on-practice/02-100-devops-practical-tasks-part2.md) |
| 🎤 Проверить себя | [Вопросы собесов](../14-interview-prep/04-100-devops-interview-questions-bank-part2.md) |

---

## ✅ Проверь себя

**В1. Replica Set: роли членов и механика выборов?**
<details><summary>Ответ</summary>
Primary принимает записи; Secondaries реплицируют oplog и могут голосовать. При недоступности primary — выборы Raft-подобным протоколом (большинство, priority, catchup до latest oplog entry). Арбитр (arbiter) даёт голос без данных — но лучше нести данные на третьей ноде.
</details>

**В2. Write concern w:majority — что гарантирует и чем платим?**
<details><summary>Ответ</summary>
Запись подтверждается после репликации на большинство — переживает отказ primary без отката подтверждённых данных (no rollback surprise). Цена: латентность + остановка записи при потере большинства.
</details>

**В3. Когда нужен sharding и какой ключ выбрать?**
<details><summary>Ответ</summary>
Когда рабочая set/индексы не влезают в один узел или write throughput упирается в primary. Ключ: высокая кардинальность, равномерное распределение, попадание частых запросов (hashed для равномерности, ranged для range-scan). Монотонно возрастающий ключ (timestamp/_id) = hot shard.
</details>

**В4. mongodump vs PBM/oplog PITR для MongoDB?**
<details><summary>Ответ</summary>
mongodump — логический дамп: просто, но медленно на больших базах и точка восстановления = момент завершения дампа. Percona Backup for Mongo снимает consistent snapshot + непрерывный oplog → восстановление на любой момент (PITR) — стандарт для проды.
</details>
