# 💾 02. Бэкапы Баз Данных и DR-План: PITR, RPO/RTO, Runbook'и

> Velero и бэкапы объектов кластера — в [01. K8s Backups](01-k8s-backups-velero.md). Здесь — данные в СУБД и организационная часть восстановления.

## ⚙️ Матрица потерь: с чего начинается DR

Прежде чем настраивать бэкапы — зафиксировать, сколько данных можно потерять (RPO) и как долго восстанавливать (RTO) для каждого сервиса:

| Сервис | RPO | RTO | Механизм | Проверка |
| :--- | :--- | :--- | :--- | :--- |
| PostgreSQL (прод) | ≤ 5 мин | ≤ 1 ч | WAL-архив + базовый бэкап (PITR) | Ежемесячный restore-тест |
| Redis (кэш) | допустима потеря | 15 мин | Рестарт + прогрев; RDB hourly | Пересоздание из нуля |
| Kafka | 0 (репликация) / 24 ч | 30 мин | RF≥3; MirrorMaker для DR-кластера | Failover-учения |
| ClickHouse | 24 ч | 4 ч | clickhouse-backup в S3 | Тестовый restore таблицы |
| Файлы пользователей | 1 ч | 2 ч | restic/velero + S3 versioning | Выборочное восстановление |

Правила матрицы:

1. RPO без WAL/shipping у транзакционной БД = интервал между полными бэкапами. «Ночной дамп» = RPO 24 часа.
2. RTO измеряется **от решения до продакшн-трафика**, а не «пока скопировались файлы».
3. Матрица пересматривается при каждом новом сервисе. Нет строки в матрице — сервис не защищён.

---

## 📝 PostgreSQL: PITR через WAL-архивирование

Point-In-Time Recovery даёт RPO в минуты: базовый бэкап + непрерывный поток WAL.

### Архивация WAL (на стороне кластера)

```bash
# postgresql.conf
archive_mode = on
archive_command = 'wal-g wal-push %p'          # или test ! -f /backup/wal/%f && cp %p /backup/wal/%f
archive_timeout = 60                            # форс-свитч WAL раз в минуту → RPO ~1 мин
wal_level = replica
```

### Базовый бэкап: pgBackRest или WAL-G

```bash
# WAL-G (S3): полный бэкап + инкременты
wal-g backup-push /var/lib/postgresql/16/main
wal-g backup-list

# pgBackRest: конфиг + полный/дифф/инкр
pgbackrest --stanza=main --type=full backup
pgbackrest --stanza=main info
```

### Восстановление на момент времени

```bash
# 1. Остановить постгрес, очистить PGDATA (или поднять параллельную копию!)
systemctl stop postgresql && mv /var/lib/postgresql/16/main /var/lib/postgresql/16/main.broken

# 2. Восстановить базовый бэкап
wal-g backup-fetch /var/lib/postgresql/16/main LATEST
# pgbackrest --stanza=main --delta --set=20260820-F full restore ...

# 3. Указать целевую точку (restore_command подтянет WAL из архива)
cat >> $PGDATA/postgresql.conf <<EOF
restore_command = 'wal-g wal-fetch %f %p'
recovery_target_time = '2026-08-25 11:47:30+03'
recovery_target_action = 'pause'        # стоп перед применением ошибочного транзакции
EOF
touch $PGDATA/recovery.signal

# 4. Поднять, убедиться что данные те, затем продолжить
systemctl start postgresql
psql -c "SELECT pg_wal_replay_resume();"    # после проверки recovery_target_action=pause
```

!!! warning "Классика инцидента"
    `rm -rf` в 11:47, заметили в 13:00. Восстанавливать нужно на `11:46:xx`, а НЕ на последний бэкап ночи — иначе теряете день. PITR существует именно для этого. И никогда не восстанавливайте поверх живого кластера Patroni — отдельная нода/контейнер.

### Логическая репликация как доп. страховка

Физический PITR восстанавливает всё целиком. Для «уронили одну таблицу» удобнее отложенная логическая реплика: подписка на публикацию с `apply_delay = '2h'` — двухчасовая машина времени на уровне строк.

---

## 🗄️ Остальные СУБД кратко

```bash
# MySQL/MariaDB: binlog = аналог WAL
mysqldump --single-transaction --source-data=2 db > full.sql   # позиция binlog внутри
mysqlbinlog --start-position=... --stop-datetime="2026-08-25 11:46:00" binlog.* | mysql

# MongoDB: oplog + mongodump по инкременту (или Percona Backup for Mongodb)
mongodump --oplog --gzip --archive=/backup/mongo-$(date +%F).gz
mongorestore --oplogReplay --nsFrom='shop.*' --nsTo='shop_restored.*' dump/

# ClickHouse: специализированный инструмент
clickhouse-backup create remote_daily
clickhouse-backup restore remote_daily

# Redis: RDB-снимки + AOF; для кэша часто достаточно рестарта
redis-cli BGSAVE && rsync -a /var/lib/redis/dump.rdb /backup/
```

---

## 🧯 Runbook: шаблон процедуры восстановления

```markdown
# RUNBOOK: Восстановление PostgreSQL после потери данных
**Сервис:** shop-db · **Владелец:** @dba-team · **Последняя проверка:** 2026-08-10 (успешно)

## Триггеры запуска
- Подтверждённая потеря/порча данных (DROP, ransomware, битый диск)
- Недоступность всех реплик одновременно

## Шаг 0. Оценка (5 мин)
- [ ] Зафиксировать момент инцидента T_bad (логи приложения/аудит)
- [ ] Решить: точечное восстановление (delayed replica) или полное PITR
- [ ] Объявить канал #inc-dr-pg, назначить координатора

## Шаг 1. Остановка записи (5 мин)
- [ ] Patroni pause / приложение read-only: kubectl scale deploy shop-api --replicas=0

## Шаг 2. Восстановление (RTO-бюджет: 40 мин)
- [ ] Поднять восстановительную ноду (см. команды раздела PITR)
- [ ] recovery_target_time = T_bad - 1 минута
- [ ] Сверить контрольные данные: SELECT count(*) FROM orders WHERE created_at > 'T-1h';

## Шаг 3. Переключение (10 мин)
- [ ] Продвинуть восстановленную ноду (pg_ctl promote)
- [ ] Переключить Patroni/DNS на неё, вернуть приложение
- [ ] Мониторинг ошибок 5xx/latency 15 мин

## Шаг 4. Постмортем
- [ ] Заполнить отчёт: фактические RPO/RTO vs план
- [ ] Обновить этот runbook по итогам
```

Runbook проверяется **учением**: раз в квартал — плановый restore в staging по шагам, замер реального RTO. Результат учения записывается прямо в шапку документа.

---

## 🔬 Deep Dive: почему «бэкап есть» ≠ «восстановление возможно»

Три независимых механизма отказов бэкапной системы:

```mermaid
graph LR
    A["Бэкап создаётся?"] -->|job зелёный| B["Бэкап полный?"]
    B -->|"размер растёт"| C["Бэкап разворачивается?"]
    C -->|"❌ никто не проверял"| FAIL["Ложная уверенность"]
```

1. **Джоба зелёная, бэкап пустой**: ошибка внутри скрипта игнорируется (`pg_dump || true`). Контроль — размер последнего дампа относительно среднего за неделю + тестовая распаковка.
2. **Полный бэкап, но WAL не шиппятся**: `archive_command` молча фейлится при переполненном бакете. Мониторинг: `SELECT last_archived_wal, last_failed_wal FROM pg_stat_archiver;` + алерт на рост failed_count.
3. **Разворачивается, но вечность**: бэкап 800 ГБ на медленный сторадж = RTO сутки. Считать скорость restore при планировании, а не во время инцидента; держать свежую **staging-копию** — она же среда для тестов.

Метрика зрелости: **доля сервисов, чей restore был реально выполнен за квартал**. Цель — 100% из матрицы.

---

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Нужен PITR, а WAL-архив пуст | archive_command падал неделями | Алерт на pg_stat_archiver.failed_count; тест wal-fetch ежесуточно |
| Restore занял 9 часов вместо часа | Не мерили скорость восстановления | Параллельный restore (pg_restore -j), быстрые диски под restore |
| Восстановились на ночь, потеряли день работы | Не знали точный T_bad | Аудит/логи приложений обязаны давать время ошибки |
| Бэкапы лежат рядом с продом | Один аккаунт/бакет/регион | Отдельный аккаунт+регион, immutability/object-lock |
| После DROP TABLE нет ни одной копии таблицы | Логический дамп раз в неделю, без PITR | WAL-shipping + delayed logical replica |
| Ключи от бакета тоже зашифрованы/удалены | Крипто-инцидент затронул и бэкапы | KMS-ключи и креды вне основного периметра, offline-копия |

## 🧪 Hands-on Lab

```bash
# Полный цикл PITR локально в docker (безопасно ломать)
docker run -d --name pg-lab -e POSTGRES_PASSWORD=x -p 5433:5432 postgres:16

# 1. Данные до "аварии"
docker exec pg-lab psql -U postgres -c "CREATE TABLE t AS SELECT generate_series(1,1000) id;"
docker exec pg-lab psql -U postgres -c "SELECT pg_switch_wal();"

# 2. "Авария" и фиксация времени
date +%FT%T.%N%z   # запомнить!
docker exec pg-lab psql -U postgres -c "DROP TABLE t;"

# 3. Восстановление из basebackup + WAL
docker exec pg-lab pg_basebackup -U postgres -D /tmp/bkp -Fp
# ... остановить контейнер, поднять новый из /tmp/bkp c recovery_target_time
# (в lab-варианте проще: pg_dump до аварии + replay WAL до момента)

# 4. Проверить архивер в своём кластере прямо сейчас
psql -c "SELECT archived_count, failed_count FROM pg_stat_archiver;"
```

## ✅ Чек-лист зрелости темы

- [ ] RPO/RTO-матрица существует, утверждена и покрывает все данные продакшена
- [ ] PostgreSQL: WAL-shipping работает, `pg_stat_archiver` мониторится
- [ ] Восстановление на произвольную точку времени выполнялось за последние 90 дней
- [ ] Бэкапы хранятся в отдельном периметре с object-lock/immutability
- [ ] На каждый критичный сервис есть runbook с датой последней успешной тренировки
- [ ] Учения раз в квартал, фактические RPO/RTO сверяются с матрицей

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🚑 Симуляции | [Инцидент «WAL-архив пуст»](../17-break-fix/02-incident-simulations-part2.md) |
| 🛠️ Артефакт | [PRR: строка DR обязательна](../18-templates/05-production-readiness-review.md) |

---

## 🎤 Пять вопросов для повторения


**В1. Из каких двух компонентов состоит PITR-восстановление PostgreSQL на момент времени?**

<details><summary>Ответ</summary>

Базовый бэкап (backup-push/pg_basebackup) + непрерывный архив WAL (restore_command подтягивает сегменты). Восстановление: развернуть базу, указать recovery_target_time/recovery_target_lsn в postgresql.conf, создать recovery.signal и поднять.

</details>


**В2. Требуется RPO = 5 минут для транзакционной БД. Какой механизм его обеспечивает и почему ночного дампа недостаточно?**

<details><summary>Ответ</summary>

Непрерывный WAL-shipping с archive_timeout ~60с: любая закоммиченная транзакция попадает в архив максимум через минуту. Ночной дамп даёт RPO до 24 часов — потеря целого дня данных между аварией и последним бэкапом.

</details>


**В3. Что мониторить в pg_stat_archiver и о чём говорит растущий failed_count?**

<details><summary>Ответ</summary>

archived_count, failed_count, last_archived_time/last_failed_time. Растущий failed_count означает, что archive_command падает (переполненный бакет, права, сеть) — PITR молча теряет точность: формально бэкапы есть, восстановиться на свежий момент нельзя.

</details>


**В4. Назовите три независимых способа, которыми система бэкапов может дать ложную уверенность.**

<details><summary>Ответ</summary>

1) Джоба зелёная, но внутри скрипта ошибка проглатывается (|| true) — проверять размер относительно среднего. 2) Полные бэкапы есть, но WAL не шиппятся. 3) Бэкап разворачивается недопустимо долго (RTO сутки) — скорость restore мерить заранее, держать staging-копию.

</details>


**В5. Когда отложенная логическая реплика удобнее полного PITR?**

<details><summary>Ответ</summary>

Для точечных ошибок уровня строк/таблицы (DROP TABLE, ошибочный UPDATE): apply_delay='2h' даёт машину времени, из которой можно достать только нужные данные без восстановления всего кластера на отдельном железе. Полный PITR нужен при порче физического состояния или массовой потере.

</details>
