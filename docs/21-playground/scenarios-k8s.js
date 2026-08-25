/* Песочница: Docker, Kubernetes, Helm, Kustomize */
S("Docker","d1","Образ 800MB → собрать правильно","Middle",
`<b>Задача:</b> пересобрать образ multi-stage, чтобы весил <20MB.`,
"ubuntu@lab:~$",
[
["^docker images demo",`demo  bad  812MB`,"err"],
["^(docker build -t demo:good \\.|cat > Dockerfile)",`[+] Building ... naming to demo:good`,"ok"],
["^docker images demo",`demo  good  9.4MB`,"ok"]
],
[{re:/^docker images/,l:"сравнить размеры"},
 {re:"^docker build",l:"пересобрать multi-stage"}]);

S("Docker","d2","Контейнер сразу умирает — посмотреть exit code","Junior",
`<b>Симптом:</b> <code>docker run</code> — контейнер exited.`,
"ubuntu@lab:~$",
[
["^docker ps -a --filter name=app",`app  Exited (127)  3 seconds ago`,"err"],
["^docker logs app",`/bin/sh: 1: ./start.sh: not found`,"err"],
["^(docker run .* --entrypoint sh|sed -i s/\\.\\/start\\.sh/\\/app\\/start\\.sh/)",`исправлен entrypoint`,"ok"],
["^docker ps --filter name=app",`app  Up 10 seconds`,"ok"]
],
[{re:/^docker ps -a/,l:"увидеть exit code"},
 {re:"^docker logs",l:"прочитать логи"},
 {re:"^docker ps --filter name=app",l:"убедиться, что работает"}]);

S("Docker","d3","docker compose: сервис не видит БД","Middle",
`<b>Симптом:</b> app не коннектится к <code>db:5432</code>.`,
"ubuntu@lab:~$",
[
["^docker compose ps",`db  Running; app  Restarting`,"warn"],
["^docker compose logs app \\| tail",`Error: connect ECONNREFUSED 10.0.0.3:5432`,"err"],
["^docker compose exec app (getent hosts db|nc -zv db 5432)",`db resolved; 5432 refused`,"err"],
["^docker compose up -d --wait",`db healthy → app started`,"ok"]
],
[{re:/^docker compose (ps|logs)/,l:"диагностика compose"},
 {re:"^docker compose exec",l:"проверить связность изнутри"},
 {re:"^docker compose up -d --wait",l:"запуск с healthcheck-ожиданием"}]);

S("Docker","d4","Чистка: диск забит docker-мусором","Junior",
`<b>Алерт:</b> диск 92%. Docker съедает место.`,
"root@lab:~#",
[
["^docker system df",`Images  12GB; Containers 2GB; Volumes 8GB; Build Cache 20GB`,"warn"],
["^docker system prune -af --filter until=168h",`Total reclaimed space: 24.3GB`,"ok"],
["^docker volume prune -f",`Reclaimed 6GB (unused volumes)`,"ok"],
["^docker system df",`Images 3GB; Build Cache 0B`,"ok"]
],
[{re:/^docker system df/,l:"посмотреть, что жрёт место"},
 {re:"^docker system prune",l:"почистить"},
 {re:"^docker volume prune",l:"почистить volumes"}]);

S("Docker","d5","Проброс порта не работает — bind уже занят","Junior",
`<b>Симптом:</b> <code>docker run -p 8080:80</code> → address already in use.`,
"ubuntu@lab:~$",
[
["^docker run -d -p 8080:80 nginx",`Error: bind: address already in use`,"err"],
["^ss -tulnp \\| grep 8080",`LISTEN 0.0.0.0:8080 users:(("oldapp",pid=999))`,"warn"],
["^(kill 999|systemctl stop oldapp|docker run -d -p 8081:80 nginx)",`конфликт устранён`,"ok"],
["^curl -s localhost:8081 \\| head -1",`<!DOCTYPE html>`,"ok"]
],
[{re:/^ss -tulnp \| grep/,l:"найти, кто занял порт"},
 {re:"^(kill|systemctl stop|docker run -d -p 8081)",l:"освободить/сменить порт"}]);

S("Kubernetes","k1","Deployment: rolling update новой версии","Junior",
`<b>Задача:</b> выкатить <code>api:2.0</code> без даунтайма.`,
"dev@lab:~$",
[
["^kubectl set image deploy\\/api api=registry\\.corp\\/api:2\\.0 -n prod",`deployment.apps/api image updated`,"ok"],
["^kubectl rollout status deploy\\/api -n prod",`Successfully rolled out`,"ok"],
["^kubectl get pods -n prod",`api-xxx 1/1 Running (новые поды)`,"ok"]
],
[{re:/^kubectl set image/,l:"обновить образ"},
 {re:"^kubectl rollout status",l:"дождаться rollout"}]);

S("Kubernetes","k2","Откат неудачного релиза","Middle",
`<b>Симптом:</b> после выката 2.1 поды в CrashLoop. Откатить.`,
"dev@lab:~$",
[
["^kubectl rollout history deploy\\/api -n prod",`REVISION 1 ... 2 ... 3 (2.1)`],
["^kubectl rollout undo deploy\\/api -n prod --to-revision=2",`deployment.apps/api rolled back`,"ok"],
["^kubectl rollout status deploy\\/api -n prod",`Successfully rolled out`,"ok"]
],
[{re:/^kubectl rollout history/,l:"посмотреть ревизии"},
 {re:"^kubectl rollout undo",l:"откатить"},
 {re:"^kubectl rollout status",l:"проверить"}]);

S("Kubernetes","k3","Pod Pending: не хватает ресурсов","Middle",
`<b>Симптом:</b> под висит Pending.`,
"dev@lab:~$",
[
["^kubectl describe pod api -n prod \\| tail -8",`Warning  FailedScheduling: 0/3 nodes available: 3 Insufficient memory`,"err"],
["^kubectl patch deploy api -n prod --type merge -p .*(requests|memory)",`deployment patched (memory request снижен)`,"ok"],
["^kubectl get pod -n prod",`api-xxx 1/1 Running`,"ok"]
],
[{re:/^kubectl describe pod/,l:"прочитать Events"},
 {re:"^kubectl patch",l:"поправить requests"},
 {re:"^kubectl get pod",l:"проверить"}]);

S("Kubernetes","k4","OOMKilled: exit 137","Middle",
`<b>Симптом:</b> под перезапускается, exit 137.`,
"dev@lab:~$",
[
["^kubectl describe pod api -n prod \\| grep -A3 \"Last State\"",`Reason: OOMKilled, Exit Code: 137`,"err"],
["^kubectl patch deploy api -n prod --type merge -p .*limits.*memory",`limits.memory: 256Mi→512Mi`,"ok"],
["^kubectl get pod -n prod",`Running`,"ok"]
],
[{re:/OOMKilled/,l:"подтвердить OOMKilled"},
 {re:"limits.*memory|patch deploy",l:"поднять лимит"}]);

S("Kubernetes","k5","Service 503: selector не матчится","Middle",
`<b>Симптом:</b> svc отвечает 503, поды Running.`,
"dev@lab:~$",
[
["^kubectl get endpoints api-svc -n prod",`<none>   <-- selector не совпал`,"err"],
["^kubectl get pods --show-labels -n prod",`app=api-v2 (svc ждёт app=api)`,"warn"],
["^kubectl patch svc api-svc -n prod -p .*selector",`svc patched`,"ok"],
["^kubectl get endpoints api-svc -n prod",`10.244.1.5:8080,10.244.2.7:8080`,"ok"]
],
[{re:/^kubectl get endpoints/,l:"проверить endpoints"},
 {re:"^kubectl patch svc",l:"исправить selector"}]);

S("Kubernetes","k6","ImagePullBackOff: неверный тег","Junior",
`<b>Симптом:</b> ImagePullBackOff.`,
"dev@lab:~$",
[
["^kubectl describe pod api -n prod \\| grep Failed",`Failed to pull image "registry.corp/api:2.9.9": not found`,"err"],
["^kubectl set image deploy\\/api api=registry\\.corp\\/api:2\\.4\\.0 -n prod",`image updated`,"ok"],
["^kubectl get pods -n prod",`Running`,"ok"]
],
[{re:/^kubectl describe/,l:"увидеть причину pull"},
 {re:"^kubectl set image",l:"исправить тег"}]);

S("Kubernetes","k7","ConfigMap обновился, приложение не видит","Middle",
`<b>Симптом:</b> изменили ConfigMap, приложение читает старое.`,
"dev@lab:~$",
[
["^kubectl get cm app-config -n prod -o yaml \\| grep level",`level: debug`,"ok"],
["^kubectl rollout restart deploy\\/api -n prod",`deployment restarted`,"ok"],
["^kubectl rollout status deploy\\/api -n prod",`Successfully rolled out`,"ok"]
],
[{re:/^kubectl rollout restart/,l:"перезапустить поды (env/файл кэшируется)"}]);

S("Kubernetes","k8","Secret: создать и прочитать base64","Junior",
`<b>Задача:</b> создать secret и проверить значение.`,
"dev@lab:~$",
[
["^kubectl create secret generic db -n prod --from-literal=PASSWORD=s3cr3t",`secret/db created`,"ok"],
["^kubectl get secret db -n prod -o jsonpath=.*data\\.PASSWORD.*\\| base64 -d",`s3cr3t`,"ok"]
],
[{re:/^kubectl create secret/,l:"создать secret"},
 {re:"base64 -d",l:"раскодировать значение"}]);

S("Kubernetes","k9","HPA не работает — нет metrics-server","Middle",
`<b>Симптом:</b> HPA: <code>unknown</code> метрики.`,
"dev@lab:~$",
[
["^kubectl describe hpa api -n prod",`unable to get metrics for resource cpu: no metrics`,"err"],
["^kubectl -n kube-system get deploy metrics-server",`0/1 или отсутствует`,"err"],
["^(kubectl apply -f .*metrics-server.*components\\.yaml|helm install metrics-server)",`metrics-server установлен`,"ok"],
["^kubectl top nodes",`NAME CPU(cores) MEMORY`,"ok"]
],
[{re:/^kubectl describe hpa/,l:"увидеть ошибку HPA"},
 {re:"metrics-server",l:"поставить metrics-server"},
 {re:"^kubectl top",l:"проверить метрики"}]);

S("Kubernetes","k10","NetworkPolicy заблокировала трафик","Senior",
`<b>Симптом:</b> web не достучаться до api после включения default-deny.`,
"dev@lab:~$",
[
["^kubectl -n prod exec deploy\\/web -- (nc -zv|wget).*",`timeout / refused`,"err"],
["^kubectl get networkpolicy -n prod",`default-deny-all`,"warn"],
["^kubectl apply -f - <<EOF.*allow-web-to-api",`networkpolicy.networking.k8s.io/allow created`,"ok"],
["^kubectl -n prod exec deploy\\/web -- (nc -zv|wget).*",`open / 200`,"ok"]
],
[{re:/^kubectl get networkpolicy/,l:"увидеть политики"},
 {re:"allow",l:"добавить разрешающее правило"},
 {re:"(nc|wget).*$",l:"проверить связность"}]);

S("Kubernetes","k11","PVC Pending: нет StorageClass","Middle",
`<b>Симптом:</b> PVC Pending.`,
"dev@lab:~$",
[
["^kubectl describe pvc data -n prod",`no persistent volumes available ... storageclass not found`,"err"],
["^kubectl get sc",`(пусто или не тот класс)`,"warn"],
["^kubectl patch pvc data -n prod -p .*storageClassName",`pvc patched`,"ok"],
["^kubectl get pvc -n prod",`data  Bound`,"ok"]
],
[{re:/^kubectl describe pvc/,l:"причина Pending"},
 {re:"^kubectl (get sc|patch pvc)",l:"исправить StorageClass"}]);

S("Kubernetes","k12","Node NotReady — что случилось","Senior",
`<b>Симптом:</b> нода NotReady.`,
"dev@lab:~$",
[
["^kubectl describe node worker-2 \\| grep -A6 Conditions",`MemoryPressure=True, Ready=False`,"err"],
["^kubectl get events -A --field-selector reason=Evicted \\| tail",`Evicted: The node was low on resource: memory`,"warn"],
["^kubectl drain worker-2 --ignore-daemonsets --delete-emptydir-data",`node drained`,"ok"]
],
[{re:/^kubectl describe node/,l:"посмотреть conditions"},
 {re:"^kubectl (drain|cordon)",l:"вывести ноду из ротации"}]);

S("Kubernetes","k13","kubectl debug: шелла в образе нет","Senior",
`<b>Задача:</b> отладить distroless-под эфемерным контейнером.`,
"dev@lab:~$",
[
["^kubectl debug -it .*--image=busybox",`Targeting container... If you don't see a command prompt, press enter`,"ok"],
["^(ps|wget -qO- localhost:8080)",`процессы и ответы целевого пода доступны ✅`,"ok"]
],
[{re:/^kubectl debug/,l:"запустить ephemeral debug-контейнер"}]);

S("Helm","h1","helm upgrade упал — откатиться","Middle",
`<b>Симптом:</b> helm upgrade сломал релиз.`,
"dev@lab:~$",
[
["^helm list -n prod",`api  2.1.0  failed`,"err"],
["^helm rollback api -n prod",`Rollback was a success`,"ok"],
["^helm history api -n prod \\| tail -2",`2  superseded; 3  rolled back to 1`,"ok"]
],
[{re:/^helm (list|history)/,l:"посмотреть релиз"},
 {re:"^helm rollback",l:"откатить"}]);

S("Helm","h2","helm template ошибка — найти в чарте","Middle",
`<b>Симптом:</b> <code>helm template</code> падает.`,
"dev@lab:~$",
[
["^helm lint chart\\/",`[ERROR] templates/deploy.yaml: undefined variable .Values.replicaCount`,"err"],
["^(sed -i|nano) chart\\/values\\.yaml",`replicaCount добавлен`,"ok"],
["^helm lint chart\\/",`0 chart(s) failed`,"ok"],
["^helm template chart\\/ \\| head",`apiVersion: apps/v1 ...`,"ok"]
],
[{re:/^helm lint/,l:"прогнать lint"},
 {re:"^helm template",l:"отрендерить"}]);

S("Kustomize","ku1","Overlay: diff перед применением","Middle",
`<b>Задача:</b> посмотреть, что изменит prod-overlay.`,
"dev@lab:~$",
[
["^kubectl kustomize overlays\\/prod \\| kubectl diff -f -",`- replicas: 2\n+ replicas: 5\n+ image: api:2.0`,"ok"],
["^kubectl apply -k overlays\\/prod",`deployment.apps/api configured`,"ok"]
],
[{re:/^kubectl (kustomize|apply -k)/,l:"kustomize build/diff/apply"}]);
