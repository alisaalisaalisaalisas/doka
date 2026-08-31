/* Global Playground: Helm / Kustomize — 25 scenarios */
S("Helm","ghelm-1","helm lint: undefined variable .Values.replicaCount","Middle", `<h3>Контекст</h3><p>Helm: <b>helm lint: undefined variable .Values.replicaCount</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm lint: undefined variable .Values.replicaCount</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] прогнать lint</li><li>[ ] отрендерить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm lint chart/ 2>&1 \\\\| head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: прогнать lint → отрендерить.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm lint chart/ 2>&1 \\| head -20",`\\[ERROR\\] templates/deploy.yaml: nil pointer evaluating interface {}.replicaCount`,"err"],
 ["^cat chart/values.yaml \\| grep replicaCount",`(пусто)`,"err"],
 ["^sed -i s/replicaCount/replicaCount:\\ 2/ chart/values.yaml",`patched`,"ok"],
 ["^helm lint chart/",`0 chart\\(s\\) failed`,"ok"],
 ["^helm template chart/ \\| head -30",`apiVersion: apps/v1`,"ok"]
],
[{re:"^helm lint chart/",l:"прогнать lint"},
 {re:"^helm template chart/",l:"отрендерить"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm lint: undefined variable .Values.replicaCount\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm lint: undefined variable .Values.replicaCount — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm lint: undefined variable .Values.replicaCount в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: прогнать lint → отрендерить"]});

S("Helm","ghelm-2","helm upgrade сломал релиз — rollback","Middle", `<h3>Контекст</h3><p>Helm: <b>helm upgrade сломал релиз — rollback</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm upgrade сломал релиз — rollback</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус релиза</li><li>[ ] история</li><li>[ ] откат</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm list -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус релиза → история → откат.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm list -n prod",`NAME STATUS CHART\napi failed api-2.1.0`,"err"],
 ["^helm history api -n prod",`REVISION 1 deployed\nREVISION 2 failed`,"warn"],
 ["^helm rollback api 1 -n prod",`Rollback was a success!`,"ok"],
 ["^helm list -n prod",`api deployed api-2.0.0`,"ok"]
],
[{re:"^helm list -n prod",l:"статус релиза"},
 {re:"^helm history api -n prod",l:"история"},
 {re:"^helm rollback api 1 -n prod",l:"откат"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm upgrade сломал релиз — rollback\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm upgrade сломал релиз — rollback — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm upgrade сломал релиз — rollback в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: статус релиза → история → откат"]});

S("Helm","ghelm-3","helm values: приоритет --set vs values.yaml","Middle", `<h3>Контекст</h3><p>Helm: <b>helm values: приоритет --set vs values.yaml</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm values: приоритет --set vs values.yaml</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить приоритет файлов</li><li>[ ] оверрайд через --set</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat chart/values.yaml \\\\| grep</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить приоритет файлов → оверрайд через --set.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat chart/values.yaml \\| grep replicas",`replicaCount: 5`,"ok"],
 ["^cat values-prod.yaml \\| grep replica",`replicaCount: 3`,"ok"],
 ["^helm template chart/ -f values-prod.yaml \\| grep replicas",`replicas: 3`,"ok"],
 ["^helm template chart/ -f values-prod.yaml --set replicaCount=7 \\| grep replicas",`replicas: 7`,"ok"]
],
[{re:"^helm template chart/ -f values-prod.yaml",l:"проверить приоритет файлов"},
 {re:"--set replicaCount=7",l:"оверрайд через --set"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm values: приоритет --set vs values.yaml\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm values: приоритет --set vs values.yaml — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm values: приоритет --set vs values.yaml в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: проверить приоритет файлов → оверрайд через --set"]});

S("Helm","ghelm-4","helm dependency: Chart.yaml требует postgres 12, но локально 11","Middle", `<h3>Контекст</h3><p>Helm: <b>helm dependency: Chart.yaml требует postgres 12, но локально 11</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm dependency: Chart.yaml требует postgres 12, но локально 11</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] список зависимостей</li><li>[ ] обновить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat Chart.yaml \\\\| grep -A2 de</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: список зависимостей → обновить.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat Chart.yaml \\| grep -A2 dependencies",`name: postgresql\n  version: 12.1.2\n  repository: https://charts.bitnami.com`,"ok"],
 ["^helm dependency list",`postgresql 11.9.13 outdated`,"warn"],
 ["^helm dependency update",`Saving 12.1.2`,"ok"],
 ["^helm dependency list",`postgresql 12.1.2 ok`,"ok"]
],
[{re:"^helm dependency list",l:"список зависимостей"},
 {re:"^helm dependency update",l:"обновить"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm dependency: Chart.yaml требует postgres 12, но локально 11\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm dependency: Chart.yaml требует postgres 12, но локально 11 — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm dependency: Chart.yaml требует postgres 12, но локально 11 в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: список зависимостей → обновить"]});

S("Helm","ghelm-5","helm hook: pre-install job не отработал — релиз pending-install","Senior", `<h3>Контекст</h3><p>Helm: <b>helm hook: pre-install job не отработал — релиз pending-install</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm hook: pre-install job не отработал — релиз pending-install</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус pending-install</li><li>[ ] лог хука</li><li>[ ] очистить зависший релиз</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm list -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус pending-install → лог хука → очистить зависший релиз.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm list -n prod",`api pending-install`,"err"],
 ["^kubectl -n prod get jobs \\| grep pre-install",`api-pre-install 0/1 Error`,"err"],
 ["^kubectl -n prod logs job/api-pre-install 2>&1 \\| tail -10",`migration failed: connection refused db`,"err"],
 ["^helm uninstall api -n prod",`release "api" uninstalled`,"ok"],
 ["^kubectl -n prod get jobs",`(пусто)`,"ok"]
],
[{re:"^helm list -n prod",l:"статус pending-install"},
 {re:"^kubectl -n prod logs job/api-pre-install",l:"лог хука"},
 {re:"^helm uninstall api -n prod",l:"очистить зависший релиз"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm hook: pre-install job не отработал — релиз pending-install\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm hook: pre-install job не отработал — релиз pending-install — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm hook: pre-install job не отработал — релиз pending-install в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: статус pending-install → лог хука → очистить зависший релиз"]});

S("Helm","ghelm-6","helm test: проверить деплой smoke-тестом","Junior", `<h3>Контекст</h3><p>Helm: <b>helm test: проверить деплой smoke-тестом</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm test: проверить деплой smoke-тестом</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] запустить тесты релиза</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm test api -n prod 2>&1 \\\\|</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: запустить тесты релиза.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm test api -n prod 2>&1 \\| tail -10",`RUNNING: api-test-connection\nPASSED`,"ok"],
 ["^kubectl -n prod get pods -l helm.sh/hook=test",`api-test-connection Completed`,"ok"]
],
[{re:"^helm test api -n prod",l:"запустить тесты релиза"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm test: проверить деплой smoke-тестом\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm test: проверить деплой smoke-тестом — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm test: проверить деплой smoke-тестом в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: запустить тесты релиза"]});

S("Helm","ghelm-7","helm create: scaffold нового чарта","Junior", `<h3>Контекст</h3><p>Helm: <b>helm create: scaffold нового чарта</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm create: scaffold нового чарта</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать чарт</li><li>[ ] проверить scaffold</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm create myapp</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать чарт → проверить scaffold.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm create myapp",`Creating myapp`,"ok"],
 ["^ls myapp/ \\| head -10",`Chart.yaml\nvalues.yaml\ntemplates`,"ok"],
 ["^helm lint myapp/",`0 chart\\(s\\) failed`,"ok"]
],
[{re:"^helm create myapp",l:"создать чарт"},
 {re:"^helm lint myapp/",l:"проверить scaffold"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm create: scaffold нового чарта\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm create: scaffold нового чарта — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm create: scaffold нового чарта в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: создать чарт → проверить scaffold"]});

S("Helm","ghelm-8","helm pull OCI: скачать чарт из registry.corp","Middle", `<h3>Контекст</h3><p>Helm: <b>helm pull OCI: скачать чарт из registry.corp</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm pull OCI: скачать чарт из registry.corp</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] скачать чарт</li><li>[ ] посмотреть values</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm pull oci://registry\\\\.cor</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: скачать чарт → посмотреть values.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm pull oci://registry\\.corp/charts/api --version 2\\.5\\.0",`Pulled: api:2.5.0`,"ok"],
 ["^ls api-2\\.5\\.0\\.tgz",`api-2.5.0.tgz`,"ok"],
 ["^helm show values oci://registry\\.corp/charts/api --version 2\\.5\\.0 \\| head -20",`replicaCount: 2`,"ok"]
],
[{re:"^helm pull oci://registry",l:"скачать чарт"},
 {re:"^helm show values",l:"посмотреть values"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm pull OCI: скачать чарт из registry.corp\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm pull OCI: скачать чарт из registry.corp — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm pull OCI: скачать чарт из registry.corp в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: скачать чарт → посмотреть values"]});

S("Helm","ghelm-9","helm upgrade --atomic: авто-откат при падении","Senior", `<h3>Контекст</h3><p>Helm: <b>helm upgrade --atomic: авто-откат при падении</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm upgrade --atomic: авто-откат при падении</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] upgrade с atomic</li><li>[ ] проверить что не stuck</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm upgrade api chart/ -n pro</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: upgrade с atomic → проверить что не stuck.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm upgrade api chart/ -n prod --atomic --timeout 2m",`Error: timed out waiting for deployment`,"err"],
 ["^helm list -n prod \\| grep api",`api deployed (откатился атомарно)`,"ok"],
 ["^helm history api -n prod \\| tail -2",`superseded -> deployed \\(rollback\\)`,"ok"]
],
[{re:"^helm upgrade api chart/ -n prod --atomic",l:"upgrade с atomic"},
 {re:"^helm list -n prod",l:"проверить что не stuck"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm upgrade --atomic: авто-откат при падении\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm upgrade --atomic: авто-откат при падении — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm upgrade --atomic: авто-откат при падении в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: upgrade с atomic → проверить что не stuck"]});

S("Helm","ghelm-10","helm secrets с SOPS: зашифровать values","Senior", `<h3>Контекст</h3><p>Helm: <b>helm secrets с SOPS: зашифровать values</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm secrets с SOPS: зашифровать values</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] просмотр шифрования</li><li>[ ] депплой через secrets</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm secrets view values-prod.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: просмотр шифрования → депплой через secrets.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm secrets view values-prod.yaml 2>&1 \\| head -5",`DB_PASS: ENC\\[AES256_GCM,...\\]`,"ok"],
 ["^sops --decrypt values-prod.yaml \\| grep DB_PASS",`DB_PASS: s3cr3t`,"ok"],
 ["^helm secrets upgrade api chart/ -f values-prod.yaml -n prod",`deployed`,"ok"]
],
[{re:"^helm secrets view values-prod.yaml",l:"просмотр шифрования"},
 {re:"^helm secrets upgrade api chart/",l:"депплой через secrets"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm secrets с SOPS: зашифровать values\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm secrets с SOPS: зашифровать values — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm secrets с SOPS: зашифровать values в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: просмотр шифрования → депплой через secrets"]});

S("Helm","ghelm-11","helm NOTES.txt не показывает ingress host","Junior", `<h3>Контекст</h3><p>Helm: <b>helm NOTES.txt не показывает ingress host</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm NOTES.txt не показывает ingress host</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать NOTES</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm get notes api -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать NOTES.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm get notes api -n prod",`Get application URL: http://api.corp.local`,"ok"],
 ["^cat chart/templates/NOTES.txt \\| head -10",`1. Get the application URL by running...`,"dim"]
],
[{re:"^helm get notes api -n prod",l:"показать NOTES"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm NOTES.txt не показывает ingress host\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm NOTES.txt не показывает ingress host — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm NOTES.txt не показывает ingress host в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: показать NOTES"]});

S("Helm","ghelm-12","CRDs: helm не обновляет CRD — нужно вручную","Senior", `<h3>Контекст</h3><p>Helm: <b>CRDs: helm не обновляет CRD — нужно вручную</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>CRDs: helm не обновляет CRD — нужно вручную</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить версию CRD</li><li>[ ] обновить CRD вручную</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get crd servicemonitor</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить версию CRD → обновить CRD вручную.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get crd servicemonitors.monitoring.coreos.com -o yaml \\| grep version",`version: v1 (old)`,"warn"],
 ["^helm upgrade monitoring prometheus-community/kube-prometheus-stack -n monitoring 2>&1 \\| grep CRD",`CRD not upgraded`,"warn"],
 ["^kubectl apply -f chart/crds/",`customresourcedefinition.apiextensions.k8s.io/servicemonitors updated`,"ok"]
],
[{re:"^kubectl get crd servicemonitors",l:"проверить версию CRD"},
 {re:"^kubectl apply -f chart/crds/",l:"обновить CRD вручную"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: CRDs: helm не обновляет CRD — нужно вручную\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: CRDs: helm не обновляет CRD — нужно вручную — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: CRDs: helm не обновляет CRD — нужно вручную в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: проверить версию CRD → обновить CRD вручную"]});

S("Helm","ghelm-13","helm list --filter по состоянию failed","Middle", `<h3>Контекст</h3><p>Helm: <b>helm list --filter по состоянию failed</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm list --filter по состоянию failed</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] список failed</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm list -A --failed</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: список failed.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm list -A --failed",`api failed prod\nworker failed batch`,"ok"],
 ["^helm list -A --pending",`(пусто)`,"ok"]
],
[{re:"^helm list -A --failed",l:"список failed"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm list --filter по состоянию failed\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm list --filter по состоянию failed — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm list --filter по состоянию failed в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: список failed"]});

S("Helm","ghelm-14","helm uninstall оставляет PVC — почистить","Middle", `<h3>Контекст</h3><p>Helm: <b>helm uninstall оставляет PVC — почистить</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm uninstall оставляет PVC — почистить</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] удалить релиз</li><li>[ ] проверить PVC</li><li>[ ] удалить PVC</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm uninstall db -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: удалить релиз → проверить PVC → удалить PVC.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm uninstall db -n prod",`release "db" uninstalled`,"ok"],
 ["^kubectl get pvc -n prod",`data-db-0 Bound`,"warn"],
 ["^kubectl delete pvc data-db-0 -n prod",`persistentvolumeclaim "data-db-0" deleted`,"ok"]
],
[{re:"^helm uninstall db -n prod",l:"удалить релиз"},
 {re:"^kubectl get pvc -n prod",l:"проверить PVC"},
 {re:"^kubectl delete pvc data-db-0 -n prod",l:"удалить PVC"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm uninstall оставляет PVC — почистить\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm uninstall оставляет PVC — почистить — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm uninstall оставляет PVC — почистить в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: удалить релиз → проверить PVC → удалить PVC"]});

S("Helm","ghelm-15","helm show chart: посмотреть Chart.yaml удалённого чарта","Junior", `<h3>Контекст</h3><p>Helm: <b>helm show chart: посмотреть Chart.yaml удалённого чарта</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm show chart: посмотреть Chart.yaml удалённого чарта</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать Chart.yaml</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm show chart oci://registry</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать Chart.yaml.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm show chart oci://registry\\.corp/charts/api \\| grep appVersion",`appVersion: "2.5.0"`,"ok"]
],
[{re:"^helm show chart oci://registry",l:"показать Chart.yaml"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm show chart: посмотреть Chart.yaml удалённого чарта\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm show chart: посмотреть Chart.yaml удалённого чарта — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm show chart: посмотреть Chart.yaml удалённого чарта в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: показать Chart.yaml"]});

S("Kustomize","ghelm-16","Kustomize: overlay prod меняет replicas и image","Middle", `<h3>Контекст</h3><p>Kustomize: <b>Kustomize: overlay prod меняет replicas и image</b>. Работа с <code>project/kustomize-overl.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kustomize: overlay prod меняет replicas и image</b>. Файл <code>project/kustomize-overl.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] рендер overlay</li><li>[ ] diff перед apply</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kustomize-overl.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kustomize-overl.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl kustomize overlays/pro</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: рендер overlay → diff перед apply.</p><h3>Проверка</h3><pre>cat project/kustomize-overl.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl kustomize overlays/prod \\| grep -A2 replicas",`replicas: 5`,"ok"],
 ["^kubectl kustomize overlays/prod \\| grep image",`image: registry.corp/api:2.5.0`,"ok"],
 ["^kubectl diff -k overlays/prod 2>&1 \\| head -20",`- replicas: 2\n+ replicas: 5`,"ok"],
 ["^kubectl apply -k overlays/prod",`deployment.apps/api configured`,"ok"]
],
[{re:"^kubectl kustomize overlays/prod",l:"рендер overlay"},
 {re:"^kubectl diff -k overlays/prod",l:"diff перед apply"}],{file:"project/kustomize-overl.yaml",files:{"project/kustomize-overl.yaml":`# Kustomize: Kustomize: overlay prod меняет replicas и image\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kustomize-overl.yaml":`# Kustomize: Kustomize: overlay prod меняет replicas и image — fixed\nstatus: ok\n`}},{hints:["Симптом: Kustomize: overlay prod меняет replicas и image в project/kustomize-overl.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kustomize-overl.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kustomize-overl.yaml.","Порядок: рендер overlay → diff перед apply"]});

S("Kustomize","ghelm-17","Kustomize: patchStrategicMerge меняет env","Middle", `<h3>Контекст</h3><p>Kustomize: <b>Kustomize: patchStrategicMerge меняет env</b>. Работа с <code>project/kustomize-patch.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kustomize: patchStrategicMerge меняет env</b>. Файл <code>project/kustomize-patch.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить патчи</li><li>[ ] рендер</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kustomize-patch.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kustomize-patch.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat overlays/prod/patch-env.ya</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить патчи → рендер.</p><h3>Проверка</h3><pre>cat project/kustomize-patch.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat overlays/prod/patch-env.yaml \\| head -20",`- op: add\n  path: /spec/template/spec/containers/0/env/-`,"ok"],
 ["^cat kustomization.yaml \\| grep patchesStrategicMerge -A3",`patchesStrategicMerge:\n- patch-env.yaml`,"ok"],
 ["^kubectl kustomize . \\| grep -A2 ENV",`ENV: prod`,"ok"]
],
[{re:"^cat kustomization.yaml.*patchesStrategicMerge",l:"проверить патчи"},
 {re:"^kubectl kustomize .",l:"рендер"}],{file:"project/kustomize-patch.yaml",files:{"project/kustomize-patch.yaml":`# Kustomize: Kustomize: patchStrategicMerge меняет env\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kustomize-patch.yaml":`# Kustomize: Kustomize: patchStrategicMerge меняет env — fixed\nstatus: ok\n`}},{hints:["Симптом: Kustomize: patchStrategicMerge меняет env в project/kustomize-patch.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kustomize-patch.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kustomize-patch.yaml.","Порядок: проверить патчи → рендер"]});

S("Kustomize","ghelm-18","Kustomize images: переопределить тег","Junior", `<h3>Контекст</h3><p>Kustomize: <b>Kustomize images: переопределить тег</b>. Работа с <code>project/kustomize-image.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kustomize images: переопределить тег</b>. Файл <code>project/kustomize-image.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить images</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kustomize-image.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kustomize-image.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat kustomization.yaml \\\\| gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить images.</p><h3>Проверка</h3><pre>cat project/kustomize-image.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat kustomization.yaml \\| grep -A3 images",`images:\n- name: api\n  newTag: 2.5.0`,"ok"],
 ["^kubectl kustomize . \\| grep image:",`image: registry.corp/api:2.5.0`,"ok"]
],
[{re:"^cat kustomization.yaml.*images",l:"проверить images"}],{file:"project/kustomize-image.yaml",files:{"project/kustomize-image.yaml":`# Kustomize: Kustomize images: переопределить тег\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kustomize-image.yaml":`# Kustomize: Kustomize images: переопределить тег — fixed\nstatus: ok\n`}},{hints:["Симптом: Kustomize images: переопределить тег в project/kustomize-image.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kustomize-image.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kustomize-image.yaml.","Порядок: проверить images"]});

S("Kustomize","ghelm-19","Kustomize configMapGenerator: хеш суффикс","Middle", `<h3>Контекст</h3><p>Kustomize: <b>Kustomize configMapGenerator: хеш суффикс</b>. Работа с <code>project/kustomize-confi.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kustomize configMapGenerator: хеш суффикс</b>. Файл <code>project/kustomize-confi.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить генератор</li><li>[ ] увидеть хеш</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kustomize-confi.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kustomize-confi.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat kustomization.yaml \\\\| gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить генератор → увидеть хеш.</p><h3>Проверка</h3><pre>cat project/kustomize-confi.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat kustomization.yaml \\| grep -A3 configMapGenerator",`configMapGenerator:\n- name: app-config\n  files: [app.yaml]`,"ok"],
 ["^kubectl kustomize . \\| grep app-config -A2",`name: app-config-7h8k9m`,"ok"],
 ["^kubectl apply -k .",`configmap/app-config-7h8k9m created`,"ok"]
],
[{re:"configMapGenerator",l:"проверить генератор"},
 {re:"^kubectl kustomize .",l:"увидеть хеш"}],{file:"project/kustomize-confi.yaml",files:{"project/kustomize-confi.yaml":`# Kustomize: Kustomize configMapGenerator: хеш суффикс\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kustomize-confi.yaml":`# Kustomize: Kustomize configMapGenerator: хеш суффикс — fixed\nstatus: ok\n`}},{hints:["Симптом: Kustomize configMapGenerator: хеш суффикс в project/kustomize-confi.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kustomize-confi.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kustomize-confi.yaml.","Порядок: проверить генератор → увидеть хеш"]});

S("Kustomize","ghelm-20","Kustomize helmCharts inflator: задеплоить битнами чарт","Senior", `<h3>Контекст</h3><p>Kustomize: <b>Kustomize helmCharts inflator: задеплоить битнами чарт</b>. Работа с <code>project/kustomize-helmc.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kustomize helmCharts inflator: задеплоить битнами чарт</b>. Файл <code>project/kustomize-helmc.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить inflator</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kustomize-helmc.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kustomize-helmc.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat kustomization.yaml \\\\| gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить inflator.</p><h3>Проверка</h3><pre>cat project/kustomize-helmc.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat kustomization.yaml \\| grep -A5 helmCharts",`helmCharts:\n- name: postgresql\n  repo: https://charts.bitnami.com`,"ok"],
 ["^kubectl kustomize . --enable-helm \\| grep -A2 postgresql",`kind: StatefulSet`,"ok"]
],
[{re:"helmCharts",l:"проверить inflator"}],{file:"project/kustomize-helmc.yaml",files:{"project/kustomize-helmc.yaml":`# Kustomize: Kustomize helmCharts inflator: задеплоить битнами чарт\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kustomize-helmc.yaml":`# Kustomize: Kustomize helmCharts inflator: задеплоить битнами чарт — fixed\nstatus: ok\n`}},{hints:["Симптом: Kustomize helmCharts inflator: задеплоить битнами чарт в project/kustomize-helmc.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kustomize-helmc.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kustomize-helmc.yaml.","Порядок: проверить inflator"]});

S("Kustomize","ghelm-21","Kustomize: build без кластера — dry-run","Junior", `<h3>Контекст</h3><p>Kustomize: <b>Kustomize: build без кластера — dry-run</b>. Работа с <code>project/kustomize-build.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kustomize: build без кластера — dry-run</b>. Файл <code>project/kustomize-build.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] build</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kustomize-build.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kustomize-build.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kustomize build overlays/prod </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: build.</p><h3>Проверка</h3><pre>cat project/kustomize-build.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kustomize build overlays/prod \\| head -30",`apiVersion: apps/v1\nkind: Deployment`,"ok"]
],
[{re:"^kustomize build overlays/prod",l:"build"}],{file:"project/kustomize-build.yaml",files:{"project/kustomize-build.yaml":`# Kustomize: Kustomize: build без кластера — dry-run\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kustomize-build.yaml":`# Kustomize: Kustomize: build без кластера — dry-run — fixed\nstatus: ok\n`}},{hints:["Симптом: Kustomize: build без кластера — dry-run в project/kustomize-build.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kustomize-build.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kustomize-build.yaml.","Порядок: build"]});

S("Helm","ghelm-22","helm --set-string: сохранить ведущие нули","Middle", `<h3>Контекст</h3><p>Helm: <b>helm --set-string: сохранить ведущие нули</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm --set-string: сохранить ведущие нули</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] правильный флаг для строк</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm template chart/ --set pin</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: правильный флаг для строк.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm template chart/ --set pin=00123 \\| grep pin",`pin: 123`,"err"],
 ["^helm template chart/ --set-string pin=00123 \\| grep pin",`pin: "00123"`,"ok"]
],
[{re:"--set-string pin=00123",l:"правильный флаг для строк"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm --set-string: сохранить ведущие нули\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm --set-string: сохранить ведущие нули — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm --set-string: сохранить ведущие нули в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: правильный флаг для строк"]});

S("Helm","ghelm-23","helm repo update падает — нет интернета","Middle", `<h3>Контекст</h3><p>Helm: <b>helm repo update падает — нет интернета</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm repo update падает — нет интернета</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] обновить репо</li><li>[ ] список репо</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm repo update 2>&1 \\\\| head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: обновить репо → список репо.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm repo update 2>&1 \\| head -5",`Error: failed to fetch https://charts.bitnami.com/index.yaml: timeout`,"err"],
 ["^helm repo list \\| grep bitnami",`bitnami https://charts.bitnami.com/bitnami`,"ok"],
 ["^curl -I https://charts.bitnami.com/index.yaml 2>&1 \\| head -5",`HTTP/1.1 200`,"ok"]
],
[{re:"^helm repo update",l:"обновить репо"},
 {re:"^helm repo list",l:"список репо"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm repo update падает — нет интернета\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm repo update падает — нет интернета — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm repo update падает — нет интернета в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: обновить репо → список репо"]});

S("Helm","ghelm-24","kustomize edit set image: быстро поменять тег","Junior", `<h3>Контекст</h3><p>Helm: <b>kustomize edit set image: быстро поменять тег</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>kustomize edit set image: быстро поменять тег</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] сменить тег</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kustomize edit set image api=r</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: сменить тег.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kustomize edit set image api=registry\\.corp/api:2\\.6\\.0",``, "ok"],
 ["^cat kustomization.yaml \\| grep -A2 images",`newTag: 2.6.0`,"ok"]
],
[{re:"^kustomize edit set image api=",l:"сменить тег"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: kustomize edit set image: быстро поменять тег\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: kustomize edit set image: быстро поменять тег — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: kustomize edit set image: быстро поменять тег в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: сменить тег"]});

S("Helm","ghelm-25","helm diff plugin: посмотреть diff перед upgrade","Middle", `<h3>Контекст</h3><p>Helm: <b>helm diff plugin: посмотреть diff перед upgrade</b>. Работа с <code>helm/Chart.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>helm diff plugin: посмотреть diff перед upgrade</b>. Файл <code>helm/Chart.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] diff перед upgrade</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>helm/Chart.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>helm/Chart.yaml</code>, <code>helm/values.yaml</code>. Активный файл открыт в редакторе. Начните с <code>helm diff upgrade api chart/ -</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: diff перед upgrade.</p><h3>Проверка</h3><pre>cat helm/Chart.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^helm diff upgrade api chart/ -n prod 2>&1 \\| head -30",`prod, api, Deployment (apps) has changed:\n- replicas: 2\n+ replicas: 5`,"ok"],
 ["^helm plugin list \\| grep diff",`diff 3.9.0`,"ok"]
],
[{re:"^helm diff upgrade api chart/",l:"diff перед upgrade"}],{file:"helm/values.yaml",files:{"helm/Chart.yaml":`# Helm: helm diff plugin: посмотреть diff перед upgrade\nstatus: broken\n`,"helm/values.yaml":`replicas: 1\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"helm/Chart.yaml":`# Helm: helm diff plugin: посмотреть diff перед upgrade — fixed\nstatus: ok\n`,"helm/values.yaml":`replicas: 3\n`}},{hints:["Симптом: helm diff plugin: посмотреть diff перед upgrade в helm/Chart.yaml. Ищи причину в коде/конфиге этого файла.","Открой helm/Chart.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat helm/Chart.yaml.","Порядок: diff перед upgrade"]});
