/* Песочница: Docker, Kubernetes, Helm, Kustomize */
S("Docker","d1","Образ 800MB → собрать правильно","Middle",
`<h3>Контекст</h3><p>Docker: <b>Образ 800MB → собрать правильно</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Образ 800MB → собрать правильно</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] сравнить размеры</li><li>[ ] пересобрать multi-stage</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker images demo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: сравнить размеры → пересобрать multi-stage.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
["^docker images demo",`demo  bad  812MB`,"err"],
["^(docker build -t demo:good \\.|cat > Dockerfile)",`[+] Building ... naming to demo:good`,"ok"],
["^docker images demo",`demo  good  9.4MB`,"ok"]
],
[{re:/^docker images/,l:"сравнить размеры"},
 {re:"^docker build",l:"пересобрать multi-stage"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Образ 800MB → собрать правильно в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: сравнить размеры → пересобрать multi-stage"]});

S("Docker","d2","Контейнер сразу умирает — посмотреть exit code","Junior",
`<h3>Контекст</h3><p>Docker: <b>Контейнер сразу умирает — посмотреть exit code</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Контейнер сразу умирает — посмотреть exit code</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть exit code</li><li>[ ] прочитать логи</li><li>[ ] убедиться, что работает</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker ps -a --filter name=app</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть exit code → прочитать логи → убедиться, что работает.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
["^docker ps -a --filter name=app",`app  Exited (127)  3 seconds ago`,"err"],
["^docker logs app",`/bin/sh: 1: ./start.sh: not found`,"err"],
["^(docker run .* --entrypoint sh|sed -i s/\\.\\/start\\.sh/\\/app\\/start\\.sh/)",`исправлен entrypoint`,"ok"],
["^docker ps --filter name=app",`app  Up 10 seconds`,"ok"]
],
[{re:/^docker ps -a/,l:"увидеть exit code"},
 {re:"^docker logs",l:"прочитать логи"},
 {re:"^docker ps --filter name=app",l:"убедиться, что работает"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Контейнер сразу умирает — посмотреть exit code в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: увидеть exit code → прочитать логи → убедиться, что работает"]});

S("Docker","d3","docker compose: сервис не видит БД","Middle",
`<h3>Контекст</h3><p>Docker: <b>docker compose: сервис не видит БД</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>docker compose: сервис не видит БД</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика compose</li><li>[ ] проверить связность изнутри</li><li>[ ] запуск с healthcheck-ожиданием</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker compose ps</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика compose → проверить связность изнутри → запуск с healthcheck-ожиданием.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
["^docker compose ps",`db  Running; app  Restarting`,"warn"],
["^docker compose logs app \\| tail",`Error: connect ECONNREFUSED 10.0.0.3:5432`,"err"],
["^docker compose exec app (getent hosts db|nc -zv db 5432)",`db resolved; 5432 refused`,"err"],
["^docker compose up -d --wait",`db healthy → app started`,"ok"]
],
[{re:/^docker compose (ps|logs)/,l:"диагностика compose"},
 {re:"^docker compose exec",l:"проверить связность изнутри"},
 {re:"^docker compose up -d --wait",l:"запуск с healthcheck-ожиданием"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: docker compose: сервис не видит БД в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: диагностика compose → проверить связность изнутри → запуск с healthcheck-ожиданием"]});

S("Docker","d4","Чистка: диск забит docker-мусором","Junior",
`<h3>Контекст</h3><p>Docker: <b>Чистка: диск забит docker-мусором</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Чистка: диск забит docker-мусором</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть, что жрёт место</li><li>[ ] почистить</li><li>[ ] почистить volumes</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker system df</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть, что жрёт место → почистить → почистить volumes.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"root@lab:~#",
[
["^docker system df",`Images  12GB; Containers 2GB; Volumes 8GB; Build Cache 20GB`,"warn"],
["^docker system prune -af --filter until=168h",`Total reclaimed space: 24.3GB`,"ok"],
["^docker volume prune -f",`Reclaimed 6GB (unused volumes)`,"ok"],
["^docker system df",`Images 3GB; Build Cache 0B`,"ok"]
],
[{re:/^docker system df/,l:"посмотреть, что жрёт место"},
 {re:"^docker system prune",l:"почистить"},
 {re:"^docker volume prune",l:"почистить volumes"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Чистка: диск забит docker-мусором в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: посмотреть, что жрёт место → почистить → почистить volumes"]});

S("Docker","d5","Проброс порта не работает — bind уже занят","Junior",
`<h3>Контекст</h3><p>Docker: <b>Проброс порта не работает — bind уже занят</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Проброс порта не работает — bind уже занят</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти, кто занял порт</li><li>[ ] освободить/сменить порт</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker run -d -p 8080:80 nginx</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти, кто занял порт → освободить/сменить порт.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
["^docker run -d -p 8080:80 nginx",`Error: bind: address already in use`,"err"],
["^ss -tulnp \\| grep 8080",`LISTEN 0.0.0.0:8080 users:(("oldapp",pid=999))`,"warn"],
["^(kill 999|systemctl stop oldapp|docker run -d -p 8081:80 nginx)",`конфликт устранён`,"ok"],
["^curl -s localhost:8081 \\| head -1",`<!DOCTYPE html>`,"ok"]
],
[{re:/^ss -tulnp \| grep/,l:"найти, кто занял порт"},
 {re:"^(kill|systemctl stop|docker run -d -p 8081)",l:"освободить/сменить порт"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Проброс порта не работает — bind уже занят в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: найти, кто занял порт → освободить/сменить порт"]});

S("Kubernetes","k1","Deployment: rolling update новой версии","Junior",
`<h3>Контекст</h3><p>Kubernetes: <b>Deployment: rolling update новой версии</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Deployment: rolling update новой версии</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] обновить образ</li><li>[ ] дождаться rollout</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl set image deploy\\\\/api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: обновить образ → дождаться rollout.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl set image deploy\\/api api=registry\\.corp\\/api:2\\.0 -n prod",`deployment.apps/api image updated`,"ok"],
["^kubectl rollout status deploy\\/api -n prod",`Successfully rolled out`,"ok"],
["^kubectl get pods -n prod",`api-xxx 1/1 Running (новые поды)`,"ok"]
],
[{re:/^kubectl set image/,l:"обновить образ"},
 {re:"^kubectl rollout status",l:"дождаться rollout"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Deployment: rolling update новой версии в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: обновить образ → дождаться rollout"]});

S("Kubernetes","k2","Откат неудачного релиза","Middle",
`<h3>Контекст</h3><p>Kubernetes: <b>Откат неудачного релиза</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Откат неудачного релиза</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть ревизии</li><li>[ ] откатить</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl rollout history deploy</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть ревизии → откатить → проверить.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl rollout history deploy\\/api -n prod",`REVISION 1 ... 2 ... 3 (2.1)`],
["^kubectl rollout undo deploy\\/api -n prod --to-revision=2",`deployment.apps/api rolled back`,"ok"],
["^kubectl rollout status deploy\\/api -n prod",`Successfully rolled out`,"ok"]
],
[{re:/^kubectl rollout history/,l:"посмотреть ревизии"},
 {re:"^kubectl rollout undo",l:"откатить"},
 {re:"^kubectl rollout status",l:"проверить"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Откат неудачного релиза в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: посмотреть ревизии → откатить → проверить"]});

S("Kubernetes","k3","Pod Pending: не хватает ресурсов","Middle",
`<h3>Контекст</h3><p>Kubernetes: <b>Pod Pending: не хватает ресурсов</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Pod Pending: не хватает ресурсов</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] прочитать Events</li><li>[ ] поправить requests</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe pod api -n pr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: прочитать Events → поправить requests → проверить.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl describe pod api -n prod \\| tail -8",`Warning  FailedScheduling: 0/3 nodes available: 3 Insufficient memory`,"err"],
["^kubectl patch deploy api -n prod --type merge -p .*(requests|memory)",`deployment patched (memory request снижен)`,"ok"],
["^kubectl get pod -n prod",`api-xxx 1/1 Running`,"ok"]
],
[{re:/^kubectl describe pod/,l:"прочитать Events"},
 {re:"^kubectl patch",l:"поправить requests"},
 {re:"^kubectl get pod",l:"проверить"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Pod Pending: не хватает ресурсов в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: прочитать Events → поправить requests → проверить"]});

S("Kubernetes","k4","OOMKilled: exit 137","Middle",
`<h3>Контекст</h3><p>Kubernetes: <b>OOMKilled: exit 137</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>OOMKilled: exit 137</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] подтвердить OOMKilled</li><li>[ ] поднять лимит</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe pod api -n pr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: подтвердить OOMKilled → поднять лимит.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl describe pod api -n prod \\| grep -A3 \"Last State\"",`Reason: OOMKilled, Exit Code: 137`,"err"],
["^kubectl patch deploy api -n prod --type merge -p .*limits.*memory",`limits.memory: 256Mi→512Mi`,"ok"],
["^kubectl get pod -n prod",`Running`,"ok"]
],
[{re:/OOMKilled/,l:"подтвердить OOMKilled"},
 {re:"limits.*memory|patch deploy",l:"поднять лимит"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: OOMKilled: exit 137 в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: подтвердить OOMKilled → поднять лимит"]});

S("Kubernetes","k5","Service 503: selector не матчится","Middle",
`<h3>Контекст</h3><p>Kubernetes: <b>Service 503: selector не матчится</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Service 503: selector не матчится</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить endpoints</li><li>[ ] исправить selector</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get endpoints api-svc </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить endpoints → исправить selector.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl get endpoints api-svc -n prod",`<none>   <-- selector не совпал`,"err"],
["^kubectl get pods --show-labels -n prod",`app=api-v2 (svc ждёт app=api)`,"warn"],
["^kubectl patch svc api-svc -n prod -p .*selector",`svc patched`,"ok"],
["^kubectl get endpoints api-svc -n prod",`10.244.1.5:8080,10.244.2.7:8080`,"ok"]
],
[{re:/^kubectl get endpoints/,l:"проверить endpoints"},
 {re:"^kubectl patch svc",l:"исправить selector"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Service 503: selector не матчится в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: проверить endpoints → исправить selector"]});

S("Kubernetes","k6","ImagePullBackOff: неверный тег","Junior",
`<h3>Контекст</h3><p>Kubernetes: <b>ImagePullBackOff: неверный тег</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ImagePullBackOff: неверный тег</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть причину pull</li><li>[ ] исправить тег</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe pod api -n pr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть причину pull → исправить тег.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl describe pod api -n prod \\| grep Failed",`Failed to pull image "registry.corp/api:2.9.9": not found`,"err"],
["^kubectl set image deploy\\/api api=registry\\.corp\\/api:2\\.4\\.0 -n prod",`image updated`,"ok"],
["^kubectl get pods -n prod",`Running`,"ok"]
],
[{re:/^kubectl describe/,l:"увидеть причину pull"},
 {re:"^kubectl set image",l:"исправить тег"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: ImagePullBackOff: неверный тег в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: увидеть причину pull → исправить тег"]});

S("Kubernetes","k7","ConfigMap обновился, приложение не видит","Middle",
`<h3>Контекст</h3><p>Kubernetes: <b>ConfigMap обновился, приложение не видит</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ConfigMap обновился, приложение не видит</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] перезапустить поды (env/файл кэшируется)</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get cm app-config -n p</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: перезапустить поды (env/файл кэшируется).</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl get cm app-config -n prod -o yaml \\| grep level",`level: debug`,"ok"],
["^kubectl rollout restart deploy\\/api -n prod",`deployment restarted`,"ok"],
["^kubectl rollout status deploy\\/api -n prod",`Successfully rolled out`,"ok"]
],
[{re:/^kubectl rollout restart/,l:"перезапустить поды (env/файл кэшируется)"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: ConfigMap обновился, приложение не видит в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: перезапустить поды (env/файл кэшируется)"]});

S("Kubernetes","k8","Secret: создать и прочитать base64","Junior",
`<h3>Контекст</h3><p>Kubernetes: <b>Secret: создать и прочитать base64</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Secret: создать и прочитать base64</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать secret</li><li>[ ] раскодировать значение</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl create secret generic </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать secret → раскодировать значение.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl create secret generic db -n prod --from-literal=PASSWORD=s3cr3t",`secret/db created`,"ok"],
["^kubectl get secret db -n prod -o jsonpath=.*data\\.PASSWORD.*\\| base64 -d",`s3cr3t`,"ok"]
],
[{re:/^kubectl create secret/,l:"создать secret"},
 {re:"base64 -d",l:"раскодировать значение"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Secret: создать и прочитать base64 в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: создать secret → раскодировать значение"]});

S("Kubernetes","k9","HPA не работает — нет metrics-server","Middle",
`<h3>Контекст</h3><p>Kubernetes: <b>HPA не работает — нет metrics-server</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>HPA не работает — нет metrics-server</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть ошибку HPA</li><li>[ ] поставить metrics-server</li><li>[ ] проверить метрики</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe hpa api -n pr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть ошибку HPA → поставить metrics-server → проверить метрики.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl describe hpa api -n prod",`unable to get metrics for resource cpu: no metrics`,"err"],
["^kubectl -n kube-system get deploy metrics-server",`0/1 или отсутствует`,"err"],
["^(kubectl apply -f .*metrics-server.*components\\.yaml|helm install metrics-server)",`metrics-server установлен`,"ok"],
["^kubectl top nodes",`NAME CPU(cores) MEMORY`,"ok"]
],
[{re:/^kubectl describe hpa/,l:"увидеть ошибку HPA"},
 {re:"metrics-server",l:"поставить metrics-server"},
 {re:"^kubectl top",l:"проверить метрики"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: HPA не работает — нет metrics-server в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: увидеть ошибку HPA → поставить metrics-server → проверить метрики"]});

S("Kubernetes","k10","NetworkPolicy заблокировала трафик","Senior",
`<h3>Контекст</h3><p>Kubernetes: <b>NetworkPolicy заблокировала трафик</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>NetworkPolicy заблокировала трафик</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть политики</li><li>[ ] добавить разрешающее правило</li><li>[ ] проверить связность</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n prod exec deploy\\\\/</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть политики → добавить разрешающее правило → проверить связность.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl -n prod exec deploy\\/web -- (nc -zv|wget).*",`timeout / refused`,"err"],
["^kubectl get networkpolicy -n prod",`default-deny-all`,"warn"],
["^kubectl apply -f - <<EOF.*allow-web-to-api",`networkpolicy.networking.k8s.io/allow created`,"ok"],
["^kubectl -n prod exec deploy\\/web -- (nc -zv|wget).*",`open / 200`,"ok"]
],
[{re:/^kubectl get networkpolicy/,l:"увидеть политики"},
 {re:"allow",l:"добавить разрешающее правило"},
 {re:"(nc|wget).*$",l:"проверить связность"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: NetworkPolicy заблокировала трафик в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: увидеть политики → добавить разрешающее правило → проверить связность"]});

S("Kubernetes","k11","PVC Pending: нет StorageClass","Middle",
`<h3>Контекст</h3><p>Kubernetes: <b>PVC Pending: нет StorageClass</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PVC Pending: нет StorageClass</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] причина Pending</li><li>[ ] исправить StorageClass</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe pvc data -n p</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: причина Pending → исправить StorageClass.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl describe pvc data -n prod",`no persistent volumes available ... storageclass not found`,"err"],
["^kubectl get sc",`(пусто или не тот класс)`,"warn"],
["^kubectl patch pvc data -n prod -p .*storageClassName",`pvc patched`,"ok"],
["^kubectl get pvc -n prod",`data  Bound`,"ok"]
],
[{re:/^kubectl describe pvc/,l:"причина Pending"},
 {re:"^kubectl (get sc|patch pvc)",l:"исправить StorageClass"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: PVC Pending: нет StorageClass в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: причина Pending → исправить StorageClass"]});

S("Kubernetes","k12","Node NotReady — что случилось","Senior",
`<h3>Контекст</h3><p>Kubernetes: <b>Node NotReady — что случилось</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Node NotReady — что случилось</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть conditions</li><li>[ ] вывести ноду из ротации</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe node worker-2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть conditions → вывести ноду из ротации.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl describe node worker-2 \\| grep -A6 Conditions",`MemoryPressure=True, Ready=False`,"err"],
["^kubectl get events -A --field-selector reason=Evicted \\| tail",`Evicted: The node was low on resource: memory`,"warn"],
["^kubectl drain worker-2 --ignore-daemonsets --delete-emptydir-data",`node drained`,"ok"]
],
[{re:/^kubectl describe node/,l:"посмотреть conditions"},
 {re:"^kubectl (drain|cordon)",l:"вывести ноду из ротации"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Node NotReady — что случилось в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: посмотреть conditions → вывести ноду из ротации"]});

S("Kubernetes","k13","kubectl debug: шелла в образе нет","Senior",
`<h3>Контекст</h3><p>Kubernetes: <b>kubectl debug: шелла в образе нет</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>kubectl debug: шелла в образе нет</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] запустить ephemeral debug-контейнер</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl debug -it .*--image=bu</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: запустить ephemeral debug-контейнер.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl debug -it .*--image=busybox",`Targeting container... If you don't see a command prompt, press enter`,"ok"],
["^(ps|wget -qO- localhost:8080)",`процессы и ответы целевого пода доступны ✅`,"ok"]
],
[{re:/^kubectl debug/,l:"запустить ephemeral debug-контейнер"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: kubectl debug: шелла в образе нет в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: запустить ephemeral debug-контейнер"]});

S("Helm","h1","helm upgrade упал — откатиться","Middle",
`<h3>Контекст</h3><p>Helm: <b>helm upgrade упал — откатиться</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm upgrade упал — откатиться</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть релиз</li><li>[ ] откатить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm list -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть релиз → откатить.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^helm list -n prod",`api  2.1.0  failed`,"err"],
["^helm rollback api -n prod",`Rollback was a success`,"ok"],
["^helm history api -n prod \\| tail -2",`2  superseded; 3  rolled back to 1`,"ok"]
],
[{re:/^helm (list|history)/,l:"посмотреть релиз"},
 {re:"^helm rollback",l:"откатить"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm upgrade упал — откатиться\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm upgrade упал — откатиться — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm upgrade упал — откатиться в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: посмотреть релиз → откатить"]});

S("Helm","h2","helm template ошибка — найти в чарте","Middle",
`<h3>Контекст</h3><p>Helm: <b>helm template ошибка — найти в чарте</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm template ошибка — найти в чарте</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] прогнать lint</li><li>[ ] отрендерить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm lint chart\\\\/</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: прогнать lint → отрендерить.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^helm lint chart\\/",`[ERROR] templates/deploy.yaml: undefined variable .Values.replicaCount`,"err"],
["^(sed -i|nano) chart\\/values\\.yaml",`replicaCount добавлен`,"ok"],
["^helm lint chart\\/",`0 chart(s) failed`,"ok"],
["^helm template chart\\/ \\| head",`apiVersion: apps/v1 ...`,"ok"]
],
[{re:/^helm lint/,l:"прогнать lint"},
 {re:"^helm template",l:"отрендерить"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm template ошибка — найти в чарте\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm template ошибка — найти в чарте — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm template ошибка — найти в чарте в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: прогнать lint → отрендерить"]});

S("Kustomize","ku1","Overlay: diff перед применением","Middle",
`<h3>Контекст</h3><p>Kustomize: <b>Overlay: diff перед применением</b>. Работа с <code>project/overlay-diff-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Overlay: diff перед применением</b>. Файл <code>project/overlay-diff-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] kustomize build/diff/apply</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/overlay-diff-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/overlay-diff-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl kustomize overlays\\\\/p</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: kustomize build/diff/apply.</p><h3>Проверка</h3><pre>cat project/overlay-diff-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl kustomize overlays\\/prod \\| kubectl diff -f -",`- replicas: 2\n+ replicas: 5\n+ image: api:2.0`,"ok"],
["^kubectl apply -k overlays\\/prod",`deployment.apps/api configured`,"ok"]
],
[{re:/^kubectl (kustomize|apply -k)/,l:"kustomize build/diff/apply"}],{file:"project/overlay-diff-.yaml",files:{"project/overlay-diff-.yaml":`# Kustomize: Overlay: diff перед применением\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/overlay-diff-.yaml":`# Kustomize: Overlay: diff перед применением — fixed\nstatus: ok\n`}},{hints:["Симптом: Overlay: diff перед применением в project/overlay-diff-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/overlay-diff-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/overlay-diff-.yaml.","Порядок: kustomize build/diff/apply"]});
