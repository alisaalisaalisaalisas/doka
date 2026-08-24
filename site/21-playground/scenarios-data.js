/* Песочница: Kafka, RabbitMQ, NATS, PostgreSQL, MySQL, Redis, ClickHouse, MinIO, etcd, Longhorn, Velero */
S("Kafka","ka1","Consumer lag растёт — диагностика","Middle",
`<b>Симптом:</b> алерт на лаг группы orders.`,
"dev@kafka:~$",
[
[/^kafka-consumer-groups\.sh .*--describe --group orders/,`TOPIC  PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG\norders 0          100             5000            4900`,"err"],
[/^kafka-consumer-groups\.sh .*--describe --group orders --members/,`consumer-1  host=worker-1  assignments: p0`,"dim"],
[/^kubectl -n prod scale deploy orders-consumer --replicas=4/,`scaled`,"ok"],
[/^kafka-consumer-groups\.sh .*--describe --group orders/,`LAG: 0`,"ok"]
],
[{re:/--describe --group orders/,l:"измерить лаг"},
 {re:/scale deploy orders-consumer/,l:"масштабировать консьюмеров"},
 {re:/--describe --group orders/,l:"проверить, что лаг ушёл"}]);

S("Kafka","ka2","Создать топик с 6 партициями","Junior",
`<b>Задача:</b> создать топик orders.paid.`,
"dev@kafka:~$",
[
[/^kafka-topics\.sh --create .*orders\.paid/,`Created topic orders.paid.`,"ok"],
[/^kafka-topics\.sh --describe --topic orders\.paid/,`PartitionCount: 6, ReplicationFactor: 3`,"ok"]
],
[{re:/--create/,l:"создать топик"},
 {re:/--describe/,l:"проверить"}]);

S("Kafka","ka3","Poison pill: сообщение валиит консьюмера","Senior",
`<b>Симптом:</b> консьюмер бесконечно ретраит offset 42.`,
"dev@kafka:~$",
[
[/^kafka-consumer-groups\.sh .*--describe --group orders/,`PARTITION 2 LAG: 1 (не двигается)`,"err"],
[/^kafka-consumer-groups\.sh .*--reset-offsets --group orders --topic orders --partition 2 --to-offset 43 --execute/,`NEW-OFFSET 43`,"warn"],
[/^kafka-consumer-groups\.sh .*--describe --group orders/,`LAG: 0`,"ok"]
],
[{re:/--describe --group orders/,l:"найти застрявшую партицию"},
 {re:/--reset-offsets/,l:"сдвинуть offset (после сохранения сообщения в DLQ)"}]);

S("RabbitMQ","rm1","Очередь растёт, консьюмер один","Middle",
`<b>Симптом:</b> messages_ready растёт.`,
"dev@rabbit:~$",
[
[/^rabbitmqctl list_queues name messages_ready consumers/,`orders.billing  12000  1`,"err"],
[/^rabbitmqctl list_consumers queue_name prefetch_count/,`orders.billing  prefetch=1`,"warn"],
[/^(kubectl scale deploy billing --replicas=4|rabbitmqctl set_policy prefetch .*)/,`консьюмеров 4 / prefetch поднят`,"ok"],
[/^rabbitmqctl list_queues name messages_ready/,`orders.billing  40`,"ok"]
],
[{re:/^rabbitmqctl list_queues/,l:"измерить очередь"},
 {re:/list_consumers|prefetch/,l:"проверить prefetch"},
 {re:/(scale|set_policy)/,l:"масштабировать/поднять prefetch"}]);

S("RabbitMQ","rm2","Publishers заблокированы alarm'ом","Senior",
`<b>Симптом:</b> продюсеры «висят», ошибок нет.`,
"dev@rabbit:~$",
[
[/^rabbitmqctl list_connections name state/,`app-1  blocked`,"err"],
[/^rabbitmq-diagnostics check_running && rabbitmq-diagnostics memory_breakdown/,`memory alarm: 41% quota used`,"warn"],
[/^rabbitmqctl purge_queue orders.billing/,`Queue purged`,"warn"],
[/^rabbitmqctl list_connections name state/,`app-1  running`,"ok"]
],
[{re:/list_connections/,l:"увидеть blocked"},
 {re:/memory_breakdown|alarm/,l:"найти причину alarm'а"},
 {re:/list_connections/,l:"проверить, что разблокировано"}]);

S("NATS","nt1","JetStream: stream и lag консьюмера","Middle",
`<b>Задача:</b> посмотреть состояние stream ORDERS.`,
"dev@nats:~$",
[
[/^nats stream info ORDERS/,`State: Messages: 12,400; FirstSeq: 1; LastSeq: 12,400`,"ok"],
[/^nats consumer info ORDERS BILLING/,`Num Pending: 4,200; Ack Floor: 8,200`,"warn"],
[/^nats consumer next ORDERS BILLING/,`[#1] Received orders.created.1`,"ok"]
],
[{re:/^nats stream info/,l:"инфо по stream"},
 {re:/^nats consumer info/,l:"лаг консьюмера"},
 {re:/^nats consumer next/,l:"получить сообщение"}]);

S("PostgreSQL","pg1","Долгие транзакции блокируют vacuum","Middle",
`<b>Симптом:</b> таблица разрослась, vacuum не проходит.`,
"dev@pg:~$",
[
[/^psql -c "SELECT pid, now\(\)-trx_started .*innodb_trx|SELECT pid, state, now\(\)-xact_start FROM pg_stat_activity WHERE state<>'idle' ORDER BY xact_start"/,`pid 4321 | idle in transaction | 02:14:33`,"err"],
[/^psql -c "SELECT pg_terminate_backend\(4321\)"/,`t`,"ok"],
[/^psql -c "SELECT state, count\(\*\) FROM pg_stat_activity GROUP BY state"/,`active 12; idle 40`,"ok"]
],
[{re:/pg_stat_activity/,l:"найти долгие транзакции"},
 {re:/pg_terminate_backend/,l:"убить зависшую"},
 {re:/GROUP BY state/,l:"сводка по состояниям"}]);

S("PostgreSQL","pg2","Исчерпаны max_connections","Middle",
`<b>Симптом:</b> FATAL: too many clients already.`,
"dev@pg:~$",
[
[/^psql -c "SHOW max_connections"/,`100`,"warn"],
[/^psql -c "SELECT count\(\*\) FROM pg_stat_activity"/,`99`,"err"],
[/^psql -c "ALTER SYSTEM SET max_connections = 300"/,`ALTER SYSTEM`,"ok"],
[/^psql -c "SELECT pg_reload_conf\(\)"/,`t (после reload новые лимит применён)`,"ok"]
],
[{re:/max_connections/,l:"посмотреть лимит"},
 {re:/pg_stat_activity/,l:"посчитать соединения"},
 {re:/ALTER SYSTEM/,l:"поднять лимит + reload"}]);

S("PostgreSQL","pg3","Реплика отстала — проверить lag","Middle",
`<b>Задача:</b> измерить lag реплики.`,
"dev@pg:~$",
[
[/^psql -c "SELECT application_name, replay_lag FROM pg_stat_replication"/,`replica-1 | 00:04:12`,"warn"],
[/^psql -c "SELECT pg_wal_replay_wait\(\)" 2>\/dev\/null \|\| echo "ждём replay"/,`replay completed`,"ok"],
[/^psql -c "SELECT replay_lag FROM pg_stat_replication"/,`00:00:00`,"ok"]
],
[{re:/pg_stat_replication/,l:"измерить lag"},
 {re:/(replay|SELECT replay_lag)/,l:"дождаться/проверить"}]);

S("PostgreSQL","pg4","Реплика мертва — пересоздать через pg_basebackup","Middle",
`<b>Симптом:</b> реплика не стартует после сбоя диска (WAL потерян).<br>
<b>Цель:</b> пересоздать data-dir реплики из primary через pg_basebackup и вернуть в строй.`,
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
 {re:/pg_is_in_recovery/,l:"проверить роль и lag"}]);

S("PostgreSQL","pg5","PITR: восстановить базу на момент до ошибки","Senior",
`<b>Ситуация:</b> в 14:00 выполнили DELETE без WHERE. Есть ночной pg_basebackup (03:00) и архив WAL. Восстановить состояние на 13:59:59.`,
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
 {re:/count\(\*\) FROM shop\.orders/,l:"проверить данные"}]);

S("PostgreSQL","pg6","Медленный запрос: EXPLAIN ANALYZE → индекс","Middle",
`<b>Симптом:</b> поиск пользователя по email занимает секунды.`,
"dev@pg:~$",
[
[/^EXPLAIN ANALYZE SELECT .*WHERE email/,`Seq Scan on users  (cost=0.00..2435.00 rows=1) (actual time=0.4..1180.2 rows=1 loops=1)\nPlanning Time: 0.2 ms\nExecution Time: 1180.5 ms`,"err"],
[/^CREATE INDEX CONCURRENTLY idx_users_email ON users\(email\);/,`CREATE INDEX`,"ok"],
[/^EXPLAIN ANALYZE SELECT .*WHERE email/,`Index Scan using idx_users_email  (actual time=0.03..0.05 rows=1)\nExecution Time: 0.06 ms`,"ok"],
[/^VACUUM ANALYZE users;/,`VACUUM`,"dim"]
],
[{re:/EXPLAIN ANALYZE/,l:"замерить план до и после"},
 {re:/CREATE INDEX/,l:"добавить индекс"},
 {re:/Seq Scan/,l:"убедиться, что Seq Scan ушёл"}]);

S("Redis","r1","Найти большие ключи","Middle",
`<b>Задача:</b> найти key-монстров.`,
"dev@redis:~$",
[
[/^redis-cli --bigkeys/,`Biggest list: 'queue:events' with 1200000 items`,"warn"],
[/^redis-cli memory usage queue:events/,`96000000 bytes (~96MB)`,"warn"],
[/^redis-cli --cluster check 127.0.0.1:7000 2>\/dev\/null \|\| redis-cli info memory \| grep used_memory_human/,`used_memory_human: 8.20G`,"ok"]
],
[{re:/--bigkeys/,l:"найти большие ключи"},
 {re:/memory usage/,l:"оценить размер ключа"}]);

S("Redis","r2","Redis Cluster: слот не покрыт","Senior",
`<b>Симптом:</b> CLUSTERDOWN Hash slot not served.`,
"dev@redis:~$",
[
[/^redis-cli --cluster check 127.0.0.1:7000/,`[ERR] Nodes don't agree about slots: slot 0 unassigned`,"err"],
[/^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes/,`...slot 0 assigned to node...`,"ok"],
[/^redis-cli --cluster check 127.0.0.1:7000/,`[OK] All 16384 slots covered.`,"ok"]
],
[{re:/--cluster check/,l:"проверить слоты до и после"},
 {re:/--cluster fix/,l:"починить распределение"}]);

S("ClickHouse","ch1","Найти самый тяжёлый запрос","Senior",
`<b>Задача:</b> топ запросов по прочитанным гигабайтам.`,
"dev@ch:~$",
[
[/^clickhouse-client --query .*query_log.*ORDER BY gb_read DESC/,`SELECT * FROM events WHERE ...  42.10  18.2`,"warn"],
[/^clickhouse-client --query "KILL QUERY WHERE query_id='...'"/,`Killed`,"ok"]
],
[{re:/query_log/,l:"топ по query_log"},
 {re:/KILL QUERY/i,l:"убить тяжёлый запрос"}]);

S("ClickHouse","ch2","Too many parts при мелких вставках","Middle",
`<b>Симптом:</b> Too many parts (300).`,
"dev@ch:~$",
[
[/^clickhouse-client --query "SELECT count\(\) FROM system\.parts WHERE active=0"/,`300 inactive parts`,"err"],
[/^(SET async_insert = 1|sed -i app\.py)/,`вставки батчами/async включены`,"ok"],
[/^clickhouse-client --query "SELECT count\(\) FROM system\.parts WHERE active"/,`12 parts`,"ok"]
],
[{re:/system\.parts/,l:"посмотреть части"},
 {re:/(async_insert|батч)/,l:"перейти на батч/async вставки"}]);

S("MinIO","mn1","Проверить и вылечить деградацию","Senior",
`<b>Задача:</b> проверить диски и запустить healing.`,
"dev@minio:~$",
[
[/^mc admin info prod/,`2 drives online, 1 offline`,"err"],
[/^mc admin heal prod\/backups --dry-run/,`Objects needing healing: 412`,"warn"],
[/^mc admin heal prod\/backups/,`Healed objects: 412`,"ok"],
[/^mc admin info prod/,`4 drives online`,"ok"]
],
[{re:/^mc admin info/,l:"статус дисков"},
 {re:/^mc admin heal/,l:"healing"}]);

S("etcd","et1","NOSPACE alarm — кластер не принимает записи","Senior",
`<b>Симптом:</b> etcdserver: mvcc: database space exceeded.`,
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
 {re:/alarm disarm/,l:"снять alarm"}]);

S("Longhorn","lh1","Том degraded — реплика восстанавливается","Middle",
`<b>Симптом:</b> алерт Robustness: degraded.`,
"dev@lab:~$",
[
[/^kubectl -n longhorn-system get volumes -o custom-columns=NAME:.metadata.name,ROBUST:.status.robustness/,`data-1  degraded`,"warn"],
[/^kubectl -n longhorn-system get replicas.longhorn.io \| grep data-1/,`2 of 3 replicas healthy`,"warn"],
[/^kubectl -n longhorn-system get volumes data-1 -w --request-timeout=120s/,`robustness: healthy`,"ok"]
],
[{re:/get volumes/,l:"увидеть degraded"},
 {re:/get replicas/,l:"проверить реплики"},
 {re:/healthy/,l:"дождаться healthy"}]);

S("Velero","vl1","Проверить бэкап и сделать restore-drill","Middle",
`<b>Задача:</b> убедиться, что бэкап полный, и восстановить в отдельный namespace.`,
"dev@lab:~$",
[
[/^velero backup describe nightly --details/,`Backup Volumes: podvolumebackups completed; TTL 720h`,"ok"],
[/^velero restore create --from-backup nightly --namespace-mappings prod:prod-drill/,`Restore "nightly-..." created`,"ok"],
[/^velero restore describe nightly-.* --details/,`Restore completed, warnings: 0, errors: 0`,"ok"],
[/^kubectl -n prod-drill get pods/,`api-xxx 1/1 Running`,"ok"]
],
[{re:/^velero backup describe/,l:"проверить бэкап"},
 {re:/^velero restore create/,l:"restore в drill-namespace"},
 {re:/^velero restore describe/,l:"проверить результат"}]);
