/* Песочница: базовые сценарии (оригинальная пятёрка) */
S("Базовые","crashloop","K8s: CrashLoopBackOff → починить деплой","Middle",
`<h3>Контекст</h3><p><b>Базовые.</b> K8s: CrashLoopBackOff → починить деплой. Среда сценария симулирует Базовые-окружение; основные инструменты терминала здесь: <code>kubectl</code>.</p><h3>Что происходит</h3><p>после деплоя все поды api в статусе «Crash…». Пользователи видят 503.\nЦель: найти причину через логи предыдущей инкарнации, починить, убедиться в rolling update.\nНачните с: kubectl get pods -n shop. Манифест: deploy.yaml</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть статус подов</li><li>[ ] логи предыдущей инкарнации</li><li>[ ] задать переменную</li><li>[ ] дождаться rollout</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта этого сценария (активный: <code>deploy.yaml</code>); тесты и несвязанные ресурсы не трогайте.</p><h3>Стартовое состояние</h3><p>Файлы проекта: <code>deploy.yaml</code>. Активный файл: <code>deploy.yaml</code>. Редактор уже открыт на активном файле.</p><h3>Ожидаемый результат</h3><p>Чек-лист «Проверить решение» полностью зелёный: посмотреть статус подов → логи предыдущей инкарнации → задать переменную → дождаться rollout.</p><h3>Проверка</h3><pre>kubectl get pods( -n shop)?<br>kubectl describe pod …-n shop<br>kubectl logs …--previous</pre><p>для кода: кнопка «Проверить код»</p>`,
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
{file:"deploy.yaml",files:{"deploy.yaml":`apiVersion: apps/v1
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
            - containerPort: 8080`},checks:[{re:/REQUIRED_DB_URL[\s\S]{0,200}value:\s*\S+/,l:"REQUIRED_DB_URL задан"}],solutionFiles:{"deploy.yaml":`apiVersion: apps/v1
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
            - name: REQUIRED_DB_URL
              value: postgres://api:secret@pg.prod.svc:5432/shop
          ports:
            - containerPort: 8080
`}},{hints:["Симптом: после деплоя все поды api в статусе «Crash…».. Определите, на каком слое Базовые возникает проблема, прежде чем что-то менять.","Правьте файлы в редакторе; проверка кода — кнопкой «Проверить код». Рабочие инструменты сценария: <code>kubectl</code>. Диагноз начинайте с <code>kubectl get pods( -n shop)?</code>.","Порядок действий: посмотреть статус подов → логи предыдущей инкарнации → задать переменную → …"]});

S("Базовые","jq-audit","jq: аудит подов из pods.json","Junior→Middle",
`<h3>Контекст</h3><p><b>Базовые.</b> jq: аудит подов из pods.json. Среда сценария симулирует Базовые-окружение; основные инструменты терминала здесь: <code>cat</code>, <code>jq</code>.</p><h3>Что происходит</h3><p>Дано: файл pods.json.\nЦель: посчитать поды по фазам (group_by), отфильтровать не-Running (select).\nВ редакторе: jq-запрос, считающий поды в фазе Failed → «Проверить код».</p><h3>Что нужно сделать</h3><ul><li>[ ] выполнить jq-запрос</li><li>[ ] group_by по фазам</li><li>[ ] select не-Running</li><li>[ ] фильтрует Failed</li><li>[ ] использует select/length</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта этого сценария (активный: <code>query.jq</code>); тесты и несвязанные ресурсы не трогайте.</p><h3>Стартовое состояние</h3><p>Файлы проекта: <code>query.jq</code>, <code>pods.json</code>, <code>items</code>, <code>metadata</code>, <code>name</code>, <code>namespace</code>. Активный файл: <code>query.jq</code>. Редактор уже открыт на активном файле.</p><h3>Ожидаемый результат</h3><p>Чек-лист «Проверить решение» полностью зелёный: выполнить jq-запрос → group_by по фазам → select не-Running → фильтрует Failed → ….</p><h3>Проверка</h3><pre>cat pods.json<br>jq -r '.items\\[\\].metadata.name' pods.json<br>jq …group_by</pre><p>для кода: кнопка «Проверить код»</p>`,
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
}`},solutionFiles:{"query.jq":`# jq-запрос: количество подов в фазе Failed
[ .items[] | select(.status.phase=="Failed") ] | length
# также: group_by(.status.phase) для аудита
`}},{hints:["Симптом: Дано: файл pods.json.\\nЦель: посчитать поды по фазам (group_by), отфильтровать не-Running (select).\\nВ редакторе: jq-запрос, считающий поды в фазе Failed → «Прове. Определите, на каком слое Базовые возникает проблема, прежде чем что-то менять.","Правьте файлы в редакторе; проверка кода — кнопкой «Проверить код». Рабочие инструменты сценария: <code>cat</code>, <code>jq</code>. Диагноз начинайте с <code>cat pods.json</code>.","Порядок действий: выполнить jq-запрос → group_by по фазам → select не-Running → …"]});

S("Базовые","pg-conflict","PostgreSQL: конфликт реплики с recovery","Middle",
`<h3>Контекст</h3><p>Базовые: <b>PostgreSQL: конфликт реплики с recovery</b>. Работа с <code>project/postgresql-reco.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PostgreSQL: конфликт реплики с recovery</b>. Файл <code>project/postgresql-reco.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] подтвердить конфликты</li><li>[ ] включить hot_standby_feedback</li><li>[ ] проверить лаг реплики</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/postgresql-reco.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/postgresql-reco.yaml</code>. Активный файл открыт в редакторе. Начните с <code>psql -c \"SELECT \\* FROM pg_sta</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: подтвердить конфликты → включить hot_standby_feedback → проверить лаг реплики.</p><h3>Проверка</h3><pre>cat project/postgresql-reco.yaml<br>проверить код</pre>`,
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
{file:"project/postgresql-reco.yaml",files:{"project/postgresql-reco.yaml":`# Базовые: PostgreSQL: конфликт реплики с recovery\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/postgresql-reco.yaml":`# Базовые: PostgreSQL: конфликт реплики с recovery — fixed\nstatus: ok\n`}},{hints:["Симптом: PostgreSQL: конфликт реплики с recovery в project/postgresql-reco.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/postgresql-reco.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/postgresql-reco.yaml.","Порядок: подтвердить конфликты → включить hot_standby_feedback → проверить лаг реплики"]});

S("Базовые","registry-push","Docker: build → login → push","Junior",
`<h3>Контекст</h3><p><b>Базовые.</b> Docker: build → login → push. Среда сценария симулирует Базовые-окружение; основные инструменты терминала здесь: <code>docker</code>, <code>curl</code>.</p><h3>Что происходит</h3><p>Цель: собрать образ, залогиниться в приватный registry, запушить, проверить каталог.\nRegistry: localhost:5000 уже запущен.\nНачните с: docker build -t demo:good .</p><h3>Что нужно сделать</h3><ul><li>[ ] собрать</li><li>[ ] залогиниться</li><li>[ ] запушить</li><li>[ ] проверить результат</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта этого сценария (активный: <code>Dockerfile</code>); тесты и несвязанные ресурсы не трогайте.</p><h3>Стартовое состояние</h3><p>Файлы проекта: <code>Dockerfile</code>. Активный файл: <code>Dockerfile</code>. Редактор уже открыт на активном файле.</p><h3>Ожидаемый результат</h3><p>Чек-лист «Проверить решение» полностью зелёный: собрать → залогиниться → запушить → проверить результат.</p><h3>Проверка</h3><pre>docker build -t demo:good .<br>docker tag demo:good localhost:5000/demo:1.0.0<br>docker login localhost:5000</pre><p>для кода: кнопка «Проверить код»</p>`,
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
{file:"Dockerfile",files:{"Dockerfile":`FROM golang:1.23-alpine AS b
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /srv ./src
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=b /srv /server
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]`},checks:[{re:/FROM\s+\S+\s+AS\s+/,l:"multi-stage сборка"},{re:/distroless/,l:"минимальный runtime-образ"}],solutionFiles:{"Dockerfile":`FROM golang:1.23-alpine AS b
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /srv ./src
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=b /srv /server
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]
`}},{hints:["Симптом: Цель: собрать образ, залогиниться в приватный registry, запушить, проверить каталог.. Определите, на каком слое Базовые возникает проблема, прежде чем что-то менять.","Правьте файлы в редакторе; проверка кода — кнопкой «Проверить код». Рабочие инструменты сценария: <code>docker</code>, <code>curl</code>. Диагноз начинайте с <code>docker build -t demo:good .</code>.","Порядок действий: собрать → залогиниться → запушить → …"]});

S("Базовые","tf-drift","Terraform: обнаружить и устранить дрейф","Middle",
`<h3>Контекст</h3><p><b>Базовые.</b> Terraform: обнаружить и устранить дрейф. Среда сценария симулирует Базовые-окружение; основные инструменты терминала здесь: <code>terraform</code>, <code>cat</code>.</p><h3>Что происходит</h3><p>Ситуация: кто-то вручную отредактировал inventory.txt, которым управляет Terraform.\nЦель: план покажет дрейф → apply устранит → стейт чист.\nНачните с: terraform plan</p><h3>Что нужно сделать</h3><ul><li>[ ] обнаружить дрейф</li><li>[ ] устранить</li><li>[ ] проверить стейт</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта этого сценария (активный: <code>main.tf</code>); тесты и несвязанные ресурсы не трогайте.</p><h3>Стартовое состояние</h3><p>Файлы проекта: <code>main.tf</code>. Активный файл: <code>main.tf</code>. Редактор уже открыт на активном файле.</p><h3>Ожидаемый результат</h3><p>Чек-лист «Проверить решение» полностью зелёный: обнаружить дрейф → устранить → проверить стейт.</p><h3>Проверка</h3><pre>terraform plan<br>terraform apply<br>terraform state list</pre><p>для кода: кнопка «Проверить код»</p>`,
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
{file:"main.tf",files:{"main.tf":`resource "random_pet" "server_name" {
  prefix = "web"
}
resource "local_file" "inventory" {
  filename = "\${path.module}/generated/inventory.txt"
  content  = "server: \${random_pet.server_name.id}\\n"
}`},checks:[{re:/random_pet\.server_name\.id/,l:"inventory генерируется из IaC"}],solutionFiles:{"main.tf":`resource "random_pet" "server_name" {
  prefix = "web"
}
resource "local_file" "inventory" {
  filename = "\${path.module}/generated/inventory.txt"
  content  = "server: \${random_pet.server_name.id}\\n"
}
`}},{hints:["Симптом: Ситуация: кто-то вручную отредактировал inventory.txt, которым управляет Terraform.. Определите, на каком слое Базовые возникает проблема, прежде чем что-то менять.","Правьте файлы в редакторе; проверка кода — кнопкой «Проверить код». Рабочие инструменты сценария: <code>terraform</code>, <code>cat</code>. Диагноз начинайте с <code>terraform plan</code>.","Порядок действий: обнаружить дрейф → устранить → проверить стейт"]});
