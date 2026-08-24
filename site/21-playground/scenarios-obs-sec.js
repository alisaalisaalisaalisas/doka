/* Песочница: Prometheus, Loki, Alertmanager, Thanos, Vault, Kyverno, ESO, cert-manager, Falco */
S("Prometheus","p1","PromQL: error rate за 5 минут","Middle",
`<b>Задача:</b> написать запрос доли 5xx.`,
"dev@grafana:~$",
[
["^sum\\(rate\\(http_requests_total\\{code=~\"5\\.\\.\"\\}\\[5m\\]\\)\\).*",`{job="api"}  0.023   <-- 2.3% ошибок`,"warn"]
],
[{re:/rate\(http_requests_total/,l:"запрос error rate"}]);

S("Prometheus","p2","PromQL: p99 латентность из гистограммы","Senior",
`<b>Задача:</b> p99 по histogram_bucket.`,
"dev@grafana:~$",
[
["^histogram_quantile\\(0\\.99",`{le="+Inf"} 0.842   <-- p99 = 842ms`,"ok"]
],
[{re:/histogram_quantile/,l:"histogram_quantile(0.99, ...)"}]);

S("Prometheus","p3","Target DOWN — почему не скрейпится","Middle",
`<b>Симптом:</b> target api в состоянии DOWN.`,
"dev@lab:~$",
[
["^curl -s localhost:9090\\/api\\/v1\\/targets \\| jq .*health",`"health":"down","lastError":"connection refused"`,"err"],
["^curl -s api:8080\\/metrics \\| head -1",`(connection refused) — /metrics не слушается`,"err"],
["^(kubectl patch deploy api|sed -i prometheus\\.yml)",`порт/аннотация prometheus.io/scrape исправлены`,"ok"],
["^curl -s localhost:9090\\/api\\/v1\\/targets \\| jq .*health",`"health":"up"`,"ok"]
],
[{re:/api\/v1\/targets/,l:"посмотреть lastError таргета"},
 {re:"(patch|sed|scrape)",l:"исправить scrape-конфиг"},
 {re:"api\\/v1\\/targets",l:"проверить, что UP"}]);

S("Prometheus","p4","Правило алерта не загружено","Middle",
`<b>Симптом:</b> алерт не появляется в /alerts.`,
"dev@lab:~$",
[
["^curl -s localhost:9090\\/api\\/v1\\/rules \\| jq .*health",`правило отсутствует в списке`,"err"],
["^kubectl get prometheusrule demo -o yaml \\| grep labels",`labels: (нет release: kps!)`,"err"],
["^kubectl label prometheusrule demo release=kps",`labeled`,"ok"],
["^curl -s localhost:9090\\/api\\/v1\\/rules \\| jq .*name",`PodInfoHighErrorRate`,"ok"]
],
[{re:/api\/v1\/rules/,l:"проверить, загружено ли правило"},
 {re:"kubectl (label|get prometheusrule)",l:"поправить label selector"}]);

S("Alertmanager","am1","Silence на время работ","Middle",
`<b>Задача:</b> заглушить алерт CertificateExpiring на 4 часа.`,
"dev@lab:~$",
[
["^amtool silence add alertname=CertificateExpiring --duration=4h",`silence id: 8f7a...`,"ok"],
["^amtool silence query",`8f7a... CertificateExpiring expires in 4h`,"ok"]
],
[{re:/^amtool silence add/,l:"создать silence"},
 {re:"^amtool silence query",l:"проверить"}]);

S("Alertmanager","am2","Инхибиция: NodeDown глушит дочерние","Senior",
`<b>Задача:</b> проверить, что inhibit_rules работает.`,
"dev@lab:~$",
[
["^amtool config routes test.*severity=warning.*node=worker-2",`Route: matched inhibit source NodeDown → suppressed`,"ok"]
],
[{re:/^amtool (config|silence)/,l:"протестировать маршрутизацию/инхибицию"}]);

S("Loki","lo1","LogQL: ошибки приложения за 15 минут","Middle",
`<b>Задача:</b> найти error-строки сервиса api.`,
"dev@grafana:~$",
[
["^\\{app=\"api\"\\} \\|= \"error\"",`14:01:02 api-xxx connection refused db:5432\n14:01:05 api-xxx retry 1/5`,"warn"]
],
[{re:/\{app="api"\}/,l:"LogQL-селектор по app"}]);

S("Loki","lo2","Кардинальность: user_id в лейблах","Senior",
`<b>Симптом:</b> Loki ест память, streams растут.`,
"dev@lab:~$",
[
["^curl -s localhost:3100\\/metrics \\| grep loki_distributor_streams",`streams: 1_240_000`,"err"],
["^(sed -i alloy\\.alloy|kubectl -n monitoring edit configmap alloy)",`user_id убран из labels (только парсинг в строке)`,"ok"],
["^curl -s localhost:3100\\/metrics \\| grep loki_distributor_streams",`streams: 12_400`,"ok"]
],
[{re:/streams/i,l:"посмотреть число streams"},
 {re:"(sed|edit configmap)",l:"убрать high-cardinality label"}]);

S("Thanos","th1","Дубли серий после HA","Senior",
`<b>Симптом:</b> на графиках две линии.`,
"dev@lab:~$",
[
["^curl -s thanos-query:9090\\/api\\/v1\\/series\\?match\\[\\]=up \\| jq .*replica",`replica: 0 и replica: 1 — дубли!`,"err"],
["^(helm upgrade.*replicaLabels|kubectl edit deploy thanos-query)",`replicaLabels: [prometheus_replica]`,"ok"],
["^curl -s thanos-query:9090\\/api\\/v1\\/series\\?match\\[\\]=up \\| jq .*replica",`replica отсутствует (дедуп сработал)`,"ok"]
],
[{re:/api\/v1\/series/,l:"увидеть дубли"},
 {re:"replicaLabels|edit deploy",l:"включить дедупликацию"}]);

S("VictoriaMetrics","vm1","Кардинальность метрик","Senior",
`<b>Задача:</b> найти топ label'ов по числу серий.`,
"dev@lab:~$",
[
["^curl -s vmsingle:8428\\/api\\/v1\\/status\\/tsdb \\| jq .*seriesCountByLabelName\\[:3\\]",`pod_name 480k; user_id 310k; trace_id 90k`,"warn"],
["^(relabel|sed -i vmagent)",`drop-правила для user_id/trace_id добавлены`,"ok"]
],
[{re:/status\/tsdb/,l:"топ кардинальных лейблов"},
 {re:"(relabel|drop)",l:"добавить drop-правила"}]);

S("Vault","v1","KV: положить и прочитать секрет","Junior",
`<b>Задача:</b> записать и прочитать секрет в KV v2.`,
"dev@vault:~$",
[
["^vault kv put secret\\/prod\\/api DB_PASS=s3cr3t",`Success! Data written to: secret/prod/api`,"ok"],
["^vault kv get secret\\/prod\\/api",`DB_PASS  s3cr3t`,"ok"]
],
[{re:/^vault kv put/,l:"записать"},
 {re:"^vault kv get",l:"прочитать"}]);

S("Vault","v2","Policy: 403 на путь","Middle",
`<b>Симптом:</b> приложение получает permission denied.`,
"dev@vault:~$",
[
["^vault read secret\\/data\\/prod\\/api",`Error: permission denied`,"err"],
["^(vault policy read api-ro|vault policy write api-ro)",`path "secret/data/prod/*" { capabilities = ["read"] }`,"ok"],
["^vault read secret\\/data\\/prod\\/api",`data: {DB_PASS: ...}`,"ok"]
],
[{re:/vault policy (read|write)/,l:"проверить/исправить policy"},
 {re:"^vault read",l:"проверить доступ"}]);

S("Vault","v3","Kubernetes auth: роль не привязана к SA","Senior",
`<b>Симптом:</b> ESO не логинится в Vault.`,
"dev@vault:~$",
[
["^vault write auth\\/kubernetes\\/login role=api-ro jwt=@token",`permission denied`,"err"],
["^vault read auth\\/kubernetes\\/role\\/api-ro",`bound_service_account_names: default  <-- а приложение на SA api`,"err"],
["^vault write auth\\/kubernetes\\/role\\/api-ro bound_service_account_names=api",`Success`,"ok"]
],
[{re:/^vault (read|write) auth\/kubernetes\/role/,l:"проверить/исправить роль"},
 {re:"^vault write auth\\/kubernetes\\/login",l:"проверить логин"}]);

S("Kyverno","ky1","Audit → Enforce: сколько нарушителей","Middle",
`<b>Задача:</b> включить политику в Audit и посмотреть нарушителей.`,
"dev@lab:~$",
[
["^kubectl get clusterpolicy require-labels",`validationFailureAction: Audit`,"dim"],
["^kubectl get policyreports -A",`failures: 14 (поды без label team)`,"warn"],
["^kubectl patch clusterpolicy require-labels -p .*Enforce",`policy patched`,"ok"],
["^kubectl run bad --image=nginx",`Error: forbidden: require label team`,"ok"]
],
[{re:/policyreports/,l:"посмотреть нарушения в Audit"},
 {re:"patch clusterpolicy",l:"включить Enforce"},
 {re:"^kubectl run bad",l:"проверить блокировку"}]);

S("Kyverno","ky2","Политика не срабатывает на Deployment","Senior",
`<b>Симптом:</b> политика на Pod, но Deployment проходит с latest.`,
"dev@lab:~$",
[
["^kubectl get clusterpolicy validate-image -o yaml \\| grep autogen",`autogen отсутствует`,"err"],
["^kubectl annotate clusterpolicy validate-image pod-policies.kyverno.io\\/autogen-controllers=-",`аннотация выставлена (autogen включён)`,"ok"],
["^kubectl apply --dry-run=server -f deploy-latest\\.yaml",`Error: forbidden: validate-image`,"ok"]
],
[{re:/autogen/,l:"включить autogen-аннотацию"},
 {re:"--dry-run=server",l:"dry-run проверка"}]);

S("External Secrets","es1","Secret не синхронизируется","Middle",
`<b>Симптом:</b> ExternalSecret в статусе SecretSynced=False.`,
"dev@lab:~$",
[
["^kubectl describe externalsecret api -n prod \\| tail -6",`Warning: could not get secret: 403 (vault policy)`,"err"],
["^kubectl annotate externalsecret api force-sync=\\$\\((date +%s)\\) --overwrite",`forced re-sync`,"ok"],
["^kubectl get externalsecret api",`SecretSynced True`,"ok"]
],
[{re:/^kubectl describe externalsecret/,l:"увидеть ошибку синка"},
 {re:"force-sync",l:"форсировать синк"},
 {re:"^kubectl get externalsecret",l:"проверить статус"}]);

S("cert-manager","cm1","Challenge failed: DNS не обновился","Senior",
`<b>Симптом:</b> Certificate Ready=False.`,
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
 {re:"(delete challenge|restart deploy cert-manager)",l:"пересоздать challenge"}]);

S("Falco","fa1","Детект шелла в контейнере","Middle",
`<b>Задача:</b> проверить, что Falco ловит запуск shell.`,
"dev@lab:~$",
[
["^kubectl run falco-test --image=busybox -- sh -c .*",`pod created`,"dim"],
["^kubectl -n falco logs ds/falco \\| grep -i shell",`WARNING Shell spawned in container (pod=falco-test)`,"ok"]
],
[{re:/^kubectl run falco-test/,l:"спровоцировать событие"},
 {re:"logs ds\\/falco",l:"увидеть алерт в логах Falco"}]);
