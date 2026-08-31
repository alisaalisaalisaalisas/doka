/* Global Playground: Data — PostgreSQL, ClickHouse, Kafka, RabbitMQ, Redis, MongoDB, Ceph — 30 scenarios */
S("PostgreSQL","gdata-1","Долгие транзакции блокируют vacuum — idle in transaction","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>Долгие транзакции блокируют vacuum — idle in transaction</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Долгие транзакции блокируют vacuum — idle in transaction</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти долгие транзакции</li><li>[ ] убить</li><li>[ ] проверить распределение</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти долгие транзакции → убить → проверить распределение.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
 ["^psql -c \"SELECT pid, state, now\\(\\)-xact_start AS age FROM pg_stat_activity WHERE state <> 'idle' ORDER BY xact_start\" 2>&1 \\| head -20",`4321 | idle in transaction | 02:14:33`,"err"],
 ["^psql -c \"SELECT pg_terminate_backend\\(4321\\)\"",`t`,"ok"],
 ["^psql -c \"SELECT state, count\\(\\*\\) FROM pg_stat_activity GROUP BY state\" 2>&1 \\| head -10",`active 12\nidle 40`,"ok"]
],
[{re:"^psql -c \"SELECT pid, state",l:"найти долгие транзакции"},
 {re:"^psql -c \"SELECT pg_terminate_backend",l:"убить"},
 {re:"^psql -c \"SELECT state, count",l:"проверить распределение"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Долгие транзакции блокируют vacuum — idle in transaction\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Долгие транзакции блокируют vacuum — idle in transaction — fixed\nstatus: ok\n`}},{hints:["Симптом: Долгие транзакции блокируют vacuum — idle in transaction в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: найти долгие транзакции → убить → проверить распределение"]});

S("PostgreSQL","gdata-2","max_connections исчерпан — FATAL too many clients","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>max_connections исчерпан — FATAL too many clients</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>max_connections исчерпан — FATAL too many clients</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить лимит</li><li>[ ] посчитать коннекты</li><li>[ ] поднять</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить лимит → посчитать коннекты → поднять.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
 ["^psql -c \"SHOW max_connections\" 2>&1 \\| tail -5",`100`,"warn"],
 ["^psql -c \"SELECT count\\(\\*\\) FROM pg_stat_activity\" 2>&1 \\| tail -5",`99`,"err"],
 ["^psql -c \"ALTER SYSTEM SET max_connections = 300\" 2>&1 \\| tail -5",`ALTER SYSTEM`,"ok"],
 ["^psql -c \"SELECT pg_reload_conf\\(\\)\" 2>&1 \\| tail -5",`t`,"ok"],
 ["^psql -c \"SHOW max_connections\" 2>&1 \\| tail -5",`300`,"ok"]
],
[{re:"^psql -c \"SHOW max_connections\"",l:"проверить лимит"},
 {re:"^psql -c \"SELECT count",l:"посчитать коннекты"},
 {re:"^psql -c \"ALTER SYSTEM SET max_connections",l:"поднять"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: max_connections исчерпан — FATAL too many clients\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: max_connections исчерпан — FATAL too many clients — fixed\nstatus: ok\n`}},{hints:["Симптом: max_connections исчерпан — FATAL too many clients в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: проверить лимит → посчитать коннекты → поднять"]});

S("PostgreSQL","gdata-3","Реплика отстала — replay_lag 4 минуты","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>Реплика отстала — replay_lag 4 минуты</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Реплика отстала — replay_lag 4 минуты</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] лаг реплики</li><li>[ ] проверить replay</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: лаг реплики → проверить replay.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
 ["^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\" 2>&1 \\| head -10",`replica-1 | 00:04:12`,"warn"],
 ["^psql -c \"SELECT pg_last_wal_replay_lag\\(\\)\" 2>&1 \\| tail -5",`00:04:12`,"err"],
 ["^psql -c \"SELECT pg_last_wal_replay_lag\\(\\)\" 2>&1 \\| tail -5",`00:00:00`,"ok"]
],
[{re:"^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"",l:"лаг реплики"},
 {re:"^psql -c \"SELECT pg_last_wal_replay_lag",l:"проверить replay"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Реплика отстала — replay_lag 4 минуты\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Реплика отстала — replay_lag 4 минуты — fixed\nstatus: ok\n`}},{hints:["Симптом: Реплика отстала — replay_lag 4 минуты в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: лаг реплики → проверить replay"]});

S("PostgreSQL","gdata-4","Реплика мертва — пересоздать через pg_basebackup","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>Реплика мертва — пересоздать через pg_basebackup</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Реплика мертва — пересоздать через pg_basebackup</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] пересоздать data-dir</li><li>[ ] проверить роль</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -h primary -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: пересоздать data-dir → проверить роль.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@replica:~$",
[
 ["^psql -h primary -c \"SELECT state FROM pg_stat_replication\" 2>&1 \\| head -10",`(нет нашей реплики)`,"err"],
 ["^pg_basebackup -h primary -D /var/lib/postgresql/16/main -U replicator -P -R -X stream 2>&1 \\| tail -5",`24573/24573 MB \\(100%\\)`,"ok"],
 ["^systemctl start postgresql@16-main 2>&1 \\| tail -5",`started`,"ok"],
 ["^psql -c \"SELECT pg_is_in_recovery\\(\\), pg_last_wal_replay_lag\\(\\)\" 2>&1 \\| tail -5",`t | 00:00:00`,"ok"]
],
[{re:"^pg_basebackup -h primary -D /var/lib/postgresql/16/main",l:"пересоздать data-dir"},
 {re:"^psql -c \"SELECT pg_is_in_recovery",l:"проверить роль"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Реплика мертва — пересоздать через pg_basebackup\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Реплика мертва — пересоздать через pg_basebackup — fixed\nstatus: ok\n`}},{hints:["Симптом: Реплика мертва — пересоздать через pg_basebackup в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: пересоздать data-dir → проверить роль"]});

S("PostgreSQL","gdata-5","PITR: восстановить на 13:59 до DELETE без WHERE","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>PITR: восстановить на 13:59 до DELETE без WHERE</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PITR: восстановить на 13:59 до DELETE без WHERE</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить архив WAL</li><li>[ ] настроить PITR</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить архив WAL → настроить PITR.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@restore:~$",
[
 ["^psql -c \"SELECT \\* FROM pg_stat_archiver\" 2>&1 \\| grep -A2 archived_count",`archived_count: 8120 failed:0`,"ok"],
 ["^cat /var/lib/postgresql/16/main/postgresql.auto.conf 2>&1 \\| grep -A2 recovery_target_time",`recovery_target_time = '2026-08-24 13:59:59'`,"ok"],
 ["^psql -c \"SELECT count\\(\\*\\) FROM shop.orders\" 2>&1 \\| tail -5",`12420`,"ok"]
],
[{re:"^psql -c \"SELECT \\* FROM pg_stat_archiver\"",l:"проверить архив WAL"},
 {re:"recovery_target_time",l:"настроить PITR"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: PITR: восстановить на 13:59 до DELETE без WHERE\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: PITR: восстановить на 13:59 до DELETE без WHERE — fixed\nstatus: ok\n`}},{hints:["Симптом: PITR: восстановить на 13:59 до DELETE без WHERE в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: проверить архив WAL → настроить PITR"]});

S("PostgreSQL","gdata-6","Медленный запрос: Seq Scan → индекс за 1 сек","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>Медленный запрос: Seq Scan → индекс за 1 сек</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Медленный запрос: Seq Scan → индекс за 1 сек</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] профилировать план</li><li>[ ] создать индекс</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: профилировать план → создать индекс.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
 ["^psql -c \"EXPLAIN \\(ANALYZE, BUFFERS\\) SELECT \\* FROM users WHERE email='a@b.c'\" 2>&1 \\| grep -A2 \"Seq Scan\"",`Seq Scan on users cost=0.00..2435 rows=1 actual time=0.4..1180`,"err"],
 ["^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users\\(email\\)\" 2>&1 \\| tail -5",`CREATE INDEX`,"ok"],
 ["^psql -c \"EXPLAIN \\(ANALYZE\\) SELECT \\* FROM users WHERE email='a@b.c'\" 2>&1 \\| grep -A2 \"Index Scan\"",`Index Scan using idx_users_email actual time=0.03`,"ok"]
],
[{re:"^psql -c \"EXPLAIN",l:"профилировать план"},
 {re:"^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email",l:"создать индекс"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Медленный запрос: Seq Scan → индекс за 1 сек\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Медленный запрос: Seq Scan → индекс за 1 сек — fixed\nstatus: ok\n`}},{hints:["Симптом: Медленный запрос: Seq Scan → индекс за 1 сек в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: профилировать план → создать индекс"]});

S("PostgreSQL","gdata-7","Bloat: таблица в 3x больше данных — нужен VACUUM FULL","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Bloat: таблица в 3x больше данных — нужен VACUUM FULL</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Bloat: таблица в 3x больше данных — нужен VACUUM FULL</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] размер таблицы</li><li>[ ] почистить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: размер таблицы → почистить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
 ["^psql -c \"SELECT pg_size_pretty\\(pg_total_relation_size\\('orders'\\)\\)\" 2>&1 \\| tail -5",`42 GB`,"err"],
 ["^psql -c \"SELECT n_dead_tup FROM pg_stat_all_tables WHERE relname='orders'\" 2>&1 \\| tail -5",`18234012`,"err"],
 ["^psql -c \"VACUUM \\(FULL, ANALYZE\\) orders\" 2>&1 \\| tail -5",`VACUUM`,"ok"],
 ["^psql -c \"SELECT pg_size_pretty\\(pg_total_relation_size\\('orders'\\)\\)\" 2>&1 \\| tail -5",`14 GB`,"ok"]
],
[{re:"^psql -c \"SELECT pg_size_pretty",l:"размер таблицы"},
 {re:"^psql -c \"VACUUM",l:"почистить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Bloat: таблица в 3x больше данных — нужен VACUUM FULL\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Bloat: таблица в 3x больше данных — нужен VACUUM FULL — fixed\nstatus: ok\n`}},{hints:["Симптом: Bloat: таблица в 3x больше данных — нужен VACUUM FULL в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: размер таблицы → почистить"]});

S("PostgreSQL","gdata-8","Patroni: switchover — перевести primary","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Patroni: switchover — перевести primary</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Patroni: switchover — перевести primary</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] список кластера</li><li>[ ] переключить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>patronictl -c /etc/patroni.yml</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: список кластера → переключить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
 ["^patronictl -c /etc/patroni.yml list 2>&1 \\| head -10",`prod Leader pg1\nprod Replica pg2`,"ok"],
 ["^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force 2>&1 \\| tail -10",`Switched over`,"ok"],
 ["^patronictl -c /etc/patroni.yml list 2>&1 \\| head -10",`prod Leader pg2`,"ok"]
],
[{re:"^patronictl -c /etc/patroni.yml list",l:"список кластера"},
 {re:"^patronictl -c /etc/patroni.yml switchover",l:"переключить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Patroni: switchover — перевести primary\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Patroni: switchover — перевести primary — fixed\nstatus: ok\n`}},{hints:["Симптом: Patroni: switchover — перевести primary в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: список кластера → переключить"]});

S("ClickHouse","gdata-9","Топ тяжёлых запросов по query_log","Senior", `<h3>Контекст</h3><p>ClickHouse: <b>Топ тяжёлых запросов по query_log</b>. Работа с <code>project/-query-log.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Топ тяжёлых запросов по query_log</b>. Файл <code>project/-query-log.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] топ запросов</li><li>[ ] убить тяжёлый</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-query-log.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-query-log.yaml</code>. Активный файл открыт в редакторе. Начните с <code>clickhouse-client --query \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: топ запросов → убить тяжёлый.</p><h3>Проверка</h3><pre>cat project/-query-log.yaml<br>проверить код</pre>`,
"dev@ch:~$",
[
 ["^clickhouse-client --query \"SELECT query, read_rows, memory_usage FROM system.query_log WHERE type='QueryFinish' ORDER BY read_bytes DESC LIMIT 3\" 2>&1 \\| head -10",`SELECT * FROM events WHERE ... 42GB`,"warn"],
 ["^clickhouse-client --query \"KILL QUERY WHERE query_id='2-123'\" 2>&1 \\| tail -5",`Killed`,"ok"]
],
[{re:"^clickhouse-client --query \"SELECT query, read_rows",l:"топ запросов"},
 {re:"KILL QUERY",l:"убить тяжёлый"}],{file:"project/-query-log.yaml",files:{"project/-query-log.yaml":`# ClickHouse: Топ тяжёлых запросов по query_log\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-query-log.yaml":`# ClickHouse: Топ тяжёлых запросов по query_log — fixed\nstatus: ok\n`}},{hints:["Симптом: Топ тяжёлых запросов по query_log в project/-query-log.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-query-log.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-query-log.yaml.","Порядок: топ запросов → убить тяжёлый"]});

S("ClickHouse","gdata-10","Too many parts — мелкие вставки по 1 строке","Middle", `<h3>Контекст</h3><p>ClickHouse: <b>Too many parts — мелкие вставки по 1 строке</b>. Работа с <code>project/too-many-parts-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Too many parts — мелкие вставки по 1 строке</b>. Файл <code>project/too-many-parts-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть parts</li><li>[ ] проверить after</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/too-many-parts-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/too-many-parts-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>clickhouse-client --query \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть parts → проверить after.</p><h3>Проверка</h3><pre>cat project/too-many-parts-.yaml<br>проверить код</pre>`,
"dev@ch:~$",
[
 ["^clickhouse-client --query \"SELECT count\\(\\) FROM system.parts WHERE active=0\" 2>&1 \\| tail -5",`300`,"err"],
 ["^cat app.py \\| grep -A2 \"insert\"",`insert row by row`,"err"],
 ["^clickhouse-client --query \"SELECT count\\(\\) FROM system.parts WHERE active=1\" 2>&1 \\| tail -5",`12`,"ok"]
],
[{re:"^clickhouse-client --query \"SELECT count\\(\\) FROM system.parts WHERE active=0\"",l:"посмотреть parts"},
 {re:"system\\.parts",l:"проверить after"}],{file:"project/too-many-parts-.yaml",files:{"project/too-many-parts-.yaml":`# ClickHouse: Too many parts — мелкие вставки по 1 строке\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/too-many-parts-.yaml":`# ClickHouse: Too many parts — мелкие вставки по 1 строке — fixed\nstatus: ok\n`}},{hints:["Симптом: Too many parts — мелкие вставки по 1 строке в project/too-many-parts-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/too-many-parts-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/too-many-parts-.yaml.","Порядок: посмотреть parts → проверить after"]});

S("ClickHouse","gdata-11","ReplicatedMergeTree: реплика отстала — queue 1200","Middle", `<h3>Контекст</h3><p>ClickHouse: <b>ReplicatedMergeTree: реплика отстала — queue 1200</b>. Работа с <code>project/replicatedmerge.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ReplicatedMergeTree: реплика отстала — queue 1200</b>. Файл <code>project/replicatedmerge.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить queue</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/replicatedmerge.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/replicatedmerge.yaml</code>. Активный файл открыт в редакторе. Начните с <code>clickhouse-client --query \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить queue.</p><h3>Проверка</h3><pre>cat project/replicatedmerge.yaml<br>проверить код</pre>`,
"dev@ch:~$",
[
 ["^clickhouse-client --query \"SELECT replica_name, queue_size, log_pointer FROM system.replicas\" 2>&1 \\| head -10",`replica-2 queue_size 1200`,"err"],
 ["^clickhouse-client --query \"SYSTEM RESTART REPLICA api.events\" 2>&1 \\| tail -5",`ok`,"ok"]
],
[{re:"^clickhouse-client --query \"SELECT replica_name, queue_size",l:"проверить queue"}],{file:"project/replicatedmerge.yaml",files:{"project/replicatedmerge.yaml":`# ClickHouse: ReplicatedMergeTree: реплика отстала — queue 1200\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/replicatedmerge.yaml":`# ClickHouse: ReplicatedMergeTree: реплика отстала — queue 1200 — fixed\nstatus: ok\n`}},{hints:["Симптом: ReplicatedMergeTree: реплика отстала — queue 1200 в project/replicatedmerge.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/replicatedmerge.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/replicatedmerge.yaml.","Порядок: проверить queue"]});

S("ClickHouse","gdata-12","TTL: данные старше 30 дней не удаляются","Middle", `<h3>Контекст</h3><p>ClickHouse: <b>TTL: данные старше 30 дней не удаляются</b>. Работа с <code>project/ttl-30-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>TTL: данные старше 30 дней не удаляются</b>. Файл <code>project/ttl-30-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить TTL</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ttl-30-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ttl-30-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>clickhouse-client --query \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить TTL.</p><h3>Проверка</h3><pre>cat project/ttl-30-.yaml<br>проверить код</pre>`,
"dev@ch:~$",
[
 ["^clickhouse-client --query \"SHOW CREATE TABLE events\" 2>&1 \\| grep -i ttl",`TTL event_time + INTERVAL 30 DAY`,"ok"],
 ["^clickhouse-client --query \"SELECT min\\(event_time\\) FROM events\" 2>&1 \\| tail -5",`2026-05-01`,"warn"]
],
[{re:"SHOW CREATE TABLE events",l:"проверить TTL"}],{file:"project/ttl-30-.yaml",files:{"project/ttl-30-.yaml":`# ClickHouse: TTL: данные старше 30 дней не удаляются\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ttl-30-.yaml":`# ClickHouse: TTL: данные старше 30 дней не удаляются — fixed\nstatus: ok\n`}},{hints:["Симптом: TTL: данные старше 30 дней не удаляются в project/ttl-30-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ttl-30-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ttl-30-.yaml.","Порядок: проверить TTL"]});

S("Kafka","gdata-13","Consumer lag 4900 — масштабировать консьюмеров","Middle", `<h3>Контекст</h3><p>Kafka: <b>Consumer lag 4900 — масштабировать консьюмеров</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Consumer lag 4900 — масштабировать консьюмеров</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] измерить лаг</li><li>[ ] масштабировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups\\\\.sh --b</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: измерить лаг → масштабировать.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups\\.sh --bootstrap-server kafka:9092 --describe --group orders 2>&1 \\| head -10",`orders 0 100 5000 4900`,"err"],
 ["^kafka-consumer-groups\\.sh --bootstrap-server kafka:9092 --describe --group orders --members 2>&1 \\| head -10",`consumer-1 host=worker-1`,"dim"],
 ["^kubectl -n prod scale deploy orders-consumer --replicas=4 2>&1 \\| tail -5",`scaled`,"ok"],
 ["^kafka-consumer-groups\\.sh --bootstrap-server kafka:9092 --describe --group orders 2>&1 \\| grep LAG",`LAG 0`,"ok"]
],
[{re:"^kafka-consumer-groups\\.sh --bootstrap-server kafka:9092 --describe --group orders",l:"измерить лаг"},
 {re:"^kubectl -n prod scale deploy orders-consumer --replicas=4",l:"масштабировать"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Consumer lag 4900 — масштабировать консьюмеров\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Consumer lag 4900 — масштабировать консьюмеров — fixed\nstatus: ok\n`}},{hints:["Симптом: Consumer lag 4900 — масштабировать консьюмеров в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: измерить лаг → масштабировать"]});

S("Kafka","gdata-14","Создать топик orders.paid с 6 партициями","Junior", `<h3>Контекст</h3><p>Kafka: <b>Создать топик orders.paid с 6 партициями</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Создать топик orders.paid с 6 партициями</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics\\\\.sh --bootstrap-</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать → проверить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics\\.sh --bootstrap-server kafka:9092 --create --topic orders\\.paid --partitions 6 --replication-factor 3 2>&1 \\| tail -5",`Created topic orders.paid`,"ok"],
 ["^kafka-topics\\.sh --bootstrap-server kafka:9092 --describe --topic orders\\.paid 2>&1 \\| grep PartitionCount",`PartitionCount: 6`,"ok"]
],
[{re:"^kafka-topics\\.sh --bootstrap-server kafka:9092 --create --topic orders\\.paid",l:"создать"},
 {re:"^kafka-topics\\.sh --bootstrap-server kafka:9092 --describe --topic orders\\.paid",l:"проверить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Создать топик orders.paid с 6 партициями\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Создать топик orders.paid с 6 партициями — fixed\nstatus: ok\n`}},{hints:["Симптом: Создать топик orders.paid с 6 партициями в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: создать → проверить"]});

S("Kafka","gdata-15","Poison pill: сдвинуть offset после DLQ","Senior", `<h3>Контекст</h3><p>Kafka: <b>Poison pill: сдвинуть offset после DLQ</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Poison pill: сдвинуть offset после DLQ</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти застрявшую</li><li>[ ] сдвинуть offset</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups\\\\.sh --b</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти застрявшую → сдвинуть offset.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups\\.sh --bootstrap-server kafka:9092 --describe --group orders 2>&1 \\| grep \"2 \" \\| head -5",`PARTITION 2 LAG 1`,"err"],
 ["^kafka-consumer-groups\\.sh --bootstrap-server kafka:9092 --reset-offsets --group orders --topic orders --partition 2 --to-offset 43 --execute 2>&1 \\| tail -5",`NEW-OFFSET 43`,"ok"]
],
[{re:"^kafka-consumer-groups\\.sh --bootstrap-server kafka:9092 --describe --group orders",l:"найти застрявшую"},
 {re:"^kafka-consumer-groups\\.sh --bootstrap-server kafka:9092 --reset-offsets --group orders",l:"сдвинуть offset"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Poison pill: сдвинуть offset после DLQ\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Poison pill: сдвинуть offset после DLQ — fixed\nstatus: ok\n`}},{hints:["Симптом: Poison pill: сдвинуть offset после DLQ в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: найти застрявшую → сдвинуть offset"]});

S("Kafka","gdata-16","Kafka: ISR shrink — реплика не в ISR","Senior", `<h3>Контекст</h3><p>Kafka: <b>Kafka: ISR shrink — реплика не в ISR</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kafka: ISR shrink — реплика не в ISR</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти URP</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics\\\\.sh --bootstrap-</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти URP.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics\\.sh --bootstrap-server kafka:9092 --describe --under-replicated 2>&1 \\| head -10",`Topic: orders Partition: 2 Replicas: 1,2,3 Isr: 1,2`,"err"],
 ["^kafka-broker-api-versions\\.sh --bootstrap-server kafka:9092 2>&1 \\| head -5",`kafka 3.7`,"dim"]
],
[{re:"^kafka-topics\\.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"найти URP"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Kafka: ISR shrink — реплика не в ISR\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Kafka: ISR shrink — реплика не в ISR — fixed\nstatus: ok\n`}},{hints:["Симптом: Kafka: ISR shrink — реплика не в ISR в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: найти URP"]});

S("RabbitMQ","gdata-17","Очередь растёт — prefetch 1 и 1 консьюмер","Middle", `<h3>Контекст</h3><p>RabbitMQ: <b>Очередь растёт — prefetch 1 и 1 консьюмер</b>. Работа с <code>project/-prefetch-1-1-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Очередь растёт — prefetch 1 и 1 консьюмер</b>. Файл <code>project/-prefetch-1-1-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] очередь</li><li>[ ] масштабировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-prefetch-1-1-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-prefetch-1-1-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>rabbitmqctl list_queues name m</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: очередь → масштабировать.</p><h3>Проверка</h3><pre>cat project/-prefetch-1-1-.yaml<br>проверить код</pre>`,
"dev@rabbit:~$",
[
 ["^rabbitmqctl list_queues name messages_ready consumers 2>&1 \\| grep orders",`orders.billing 12000 1`,"err"],
 ["^rabbitmqctl list_consumers 2>&1 \\| grep -A2 billing",`prefetch=1`,"warn"],
 ["^kubectl scale deploy billing --replicas=4 -n prod 2>&1 \\| tail -3",`scaled`,"ok"],
 ["^rabbitmqctl list_queues name messages_ready 2>&1 \\| grep billing",`orders.billing 40`,"ok"]
],
[{re:"^rabbitmqctl list_queues name messages_ready consumers",l:"очередь"},
 {re:"^kubectl scale deploy billing --replicas=4",l:"масштабировать"}],{file:"project/-prefetch-1-1-.yaml",files:{"project/-prefetch-1-1-.yaml":`# RabbitMQ: Очередь растёт — prefetch 1 и 1 консьюмер\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-prefetch-1-1-.yaml":`# RabbitMQ: Очередь растёт — prefetch 1 и 1 консьюмер — fixed\nstatus: ok\n`}},{hints:["Симптом: Очередь растёт — prefetch 1 и 1 консьюмер в project/-prefetch-1-1-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-prefetch-1-1-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-prefetch-1-1-.yaml.","Порядок: очередь → масштабировать"]});

S("RabbitMQ","gdata-18","Publishers blocked — memory alarm 41%","Senior", `<h3>Контекст</h3><p>RabbitMQ: <b>Publishers blocked — memory alarm 41%</b>. Работа с <code>project/publishers-bloc.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Publishers blocked — memory alarm 41%</b>. Файл <code>project/publishers-bloc.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] blocked?</li><li>[ ] причина alarm</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/publishers-bloc.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/publishers-bloc.yaml</code>. Активный файл открыт в редакторе. Начните с <code>rabbitmqctl list_connections n</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: blocked? → причина alarm.</p><h3>Проверка</h3><pre>cat project/publishers-bloc.yaml<br>проверить код</pre>`,
"dev@rabbit:~$",
[
 ["^rabbitmqctl list_connections name state 2>&1 \\| grep blocked",`app-1 blocked`,"err"],
 ["^rabbitmq-diagnostics memory_breakdown 2>&1 \\| grep -A2 alarm",`memory alarm`,"warn"],
 ["^rabbitmqctl purge_queue orders.billing 2>&1 \\| tail -3",`purged`,"ok"]
],
[{re:"^rabbitmqctl list_connections name state",l:"blocked?"},
 {re:"^rabbitmq-diagnostics memory_breakdown",l:"причина alarm"}],{file:"project/publishers-bloc.yaml",files:{"project/publishers-bloc.yaml":`# RabbitMQ: Publishers blocked — memory alarm 41%\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/publishers-bloc.yaml":`# RabbitMQ: Publishers blocked — memory alarm 41% — fixed\nstatus: ok\n`}},{hints:["Симптом: Publishers blocked — memory alarm 41% в project/publishers-bloc.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/publishers-bloc.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/publishers-bloc.yaml.","Порядок: blocked? → причина alarm"]});

S("RabbitMQ","gdata-19","Exchange не роутит — нет binding","Middle", `<h3>Контекст</h3><p>RabbitMQ: <b>Exchange не роутит — нет binding</b>. Работа с <code>project/exchange-bindin.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Exchange не роутит — нет binding</b>. Файл <code>project/exchange-bindin.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить биндинги</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/exchange-bindin.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/exchange-bindin.yaml</code>. Активный файл открыт в редакторе. Начните с <code>rabbitmqctl list_bindings sour</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить биндинги.</p><h3>Проверка</h3><pre>cat project/exchange-bindin.yaml<br>проверить код</pre>`,
"dev@rabbit:~$",
[
 ["^rabbitmqctl list_bindings source_name destination_name routing_key 2>&1 \\| grep orders",`(пусто)`,"err"],
 ["^rabbitmqctl list_exchanges name type 2>&1 \\| grep orders",`orders direct`,"ok"],
 ["^rabbitmqadmin declare binding source=orders destination=orders.billing routing_key=billing 2>&1 \\| tail -3",`binding declared`,"ok"]
],
[{re:"^rabbitmqctl list_bindings source_name",l:"проверить биндинги"}],{file:"project/exchange-bindin.yaml",files:{"project/exchange-bindin.yaml":`# RabbitMQ: Exchange не роутит — нет binding\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/exchange-bindin.yaml":`# RabbitMQ: Exchange не роутит — нет binding — fixed\nstatus: ok\n`}},{hints:["Симптом: Exchange не роутит — нет binding в project/exchange-bindin.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/exchange-bindin.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/exchange-bindin.yaml.","Порядок: проверить биндинги"]});

S("Redis","gdata-20","Найти большие ключи --bigkeys","Middle", `<h3>Контекст</h3><p>Redis: <b>Найти большие ключи --bigkeys</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Найти большие ключи --bigkeys</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] поиск больших ключей</li><li>[ ] размер ключа</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --bigkeys 2>&1 \\\\| t</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: поиск больших ключей → размер ключа.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --bigkeys 2>&1 \\| tail -10",`Biggest list queue:events 1200000 items`,"warn"],
 ["^redis-cli memory usage queue:events 2>&1 \\| tail -5",`96000000`,"warn"],
 ["^redis-cli --cluster check 127\\.0\\.0\\.1:7000 2>&1 \\| grep used_memory_human",`used_memory_human:8.20G`,"ok"]
],
[{re:"^redis-cli --bigkeys",l:"поиск больших ключей"},
 {re:"^redis-cli memory usage queue:events",l:"размер ключа"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Найти большие ключи --bigkeys\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Найти большие ключи --bigkeys — fixed\nstatus: ok\n`}},{hints:["Симптом: Найти большие ключи --bigkeys в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: поиск больших ключей → размер ключа"]});

S("Redis","gdata-21","Cluster slot not covered — CLUSTERDOWN","Senior", `<h3>Контекст</h3><p>Redis: <b>Cluster slot not covered — CLUSTERDOWN</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cluster slot not covered — CLUSTERDOWN</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить слоты</li><li>[ ] починить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить слоты → починить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127\\.0\\.0\\.1:7000 2>&1 \\| grep -i ERR",`slot 0 unassigned`,"err"],
 ["^redis-cli --cluster fix 127\\.0\\.0\\.1:7000 --cluster-yes 2>&1 \\| tail -5",`slot 0 assigned`,"ok"],
 ["^redis-cli --cluster check 127\\.0\\.0\\.1:7000 2>&1 \\| grep OK",`All 16384 slots covered`,"ok"]
],
[{re:"^redis-cli --cluster check 127\\.0\\.0\\.1:7000",l:"проверить слоты"},
 {re:"^redis-cli --cluster fix 127\\.0\\.0\\.1:7000",l:"починить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Cluster slot not covered — CLUSTERDOWN\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Cluster slot not covered — CLUSTERDOWN — fixed\nstatus: ok\n`}},{hints:["Симптом: Cluster slot not covered — CLUSTERDOWN в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: проверить слоты → починить"]});

S("Redis","gdata-22","Slowlog: найти медленные команды","Middle", `<h3>Контекст</h3><p>Redis: <b>Slowlog: найти медленные команды</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Slowlog: найти медленные команды</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] лог медленных</li><li>[ ] порог</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli slowlog get 10 2>&1 </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: лог медленных → порог.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli slowlog get 10 2>&1 \\| head -20",`1\\) KEYS *`,"warn"],
 ["^redis-cli config get slowlog-log-slower-than 2>&1 \\| tail -5",`10000`,"ok"],
 ["^redis-cli config set slowlog-log-slower-than 5000",`OK`,"ok"]
],
[{re:"^redis-cli slowlog get 10",l:"лог медленных"},
 {re:"^redis-cli config get slowlog-log-slower-than",l:"порог"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Slowlog: найти медленные команды\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Slowlog: найти медленные команды — fixed\nstatus: ok\n`}},{hints:["Симптом: Slowlog: найти медленные команды в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: лог медленных → порог"]});

S("MongoDB","gdata-23","ReplicaSet: PRIMARY down — кто новый primary","Middle", `<h3>Контекст</h3><p>MongoDB: <b>ReplicaSet: PRIMARY down — кто новый primary</b>. Работа с <code>project/replicaset-prim.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ReplicaSet: PRIMARY down — кто новый primary</b>. Файл <code>project/replicaset-prim.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус репликасета</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/replicaset-prim.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/replicaset-prim.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус репликасета.</p><h3>Проверка</h3><pre>cat project/replicaset-prim.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.status\\(\\)\" 2>&1 \\| grep -A2 stateStr",`PRIMARY mongo-0\nSECONDARY mongo-1`,"ok"],
 ["^mongosh --eval \"rs.status\\(\\)\" 2>&1 \\| grep -A5 members",`health: 1`,"ok"]
],
[{re:"rs\\.status",l:"статус репликасета"}],{file:"project/replicaset-prim.yaml",files:{"project/replicaset-prim.yaml":`# MongoDB: ReplicaSet: PRIMARY down — кто новый primary\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/replicaset-prim.yaml":`# MongoDB: ReplicaSet: PRIMARY down — кто новый primary — fixed\nstatus: ok\n`}},{hints:["Симптом: ReplicaSet: PRIMARY down — кто новый primary в project/replicaset-prim.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/replicaset-prim.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/replicaset-prim.yaml.","Порядок: статус репликасета"]});

S("MongoDB","gdata-24","Индекс не используется — COLLSCAN на users.email","Middle", `<h3>Контекст</h3><p>MongoDB: <b>Индекс не используется — COLLSCAN на users.email</b>. Работа с <code>project/-collscan-users.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Индекс не используется — COLLSCAN на users.email</b>. Файл <code>project/-collscan-users.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти скан</li><li>[ ] создать индекс</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-collscan-users.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-collscan-users.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти скан → создать индекс.</p><h3>Проверка</h3><pre>cat project/-collscan-users.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.users.find\\(\\{email:'a@b.c'\\}\\).explain\\('executionStats'\\)\" 2>&1 \\| grep -A2 COLLSCAN",`COLLSCAN`,"err"],
 ["^mongosh --eval \"db.users.createIndex\\(\\{email:1\\}\\)\" 2>&1 \\| tail -5",`created`,"ok"],
 ["^mongosh --eval \"db.users.find\\(\\{email:'a@b.c'\\}\\).explain\\(\\)\" 2>&1 \\| grep -A2 IXSCAN",`IXSCAN`,"ok"]
],
[{re:"COLLSCAN",l:"найти скан"},
 {re:"createIndex",l:"создать индекс"}],{file:"project/-collscan-users.yaml",files:{"project/-collscan-users.yaml":`# MongoDB: Индекс не используется — COLLSCAN на users.email\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-collscan-users.yaml":`# MongoDB: Индекс не используется — COLLSCAN на users.email — fixed\nstatus: ok\n`}},{hints:["Симптом: Индекс не используется — COLLSCAN на users.email в project/-collscan-users.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-collscan-users.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-collscan-users.yaml.","Порядок: найти скан → создать индекс"]});

S("MongoDB","gdata-25","Oplog window мал — реплика не догоняет","Senior", `<h3>Контекст</h3><p>MongoDB: <b>Oplog window мал — реплика не догоняет</b>. Работа с <code>project/oplog-window-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Oplog window мал — реплика не догоняет</b>. Файл <code>project/oplog-window-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] окно oplog</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/oplog-window-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/oplog-window-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: окно oplog.</p><h3>Проверка</h3><pre>cat project/oplog-window-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.printReplicationInfo\\(\\)\" 2>&1 \\| grep -A2 \"oplog window\"",`oplog window 2 hours`,"warn"],
 ["^mongosh --eval \"db.adminCommand\\(\\{replSetResizeOplog:1, size: 10240\\}\\)\" 2>&1 \\| tail -5",`ok`,"ok"]
],
[{re:"rs\\.printReplicationInfo",l:"окно oplog"}],{file:"project/oplog-window-.yaml",files:{"project/oplog-window-.yaml":`# MongoDB: Oplog window мал — реплика не догоняет\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/oplog-window-.yaml":`# MongoDB: Oplog window мал — реплика не догоняет — fixed\nstatus: ok\n`}},{hints:["Симптом: Oplog window мал — реплика не догоняет в project/oplog-window-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/oplog-window-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/oplog-window-.yaml.","Порядок: окно oplog"]});

S("MongoDB","gdata-26","Chunk migration: balancer застрял в sharding","Senior", `<h3>Контекст</h3><p>MongoDB: <b>Chunk migration: balancer застрял в sharding</b>. Работа с <code>project/chunk-migration.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Chunk migration: balancer застрял в sharding</b>. Файл <code>project/chunk-migration.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус шардинга</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/chunk-migration.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/chunk-migration.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус шардинга.</p><h3>Проверка</h3><pre>cat project/chunk-migration.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"sh.status\\(\\)\" 2>&1 \\| grep -A5 balancer",`balancer: enabled`,"ok"],
 ["^mongosh --eval \"sh.isBalancerRunning\\(\\)\" 2>&1 \\| tail -5",`false`,"warn"]
],
[{re:"sh\\.status",l:"статус шардинга"}],{file:"project/chunk-migration.yaml",files:{"project/chunk-migration.yaml":`# MongoDB: Chunk migration: balancer застрял в sharding\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/chunk-migration.yaml":`# MongoDB: Chunk migration: balancer застрял в sharding — fixed\nstatus: ok\n`}},{hints:["Симптом: Chunk migration: balancer застрял в sharding в project/chunk-migration.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/chunk-migration.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/chunk-migration.yaml.","Порядок: статус шардинга"]});

S("Ceph","gdata-27","Ceph HEALTH_WARN: 1 OSD down, PG degraded","Senior", `<h3>Контекст</h3><p>Ceph: <b>Ceph HEALTH_WARN: 1 OSD down, PG degraded</b>. Работа с <code>project/ceph-health-war.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Ceph HEALTH_WARN: 1 OSD down, PG degraded</b>. Файл <code>project/ceph-health-war.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус кластера</li><li>[ ] дерево OSD</li><li>[ ] вывести OSD</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ceph-health-war.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ceph-health-war.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ceph -s 2>&1 \\\\| head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус кластера → дерево OSD → вывести OSD.</p><h3>Проверка</h3><pre>cat project/ceph-health-war.yaml<br>проверить код</pre>`,
"dev@ceph:~$",
[
 ["^ceph -s 2>&1 \\| head -20",`health: HEALTH_WARN\n 1 osds down\n 12 pgs degraded`,"err"],
 ["^ceph osd tree 2>&1 \\| grep -A2 down",`osd.2 down`,"err"],
 ["^ceph osd out osd\\.2 2>&1 \\| tail -5",`marked out`,"ok"],
 ["^ceph -s 2>&1 \\| grep health",`HEALTH_OK`,"ok"]
],
[{re:"^ceph -s",l:"статус кластера"},
 {re:"^ceph osd tree",l:"дерево OSD"},
 {re:"^ceph osd out osd\\.2",l:"вывести OSD"}],{file:"project/ceph-health-war.yaml",files:{"project/ceph-health-war.yaml":`# Ceph: Ceph HEALTH_WARN: 1 OSD down, PG degraded\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ceph-health-war.yaml":`# Ceph: Ceph HEALTH_WARN: 1 OSD down, PG degraded — fixed\nstatus: ok\n`}},{hints:["Симптом: Ceph HEALTH_WARN: 1 OSD down, PG degraded в project/ceph-health-war.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ceph-health-war.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ceph-health-war.yaml.","Порядок: статус кластера → дерево OSD → вывести OSD"]});

S("Ceph","gdata-28","Ceph pool: nearfull 85% — добавить OSD или поднять ratio","Middle", `<h3>Контекст</h3><p>Ceph: <b>Ceph pool: nearfull 85% — добавить OSD или поднять ratio</b>. Работа с <code>project/ceph-pool-nearf.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Ceph pool: nearfull 85% — добавить OSD или поднять ratio</b>. Файл <code>project/ceph-pool-nearf.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] использование</li><li>[ ] по OSD</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ceph-pool-nearf.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ceph-pool-nearf.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ceph df 2>&1 \\\\| head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: использование → по OSD.</p><h3>Проверка</h3><pre>cat project/ceph-pool-nearf.yaml<br>проверить код</pre>`,
"dev@ceph:~$",
[
 ["^ceph df 2>&1 \\| head -20",`RAW STORAGE: 85% used`,"warn"],
 ["^ceph osd df 2>&1 \\| head -10",`osd.0 85%`,"warn"],
 ["^ceph osd pool get rbd target_max_bytes 2>&1 \\| tail -5",`target_max_bytes: 0`,"dim"]
],
[{re:"^ceph df",l:"использование"},
 {re:"^ceph osd df",l:"по OSD"}],{file:"project/ceph-pool-nearf.yaml",files:{"project/ceph-pool-nearf.yaml":`# Ceph: Ceph pool: nearfull 85% — добавить OSD или поднять ratio\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ceph-pool-nearf.yaml":`# Ceph: Ceph pool: nearfull 85% — добавить OSD или поднять ratio — fixed\nstatus: ok\n`}},{hints:["Симптом: Ceph pool: nearfull 85% — добавить OSD или поднять ratio в project/ceph-pool-nearf.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ceph-pool-nearf.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ceph-pool-nearf.yaml.","Порядок: использование → по OSD"]});

S("Ceph","gdata-29","RBD: снапшот и клон для тестовой БД","Middle", `<h3>Контекст</h3><p>Ceph: <b>RBD: снапшот и клон для тестовой БД</b>. Работа с <code>project/rbd-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>RBD: снапшот и клон для тестовой БД</b>. Файл <code>project/rbd-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] снапшот</li><li>[ ] список снапшотов</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rbd-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rbd-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>rbd snap create rbd/test@snap1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: снапшот → список снапшотов.</p><h3>Проверка</h3><pre>cat project/rbd-.yaml<br>проверить код</pre>`,
"dev@ceph:~$",
[
 ["^rbd snap create rbd/test@snap1 2>&1 \\| tail -3",`created`,"ok"],
 ["^rbd snap ls rbd/test 2>&1 \\| head -10",`snap1`,"ok"],
 ["^rbd clone rbd/test@snap1 rbd/test-clone 2>&1 \\| tail -3",`cloned`,"ok"]
],
[{re:"^rbd snap create rbd/test@snap1",l:"снапшот"},
 {re:"^rbd snap ls rbd/test",l:"список снапшотов"}],{file:"project/rbd-.yaml",files:{"project/rbd-.yaml":`# Ceph: RBD: снапшот и клон для тестовой БД\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rbd-.yaml":`# Ceph: RBD: снапшот и клон для тестовой БД — fixed\nstatus: ok\n`}},{hints:["Симптом: RBD: снапшот и клон для тестовой БД в project/rbd-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rbd-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rbd-.yaml.","Порядок: снапшот → список снапшотов"]});

S("Ceph","gdata-30","MinIO heal: 412 объектов требуют лечения","Senior", `<h3>Контекст</h3><p>Ceph: <b>MinIO heal: 412 объектов требуют лечения</b>. Работа с <code>project/minio-heal-412-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>MinIO heal: 412 объектов требуют лечения</b>. Файл <code>project/minio-heal-412-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус</li><li>[ ] лечение</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/minio-heal-412-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/minio-heal-412-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mc admin info prod 2>&1 \\\\| gr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус → лечение.</p><h3>Проверка</h3><pre>cat project/minio-heal-412-.yaml<br>проверить код</pre>`,
"dev@minio:~$",
[
 ["^mc admin info prod 2>&1 \\| grep -A2 drives",`2 drives online, 1 offline`,"err"],
 ["^mc admin heal prod/backups --dry-run 2>&1 \\| grep -A2 Objects",`Objects needing healing: 412`,"warn"],
 ["^mc admin heal prod/backups 2>&1 \\| tail -5",`Healed objects: 412`,"ok"]
],
[{re:"^mc admin info prod",l:"статус"},
 {re:"^mc admin heal prod/backups",l:"лечение"}],{file:"project/minio-heal-412-.yaml",files:{"project/minio-heal-412-.yaml":`# Ceph: MinIO heal: 412 объектов требуют лечения\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/minio-heal-412-.yaml":`# Ceph: MinIO heal: 412 объектов требуют лечения — fixed\nstatus: ok\n`}},{hints:["Симптом: MinIO heal: 412 объектов требуют лечения в project/minio-heal-412-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/minio-heal-412-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/minio-heal-412-.yaml.","Порядок: статус → лечение"]});
