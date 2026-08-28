#!/usr/bin/env python3
import pathlib, re
root = pathlib.Path(r"C:/Users/User/Desktop/papka/doka/docs")

# Second generic: alert/group_wait etc
pattern2 = re.compile(
    r"## 🧨 Типовые грабли Production\s*\n\s*\| Симптом.*?\| Быстрое решение \|\s*\n\|.*?\|.*?\n\| Алерты не приходят.*?amtool.*?\|.*?\n\| Дашборд врет.*?legend format.*?\|.*?\n\| Рост кардинальности.*?relabel drop.*?\|.*?\n\| Логи «исчезают».*?hot-хранилища.*?\|",
    re.S
)

replacements2 = {
    "09-observability/01-prometheus-and-grafana.md": """## 🧨 Типовые грабли Production (Prometheus — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `PromQL: rate` 0 при нагрузке | Окно `[1m]` < `2× scrape_interval` | `rate(metric[5m])` при `scrape 15s` → 4× |
| `histogram_quantile` показывает `NaN` | `le` лейбл отсутствует / `avg` вместо гистограммы | `histogram_quantile(0.99, sum(rate(bucket[5m])) by (le))` |
| `increase` скачёт на рестарте пода | Counter сбросился, `rate` пик | Использовать `increase`/`rate` — они сглаживают, не `value - prev` |
| Кардинальность 500k, Prometheus OOM | `user_id` в `labels` | `relabel_configs: - action: drop` + `metric_relabel_configs` |
| `up==0` targets `down` после деплоя | `job` лейбл mismatch `relabel` | `curl http://target:9090/metrics`, `prometheus --log.level=debug` |""",
    "09-observability/02-logging-loki-and-tracing.md": """## 🧨 Типовые грабли Production (Loki — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `LogQL: rate({...} |= "error" [5m])` 0 | Нет `| json` парсинга перед фильтром | `{app="myapp"} | json | level="error" | rate` |
| Кардинальность `__stream` взрывается | Высокий `label` `request_id` в `stream` | `label` только `app/env`, `request_id` в `detected_fields` |
| `ingester: too many outstanding requests` | `chunk_target_size` мал / `replication_factor` 3 перегруз | `ingester.chunk_target_size: 1.5MB`, `limits_config.ingestion_rate_mb` |
| `Loki: failed to flush chunks` диск | `table_manager` retention vs `compactor` retention mismatch | `compactor.retention_enabled: true`, `limits_config.retention_period: 30d` |""",
    "09-observability/03-grafana-alloy-telemetry.md": """## 🧨 Типовые грабли Production (Alloy — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `component unhealthy: discovery.kubernetes` | `role: endpoints` без `namespaces` | `discovery.kubernetes "k8s" { role = "endpoints" }` + `namespaces: { names: ["shop"] }` |
| `prometheus.remote_write: wal corruption` | Смена `wal_directory` без очистки | `rm -rf /var/lib/alloy/wal` после смены пути, `systemctl restart alloy` |
| `otelcol.receiver.otlp: 4317 already in use` | Порт занят старым Alloy | `ss -tulpn | grep 4317`, `alloy fmt` валидация |
| `loki.source.kubernetes` не видит поды | `serviceAccountName` без `get/list/watch pods` RBAC | `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:alloy` |""",
    "09-observability/04-zabbix-enterprise-monitoring.md": """## 🧨 Типовые грабли Production (Zabbix — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `ZBX_NOTSUPPORTED: cannot obtain system data` | Агент active/passive mismatch + PSK | `zabbix_agent2 -t agent.hostname`, `ServerActive` vs `Server`, `TLSPSKIdentity` |
| `Housekeeper` 100% CPU, история 1 год | `CacheSize` мал / `HousekeepingFrequency` часто | `CacheSize=2G`, `MaxHousekeeperDelete=5000`, `TimescaleDB` partition |
| LLD создаёт 500 items на один хост | `vfs.fs.discovery` на контейнере с 50 overlay mounts | Фильтр `{#FSTYPE} not in [overlay,tmpfs]` в LLD filter |
| Trigger флапает `up/down` каждую минуту | Нет hysteresis | `recovery_expression: avg(5m)`, `nodata(5m)` |""",
    "09-observability/05-elk-opensearch-stack.md": """## 🧨 Типовые грабли Production (ELK/OpenSearch — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `unassigned shards` + `watermark exceeded` | Диск 85% → `read_only_allow_delete` | `PUT _cluster/settings {"transient":{"cluster.routing.allocation.disk.watermark.low":"75%"}}`, удалить старые `logs-*` |
| Shard 200× 1GB → heap 90% | Shard explosion: daily × 5 shards | Rollover `50gb`/`1d` + `shrink` в warm, data stream |
| `rejected execution queue capacity` | `ingestion_rate` / `thread_pool.write.queue_size` | `limits_config.ingestion_rate_mb: 8`, `queue_size: 1000` |
| `geoip` фильтр роняет Logstash | Нет `ingest-geoip` plugin | `bin/elasticsearch-plugin install ingest-geoip` или убрать `geoip` |""",
    "09-observability/06-alertmanager-and-dashboards-mastery.md": """## 🧨 Типовые грабли Production (Alertmanager — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Алерты приходят пачкой 50 штук | Нет `group_by: [alertname,cluster]` / `group_wait: 30s` | `route.group_by: [alertname,namespace]`, `amtool config routes test` |
| Алерт не ингибируется при `NodeDown` | `inhibit_rules.equal` не содержит `node` | `inhibit_rules: [{source_match:{alertname: NodeDown}, target_match:{severity: warning}, equal: [node]}]` |
| Silence не работает | `matchers` без `isRegex` | `amtool silence add alertname=HighLatency --comment=test` |
| Telegram `chat_id` неверный | Нет `bot_token` / `chat_id` в `telegram_configs` | `amtool check-config`, `curl -X POST https://api.telegram.org/bot$TOKEN/sendMessage -d chat_id=$CHAT` |""",
    "10-security-and-cloud/01-devsecops-and-secrets.md": """## 🧨 Типовые грабли Production (DevSecOps — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Trivy находит `HIGH` но pipeline зелёный | `exit-code: 0` вместо `1` | `trivy image --exit-code 1 --severity HIGH,CRITICAL` |
| `gitleaks` пропускает секрет в `feature` ветке | `pre-commit` не установлен у разработчика | `pre-commit install` + CI `gitleaks protect --staged` |
| `cosign verify` fails: no matching signatures | `keyless` без `certificate-identity-regexp` | `cosign verify --certificate-identity-regexp '.*' --certificate-oidc-issuer https://token.actions.githubusercontent.com` |
| ExternalSecret `SecretSyncedError: secret not found` | `ClusterSecretStore` `auth.kubernetes` role mismatch | `vault auth list`, `kubectl -n external-secrets get clustersecretstore -o yaml` |""",
    "10-security-and-cloud/02-cloud-and-web-servers.md": """## 🧨 Типовые грабли Production (Cloud/Web — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `502` после `nginx -s reload` | `upstream` без `max_fails`/`fail_timeout` | `upstream app { server 10.0.0.1:8080 max_fails=3 fail_timeout=30s; }` + `proxy_next_upstream error` |
| `curl: (60) SSL certificate problem` | `fullchain.pem` без intermediate | `cat cert.pem intermediate.pem > fullchain.pem`, `nginx -T | grep ssl_certificate` |
| S3 `403 AccessDenied` через IRSA | Нет `sts:AssumeRoleWithWebIdentity` trust | `aws sts get-caller-identity` из пода, `iam simulate-principal-policy` |
| DNS `NXDOMAIN` за Cloudflare | Оранжевое облако + `origin` без `tunnel` | `cloudflared tunnel info`, `dig shop.example.com @1.1.1.1` |""",
    "10-security-and-cloud/03-hashicorp-vault-deep-dive.md": """## 🧨 Типовые грабли Production (Vault — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `Error sealing: seal type shamir requires 3 shares` | Vault sealed после рестарта, нет `unseal` | `vault operator unseal` ×3, или `auto-unseal` KMS |
| `permission denied` на `kv get secret/app` | Policy без `capabilities: ["read"]` на `secret/data/app` | `vault policy read app-policy`, `vault token capabilities secret/data/app` |
| `x509: certificate has expired` на `pki/issue` | `ttl` `87600h` истёк, `max_ttl` CA | `vault read pki/cert/ca`, `vault write pki/root/rotate` |
| ESO `ExternalSecret` не синхронизируется | `ClusterSecretStore` `auth.kubernetes` role `external-secrets` нет | `vault read auth/kubernetes/config`, `kubectl -n external-secrets logs deploy/external-secrets` |""",
}

count=0
for rel, new_block in replacements2.items():
    p = root / rel
    if not p.exists():
        print(f"MISSING {rel}")
        continue
    t = p.read_text(encoding="utf-8")
    m = pattern2.search(t)
    if m:
        t2 = t[:m.start()] + new_block + t[m.end():]
        p.write_text(t2, encoding="utf-8")
        count+=1
        print(f"REPLACED2 {rel}")
    else:
        print(f"NOT FOUND2 {rel}")

print(f"Total replaced2 {count}")
