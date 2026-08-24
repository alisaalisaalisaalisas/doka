/* Песочница: базовые сценарии (оригинальная пятёрка) */
S("Базовые","crashloop","K8s: CrashLoopBackOff → починить деплой","Middle",
`<b>Симптом:</b> после деплоя все поды <code>api</code> в статусе «Crash…». Пользователи видят 503.<br>
<b>Цель:</b> найти причину через логи предыдущей инкарнации, починить, убедиться в rolling update.<br>
<b>Начните с:</b> <code>kubectl get pods -n shop</code>. Манифест: <span class="file" data-file="deploy.yaml">deploy.yaml</span>`,
"ubuntu@lab:~$",
[
[/^kubectl get pods( -n shop)?$/,`NAME                    READY   STATUS             RESTARTS   AGE\napi-7d4f9b6c5-k2x9p     0/1     CrashLoopBackOff   4          3m\napi-7d4f9b6c5-vb7qt     0/1     CrashLoopBackOff   4          3m`,"err"],
[/^kubectl describe pod .*-n shop$/,`Events:\n  Warning  BackOff  2m (x12)  kubelet  Back-off restarting failed container`,"warn"],
[/^kubectl logs .*--previous/,`[FATAL] config: environment variable REQUIRED_DB_URL is not set\nexit status 1`,"err"],
[/^kubectl logs/,`[FATAL] config: environment variable REQUIRED_DB_URL is not set`,"err"],
[/^kubectl set env deploy\/api REQUIRED_DB_URL=.*/,`deployment.apps/api env updated`,"ok"],
[/^kubectl rollout status deploy\/api( -n shop)?/,`Successfully rolled out`,"ok"],
[/^kubectl get pods/,`api-66b7d8c9f4-p1l2m  1/1  Running  0  40s`,"ok"]
],
[{re:/kubectl get pods/,l:"посмотреть статус подов"},
 {re:/kubectl logs .*--previous/,l:"логи предыдущей инкарнации"},
 {re:/kubectl set env deploy\/api REQUIRED_DB_URL=/,l:"задать переменную"},
 {re:/kubectl rollout status/,l:"дождаться rollout"}],
{file:"deploy.yaml",
 files:{"deploy.yaml":`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: shop
spec:
  replicas: 2
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: web
          image: registry.corp/api:2.4.0
          env:
            - name: REQUIRED_DB_URL     # <-- значение не задано!
          ports:
            - containerPort: 8080`}});

S("Базовые","jq-audit","jq: аудит подов из pods.json","Junior→Middle",
`<b>Дано:</b> файл <span class="file" data-file="pods.json">pods.json</span>.<br>
<b>Цель:</b> посчитать поды по фазам (group_by), отфильтровать не-Running (select).<br>
<b>В редакторе:</b> jq-запрос, считающий поды в фазе <code>Failed</code> → «Проверить код».`,
"ubuntu@lab:~$",
[
[/^cat pods\.json$/,`(6 подов: 3 Running, 1 Pending, 2 Failed — см. редактор)`,"dim"],
[/^jq -r '\.items\[\]\.metadata\.name' pods\.json$/,`api-1\napi-2\nworker-1\nworker-2\ncache-1\netl-9`],
[/^jq .*group_by/,`2\tFailed\n1\tPending\n3\tRunning`,"ok"],
[/^jq .*select/,`worker-2 (Failed), etl-9 (Failed)`,"ok"]
],
[{re:/^jq/,l:"выполнить jq-запрос"},
 {re:/^jq .*group_by/,l:"group_by по фазам"},
 {re:/^jq .*select/,l:"select не-Running"}],
{file:"query.jq",
 start:`# jq-запрос: количество подов в фазе Failed`,
 checks:[{re:/Failed/,l:"фильтрует Failed"},{re:/(length|map|select)/,l:"использует select/length"}],
 files:{"pods.json":`{
  "items": [
    {"metadata":{"name":"api-1","namespace":"prod"},"status":{"phase":"Running"}},
    {"metadata":{"name":"api-2","namespace":"prod"},"status":{"phase":"Running"}},
    {"metadata":{"name":"worker-1","namespace":"batch"},"status":{"phase":"Pending"}},
    {"metadata":{"name":"worker-2","namespace":"batch"},"status":{"phase":"Failed"}},
    {"metadata":{"name":"cache-1","namespace":"prod"},"status":{"phase":"Running"}},
    {"metadata":{"name":"etl-9","namespace":"batch"},"status":{"phase":"Failed"}}
  ]
}`}});

S("Базовые","pg-conflict","PostgreSQL: конфликт реплики с recovery","Middle",
`<b>Симптом:</b> запросы на реплике падают: <code>canceling statement due to conflict with recovery</code>.<br>
<b>Цель:</b> подтвердить конфликт, включить hot_standby_feedback, убедиться, что реплика догнала primary.<br>
<b>Начните с:</b> <code>psql -c "SELECT * FROM pg_stat_database_conflicts"</code>`,
"postgres@replica:~$",
[
[/^psql -c "SELECT \* FROM pg_stat_database_conflicts"/,`datname | confl_deadlock | confl_lock | confl_snapshot\nshop    | 0              | 0          | 37   <-- конфликты снапшота`,"err"],
[/^psql -c "SHOW hot_standby_feedback"/,`off`,"warn"],
[/^psql -c "ALTER SYSTEM SET hot_standby_feedback = on"/,`ALTER SYSTEM`,"ok"],
[/^psql -c "SELECT pg_reload_conf\(\)"/,`t`,"ok"],
[/^psql -c "SELECT pg_last_wal_replay_lag\(\)"/,`00:00:00`,"ok"],
[/^psql -c "SELECT \* FROM pg_stat_database_conflicts"/,`confl_snapshot: 37 (счётчик не растёт после фикса)`,"ok"]
],
[{re:/pg_stat_database_conflicts/,l:"подтвердить конфликты"},
 {re:/hot_standby_feedback/,l:"включить hot_standby_feedback"},
 {re:/pg_last_wal_replay_lag/,l:"проверить лаг реплики"}],
{file:"fix.sql",
 start:`-- ALTER SYSTEM SET hot_standby_feedback = on;\n-- SELECT pg_reload_conf();`,
 checks:[{re:/hot_standby_feedback/i,l:"hot_standby_feedback"},{re:/pg_reload_conf/i,l:"pg_reload_conf"}]});

S("Базовые","registry-push","Docker: build → login → push","Junior",
`<b>Цель:</b> собрать образ, залогиниться в приватный registry, запушить, проверить каталог.<br>
<b>Registry:</b> <code>localhost:5000</code> уже запущен.<br>
<b>Начните с:</b> <code>docker build -t demo:good .</code>`,
"ubuntu@lab:~$",
[
[/^docker build -t demo:good \.$/,`[+] Building 12.4s FINISHED\n=> naming to docker.io/library/demo:good`,"ok"],
[/^docker tag demo:good localhost:5000\/demo:1\.0\.0$/,"", "dim"],
[/^docker login localhost:5000$/,`Username: robot$shop+ci\nPassword:\nLogin Succeeded`,"ok"],
[/^docker push localhost:5000\/demo:1\.0\.0$/,`a1b2c3: Pushed\n1.0.0: digest: sha256:9f2e...`,"ok"],
[/^curl -s localhost:5000\/v2\/_catalog$/,`{"repositories":["demo"]}`,"ok"],
[/^docker run -d -p 8080:8080 demo:good/,`7f3a9c1e`,"ok"],
[/^curl localhost:8080\/healthz$/,`OK uptime=3s version=1.0.0`,"ok"]
],
[{re:/^docker build/,l:"собрать"},
 {re:/^docker login localhost:5000/,l:"залогиниться"},
 {re:/^docker push/,l:"запушить"},
 {re:/^(curl -s localhost:5000|docker run)/,l:"проверить результат"}],
{file:"Dockerfile",
 files:{"Dockerfile":`FROM golang:1.23-alpine AS b
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /srv ./src
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=b /srv /server
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]`}});

S("Базовые","tf-drift","Terraform: обнаружить и устранить дрейф","Middle",
`<b>Ситуация:</b> кто-то вручную отредактировал <code>inventory.txt</code>, которым управляет Terraform.<br>
<b>Цель:</b> план покажет дрейф → apply устранит → стейт чист.<br>
<b>Начните с:</b> <code>terraform plan</code>`,
"ubuntu@lab:~$",
[
[/^terraform plan/,`~ local_file.inventory content: "# manual" -> "server: web"\nPlan: 0 to add, 1 to change`,"warn"],
[/^terraform apply/,`Apply complete! 0 added, 1 changed`,"ok"],
[/^terraform state list/,`random_pet.server_name\nlocal_file.inventory`,"ok"],
[/^cat generated\/inventory\.txt/,`server: web`,"ok"]
],
[{re:/^terraform plan/,l:"обнаружить дрейф"},
 {re:/^terraform apply/,l:"устранить"},
 {re:/^terraform state list/,l:"проверить стейт"}],
{file:"main.tf",
 files:{"main.tf":`resource "random_pet" "server_name" {
  prefix = "web"
}
resource "local_file" "inventory" {
  filename = "\${path.module}/generated/inventory.txt"
  content  = "server: \${random_pet.server_name.id}\\n"
}`}});
