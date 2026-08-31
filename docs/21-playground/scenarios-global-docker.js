/* Global Playground: Docker — 25 scenarios */
S("Docker","gdocker-1","Многослойный образ 1.2GB → multi-stage 18MB","Middle", `<h3>Контекст</h3><p>Docker: <b>Многослойный образ 1.2GB → multi-stage 18MB</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Многослойный образ 1.2GB → multi-stage 18MB</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] сравнить размеры</li><li>[ ] пересобрать multi-stage</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker images demo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: сравнить размеры → пересобрать multi-stage.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker images demo",`demo bad 1.24GB\ndemo good ---`,"err"],
 ["^cat Dockerfile \\| head -20",`FROM golang:1.23\nCOPY . .\nRUN go build -o /app`,"warn"],
 ["^docker build -t demo:good .",`[+] Building 8.4s FINISHED\n => naming to demo:good`,"ok"],
 ["^docker images demo \\| grep good",`demo good 18.2MB`,"ok"]
],
[{re:"^docker images demo",l:"сравнить размеры"},
 {re:"^docker build -t demo:good",l:"пересобрать multi-stage"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Многослойный образ 1.2GB → multi-stage 18MB в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: сравнить размеры → пересобрать multi-stage"]});

S("Docker","gdocker-2","Контейнер падает с exit 127 — нет entrypoint","Junior", `<h3>Контекст</h3><p>Docker: <b>Контейнер падает с exit 127 — нет entrypoint</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Контейнер падает с exit 127 — нет entrypoint</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть exit 127</li><li>[ ] логи</li><li>[ ] проверить entrypoint</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker ps -a --filter name=app</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть exit 127 → логи → проверить entrypoint.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker ps -a --filter name=app",`app Exited (127) 3 sec ago`,"err"],
 ["^docker logs app 2>&1 \\| head -5",`/bin/sh: 1: ./start.sh: not found`,"err"],
 ["^docker inspect app --format=\"{{.Config.Entrypoint}}\"",`\\[./start.sh\\]`,"warn"],
 ["^sed -i s|./start.sh|/app/start.sh| Dockerfile",`patched`,"ok"],
 ["^docker build -t app:fix . && docker run -d --name app2 app:fix",`started`,"ok"],
 ["^docker ps --filter name=app2",`app2 Up 5 seconds`,"ok"]
],
[{re:"^docker ps -a --filter name=app",l:"увидеть exit 127"},
 {re:"^docker logs app",l:"логи"},
 {re:"^docker inspect app",l:"проверить entrypoint"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Контейнер падает с exit 127 — нет entrypoint в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: увидеть exit 127 → логи → проверить entrypoint"]});

S("Docker","gdocker-3","compose: app не видит db:5432 — depends_on и healthcheck","Middle", `<h3>Контекст</h3><p>Docker: <b>compose: app не видит db:5432 — depends_on и healthcheck</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>compose: app не видит db:5432 — depends_on и healthcheck</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус сервисов</li><li>[ ] логи аппа</li><li>[ ] запуск с healthcheck</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker compose ps</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус сервисов → логи аппа → запуск с healthcheck.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker compose ps",`db Running (healthy)\napp Restarting`,"warn"],
 ["^docker compose logs app 2>&1 \\| tail -10",`Error: connect ECONNREFUSED 10.0.0.3:5432`,"err"],
 ["^docker compose exec app nc -zv db 5432",`nc: connect to db 5432 refused`,"err"],
 ["^cat compose.yaml \\| grep -A5 depends_on",`depends_on: [db]  # без condition`,"warn"],
 ["^sed -i s/depends_on.*/depends_on:\\n      db:\\n        condition: service_healthy/ compose.yaml",`patched`,"ok"],
 ["^docker compose up -d --wait",`db healthy -> app started`,"ok"]
],
[{re:"^docker compose ps",l:"статус сервисов"},
 {re:"^docker compose logs app",l:"логи аппа"},
 {re:"^docker compose up -d --wait",l:"запуск с healthcheck"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: compose: app не видит db:5432 — depends_on и healthcheck в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: статус сервисов → логи аппа → запуск с healthcheck"]});

S("Docker","gdocker-4","Диск забит: system df показывает 30GB build cache","Junior", `<h3>Контекст</h3><p>Docker: <b>Диск забит: system df показывает 30GB build cache</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Диск забит: system df показывает 30GB build cache</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть что жрёт</li><li>[ ] почистить</li><li>[ ] чистка volumes</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker system df</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть что жрёт → почистить → чистка volumes.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^docker system df",`Images 12GB  Containers 2GB  Build Cache 20GB`,"warn"],
 ["^docker system prune -af --filter until=168h",`Total reclaimed space: 18.2GB`,"ok"],
 ["^docker volume prune -f",`Reclaimed 4GB`,"ok"],
 ["^docker system df",`Images 3GB  Build Cache 0B`,"ok"]
],
[{re:"^docker system df",l:"посмотреть что жрёт"},
 {re:"^docker system prune",l:"почистить"},
 {re:"^docker volume prune -f",l:"чистка volumes"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Диск забит: system df показывает 30GB build cache в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: посмотреть что жрёт → почистить → чистка volumes"]});

S("Docker","gdocker-5","Порт 8080 занят — address already in use","Junior", `<h3>Контекст</h3><p>Docker: <b>Порт 8080 занят — address already in use</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Порт 8080 занят — address already in use</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] воспроизвести</li><li>[ ] кто занял</li><li>[ ] освободить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker run -d -p 8080:80 nginx</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: воспроизвести → кто занял → освободить.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker run -d -p 8080:80 nginx",`Error: bind: address already in use`,"err"],
 ["^ss -tlnp \\| grep 8080",`LISTEN 0.0.0.0:8080 users:\\(\\(oldapp,pid=999\\)\\)`,"warn"],
 ["^docker ps \\| grep oldapp",`oldapp Up 2 days`,"dim"],
 ["^docker stop oldapp && docker run -d -p 8080:80 nginx",`started`,"ok"],
 ["^curl -s localhost:8080 \\| head -1",`<!DOCTYPE html>`,"ok"]
],
[{re:"^docker run -d -p 8080:80",l:"воспроизвести"},
 {re:"^ss -tlnp \\| grep 8080",l:"кто занял"},
 {re:"^docker stop oldapp",l:"освободить"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Порт 8080 занят — address already in use в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: воспроизвести → кто занял → освободить"]});

S("Docker","gdocker-6","Registry: unauthorized при push","Middle", `<h3>Контекст</h3><p>Docker: <b>Registry: unauthorized при push</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Registry: unauthorized при push</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] попробовать push</li><li>[ ] логин</li><li>[ ] проверить каталог</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker push localhost:5000/dem</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: попробовать push → логин → проверить каталог.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker push localhost:5000/demo:1\\.0\\.0 2>&1 \\| tail -5",`unauthorized: authentication required`,"err"],
 ["^cat ~/.docker/config.json \\| grep auth",`(пусто)`,"err"],
 ["^docker login localhost:5000",`Username: robot\nLogin Succeeded`,"ok"],
 ["^docker push localhost:5000/demo:1\\.0\\.0",`1.0.0: digest: sha256:abcd`,"ok"],
 ["^curl -s localhost:5000/v2/_catalog \\| grep demo",`\"demo\"`,"ok"]
],
[{re:"^docker push localhost:5000",l:"попробовать push"},
 {re:"^docker login localhost:5000",l:"логин"},
 {re:"^curl -s localhost:5000/v2/_catalog",l:"проверить каталог"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Registry: unauthorized при push в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: попробовать push → логин → проверить каталог"]});

S("Docker","gdocker-7","Сеть: контейнер не резолвит сервис по имени","Middle", `<h3>Контекст</h3><p>Docker: <b>Сеть: контейнер не резолвит сервис по имени</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Сеть: контейнер не резолвит сервис по имени</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] сети</li><li>[ ] проверить сеть контейнера</li><li>[ ] подключить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker network ls</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: сети → проверить сеть контейнера → подключить.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker network ls",`bridge\napp_net`,"dim"],
 ["^docker inspect app --format=\"{{.NetworkSettings.Networks.app_net}}\"",`(пусто)`,"err"],
 ["^docker network inspect app_net \\| grep -A2 app",`(нет app)`,"err"],
 ["^docker network connect app_net app",``, "ok"],
 ["^docker exec app getent hosts db",`10.0.0.3 db`,"ok"]
],
[{re:"^docker network ls",l:"сети"},
 {re:"^docker inspect app",l:"проверить сеть контейнера"},
 {re:"^docker network connect app_net app",l:"подключить"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Сеть: контейнер не резолвит сервис по имени в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: сети → проверить сеть контейнера → подключить"]});

S("Docker","gdocker-8","Volume: данные пропали после пересоздания","Middle", `<h3>Контекст</h3><p>Docker: <b>Volume: данные пропали после пересоздания</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Volume: данные пропали после пересоздания</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить mounts</li><li>[ ] список volumes</li><li>[ ] запустить с volume</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker inspect db --format=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить mounts → список volumes → запустить с volume.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker inspect db --format=\"{{.Mounts}}\"",`\\[\\]`,"err"],
 ["^docker volume ls \\| grep db",`(пусто)`,"err"],
 ["^docker run -d --name db2 -v db_data:/var/lib/postgresql/data postgres:16",`started`,"ok"],
 ["^docker volume ls \\| grep db_data",`local db_data`,"ok"]
],
[{re:"^docker inspect db",l:"проверить mounts"},
 {re:"^docker volume ls",l:"список volumes"},
 {re:"^docker run -d.*-v db_data",l:"запустить с volume"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Volume: данные пропали после пересоздания в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить mounts → список volumes → запустить с volume"]});

S("Docker","gdocker-9","BuildKit: секреты попали в слои — history показывает токен","Senior", `<h3>Контекст</h3><p>Docker: <b>BuildKit: секреты попали в слои — history показывает токен</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>BuildKit: секреты попали в слои — history показывает токен</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить историю</li><li>[ ] найти утечку</li><li>[ ] исправить на secret mount</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker history demo:bad --no-t</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить историю → найти утечку → исправить на secret mount.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker history demo:bad --no-trunc \\| grep -i token",`ARG TOKEN=ghp_1234567890`,"err"],
 ["^cat Dockerfile \\| grep TOKEN",`ARG TOKEN\nenv TOKEN=\\$TOKEN`,"err"],
 ["^cat Dockerfile \\| grep -- --mount=type=secret",`(пусто)`,"warn"],
 ["^sed -i s/ARG\\ TOKEN/RUN\\ --mount=type=secret,id=token/ Dockerfile",`patched BuildKit secret mount`,"ok"],
 ["^docker history demo:good --no-trunc \\| grep token",`(пусто)`,"ok"]
],
[{re:"^docker history demo",l:"проверить историю"},
 {re:"ARG TOKEN",l:"найти утечку"},
 {re:"--mount=type=secret",l:"исправить на secret mount"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: BuildKit: секреты попали в слои — history показывает токен в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить историю → найти утечку → исправить на secret mount"]});

S("Docker","gdocker-10","Healthcheck: контейнер Up но не healthy","Middle", `<h3>Контекст</h3><p>Docker: <b>Healthcheck: контейнер Up но не healthy</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Healthcheck: контейнер Up но не healthy</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить health</li><li>[ ] найти в Dockerfile</li><li>[ ] пересобрать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker inspect app --format=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить health → найти в Dockerfile → пересобрать.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker inspect app --format=\"{{.State.Health.Status}}\"",`no healthcheck`,"warn"],
 ["^docker ps --format \"{{.Names}} {{.Status}}\"",`app Up 2 minutes`,"dim"],
 ["^cat Dockerfile \\| grep HEALTHCHECK",`(пусто)`,"err"],
 ["^sed -i s/EXPOSE\\ 8080/HEALTHCHECK\\ CMD\\ curl\\ -f\\ http:\\/\\/localhost:8080\\/healthz\\ ||\\ exit\\ 1\\nEXPOSE\\ 8080/ Dockerfile",`patched`,"ok"],
 ["^docker build -t app:hc . && docker run -d --name app-hc app:hc",`started`,"ok"],
 ["^docker inspect app-hc --format=\"{{.State.Health.Status}}\"",`healthy`,"ok"]
],
[{re:"^docker inspect app --format",l:"проверить health"},
 {re:"HEALTHCHECK",l:"найти в Dockerfile"},
 {re:"^docker build -t app:hc",l:"пересобрать"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Healthcheck: контейнер Up но не healthy в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить health → найти в Dockerfile → пересобрать"]});

S("Docker","gdocker-11","User namespace: контейнер пишет как root на хосте","Senior", `<h3>Контекст</h3><p>Docker: <b>User namespace: контейнер пишет как root на хосте</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>User namespace: контейнер пишет как root на хосте</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] права файлов</li><li>[ ] проверить User</li><li>[ ] добавить USER</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>ls -l /var/lib/docker/volumes/</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: права файлов → проверить User → добавить USER.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^ls -l /var/lib/docker/volumes/app_data/_data/ \\| head -5",`-rw-r--r-- 1 root root 412 app.log`,"err"],
 ["^docker inspect app --format=\"{{.Config.User}}\"",`(пусто) — root`,"err"],
 ["^grep -n \"USER\" Dockerfile",`(пусто)`,"err"],
 ["^sed -i s/FROM\\ nginx/FROM\\ nginx\\nUSER\\ nginx/ Dockerfile",`patched USER`,"ok"],
 ["^docker build -t app:user . && docker run -d --name app2 app:user",`started`,"ok"]
],
[{re:"^ls -l /var/lib/docker/volumes",l:"права файлов"},
 {re:"^docker inspect app --format.*User",l:"проверить User"},
 {re:"USER",l:"добавить USER"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: User namespace: контейнер пишет как root на хосте в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: права файлов → проверить User → добавить USER"]});

S("Docker","gdocker-12","Ограничение памяти: контейнер убит OOM","Middle", `<h3>Контекст</h3><p>Docker: <b>Ограничение памяти: контейнер убит OOM</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Ограничение памяти: контейнер убит OOM</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить OOM</li><li>[ ] потребление</li><li>[ ] поднять лимит</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker inspect app --format=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить OOM → потребление → поднять лимит.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker inspect app --format=\"{{.State.OOMKilled}}\"",`true`,"err"],
 ["^docker stats --no-stream \\| grep app",`app 298MiB / 300MiB`,"warn"],
 ["^docker update --memory 512m app",``, "ok"],
 ["^docker inspect app --format=\"{{.HostConfig.Memory}}\"",`536870912`,"ok"],
 ["^docker restart app && docker inspect app --format=\"{{.State.OOMKilled}}\"",`false`,"ok"]
],
[{re:"^docker inspect app --format.*OOMKilled",l:"проверить OOM"},
 {re:"^docker stats",l:"потребление"},
 {re:"^docker update --memory 512m",l:"поднять лимит"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Ограничение памяти: контейнер убит OOM в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить OOM → потребление → поднять лимит"]});

S("Docker","gdocker-13","Compose override: прод конфиг не применяется","Middle", `<h3>Контекст</h3><p>Docker: <b>Compose override: прод конфиг не применяется</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Compose override: прод конфиг не применяется</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить override</li><li>[ ] проверить мерж</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>cat compose.prod.yaml \\\\| grep</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить override → проверить мерж.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^cat compose.prod.yaml \\| grep image",`image: app:prod`,"ok"],
 ["^docker compose -f compose.yaml -f compose.prod.yaml config \\| grep image",`image: app:dev`,"err"],
 ["^cat compose.yaml \\| grep image",`image: app:dev`,"warn"],
 ["^docker compose -f compose.yaml -f compose.prod.yaml config --images",`app:prod`,"ok"]
],
[{re:"^cat compose.prod.yaml",l:"проверить override"},
 {re:"^docker compose.*config",l:"проверить мерж"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Compose override: прод конфиг не применяется в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить override → проверить мерж"]});

S("Docker","gdocker-14","Layer кеш инвалидируется из-за COPY . .","Senior", `<h3>Контекст</h3><p>Docker: <b>Layer кеш инвалидируется из-за COPY . .</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Layer кеш инвалидируется из-за COPY . .</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить порядок</li><li>[ ] проверить кеш</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>cat Dockerfile</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить порядок → проверить кеш.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^cat Dockerfile",`FROM node:20\nCOPY . .\nRUN npm ci`,"err"],
 ["^docker build -t app:1 . 2>&1 \\| grep CACHED",`(0 cached)`,"err"],
 ["^sed -i s/COPY\\.\\ ./COPY\\ package.json\\ .\\nRUN\\ npm\\ ci\\nCOPY\\ .\\ ./ Dockerfile",`patched`,"ok"],
 ["^docker build -t app:2 . 2>&1 \\| grep CACHED",`CACHED npm ci`,"ok"]
],
[{re:"^cat Dockerfile",l:"проверить порядок"},
 {re:"^docker build -t app",l:"проверить кеш"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Layer кеш инвалидируется из-за COPY . . в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить порядок → проверить кеш"]});

S("Docker","gdocker-15","Трим образов: удалить <none> и dangling","Junior", `<h3>Контекст</h3><p>Docker: <b>Трим образов: удалить <none> и dangling</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Трим образов: удалить <none> и dangling</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] список dangling</li><li>[ ] почистить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker images \\\\| grep none</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: список dangling → почистить.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker images \\| grep none",`<none> <none> a1b2c3 412M`,"warn"],
 ["^docker images -f dangling=true -q",`a1b2c3\nc4d5e6`,"warn"],
 ["^docker image prune -f",`Deleted: a1b2c3\nTotal reclaimed: 1.2GB`,"ok"],
 ["^docker images \\| grep none",`(пусто)`,"ok"]
],
[{re:"^docker images -f dangling=true",l:"список dangling"},
 {re:"^docker image prune -f",l:"почистить"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Трим образов: удалить <none> и dangling в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: список dangling → почистить"]});

S("Docker","gdocker-16","Privileged контейнер с --privileged — убрать","Senior", `<h3>Контекст</h3><p>Docker: <b>Privileged контейнер с --privileged — убрать</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Privileged контейнер с --privileged — убрать</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить privileged</li><li>[ ] найти в compose</li><li>[ ] заменить на cap_add</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker inspect app --format=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить privileged → найти в compose → заменить на cap_add.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker inspect app --format=\"{{.HostConfig.Privileged}}\"",`true`,"err"],
 ["^cat compose.yaml \\| grep privileged",`privileged: true`,"err"],
 ["^sed -i s/privileged:\\ true/cap_add:\\n\\ \\ \\ \\ -\\ SYS_PTRACE/ compose.yaml",`patched least privilege`,"ok"],
 ["^docker compose up -d",`recreated`,"ok"],
 ["^docker inspect app --format=\"{{.HostConfig.Privileged}}\"",`false`,"ok"]
],
[{re:"^docker inspect app --format.*Privileged",l:"проверить privileged"},
 {re:"privileged",l:"найти в compose"},
 {re:"cap_add",l:"заменить на cap_add"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Privileged контейнер с --privileged — убрать в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить privileged → найти в compose → заменить на cap_add"]});

S("Docker","gdocker-17","Logging driver json-file жрёт диск — ротация логов","Middle", `<h3>Контекст</h3><p>Docker: <b>Logging driver json-file жрёт диск — ротация логов</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Logging driver json-file жрёт диск — ротация логов</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти логи</li><li>[ ] проверить daemon.json</li><li>[ ] настроить ротацию</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>du -sh /var/lib/docker/contain</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти логи → проверить daemon.json → настроить ротацию.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^du -sh /var/lib/docker/containers/*/*.log 2>/dev/null \\| sort -h \\| tail -3",`8.2G json.log`,"err"],
 ["^cat /etc/docker/daemon.json \\| grep log",`(пусто)`,"err"],
 ["^cat > /etc/docker/daemon.json <<'EOF'\n{\n  \"log-driver\": \"json-file\",\n  \"log-opts\": { \"max-size\": \"10m\", \"max-file\": \"3\" }\n}",``, "ok"],
 ["^systemctl restart docker",``, "dim"],
 ["^docker inspect app --format=\"{{.HostConfig.LogConfig.MaxSize}}\"",`10m`,"ok"]
],
[{re:"^du -sh /var/lib/docker/containers",l:"найти логи"},
 {re:"^cat /etc/docker/daemon.json",l:"проверить daemon.json"},
 {re:"max-size",l:"настроить ротацию"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Logging driver json-file жрёт диск — ротация логов в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: найти логи → проверить daemon.json → настроить ротацию"]});

S("Docker","gdocker-18","Buildx: собрать multi-arch для arm64","Middle", `<h3>Контекст</h3><p>Docker: <b>Buildx: собрать multi-arch для arm64</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Buildx: собрать multi-arch для arm64</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] список builders</li><li>[ ] создать builder</li><li>[ ] собрать multi-arch</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker buildx ls \\\\| grep arm6</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: список builders → создать builder → собрать multi-arch.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker buildx ls \\| grep arm64",`(пусто)`,"warn"],
 ["^docker buildx create --name lab --driver docker-container --use",`Created lab`,"ok"],
 ["^docker buildx build --platform linux/amd64,linux/arm64 -t app:multi . --push 2>&1 \\| tail -5",`pushing manifest list`,"ok"],
 ["^docker buildx imagetools inspect app:multi \\| grep Platform",`Platform: linux/amd64\nPlatform: linux/arm64`,"ok"]
],
[{re:"^docker buildx ls",l:"список builders"},
 {re:"^docker buildx create",l:"создать builder"},
 {re:"^docker buildx build --platform",l:"собрать multi-arch"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Buildx: собрать multi-arch для arm64 в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: список builders → создать builder → собрать multi-arch"]});

S("Docker","gdocker-19","Секрет в ENV — виден в inspect","Senior", `<h3>Контекст</h3><p>Docker: <b>Секрет в ENV — виден в inspect</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Секрет в ENV — виден в inspect</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти утечку</li><li>[ ] найти в Dockerfile</li><li>[ ] перевести на env-file</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker inspect app --format=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти утечку → найти в Dockerfile → перевести на env-file.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker inspect app --format=\"{{.Config.Env}}\" \\| grep -i password",`DB_PASSWORD=s3cr3t`,"err"],
 ["^cat Dockerfile \\| grep ENV.*PASSWORD",`ENV DB_PASSWORD=s3cr3t`,"err"],
 ["^sed -i s/ENV\\ DB_PASSWORD.*// Dockerfile",`removed`,"ok"],
 ["^docker run -d --name app2 --env-file .env app:fix",`started`,"ok"],
 ["^docker inspect app2 --format=\"{{.Config.Env}}\" \\| grep PASSWORD",`(пусто)`,"ok"]
],
[{re:"^docker inspect app --format.*Env",l:"найти утечку"},
 {re:"ENV.*PASSWORD",l:"найти в Dockerfile"},
 {re:"--env-file",l:"перевести на env-file"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Секрет в ENV — виден в inspect в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: найти утечку → найти в Dockerfile → перевести на env-file"]});

S("Docker","gdocker-20","Network mode host vs bridge — порт не пробросился","Middle", `<h3>Контекст</h3><p>Docker: <b>Network mode host vs bridge — порт не пробросился</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Network mode host vs bridge — порт не пробросился</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить network mode</li><li>[ ] проверить проброс</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker inspect app --format=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить network mode → проверить проброс.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker inspect app --format=\"{{.HostConfig.NetworkMode}}\"",`host`,"warn"],
 ["^docker port app",`(пусто)`,"err"],
 ["^docker run -d --network bridge -p 8080:8080 app:fix",`started`,"ok"],
 ["^docker port app2",`8080/tcp -> 0.0.0.0:8080`,"ok"]
],
[{re:"^docker inspect app --format.*NetworkMode",l:"проверить network mode"},
 {re:"^docker port app",l:"проверить проброс"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Network mode host vs bridge — порт не пробросился в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить network mode → проверить проброс"]});

S("Docker","gdocker-21","Healthcheck в compose не работает — interval слишком большой","Middle", `<h3>Контекст</h3><p>Docker: <b>Healthcheck в compose не работает — interval слишком большой</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Healthcheck в compose не работает — interval слишком большой</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти интервал</li><li>[ ] уменьшить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>cat compose.yaml \\\\| grep -A3 </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти интервал → уменьшить.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^cat compose.yaml \\| grep -A3 healthcheck",`test: curl -f http://localhost:8080/healthz\ninterval: 30s`,"warn"],
 ["^docker inspect app --format=\"{{.State.Health}}\" \\| grep Interval",`30s`,"warn"],
 ["^sed -i s/interval:\\ 30s/interval:\\ 5s/ compose.yaml",``, "ok"],
 ["^docker compose up -d",`recreated`,"ok"]
],
[{re:"^cat compose.yaml.*healthcheck",l:"найти интервал"},
 {re:"^sed -i.*interval",l:"уменьшить"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Healthcheck в compose не работает — interval слишком большой в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: найти интервал → уменьшить"]});

S("Docker","gdocker-22","Корневая FS readonly — контейнер падает на записи","Middle", `<h3>Контекст</h3><p>Docker: <b>Корневая FS readonly — контейнер падает на записи</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Корневая FS readonly — контейнер падает на записи</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить readonly</li><li>[ ] включить read_only + tmpfs</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker inspect app --format=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить readonly → включить read_only + tmpfs.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker inspect app --format=\"{{.HostConfig.ReadonlyRootfs}}\"",`false`,"warn"],
 ["^docker logs app 2>&1 \\| grep -i \"Read-only file\"",`mkdir /tmp failed: Read-only file system`,"err"],
 ["^sed -i s/image:\\ app/image:\\ app\\n\\ \\ \\ \\ read_only:\\ true\\n\\ \\ \\ \\ tmpfs:\\n\\ \\ \\ \\ \\ \\ -\\ \\/tmp/ compose.yaml",`patched read_only`,"ok"],
 ["^docker compose up -d && docker inspect app --format=\"{{.HostConfig.ReadonlyRootfs}}\"",`true`,"ok"]
],
[{re:"^docker inspect app --format.*ReadonlyRootfs",l:"проверить readonly"},
 {re:"read_only",l:"включить read_only + tmpfs"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Корневая FS readonly — контейнер падает на записи в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить readonly → включить read_only + tmpfs"]});

S("Docker","gdocker-23","Registry mirror: pull тормозит без кеша","Middle", `<h3>Контекст</h3><p>Docker: <b>Registry mirror: pull тормозит без кеша</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Registry mirror: pull тормозит без кеша</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить daemon.json</li><li>[ ] добавить mirror</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>cat /etc/docker/daemon.json \\\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить daemon.json → добавить mirror.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^cat /etc/docker/daemon.json \\| grep mirror",`(пусто)`,"warn"],
 ["^cat > /etc/docker/daemon.json <<'EOF'\n{\n  \"registry-mirrors\": [\"https://mirror.corp.local\"]\n}",``, "ok"],
 ["^systemctl restart docker",``, "dim"],
 ["^docker pull nginx:1.27 2>&1 \\| tail -3",`Pulled from mirror.corp.local`,"ok"]
],
[{re:"^cat /etc/docker/daemon.json",l:"проверить daemon.json"},
 {re:"registry-mirrors",l:"добавить mirror"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Registry mirror: pull тормозит без кеша в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: проверить daemon.json → добавить mirror"]});

S("Docker","gdocker-24","Утечка контейнеров: 50 exited висит","Junior", `<h3>Контекст</h3><p>Docker: <b>Утечка контейнеров: 50 exited висит</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Утечка контейнеров: 50 exited висит</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] список exited</li><li>[ ] удалить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>docker ps -a --filter status=e</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: список exited → удалить.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^docker ps -a --filter status=exited \\| wc -l",`50`,"warn"],
 ["^docker ps -a --filter status=exited -q \\| head -5",`a1b2\nc3d4`,"dim"],
 ["^docker rm \\$(docker ps -a --filter status=exited -q)",`Removed 50`,"ok"],
 ["^docker ps -a --filter status=exited \\| wc -l",`0`,"ok"]
],
[{re:"^docker ps -a --filter status=exited",l:"список exited"},
 {re:"^docker rm",l:"удалить"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Утечка контейнеров: 50 exited висит в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: список exited → удалить"]});

S("Docker","gdocker-25","Hadolint: линтер ругается на DL3008 pin versions","Junior", `<h3>Контекст</h3><p>Docker: <b>Hadolint: линтер ругается на DL3008 pin versions</b>. Работа с <code>Dockerfile</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Hadolint: линтер ругается на DL3008 pin versions</b>. Файл <code>Dockerfile</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] прогнать линтер</li><li>[ ] запинить версию</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>Dockerfile</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>Dockerfile</code>, <code>app.py</code>. Активный файл открыт в редакторе. Начните с <code>hadolint Dockerfile 2>&1 \\\\| h</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: прогнать линтер → запинить версию.</p><h3>Проверка</h3><pre>cat Dockerfile<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^hadolint Dockerfile 2>&1 \\| head -10",`DL3008 Pin versions in apt get install`,"err"],
 ["^cat Dockerfile \\| grep apt-get install",`RUN apt-get update && apt-get install -y curl`,"warn"],
 ["^sed -i s/apt-get\\ install\\ -y\\ curl/apt-get\\ install\\ -y\\ curl=7.88.1-10/ Dockerfile",`pinned`,"ok"],
 ["^hadolint Dockerfile",`OK`,"ok"]
],
[{re:"^hadolint Dockerfile",l:"прогнать линтер"},
 {re:"apt-get install",l:"запинить версию"}],{file:"Dockerfile",files:{"Dockerfile":`FROM python:3.11\nCOPY . .\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`},checks:[{re:/distroless/,l:"distroless"}],solutionFiles:{"Dockerfile":`FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD [\"python\",\"app.py\"]\n`,"app.py":`print(\"hi\")\n`}},{hints:["Симптом: Hadolint: линтер ругается на DL3008 pin versions в Dockerfile. Ищи причину в коде/конфиге этого файла.","Открой Dockerfile в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat Dockerfile.","Порядок: прогнать линтер → запинить версию"]});
