/* Песочница: Kafka, RabbitMQ, NATS, PostgreSQL, MySQL, Redis, ClickHouse, MinIO, etcd, Longhorn, Velero */
S("Kafka","ka1","Consumer lag растёт — диагностика","Middle",
`<h3>Контекст</h3><p>Kafka: <b>Consumer lag растёт — диагностика</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Consumer lag растёт — диагностика</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] измерить лаг</li><li>[ ] масштабировать консьюмеров</li><li>[ ] проверить, что лаг ушёл</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups\\.sh .*--</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: измерить лаг → масштабировать консьюмеров → проверить, что лаг ушёл.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
[/^kafka-consumer-groups\.sh .*--describe --group orders/,`TOPIC  PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG\norders 0          100             5000            4900`,"err"],
[/^kafka-consumer-groups\.sh .*--describe --group orders --members/,`consumer-1  host=worker-1  assignments: p0`,"dim"],
[/^kubectl -n prod scale deploy orders-consumer --replicas=4/,`scaled`,"ok"],
[/^kafka-consumer-groups\.sh .*--describe --group orders/,`LAG: 0`,"ok"]
],
[{re:/--describe --group orders/,l:"измерить лаг"},
 {re:/scale deploy orders-consumer/,l:"масштабировать консьюмеров"},
 {re:/--describe --group orders/,l:"проверить, что лаг ушёл"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Consumer lag растёт — диагностика\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Consumer lag растёт — диагностика — fixed\nstatus: ok\n`}},{hints:["Симптом: Consumer lag растёт — диагностика в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: измерить лаг → масштабировать консьюмеров → проверить, что лаг ушёл"]});

S("Kafka","ka2","Создать топик с 6 партициями","Junior",
`<h3>Контекст</h3><p>Kafka: <b>Создать топик с 6 партициями</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Создать топик с 6 партициями</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать топик</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics\\.sh --create .*or</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать топик → проверить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
[/^kafka-topics\.sh --create .*orders\.paid/,`Created topic orders.paid.`,"ok"],
[/^kafka-topics\.sh --describe --topic orders\.paid/,`PartitionCount: 6, ReplicationFactor: 3`,"ok"]
],
[{re:/--create/,l:"создать топик"},
 {re:/--describe/,l:"проверить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Создать топик с 6 партициями\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Создать топик с 6 партициями — fixed\nstatus: ok\n`}},{hints:["Симптом: Создать топик с 6 партициями в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: создать топик → проверить"]});

S("Kafka","ka3","Poison pill: сообщение валиит консьюмера","Senior",
`<h3>Контекст</h3><p>Kafka: <b>Poison pill: сообщение валиит консьюмера</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Poison pill: сообщение валиит консьюмера</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти застрявшую партицию</li><li>[ ] сдвинуть offset (после сохранения сообщения в DLQ)</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups\\.sh .*--</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти застрявшую партицию → сдвинуть offset (после сохранения сообщения в DLQ).</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
[/^kafka-consumer-groups\.sh .*--describe --group orders/,`PARTITION 2 LAG: 1 (не двигается)`,"err"],
[/^kafka-consumer-groups\.sh .*--reset-offsets --group orders --topic orders --partition 2 --to-offset 43 --execute/,`NEW-OFFSET 43`,"warn"],
[/^kafka-consumer-groups\.sh .*--describe --group orders/,`LAG: 0`,"ok"]
],
[{re:/--describe --group orders/,l:"найти застрявшую партицию"},
 {re:/--reset-offsets/,l:"сдвинуть offset (после сохранения сообщения в DLQ)"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Poison pill: сообщение валиит консьюмера\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Poison pill: сообщение валиит консьюмера — fixed\nstatus: ok\n`}},{hints:["Симптом: Poison pill: сообщение валиит консьюмера в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: найти застрявшую партицию → сдвинуть offset (после сохранения сообщения в DLQ)"]});

S("RabbitMQ","rm1","Очередь растёт, консьюмер один","Middle",
`<h3>Контекст</h3><p>RabbitMQ: <b>Очередь растёт, консьюмер один</b>. Работа с <code>project/-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Очередь растёт, консьюмер один</b>. Файл <code>project/-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] измерить очередь</li><li>[ ] проверить prefetch</li><li>[ ] масштабировать/поднять prefetch</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>rabbitmqctl list_queues name m</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: измерить очередь → проверить prefetch → масштабировать/поднять prefetch.</p><h3>Проверка</h3><pre>cat project/-.yaml<br>проверить код</pre>`,
"dev@rabbit:~$",
[
[/^rabbitmqctl list_queues name messages_ready consumers/,`orders.billing  12000  1`,"err"],
[/^rabbitmqctl list_consumers queue_name prefetch_count/,`orders.billing  prefetch=1`,"warn"],
[/^(kubectl scale deploy billing --replicas=4|rabbitmqctl set_policy prefetch .*)/,`консьюмеров 4 / prefetch поднят`,"ok"],
[/^rabbitmqctl list_queues name messages_ready/,`orders.billing  40`,"ok"]
],
[{re:/^rabbitmqctl list_queues/,l:"измерить очередь"},
 {re:/list_consumers|prefetch/,l:"проверить prefetch"},
 {re:/(scale|set_policy)/,l:"масштабировать/поднять prefetch"}],{file:"project/-.yaml",files:{"project/-.yaml":`# RabbitMQ: Очередь растёт, консьюмер один\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-.yaml":`# RabbitMQ: Очередь растёт, консьюмер один — fixed\nstatus: ok\n`}},{hints:["Симптом: Очередь растёт, консьюмер один в project/-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-.yaml.","Порядок: измерить очередь → проверить prefetch → масштабировать/поднять prefetch"]});

S("RabbitMQ","rm2","Publishers заблокированы alarm'ом","Senior",
`<h3>Контекст</h3><p>RabbitMQ: <b>Publishers заблокированы alarm'ом</b>. Работа с <code>project/publishers-alar.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Publishers заблокированы alarm'ом</b>. Файл <code>project/publishers-alar.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть blocked</li><li>[ ] найти причину alarm'а</li><li>[ ] проверить, что разблокировано</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/publishers-alar.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/publishers-alar.yaml</code>. Активный файл открыт в редакторе. Начните с <code>rabbitmqctl list_connections n</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть blocked → найти причину alarm'а → проверить, что разблокировано.</p><h3>Проверка</h3><pre>cat project/publishers-alar.yaml<br>проверить код</pre>`,
"dev@rabbit:~$",
[
[/^rabbitmqctl list_connections name state/,`app-1  blocked`,"err"],
[/^rabbitmq-diagnostics check_running && rabbitmq-diagnostics memory_breakdown/,`memory alarm: 41% quota used`,"warn"],
[/^rabbitmqctl purge_queue orders.billing/,`Queue purged`,"warn"],
[/^rabbitmqctl list_connections name state/,`app-1  running`,"ok"]
],
[{re:/list_connections/,l:"увидеть blocked"},
 {re:/memory_breakdown|alarm/,l:"найти причину alarm'а"},
 {re:/list_connections/,l:"проверить, что разблокировано"}],{file:"project/publishers-alar.yaml",files:{"project/publishers-alar.yaml":`# RabbitMQ: Publishers заблокированы alarm'ом\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/publishers-alar.yaml":`# RabbitMQ: Publishers заблокированы alarm'ом — fixed\nstatus: ok\n`}},{hints:["Симптом: Publishers заблокированы alarm'ом в project/publishers-alar.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/publishers-alar.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/publishers-alar.yaml.","Порядок: увидеть blocked → найти причину alarm'а → проверить, что разблокировано"]});

S("NATS","nt1","JetStream: stream и lag консьюмера","Middle",
`<h3>Контекст</h3><p>NATS: <b>JetStream: stream и lag консьюмера</b>. Работа с <code>project/jetstream-strea.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>JetStream: stream и lag консьюмера</b>. Файл <code>project/jetstream-strea.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] инфо по stream</li><li>[ ] лаг консьюмера</li><li>[ ] получить сообщение</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/jetstream-strea.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/jetstream-strea.yaml</code>. Активный файл открыт в редакторе. Начните с <code>nats stream info ORDERS</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: инфо по stream → лаг консьюмера → получить сообщение.</p><h3>Проверка</h3><pre>cat project/jetstream-strea.yaml<br>проверить код</pre>`,
"dev@nats:~$",
[
[/^nats stream info ORDERS/,`State: Messages: 12,400; FirstSeq: 1; LastSeq: 12,400`,"ok"],
[/^nats consumer info ORDERS BILLING/,`Num Pending: 4,200; Ack Floor: 8,200`,"warn"],
[/^nats consumer next ORDERS BILLING/,`[#1] Received orders.created.1`,"ok"]
],
[{re:/^nats stream info/,l:"инфо по stream"},
 {re:/^nats consumer info/,l:"лаг консьюмера"},
 {re:/^nats consumer next/,l:"получить сообщение"}],{file:"project/jetstream-strea.yaml",files:{"project/jetstream-strea.yaml":`# NATS: JetStream: stream и lag консьюмера\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/jetstream-strea.yaml":`# NATS: JetStream: stream и lag консьюмера — fixed\nstatus: ok\n`}},{hints:["Симптом: JetStream: stream и lag консьюмера в project/jetstream-strea.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/jetstream-strea.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/jetstream-strea.yaml.","Порядок: инфо по stream → лаг консьюмера → получить сообщение"]});

S("PostgreSQL","pg1","Долгие транзакции блокируют vacuum","Middle",
`<h3>Контекст</h3><p>PostgreSQL: <b>Долгие транзакции блокируют vacuum</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Долгие транзакции блокируют vacuum</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти долгие транзакции</li><li>[ ] убить зависшую</li><li>[ ] сводка по состояниям</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \"SELECT pid, now\\(\\)-t</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти долгие транзакции → убить зависшую → сводка по состояниям.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
[/^psql -c "SELECT pid, now\(\)-trx_started .*innodb_trx|SELECT pid, state, now\(\)-xact_start FROM pg_stat_activity WHERE state<>'idle' ORDER BY xact_start"/,`pid 4321 | idle in transaction | 02:14:33`,"err"],
[/^psql -c "SELECT pg_terminate_backend\(4321\)"/,`t`,"ok"],
[/^psql -c "SELECT state, count\(\*\) FROM pg_stat_activity GROUP BY state"/,`active 12; idle 40`,"ok"]
],
[{re:/pg_stat_activity/,l:"найти долгие транзакции"},
 {re:/pg_terminate_backend/,l:"убить зависшую"},
 {re:/GROUP BY state/,l:"сводка по состояниям"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Долгие транзакции блокируют vacuum\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Долгие транзакции блокируют vacuum — fixed\nstatus: ok\n`}},{hints:["Симптом: Долгие транзакции блокируют vacuum в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: найти долгие транзакции → убить зависшую → сводка по состояниям"]});

S("PostgreSQL","pg2","Исчерпаны max_connections","Middle",
`<h3>Контекст</h3><p>PostgreSQL: <b>Исчерпаны max_connections</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Исчерпаны max_connections</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть лимит</li><li>[ ] посчитать соединения</li><li>[ ] поднять лимит + reload</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \"SHOW max_connections\"</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть лимит → посчитать соединения → поднять лимит + reload.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
[/^psql -c "SHOW max_connections"/,`100`,"warn"],
[/^psql -c "SELECT count\(\*\) FROM pg_stat_activity"/,`99`,"err"],
[/^psql -c "ALTER SYSTEM SET max_connections = 300"/,`ALTER SYSTEM`,"ok"],
[/^psql -c "SELECT pg_reload_conf\(\)"/,`t (после reload новые лимит применён)`,"ok"]
],
[{re:/max_connections/,l:"посмотреть лимит"},
 {re:/pg_stat_activity/,l:"посчитать соединения"},
 {re:/ALTER SYSTEM/,l:"поднять лимит + reload"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Исчерпаны max_connections\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Исчерпаны max_connections — fixed\nstatus: ok\n`}},{hints:["Симптом: Исчерпаны max_connections в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: посмотреть лимит → посчитать соединения → поднять лимит + reload"]});

S("PostgreSQL","pg3","Реплика отстала — проверить lag","Middle",
`<h3>Контекст</h3><p>PostgreSQL: <b>Реплика отстала — проверить lag</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Реплика отстала — проверить lag</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] измерить lag</li><li>[ ] дождаться/проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \"SELECT application_na</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: измерить lag → дождаться/проверить.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
[/^psql -c "SELECT application_name, replay_lag FROM pg_stat_replication"/,`replica-1 | 00:04:12`,"warn"],
[/^psql -c "SELECT pg_wal_replay_wait\(\)" 2>\/dev\/null \|\| echo "ждём replay"/,`replay completed`,"ok"],
[/^psql -c "SELECT replay_lag FROM pg_stat_replication"/,`00:00:00`,"ok"]
],
[{re:/pg_stat_replication/,l:"измерить lag"},
 {re:/(replay|SELECT replay_lag)/,l:"дождаться/проверить"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Реплика отстала — проверить lag\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Реплика отстала — проверить lag — fixed\nstatus: ok\n`}},{hints:["Симптом: Реплика отстала — проверить lag в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: измерить lag → дождаться/проверить"]});

S("PostgreSQL","pg4","Реплика мертва — пересоздать через pg_basebackup","Middle",
`<h3>Контекст</h3><p>PostgreSQL: <b>Реплика мертва — пересоздать через pg_basebackup</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Реплика мертва — пересоздать через pg_basebackup</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] пересоздать data-dir (-R запишет standby-настройки)</li><li>[ ] проверить роль и lag</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -h primary -c \"SELECT sta</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: пересоздать data-dir (-R запишет standby-настройки) → проверить роль и lag.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@replica:~$",
[
[/^psql -h primary -c "SELECT state FROM pg_stat_replication"/,`(на primary этой реплики больше нет)`,"err"],
[/^(systemctl stop postgresql@16-main|pg_ctl stop -D \/var\/lib\/postgresql\/16\/main)/,`postgresql stopped`,"dim"],
[/^rm -rf \/var\/lib\/postgresql\/16\/main\/\*/,``, "dim"],
[/^pg_basebackup -h primary -D \/var\/lib\/postgresql\/16\/main -U replicator -P -R -X stream/,`24573/24573 MB (100%), 1/1 tablespace`,"ok"],
[/^(systemctl start postgresql@16-main|pg_ctl start -D \/var\/lib\/postgresql\/16\/main)/,`server started`,"ok"],
[/^psql -c "SELECT pg_is_in_recovery\(\), pg_last_wal_replay_lag\(\)"/,`t | 00:00:00   <-- в роли реплики, lag 0`,"ok"]
],
[{re:/^pg_basebackup/,l:"пересоздать data-dir (-R запишет standby-настройки)"},
 {re:/pg_is_in_recovery/,l:"проверить роль и lag"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Реплика мертва — пересоздать через pg_basebackup\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Реплика мертва — пересоздать через pg_basebackup — fixed\nstatus: ok\n`}},{hints:["Симптом: Реплика мертва — пересоздать через pg_basebackup в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: пересоздать data-dir (-R запишет standby-настройки) → проверить роль и lag"]});

S("PostgreSQL","pg5","PITR: восстановить базу на момент до ошибки","Senior",
`<h3>Контекст</h3><p>PostgreSQL: <b>PITR: восстановить базу на момент до ошибки</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PITR: восстановить базу на момент до ошибки</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить архив WAL</li><li>[ ] настроить PITR до 13:59</li><li>[ ] проверить завершение recovery</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \"SELECT \\* FROM pg_sta</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить архив WAL → настроить PITR до 13:59 → проверить завершение recovery.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"postgres@restore:~$",
[
[/^psql -c "SELECT \* FROM pg_stat_archiver"/,`archived_count: 8120, failed_count: 0   <-- WAL архивируется ✅`,"ok"],
[/^(touch \/var\/lib\/postgresql\/16\/main\/recovery\.signal|cat >> .*postgresql\.auto\.conf)/,`recovery.signal + restore_command + recovery_target_time = '2026-08-24 13:59:59'`,"ok"],
[/^(systemctl start postgresql@16-main|pg_ctl start)/,`server started`,"dim"],
[/^psql -c "SELECT pg_is_in_recovery\(\)"/,`f   <-- recovery завершён, промоушен выполнен`,"ok"],
[/^psql -c "SELECT count\(\*\) FROM shop\.orders"/,`12420   (состояние на 13:59, DELETE не применён)`,"ok"]
],
[{re:/pg_stat_archiver/,l:"проверить архив WAL"},
 {re:/(recovery\.signal|recovery_target_time)/,l:"настроить PITR до 13:59"},
 {re:/pg_is_in_recovery/,l:"проверить завершение recovery"},
 {re:/count\(\*\) FROM shop\.orders/,l:"проверить данные"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: PITR: восстановить базу на момент до ошибки\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: PITR: восстановить базу на момент до ошибки — fixed\nstatus: ok\n`}},{hints:["Симптом: PITR: восстановить базу на момент до ошибки в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: проверить архив WAL → настроить PITR до 13:59 → проверить завершение recovery"]});

S("PostgreSQL","pg6","Медленный запрос: EXPLAIN ANALYZE → индекс","Middle",
`<h3>Контекст</h3><p>PostgreSQL: <b>Медленный запрос: EXPLAIN ANALYZE → индекс</b>. Работа с <code>postgres/fix.sql</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Медленный запрос: EXPLAIN ANALYZE → индекс</b>. Файл <code>postgres/fix.sql</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] замерить план до и после</li><li>[ ] добавить индекс</li><li>[ ] убедиться, что Seq Scan ушёл</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>postgres/fix.sql</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>postgres/fix.sql</code>. Активный файл открыт в редакторе. Начните с <code>EXPLAIN ANALYZE SELECT .*WHERE</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: замерить план до и после → добавить индекс → убедиться, что Seq Scan ушёл.</p><h3>Проверка</h3><pre>cat postgres/fix.sql<br>проверить код</pre>`,
"dev@pg:~$",
[
[/^EXPLAIN ANALYZE SELECT .*WHERE email/,`Seq Scan on users  (cost=0.00..2435.00 rows=1) (actual time=0.4..1180.2 rows=1 loops=1)\nPlanning Time: 0.2 ms\nExecution Time: 1180.5 ms`,"err"],
[/^CREATE INDEX CONCURRENTLY idx_users_email ON users\(email\);/,`CREATE INDEX`,"ok"],
[/^EXPLAIN ANALYZE SELECT .*WHERE email/,`Index Scan using idx_users_email  (actual time=0.03..0.05 rows=1)\nExecution Time: 0.06 ms`,"ok"],
[/^VACUUM ANALYZE users;/,`VACUUM`,"dim"]
],
[{re:/EXPLAIN ANALYZE/,l:"замерить план до и после"},
 {re:/CREATE INDEX/,l:"добавить индекс"},
 {re:/Seq Scan/,l:"убедиться, что Seq Scan ушёл"}],{file:"postgres/fix.sql",files:{"postgres/fix.sql":`# PostgreSQL: Медленный запрос: EXPLAIN ANALYZE → индекс\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"postgres/fix.sql":`# PostgreSQL: Медленный запрос: EXPLAIN ANALYZE → индекс — fixed\nstatus: ok\n`}},{hints:["Симптом: Медленный запрос: EXPLAIN ANALYZE → индекс в postgres/fix.sql. Ищи причину в коде/конфиге этого файла.","Открой postgres/fix.sql в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat postgres/fix.sql.","Порядок: замерить план до и после → добавить индекс → убедиться, что Seq Scan ушёл"]});

S("Redis","r1","Найти большие ключи","Middle",
`<h3>Контекст</h3><p>Redis: <b>Найти большие ключи</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Найти большие ключи</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти большие ключи</li><li>[ ] оценить размер ключа</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --bigkeys</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти большие ключи → оценить размер ключа.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
[/^redis-cli --bigkeys/,`Biggest list: 'queue:events' with 1200000 items`,"warn"],
[/^redis-cli memory usage queue:events/,`96000000 bytes (~96MB)`,"warn"],
[/^redis-cli --cluster check 127.0.0.1:7000 2>\/dev\/null \|\| redis-cli info memory \| grep used_memory_human/,`used_memory_human: 8.20G`,"ok"]
],
[{re:/--bigkeys/,l:"найти большие ключи"},
 {re:/memory usage/,l:"оценить размер ключа"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Найти большие ключи\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Найти большие ключи — fixed\nstatus: ok\n`}},{hints:["Симптом: Найти большие ключи в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: найти большие ключи → оценить размер ключа"]});

S("Redis","r2","Redis Cluster: слот не покрыт","Senior",
`<h3>Контекст</h3><p>Redis: <b>Redis Cluster: слот не покрыт</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Redis Cluster: слот не покрыт</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить слоты до и после</li><li>[ ] починить распределение</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить слоты до и после → починить распределение.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
[/^redis-cli --cluster check 127.0.0.1:7000/,`[ERR] Nodes don't agree about slots: slot 0 unassigned`,"err"],
[/^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes/,`...slot 0 assigned to node...`,"ok"],
[/^redis-cli --cluster check 127.0.0.1:7000/,`[OK] All 16384 slots covered.`,"ok"]
],
[{re:/--cluster check/,l:"проверить слоты до и после"},
 {re:/--cluster fix/,l:"починить распределение"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Redis Cluster: слот не покрыт\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Redis Cluster: слот не покрыт — fixed\nstatus: ok\n`}},{hints:["Симптом: Redis Cluster: слот не покрыт в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: проверить слоты до и после → починить распределение"]});

S("ClickHouse","ch1","Найти самый тяжёлый запрос","Senior",
`<h3>Контекст</h3><p>ClickHouse: <b>Найти самый тяжёлый запрос</b>. Работа с <code>project/-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Найти самый тяжёлый запрос</b>. Файл <code>project/-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] топ по query_log</li><li>[ ] убить тяжёлый запрос</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>clickhouse-client --query .*qu</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: топ по query_log → убить тяжёлый запрос.</p><h3>Проверка</h3><pre>cat project/-.yaml<br>проверить код</pre>`,
"dev@ch:~$",
[
[/^clickhouse-client --query .*query_log.*ORDER BY gb_read DESC/,`SELECT * FROM events WHERE ...  42.10  18.2`,"warn"],
[/^clickhouse-client --query "KILL QUERY WHERE query_id='...'"/,`Killed`,"ok"]
],
[{re:/query_log/,l:"топ по query_log"},
 {re:/KILL QUERY/i,l:"убить тяжёлый запрос"}],{file:"project/-.yaml",files:{"project/-.yaml":`# ClickHouse: Найти самый тяжёлый запрос\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-.yaml":`# ClickHouse: Найти самый тяжёлый запрос — fixed\nstatus: ok\n`}},{hints:["Симптом: Найти самый тяжёлый запрос в project/-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-.yaml.","Порядок: топ по query_log → убить тяжёлый запрос"]});

S("ClickHouse","ch2","Too many parts при мелких вставках","Middle",
`<h3>Контекст</h3><p>ClickHouse: <b>Too many parts при мелких вставках</b>. Работа с <code>project/too-many-parts-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Too many parts при мелких вставках</b>. Файл <code>project/too-many-parts-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть части</li><li>[ ] перейти на батч/async вставки</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/too-many-parts-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/too-many-parts-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>clickhouse-client --query \"SEL</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть части → перейти на батч/async вставки.</p><h3>Проверка</h3><pre>cat project/too-many-parts-.yaml<br>проверить код</pre>`,
"dev@ch:~$",
[
[/^clickhouse-client --query "SELECT count\(\) FROM system\.parts WHERE active=0"/,`300 inactive parts`,"err"],
[/^(SET async_insert = 1|sed -i app\.py)/,`вставки батчами/async включены`,"ok"],
[/^clickhouse-client --query "SELECT count\(\) FROM system\.parts WHERE active"/,`12 parts`,"ok"]
],
[{re:/system\.parts/,l:"посмотреть части"},
 {re:/(async_insert|батч)/,l:"перейти на батч/async вставки"}],{file:"project/too-many-parts-.yaml",files:{"project/too-many-parts-.yaml":`# ClickHouse: Too many parts при мелких вставках\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/too-many-parts-.yaml":`# ClickHouse: Too many parts при мелких вставках — fixed\nstatus: ok\n`}},{hints:["Симптом: Too many parts при мелких вставках в project/too-many-parts-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/too-many-parts-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/too-many-parts-.yaml.","Порядок: посмотреть части → перейти на батч/async вставки"]});

S("MinIO","mn1","Проверить и вылечить деградацию","Senior",
`<h3>Контекст</h3><p>MinIO: <b>Проверить и вылечить деградацию</b>. Работа с <code>project/-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Проверить и вылечить деградацию</b>. Файл <code>project/-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус дисков</li><li>[ ] healing</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mc admin info prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус дисков → healing.</p><h3>Проверка</h3><pre>cat project/-.yaml<br>проверить код</pre>`,
"dev@minio:~$",
[
[/^mc admin info prod/,`2 drives online, 1 offline`,"err"],
[/^mc admin heal prod\/backups --dry-run/,`Objects needing healing: 412`,"warn"],
[/^mc admin heal prod\/backups/,`Healed objects: 412`,"ok"],
[/^mc admin info prod/,`4 drives online`,"ok"]
],
[{re:/^mc admin info/,l:"статус дисков"},
 {re:/^mc admin heal/,l:"healing"}],{file:"project/-.yaml",files:{"project/-.yaml":`# MinIO: Проверить и вылечить деградацию\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-.yaml":`# MinIO: Проверить и вылечить деградацию — fixed\nstatus: ok\n`}},{hints:["Симптом: Проверить и вылечить деградацию в project/-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-.yaml.","Порядок: статус дисков → healing"]});

S("etcd","et1","NOSPACE alarm — кластер не принимает записи","Senior",
`<h3>Контекст</h3><p>etcd: <b>NOSPACE alarm — кластер не принимает записи</b>. Работа с <code>project/nospace-alarm-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>NOSPACE alarm — кластер не принимает записи</b>. Файл <code>project/nospace-alarm-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] подтвердить NOSPACE</li><li>[ ] compaction</li><li>[ ] defrag</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/nospace-alarm-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/nospace-alarm-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ETCDCTL_API=3 etcdctl alarm li</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: подтвердить NOSPACE → compaction → defrag.</p><h3>Проверка</h3><pre>cat project/nospace-alarm-.yaml<br>проверить код</pre>`,
"root@master:~#",
[
[/^ETCDCTL_API=3 etcdctl alarm list/,`memberID:X alarm:NOSPACE`,"err"],
[/^ETCDCTL_API=3 etcdctl compact \$(ETCDCTL_API=3 etcdctl endpoint status -w json \| jq -r .\[0\]\.Status\.header\.revision)/,`compacted`,"ok"],
[/^ETCDCTL_API=3 etcdctl defrag --cluster/,`Finished defragmenting`,"ok"],
[/^ETCDCTL_API=3 etcdctl alarm disarm/,`alarm disarmed`,"ok"],
[/^ETCDCTL_API=3 etcdctl put healthcheck 1/,`OK`,"ok"]
],
[{re:/alarm list/,l:"подтвердить NOSPACE"},
 {re:/compact/,l:"compaction"},
 {re:/defrag/,l:"defrag"},
 {re:/alarm disarm/,l:"снять alarm"}],{file:"project/nospace-alarm-.yaml",files:{"project/nospace-alarm-.yaml":`# etcd: NOSPACE alarm — кластер не принимает записи\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/nospace-alarm-.yaml":`# etcd: NOSPACE alarm — кластер не принимает записи — fixed\nstatus: ok\n`}},{hints:["Симптом: NOSPACE alarm — кластер не принимает записи в project/nospace-alarm-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/nospace-alarm-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/nospace-alarm-.yaml.","Порядок: подтвердить NOSPACE → compaction → defrag"]});

S("Longhorn","lh1","Том degraded — реплика восстанавливается","Middle",
`<h3>Контекст</h3><p>Longhorn: <b>Том degraded — реплика восстанавливается</b>. Работа с <code>project/-degraded-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Том degraded — реплика восстанавливается</b>. Файл <code>project/-degraded-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть degraded</li><li>[ ] проверить реплики</li><li>[ ] дождаться healthy</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-degraded-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-degraded-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n longhorn-system get</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть degraded → проверить реплики → дождаться healthy.</p><h3>Проверка</h3><pre>cat project/-degraded-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
[/^kubectl -n longhorn-system get volumes -o custom-columns=NAME:.metadata.name,ROBUST:.status.robustness/,`data-1  degraded`,"warn"],
[/^kubectl -n longhorn-system get replicas.longhorn.io \| grep data-1/,`2 of 3 replicas healthy`,"warn"],
[/^kubectl -n longhorn-system get volumes data-1 -w --request-timeout=120s/,`robustness: healthy`,"ok"]
],
[{re:/get volumes/,l:"увидеть degraded"},
 {re:/get replicas/,l:"проверить реплики"},
 {re:/healthy/,l:"дождаться healthy"}],{file:"project/-degraded-.yaml",files:{"project/-degraded-.yaml":`# Longhorn: Том degraded — реплика восстанавливается\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-degraded-.yaml":`# Longhorn: Том degraded — реплика восстанавливается — fixed\nstatus: ok\n`}},{hints:["Симптом: Том degraded — реплика восстанавливается в project/-degraded-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-degraded-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-degraded-.yaml.","Порядок: увидеть degraded → проверить реплики → дождаться healthy"]});

S("Velero","vl1","Проверить бэкап и сделать restore-drill","Middle",
`<h3>Контекст</h3><p>Velero: <b>Проверить бэкап и сделать restore-drill</b>. Работа с <code>project/-restore-drill.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Проверить бэкап и сделать restore-drill</b>. Файл <code>project/-restore-drill.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить бэкап</li><li>[ ] restore в drill-namespace</li><li>[ ] проверить результат</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-restore-drill.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-restore-drill.yaml</code>. Активный файл открыт в редакторе. Начните с <code>velero backup describe nightly</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить бэкап → restore в drill-namespace → проверить результат.</p><h3>Проверка</h3><pre>cat project/-restore-drill.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
[/^velero backup describe nightly --details/,`Backup Volumes: podvolumebackups completed; TTL 720h`,"ok"],
[/^velero restore create --from-backup nightly --namespace-mappings prod:prod-drill/,`Restore "nightly-..." created`,"ok"],
[/^velero restore describe nightly-.* --details/,`Restore completed, warnings: 0, errors: 0`,"ok"],
[/^kubectl -n prod-drill get pods/,`api-xxx 1/1 Running`,"ok"]
],
[{re:/^velero backup describe/,l:"проверить бэкап"},
 {re:/^velero restore create/,l:"restore в drill-namespace"},
 {re:/^velero restore describe/,l:"проверить результат"}],{file:"project/-restore-drill.yaml",files:{"project/-restore-drill.yaml":`# Velero: Проверить бэкап и сделать restore-drill\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-restore-drill.yaml":`# Velero: Проверить бэкап и сделать restore-drill — fixed\nstatus: ok\n`}},{hints:["Симптом: Проверить бэкап и сделать restore-drill в project/-restore-drill.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-restore-drill.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-restore-drill.yaml.","Порядок: проверить бэкап → restore в drill-namespace → проверить результат"]});
