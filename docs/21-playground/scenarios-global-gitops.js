/* Global Playground: GitOps / CI (ArgoCD, Flux, GitLab CI, GitHub Actions) — 25 scenarios */
S("ArgoCD","ggitops-1","OutOfSync: ручной scale vs Git (replicas 7 vs 3)","Middle", `<h3>Контекст</h3><p>ArgoCD: <b>OutOfSync: ручной scale vs Git (replicas 7 vs 3)</b>. Работа с <code>project/outofsync-scale.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>OutOfSync: ручной scale vs Git (replicas 7 vs 3)</b>. Файл <code>project/outofsync-scale.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть дрейф</li><li>[ ] синхронизировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/outofsync-scale.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/outofsync-scale.yaml</code>. Активный файл открыт в редакторе. Начните с <code>argocd app get api 2>&1 \\\\| gr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть дрейф → синхронизировать.</p><h3>Проверка</h3><pre>cat project/outofsync-scale.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^argocd app get api 2>&1 \\| grep -A2 Sync",`Sync Status: OutOfSync\n  git: 3  cluster: 7`,"err"],
 ["^kubectl get deploy api -n prod -o jsonpath=\"{.spec.replicas}\"",`7`,"warn"],
 ["^argocd app sync api",`Synced`,"ok"],
 ["^argocd app get api 2>&1 \\| grep -A2 Sync",`Sync Status: Synced`,"ok"],
 ["^kubectl get deploy api -n prod -o jsonpath=\"{.spec.replicas}\"",`3`,"ok"]
],
[{re:"^argocd app get api",l:"увидеть дрейф"},
 {re:"^argocd app sync api",l:"синхронизировать"}],{file:"project/outofsync-scale.yaml",files:{"project/outofsync-scale.yaml":`# ArgoCD: OutOfSync: ручной scale vs Git (replicas 7 vs 3)\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/outofsync-scale.yaml":`# ArgoCD: OutOfSync: ручной scale vs Git (replicas 7 vs 3) — fixed\nstatus: ok\n`}},{hints:["Симптом: OutOfSync: ручной scale vs Git (replicas 7 vs 3) в project/outofsync-scale.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/outofsync-scale.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/outofsync-scale.yaml.","Порядок: увидеть дрейф → синхронизировать"]});

S("ArgoCD","ggitops-2","Self-heal: scale 7 откатился в 3","Middle", `<h3>Контекст</h3><p>ArgoCD: <b>Self-heal: scale 7 откатился в 3</b>. Работа с <code>project/self-heal-scale.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Self-heal: scale 7 откатился в 3</b>. Файл <code>project/self-heal-scale.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] внести дрейф</li><li>[ ] проверить selfHeal</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/self-heal-scale.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/self-heal-scale.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl scale deploy api --rep</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: внести дрейф → проверить selfHeal.</p><h3>Проверка</h3><pre>cat project/self-heal-scale.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl scale deploy api --replicas=7 -n prod",`deployment.apps/api scaled`,"dim"],
 ["^sleep 30 && kubectl get deploy api -n prod -o jsonpath=\"{.spec.replicas}\"",`3`,"ok"],
 ["^argocd app get api 2>&1 \\| grep -A2 Health",`Health Status: Healthy`,"ok"]
],
[{re:"^kubectl scale deploy api --replicas=7",l:"внести дрейф"},
 {re:"^kubectl get deploy api -n prod -o jsonpath",l:"проверить selfHeal"}],{file:"project/self-heal-scale.yaml",files:{"project/self-heal-scale.yaml":`# ArgoCD: Self-heal: scale 7 откатился в 3\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/self-heal-scale.yaml":`# ArgoCD: Self-heal: scale 7 откатился в 3 — fixed\nstatus: ok\n`}},{hints:["Симптом: Self-heal: scale 7 откатился в 3 в project/self-heal-scale.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/self-heal-scale.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/self-heal-scale.yaml.","Порядок: внести дрейф → проверить selfHeal"]});

S("ArgoCD","ggitops-3","Sync wave: миграция перед деплоем","Senior", `<h3>Контекст</h3><p>ArgoCD: <b>Sync wave: миграция перед деплоем</b>. Работа с <code>project/sync-wave-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sync wave: миграция перед деплоем</b>. Файл <code>project/sync-wave-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] sync с wave</li><li>[ ] история волн</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sync-wave-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sync-wave-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get jobs -n prod -l ap</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: sync с wave → история волн.</p><h3>Проверка</h3><pre>cat project/sync-wave-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get jobs -n prod -l app=migrate",`migrate-xxx Completed`,"ok"],
 ["^argocd app history api 2>&1 \\| tail -5",`REVISION wave -1 migrate Completed`,"ok"],
 ["^argocd app sync api --strategy hook 2>&1 \\| tail -10",`migrate Job wave -1 -> Completed`,"ok"]
],
[{re:"^argocd app sync api --strategy hook",l:"sync с wave"},
 {re:"^argocd app history api",l:"история волн"}],{file:"project/sync-wave-.yaml",files:{"project/sync-wave-.yaml":`# ArgoCD: Sync wave: миграция перед деплоем\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sync-wave-.yaml":`# ArgoCD: Sync wave: миграция перед деплоем — fixed\nstatus: ok\n`}},{hints:["Симптом: Sync wave: миграция перед деплоем в project/sync-wave-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sync-wave-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sync-wave-.yaml.","Порядок: sync с wave → история волн"]});

S("ArgoCD","ggitops-4","ApplicationSets: шаблон для 10 кластеров","Senior", `<h3>Контекст</h3><p>ArgoCD: <b>ApplicationSets: шаблон для 10 кластеров</b>. Работа с <code>project/applicationsets.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ApplicationSets: шаблон для 10 кластеров</b>. Файл <code>project/applicationsets.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить генератор</li><li>[ ] список сетов</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/applicationsets.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/applicationsets.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get applicationset -n </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить генератор → список сетов.</p><h3>Проверка</h3><pre>cat project/applicationsets.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get applicationset -n argocd clusters -o yaml \\| grep generator -A5",`clusters:`,"ok"],
 ["^argocd appset list",`clusters 10`,"ok"],
 ["^kubectl get applications -n argocd \\| wc -l",`11`,"ok"]
],
[{re:"^kubectl get applicationset -n argocd",l:"проверить генератор"},
 {re:"^argocd appset list",l:"список сетов"}],{file:"project/applicationsets.yaml",files:{"project/applicationsets.yaml":`# ArgoCD: ApplicationSets: шаблон для 10 кластеров\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/applicationsets.yaml":`# ArgoCD: ApplicationSets: шаблон для 10 кластеров — fixed\nstatus: ok\n`}},{hints:["Симптом: ApplicationSets: шаблон для 10 кластеров в project/applicationsets.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/applicationsets.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/applicationsets.yaml.","Порядок: проверить генератор → список сетов"]});

S("ArgoCD","ggitops-5","Image Updater: авто-обновление тега по semver","Middle", `<h3>Контекст</h3><p>ArgoCD: <b>Image Updater: авто-обновление тега по semver</b>. Работа с <code>project/image-updater-s.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Image Updater: авто-обновление тега по semver</b>. Файл <code>project/image-updater-s.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти аннотацию</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/image-updater-s.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/image-updater-s.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get application api -n</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти аннотацию.</p><h3>Проверка</h3><pre>cat project/image-updater-s.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get application api -n argocd -o yaml \\| grep argocd-image-updater -A2",`argocd-image-updater.argoproj.io/image-list: api=registry.corp/api`,"ok"],
 ["^kubectl get application api -n argocd -o yaml \\| grep -A2 update-strategy",`update-strategy: semver`,"ok"]
],
[{re:"argocd-image-updater",l:"найти аннотацию"}],{file:"project/image-updater-s.yaml",files:{"project/image-updater-s.yaml":`# ArgoCD: Image Updater: авто-обновление тега по semver\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/image-updater-s.yaml":`# ArgoCD: Image Updater: авто-обновление тега по semver — fixed\nstatus: ok\n`}},{hints:["Симптом: Image Updater: авто-обновление тега по semver в project/image-updater-s.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/image-updater-s.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/image-updater-s.yaml.","Порядок: найти аннотацию"]});

S("ArgoCD","ggitops-6","Diff: что изменит sync","Middle", `<h3>Контекст</h3><p>ArgoCD: <b>Diff: что изменит sync</b>. Работа с <code>project/diff-sync.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Diff: что изменит sync</b>. Файл <code>project/diff-sync.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать diff</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/diff-sync.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/diff-sync.yaml</code>. Активный файл открыт в редакторе. Начните с <code>argocd app diff api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать diff.</p><h3>Проверка</h3><pre>cat project/diff-sync.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^argocd app diff api",`===== deployments/api =====\n- replicas: 5\n+ replicas: 3`,"ok"]
],
[{re:"^argocd app diff api",l:"показать diff"}],{file:"project/diff-sync.yaml",files:{"project/diff-sync.yaml":`# ArgoCD: Diff: что изменит sync\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/diff-sync.yaml":`# ArgoCD: Diff: что изменит sync — fixed\nstatus: ok\n`}},{hints:["Симптом: Diff: что изменит sync в project/diff-sync.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/diff-sync.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/diff-sync.yaml.","Порядок: показать diff"]});

S("ArgoCD","ggitops-7","Prune: удалённый в Git ресурс остался в кластере","Senior", `<h3>Контекст</h3><p>ArgoCD: <b>Prune: удалённый в Git ресурс остался в кластере</b>. Работа с <code>project/prune-git-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Prune: удалённый в Git ресурс остался в кластере</b>. Файл <code>project/prune-git-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить prune</li><li>[ ] синк с prune</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/prune-git-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/prune-git-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>argocd app get api 2>&1 \\\\| gr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить prune → синк с prune.</p><h3>Проверка</h3><pre>cat project/prune-git-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^argocd app get api 2>&1 \\| grep -i prune",`Prune: false`,"warn"],
 ["^kubectl get svc old-svc -n prod",`old-svc ClusterIP`,"err"],
 ["^argocd app patch api --patch '{\"spec\":{\"syncPolicy\":{\"syncOptions\":\\[\"Prune=true\"\\]}}}'",`patched`,"ok"],
 ["^argocd app sync api --prune",`Pruned old-svc`,"ok"]
],
[{re:"^argocd app get api.*prune",l:"проверить prune"},
 {re:"^argocd app sync api --prune",l:"синк с prune"}],{file:"project/prune-git-.yaml",files:{"project/prune-git-.yaml":`# ArgoCD: Prune: удалённый в Git ресурс остался в кластере\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/prune-git-.yaml":`# ArgoCD: Prune: удалённый в Git ресурс остался в кластере — fixed\nstatus: ok\n`}},{hints:["Симптом: Prune: удалённый в Git ресурс остался в кластере в project/prune-git-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/prune-git-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/prune-git-.yaml.","Порядок: проверить prune → синк с prune"]});

S("Flux","ggitops-8","Flux Kustomization: wrong path — NotReady","Middle", `<h3>Контекст</h3><p>Flux: <b>Flux Kustomization: wrong path — NotReady</b>. Работа с <code>project/flux-kustomizat.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Flux Kustomization: wrong path — NotReady</b>. Файл <code>project/flux-kustomizat.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти NotReady</li><li>[ ] сообщение</li><li>[ ] исправить path</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/flux-kustomizat.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/flux-kustomizat.yaml</code>. Активный файл открыт в редакторе. Начните с <code>flux get kustomizations -A</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти NotReady → сообщение → исправить path.</p><h3>Проверка</h3><pre>cat project/flux-kustomizat.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^flux get kustomizations -A",`shop False path not found`,"err"],
 ["^kubectl -n flux-system describe kustomization shop 2>&1 \\| grep -A2 Message",`path ./clusters/prod/appps not found`,"err"],
 ["^flux patch kustomization shop --path ./clusters/prod/apps",`patched`,"ok"],
 ["^flux reconcile kustomization shop --with-source",`Reconciliation succeeded`,"ok"]
],
[{re:"^flux get kustomizations -A",l:"найти NotReady"},
 {re:"^kubectl -n flux-system describe kustomization shop",l:"сообщение"},
 {re:"^flux patch kustomization shop",l:"исправить path"}],{file:"project/flux-kustomizat.yaml",files:{"project/flux-kustomizat.yaml":`# Flux: Flux Kustomization: wrong path — NotReady\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/flux-kustomizat.yaml":`# Flux: Flux Kustomization: wrong path — NotReady — fixed\nstatus: ok\n`}},{hints:["Симптом: Flux Kustomization: wrong path — NotReady в project/flux-kustomizat.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/flux-kustomizat.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/flux-kustomizat.yaml.","Порядок: найти NotReady → сообщение → исправить path"]});

S("Flux","ggitops-9","Flux GitRepository: authentication required","Middle", `<h3>Контекст</h3><p>Flux: <b>Flux GitRepository: authentication required</b>. Работа с <code>project/flux-gitreposit.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Flux GitRepository: authentication required</b>. Файл <code>project/flux-gitreposit.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить секрет</li><li>[ ] события</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/flux-gitreposit.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/flux-gitreposit.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n flux-system get git</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить секрет → события.</p><h3>Проверка</h3><pre>cat project/flux-gitreposit.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl -n flux-system get gitrepository shop -o yaml \\| grep -A2 conditions",`Ready: False authentication required`,"err"],
 ["^flux events --for GitRepository/shop -n flux-system 2>&1 \\| tail -5",`Failed authentication`,"err"],
 ["^kubectl create secret generic git-creds -n flux-system --from-literal=username=git --from-literal=password=glpat-xxx",`created`,"ok"],
 ["^kubectl patch gitrepository shop -n flux-system --patch '{\"spec\":{\"secretRef\":{\"name\":\"git-creds\"}}}'",`patched`,"ok"]
],
[{re:"^kubectl -n flux-system get gitrepository shop",l:"проверить секрет"},
 {re:"^flux events --for GitRepository/shop",l:"события"}],{file:"project/flux-gitreposit.yaml",files:{"project/flux-gitreposit.yaml":`# Flux: Flux GitRepository: authentication required\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/flux-gitreposit.yaml":`# Flux: Flux GitRepository: authentication required — fixed\nstatus: ok\n`}},{hints:["Симптом: Flux GitRepository: authentication required в project/flux-gitreposit.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/flux-gitreposit.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/flux-gitreposit.yaml.","Порядок: проверить секрет → события"]});

S("Flux","ggitops-10","Flux Image Automation: тег не обновляется","Middle", `<h3>Контекст</h3><p>Flux: <b>Flux Image Automation: тег не обновляется</b>. Работа с <code>project/flux-image-auto.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Flux Image Automation: тег не обновляется</b>. Файл <code>project/flux-image-auto.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] репозитории образов</li><li>[ ] форсировать скан</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/flux-image-auto.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/flux-image-auto.yaml</code>. Активный файл открыт в редакторе. Начните с <code>flux get images repository -A</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: репозитории образов → форсировать скан.</p><h3>Проверка</h3><pre>cat project/flux-image-auto.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^flux get images repository -A",`api last scan: 2h ago`,"warn"],
 ["^kubectl -n flux-system get imageupdateautomation -o yaml \\| grep interval",`interval: 1m`,"ok"],
 ["^flux reconcile image repository api",`reconciled`,"ok"]
],
[{re:"^flux get images repository -A",l:"репозитории образов"},
 {re:"^flux reconcile image repository api",l:"форсировать скан"}],{file:"project/flux-image-auto.yaml",files:{"project/flux-image-auto.yaml":`# Flux: Flux Image Automation: тег не обновляется\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/flux-image-auto.yaml":`# Flux: Flux Image Automation: тег не обновляется — fixed\nstatus: ok\n`}},{hints:["Симптом: Flux Image Automation: тег не обновляется в project/flux-image-auto.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/flux-image-auto.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/flux-image-auto.yaml.","Порядок: репозитории образов → форсировать скан"]});

S("GitLab CI","ggitops-11","Job stuck: no runners with tags docker","Junior", `<h3>Контекст</h3><p>GitLab CI: <b>Job stuck: no runners with tags docker</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Job stuck: no runners with tags docker</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] сверить теги</li><li>[ ] проверить runner</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>gitlab-runner list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: сверить теги → проверить runner.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^gitlab-runner list",`k8s-runner tags=\\[k8s\\]`,"warn"],
 ["^cat .gitlab-ci.yml \\| grep tags -A2",`tags: [docker]`,"err"],
 ["^sed -i s/tags:\\ \\[docker\\]/tags:\\ \\[k8s\\]/ .gitlab-ci.yml",`patched`,"ok"],
 ["^gitlab-runner verify",`is alive`,"ok"]
],
[{re:"^gitlab-runner list",l:"сверить теги"},
 {re:"^gitlab-runner verify",l:"проверить runner"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Job stuck: no runners with tags docker в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: сверить теги → проверить runner"]});

S("GitLab CI","ggitops-12","Kaniko: unauthorized при push","Middle", `<h3>Контекст</h3><p>GitLab CI: <b>Kaniko: unauthorized при push</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kaniko: unauthorized при push</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти ошибку</li><li>[ ] проверить auth</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>cat .gitlab-ci.yml \\\\| grep -A</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти ошибку → проверить auth.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat .gitlab-ci.yml \\| grep -A5 kaniko",`executor: kaniko`,"dim"],
 ["^kubectl logs job/kaniko -n ci 2>&1 \\| grep -i unauthorized",`error pushing image: unauthorized`,"err"],
 ["^cat /kaniko/.docker/config.json 2>&1 \\| head -5",`cat: No such file`,"err"],
 ["^echo '{\"auths\":{\"registry.corp\":{\"auth\":\"xxx\"}}}' > /kaniko/.docker/config.json",`patched`,"ok"]
],
[{re:"unauthorized",l:"найти ошибку"},
 {re:"/kaniko/.docker/config.json",l:"проверить auth"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Kaniko: unauthorized при push в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: найти ошибку → проверить auth"]});

S("GitLab CI","ggitops-13","Services: postgres не поднялся — job падает Connection refused","Middle", `<h3>Контекст</h3><p>GitLab CI: <b>Services: postgres не поднялся — job падает Connection refused</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Services: postgres не поднялся — job падает Connection refused</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] добавить service postgres</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>cat .gitlab-ci.yml \\\\| grep -A</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: добавить service postgres.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat .gitlab-ci.yml \\| grep -A3 services",`(пусто)`,"err"],
 ["^gitlab-ci-local --list 2>&1 \\| grep test",`test stage`,"dim"],
 ["^sed -i s/image:\\ postgres/image:\\ postgres:16\\nservices:\\n\\ -\\ postgres:16/ .gitlab-ci.yml",`added services`,"ok"]
],
[{re:"services",l:"добавить service postgres"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Services: postgres не поднялся — job падает Connection refused в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: добавить service postgres"]});

S("GitHub Actions","ggitops-14","Secret DEPLOY_TOKEN пустой — job падает","Junior", `<h3>Контекст</h3><p>GitHub Actions: <b>Secret DEPLOY_TOKEN пустой — job падает</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Secret DEPLOY_TOKEN пустой — job падает</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать secret</li><li>[ ] перезапустить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>gh run view --log-failed 2>&1 </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать secret → перезапустить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^gh run view --log-failed 2>&1 \\| grep -i token",`DEPLOY_TOKEN is empty`,"err"],
 ["^gh secret list 2>&1 \\| grep DEPLOY",`(пусто)`,"err"],
 ["^gh secret set DEPLOY_TOKEN --body \"s3cr3t\"",`created`,"ok"],
 ["^gh run rerun 123456 --failed",`rerun`,"ok"]
],
[{re:"^gh secret set DEPLOY_TOKEN",l:"создать secret"},
 {re:"^gh run rerun",l:"перезапустить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Secret DEPLOY_TOKEN пустой — job падает в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: создать secret → перезапустить"]});

S("GitHub Actions","ggitops-15","Go cache не попадает — каждый раз скачивает модули","Middle", `<h3>Контекст</h3><p>GitHub Actions: <b>Go cache не попадает — каждый раз скачивает модули</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Go cache не попадает — каждый раз скачивает модули</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] включить кеш в setup-go</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>cat .github/workflows/ci.yaml </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: включить кеш в setup-go.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat .github/workflows/ci.yaml \\| grep -A3 cache",`(пусто)`,"err"],
 ["^sed -i s/actions\\/setup-go@v5/actions\\/setup-go@v5\\n\\ \\ \\ \\ \\ \\ with:\\n\\ \\ \\ \\ \\ \\ \\ cache:\\ true/ .github/workflows/ci.yaml",`patched cache`,"ok"],
 ["^gh run view --log 2>&1 \\| grep -i cache",`Cache restored from key: go-`,"ok"]
],
[{re:"cache",l:"включить кеш в setup-go"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Go cache не попадает — каждый раз скачивает модули в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: включить кеш в setup-go"]});

S("GitHub Actions","ggitops-16","Action pinned без SHA — Supply chain риск","Senior", `<h3>Контекст</h3><p>GitHub Actions: <b>Action pinned без SHA — Supply chain риск</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Action pinned без SHA — Supply chain риск</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти unpinned actions</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>cat .github/workflows/ci.yaml </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти unpinned actions.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat .github/workflows/ci.yaml \\| grep uses:",`uses: actions/checkout@v4`,"warn"],
 ["^grep -n \"uses:\" .github/workflows/ci.yaml",`6 uses без SHA`,"warn"],
 ["^sed -i s/actions\\/checkout@v4/actions\\/checkout@11bd71901bbe5b02/ .github/workflows/ci.yaml",`pinned`,"ok"]
],
[{re:"uses:",l:"найти unpinned actions"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Action pinned без SHA — Supply chain риск в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: найти unpinned actions"]});

S("GitLab CI","ggitops-17","Review Apps: динамическое окружение не удаляется","Middle", `<h3>Контекст</h3><p>GitLab CI: <b>Review Apps: динамическое окружение не удаляется</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Review Apps: динамическое окружение не удаляется</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить on_stop</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>cat .gitlab-ci.yml \\\\| grep -A</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить on_stop.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat .gitlab-ci.yml \\| grep -A5 review",`environment:\n  name: review/$CI_COMMIT_REF_SLUG\n  on_stop: stop_review`,"ok"],
 ["^kubectl get ns \\| grep review",`review-feat-pay`,"warn"],
 ["^gitlab-runner exec shell stop_review 2>&1 \\| tail -5",`stop_review completed`,"ok"]
],
[{re:"on_stop: stop_review",l:"проверить on_stop"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Review Apps: динамическое окружение не удаляется в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: проверить on_stop"]});

S("CI","ggitops-18","Trivy в пайплайне: CRITICAL уязвимости блочат деплой","Middle", `<h3>Контекст</h3><p>CI: <b>Trivy в пайплайне: CRITICAL уязвимости блочат деплой</b>. Работа с <code>project/trivy-critical-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Trivy в пайплайне: CRITICAL уязвимости блочат деплой</b>. Файл <code>project/trivy-critical-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] скан CRITICAL</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/trivy-critical-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/trivy-critical-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat .gitlab-ci.yml \\\\| grep -A</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: скан CRITICAL.</p><h3>Проверка</h3><pre>cat project/trivy-critical-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat .gitlab-ci.yml \\| grep -A3 trivy",`trivy image --severity CRITICAL`,"ok"],
 ["^trivy image --severity CRITICAL shop/api:2\\.5\\.0 2>&1 \\| tail -10",`Total: 2 (CRITICAL: 2)`,"err"],
 ["^trivy image --severity CRITICAL --exit-code 1 shop/api:2\\.5\\.0; echo \\$?",`1`,"err"]
],
[{re:"^trivy image --severity CRITICAL",l:"скан CRITICAL"}],{file:"project/trivy-critical-.yaml",files:{"project/trivy-critical-.yaml":`# CI: Trivy в пайплайне: CRITICAL уязвимости блочат деплой\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/trivy-critical-.yaml":`# CI: Trivy в пайплайне: CRITICAL уязвимости блочат деплой — fixed\nstatus: ok\n`}},{hints:["Симптом: Trivy в пайплайне: CRITICAL уязвимости блочат деплой в project/trivy-critical-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/trivy-critical-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/trivy-critical-.yaml.","Порядок: скан CRITICAL"]});

S("ArgoCD","ggitops-19","Progressive delivery: Flagger canary 90/10","Senior", `<h3>Контекст</h3><p>ArgoCD: <b>Progressive delivery: Flagger canary 90/10</b>. Работа с <code>project/progressive-del.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Progressive delivery: Flagger canary 90/10</b>. Файл <code>project/progressive-del.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус канарейки</li><li>[ ] вес</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/progressive-del.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/progressive-del.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get canary -n prod api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус канарейки → вес.</p><h3>Проверка</h3><pre>cat project/progressive-del.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get canary -n prod api -o yaml \\| grep -A2 weight",`weight: 10`,"ok"],
 ["^kubectl get canary -n prod api 2>&1 \\| grep Progress",`Progressing`,"ok"],
 ["^curl -s https://api.corp.local/ 2>&1 \\| grep version \\| sort \\| uniq -c",` 90 v1\n 10 v2`,"ok"]
],
[{re:"^kubectl get canary -n prod api",l:"статус канарейки"},
 {re:"weight: 10",l:"вес"}],{file:"project/progressive-del.yaml",files:{"project/progressive-del.yaml":`# ArgoCD: Progressive delivery: Flagger canary 90/10\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/progressive-del.yaml":`# ArgoCD: Progressive delivery: Flagger canary 90/10 — fixed\nstatus: ok\n`}},{hints:["Симптом: Progressive delivery: Flagger canary 90/10 в project/progressive-del.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/progressive-del.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/progressive-del.yaml.","Порядок: статус канарейки → вес"]});

S("GitOps","ggitops-20","Drift: kubectl scale вручную — ArgoCD вернул через 3m","Middle", `<h3>Контекст</h3><p>GitOps: <b>Drift: kubectl scale вручную — ArgoCD вернул через 3m</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Drift: kubectl scale вручную — ArgoCD вернул через 3m</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] внести дрейф</li><li>[ ] проверить возврат</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>kubectl scale deploy api -n pr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: внести дрейф → проверить возврат.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl scale deploy api -n prod --replicas=10",`scaled`,"dim"],
 ["^sleep 180 && kubectl get deploy api -n prod -o jsonpath=\"{.spec.replicas}\"",`3`,"ok"]
],
[{re:"^kubectl scale deploy api",l:"внести дрейф"},
 {re:"^kubectl get deploy api -n prod -o jsonpath",l:"проверить возврат"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Drift: kubectl scale вручную — ArgoCD вернул через 3m в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: внести дрейф → проверить возврат"]});

S("GitLab CI","ggitops-21","Runner docker executor: нет доступа к docker.sock","Middle", `<h3>Контекст</h3><p>GitLab CI: <b>Runner docker executor: нет доступа к docker.sock</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Runner docker executor: нет доступа к docker.sock</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить volumes</li><li>[ ] добавить маунт</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>cache\\\\]|volumes\\\\ =\\\\ \\\\[\\\"</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить volumes → добавить маунт.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat /etc/gitlab-runner/config.toml \\| grep volumes",`volumes = \\[/cache\\]`,"err"],
 ["^sed -i s|volumes\\ =\\ \\[/cache\\]|volumes\\ =\\ \\[\"/cache\",\"/var/run/docker.sock:/var/run/docker.sock\"\\]| /etc/gitlab-runner/config.toml",`patched`,"ok"],
 ["^gitlab-runner restart",`restarted`,"ok"]
],
[{re:"^cat /etc/gitlab-runner/config.toml",l:"проверить volumes"},
 {re:"docker\\.sock",l:"добавить маунт"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Runner docker executor: нет доступа к docker.sock в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: проверить volumes → добавить маунт"]});

S("GitHub Actions","ggitops-22","OIDC: деплой в AWS без долгоживущих ключей","Senior", `<h3>Контекст</h3><p>GitHub Actions: <b>OIDC: деплой в AWS без долгоживущих ключей</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>OIDC: деплой в AWS без долгоживущих ключей</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] OIDC роль</li><li>[ ] проверить отсутствие ключей</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>cat .github/workflows/deploy.y</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: OIDC роль → проверить отсутствие ключей.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat .github/workflows/deploy.yaml \\| grep -A2 \"aws-actions/configure-aws-credentials\"",`role-to-assume: arn:aws:iam::123:role/deploy`,"ok"],
 ["^cat .github/workflows/deploy.yaml \\| grep -i \"AKIA\"",`(пусто) — нет хардкода`,"ok"]
],
[{re:"role-to-assume",l:"OIDC роль"},
 {re:"AKIA",l:"проверить отсутствие ключей"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: OIDC: деплой в AWS без долгоживущих ключей в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: OIDC роль → проверить отсутствие ключей"]});

S("ArgoCD","ggitops-23","Sync retry: backoff после 5 фейлов","Middle", `<h3>Контекст</h3><p>ArgoCD: <b>Sync retry: backoff после 5 фейлов</b>. Работа с <code>project/sync-retry-back.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sync retry: backoff после 5 фейлов</b>. Файл <code>project/sync-retry-back.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить лимит ретраев</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sync-retry-back.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sync-retry-back.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get application api -n</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить лимит ретраев.</p><h3>Проверка</h3><pre>cat project/sync-retry-back.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get application api -n argocd -o yaml \\| grep -A5 retry",`retry:\n  limit: 5\n  backoff:\n    duration: 5s`,"ok"]
],
[{re:"retry",l:"проверить лимит ретраев"}],{file:"project/sync-retry-back.yaml",files:{"project/sync-retry-back.yaml":`# ArgoCD: Sync retry: backoff после 5 фейлов\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sync-retry-back.yaml":`# ArgoCD: Sync retry: backoff после 5 фейлов — fixed\nstatus: ok\n`}},{hints:["Симптом: Sync retry: backoff после 5 фейлов в project/sync-retry-back.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sync-retry-back.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sync-retry-back.yaml.","Порядок: проверить лимит ретраев"]});

S("CI","ggitops-24","Сache key: не инвалидируется после смены go.mod","Middle", `<h3>Контекст</h3><p>CI: <b>Сache key: не инвалидируется после смены go.mod</b>. Работа с <code>project/-ache-key-go-mo.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Сache key: не инвалидируется после смены go.mod</b>. Файл <code>project/-ache-key-go-mo.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] ключ по go.sum</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-ache-key-go-mo.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-ache-key-go-mo.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat .github/workflows/ci.yaml </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: ключ по go.sum.</p><h3>Проверка</h3><pre>cat project/-ache-key-go-mo.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^cat .github/workflows/ci.yaml \\| grep -A2 key:",`key: go-\\$\\{\\{ hashFiles\\('go.sum'\\) \\}\\}`,"ok"]
],
[{re:"hashFiles",l:"ключ по go.sum"}],{file:"project/-ache-key-go-mo.yaml",files:{"project/-ache-key-go-mo.yaml":`# CI: Сache key: не инвалидируется после смены go.mod\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-ache-key-go-mo.yaml":`# CI: Сache key: не инвалидируется после смены go.mod — fixed\nstatus: ok\n`}},{hints:["Симптом: Сache key: не инвалидируется после смены go.mod в project/-ache-key-go-mo.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-ache-key-go-mo.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-ache-key-go-mo.yaml.","Порядок: ключ по go.sum"]});

S("Flux","ggitops-25","Flux notification: алерт в Slack при fail","Middle", `<h3>Контекст</h3><p>Flux: <b>Flux notification: алерт в Slack при fail</b>. Работа с <code>project/flux-notificati.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Flux notification: алерт в Slack при fail</b>. Файл <code>project/flux-notificati.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить провайдера</li><li>[ ] проверить алерт</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/flux-notificati.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/flux-notificati.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get provider -n flux-s</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить провайдера → проверить алерт.</p><h3>Проверка</h3><pre>cat project/flux-notificati.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get provider -n flux-system slack -o yaml \\| grep address",`address: https://hooks.slack.com/...`,"ok"],
 ["^kubectl get alert -n flux-system prod -o yaml \\| grep eventSeverity",`eventSeverity: error`,"ok"]
],
[{re:"^kubectl get provider -n flux-system slack",l:"проверить провайдера"},
 {re:"^kubectl get alert -n flux-system prod",l:"проверить алерт"}],{file:"project/flux-notificati.yaml",files:{"project/flux-notificati.yaml":`# Flux: Flux notification: алерт в Slack при fail\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/flux-notificati.yaml":`# Flux: Flux notification: алерт в Slack при fail — fixed\nstatus: ok\n`}},{hints:["Симптом: Flux notification: алерт в Slack при fail в project/flux-notificati.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/flux-notificati.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/flux-notificati.yaml.","Порядок: проверить провайдера → проверить алерт"]});
