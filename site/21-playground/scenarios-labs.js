/* Песочница: интерактивные версии Guided Labs (раздел 16). Категория «Labs».
   Каждый сценарий = сжатая симуляция ключевых шагов соответствующей лабы.
   Паттерны команд — СТРОКИ (движок делает new RegExp(p,"i")). */

S("Labs","lab01","Lab 01: Linux изнутри — systemd, namespaces, cgroups","Junior",
`<b>Легенда:</b> вы исследуете изоляцию процессов руками, без Docker.<br>
<b>Цель:</b> увидеть cgroup процесса, создать PID-namespace, ограничить память.<br>
<b>Полная версия:</b> Guided Lab 01 (раздел 16).`,
"ubuntu@lab:~$",
[
["^systemctl status sshd",`● sshd.service - OpenBSD Secure Shell server\n   Active: active (running) since Mon; Main PID: 812 (sshd)\n   CGroup: /system.slice/sshd.service`,"ok"],
["^cat /proc/self/cgroup",`0::/user.slice/user-1000.slice/session-3.scope`,"dim"],
["^(unshare --pid --fork --mount-proc bash|sudo unshare --pid --fork bash)",`[new pid namespace] ps:\n  PID TTY          TIME CMD\n    1 pts/0    00:00:00 bash`,"ok"],
["^lsns -t pid",`NS TYPE NPROCS PID USER COMMAND\n4026532444 pid       1  1 root bash   ← наш namespace`,"ok"],
["^cgcreate -g memory:lab",``,"dim"],
["^echo .* > /sys/fs/cgroup/lab/memory.max",`memory.max установлен`,"ok"],
["^cat /sys/fs/cgroup/lab/memory.max",`134217728  (=128MB)`,"ok"]
],
[{re:/systemctl status/,l:"найти cgroup сервиса"},
 {re:/cat \/proc\/self\/cgroup/,l:"посмотреть свою cgroup-группу"},
 {re:/unshare .*--pid/,l:"создать PID-namespace (ps покажет PID 1)"},
 {re:/memory\.max/,l:"ограничить память cgroup до 128M и проверить"}]);

S("Labs","lab02","Lab 02: Фабрика образов — build → scan → sign → push","Middle",
`<b>Легенда:</b> конвейер производства доверенных образов.<br>
<b>Цель:</b> собрать multi-stage образ, просканировать Trivy, подписать cosign, запушить.`,
"ubuntu@lab:~$",
[
["^docker build -t shop/api:2\\.5\\.0 \\.",`[+] Building 12.3s (18/18) FINISHED\n => exporting layers\n => naming to shop/api:2.5.0`,"ok"],
["^docker images shop/api",`shop/api  2.5.0  9.4MB`,"ok"],
["^trivy image --severity CRITICAL shop/api:2\\.5\\.0",`shop/api:2.5.0 (alpine 3.20)\nTotal: 0 (CRITICAL: 0)`,"ok"],
["^(cosign generate-key-pair|COSIGN_PASSWORD=.*)",`Private key written to cosign.key\nPublic key written to cosign.pub`,"dim"],
["^cosign sign --key cosign\\.key shop/api:2\\.5\\.0",`Pushing signature to registry... tlog entry created`,"ok"],
["^docker push shop/api:2\\.5\\.0",`2.5.0: digest: sha256:9f2c... size: 1571`,"ok"],
["^cosign verify --key cosign\\.pub shop/api:2\\.5\\.0",`Verified OK  ✓ подпись подтверждена`,"ok"]
],
[{re:/docker build -t shop\/api/,l:"собрать multi-stage образ"},
 {re:/docker images/,l:"проверить размер (<20MB)"},
 {re:/trivy image/,l:"просканировать на CRITICAL"},
 {re:/cosign sign/,l:"подписать образ"},
 {re:/docker push/,l:"запушить в registry"},
 {re:/cosign verify/,l:"верифицировать подпись"}]);

S("Labs","lab03","Lab 03: Приложение в Kubernetes (kind)","Middle",
`<b>Легенда:</b> деплой web+db в локальный kind-кластер.<br>
<b>Цель:</b> кластер → секрет/конфиг → deployment+pvc → service → проверка.`,
"ubuntu@lab:~$",
[
["^kind create cluster --name lab",`Creating cluster "lab" ...\nSet kubectl context to "kind-lab"\nYou can now use your cluster`,"ok"],
["^kubectl get nodes",`NAME               STATUS   ROLES           AGE   VERSION\nlab-control-plane  Ready    control-plane   45s   v1.30.0`,"ok"],
["^kubectl create namespace app",`namespace/app created`,"ok"],
["^kubectl -n app create secret generic db-url --from-literal=DATABASE_URL=postgres://db/app",`secret/db-url created`,"ok"],
["^kubectl apply -n app -f deploy\\.yaml",`deployment.apps/web created\nservice/web created\npersistentvolumeclaim/db-data created\nstatefulset.apps/db created`,"ok"],
["^kubectl -n app get pods",`NAME     READY   STATUS    RESTARTS   AGE\ndb-0     1/1     Running   0          30s\nweb-*    1/1     Running   0          25s`,"ok"],
["^kubectl -n app port-forward svc/web 8080:80 &",`Forwarding from 127.0.0.1:8080 -> 8080`,"dim"],
["^curl -sf localhost:8080/healthz",`{"status":"ok"}`,"ok"]
],
[{re:/kind create cluster/,l:"поднять kind-кластер"},
 {re:/kubectl get nodes/,l:"убедиться, что нода Ready"},
 {re:/create secret generic db-url/,l:"создать secret с DATABASE_URL"},
 {re:/kubectl apply -n app -f deploy/,l:"применить манифесты"},
 {re:/get pods/,l:"дождаться Running у всех подов"},
 {re:/curl .*healthz/,l:"проверить приложение через port-forward"}]);

S("Labs","lab04","Lab 04: CI/CD пайплайн end-to-end (GitLab CI)","Middle",
`<b>Легенда:</b> пайплайн build→test→scan→deploy для приложения.<br>
<b>Цель:</b> довести MR от коммита до деплоя в staging.`,
"gitlab-runner@ci:~$",
[
["^git checkout -b feat/deploy",`Switched to a new branch 'feat/deploy'`,"dim"],
["^git add \\. && git commit -m \"feat: pipeline\"",`[feat/deploy 3f2a91c] feat: pipeline\n 1 file changed, 42 insertions(+)`,"dim"],
["^git push -u origin feat/deploy",`To gitlab.local/shop/api.git\n * [new branch]      feat/deploy -> feat/deploy`,"ok"],
["^glab ci status",`Pipeline #1042 running: test ✓ · scan ⋯ · deploy-staging ⋯`,"warn"],
["^glab ci status",`Pipeline #1042 passed: build ✓ test ✓ scan ✓ deploy-staging ✓`,"ok"],
["^curl -sf https://staging\\.shop\\.local/healthz",`{"status":"ok","version":"2.5.0"}`,"ok"],
["^glab mr merge !17",`Merge request !17 merged into main; triggering prod pipeline`,"ok"]
],
[{re:/git push/,l:"запушить ветку с .gitlab-ci.yml"},
 {re:/glab ci status/,l:"дождаться зелёного пайплайна"},
 {re:/curl .*staging.*healthz/,l:"проверить staging после деплоя"},
 {re:/glab mr merge/,l:"смержить MR → прод-пайплайн"}]);

S("Labs","lab05","Lab 05: Terraform с нуля (LocalStack)","Middle",
`<b>Легенда:</b> инфраструктура S3+IAM против эмулятора AWS LocalStack.<br>
<b>Цель:</b> init → plan → apply → изменить → destroy без облака.`,
"ubuntu@lab:~$",
[
["^(terraform init|tofu init)",`Terraform has been successfully initialized!\nInstalling hashicorp/aws v5.x...`,"ok"],
["^terraform plan",`Plan: 3 to add, 0 to change, 0 to destroy.\n+ aws_s3_bucket.app\n+ aws_iam_user.ci`,"warn"],
["^terraform apply -auto-approve",`aws_s3_bucket.app: Creating...\nApply complete! Resources: 3 added.`,"ok"],
["^terraform state list",`aws_iam_user.ci\naws_s3_bucket.app\naws_s3_bucket_versioning.app`,"dim"],
["^terraform plan",`Plan: 0 to add, 1 to change, 0 to destroy.`,"warn"],
["^terraform destroy -auto-approve",`Destroy complete! Resources: 3 destroyed.`,"err"]
],
[{re:/terraform init/,l:"инициализировать провайдеров"},
 {re:/terraform plan/,l:"посмотреть план изменений"},
 {re:/terraform apply/,l:"применить (apply complete!)"},
 {re:/terraform state list/,l:"увидеть, что попало в state"},
 {re:/terraform destroy/,l:"корректно уничтожить всё"}]);

S("Labs","lab06","Lab 06: Мониторинг — Prometheus/Grafana/Loki + алерт","Middle",
`<b>Легенда:</b> стек наблюдаемости и первый алерт в Telegram.<br>
<b>Цель:</b> поднять стек, собрать метрики приложения, получить алерт.`,
"ubuntu@lab:~$",
[
["^helm repo add prometheus-community .* && helm repo update",`\"prometheus-community\" has been added\nUpdate Complete.`,"ok"],
["^helm install monitoring prometheus-community/kube-prometheus-stack",`NAME: monitoring ... STATUS: deployed`,"ok"],
["^kubectl -n monitoring get pods",`prometheus-*  2/2 Running\ngrafana-*     1/1 Running\nloki-0        1/1 Running`,"ok"],
["^kubectl apply -f alert-rules\\.yaml",`prometheusrule.monitoring.coreos.com/app-slo created`,"ok"],
["^curl -s localhost:9090/api/v1/query\\?query=up",`{\"status\":\"success\",\"data\":...\"value\":[...,\"1\"]}`,"ok"],
["^amtool alert query",`ALERTS{alertname=\"HighErrorRate\",state=\"firing\"}`,"err"],
["^curl -s -X POST telegram-api/sendMessage -d chat_id=@ops",`{\"ok\":true,\"result\":{\"message_id\":42}}  ← алерт ушёл дежурному`,"ok"]
],
[{re:/helm install monitoring/,l:"установить kube-prometheus-stack"},
 {re:/get pods/,l:"дождаться Running prometheus/grafana/loki"},
 {re:/kubectl apply -f alert-rules/,l:"добавить правило алерта"},
 {re:/api\/v1\/query/,l:"проверить метрики через PromQL API"},
 {re:/amtool alert query/,l:"увидеть firing-алерт"},
 {re:/sendMessage/,l:"получить уведомление в Telegram"}]);

S("Labs","lab07","Lab 07: GitOps c ArgoCD","Advanced",
`<b>Легенда:</b> кластер сам приводит себя к состоянию из git.<br>
<b>Цель:</b> установить ArgoCD, зарегистрировать репо, поймать дрифт и авто-хил.`,
"ubuntu@lab:~$",
[
["^(kubectl apply -n argocd -f install\\.yaml|argocd install)",`namespace/argocd configured\napplication.argoproj.io/argocd created`,"ok"],
["^argocd admin initial-password",`password: XyZ9-abcd-1234`,"dim"],
["^argocd login localhost:8080",`'admin' logged in successfully`,"ok"],
["^argocd app create web --repo https://gitlab.local/shop/deploy.git --path prod --dest-server https://kubernetes.default.svc",`application 'web' created`,"ok"],
["^argocd app sync web",`Syncing items: 3/3 completed\nweb: SyncOperation completed`,"ok"],
["^kubectl scale deploy web --replicas=5",`deployment.apps/web scaled  ← внесли дрифт руками`,"warn"],
["^argocd app diff web",`===== deployments/web =====\n-replicas: 5   (+spec.replicas: 3)`,"err"],
["^sleep 180 && argocd app get web",`Status: Healthy/Synced  ← auto-sync вернул replicas=3 из git`,"ok"]
],
[{re:/install\\.yaml|argocd install/,l:"установить ArgoCD"},
 {re:/argocd login/,l:"залогиниться CLI"},
 {re:/argocd app create web/,l:"создать Application из git-репо"},
 {re:/argocd app sync web/,l:"первый sync"},
 {re:/kubectl scale deploy web/,l:"внести дрифт вручную"},
 {re:/argocd app (diff|get)/,l:"убедиться, что ArgoCD видит/чинит расхождение"}]);

S("Labs","lab08","Lab 08: Ansible-роль — идемпотентность + Molecule","Middle",
`<b>Легенда:</b> роль nginx по стандартам + тесты Molecule в docker.<br>
<b>Цель:</b> scaffold роли, прогон converge, поймать неидемпотентность, fix.`,
"ubuntu@lab:~$",
[
["^(ansible-galaxy init nginx_role|molecule init role nginx_role)",`- Role nginx_role was created successfully`,"ok"],
["^molecule create",`--> Starting molecule tests...\nCreating molecule instance 'instance-1'`,"ok"],
["^molecule converge",`TASK [nginx_role : Install nginx] ok\nTASK [nginx_role : Template config] changed\nPLAY RECAP  changed=2`,"ok"],
["^molecule idempotence",`Idempotence completed: failures=1 ✗\nTASK [Template config] changed  ← должно быть ok!`,"err"],
["^sed -i s/module: shell/module: template/ tasks/main\\.yml",`tasks/main.yml обновлён`,"ok"],
["^molecule idempotence",`Idempotence completed: failures=0 ✓`,"ok"],
["^molecule verify",`Verifying nginx serves 200... PASS`,"ok"]
],
[{re:/galaxy init|molecule init/,l:"создать каркас роли"},
 {re:/molecule converge/,l:"прогнать роль на тестовом инстансе"},
 {re:/molecule idempotence/,l:"поймать неидемпотентную задачу"},
 {re:/sed -i .*main\\.yml/,l:"починить задачу (template вместо shell)"},
 {re:/molecule (idempotence|verify)/,l:"добиться зелёных идемпотентности и verify"}]);

S("Labs","lab09","Lab 09: Автоскейлинг в kind — HPA + KEDA","Advanced",
`<b>Легенда:</b> нагрузочный тест поднимает реплики, тишина — опускает.<br>
<b>Цель:</b> metrics-server → HPA по CPU → KEDA по очереди.`,
"ubuntu@lab:~$",
[
["^kubectl apply -f metrics-server\\.yaml",`serviceaccount/metrics-server created`,"ok"],
["^kubectl top nodes",`NAME                CPU(cores)   MEMORY\nlab-control-plane   187m         892Mi  ← метрики появились`,"ok"],
["^kubectl apply -f deploy-hpa\\.yaml",`deployment.apps/api created\nhorizontalpodautoscaler.autoscaling/api created`,"ok"],
["^kubectl get hpa api",`NAME  REFERENCE      TARGETS   MINPODS   MAXPODS   REPLICAS\napi   Deployment/api  12%/60%   2         10        2`,"ok"],
["^(hey -z 60s http://localhost:8080|kubectl run loadgen --image=rakyll/hey)",`requests: 12000; [200] 100%`,"warn"],
["^kubectl get hpa api",`api   Deployment/api  84%/60%   2   10   8  ← отскейлилось вверх`,"ok"],
["^sleep 300 && kubectl get hpa api",`api   Deployment/api  9%/60%   2   10   2  ← остыло вниз`,"ok"]
],
[{re:/metrics-server/,l:"поставить metrics-server"},
 {re:/kubectl top nodes/,l:"убедиться, что метрики собираются"},
 {re:/kubectl apply -f deploy-hpa/,l:"деплой + HPA (min 2 / max 10)"},
 {re:/kubectl get hpa api$/,l:"начальное состояние 2 реплики"},
 {re:/(hey|loadgen)/,l:"создать нагрузку"},
 {re:/kubectl get hpa api/,l:"увидеть масштабирование вверх/вниз"}]);

S("Labs","lab10","Lab 10: Vault end-to-end — KV → AppRole → динамические креды БД","Advanced",
`<b>Легенда:</b> приложение получает временный логин БД вместо вечного пароля.<br>
<b>Цель:</b> enable engines → policy → AppRole → dynamic creds → чтение приложением.`,
"vault@lab:~$",
[
["^vault secrets enable database",`Success! Enabled the database secrets engine at: database/`,"ok"],
["^vault write database/config/appdb plugin_name=postgresql-database-plugin allowed_roles=app",`Success! Data written to: database/config/appdb`,"ok"],
["^vault write database/roles/app db_name=appdb creation_statements=\"CREATE ROLE...\" default_ttl=1h",`Success! Data written to: database/roles/app`,"ok"],
["^vault policy write app app-policy\\.hcl",`Success! Uploaded policy: app`,"ok"],
["^vault auth enable approle",`Success! Enabled approle auth method at: approle/`,"ok"],
["^vault write auth/approle/role/app token_policies=app token_ttl=30m",`Success! Data written to: auth/approle/role/app`,"ok"],
["^vault read auth/approle/role/app/role-id && vault write -f auth/approle/role/app/secret-id",`role_id    4f1a...-demo\nsecret_id  8b2c...-demo`,"dim"],
["^(vault read database/creds/app|VAULT_TOKEN=.* vault read database/creds/app)",`lease_duration  1h\nusername         v-app-demo-xy12\npassword         A1a-xxxxxxxx  ← живёт 1 час и умрёт сам`,"ok"],
["^psql -h db -U v-app-demo-xy12 -c \"select current_user\"",`current_user\nv-app-demo-xy12`,"ok"]
],
[{re:/secrets enable database/,l:"включить database engine"},
 {re:/database\/config\/appdb/,l:"подключить PostgreSQL к Vault"},
 {re:/database\/roles\/app/,l:"создать роль с TTL 1h"},
 {re:/policy write app/,l:"описать политику app"},
 {re:/auth enable approle/,l:"включить AppRole для приложения"},
 {re:/role-id|secret-id/,l:"получить AppRole-креды"},
 {re:/database\/creds\/app/,l:"получить ДИНАМИЧЕСКИЙ логин/пароль"},
 {re:/psql .*v-app/,l:"подключиться им к БД"}]);
