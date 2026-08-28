/* Песочница: Istio, Cilium, Traefik, CoreDNS, MetalLB, HAProxy, Envoy, WireGuard, AWS, Cloudflare, GitLab, Rancher, Proxmox, Harbor, Renovate */
S("Istio","is1","mTLS strict сломал внешнего клиента","Senior",
`<h3>Контекст</h3><p>Istio: <b>mTLS strict сломал внешнего клиента</b>. Работа с <code>project/mtls-strict-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mTLS strict сломал внешнего клиента</b>. Файл <code>project/mtls-strict-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти STRICT-политику</li><li>[ ] включить PERMISSIVE для переходного периода</li><li>[ ] проверить синк прокси</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mtls-strict-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mtls-strict-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get peerauthentication</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти STRICT-политику → включить PERMISSIVE для переходного периода → проверить синк прокси.</p><h3>Проверка</h3><pre>cat project/mtls-strict-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl get peerauthentication -A",`default STRICT (mesh-wide)`,"warn"],
["^(kubectl apply -f - <<EOF.*PERMISSIVE|istioctl analyze)",`PeerAuthentication PERMISSIVE для namespace onboarding`,"ok"],
["^istioctl proxy-status \\| head",`SYNCED (все прокси получили конфиг)`,"ok"]
],
[{re:/peerauthentication/i,l:"найти STRICT-политику"},
 {re:"PERMISSIVE",l:"включить PERMISSIVE для переходного периода"},
 {re:"istioctl proxy-status",l:"проверить синк прокси"}],{file:"project/mtls-strict-.yaml",files:{"project/mtls-strict-.yaml":`# Istio: mTLS strict сломал внешнего клиента\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mtls-strict-.yaml":`# Istio: mTLS strict сломал внешнего клиента — fixed\nstatus: ok\n`}},{hints:["Симптом: mTLS strict сломал внешнего клиента в project/mtls-strict-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mtls-strict-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mtls-strict-.yaml.","Порядок: найти STRICT-политику → включить PERMISSIVE для переходного периода → проверить синк прокси"]});

S("Istio","is2","Канарейка 5% через VirtualService","Middle",
`<h3>Контекст</h3><p>Istio: <b>Канарейка 5% через VirtualService</b>. Работа с <code>project/-5-virtualservi.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Канарейка 5% через VirtualService</b>. Файл <code>project/-5-virtualservi.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать VirtualService с весами</li><li>[ ] создать subsets</li><li>[ ] проверить распределение</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-5-virtualservi.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-5-virtualservi.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl apply -f - <<EOF.*Virt</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать VirtualService с весами → создать subsets → проверить распределение.</p><h3>Проверка</h3><pre>cat project/-5-virtualservi.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl apply -f - <<EOF.*VirtualService",`virtualservice.networking.istio.io/api created`,"ok"],
["^kubectl apply -f - <<EOF.*DestinationRule",`destinationrule.networking.istio.io/api created (subsets v1,v2)`,"ok"],
["^for i in \\$\\(seq 1 20\\); do curl -s api\\/version; done \\| sort \\| uniq -c",`19 v1; 1 v2`,"ok"]
],
[{re:/VirtualService/,l:"создать VirtualService с весами"},
 {re:"DestinationRule",l:"создать subsets"},
 {re:"uniq -c",l:"проверить распределение"}],{file:"project/-5-virtualservi.yaml",files:{"project/-5-virtualservi.yaml":`# Istio: Канарейка 5% через VirtualService\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-5-virtualservi.yaml":`# Istio: Канарейка 5% через VirtualService — fixed\nstatus: ok\n`}},{hints:["Симптом: Канарейка 5% через VirtualService в project/-5-virtualservi.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-5-virtualservi.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-5-virtualservi.yaml.","Порядок: создать VirtualService с весами → создать subsets → проверить распределение"]});

S("Cilium","ci1","Hubble: кто дропает пакеты","Senior",
`<h3>Контекст</h3><p>Cilium: <b>Hubble: кто дропает пакеты</b>. Работа с <code>project/hubble-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Hubble: кто дропает пакеты</b>. Файл <code>project/hubble-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть дропы и причину</li><li>[ ] проверить/поправить политику</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/hubble-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/hubble-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>hubble observe --verdict DROPP</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть дропы и причину → проверить/поправить политику.</p><h3>Проверка</h3><pre>cat project/hubble-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^hubble observe --verdict DROPPED --since 5m",`FORWARDED/DROPPED: web→api:8080 DENIED (Policy denied)`,"err"],
["^cilium policy get \\| head",`default-deny-all активен`,"warn"],
["^(kubectl apply -f allow\\.yaml|cilium policy import allow\\.yaml)",`policy imported`,"ok"],
["^hubble observe --verdict DROPPED --since 1m",`(пусто)`,"ok"]
],
[{re:/^hubble observe/,l:"увидеть дропы и причину"},
 {re:"(policy (get|import)|allow\\.yaml)",l:"проверить/поправить политику"}],{file:"project/hubble-.yaml",files:{"project/hubble-.yaml":`# Cilium: Hubble: кто дропает пакеты\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/hubble-.yaml":`# Cilium: Hubble: кто дропает пакеты — fixed\nstatus: ok\n`}},{hints:["Симптом: Hubble: кто дропает пакеты в project/hubble-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/hubble-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/hubble-.yaml.","Порядок: увидеть дропы и причину → проверить/поправить политику"]});

S("Traefik","tr1","Rate limit middleware не применяется","Middle",
`<h3>Контекст</h3><p>Traefik: <b>Rate limit middleware не применяется</b>. Работа с <code>project/rate-limit-midd.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Rate limit middleware не применяется</b>. Файл <code>project/rate-limit-midd.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать/проверить middleware</li><li>[ ] привязать к роуту</li><li>[ ] проверить лимит</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rate-limit-midd.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rate-limit-midd.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get ingressroute -n we</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать/проверить middleware → привязать к роуту → проверить лимит.</p><h3>Проверка</h3><pre>cat project/rate-limit-midd.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl get ingressroute -n web -o yaml \\| grep -A2 middlewares",`(пусто) — middleware не подключён к роуту`,"err"],
["^kubectl apply -f - <<EOF.*Middleware.*rateLimit",`middleware.traefik.containo.us/rate-limit created`,"ok"],
["^(kubectl patch ingressroute|sed -i)",`middleware добавлен в route`,"ok"],
["^for i in \\$(seq 1 30); do curl -s -o \\/dev\\/null -w %{http_code} https:\\/\\/app\\/login; done",`200...200 429 429 429`,"ok"]
],
[{re:/Middleware|rateLimit/,l:"создать/проверить middleware"},
 {re:"(patch ingressroute|добавлен в route)",l:"привязать к роуту"},
 {re:"429",l:"проверить лимит"}],{file:"project/rate-limit-midd.yaml",files:{"project/rate-limit-midd.yaml":`# Traefik: Rate limit middleware не применяется\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rate-limit-midd.yaml":`# Traefik: Rate limit middleware не применяется — fixed\nstatus: ok\n`}},{hints:["Симптом: Rate limit middleware не применяется в project/rate-limit-midd.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rate-limit-midd.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rate-limit-midd.yaml.","Порядок: создать/проверить middleware → привязать к роуту → проверить лимит"]});

S("CoreDNS","cd1","Forward в недоступный upstream","Middle",
`<h3>Контекст</h3><p>CoreDNS: <b>Forward в недоступный upstream</b>. Работа с <code>project/forward-upstrea.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Forward в недоступный upstream</b>. Файл <code>project/forward-upstrea.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить через кластерный DNS</li><li>[ ] посмотреть/исправить upstream</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/forward-upstrea.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/forward-upstrea.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig \\\\+short example\\\\.com @10</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить через кластерный DNS → посмотреть/исправить upstream.</p><h3>Проверка</h3><pre>cat project/forward-upstrea.yaml<br>проверить код</pre>`,
"root@node:~#",
[
["^dig \\+short example\\.com @10\\.96\\.0\\.10",`(timeout)`,"err"],
["^kubectl -n kube-system get cm coredns -o jsonpath=.*Corefile.*\\| grep -A2 forward",`forward . 10.0.0.53`,"warn"],
["^kubectl -n kube-system edit cm coredns",`forward . /etc/resolv.conf 8.8.8.8`,"ok"],
["^dig \\+short example\\.com @10\\.96\\.0\\.10",`93.184.216.34`,"ok"]
],
[{re:/^dig @10\.96\.0\.10/,l:"проверить через кластерный DNS"},
 {re:"forward",l:"посмотреть/исправить upstream"}],{file:"project/forward-upstrea.yaml",files:{"project/forward-upstrea.yaml":`# CoreDNS: Forward в недоступный upstream\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/forward-upstrea.yaml":`# CoreDNS: Forward в недоступный upstream — fixed\nstatus: ok\n`}},{hints:["Симптом: Forward в недоступный upstream в project/forward-upstrea.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/forward-upstrea.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/forward-upstrea.yaml.","Порядок: проверить через кластерный DNS → посмотреть/исправить upstream"]});

S("CoreDNS","cd2","ndots:5 — лишние запросы наружу","Senior",
`<h3>Контекст</h3><p>CoreDNS: <b>ndots:5 — лишние запросы наружу</b>. Работа с <code>project/ndots-5-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ndots:5 — лишние запросы наружу</b>. Файл <code>project/ndots-5-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить/исправить ndots</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ndots-5-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ndots-5-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl run d1 --rm -it --imag</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить/исправить ndots.</p><h3>Проверка</h3><pre>cat project/ndots-5-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl run d1 --rm -it --image=busybox -- cat \\/etc\\/resolv\\.conf",`options ndots:5`,"warn"],
["^(kubectl patch deploy api -p .*dnsConfig|sed -i deploy\\.yaml)",`dnsConfig ndots:2 добавлен`,"ok"],
["^kubectl -n prod exec deploy\\/api -- cat \\/etc\\/resolv\\.conf",`options ndots:2`,"ok"]
],
[{re:/ndots/,l:"проверить/исправить ndots"}],{file:"project/ndots-5-.yaml",files:{"project/ndots-5-.yaml":`# CoreDNS: ndots:5 — лишние запросы наружу\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ndots-5-.yaml":`# CoreDNS: ndots:5 — лишние запросы наружу — fixed\nstatus: ok\n`}},{hints:["Симптом: ndots:5 — лишние запросы наружу в project/ndots-5-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ndots-5-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ndots-5-.yaml.","Порядок: проверить/исправить ndots"]});

S("MetalLB","ml1","Service LoadBalancer в Pending","Middle",
`<h3>Контекст</h3><p>MetalLB: <b>Service LoadBalancer в Pending</b>. Работа с <code>project/service-loadbal.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Service LoadBalancer в Pending</b>. Файл <code>project/service-loadbal.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть причину</li><li>[ ] создать пул и анонс</li><li>[ ] проверить EXTERNAL-IP</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/service-loadbal.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/service-loadbal.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n metallb-system logs</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть причину → создать пул и анонс → проверить EXTERNAL-IP.</p><h3>Проверка</h3><pre>cat project/service-loadbal.yaml<br>проверить код</pre>`,
"root@node:~#",
[
["^kubectl -n metallb-system logs ds/speaker --tail=5",`no IP address pool available`,"err"],
["^kubectl apply -f - <<EOF.*IPAddressPool",`ipaddresspool.metallb.io/lab created`,"ok"],
["^kubectl apply -f - <<EOF.*L2Advertisement",`l2advertisement created`,"ok"],
["^kubectl get svc ingress-nginx -o jsonpath=.*loadBalancer.*ip",`192.168.88.201`,"ok"]
],
[{re:/logs ds\/speaker/,l:"увидеть причину"},
 {re:"(IPAddressPool|L2Advertisement)",l:"создать пул и анонс"},
 {re:"loadBalancer",l:"проверить EXTERNAL-IP"}],{file:"project/service-loadbal.yaml",files:{"project/service-loadbal.yaml":`# MetalLB: Service LoadBalancer в Pending\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/service-loadbal.yaml":`# MetalLB: Service LoadBalancer в Pending — fixed\nstatus: ok\n`}},{hints:["Симптом: Service LoadBalancer в Pending в project/service-loadbal.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/service-loadbal.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/service-loadbal.yaml.","Порядок: увидеть причину → создать пул и анонс → проверить EXTERNAL-IP"]});

S("HAProxy","ha1","Вывести ноду из ротации без даунтайма","Middle",
`<h3>Контекст</h3><p>HAProxy: <b>Вывести ноду из ротации без даунтайма</b>. Работа с <code>project/-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Вывести ноду из ротации без даунтайма</b>. Файл <code>project/-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] drain ноды</li><li>[ ] проверить состояние</li><li>[ ] вернуть ноду</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: drain ноды → проверить состояние → вернуть ноду.</p><h3>Проверка</h3><pre>cat project/-.yaml<br>проверить код</pre>`,
"root@lb:~#",
[
["^echo \"set server bk_api\\/api1 state maint\" \\| socat stdio \\/run\\/haproxy\\/admin\\.sock",``, "dim"],
["^echo \"show stat\" \\| socat stdio \\/run\\/haproxy\\/admin\\.sock \\| grep api1",`api1 MAINT 0 sessions`,"ok"],
["^echo \"set server bk_api\\/api1 state ready\" \\| socat stdio \\/run\\/haproxy\\/admin\\.sock",``, "dim"],
["^echo \"show stat\" \\| socat stdio \\/run\\/haproxy\\/admin\\.sock \\| grep api1",`api1 UP L7OK`,"ok"]
],
[{re:/state maint/,l:"drain ноды"},
 {re:"show stat",l:"проверить состояние"},
 {re:"state ready",l:"вернуть ноду"}],{file:"project/-.yaml",files:{"project/-.yaml":`# HAProxy: Вывести ноду из ротации без даунтайма\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-.yaml":`# HAProxy: Вывести ноду из ротации без даунтайма — fixed\nstatus: ok\n`}},{hints:["Симптом: Вывести ноду из ротации без даунтайма в project/-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-.yaml.","Порядок: drain ноды → проверить состояние → вернуть ноду"]});

S("Envoy","en1","Outlier detection выбрасывает живой upstream","Senior",
`<h3>Контекст</h3><p>Envoy: <b>Outlier detection выбрасывает живой upstream</b>. Работа с <code>project/outlier-detecti.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Outlier detection выбрасывает живой upstream</b>. Файл <code>project/outlier-detecti.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть ejection</li><li>[ ] смягчить outlierDetection</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/outlier-detecti.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/outlier-detecti.yaml</code>. Активный файл открыт в редакторе. Начните с <code>istioctl proxy-config cluster </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть ejection → смягчить outlierDetection.</p><h3>Проверка</h3><pre>cat project/outlier-detecti.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^istioctl proxy-config cluster <pod> --fqdn api",`HEALTH FLAGS: outlier ejection`,"err"],
["^kubectl exec <pod> -c istio-proxy -- curl -s localhost:15000\\/clusters \\| grep api",`cx_connect_fail: 47; ejections_active: 1`,"err"],
["^kubectl patch destinationrule api -p .*outlierDetection",`consecutive5xx: 5, interval: 10s`,"ok"],
["^curl -s localhost:15000\\/clusters \\| grep api",`ejections_active: 0`,"ok"]
],
[{re:/proxy-config cluster|15000\/clusters/,l:"увидеть ejection"},
 {re:"patch destinationrule",l:"смягчить outlierDetection"}],{file:"project/outlier-detecti.yaml",files:{"project/outlier-detecti.yaml":`# Envoy: Outlier detection выбрасывает живой upstream\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/outlier-detecti.yaml":`# Envoy: Outlier detection выбрасывает живой upstream — fixed\nstatus: ok\n`}},{hints:["Симптом: Outlier detection выбрасывает живой upstream в project/outlier-detecti.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/outlier-detecti.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/outlier-detecti.yaml.","Порядок: увидеть ejection → смягчить outlierDetection"]});

S("WireGuard","wg1","Туннель молчит — диагностика handshake","Middle",
`<h3>Контекст</h3><p>WireGuard: <b>Туннель молчит — диагностика handshake</b>. Работа с <code>project/-handshake.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Туннель молчит — диагностика handshake</b>. Файл <code>project/-handshake.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить handshake до и после</li><li>[ ] переподнять интерфейс</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-handshake.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-handshake.yaml</code>. Активный файл открыт в редакторе. Начните с <code>wg show</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить handshake до и после → переподнять интерфейс.</p><h3>Проверка</h3><pre>cat project/-handshake.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^wg show",`latest handshake: 2 hours ago; transfer: 0 B received`,"err"],
["^(wg genkey|sed -i \\/etc\\/wireguard\\/wg0\\.conf)",`ключи/конфиг обновлены`,"ok"],
["^wg-quick down wg0 && wg-quick up wg0",``, "dim"],
["^wg show",`latest handshake: 12 seconds ago; transfer: 1.2 KiB`,"ok"],
["^ping -c2 10\\.10\\.0.3",`2 packets transmitted, 2 received`,"ok"]
],
[{re:/^wg show/,l:"проверить handshake до и после"},
 {re:"wg-quick (down|up)",l:"переподнять интерфейс"}],{file:"project/-handshake.yaml",files:{"project/-handshake.yaml":`# WireGuard: Туннель молчит — диагностика handshake\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-handshake.yaml":`# WireGuard: Туннель молчит — диагностика handshake — fixed\nstatus: ok\n`}},{hints:["Симптом: Туннель молчит — диагностика handshake в project/-handshake.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-handshake.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-handshake.yaml.","Порядок: проверить handshake до и после → переподнять интерфейс"]});

S("AWS","aw1","Security Group блокирует порт","Junior",
`<h3>Контекст</h3><p>AWS: <b>Security Group блокирует порт</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Security Group блокирует порт</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить ingress-правила</li><li>[ ] открыть порт</li><li>[ ] проверить доступность</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-security-grou</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить ingress-правила → открыть порт → проверить доступность.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
["^aws ec2 describe-security-groups .*--query .*IpPermissions",`8080 отсутствует в ingress`,"err"],
["^aws ec2 authorize-security-group-ingress --group-id sg-123 --protocol tcp --port 8080 --cidr 0\\.0\\.0\\.0\\/0",`return: true`,"ok"],
["^curl -m3 -s http:\\/\\/<PUBLIC_IP>:8080\\/healthz",`ok`,"ok"]
],
[{re:/describe-security-groups/,l:"проверить ingress-правила"},
 {re:"authorize-security-group-ingress",l:"открыть порт"},
 {re:"healthz",l:"проверить доступность"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: Security Group блокирует порт\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: Security Group блокирует порт — fixed\nstatus: ok\n`}},{hints:["Симптом: Security Group блокирует порт в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: проверить ingress-правила → открыть порт → проверить доступность"]});

S("AWS","aw2","Под не видит IAM-роль (IRSA)","Senior",
`<h3>Контекст</h3><p>AWS: <b>Под не видит IAM-роль (IRSA)</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Под не видит IAM-роль (IRSA)</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] привязать роль к ServiceAccount</li><li>[ ] проверить identity из пода</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n monitoring exec dep</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: привязать роль к ServiceAccount → проверить identity из пода.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
["^kubectl -n monitoring exec deploy/thanos -- env \\| grep AWS_ROLE",`(пусто)`,"err"],
["^kubectl -n monitoring annotate sa thanos eks\\.amazonaws\\.com\\/role-arn=arn:aws:iam::123:role\\/thanos",`annotated`,"ok"],
["^kubectl -n monitoring rollout restart deploy/thanos",`restarted`,"dim"],
["^kubectl -n monitoring exec deploy/thanos -- aws sts get-caller-identity --query Arn",`arn:aws:sts::123:assumed-role/thanos`,"ok"]
],
[{re:/annotate sa/,l:"привязать роль к ServiceAccount"},
 {re:"sts get-caller-identity",l:"проверить identity из пода"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: Под не видит IAM-роль (IRSA)\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: Под не видит IAM-роль (IRSA) — fixed\nstatus: ok\n`}},{hints:["Симптом: Под не видит IAM-роль (IRSA) в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: привязать роль к ServiceAccount → проверить identity из пода"]});

S("AWS","aw3","Приватная подсеть без egress","Middle",
`<h3>Контекст</h3><p>AWS: <b>Приватная подсеть без egress</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Приватная подсеть без egress</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить маршруты</li><li>[ ] добавить маршрут к NAT</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-route-tables </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить маршруты → добавить маршрут к NAT.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
["^aws ec2 describe-route-tables --filters .*subnet-priv",`только local route`,"err"],
["^aws ec2 create-route --route-table-id rtb-priv --destination-cidr-block 0\\.0\\.0\\.0\\/0 --nat-gateway-id nat-abc",`return: true`,"ok"],
["^aws ec2 describe-route-tables --filters .*subnet-priv",`0.0.0.0/0 → nat-abc`,"ok"]
],
[{re:/describe-route-tables/,l:"проверить маршруты"},
 {re:"create-route",l:"добавить маршрут к NAT"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: Приватная подсеть без egress\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: Приватная подсеть без egress — fixed\nstatus: ok\n`}},{hints:["Симптом: Приватная подсеть без egress в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: проверить маршруты → добавить маршрут к NAT"]});

S("Cloudflare","cf1","Tunnel: origin недоступен для edge","Middle",
`<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: origin недоступен для edge</b>. Работа с <code>project/tunnel-origin-e.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: origin недоступен для edge</b>. Файл <code>project/tunnel-origin-e.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить соединения туннеля</li><li>[ ] увидеть ошибку до origin</li><li>[ ] починить origin</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-origin-e.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-origin-e.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel info grafan</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить соединения туннеля → увидеть ошибку до origin → починить origin.</p><h3>Проверка</h3><pre>cat project/tunnel-origin-e.yaml<br>проверить код</pre>`,
"root@srv:~#",
[
["^cloudflared tunnel info grafana",`connections: 0`,"err"],
["^journalctl -u cloudflared \\| tail -5",`Unable to reach origin: connection refused localhost:3000`,"err"],
["^(systemctl start grafana-server|sed -i config\\.yml)",`origin подняли/исправили ingress`,"ok"],
["^cloudflared tunnel info grafana",`connections: 4 (FRA, AMS...)`,"ok"]
],
[{re:/tunnel info/,l:"проверить соединения туннеля"},
 {re:"journalctl -u cloudflared",l:"увидеть ошибку до origin"},
 {re:"(start grafana|config\\.yml)",l:"починить origin"}],{file:"project/tunnel-origin-e.yaml",files:{"project/tunnel-origin-e.yaml":`# Cloudflare: Tunnel: origin недоступен для edge\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-origin-e.yaml":`# Cloudflare: Tunnel: origin недоступен для edge — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: origin недоступен для edge в project/tunnel-origin-e.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-origin-e.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-origin-e.yaml.","Порядок: проверить соединения туннеля → увидеть ошибку до origin → починить origin"]});

S("GitLab","gl1","Runner: verify и перерегистрация","Middle",
`<h3>Контекст</h3><p>GitLab: <b>Runner: verify и перерегистрация</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Runner: verify и перерегистрация</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] verify до и после</li><li>[ ] перерегистрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>gitlab-runner verify</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: verify до и после → перерегистрировать.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
["^gitlab-runner verify",`is not alive / token invalid`,"err"],
["^gitlab-runner register --url .*--token glrt-.*--executor docker",`Runner registered successfully`,"ok"],
["^gitlab-runner verify",`is valid, is alive`,"ok"],
["^gitlab-runner run -d",``, "dim"]
],
[{re:/^gitlab-runner verify/,l:"verify до и после"},
 {re:"^gitlab-runner register",l:"перерегистрировать"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Runner: verify и перерегистрация в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: verify до и после → перерегистрировать"]});

S("Rancher/k3s","k3s1","Агент не регистрируется: certificate SAN","Senior",
`<h3>Контекст</h3><p>Rancher/k3s: <b>Агент не регистрируется: certificate SAN</b>. Работа с <code>project/-certificate-sa.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Агент не регистрируется: certificate SAN</b>. Файл <code>project/-certificate-sa.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] подтвердить проблему SAN</li><li>[ ] добавить SAN</li><li>[ ] перегенерировать серт</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-certificate-sa.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-certificate-sa.yaml</code>. Активный файл открыт в редакторе. Начните с <code>journalctl -u k3s-agent \\\\| gr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: подтвердить проблему SAN → добавить SAN → перегенерировать серт.</p><h3>Проверка</h3><pre>cat project/-certificate-sa.yaml<br>проверить код</pre>`,
"root@node3:~#",
[
["^journalctl -u k3s-agent \\| grep -i x509",`certificate is valid for 10.0.0.11, not kube.corp.io`,"err"],
["^(sed -i \\/etc\\/rancher\\/k3s\\/config\\.yaml|echo tls-san)",`tls-san: kube.corp.io добавлен`,"ok"],
["^(systemctl restart k3s|rm .*serving-kube-apiserver\\.crt)",`сертификат перегенерирован`,"ok"],
["^journalctl -u k3s-agent \\| tail -2",`Successfully registered node`,"ok"]
],
[{re:/x509/,l:"подтвердить проблему SAN"},
 {re:"tls-san",l:"добавить SAN"},
 {re:"(restart k3s|serving-kube-apiserver)",l:"перегенерировать серт"}],{file:"project/-certificate-sa.yaml",files:{"project/-certificate-sa.yaml":`# Rancher/k3s: Агент не регистрируется: certificate SAN\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-certificate-sa.yaml":`# Rancher/k3s: Агент не регистрируется: certificate SAN — fixed\nstatus: ok\n`}},{hints:["Симптом: Агент не регистрируется: certificate SAN в project/-certificate-sa.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-certificate-sa.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-certificate-sa.yaml.","Порядок: подтвердить проблему SAN → добавить SAN → перегенерировать серт"]});

S("Proxmox","px1","Клонировать VM из шаблона","Middle",
`<h3>Контекст</h3><p>Proxmox: <b>Клонировать VM из шаблона</b>. Работа с <code>project/-vm-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Клонировать VM из шаблона</b>. Файл <code>project/-vm-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] клонировать шаблон</li><li>[ ] настроить и запустить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-vm-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-vm-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>qm clone 9000 101 --name k3s-n</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: клонировать шаблон → настроить и запустить.</p><h3>Проверка</h3><pre>cat project/-vm-.yaml<br>проверить код</pre>`,
"root@pve:~#",
[
["^qm clone 9000 101 --name k3s-node-1",`Transfering... done`,"ok"],
["^qm set 101 --memory 8192 --cores 4 --ipconfig0 ip=10\\.0\\.0\\.61\\/24,gw=10\\.0\\.0\\.1",``, "ok"],
["^qm start 101",``, "dim"],
["^qm status 101",`status: running`,"ok"]
],
[{re:/^qm clone/,l:"клонировать шаблон"},
 {re:"^qm (set|start|status)",l:"настроить и запустить"}],{file:"project/-vm-.yaml",files:{"project/-vm-.yaml":`# Proxmox: Клонировать VM из шаблона\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-vm-.yaml":`# Proxmox: Клонировать VM из шаблона — fixed\nstatus: ok\n`}},{hints:["Симптом: Клонировать VM из шаблона в project/-vm-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-vm-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-vm-.yaml.","Порядок: клонировать шаблон → настроить и запустить"]});

S("Harbor","hb1","Robot account истёк — CI падает","Middle",
`<h3>Контекст</h3><p>Harbor: <b>Robot account истёк — CI падает</b>. Работа с <code>project/robot-account-c.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Robot account истёк — CI падает</b>. Файл <code>project/robot-account-c.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] логин до и после</li><li>[ ] проверить push</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/robot-account-c.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/robot-account-c.yaml</code>. Активный файл открыт в редакторе. Начните с <code>docker login harbor\\\\.corp\\\\.i</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: логин до и после → проверить push.</p><h3>Проверка</h3><pre>cat project/robot-account-c.yaml<br>проверить код</pre>`,
"dev@ci:~$",
[
["^docker login harbor\\.corp\\.io -u robot\\$shop\\+ci",`unauthorized: authentication required`,"err"],
["^(docker login harbor\\.corp\\.io -u robot\\$shop\\+ci2|UI: Robot Accounts → New)",`новый токен получен (expiry 90d)`,"ok"],
["^docker push harbor\\.corp\\.io\\/shop\\/app:1\\.5\\.0",`digest: sha256:...`,"ok"]
],
[{re:/^docker login/,l:"логин до и после"},
 {re:"^docker push",l:"проверить push"}],{file:"project/robot-account-c.yaml",files:{"project/robot-account-c.yaml":`# Harbor: Robot account истёк — CI падает\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/robot-account-c.yaml":`# Harbor: Robot account истёк — CI падает — fixed\nstatus: ok\n`}},{hints:["Симптом: Robot account истёк — CI падает в project/robot-account-c.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/robot-account-c.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/robot-account-c.yaml.","Порядок: логин до и после → проверить push"]});

S("Renovate","rn1","Шторм из 40 PR после онбординга","Middle",
`<h3>Контекст</h3><p>Renovate: <b>Шторм из 40 PR после онбординга</b>. Работа с <code>project/-40-pr-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Шторм из 40 PR после онбординга</b>. Файл <code>project/-40-pr-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] настроить лимиты</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-40-pr-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-40-pr-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat renovate\\\\.json \\\\| jq .pr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: настроить лимиты → проверить.</p><h3>Проверка</h3><pre>cat project/-40-pr-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^cat renovate\\.json \\| jq .prConcurrentLimit",`null`,"warn"],
["^(sed -i renovate\\.json|cat > renovate\\.json)",`prConcurrentLimit: 5, major: automerge=false`,"ok"],
["^(gh pr list --label renovate \\| wc -l|renovate --dry-run)",`открытых PR: 5`,"ok"]
],
[{re:/prConcurrentLimit/,l:"настроить лимиты"},
 {re:"(gh pr list|dry-run)",l:"проверить"}],{file:"project/-40-pr-.yaml",files:{"project/-40-pr-.yaml":`# Renovate: Шторм из 40 PR после онбординга\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-40-pr-.yaml":`# Renovate: Шторм из 40 PR после онбординга — fixed\nstatus: ok\n`}},{hints:["Симптом: Шторм из 40 PR после онбординга в project/-40-pr-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-40-pr-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-40-pr-.yaml.","Порядок: настроить лимиты → проверить"]});
