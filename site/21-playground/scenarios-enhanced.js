/* Сценарии: Enhanced — Filesystems, RBAC/PSS, Flux, Gateway API, HTTP, Logging, CRI-O */
S("Linux — Filesystems","fs1","Disk full vs inode full — найти причину","Middle", `<h3>Контекст</h3><p>Linux — Filesystems: <b>Disk full vs inode full — найти причину</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Disk full vs inode full — найти причину</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Проверить блоки</li><li>[ ] Проверить inode — найти 100%</li><li>[ ] Найти каталог с миллионами файлов</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>df -h\\\\b</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Проверить блоки → Проверить inode — найти 100% → Найти каталог с миллионами файлов.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
["^df -h\\b",`Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        20G   12G  7.2G  63% /`,"ok"],
["^df -i\\b",`Filesystem      Inodes  IUsed  IFree IUse% Mounted on
/dev/sda1        100K   100K      0  100% /`,"err"],
["^find .* -xdev.*wc -l",`50012 /var/spool/mqueue
120   /var/log`,"ok"],
["^lsof \\+L1",`COMMAND PID USER FD TYPE DEVICE SIZE NLINK NODE NAME
python3 1234 app 4w REG 0,1 0 0 12345 /var/spool/mqueue/deleted.tmp (deleted)`,"warn"],
["^truncate -s0",`truncate: cleaned fd`,"ok"],
["^rm -rf /var/spool/mqueue/\\*",`cleaned`,"dim"]
],
[{re:"^df -h",l:"Проверить блоки"},
 {re:"^df -i",l:"Проверить inode — найти 100%"},
 {re:"find",l:"Найти каталог с миллионами файлов"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Disk full vs inode full — найти причину в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: Проверить блоки → Проверить inode — найти 100% → Найти каталог с миллионами файлов"]});

S("Linux — Filesystems","fs2","overlay2: почему первый write медленный","Middle", `<h3>Контекст</h3><p>Linux — Filesystems: <b>overlay2: почему первый write медленный</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>overlay2: почему первый write медленный</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Показать CoW изменения</li><li>[ ] Найти upper слой</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>docker diff</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Показать CoW изменения → Найти upper слой.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
["^docker diff",`C /usr/share/nginx/html/index.html
A /tmp/newfile`,"ok"],
["^ls .*overlay2.*upper",`upper: index.html  cache/  tmp/`,"ok"],
["^docker inspect.*MergedDir",`/var/lib/docker/overlay2/abc123/merged`,"ok"],
["^cat /proc/mounts.*overlay",`overlay on / type overlay (rw,lowerdir=/var/lib/docker/overlay2/l/...,upperdir=/var/lib/docker/overlay2/abc123/diff)`,"ok"]
],
[{re:"docker diff",l:"Показать CoW изменения"},
 {re:"ls.*upper",l:"Найти upper слой"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: overlay2: почему первый write медленный в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: Показать CoW изменения → Найти upper слой"]});

S("Linux — Filesystems","fs3","fstab failure: сервер не грузится","Junior", `<h3>Контекст</h3><p>Linux — Filesystems: <b>fstab failure: сервер не грузится</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>fstab failure: сервер не грузится</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Показать fstab</li><li>[ ] Проверить fstab без монтирования</li><li>[ ] Исправить на nofail</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>cat /etc/fstab</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Показать fstab → Проверить fstab без монтирования → Исправить на nofail.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
["^cat /etc/fstab",`UUID=abc / ext4 errors=remount-ro 0 1
/dev/nonexistent /mnt/fake ext4 defaults 0 0   <-- ошибка`,"err"],
["^findmnt --verify",`VERIFICATION FAILED: /mnt/fake: nonexistent device`,"err"],
["^mount -a",`mount: /mnt/fake: special device does not exist`,"err"],
["^sed -i.*nofail.*fstab",`added nofail,x-systemd.device-timeout=10`,"ok"],
["^findmnt --verify",`0 errors, 0 warnings`,"ok"]
],
[{re:"cat /etc/fstab",l:"Показать fstab"},
 {re:"findmnt --verify",l:"Проверить fstab без монтирования"},
 {re:"sed",l:"Исправить на nofail"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: fstab failure: сервер не грузится в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: Показать fstab → Проверить fstab без монтирования → Исправить на nofail"]});

S("K8s Security","rbac1","403 Forbidden: RoleBinding не в том namespace","Middle", `<h3>Контекст</h3><p>K8s Security: <b>403 Forbidden: RoleBinding не в том namespace</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>403 Forbidden: RoleBinding не в том namespace</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Проверить права</li><li>[ ] Найти опечатку namespace</li><li>[ ] Исправить subject.namespace</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl auth can-i.*deployer -</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Проверить права → Найти опечатку namespace → Исправить subject.namespace.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^kubectl auth can-i.*deployer -n shop",`no`,"err"],
["^kubectl get rolebinding.* -n shop -o yaml.*",`subjects:\n- kind: ServiceAccount\n  name: deployer\n  namespace: default  <-- ошибка`,"err"],
["^kubectl patch rolebinding.*namespace: shop",`rolebinding patched`,"ok"],
["^kubectl auth can-i.*patch.*deployer -n shop",`yes`,"ok"]
],
[{re:"kubectl auth can-i",l:"Проверить права"},
 {re:"kubectl get rolebinding",l:"Найти опечатку namespace"},
 {re:"kubectl patch rolebinding",l:"Исправить subject.namespace"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: 403 Forbidden: RoleBinding не в том namespace в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: Проверить права → Найти опечатку namespace → Исправить subject.namespace"]});

S("K8s Security","pss1","Pod rejected: violates PodSecurity restricted","Junior", `<h3>Контекст</h3><p>K8s Security: <b>Pod rejected: violates PodSecurity restricted</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Pod rejected: violates PodSecurity restricted</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Воспроизвести ошибку</li><li>[ ] Проверить PSS label</li><li>[ ] Применить исправленный pod</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl apply -f bad.yaml.*</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Воспроизвести ошибку → Проверить PSS label → Применить исправленный pod.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^kubectl apply -f bad.yaml.*",`Error from server (Forbidden): violates PodSecurity \"restricted:latest\": privileged`,"err"],
["^kubectl label ns.*pod-security",`namespace/shop labeled`,"dim"],
["^kubectl apply -f good.yaml",`pod/good created`,"ok"],
["^kubectl get pods -n shop",`good   1/1   Running   0`,"ok"]
],
[{re:"kubectl apply -f bad",l:"Воспроизвести ошибку"},
 {re:"kubectl label ns",l:"Проверить PSS label"},
 {re:"kubectl apply -f good",l:"Применить исправленный pod"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Pod rejected: violates PodSecurity restricted в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: Воспроизвести ошибку → Проверить PSS label → Применить исправленный pod"]});

S("K8s Security","pss2","readOnlyRootFilesystem: mkdir failed","Middle", `<h3>Контекст</h3><p>K8s Security: <b>readOnlyRootFilesystem: mkdir failed</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>readOnlyRootFilesystem: mkdir failed</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Прочитать лог</li><li>[ ] Найти readOnlyRootFilesystem</li><li>[ ] Добавить emptyDir</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl logs.*good.*</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Прочитать лог → Найти readOnlyRootFilesystem → Добавить emptyDir.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^kubectl logs.*good.*",`[emerg] mkdir() "/var/cache/nginx/client_temp" failed (30: Read-only file system)`,"err"],
["^kubectl describe pod.*",`Containers: app  readOnlyRootFilesystem: true`,"warn"],
["^kubectl patch pod.*emptyDir.*",`added volumeMounts: /tmp, /var/cache/nginx`,"ok"],
["^kubectl get pods -n shop",`good   1/1   Running`,"ok"]
],
[{re:"kubectl logs",l:"Прочитать лог"},
 {re:"kubectl describe pod",l:"Найти readOnlyRootFilesystem"},
 {re:"kubectl patch",l:"Добавить emptyDir"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: readOnlyRootFilesystem: mkdir failed в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: Прочитать лог → Найти readOnlyRootFilesystem → Добавить emptyDir"]});

S("GitOps Flux","flux1","Flux: wrong path в Kustomization","Middle", `<h3>Контекст</h3><p>GitOps Flux: <b>Flux: wrong path в Kustomization</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Flux: wrong path в Kustomization</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Найти NotReady</li><li>[ ] Прочитать Message</li><li>[ ] Исправить path</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>flux get kustomizations -A</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Найти NotReady → Прочитать Message → Исправить path.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"root@lab:~#",
[
["^flux get kustomizations -A",`KUSTOMIZATION  READY  STATUS
shop        False  path not found`,"err"],
["^kubectl -n flux-system describe kustomization shop.*Message",`Message: path ./clusters/prod/appps not found`,"err"],
["^flux patch kustomization shop.*path.*apps",`kustomization patched`,"ok"],
["^flux reconcile kustomization shop --with-source",`Reconciliation succeeded`,"ok"]
],
[{re:"flux get kustomizations",l:"Найти NotReady"},
 {re:"describe kustomization",l:"Прочитать Message"},
 {re:"flux patch kustomization",l:"Исправить path"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Flux: wrong path в Kustomization в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: Найти NotReady → Прочитать Message → Исправить path"]});

S("GitOps Flux","flux2","Flux: GitRepository auth required","Middle", `<h3>Контекст</h3><p>GitOps Flux: <b>Flux: GitRepository auth required</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Flux: GitRepository auth required</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Проверить secretRef</li><li>[ ] События источника</li><li>[ ] Создать secret с PAT</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n flux-system get git</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Проверить secretRef → События источника → Создать secret с PAT.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"root@lab:~#",
[
["^kubectl -n flux-system get gitrepository.*",`READY False  authentication required`,"err"],
["^flux events --for GitRepository.*",`Failed: authentication required for https://github.com/org/private`,"err"],
["^kubectl create secret generic git-creds.*",`secret/git-creds created`,"ok"],
["^kubectl patch gitrepository.*secretRef.*",`gitrepository patched`,"ok"]
],
[{re:"kubectl.*get gitrepository",l:"Проверить secretRef"},
 {re:"flux events",l:"События источника"},
 {re:"kubectl create secret",l:"Создать secret с PAT"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Flux: GitRepository auth required в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: Проверить secretRef → События источника → Создать secret с PAT"]});

S("K8s Gateway API","gw1","Gateway: HTTPRoute Not Accepted — selector mismatch","Middle", `<h3>Контекст</h3><p>K8s Gateway API: <b>Gateway: HTTPRoute Not Accepted — selector mismatch</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Gateway: HTTPRoute Not Accepted — selector mismatch</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Проверить READY False</li><li>[ ] Найти Parent Message</li><li>[ ] Исправить allowedRoutes</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get httproute shop-api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Проверить READY False → Найти Parent Message → Исправить allowedRoutes.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^kubectl get httproute shop-api -n shop -o wide",`HOSTNAMES  PARENTS  READY  AGE
*         prod-gateway  False  5m`,"err"],
["^kubectl describe httproute shop-api -n shop.*Parent.*",`Message: No matching Gateway (allowedRoutes selector)`,"err"],
["^kubectl get ns shop --show-labels",`Labels: <none>`,"err"],
["^kubectl label ns shop gateway=allowed.*",`namespace/shop labeled`,"ok"],
["^kubectl get httproute shop-api -n shop -o wide",`shop.example.com  prod-gateway  True  5m`,"ok"]
],
[{re:"kubectl get httproute",l:"Проверить READY False"},
 {re:"kubectl describe httproute",l:"Найти Parent Message"},
 {re:"kubectl label ns shop",l:"Исправить allowedRoutes"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Gateway: HTTPRoute Not Accepted — selector mismatch в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: Проверить READY False → Найти Parent Message → Исправить allowedRoutes"]});

S("K8s Gateway API","gw2","Gateway: 90/10 split проверка","Junior", `<h3>Контекст</h3><p>K8s Gateway API: <b>Gateway: 90/10 split проверка</b>. Работа с <code>k8s/deployment.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Gateway: 90/10 split проверка</b>. Файл <code>k8s/deployment.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Показать weights 90/10</li><li>[ ] Замерить сплит</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>k8s/deployment.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>k8s/deployment.yaml</code>, <code>k8s/service.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get httproute shop-api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Показать weights 90/10 → Замерить сплит.</p><h3>Проверка</h3><pre>cat k8s/deployment.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^kubectl get httproute shop-api -n shop -o yaml.*weight.*",`weight: 90
weight: 10`,"ok"],
["^for i in.*curl.*shop.example.com.*",` 18 shop-api-v1
 2 shop-api-v2`,"ok"],
["^curl -H.*x-beta.*true.*",`shop-api-v2 blue`,"ok"]
],
[{re:"kubectl get httproute",l:"Показать weights 90/10"},
 {re:"for i in",l:"Замерить сплит"}],{file:"k8s/deployment.yaml",files:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`},checks:[{re:/replicas:\s*3/,l:"replicas=3"}],solutionFiles:{"k8s/deployment.yaml":`apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n`,"k8s/service.yaml":`apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n`}},{hints:["Симптом: Gateway: 90/10 split проверка в k8s/deployment.yaml. Ищи причину в коде/конфиге этого файла.","Открой k8s/deployment.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat k8s/deployment.yaml.","Порядок: Показать weights 90/10 → Замерить сплит"]});

S("Observability HTTP","http1","502 Bad Gateway: endpoints <none>","Junior", `<h3>Контекст</h3><p>Observability HTTP: <b>502 Bad Gateway: endpoints <none></b>. Работа с <code>project/502-bad-gateway.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>502 Bad Gateway: endpoints <none></b>. Файл <code>project/502-bad-gateway.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Найти <none></li><li>[ ] Найти mismatch</li><li>[ ] Проверить fix</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/502-bad-gateway.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/502-bad-gateway.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get endpoints shop-api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Найти <none> → Найти mismatch → Проверить fix.</p><h3>Проверка</h3><pre>cat project/502-bad-gateway.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^kubectl get endpoints shop-api -n shop",`ENDPOINTS   <none>`,"err"],
["^kubectl get svc shop-api -n shop -o yaml.*selector.*",`selector:\n  app: shop-api-v1   <-- deployment label app: shop-api`,"err"],
["^kubectl patch svc shop-api.*app.*shop-api",`service patched`,"ok"],
["^curl -H.*Host.*GW_IP.*-I.*",`HTTP/1.1 200 OK`,"ok"]
],
[{re:"kubectl get endpoints",l:"Найти <none>"},
 {re:"kubectl get svc.*selector",l:"Найти mismatch"},
 {re:"curl -H.*Host",l:"Проверить fix"}],{file:"project/502-bad-gateway.yaml",files:{"project/502-bad-gateway.yaml":`# Observability HTTP: 502 Bad Gateway: endpoints <none>\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/502-bad-gateway.yaml":`# Observability HTTP: 502 Bad Gateway: endpoints <none> — fixed\nstatus: ok\n`}},{hints:["Симптом: 502 Bad Gateway: endpoints <none> в project/502-bad-gateway.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/502-bad-gateway.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/502-bad-gateway.yaml.","Порядок: Найти <none> → Найти mismatch → Проверить fix"]});

S("Observability Logging","log1","journald RateLimit: Suppressed 3000 messages","Middle", `<h3>Контекст</h3><p>Observability Logging: <b>journald RateLimit: Suppressed 3000 messages</b>. Работа с <code>project/journald-rateli.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>journald RateLimit: Suppressed 3000 messages</b>. Файл <code>project/journald-rateli.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] Найти suppression</li><li>[ ] Проверить burst</li><li>[ ] Поднять лимит</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/journald-rateli.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/journald-rateli.yaml</code>. Активный файл открыт в редакторе. Начните с <code>journalctl.*Suppressed</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: Найти suppression → Проверить burst → Поднять лимит.</p><h3>Проверка</h3><pre>cat project/journald-rateli.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^journalctl.*Suppressed",`Suppressed 3000 messages from myapp.service`,"err"],
["^cat /etc/systemd/journald.conf.*RateLimitBurst.*",`RateLimitBurst=1000`,"warn"],
["^sudo sed -i.*RateLimitBurst=5000.*journald.conf",`patched`,"ok"],
["^sudo systemctl restart systemd-journald",`restarted`,"ok"]
],
[{re:"journalctl.*Suppressed",l:"Найти suppression"},
 {re:"cat /etc/systemd/journald.conf",l:"Проверить burst"},
 {re:"sed.*RateLimitBurst",l:"Поднять лимит"}],{file:"project/journald-rateli.yaml",files:{"project/journald-rateli.yaml":`# Observability Logging: journald RateLimit: Suppressed 3000 messages\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/journald-rateli.yaml":`# Observability Logging: journald RateLimit: Suppressed 3000 messages — fixed\nstatus: ok\n`}},{hints:["Симптом: journald RateLimit: Suppressed 3000 messages в project/journald-rateli.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/journald-rateli.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/journald-rateli.yaml.","Порядок: Найти suppression → Проверить burst → Поднять лимит"]});
