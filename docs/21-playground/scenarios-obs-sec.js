/* Песочница: Prometheus, Loki, Alertmanager, Thanos, Vault, Kyverno, ESO, cert-manager, Falco */
S("Prometheus","p1","PromQL: error rate за 5 минут","Middle",
`<h3>Контекст</h3><p>Prometheus: <b>PromQL: error rate за 5 минут</b>. Работа с <code>monitoring/prometheus.yml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PromQL: error rate за 5 минут</b>. Файл <code>monitoring/prometheus.yml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] запрос error rate</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>monitoring/prometheus.yml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>monitoring/prometheus.yml</code>. Активный файл открыт в редакторе. Начните с <code>sum\\\\(rate\\\\(http_requests_tot</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: запрос error rate.</p><h3>Проверка</h3><pre>cat monitoring/prometheus.yml<br>проверить код</pre>`,
"dev@grafana:~$",
[
["^sum\\(rate\\(http_requests_total\\{code=~\"5\\.\\.\"\\}\\[5m\\]\\)\\).*",`{job="api"}  0.023   <-- 2.3% ошибок`,"warn"]
],
[{re:/rate\(http_requests_total/,l:"запрос error rate"}],{file:"monitoring/prometheus.yml",files:{"monitoring/prometheus.yml":`# Prometheus: PromQL: error rate за 5 минут\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"monitoring/prometheus.yml":`# Prometheus: PromQL: error rate за 5 минут — fixed\nstatus: ok\n`}},{hints:["Симптом: PromQL: error rate за 5 минут в monitoring/prometheus.yml. Ищи причину в коде/конфиге этого файла.","Открой monitoring/prometheus.yml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat monitoring/prometheus.yml.","Порядок: запрос error rate"]});

S("Prometheus","p2","PromQL: p99 латентность из гистограммы","Senior",
`<h3>Контекст</h3><p>Prometheus: <b>PromQL: p99 латентность из гистограммы</b>. Работа с <code>monitoring/prometheus.yml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PromQL: p99 латентность из гистограммы</b>. Файл <code>monitoring/prometheus.yml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] histogram_quantile(0.99, ...)</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>monitoring/prometheus.yml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>monitoring/prometheus.yml</code>. Активный файл открыт в редакторе. Начните с <code>histogram_quantile\\\\(0\\\\.99</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: histogram_quantile(0.99, ...).</p><h3>Проверка</h3><pre>cat monitoring/prometheus.yml<br>проверить код</pre>`,
"dev@grafana:~$",
[
["^histogram_quantile\\(0\\.99",`{le="+Inf"} 0.842   <-- p99 = 842ms`,"ok"]
],
[{re:/histogram_quantile/,l:"histogram_quantile(0.99, ...)"}],{file:"monitoring/prometheus.yml",files:{"monitoring/prometheus.yml":`# Prometheus: PromQL: p99 латентность из гистограммы\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"monitoring/prometheus.yml":`# Prometheus: PromQL: p99 латентность из гистограммы — fixed\nstatus: ok\n`}},{hints:["Симптом: PromQL: p99 латентность из гистограммы в monitoring/prometheus.yml. Ищи причину в коде/конфиге этого файла.","Открой monitoring/prometheus.yml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat monitoring/prometheus.yml.","Порядок: histogram_quantile(0.99, ...)"]});

S("Prometheus","p3","Target DOWN — почему не скрейпится","Middle",
`<h3>Контекст</h3><p>Prometheus: <b>Target DOWN — почему не скрейпится</b>. Работа с <code>monitoring/prometheus.yml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Target DOWN — почему не скрейпится</b>. Файл <code>monitoring/prometheus.yml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть lastError таргета</li><li>[ ] исправить scrape-конфиг</li><li>[ ] проверить, что UP</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>monitoring/prometheus.yml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>monitoring/prometheus.yml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s localhost:9090\\\\/api\\\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть lastError таргета → исправить scrape-конфиг → проверить, что UP.</p><h3>Проверка</h3><pre>cat monitoring/prometheus.yml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^curl -s localhost:9090\\/api\\/v1\\/targets \\| jq .*health",`"health":"down","lastError":"connection refused"`,"err"],
["^curl -s api:8080\\/metrics \\| head -1",`(connection refused) — /metrics не слушается`,"err"],
["^(kubectl patch deploy api|sed -i prometheus\\.yml)",`порт/аннотация prometheus.io/scrape исправлены`,"ok"],
["^curl -s localhost:9090\\/api\\/v1\\/targets \\| jq .*health",`"health":"up"`,"ok"]
],
[{re:/api\/v1\/targets/,l:"посмотреть lastError таргета"},
 {re:"(patch|sed|scrape)",l:"исправить scrape-конфиг"},
 {re:"api\\/v1\\/targets",l:"проверить, что UP"}],{file:"monitoring/prometheus.yml",files:{"monitoring/prometheus.yml":`# Prometheus: Target DOWN — почему не скрейпится\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"monitoring/prometheus.yml":`# Prometheus: Target DOWN — почему не скрейпится — fixed\nstatus: ok\n`}},{hints:["Симптом: Target DOWN — почему не скрейпится в monitoring/prometheus.yml. Ищи причину в коде/конфиге этого файла.","Открой monitoring/prometheus.yml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat monitoring/prometheus.yml.","Порядок: посмотреть lastError таргета → исправить scrape-конфиг → проверить, что UP"]});

S("Prometheus","p4","Правило алерта не загружено","Middle",
`<h3>Контекст</h3><p>Prometheus: <b>Правило алерта не загружено</b>. Работа с <code>monitoring/prometheus.yml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Правило алерта не загружено</b>. Файл <code>monitoring/prometheus.yml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить, загружено ли правило</li><li>[ ] поправить label selector</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>monitoring/prometheus.yml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>monitoring/prometheus.yml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s localhost:9090\\\\/api\\\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить, загружено ли правило → поправить label selector.</p><h3>Проверка</h3><pre>cat monitoring/prometheus.yml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^curl -s localhost:9090\\/api\\/v1\\/rules \\| jq .*health",`правило отсутствует в списке`,"err"],
["^kubectl get prometheusrule demo -o yaml \\| grep labels",`labels: (нет release: kps!)`,"err"],
["^kubectl label prometheusrule demo release=kps",`labeled`,"ok"],
["^curl -s localhost:9090\\/api\\/v1\\/rules \\| jq .*name",`PodInfoHighErrorRate`,"ok"]
],
[{re:/api\/v1\/rules/,l:"проверить, загружено ли правило"},
 {re:"kubectl (label|get prometheusrule)",l:"поправить label selector"}],{file:"monitoring/prometheus.yml",files:{"monitoring/prometheus.yml":`# Prometheus: Правило алерта не загружено\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"monitoring/prometheus.yml":`# Prometheus: Правило алерта не загружено — fixed\nstatus: ok\n`}},{hints:["Симптом: Правило алерта не загружено в monitoring/prometheus.yml. Ищи причину в коде/конфиге этого файла.","Открой monitoring/prometheus.yml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat monitoring/prometheus.yml.","Порядок: проверить, загружено ли правило → поправить label selector"]});

S("Alertmanager","am1","Silence на время работ","Middle",
`<h3>Контекст</h3><p>Alertmanager: <b>Silence на время работ</b>. Работа с <code>project/silence-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Silence на время работ</b>. Файл <code>project/silence-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать silence</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/silence-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/silence-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>amtool silence add alertname=C</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать silence → проверить.</p><h3>Проверка</h3><pre>cat project/silence-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^amtool silence add alertname=CertificateExpiring --duration=4h",`silence id: 8f7a...`,"ok"],
["^amtool silence query",`8f7a... CertificateExpiring expires in 4h`,"ok"]
],
[{re:/^amtool silence add/,l:"создать silence"},
 {re:"^amtool silence query",l:"проверить"}],{file:"project/silence-.yaml",files:{"project/silence-.yaml":`# Alertmanager: Silence на время работ\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/silence-.yaml":`# Alertmanager: Silence на время работ — fixed\nstatus: ok\n`}},{hints:["Симптом: Silence на время работ в project/silence-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/silence-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/silence-.yaml.","Порядок: создать silence → проверить"]});

S("Alertmanager","am2","Инхибиция: NodeDown глушит дочерние","Senior",
`<h3>Контекст</h3><p>Alertmanager: <b>Инхибиция: NodeDown глушит дочерние</b>. Работа с <code>project/-nodedown-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Инхибиция: NodeDown глушит дочерние</b>. Файл <code>project/-nodedown-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] протестировать маршрутизацию/инхибицию</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-nodedown-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-nodedown-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>amtool config routes test.*sev</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: протестировать маршрутизацию/инхибицию.</p><h3>Проверка</h3><pre>cat project/-nodedown-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^amtool config routes test.*severity=warning.*node=worker-2",`Route: matched inhibit source NodeDown → suppressed`,"ok"]
],
[{re:/^amtool (config|silence)/,l:"протестировать маршрутизацию/инхибицию"}],{file:"project/-nodedown-.yaml",files:{"project/-nodedown-.yaml":`# Alertmanager: Инхибиция: NodeDown глушит дочерние\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-nodedown-.yaml":`# Alertmanager: Инхибиция: NodeDown глушит дочерние — fixed\nstatus: ok\n`}},{hints:["Симптом: Инхибиция: NodeDown глушит дочерние в project/-nodedown-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-nodedown-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-nodedown-.yaml.","Порядок: протестировать маршрутизацию/инхибицию"]});

S("Loki","lo1","LogQL: ошибки приложения за 15 минут","Middle",
`<h3>Контекст</h3><p>Loki: <b>LogQL: ошибки приложения за 15 минут</b>. Работа с <code>project/logql-15-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>LogQL: ошибки приложения за 15 минут</b>. Файл <code>project/logql-15-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] LogQL-селектор по app</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/logql-15-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/logql-15-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>\\\\{app=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: LogQL-селектор по app.</p><h3>Проверка</h3><pre>cat project/logql-15-.yaml<br>проверить код</pre>`,
"dev@grafana:~$",
[
["^\\{app=\"api\"\\} \\|= \"error\"",`14:01:02 api-xxx connection refused db:5432\n14:01:05 api-xxx retry 1/5`,"warn"]
],
[{re:/\{app="api"\}/,l:"LogQL-селектор по app"}],{file:"project/logql-15-.yaml",files:{"project/logql-15-.yaml":`# Loki: LogQL: ошибки приложения за 15 минут\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/logql-15-.yaml":`# Loki: LogQL: ошибки приложения за 15 минут — fixed\nstatus: ok\n`}},{hints:["Симптом: LogQL: ошибки приложения за 15 минут в project/logql-15-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/logql-15-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/logql-15-.yaml.","Порядок: LogQL-селектор по app"]});

S("Loki","lo2","Кардинальность: user_id в лейблах","Senior",
`<h3>Контекст</h3><p>Loki: <b>Кардинальность: user_id в лейблах</b>. Работа с <code>project/-user-id-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Кардинальность: user_id в лейблах</b>. Файл <code>project/-user-id-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть число streams</li><li>[ ] убрать high-cardinality label</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-user-id-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-user-id-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s localhost:3100\\\\/metri</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть число streams → убрать high-cardinality label.</p><h3>Проверка</h3><pre>cat project/-user-id-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^curl -s localhost:3100\\/metrics \\| grep loki_distributor_streams",`streams: 1_240_000`,"err"],
["^(sed -i alloy\\.alloy|kubectl -n monitoring edit configmap alloy)",`user_id убран из labels (только парсинг в строке)`,"ok"],
["^curl -s localhost:3100\\/metrics \\| grep loki_distributor_streams",`streams: 12_400`,"ok"]
],
[{re:/streams/i,l:"посмотреть число streams"},
 {re:"(sed|edit configmap)",l:"убрать high-cardinality label"}],{file:"project/-user-id-.yaml",files:{"project/-user-id-.yaml":`# Loki: Кардинальность: user_id в лейблах\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-user-id-.yaml":`# Loki: Кардинальность: user_id в лейблах — fixed\nstatus: ok\n`}},{hints:["Симптом: Кардинальность: user_id в лейблах в project/-user-id-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-user-id-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-user-id-.yaml.","Порядок: посмотреть число streams → убрать high-cardinality label"]});

S("Thanos","th1","Дубли серий после HA","Senior",
`<h3>Контекст</h3><p>Thanos: <b>Дубли серий после HA</b>. Работа с <code>project/-ha.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Дубли серий после HA</b>. Файл <code>project/-ha.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть дубли</li><li>[ ] включить дедупликацию</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-ha.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-ha.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s thanos-query:9090\\\\/ap</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть дубли → включить дедупликацию.</p><h3>Проверка</h3><pre>cat project/-ha.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^curl -s thanos-query:9090\\/api\\/v1\\/series\\?match\\[\\]=up \\| jq .*replica",`replica: 0 и replica: 1 — дубли!`,"err"],
["^(helm upgrade.*replicaLabels|kubectl edit deploy thanos-query)",`replicaLabels: [prometheus_replica]`,"ok"],
["^curl -s thanos-query:9090\\/api\\/v1\\/series\\?match\\[\\]=up \\| jq .*replica",`replica отсутствует (дедуп сработал)`,"ok"]
],
[{re:/api\/v1\/series/,l:"увидеть дубли"},
 {re:"replicaLabels|edit deploy",l:"включить дедупликацию"}],{file:"project/-ha.yaml",files:{"project/-ha.yaml":`# Thanos: Дубли серий после HA\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-ha.yaml":`# Thanos: Дубли серий после HA — fixed\nstatus: ok\n`}},{hints:["Симптом: Дубли серий после HA в project/-ha.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-ha.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-ha.yaml.","Порядок: увидеть дубли → включить дедупликацию"]});

S("VictoriaMetrics","vm1","Кардинальность метрик","Senior",
`<h3>Контекст</h3><p>VictoriaMetrics: <b>Кардинальность метрик</b>. Работа с <code>project/-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Кардинальность метрик</b>. Файл <code>project/-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] топ кардинальных лейблов</li><li>[ ] добавить drop-правила</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s vmsingle:8428\\\\/api\\\\/</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: топ кардинальных лейблов → добавить drop-правила.</p><h3>Проверка</h3><pre>cat project/-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^curl -s vmsingle:8428\\/api\\/v1\\/status\\/tsdb \\| jq .*seriesCountByLabelName\\[:3\\]",`pod_name 480k; user_id 310k; trace_id 90k`,"warn"],
["^(relabel|sed -i vmagent)",`drop-правила для user_id/trace_id добавлены`,"ok"]
],
[{re:/status\/tsdb/,l:"топ кардинальных лейблов"},
 {re:"(relabel|drop)",l:"добавить drop-правила"}],{file:"project/-.yaml",files:{"project/-.yaml":`# VictoriaMetrics: Кардинальность метрик\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-.yaml":`# VictoriaMetrics: Кардинальность метрик — fixed\nstatus: ok\n`}},{hints:["Симптом: Кардинальность метрик в project/-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-.yaml.","Порядок: топ кардинальных лейблов → добавить drop-правила"]});

S("Vault","v1","KV: положить и прочитать секрет","Junior",
`<h3>Контекст</h3><p>Vault: <b>KV: положить и прочитать секрет</b>. Работа с <code>project/kv-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>KV: положить и прочитать секрет</b>. Файл <code>project/kv-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] записать</li><li>[ ] прочитать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kv-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kv-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>vault kv put secret\\\\/prod\\\\/a</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: записать → прочитать.</p><h3>Проверка</h3><pre>cat project/kv-.yaml<br>проверить код</pre>`,
"dev@vault:~$",
[
["^vault kv put secret\\/prod\\/api DB_PASS=s3cr3t",`Success! Data written to: secret/prod/api`,"ok"],
["^vault kv get secret\\/prod\\/api",`DB_PASS  s3cr3t`,"ok"]
],
[{re:/^vault kv put/,l:"записать"},
 {re:"^vault kv get",l:"прочитать"}],{file:"project/kv-.yaml",files:{"project/kv-.yaml":`# Vault: KV: положить и прочитать секрет\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kv-.yaml":`# Vault: KV: положить и прочитать секрет — fixed\nstatus: ok\n`}},{hints:["Симптом: KV: положить и прочитать секрет в project/kv-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kv-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kv-.yaml.","Порядок: записать → прочитать"]});

S("Vault","v2","Policy: 403 на путь","Middle",
`<h3>Контекст</h3><p>Vault: <b>Policy: 403 на путь</b>. Работа с <code>project/policy-403-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Policy: 403 на путь</b>. Файл <code>project/policy-403-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить/исправить policy</li><li>[ ] проверить доступ</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/policy-403-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/policy-403-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>vault read secret\\\\/data\\\\/pro</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить/исправить policy → проверить доступ.</p><h3>Проверка</h3><pre>cat project/policy-403-.yaml<br>проверить код</pre>`,
"dev@vault:~$",
[
["^vault read secret\\/data\\/prod\\/api",`Error: permission denied`,"err"],
["^(vault policy read api-ro|vault policy write api-ro)",`path "secret/data/prod/*" { capabilities = ["read"] }`,"ok"],
["^vault read secret\\/data\\/prod\\/api",`data: {DB_PASS: ...}`,"ok"]
],
[{re:/vault policy (read|write)/,l:"проверить/исправить policy"},
 {re:"^vault read",l:"проверить доступ"}],{file:"project/policy-403-.yaml",files:{"project/policy-403-.yaml":`# Vault: Policy: 403 на путь\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/policy-403-.yaml":`# Vault: Policy: 403 на путь — fixed\nstatus: ok\n`}},{hints:["Симптом: Policy: 403 на путь в project/policy-403-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/policy-403-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/policy-403-.yaml.","Порядок: проверить/исправить policy → проверить доступ"]});

S("Vault","v3","Kubernetes auth: роль не привязана к SA","Senior",
`<h3>Контекст</h3><p>Vault: <b>Kubernetes auth: роль не привязана к SA</b>. Работа с <code>project/kubernetes-auth.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kubernetes auth: роль не привязана к SA</b>. Файл <code>project/kubernetes-auth.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить/исправить роль</li><li>[ ] проверить логин</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kubernetes-auth.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kubernetes-auth.yaml</code>. Активный файл открыт в редакторе. Начните с <code>vault write auth\\\\/kubernetes\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить/исправить роль → проверить логин.</p><h3>Проверка</h3><pre>cat project/kubernetes-auth.yaml<br>проверить код</pre>`,
"dev@vault:~$",
[
["^vault write auth\\/kubernetes\\/login role=api-ro jwt=@token",`permission denied`,"err"],
["^vault read auth\\/kubernetes\\/role\\/api-ro",`bound_service_account_names: default  <-- а приложение на SA api`,"err"],
["^vault write auth\\/kubernetes\\/role\\/api-ro bound_service_account_names=api",`Success`,"ok"]
],
[{re:/^vault (read|write) auth\/kubernetes\/role/,l:"проверить/исправить роль"},
 {re:"^vault write auth\\/kubernetes\\/login",l:"проверить логин"}],{file:"project/kubernetes-auth.yaml",files:{"project/kubernetes-auth.yaml":`# Vault: Kubernetes auth: роль не привязана к SA\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kubernetes-auth.yaml":`# Vault: Kubernetes auth: роль не привязана к SA — fixed\nstatus: ok\n`}},{hints:["Симптом: Kubernetes auth: роль не привязана к SA в project/kubernetes-auth.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kubernetes-auth.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kubernetes-auth.yaml.","Порядок: проверить/исправить роль → проверить логин"]});

S("Kyverno","ky1","Audit → Enforce: сколько нарушителей","Middle",
`<h3>Контекст</h3><p>Kyverno: <b>Audit → Enforce: сколько нарушителей</b>. Работа с <code>project/audit-enforce-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Audit → Enforce: сколько нарушителей</b>. Файл <code>project/audit-enforce-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть нарушения в Audit</li><li>[ ] включить Enforce</li><li>[ ] проверить блокировку</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/audit-enforce-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/audit-enforce-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get clusterpolicy requ</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть нарушения в Audit → включить Enforce → проверить блокировку.</p><h3>Проверка</h3><pre>cat project/audit-enforce-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl get clusterpolicy require-labels",`validationFailureAction: Audit`,"dim"],
["^kubectl get policyreports -A",`failures: 14 (поды без label team)`,"warn"],
["^kubectl patch clusterpolicy require-labels -p .*Enforce",`policy patched`,"ok"],
["^kubectl run bad --image=nginx",`Error: forbidden: require label team`,"ok"]
],
[{re:/policyreports/,l:"посмотреть нарушения в Audit"},
 {re:"patch clusterpolicy",l:"включить Enforce"},
 {re:"^kubectl run bad",l:"проверить блокировку"}],{file:"project/audit-enforce-.yaml",files:{"project/audit-enforce-.yaml":`# Kyverno: Audit → Enforce: сколько нарушителей\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/audit-enforce-.yaml":`# Kyverno: Audit → Enforce: сколько нарушителей — fixed\nstatus: ok\n`}},{hints:["Симптом: Audit → Enforce: сколько нарушителей в project/audit-enforce-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/audit-enforce-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/audit-enforce-.yaml.","Порядок: посмотреть нарушения в Audit → включить Enforce → проверить блокировку"]});

S("Kyverno","ky2","Политика не срабатывает на Deployment","Senior",
`<h3>Контекст</h3><p>Kyverno: <b>Политика не срабатывает на Deployment</b>. Работа с <code>project/-deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Политика не срабатывает на Deployment</b>. Файл <code>project/-deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] включить autogen-аннотацию</li><li>[ ] dry-run проверка</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-deployment.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get clusterpolicy vali</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: включить autogen-аннотацию → dry-run проверка.</p><h3>Проверка</h3><pre>cat project/-deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl get clusterpolicy validate-image -o yaml \\| grep autogen",`autogen отсутствует`,"err"],
["^kubectl annotate clusterpolicy validate-image pod-policies.kyverno.io\\/autogen-controllers=-",`аннотация выставлена (autogen включён)`,"ok"],
["^kubectl apply --dry-run=server -f deploy-latest\\.yaml",`Error: forbidden: validate-image`,"ok"]
],
[{re:/autogen/,l:"включить autogen-аннотацию"},
 {re:"--dry-run=server",l:"dry-run проверка"}],{file:"project/-deployment.yaml",files:{"project/-deployment.yaml":`# Kyverno: Политика не срабатывает на Deployment\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-deployment.yaml":`# Kyverno: Политика не срабатывает на Deployment — fixed\nstatus: ok\n`}},{hints:["Симптом: Политика не срабатывает на Deployment в project/-deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-deployment.yaml.","Порядок: включить autogen-аннотацию → dry-run проверка"]});

S("External Secrets","es1","Secret не синхронизируется","Middle",
`<h3>Контекст</h3><p>External Secrets: <b>Secret не синхронизируется</b>. Работа с <code>project/secret-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Secret не синхронизируется</b>. Файл <code>project/secret-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть ошибку синка</li><li>[ ] форсировать синк</li><li>[ ] проверить статус</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/secret-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/secret-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe externalsecre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть ошибку синка → форсировать синк → проверить статус.</p><h3>Проверка</h3><pre>cat project/secret-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl describe externalsecret api -n prod \\| tail -6",`Warning: could not get secret: 403 (vault policy)`,"err"],
["^kubectl annotate externalsecret api force-sync=\\$\\((date +%s)\\) --overwrite",`forced re-sync`,"ok"],
["^kubectl get externalsecret api",`SecretSynced True`,"ok"]
],
[{re:/^kubectl describe externalsecret/,l:"увидеть ошибку синка"},
 {re:"force-sync",l:"форсировать синк"},
 {re:"^kubectl get externalsecret",l:"проверить статус"}],{file:"project/secret-.yaml",files:{"project/secret-.yaml":`# External Secrets: Secret не синхронизируется\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/secret-.yaml":`# External Secrets: Secret не синхронизируется — fixed\nstatus: ok\n`}},{hints:["Симптом: Secret не синхронизируется в project/secret-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/secret-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/secret-.yaml.","Порядок: увидеть ошибку синка → форсировать синк → проверить статус"]});

S("cert-manager","cm1","Challenge failed: DNS не обновился","Senior",
`<h3>Контекст</h3><p>cert-manager: <b>Challenge failed: DNS не обновился</b>. Работа с <code>project/challenge-faile.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Challenge failed: DNS не обновился</b>. Файл <code>project/challenge-faile.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика challenge</li><li>[ ] проверить TXT</li><li>[ ] пересоздать challenge</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/challenge-faile.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/challenge-faile.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe certificate a</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика challenge → проверить TXT → пересоздать challenge.</p><h3>Проверка</h3><pre>cat project/challenge-faile.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl describe certificate api -n prod \\| tail -5",`Ready: False, Issuing: challenge failed`,"err"],
["^kubectl describe challenge -n prod",`DNS problem: NXDOMAIN looking up _acme-challenge`,"err"],
["^dig _acme-challenge\\.api\\.company\\.io TXT \\+short",`(пусто) — TXT не создан`,"err"],
["^(kubectl delete challenge|kubectl -n cert-manager restart deploy cert-manager)",`challenge пересоздан`,"ok"],
["^kubectl get certificate -n prod",`Ready: True`,"ok"]
],
[{re:/^kubectl describe (certificate|challenge)/,l:"диагностика challenge"},
 {re:"^dig _acme-challenge",l:"проверить TXT"},
 {re:"(delete challenge|restart deploy cert-manager)",l:"пересоздать challenge"}],{file:"project/challenge-faile.yaml",files:{"project/challenge-faile.yaml":`# cert-manager: Challenge failed: DNS не обновился\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/challenge-faile.yaml":`# cert-manager: Challenge failed: DNS не обновился — fixed\nstatus: ok\n`}},{hints:["Симптом: Challenge failed: DNS не обновился в project/challenge-faile.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/challenge-faile.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/challenge-faile.yaml.","Порядок: диагностика challenge → проверить TXT → пересоздать challenge"]});

S("Falco","fa1","Детект шелла в контейнере","Middle",
`<h3>Контекст</h3><p>Falco: <b>Детект шелла в контейнере</b>. Работа с <code>project/-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Детект шелла в контейнере</b>. Файл <code>project/-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] спровоцировать событие</li><li>[ ] увидеть алерт в логах Falco</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl run falco-test --image</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: спровоцировать событие → увидеть алерт в логах Falco.</p><h3>Проверка</h3><pre>cat project/-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl run falco-test --image=busybox -- sh -c .*",`pod created`,"dim"],
["^kubectl -n falco logs ds/falco \\| grep -i shell",`WARNING Shell spawned in container (pod=falco-test)`,"ok"]
],
[{re:/^kubectl run falco-test/,l:"спровоцировать событие"},
 {re:"logs ds\\/falco",l:"увидеть алерт в логах Falco"}],{file:"project/-.yaml",files:{"project/-.yaml":`# Falco: Детект шелла в контейнере\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-.yaml":`# Falco: Детект шелла в контейнере — fixed\nstatus: ok\n`}},{hints:["Симптом: Детект шелла в контейнере в project/-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-.yaml.","Порядок: спровоцировать событие → увидеть алерт в логах Falco"]});
