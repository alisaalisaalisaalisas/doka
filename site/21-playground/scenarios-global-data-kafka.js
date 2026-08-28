/* Global Playground: Kafka Kraft — 35 scenarios */
S("Kafka","gc-kafka-1","KRaft: quorum lost, 1/3 voters down","Junior", `<h3>Контекст</h3><p>Kafka: <b>KRaft: quorum lost, 1/3 voters down</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>KRaft: quorum lost, 1/3 voters down</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-metadata-quorum --bootst</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader: 1  Followers: 2 (1 offline)", "warn"],
 ["^cat /var/lib/kafka/meta.properties | grep node.id", "node.id=1", "warn"],
 ["^systemctl restart kafka", "restarted", "ok"],
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader:1 ISR 3/3", "ok"]
],
[{re:"^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status",l:"диагностика"},
 {re:"^systemctl restart kafka",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: KRaft: quorum lost, 1/3 voters down\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: KRaft: quorum lost, 1/3 voters down — fixed\nstatus: ok\n`}},{hints:["Симптом: KRaft: quorum lost, 1/3 voters down в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-2","Replicas: under-replicated partitions 12","Middle", `<h3>Контекст</h3><p>Kafka: <b>Replicas: under-replicated partitions 12</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Replicas: under-replicated partitions 12</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Topic orders Partition 2 Replicas 1,2,3 Isr 1,2", "err"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "PartitionCount 6 ReplicationFactor 3", "warn"],
 ["^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute", "Reassignment completed", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "(empty no URP)", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Replicas: under-replicated partitions 12\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Replicas: under-replicated partitions 12 — fixed\nstatus: ok\n`}},{hints:["Симптом: Replicas: under-replicated partitions 12 в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-3","ISR: shrink 3->2, follower lag","Senior", `<h3>Контекст</h3><p>Kafka: <b>ISR: shrink 3->2, follower lag</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ISR: shrink 3->2, follower lag</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Isr 1,2", "err"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type brokers --entity-name 2", "fetch.wait 500", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500", "Altered", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "Isr 1,2,3", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: ISR: shrink 3->2, follower lag\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: ISR: shrink 3->2, follower lag — fixed\nstatus: ok\n`}},{hints:["Симптом: ISR: shrink 3->2, follower lag в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-4","Lag: consumer group orders lag 4900","Junior", `<h3>Контекст</h3><p>Kafka: <b>Lag: consumer group orders lag 4900</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Lag: consumer group orders lag 4900</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders", "orders 0 100 5000 4900", "err"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --members", "consumer-1 host=worker-1", "warn"],
 ["^kubectl -n prod scale deploy orders-consumer --replicas=4", "scaled", "ok"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep LAG", "LAG 0", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders",l:"диагностика"},
 {re:"^kubectl -n prod scale deploy orders-consumer --replicas=4",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Lag: consumer group orders lag 4900\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Lag: consumer group orders lag 4900 — fixed\nstatus: ok\n`}},{hints:["Симптом: Lag: consumer group orders lag 4900 в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-5","reset-offsets: сдвинуть offset после poison pill","Middle", `<h3>Контекст</h3><p>Kafka: <b>reset-offsets: сдвинуть offset после poison pill</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>reset-offsets: сдвинуть offset после poison pill</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep \"2 \"", "PARTITION 2 LAG 1", "warn"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --offsets", "offset 42", "warn"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --reset-offsets --group orders --topic orders --partition 2 --to-offset 43 --execute", "NEW-OFFSET 43", "ok"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders", "LAG 0", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep \"2 \"",l:"диагностика"},
 {re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --reset-offsets --group orders --topic orders --partition 2 --to-offset 43 --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: reset-offsets: сдвинуть offset после poison pill\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: reset-offsets: сдвинуть offset после poison pill — fixed\nstatus: ok\n`}},{hints:["Симптом: reset-offsets: сдвинуть offset после poison pill в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-6","SCRAM: SASL auth failed","Senior", `<h3>Контекст</h3><p>Kafka: <b>SCRAM: SASL auth failed</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SCRAM: SASL auth failed</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-configs.sh --bootstrap-s</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice", "SCRAM credential not found", "warn"],
 ["^cat /etc/kafka/jaas.conf | grep SCRAM", "missing", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]", "Altered", "ok"],
 ["^kafkacat -b kafka:9092 -L -X sasl.mechanism=SCRAM-SHA-512 -X security.protocol=SASL_PLAINTEXT", "metadata ok", "ok"]
],
[{re:"^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: SCRAM: SASL auth failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: SCRAM: SASL auth failed — fixed\nstatus: ok\n`}},{hints:["Симптом: SCRAM: SASL auth failed в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-7","Schema Registry: incompatible Avro evolution","Junior", `<h3>Контекст</h3><p>Kafka: <b>Schema Registry: incompatible Avro evolution</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Schema Registry: incompatible Avro evolution</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s http://schema-registry</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility", "INCOMPATIBLE", "warn"],
 ["^curl -s http://schema-registry:8081/config/orders-value | jq .compatibilityLevel", "BACKWARD", "warn"],
 ["^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"", "updated", "ok"],
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions | jq length", "3 versions", "ok"]
],
[{re:"^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility",l:"диагностика"},
 {re:"^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Schema Registry: incompatible Avro evolution\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Schema Registry: incompatible Avro evolution — fixed\nstatus: ok\n`}},{hints:["Симптом: Schema Registry: incompatible Avro evolution в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-8","Kraft: controller not leader","Middle", `<h3>Контекст</h3><p>Kafka: <b>Kraft: controller not leader</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kraft: controller not leader</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-metadata-quorum --bootst</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader: 1  Followers: 2 (1 offline)", "warn"],
 ["^cat /var/lib/kafka/meta.properties | grep node.id", "node.id=1", "warn"],
 ["^systemctl restart kafka", "restarted", "ok"],
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader:1 ISR 3/3", "ok"]
],
[{re:"^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status",l:"диагностика"},
 {re:"^systemctl restart kafka",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Kraft: controller not leader\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Kraft: controller not leader — fixed\nstatus: ok\n`}},{hints:["Симптом: Kraft: controller not leader в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-9","Replicas: leader election failed","Senior", `<h3>Контекст</h3><p>Kafka: <b>Replicas: leader election failed</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Replicas: leader election failed</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Topic orders Partition 2 Replicas 1,2,3 Isr 1,2", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "PartitionCount 6 ReplicationFactor 3", "warn"],
 ["^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute", "Reassignment completed", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "(empty no URP)", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Replicas: leader election failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Replicas: leader election failed — fixed\nstatus: ok\n`}},{hints:["Симптом: Replicas: leader election failed в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-10","ISR: follower fetch timeout","Junior", `<h3>Контекст</h3><p>Kafka: <b>ISR: follower fetch timeout</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ISR: follower fetch timeout</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Isr 1,2", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type brokers --entity-name 2", "fetch.wait 500", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500", "Altered", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "Isr 1,2,3", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: ISR: follower fetch timeout\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: ISR: follower fetch timeout — fixed\nstatus: ok\n`}},{hints:["Симптом: ISR: follower fetch timeout в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-11","Lag: partitions skew 80% on one broker","Middle", `<h3>Контекст</h3><p>Kafka: <b>Lag: partitions skew 80% on one broker</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Lag: partitions skew 80% on one broker</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders", "orders 0 100 5000 4900", "err"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --members", "consumer-1 host=worker-1", "warn"],
 ["^kubectl -n prod scale deploy orders-consumer --replicas=4", "scaled", "ok"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep LAG", "LAG 0", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders",l:"диагностика"},
 {re:"^kubectl -n prod scale deploy orders-consumer --replicas=4",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Lag: partitions skew 80% on one broker\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Lag: partitions skew 80% on one broker — fixed\nstatus: ok\n`}},{hints:["Симптом: Lag: partitions skew 80% on one broker в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-12","SCRAM: credential rotation needed","Senior", `<h3>Контекст</h3><p>Kafka: <b>SCRAM: credential rotation needed</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SCRAM: credential rotation needed</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-configs.sh --bootstrap-s</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice", "SCRAM credential not found", "warn"],
 ["^cat /etc/kafka/jaas.conf | grep SCRAM", "missing", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]", "Altered", "ok"],
 ["^kafkacat -b kafka:9092 -L -X sasl.mechanism=SCRAM-SHA-512 -X security.protocol=SASL_PLAINTEXT", "metadata ok", "ok"]
],
[{re:"^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: SCRAM: credential rotation needed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: SCRAM: credential rotation needed — fixed\nstatus: ok\n`}},{hints:["Симптом: SCRAM: credential rotation needed в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-13","Schema: subject not found","Junior", `<h3>Контекст</h3><p>Kafka: <b>Schema: subject not found</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Schema: subject not found</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s http://schema-registry</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility", "INCOMPATIBLE", "warn"],
 ["^curl -s http://schema-registry:8081/config/orders-value | jq .compatibilityLevel", "BACKWARD", "warn"],
 ["^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"", "updated", "ok"],
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions | jq length", "3 versions", "ok"]
],
[{re:"^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility",l:"диагностика"},
 {re:"^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Schema: subject not found\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Schema: subject not found — fixed\nstatus: ok\n`}},{hints:["Симптом: Schema: subject not found в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-14","Kraft: metadata log segment corrupted","Middle", `<h3>Контекст</h3><p>Kafka: <b>Kraft: metadata log segment corrupted</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kraft: metadata log segment corrupted</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-metadata-quorum --bootst</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader: 1  Followers: 2 (1 offline)", "warn"],
 ["^cat /var/lib/kafka/meta.properties | grep node.id", "node.id=1", "warn"],
 ["^systemctl restart kafka", "restarted", "ok"],
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader:1 ISR 3/3", "ok"]
],
[{re:"^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status",l:"диагностика"},
 {re:"^systemctl restart kafka",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Kraft: metadata log segment corrupted\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Kraft: metadata log segment corrupted — fixed\nstatus: ok\n`}},{hints:["Симптом: Kraft: metadata log segment corrupted в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-15","Replicas: min.insync.replicas 2 not met","Senior", `<h3>Контекст</h3><p>Kafka: <b>Replicas: min.insync.replicas 2 not met</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Replicas: min.insync.replicas 2 not met</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Topic orders Partition 2 Replicas 1,2,3 Isr 1,2", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "PartitionCount 6 ReplicationFactor 3", "warn"],
 ["^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute", "Reassignment completed", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "(empty no URP)", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Replicas: min.insync.replicas 2 not met\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Replicas: min.insync.replicas 2 not met — fixed\nstatus: ok\n`}},{hints:["Симптом: Replicas: min.insync.replicas 2 not met в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-16","ISR: throttled replica","Junior", `<h3>Контекст</h3><p>Kafka: <b>ISR: throttled replica</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ISR: throttled replica</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Topic orders Partition 2 Replicas 1,2,3 Isr 1,2", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "PartitionCount 6 ReplicationFactor 3", "warn"],
 ["^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute", "Reassignment completed", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "(empty no URP)", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: ISR: throttled replica\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: ISR: throttled replica — fixed\nstatus: ok\n`}},{hints:["Симптом: ISR: throttled replica в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-17","Lag: rebalancing storm","Middle", `<h3>Контекст</h3><p>Kafka: <b>Lag: rebalancing storm</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Lag: rebalancing storm</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders", "orders 0 100 5000 4900", "err"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --members", "consumer-1 host=worker-1", "warn"],
 ["^kubectl -n prod scale deploy orders-consumer --replicas=4", "scaled", "ok"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep LAG", "LAG 0", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders",l:"диагностика"},
 {re:"^kubectl -n prod scale deploy orders-consumer --replicas=4",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Lag: rebalancing storm\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Lag: rebalancing storm — fixed\nstatus: ok\n`}},{hints:["Симптом: Lag: rebalancing storm в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-18","reset-offsets: to-earliest vs to-latest","Senior", `<h3>Контекст</h3><p>Kafka: <b>reset-offsets: to-earliest vs to-latest</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>reset-offsets: to-earliest vs to-latest</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep \"2 \"", "PARTITION 2 LAG 1", "warn"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --offsets", "offset 42", "warn"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --reset-offsets --group orders --topic orders --partition 2 --to-offset 43 --execute", "NEW-OFFSET 43", "ok"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders", "LAG 0", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep \"2 \"",l:"диагностика"},
 {re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --reset-offsets --group orders --topic orders --partition 2 --to-offset 43 --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: reset-offsets: to-earliest vs to-latest\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: reset-offsets: to-earliest vs to-latest — fixed\nstatus: ok\n`}},{hints:["Симптом: reset-offsets: to-earliest vs to-latest в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-19","SCRAM: PBKDF2 iterations too low","Junior", `<h3>Контекст</h3><p>Kafka: <b>SCRAM: PBKDF2 iterations too low</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SCRAM: PBKDF2 iterations too low</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-configs.sh --bootstrap-s</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice", "SCRAM credential not found", "warn"],
 ["^cat /etc/kafka/jaas.conf | grep SCRAM", "missing", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]", "Altered", "ok"],
 ["^kafkacat -b kafka:9092 -L -X sasl.mechanism=SCRAM-SHA-512 -X security.protocol=SASL_PLAINTEXT", "metadata ok", "ok"]
],
[{re:"^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: SCRAM: PBKDF2 iterations too low\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: SCRAM: PBKDF2 iterations too low — fixed\nstatus: ok\n`}},{hints:["Симптом: SCRAM: PBKDF2 iterations too low в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-20","Schema: compatibility FORWARD vs BACKWARD","Middle", `<h3>Контекст</h3><p>Kafka: <b>Schema: compatibility FORWARD vs BACKWARD</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Schema: compatibility FORWARD vs BACKWARD</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s http://schema-registry</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility", "INCOMPATIBLE", "warn"],
 ["^curl -s http://schema-registry:8081/config/orders-value | jq .compatibilityLevel", "BACKWARD", "warn"],
 ["^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"", "updated", "ok"],
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions | jq length", "3 versions", "ok"]
],
[{re:"^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility",l:"диагностика"},
 {re:"^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Schema: compatibility FORWARD vs BACKWARD\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Schema: compatibility FORWARD vs BACKWARD — fixed\nstatus: ok\n`}},{hints:["Симптом: Schema: compatibility FORWARD vs BACKWARD в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-21","Kraft: snapshot at offset 12345 failed","Senior", `<h3>Контекст</h3><p>Kafka: <b>Kraft: snapshot at offset 12345 failed</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kraft: snapshot at offset 12345 failed</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-metadata-quorum --bootst</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader: 1  Followers: 2 (1 offline)", "warn"],
 ["^cat /var/lib/kafka/meta.properties | grep node.id", "node.id=1", "warn"],
 ["^systemctl restart kafka", "restarted", "ok"],
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader:1 ISR 3/3", "ok"]
],
[{re:"^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status",l:"диагностика"},
 {re:"^systemctl restart kafka",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Kraft: snapshot at offset 12345 failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Kraft: snapshot at offset 12345 failed — fixed\nstatus: ok\n`}},{hints:["Симптом: Kraft: snapshot at offset 12345 failed в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-22","Replicas: preferred leader not available","Junior", `<h3>Контекст</h3><p>Kafka: <b>Replicas: preferred leader not available</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Replicas: preferred leader not available</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Topic orders Partition 2 Replicas 1,2,3 Isr 1,2", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "PartitionCount 6 ReplicationFactor 3", "warn"],
 ["^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute", "Reassignment completed", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "(empty no URP)", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Replicas: preferred leader not available\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Replicas: preferred leader not available — fixed\nstatus: ok\n`}},{hints:["Симптом: Replicas: preferred leader not available в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-23","ISR: unclean leader election disabled","Middle", `<h3>Контекст</h3><p>Kafka: <b>ISR: unclean leader election disabled</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ISR: unclean leader election disabled</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Isr 1,2", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type brokers --entity-name 2", "fetch.wait 500", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500", "Altered", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "Isr 1,2,3", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: ISR: unclean leader election disabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: ISR: unclean leader election disabled — fixed\nstatus: ok\n`}},{hints:["Симптом: ISR: unclean leader election disabled в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-24","Lag: max.poll.interval.ms exceeded","Senior", `<h3>Контекст</h3><p>Kafka: <b>Lag: max.poll.interval.ms exceeded</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Lag: max.poll.interval.ms exceeded</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders", "orders 0 100 5000 4900", "err"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --members", "consumer-1 host=worker-1", "warn"],
 ["^kubectl -n prod scale deploy orders-consumer --replicas=4", "scaled", "ok"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep LAG", "LAG 0", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders",l:"диагностика"},
 {re:"^kubectl -n prod scale deploy orders-consumer --replicas=4",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Lag: max.poll.interval.ms exceeded\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Lag: max.poll.interval.ms exceeded — fixed\nstatus: ok\n`}},{hints:["Симптом: Lag: max.poll.interval.ms exceeded в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-25","SCRAM: JAAS config missing","Junior", `<h3>Контекст</h3><p>Kafka: <b>SCRAM: JAAS config missing</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SCRAM: JAAS config missing</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-configs.sh --bootstrap-s</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice", "SCRAM credential not found", "warn"],
 ["^cat /etc/kafka/jaas.conf | grep SCRAM", "missing", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]", "Altered", "ok"],
 ["^kafkacat -b kafka:9092 -L -X sasl.mechanism=SCRAM-SHA-512 -X security.protocol=SASL_PLAINTEXT", "metadata ok", "ok"]
],
[{re:"^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: SCRAM: JAAS config missing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: SCRAM: JAAS config missing — fixed\nstatus: ok\n`}},{hints:["Симптом: SCRAM: JAAS config missing в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-26","Schema: normalize schema 404","Middle", `<h3>Контекст</h3><p>Kafka: <b>Schema: normalize schema 404</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Schema: normalize schema 404</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s http://schema-registry</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility", "INCOMPATIBLE", "warn"],
 ["^curl -s http://schema-registry:8081/config/orders-value | jq .compatibilityLevel", "BACKWARD", "warn"],
 ["^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"", "updated", "ok"],
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions | jq length", "3 versions", "ok"]
],
[{re:"^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility",l:"диагностика"},
 {re:"^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Schema: normalize schema 404\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Schema: normalize schema 404 — fixed\nstatus: ok\n`}},{hints:["Симптом: Schema: normalize schema 404 в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-27","Kraft: voter vs observer","Senior", `<h3>Контекст</h3><p>Kafka: <b>Kraft: voter vs observer</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kraft: voter vs observer</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-metadata-quorum --bootst</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader: 1  Followers: 2 (1 offline)", "warn"],
 ["^cat /var/lib/kafka/meta.properties | grep node.id", "node.id=1", "warn"],
 ["^systemctl restart kafka", "restarted", "ok"],
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader:1 ISR 3/3", "ok"]
],
[{re:"^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status",l:"диагностика"},
 {re:"^systemctl restart kafka",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Kraft: voter vs observer\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Kraft: voter vs observer — fixed\nstatus: ok\n`}},{hints:["Симптом: Kraft: voter vs observer в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-28","Replicas: assignment json malformed","Junior", `<h3>Контекст</h3><p>Kafka: <b>Replicas: assignment json malformed</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Replicas: assignment json malformed</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Topic orders Partition 2 Replicas 1,2,3 Isr 1,2", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "PartitionCount 6 ReplicationFactor 3", "warn"],
 ["^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute", "Reassignment completed", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "(empty no URP)", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Replicas: assignment json malformed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Replicas: assignment json malformed — fixed\nstatus: ok\n`}},{hints:["Симптом: Replicas: assignment json malformed в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-29","ISR: log retention 7d vs 30d","Middle", `<h3>Контекст</h3><p>Kafka: <b>ISR: log retention 7d vs 30d</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ISR: log retention 7d vs 30d</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Isr 1,2", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type brokers --entity-name 2", "fetch.wait 500", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500", "Altered", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "Isr 1,2,3", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: ISR: log retention 7d vs 30d\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: ISR: log retention 7d vs 30d — fixed\nstatus: ok\n`}},{hints:["Симптом: ISR: log retention 7d vs 30d в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-30","Lag: consumer not committing","Senior", `<h3>Контекст</h3><p>Kafka: <b>Lag: consumer not committing</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Lag: consumer not committing</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders", "orders 0 100 5000 4900", "err"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --members", "consumer-1 host=worker-1", "warn"],
 ["^kubectl -n prod scale deploy orders-consumer --replicas=4", "scaled", "ok"],
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep LAG", "LAG 0", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders",l:"диагностика"},
 {re:"^kubectl -n prod scale deploy orders-consumer --replicas=4",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Lag: consumer not committing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Lag: consumer not committing — fixed\nstatus: ok\n`}},{hints:["Симптом: Lag: consumer not committing в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-31","SCRAM: SCRAM-SHA-512 vs 256","Junior", `<h3>Контекст</h3><p>Kafka: <b>SCRAM: SCRAM-SHA-512 vs 256</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SCRAM: SCRAM-SHA-512 vs 256</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-configs.sh --bootstrap-s</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice", "SCRAM credential not found", "warn"],
 ["^cat /etc/kafka/jaas.conf | grep SCRAM", "missing", "warn"],
 ["^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]", "Altered", "ok"],
 ["^kafkacat -b kafka:9092 -L -X sasl.mechanism=SCRAM-SHA-512 -X security.protocol=SASL_PLAINTEXT", "metadata ok", "ok"]
],
[{re:"^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice",l:"диагностика"},
 {re:"^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: SCRAM: SCRAM-SHA-512 vs 256\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: SCRAM: SCRAM-SHA-512 vs 256 — fixed\nstatus: ok\n`}},{hints:["Симптом: SCRAM: SCRAM-SHA-512 vs 256 в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-32","Schema: schema id 42 not found","Middle", `<h3>Контекст</h3><p>Kafka: <b>Schema: schema id 42 not found</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Schema: schema id 42 not found</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s http://schema-registry</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility", "INCOMPATIBLE", "warn"],
 ["^curl -s http://schema-registry:8081/config/orders-value | jq .compatibilityLevel", "BACKWARD", "warn"],
 ["^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"", "updated", "ok"],
 ["^curl -s http://schema-registry:8081/subjects/orders-value/versions | jq length", "3 versions", "ok"]
],
[{re:"^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility",l:"диагностика"},
 {re:"^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\"",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Schema: schema id 42 not found\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Schema: schema id 42 not found — fixed\nstatus: ok\n`}},{hints:["Симптом: Schema: schema id 42 not found в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-33","Kraft: kraft.version 3.7","Senior", `<h3>Контекст</h3><p>Kafka: <b>Kraft: kraft.version 3.7</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kraft: kraft.version 3.7</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-metadata-quorum --bootst</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader: 1  Followers: 2 (1 offline)", "warn"],
 ["^cat /var/lib/kafka/meta.properties | grep node.id", "node.id=1", "warn"],
 ["^systemctl restart kafka", "restarted", "ok"],
 ["^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status", "Leader:1 ISR 3/3", "ok"]
],
[{re:"^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status",l:"диагностика"},
 {re:"^systemctl restart kafka",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Kraft: kraft.version 3.7\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Kraft: kraft.version 3.7 — fixed\nstatus: ok\n`}},{hints:["Симптом: Kraft: kraft.version 3.7 в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-34","Replicas: rack aware replica placement","Junior", `<h3>Контекст</h3><p>Kafka: <b>Replicas: rack aware replica placement</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Replicas: rack aware replica placement</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Topic orders Partition 2 Replicas 1,2,3 Isr 1,2", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "PartitionCount 6 ReplicationFactor 3", "warn"],
 ["^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute", "Reassignment completed", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "(empty no URP)", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: Replicas: rack aware replica placement\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: Replicas: rack aware replica placement — fixed\nstatus: ok\n`}},{hints:["Симптом: Replicas: rack aware replica placement в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

S("Kafka","gc-kafka-35","ISR: replica fetch backoff","Middle", `<h3>Контекст</h3><p>Kafka: <b>ISR: replica fetch backoff</b>. Работа с <code>kafka/config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ISR: replica fetch backoff</b>. Файл <code>kafka/config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>kafka/config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>kafka/config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-topics.sh --bootstrap-se</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat kafka/config.yaml<br>проверить код</pre>`,
"dev@kafka:~$",
[
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "Topic orders Partition 2 Replicas 1,2,3 Isr 1,2", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders", "PartitionCount 6 ReplicationFactor 3", "warn"],
 ["^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute", "Reassignment completed", "ok"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated", "(empty no URP)", "ok"]
],
[{re:"^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated",l:"диагностика"},
 {re:"^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute",l:"исправить"}],{file:"kafka/config.yaml",files:{"kafka/config.yaml":`# Kafka: ISR: replica fetch backoff\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"kafka/config.yaml":`# Kafka: ISR: replica fetch backoff — fixed\nstatus: ok\n`}},{hints:["Симптом: ISR: replica fetch backoff в kafka/config.yaml. Ищи причину в коде/конфиге этого файла.","Открой kafka/config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat kafka/config.yaml.","Порядок: диагностика → исправить"]});

