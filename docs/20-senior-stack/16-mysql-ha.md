# 🐬 20.16 MySQL High Availability: репликация, Orchestrator, ProxySQL

> Уровень: Middle→Senior. PostgreSQL HA (Patroni) уже разобран ([11.4](../11-data-and-storage/04-postgresql-ha-and-patroni.md)); здесь — экосистема MySQL, где паттерн «failover-менеджер + прокси» реализован иначе.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Репликация: фундамент

```text
Primary ──binlog──> Replica (IO thread → relay log → SQL thread)
```

| Механизм | Что даёт | Цена |
| :--- | :--- | :--- |
| **GTID** (`gtid_mode=ON`) | каждая транзакция имеет глобальный ID → авто-позиционирование реплик, простой failover | обязательна для HA-инструментов |
| **Semi-sync** | primary ждёт ack хотя бы N реплик → RPO≈0 | латентность записи + RTT |
| **Async** (дефолт) | максимальная скорость | lag → потеря свежих транзакций при failover |

#### Стеки HA

| | **InnoDB Cluster** (официальный) | **Orchestrator + ProxySQL** (GitHub-стайл) |
| :--- | :--- | :--- |
| Ядро | Group Replication (Paxos-подобная сертификация) | обычная async/semi-sync репликация |
| Failover | встроенный, автоматический | Orchestrator: детект + topology-change |
| Роутинг | MySQL Router (читает метаданные кластера) | ProxySQL: hostgroups, read/write split, query rules |
| Сложность | средняя, «из коробки» | выше, но гибче (кастомные топологии, shard-хинты) |
| Когда | новый проект, MySQL 8.x | зрелые инсталляции, сложный роутинг |

**Ключевые термины:** `binlog` (журнал изменений), `relay log` (локальная копия на реплике), `replication lag` (`Seconds_Behind_Source` — грубая метрика!), `read/write splitting` (SELECT на реплики, DML на primary), `PITR` (point-in-time recovery: бэкап + binlog до нужной секунды).

**ProxySQL-модель:** `hostgroup 10` = primary (writer), `hostgroup 20` = реплики (readers); правила: `SELECT ... FOR UPDATE` → 10, `SELECT` → 20; Orchestrator двигает узлы между hostgroups при failover (через скрипт-хук).

---

### 2.2 Конфигурация и синтаксис

#### my.cnf: репликация + GTID + semi-sync

```ini
[mysqld]
server_id = 11                       # УНИКАЛЕН в топологии!
gtid_mode = ON
enforce_gtid_consistency = ON
log_bin = mysql-bin
binlog_format = ROW                  # только ROW для безопасной репликации DDL/DML
binlog_expire_logs_seconds = 604800  # 7 дней (для PITR)

# Semi-sync (плагин)
plugin_load_add = rpl_semi_sync_source.so
rpl_semi_sync_source_enabled = 1
rpl_semi_sync_source_wait_for_replica_count = 1
rpl_semi_sync_source_timeout = 3000  # 3s → деградация в async, а не стоп записи

# Инварианты прод
innodb_flush_log_at_trx_commit = 1   # durability (2 = скорость, риск потери 1с)
sync_binlog = 1
max_connections = 500
```

#### Настройка реплики

```sql
-- На primary: пользователь репликации
CREATE USER 'repl'@'%' IDENTIFIED BY '***' REQUIRE SSL;
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- На реплике (MySQL 8.0.22+ синтаксис):
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='primary.corp', SOURCE_USER='repl', SOURCE_PASSWORD='***',
  SOURCE_AUTO_POSITION=1,                       -- GTID: без координат файлов!
  GET_SOURCE_PUBLIC_KEY=1, REQUIRE_SOURCE_SSL=1;
START REPLICA;
SHOW REPLICA STATUS\G
--   Replica_IO_Running: Yes | Replica_SQL_Running: Yes | Seconds_Behind_Source: 0
```

#### Orchestrator: топология и failover-хук

```json
// orchestrator.conf.json (фрагмент)
{
  "MySQLTopologyUser": "orchestrator",
  "ReplicationLagQuery": "SELECT TIMESTAMPDIFF(SECOND, ts, NOW()) FROM tool.heartbeat ORDER BY ts DESC LIMIT 1",
  "FailMasterPromotionIfSQLThreadNotUpToDate": true,
  "PostMasterFailoverProcesses": [
    "/usr/local/bin/proxsql-reconfigure --new-master {successorHost} "
  ],
  "RecoverMasterClusterFilters": ["*"]
}
```

```sql
-- ProxySQL: hostgroups и правило split
INSERT INTO mysql_servers (hostgroup_id, hostname, port) VALUES
  (10, 'primary.corp', 3306), (20, 'replica1.corp', 3306), (20, 'replica2.corp', 3306);

INSERT INTO mysql_replication_hostgroups (writer_hostgroup, reader_hostgroup, check_type)
  VALUES (10, 20, 'read_only=1');   -- ProxySQL сам двигает по read_only флагу

INSERT INTO mysql_query_rules (rule_id, match_pattern, destination_hostgroup, apply)
  VALUES (1, '^SELECT.*FOR UPDATE', 10, 1),
         (2, '^SELECT', 20, 1);     -- остальные SELECT → реплики
LOAD MYSQL SERVERS TO RUNTIME; LOAD MYSQL QUERY RULES TO RUNTIME;
```

**Частые ошибки:** дублирующийся `server_id` (реплика молча не стартует/глючит); `binlog_format=MIXED/STATEMENT` с недетерминированными запросами (`UUID()`, `NOW()`) → расхождение данных; failover без `FailMasterPromotionIfSQLThreadNotUpToDate` → потеря транзакций; приложение пишет на реплику «по привычке» (нет split через прокси).

---

### 2.3 Troubleshooting

```bash
# Состояние репликации — главная команда
mysql -e "SHOW REPLICA STATUS\G" | grep -E "Running|Behind|Last_Error"
#   Replica_SQL_Running: No + Last_SQL_Error → конкретная ошибка применения

# Лаг честный (Seconds_Behind Source врёт при простое): heartbeat-таблица
mysql -e "SELECT TIMESTAMPDIFF(SECOND, ts, NOW()) AS lag_s FROM tool.heartbeat ORDER BY ts DESC LIMIT 1"

# GTID-состояние
mysql -e "SELECT @@global.gtid_executed" | head -3
mysql -e "SELECT RECEIVED_TRANSACTION_SET FROM performance_schema.replication_connection_status\G"

# Что блокирует запись (metadata locks, долгие транзакции)
mysql -e "SELECT * FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 5\G"
mysql -e "SHOW PROCESSLIST" | grep -v Sleep | head

# Orchestrator CLI
orchestrator-client -c topology -i primary.corp          # дерево топологии
orchestrator-client -c relocate -i replica1.corp -d replica2.corp
orchestrator-client -c graceful-master-takeover -i primary.corp
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| `Replica_IO_Running: Connecting` | сеть/креды/файрвол до primary | telnet 3306, проверить пользователя |
| `Last_SQL_Error: Duplicate entry` | расхождение данных (писали в реплику!) | pt-table-checksum → pt-table-sync, закрыть запись на реплики |
| Лаг растёт при нагрузке | один SQL-thread у реплики | parallel replication (`replica_parallel_workers`), ROW-формат |
| Semi-sync «отвалился» в async | таймаут 3s при лаге реплик | это by design (доступность > RPO); мониторить статус |
| Failover «потерял транзакции» | promotion не самой свежей реплики | Orchestrator-флаг + semi-sync + heartbeat-лаг |
| ProxySQL: пишем на реплику | правило/хостгруппа не переключились после failover | проверять `runtime_mysql_servers`, хук Orchestrator |

---

### 2.4 Интеграция со стеком

- **Orchestrator ↔ ProxySQL:** хук после failover перестраивает hostgroups — приложение вообще не узнаёт о смене primary.
- **Бэкапы:** Percona XtraBackup (горячий физический) → MinIO/S3; PITR = полный бэкап + replay binlog (см. [20.8](08-storage-s3-etcd-longhorn.md)).
- **K8s:** операторы (Vitess для шардинга; MySQL Operator for InnoDB Cluster); классический стек — на VM (см. [20.15](15-virtualization.md)).
- **Observability:** mysqld_exporter → Prometheus: `mysql_slave_status_seconds_behind_source`, `mysql_global_status_threads_running`, connection usage.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: primary умер мгновенно (OOM). Semi-sync включён, `wait_for_replica_count=1`, но свежие транзакции потеряны. Как такое возможно?**

<details><summary>Ответ</summary>
Semi-sync деградировал в async после таймаута (rpl_semi_sync_source_timeout=3s) — например, реплика лагала/была недоступна, и primary продолжил коммитить без ack. Проверять Rpl_semi_sync_source_status и алертить на деградацию semi-sync.
</details>

**В2. Найдите ошибку: на двух серверах в топологии `server_id=1`. Репликация выглядит работающей, но периодически «странные» расхождения.**

<details><summary>Ответ</summary>
Дублирующийся server_id ломает идентификацию в топологии: события могут циклиться/отфильтровываться неожиданно. server_id уникален на каждый узел (GTID использует UUID+id-контекст).
</details>

**В3. Почему `Seconds_Behind_Source` нельзя использовать как единственную метрику лага, и что вместо неё?**

<details><summary>Ответ</summary>
Она считает разницу времени события из binlog и «сейчас» на реплике: при простое источника показывает 0 даже при реальном отставании, зависит от часов. Вместо — heartbeat-таблица (пишется на primary, замеряется на реплике) или GTID-сравнение.
</details>

**В4. Зачем `binlog_format=ROW` для HA, если STATEMENT «компактнее»?**

<details><summary>Ответ</summary>
STATEMENT реплицирует текст запроса: недетерминированные (UUID(), LIMIT без ORDER BY, триггеры) дают разный результат на реплике → тихое расхождение данных. ROW пишет изменения строк — детерминированно; это требование GTID-надёжности и инструментов (checksum/sync).
</details>

**В5. Приложение после failover продолжает слать записи на старый primary (теперь реплику) и получает read-only-ошибки. Какой слой не сработал и как правильно?**

<details><summary>Ответ</summary>
Роутинг: приложение ходит мимо ProxySQL/Router напрямую по хостнейму. Правильно: подключение через прокси (единый VIP/endpoint) или DNS-переключение в failover-хуке; прямые подключения к «primary» — антипаттерн для HA.
</details>

---

### 2.6 Практика — 3 задания

### Задание 1: Primary + 2 реплики в docker с GTID (стенд)

**Условие:** поднять топологию 1+2, проверить репликацию и lag.

```bash
# Шаг 1: три контейнера (стартовое состояние)
for i in 1 2 3; do
  docker run -d --name mysql$i -e MYSQL_ROOT_PASSWORD=root123 \
    -p 330${i}:3306 mysql:8.4 \
    --server-id=$i --gtid-mode=ON --enforce-gtid-consistency=ON \
    --log-bin=mysql-bin --binlog-format=ROW
done
sleep 30

# Шаг 2: пользователь репликации на mysql1
docker exec -i mysql1 mysql -uroot -proot123 <<'EOF'
CREATE USER 'repl'@'%' IDENTIFIED WITH caching_sha2_password BY 'repl123' REQUIRE SSL;
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
CREATE DATABASE shop; USE shop;
CREATE TABLE orders (id INT AUTO_INCREMENT PRIMARY KEY, v VARCHAR(50));
INSERT INTO orders(v) VALUES ('seed');
EOF

# Шаг 3: подключить реплики
for i in 2 3; do
docker exec -i mysql$i mysql -uroot -proot123 <<'EOF'
CHANGE REPLICATION SOURCE TO SOURCE_HOST='mysql1', SOURCE_USER='repl',
  SOURCE_PASSWORD='repl123', SOURCE_AUTO_POSITION=1, GET_SOURCE_PUBLIC_KEY=1;
START REPLICA;
EOF
done

# Шаг 4: проверка
docker exec mysql2 mysql -uroot -proot123 -e "SHOW REPLICA STATUS\G" | grep -E "Running|Behind"
#   Replica_IO_Running: Yes / Replica_SQL_Running: Yes / Seconds_Behind_Source: 0 ✅
docker exec mysql1 mysql -uroot -proot123 -e "INSERT INTO shop.orders(v) VALUES ('live-1')"
docker exec mysql3 mysql -uroot -proot123 -e "SELECT * FROM shop.orders"   # обе строки ✅
```

**Проверь себя:** `SHOW REPLICA STATUS` зелёный на обеих репликах; запись на primary видна на обеих репликах за <1с.

**Разбор:** SOURCE_AUTO_POSITION=1 + GTID — реплика сама знает, чего ей не хватает; никакой ручной координации binlog-файлов. Это фундамент, на котором работает Orchestrator.

### Задание 2: Диагностика «отравленной» реплики (сценарий)

**Условие (стартовое состояние):** кто-то записал данные НАПРЯМУЮ в реплику; теперь `Replica_SQL_Running: No`, `Last_SQL_Error: Duplicate entry '1' for key 'PRIMARY'`.

```bash
# Шаг 1: подтвердить диагноз
docker exec mysql2 mysql -uroot -proot123 -e "SHOW REPLICA STATUS\G" | grep -E "Last_SQL|Exec_Source"
#   Duplicate entry ... ✅ диагноз: расхождение данных

# Шаг 2: найти расхождение (в лабе — глазами; в проде — pt-table-checksum)
docker exec mysql1 mysql -uroot -proot123 -e "SELECT * FROM shop.orders WHERE id=1"
docker exec mysql2 mysql -uroot -proot123 -e "SELECT * FROM shop.orders WHERE id=1"
#   Разные значения → подтверждено

# Шаг 3: решение — пропустить конфликтующую транзакцию (GTID!)
docker exec mysql2 mysql -uroot -proot123 -e "
  SET GTID_NEXT='ANONYMOUS';
  BEGIN; COMMIT;                       # пустая транзакция-заглушка
  SET GTID_NEXT='AUTOMATIC';
  START REPLICA;"
#   (альтернатива: mysqlslap-подход pt-table-sync для честной синхронизации данных)

# Шаг 4: профилактика
docker exec mysql2 mysql -uroot -proot123 -e "
  SET GLOBAL super_read_only=ON;"      # реплика read-only даже для root!
```

**Проверь себя:** `SHOW REPLICA STATUS\G` — Running: Yes; повторная запись на primary появляется на реплике; `SELECT @@super_read_only` = 1.

**Разбор:** «Duplicate entry» на реплике почти всегда = ручная запись мимо primary. GTID-заглушка пропускает конкретную транзакцию; super_read_only — системная защита. В проде: ProxySQL hostgroup-механизм (read_only=1) делает это автоматически.

### Задание 3: PITR — восстановление на момент «до ошибки» (XtraBackup + binlog)

**Условие:** в 14:00 кто-то выполнил `DELETE FROM orders` без WHERE. Есть ночной XtraBackup (03:00) и binlog'и. Восстановить состояние на 13:59.

```bash
# Шаг 0: стартовые артефакты (симуляция)
docker exec mysql1 sh -c 'apt-get install -y percona-xtrabackup-84 >/dev/null 2>&1 || true'
#   (в лабе допустим mysqldump; в проде — XtraBackup: горячий физический бэкап)
docker exec mysql1 mysqldump --all-databases --single-transaction --source-data=2 \
  > /tmp/full-0300.sql
docker exec mysql1 cat /tmp/full-0300.sql | grep -m1 "CHANGE REPLICATION SOURCE"
#   --source-data=2 записал координаты бэкапа (GTID/binlog position) ✅

# Шаг 1: поднять временный сервер и накатить бэкап
docker run -d --name mysql-restore -e MYSQL_ROOT_PASSWORD=root123 mysql:8.4
docker exec -i mysql-restore mysql -uroot -proot123 < /tmp/full-0300.sql

# Шаг 2: replay binlog до 13:59:59
docker exec mysql1 mysqlbinlog --read-from-remote-server --host=mysql1 -uroot -proot123 \
  --stop-datetime="2026-08-24 13:59:59" --to-last-log mysql-bin.000001 > /tmp/replay.sql
docker exec -i mysql-restore mysql -uroot -proot123 < /tmp/replay.sql

# Шаг 3: проверка — данные ДО удаления на месте, удаление НЕ применено
docker exec mysql-restore mysql -uroot -proot123 -e "SELECT COUNT(*) FROM shop.orders"
#   Ожидание: столько строк, сколько было до DELETE ✅

# Шаг 4: переключение — экспорт нужных таблиц обратно в прод (или смена endpoints)
docker exec mysql-restore mysqldump shop > /tmp/shop-recovered.sql
docker exec -i mysql1 mysql -uroot -proot123 -e "CREATE DATABASE shop_restored"
docker exec -i mysql1 mysql -uroot -proot123 shop_restored < /tmp/shop-recovered.sql
```

**Проверь себя:** в `shop_restored` — данные на 13:59; в проде `binlog` события DELETE видны в replay.sql, но не применены к восстановленной копии.

**Разбор:** PITR = полный бэкап (с координатами) + точечный replay binlog до момента ошибки. Отсюда требования прод: binlog_format=ROW, retention binlog ≥ период между бэкапами × 2, и РЕПЕТИЦИЯ восстановления — как с etcd (20.8) и GitLab (20.13).

---

*Далее: [Сводный блок Части 3 — 40 вопросов и 10 задач](00-senior-stack-summary-p3.md)*
