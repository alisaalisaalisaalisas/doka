/* Global Playground: PostgreSQL HA — 35 scenarios */
S("PostgreSQL","gc-pg-1","Patroni: switchover не проходит, synchronous_mode","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Patroni: switchover не проходит, synchronous_mode</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Patroni: switchover не проходит, synchronous_mode</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>patronictl -c /etc/patroni.yml</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg1\nprod Replica pg2 lag 4m", "warn"],
 ["^patronictl -c /etc/patroni.yml show-config", "synchronous_mode: on", "warn"],
 ["^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force", "Switched over", "ok"],
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg2", "ok"]
],
[{re:"^patronictl -c /etc/patroni.yml list",l:"диагностика"},
 {re:"^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Patroni: switchover не проходит, synchronous_mode\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Patroni: switchover не проходит, synchronous_mode — fixed\nstatus: ok\n`}},{hints:["Симптом: Patroni: switchover не проходит, synchronous_mode в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-2","pg_stat_replication: replay_lag 4 минуты","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>pg_stat_replication: replay_lag 4 минуты</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pg_stat_replication: replay_lag 4 минуты</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"", "replica-1 | 00:04:12", "warn"],
 ["^psql -c \"SELECT slot_name, active FROM pg_replication_slots\"", "slot inactive", "warn"],
 ["^psql -c \"SELECT pg_reload_conf()\"", "t", "ok"],
 ["^psql -c \"SELECT replay_lag FROM pg_stat_replication\"", "00:00:01", "ok"]
],
[{re:"^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_reload_conf()\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: pg_stat_replication: replay_lag 4 минуты\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: pg_stat_replication: replay_lag 4 минуты — fixed\nstatus: ok\n`}},{hints:["Симптом: pg_stat_replication: replay_lag 4 минуты в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-3","pg_rewind: нужен после промоута","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>pg_rewind: нужен после промоута</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pg_rewind: нужен после промоута</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>pg_rewind --dry-run --target-p</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^pg_rewind --dry-run --target-pgdata=/var/lib/postgresql/16/main --source-server='host=primary port=5432'", "needs wal_log_hints", "err"],
 ["^grep wal_log_hints /etc/postgresql/16/main/postgresql.conf", "wal_log_hints = off", "warn"],
 ["^psql -c \"ALTER SYSTEM SET wal_log_hints = on\" && systemctl restart postgresql", "restarted", "ok"],
 ["^pg_rewind --target-pgdata=/var/lib/postgresql/16/main --source-server='host=primary port=5432'", "rewind completed", "ok"]
],
[{re:"^pg_rewind --dry-run --target-pgdata=/var/lib/postgresql/16/main --source-server='host=primary port=5432'",l:"диагностика"},
 {re:"^psql -c \"ALTER SYSTEM SET wal_log_hints = on\" && systemctl restart postgresql",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: pg_rewind: нужен после промоута\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: pg_rewind: нужен после промоута — fixed\nstatus: ok\n`}},{hints:["Симптом: pg_rewind: нужен после промоута в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-4","Barman: backup failed, WAL archive missing","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Barman: backup failed, WAL archive missing</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Barman: backup failed, WAL archive missing</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>barman check pg-primary</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^barman check pg-primary", "FAILED: WAL archive", "warn"],
 ["^barman list-backups pg-primary", "FAILED 0", "warn"],
 ["^barman backup pg-primary", "Backup completed", "ok"],
 ["^barman check pg-primary", "OK", "ok"]
],
[{re:"^barman check pg-primary",l:"диагностика"},
 {re:"^barman backup pg-primary",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Barman: backup failed, WAL archive missing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Barman: backup failed, WAL archive missing — fixed\nstatus: ok\n`}},{hints:["Симптом: Barman: backup failed, WAL archive missing в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-5","PITR: recovery_target_time не достижим","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>PITR: recovery_target_time не достижим</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PITR: recovery_target_time не достижим</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>cat /var/lib/postgresql/16/mai</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time", "recovery_target_time = '2026-08-24 14:00:00' (bad)", "warn"],
 ["^psql -c \"SELECT * FROM pg_stat_archiver\" | grep archived_count", "archived_count 8120", "warn"],
 ["^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf", "patched", "ok"],
 ["^psql -c \"SELECT count FROM shop.orders\"", "12420", "ok"]
],
[{re:"^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time",l:"диагностика"},
 {re:"^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: PITR: recovery_target_time не достижим\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: PITR: recovery_target_time не достижим — fixed\nstatus: ok\n`}},{hints:["Симптом: PITR: recovery_target_time не достижим в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-6","EXPLAIN: Seq Scan вместо Index Scan","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>EXPLAIN: Seq Scan вместо Index Scan</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EXPLAIN: Seq Scan вместо Index Scan</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"", "Seq Scan cost=0.00..2435", "err"],
 ["^psql -c \"SELECT schemaname, tablename, attname FROM pg_stats WHERE tablename='users'\"", "no stats", "warn"],
 ["^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"", "CREATE INDEX", "ok"],
 ["^psql -c \"EXPLAIN (ANALYZE) SELECT * FROM users WHERE email='a@b.c'\" | grep Index", "Index Scan using idx_users_email", "ok"]
],
[{re:"^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"",l:"диагностика"},
 {re:"^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: Seq Scan вместо Index Scan\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: Seq Scan вместо Index Scan — fixed\nstatus: ok\n`}},{hints:["Симптом: EXPLAIN: Seq Scan вместо Index Scan в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-7","Locks: pg_locks blocked 2 минуты","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Locks: pg_locks blocked 2 минуты</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Locks: pg_locks blocked 2 минуты</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\"", "ExclusiveLock | blocked", "warn"],
 ["^psql -c \"SELECT pid, state, query FROM pg_stat_activity WHERE wait_event_type='Lock'\"", "wait_event Lock", "warn"],
 ["^psql -c \"SELECT pg_cancel_backend(1234)\"", "t", "ok"],
 ["^psql -c \"SELECT count FROM pg_locks WHERE NOT granted\"", "0", "ok"]
],
[{re:"^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\"",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_cancel_backend(1234)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Locks: pg_locks blocked 2 минуты\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Locks: pg_locks blocked 2 минуты — fixed\nstatus: ok\n`}},{hints:["Симптом: Locks: pg_locks blocked 2 минуты в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-8","Vacuum: autovacuum не успевает, bloat 3x","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>Vacuum: autovacuum не успевает, bloat 3x</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Vacuum: autovacuum не успевает, bloat 3x</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\"", "n_dead_tup 18234012", "warn"],
 ["^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\"", "42 GB", "warn"],
 ["^psql -c \"VACUUM (FULL, ANALYZE) orders\"", "VACUUM", "ok"],
 ["^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\"", "14 GB", "ok"]
],
[{re:"^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\"",l:"диагностика"},
 {re:"^psql -c \"VACUUM (FULL, ANALYZE) orders\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Vacuum: autovacuum не успевает, bloat 3x\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Vacuum: autovacuum не успевает, bloat 3x — fixed\nstatus: ok\n`}},{hints:["Симптом: Vacuum: autovacuum не успевает, bloat 3x в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-9","Patroni: DCS etcd недоступен","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Patroni: DCS etcd недоступен</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Patroni: DCS etcd недоступен</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>patronictl -c /etc/patroni.yml</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg1\nprod Replica pg2 lag 4m", "err"],
 ["^patronictl -c /etc/patroni.yml show-config", "synchronous_mode: on", "warn"],
 ["^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force", "Switched over", "ok"],
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg2", "ok"]
],
[{re:"^patronictl -c /etc/patroni.yml list",l:"диагностика"},
 {re:"^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Patroni: DCS etcd недоступен\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Patroni: DCS etcd недоступен — fixed\nstatus: ok\n`}},{hints:["Симптом: Patroni: DCS etcd недоступен в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-10","Replication: slot inactive, WAL растет","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Replication: slot inactive, WAL растет</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Replication: slot inactive, WAL растет</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"", "replica-1 | 00:04:12", "warn"],
 ["^psql -c \"SELECT slot_name, active FROM pg_replication_slots\"", "slot inactive", "warn"],
 ["^psql -c \"SELECT pg_reload_conf()\"", "t", "ok"],
 ["^psql -c \"SELECT replay_lag FROM pg_stat_replication\"", "00:00:01", "ok"]
],
[{re:"^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_reload_conf()\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Replication: slot inactive, WAL растет\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Replication: slot inactive, WAL растет — fixed\nstatus: ok\n`}},{hints:["Симптом: Replication: slot inactive, WAL растет в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-11","pg_basebackup: checksum mismatch","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>pg_basebackup: checksum mismatch</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pg_basebackup: checksum mismatch</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT * FROM pg_stat_activity\" | head -20", "state idle in transaction", "warn"],
 ["^psql -c \"SHOW wal_level\"", "replica", "warn"],
 ["^psql -c \"SELECT pg_reload_conf()\"", "t", "ok"],
 ["^psql -c \"SELECT pg_is_in_recovery()\"", "f", "ok"]
],
[{re:"^psql -c \"SELECT * FROM pg_stat_activity\" | head -20",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_reload_conf()\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: pg_basebackup: checksum mismatch\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: pg_basebackup: checksum mismatch — fixed\nstatus: ok\n`}},{hints:["Симптом: pg_basebackup: checksum mismatch в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-12","Barman: retention policy not enforced","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Barman: retention policy not enforced</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Barman: retention policy not enforced</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>barman check pg-primary</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^barman check pg-primary", "FAILED: WAL archive", "err"],
 ["^barman list-backups pg-primary", "FAILED 0", "warn"],
 ["^barman backup pg-primary", "Backup completed", "ok"],
 ["^barman check pg-primary", "OK", "ok"]
],
[{re:"^barman check pg-primary",l:"диагностика"},
 {re:"^barman backup pg-primary",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Barman: retention policy not enforced\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Barman: retention policy not enforced — fixed\nstatus: ok\n`}},{hints:["Симптом: Barman: retention policy not enforced в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-13","PITR: base backup старше 7 дней","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>PITR: base backup старше 7 дней</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PITR: base backup старше 7 дней</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>cat /var/lib/postgresql/16/mai</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time", "recovery_target_time = '2026-08-24 14:00:00' (bad)", "warn"],
 ["^psql -c \"SELECT * FROM pg_stat_archiver\" | grep archived_count", "archived_count 8120", "warn"],
 ["^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf", "patched", "ok"],
 ["^psql -c \"SELECT count FROM shop.orders\"", "12420", "ok"]
],
[{re:"^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time",l:"диагностика"},
 {re:"^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: PITR: base backup старше 7 дней\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: PITR: base backup старше 7 дней — fixed\nstatus: ok\n`}},{hints:["Симптом: PITR: base backup старше 7 дней в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-14","EXPLAIN: Nested Loop 10x медленнее Hash Join","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>EXPLAIN: Nested Loop 10x медленнее Hash Join</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EXPLAIN: Nested Loop 10x медленнее Hash Join</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"", "Seq Scan cost=0.00..2435", "warn"],
 ["^psql -c \"SELECT schemaname, tablename, attname FROM pg_stats WHERE tablename='users'\"", "no stats", "warn"],
 ["^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"", "CREATE INDEX", "ok"],
 ["^psql -c \"EXPLAIN (ANALYZE) SELECT * FROM users WHERE email='a@b.c'\" | grep Index", "Index Scan using idx_users_email", "ok"]
],
[{re:"^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"",l:"диагностика"},
 {re:"^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: Nested Loop 10x медленнее Hash Join\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: Nested Loop 10x медленнее Hash Join — fixed\nstatus: ok\n`}},{hints:["Симптом: EXPLAIN: Nested Loop 10x медленнее Hash Join в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-15","Locks: deadlock detected","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Locks: deadlock detected</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Locks: deadlock detected</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\"", "ExclusiveLock | blocked", "err"],
 ["^psql -c \"SELECT pid, state, query FROM pg_stat_activity WHERE wait_event_type='Lock'\"", "wait_event Lock", "warn"],
 ["^psql -c \"SELECT pg_cancel_backend(1234)\"", "t", "ok"],
 ["^psql -c \"SELECT count FROM pg_locks WHERE NOT granted\"", "0", "ok"]
],
[{re:"^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\"",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_cancel_backend(1234)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Locks: deadlock detected\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Locks: deadlock detected — fixed\nstatus: ok\n`}},{hints:["Симптом: Locks: deadlock detected в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-16","Vacuum: freeze age 1.8e9","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Vacuum: freeze age 1.8e9</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Vacuum: freeze age 1.8e9</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\"", "n_dead_tup 18234012", "warn"],
 ["^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\"", "42 GB", "warn"],
 ["^psql -c \"VACUUM (FULL, ANALYZE) orders\"", "VACUUM", "ok"],
 ["^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\"", "14 GB", "ok"]
],
[{re:"^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\"",l:"диагностика"},
 {re:"^psql -c \"VACUUM (FULL, ANALYZE) orders\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Vacuum: freeze age 1.8e9\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Vacuum: freeze age 1.8e9 — fixed\nstatus: ok\n`}},{hints:["Симптом: Vacuum: freeze age 1.8e9 в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-17","Patroni: timeline divergence","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>Patroni: timeline divergence</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Patroni: timeline divergence</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>patronictl -c /etc/patroni.yml</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg1\nprod Replica pg2 lag 4m", "warn"],
 ["^patronictl -c /etc/patroni.yml show-config", "synchronous_mode: on", "warn"],
 ["^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force", "Switched over", "ok"],
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg2", "ok"]
],
[{re:"^patronictl -c /etc/patroni.yml list",l:"диагностика"},
 {re:"^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Patroni: timeline divergence\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Patroni: timeline divergence — fixed\nstatus: ok\n`}},{hints:["Симптом: Patroni: timeline divergence в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-18","pg_stat_activity: idle in transaction 3h","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>pg_stat_activity: idle in transaction 3h</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pg_stat_activity: idle in transaction 3h</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT * FROM pg_stat_activity\" | head -20", "state idle in transaction", "err"],
 ["^psql -c \"SHOW wal_level\"", "replica", "warn"],
 ["^psql -c \"SELECT pg_reload_conf()\"", "t", "ok"],
 ["^psql -c \"SELECT pg_is_in_recovery()\"", "f", "ok"]
],
[{re:"^psql -c \"SELECT * FROM pg_stat_activity\" | head -20",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_reload_conf()\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: pg_stat_activity: idle in transaction 3h\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: pg_stat_activity: idle in transaction 3h — fixed\nstatus: ok\n`}},{hints:["Симптом: pg_stat_activity: idle in transaction 3h в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-19","Barman: ssh to backup host fails","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Barman: ssh to backup host fails</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Barman: ssh to backup host fails</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>barman check pg-primary</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^barman check pg-primary", "FAILED: WAL archive", "warn"],
 ["^barman list-backups pg-primary", "FAILED 0", "warn"],
 ["^barman backup pg-primary", "Backup completed", "ok"],
 ["^barman check pg-primary", "OK", "ok"]
],
[{re:"^barman check pg-primary",l:"диагностика"},
 {re:"^barman backup pg-primary",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Barman: ssh to backup host fails\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Barman: ssh to backup host fails — fixed\nstatus: ok\n`}},{hints:["Симптом: Barman: ssh to backup host fails в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-20","PITR: wal_level minimal вместо replica","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>PITR: wal_level minimal вместо replica</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PITR: wal_level minimal вместо replica</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>cat /var/lib/postgresql/16/mai</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time", "recovery_target_time = '2026-08-24 14:00:00' (bad)", "warn"],
 ["^psql -c \"SELECT * FROM pg_stat_archiver\" | grep archived_count", "archived_count 8120", "warn"],
 ["^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf", "patched", "ok"],
 ["^psql -c \"SELECT count FROM shop.orders\"", "12420", "ok"]
],
[{re:"^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time",l:"диагностика"},
 {re:"^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: PITR: wal_level minimal вместо replica\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: PITR: wal_level minimal вместо replica — fixed\nstatus: ok\n`}},{hints:["Симптом: PITR: wal_level minimal вместо replica в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-21","EXPLAIN: buffers 400MB read","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>EXPLAIN: buffers 400MB read</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EXPLAIN: buffers 400MB read</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"", "Seq Scan cost=0.00..2435", "err"],
 ["^psql -c \"SELECT schemaname, tablename, attname FROM pg_stats WHERE tablename='users'\"", "no stats", "warn"],
 ["^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"", "CREATE INDEX", "ok"],
 ["^psql -c \"EXPLAIN (ANALYZE) SELECT * FROM users WHERE email='a@b.c'\" | grep Index", "Index Scan using idx_users_email", "ok"]
],
[{re:"^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"",l:"диагностика"},
 {re:"^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: buffers 400MB read\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: buffers 400MB read — fixed\nstatus: ok\n`}},{hints:["Симптом: EXPLAIN: buffers 400MB read в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-22","Locks: advisory lock не отпускается","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Locks: advisory lock не отпускается</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Locks: advisory lock не отпускается</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\"", "ExclusiveLock | blocked", "warn"],
 ["^psql -c \"SELECT pid, state, query FROM pg_stat_activity WHERE wait_event_type='Lock'\"", "wait_event Lock", "warn"],
 ["^psql -c \"SELECT pg_cancel_backend(1234)\"", "t", "ok"],
 ["^psql -c \"SELECT count FROM pg_locks WHERE NOT granted\"", "0", "ok"]
],
[{re:"^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\"",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_cancel_backend(1234)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Locks: advisory lock не отпускается\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Locks: advisory lock не отпускается — fixed\nstatus: ok\n`}},{hints:["Симптом: Locks: advisory lock не отпускается в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-23","Vacuum: wraparound warning","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>Vacuum: wraparound warning</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Vacuum: wraparound warning</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\"", "n_dead_tup 18234012", "warn"],
 ["^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\"", "42 GB", "warn"],
 ["^psql -c \"VACUUM (FULL, ANALYZE) orders\"", "VACUUM", "ok"],
 ["^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\"", "14 GB", "ok"]
],
[{re:"^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\"",l:"диагностика"},
 {re:"^psql -c \"VACUUM (FULL, ANALYZE) orders\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Vacuum: wraparound warning\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Vacuum: wraparound warning — fixed\nstatus: ok\n`}},{hints:["Симптом: Vacuum: wraparound warning в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-24","Patroni: synchronous_commit off","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Patroni: synchronous_commit off</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Patroni: synchronous_commit off</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>patronictl -c /etc/patroni.yml</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg1\nprod Replica pg2 lag 4m", "err"],
 ["^patronictl -c /etc/patroni.yml show-config", "synchronous_mode: on", "warn"],
 ["^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force", "Switched over", "ok"],
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg2", "ok"]
],
[{re:"^patronictl -c /etc/patroni.yml list",l:"диагностика"},
 {re:"^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Patroni: synchronous_commit off\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Patroni: synchronous_commit off — fixed\nstatus: ok\n`}},{hints:["Симптом: Patroni: synchronous_commit off в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-25","Replication: wal_sender timeout","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Replication: wal_sender timeout</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Replication: wal_sender timeout</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"", "replica-1 | 00:04:12", "warn"],
 ["^psql -c \"SELECT slot_name, active FROM pg_replication_slots\"", "slot inactive", "warn"],
 ["^psql -c \"SELECT pg_reload_conf()\"", "t", "ok"],
 ["^psql -c \"SELECT replay_lag FROM pg_stat_replication\"", "00:00:01", "ok"]
],
[{re:"^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_reload_conf()\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Replication: wal_sender timeout\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Replication: wal_sender timeout — fixed\nstatus: ok\n`}},{hints:["Симптом: Replication: wal_sender timeout в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-26","pg_rewind: requires wal_log_hints on","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>pg_rewind: requires wal_log_hints on</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pg_rewind: requires wal_log_hints on</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>pg_rewind --dry-run --target-p</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^pg_rewind --dry-run --target-pgdata=/var/lib/postgresql/16/main --source-server='host=primary port=5432'", "needs wal_log_hints", "warn"],
 ["^grep wal_log_hints /etc/postgresql/16/main/postgresql.conf", "wal_log_hints = off", "warn"],
 ["^psql -c \"ALTER SYSTEM SET wal_log_hints = on\" && systemctl restart postgresql", "restarted", "ok"],
 ["^pg_rewind --target-pgdata=/var/lib/postgresql/16/main --source-server='host=primary port=5432'", "rewind completed", "ok"]
],
[{re:"^pg_rewind --dry-run --target-pgdata=/var/lib/postgresql/16/main --source-server='host=primary port=5432'",l:"диагностика"},
 {re:"^psql -c \"ALTER SYSTEM SET wal_log_hints = on\" && systemctl restart postgresql",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: pg_rewind: requires wal_log_hints on\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: pg_rewind: requires wal_log_hints on — fixed\nstatus: ok\n`}},{hints:["Симптом: pg_rewind: requires wal_log_hints on в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-27","Barman: get-wal не находит","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Barman: get-wal не находит</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Barman: get-wal не находит</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>barman check pg-primary</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^barman check pg-primary", "FAILED: WAL archive", "err"],
 ["^barman list-backups pg-primary", "FAILED 0", "warn"],
 ["^barman backup pg-primary", "Backup completed", "ok"],
 ["^barman check pg-primary", "OK", "ok"]
],
[{re:"^barman check pg-primary",l:"диагностика"},
 {re:"^barman backup pg-primary",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Barman: get-wal не находит\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Barman: get-wal не находит — fixed\nstatus: ok\n`}},{hints:["Симптом: Barman: get-wal не находит в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-28","EXPLAIN: parallel workers 0","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>EXPLAIN: parallel workers 0</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EXPLAIN: parallel workers 0</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"", "Seq Scan cost=0.00..2435", "warn"],
 ["^psql -c \"SELECT schemaname, tablename, attname FROM pg_stats WHERE tablename='users'\"", "no stats", "warn"],
 ["^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"", "CREATE INDEX", "ok"],
 ["^psql -c \"EXPLAIN (ANALYZE) SELECT * FROM users WHERE email='a@b.c'\" | grep Index", "Index Scan using idx_users_email", "ok"]
],
[{re:"^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"",l:"диагностика"},
 {re:"^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: parallel workers 0\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: parallel workers 0 — fixed\nstatus: ok\n`}},{hints:["Симптом: EXPLAIN: parallel workers 0 в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-29","Locks: heavyweight lock queue","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>Locks: heavyweight lock queue</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Locks: heavyweight lock queue</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\"", "ExclusiveLock | blocked", "warn"],
 ["^psql -c \"SELECT pid, state, query FROM pg_stat_activity WHERE wait_event_type='Lock'\"", "wait_event Lock", "warn"],
 ["^psql -c \"SELECT pg_cancel_backend(1234)\"", "t", "ok"],
 ["^psql -c \"SELECT count FROM pg_locks WHERE NOT granted\"", "0", "ok"]
],
[{re:"^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\"",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_cancel_backend(1234)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Locks: heavyweight lock queue\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Locks: heavyweight lock queue — fixed\nstatus: ok\n`}},{hints:["Симптом: Locks: heavyweight lock queue в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-30","Vacuum: index bloat 60%","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Vacuum: index bloat 60%</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Vacuum: index bloat 60%</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\"", "n_dead_tup 18234012", "err"],
 ["^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\"", "42 GB", "warn"],
 ["^psql -c \"VACUUM (FULL, ANALYZE) orders\"", "VACUUM", "ok"],
 ["^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\"", "14 GB", "ok"]
],
[{re:"^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\"",l:"диагностика"},
 {re:"^psql -c \"VACUUM (FULL, ANALYZE) orders\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Vacuum: index bloat 60%\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Vacuum: index bloat 60% — fixed\nstatus: ok\n`}},{hints:["Симптом: Vacuum: index bloat 60% в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-31","Patroni: failover manual vs automatic","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>Patroni: failover manual vs automatic</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Patroni: failover manual vs automatic</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>patronictl -c /etc/patroni.yml</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg1\nprod Replica pg2 lag 4m", "warn"],
 ["^patronictl -c /etc/patroni.yml show-config", "synchronous_mode: on", "warn"],
 ["^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force", "Switched over", "ok"],
 ["^patronictl -c /etc/patroni.yml list", "prod Leader pg2", "ok"]
],
[{re:"^patronictl -c /etc/patroni.yml list",l:"диагностика"},
 {re:"^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Patroni: failover manual vs automatic\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Patroni: failover manual vs automatic — fixed\nstatus: ok\n`}},{hints:["Симптом: Patroni: failover manual vs automatic в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-32","pg_stat_replication: flush_lag > write_lag","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>pg_stat_replication: flush_lag > write_lag</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pg_stat_replication: flush_lag > write_lag</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"", "replica-1 | 00:04:12", "warn"],
 ["^psql -c \"SELECT slot_name, active FROM pg_replication_slots\"", "slot inactive", "warn"],
 ["^psql -c \"SELECT pg_reload_conf()\"", "t", "ok"],
 ["^psql -c \"SELECT replay_lag FROM pg_stat_replication\"", "00:00:01", "ok"]
],
[{re:"^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\"",l:"диагностика"},
 {re:"^psql -c \"SELECT pg_reload_conf()\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: pg_stat_replication: flush_lag > write_lag\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: pg_stat_replication: flush_lag > write_lag — fixed\nstatus: ok\n`}},{hints:["Симптом: pg_stat_replication: flush_lag > write_lag в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-33","Barman: cron не запустил backup","Senior", `<h3>Контекст</h3><p>PostgreSQL: <b>Barman: cron не запустил backup</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Barman: cron не запустил backup</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>barman check pg-primary</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^barman check pg-primary", "FAILED: WAL archive", "err"],
 ["^barman list-backups pg-primary", "FAILED 0", "warn"],
 ["^barman backup pg-primary", "Backup completed", "ok"],
 ["^barman check pg-primary", "OK", "ok"]
],
[{re:"^barman check pg-primary",l:"диагностика"},
 {re:"^barman backup pg-primary",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Barman: cron не запустил backup\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Barman: cron не запустил backup — fixed\nstatus: ok\n`}},{hints:["Симптом: Barman: cron не запустил backup в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-34","PITR: restore_command не настроен","Junior", `<h3>Контекст</h3><p>PostgreSQL: <b>PITR: restore_command не настроен</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PITR: restore_command не настроен</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>cat /var/lib/postgresql/16/mai</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time", "recovery_target_time = '2026-08-24 14:00:00' (bad)", "warn"],
 ["^psql -c \"SELECT * FROM pg_stat_archiver\" | grep archived_count", "archived_count 8120", "warn"],
 ["^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf", "patched", "ok"],
 ["^psql -c \"SELECT count FROM shop.orders\"", "12420", "ok"]
],
[{re:"^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time",l:"диагностика"},
 {re:"^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: PITR: restore_command не настроен\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: PITR: restore_command не настроен — fixed\nstatus: ok\n`}},{hints:["Симптом: PITR: restore_command не настроен в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

S("PostgreSQL","gc-pg-35","EXPLAIN: materialize vs memoize","Middle", `<h3>Контекст</h3><p>PostgreSQL: <b>EXPLAIN: materialize vs memoize</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EXPLAIN: materialize vs memoize</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@primary:~$",
[
 ["^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"", "Seq Scan cost=0.00..2435", "warn"],
 ["^psql -c \"SELECT schemaname, tablename, attname FROM pg_stats WHERE tablename='users'\"", "no stats", "warn"],
 ["^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"", "CREATE INDEX", "ok"],
 ["^psql -c \"EXPLAIN (ANALYZE) SELECT * FROM users WHERE email='a@b.c'\" | grep Index", "Index Scan using idx_users_email", "ok"]
],
[{re:"^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\"",l:"диагностика"},
 {re:"^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\"",l:"исправить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: materialize vs memoize\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: EXPLAIN: materialize vs memoize — fixed\nstatus: ok\n`}},{hints:["Симптом: EXPLAIN: materialize vs memoize в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: диагностика → исправить"]});

