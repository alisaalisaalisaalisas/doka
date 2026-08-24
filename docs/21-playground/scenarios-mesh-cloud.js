/* Песочница: Istio, Cilium, Traefik, CoreDNS, MetalLB, HAProxy, Envoy, WireGuard, AWS, Cloudflare, GitLab, Rancher, Proxmox, Harbor, Renovate */
S("Istio","is1","mTLS strict сломал внешнего клиента","Senior",
`<b>Симптом:</b> клиент без sidecar получает connection reset.`,
"dev@lab:~$",
[
["^kubectl get peerauthentication -A",`default STRICT (mesh-wide)`,"warn"],
["^(kubectl apply -f - <<EOF.*PERMISSIVE|istioctl analyze)",`PeerAuthentication PERMISSIVE для namespace onboarding`,"ok"],
["^istioctl proxy-status \\| head",`SYNCED (все прокси получили конфиг)`,"ok"]
],
[{re:/peerauthentication/i,l:"найти STRICT-политику"},
 {re:"PERMISSIVE",l:"включить PERMISSIVE для переходного периода"},
 {re:"istioctl proxy-status",l:"проверить синк прокси"}]);

S("Istio","is2","Канарейка 5% через VirtualService","Middle",
`<b>Задача:</b> направить 5% трафика на v2.`,
"dev@lab:~$",
[
["^kubectl apply -f - <<EOF.*VirtualService",`virtualservice.networking.istio.io/api created`,"ok"],
["^kubectl apply -f - <<EOF.*DestinationRule",`destinationrule.networking.istio.io/api created (subsets v1,v2)`,"ok"],
["^for i in \\$\\(seq 1 20\\); do curl -s api\\/version; done \\| sort \\| uniq -c",`19 v1; 1 v2`,"ok"]
],
[{re:/VirtualService/,l:"создать VirtualService с весами"},
 {re:"DestinationRule",l:"создать subsets"},
 {re:"uniq -c",l:"проверить распределение"}]);

S("Cilium","ci1","Hubble: кто дропает пакеты","Senior",
`<b>Симптом:</b> межподовая связность частично пропала.`,
"dev@lab:~$",
[
["^hubble observe --verdict DROPPED --since 5m",`FORWARDED/DROPPED: web→api:8080 DENIED (Policy denied)`,"err"],
["^cilium policy get \\| head",`default-deny-all активен`,"warn"],
["^(kubectl apply -f allow\\.yaml|cilium policy import allow\\.yaml)",`policy imported`,"ok"],
["^hubble observe --verdict DROPPED --since 1m",`(пусто)`,"ok"]
],
[{re:/^hubble observe/,l:"увидеть дропы и причину"},
 {re:"(policy (get|import)|allow\\.yaml)",l:"проверить/поправить политику"}]);

S("Traefik","tr1","Rate limit middleware не применяется","Middle",
`<b>Симптом:</b> брутфорс проходит без ограничений.`,
"dev@lab:~$",
[
["^kubectl get ingressroute -n web -o yaml \\| grep -A2 middlewares",`(пусто) — middleware не подключён к роуту`,"err"],
["^kubectl apply -f - <<EOF.*Middleware.*rateLimit",`middleware.traefik.containo.us/rate-limit created`,"ok"],
["^(kubectl patch ingressroute|sed -i)",`middleware добавлен в route`,"ok"],
["^for i in \\$(seq 1 30); do curl -s -o \\/dev\\/null -w %{http_code} https:\\/\\/app\\/login; done",`200...200 429 429 429`,"ok"]
],
[{re:/Middleware|rateLimit/,l:"создать/проверить middleware"},
 {re:"(patch ingressroute|добавлен в route)",l:"привязать к роуту"},
 {re:"429",l:"проверить лимит"}]);

S("CoreDNS","cd1","Forward в недоступный upstream","Middle",
`<b>Симптом:</b> внешние имена не резолвятся, кластерные — ок.`,
"root@node:~#",
[
["^dig \\+short example\\.com @10\\.96\\.0\\.10",`(timeout)`,"err"],
["^kubectl -n kube-system get cm coredns -o jsonpath=.*Corefile.*\\| grep -A2 forward",`forward . 10.0.0.53`,"warn"],
["^kubectl -n kube-system edit cm coredns",`forward . /etc/resolv.conf 8.8.8.8`,"ok"],
["^dig \\+short example\\.com @10\\.96\\.0\\.10",`93.184.216.34`,"ok"]
],
[{re:/^dig @10\.96\.0\.10/,l:"проверить через кластерный DNS"},
 {re:"forward",l:"посмотреть/исправить upstream"}]);

S("CoreDNS","cd2","ndots:5 — лишние запросы наружу","Senior",
`<b>Симптом:</b> латентность внешних вызовов +200мс.`,
"dev@lab:~$",
[
["^kubectl run d1 --rm -it --image=busybox -- cat \\/etc\\/resolv\\.conf",`options ndots:5`,"warn"],
["^(kubectl patch deploy api -p .*dnsConfig|sed -i deploy\\.yaml)",`dnsConfig ndots:2 добавлен`,"ok"],
["^kubectl -n prod exec deploy\\/api -- cat \\/etc\\/resolv\\.conf",`options ndots:2`,"ok"]
],
[{re:/ndots/,l:"проверить/исправить ndots"}]);

S("MetalLB","ml1","Service LoadBalancer в Pending","Middle",
`<b>Симптом:</b> EXTERNAL-IP <pending>.`,
"root@node:~#",
[
["^kubectl -n metallb-system logs ds/speaker --tail=5",`no IP address pool available`,"err"],
["^kubectl apply -f - <<EOF.*IPAddressPool",`ipaddresspool.metallb.io/lab created`,"ok"],
["^kubectl apply -f - <<EOF.*L2Advertisement",`l2advertisement created`,"ok"],
["^kubectl get svc ingress-nginx -o jsonpath=.*loadBalancer.*ip",`192.168.88.201`,"ok"]
],
[{re:/logs ds\/speaker/,l:"увидеть причину"},
 {re:"(IPAddressPool|L2Advertisement)",l:"создать пул и анонс"},
 {re:"loadBalancer",l:"проверить EXTERNAL-IP"}]);

S("HAProxy","ha1","Вывести ноду из ротации без даунтайма","Middle",
`<b>Задача:</b> drain api1, проверить, потом вернуть.`,
"root@lb:~#",
[
["^echo \"set server bk_api\\/api1 state maint\" \\| socat stdio \\/run\\/haproxy\\/admin\\.sock",``, "dim"],
["^echo \"show stat\" \\| socat stdio \\/run\\/haproxy\\/admin\\.sock \\| grep api1",`api1 MAINT 0 sessions`,"ok"],
["^echo \"set server bk_api\\/api1 state ready\" \\| socat stdio \\/run\\/haproxy\\/admin\\.sock",``, "dim"],
["^echo \"show stat\" \\| socat stdio \\/run\\/haproxy\\/admin\\.sock \\| grep api1",`api1 UP L7OK`,"ok"]
],
[{re:/state maint/,l:"drain ноды"},
 {re:"show stat",l:"проверить состояние"},
 {re:"state ready",l:"вернуть ноду"}]);

S("Envoy","en1","Outlier detection выбрасывает живой upstream","Senior",
`<b>Симптом:</b> 503 от ingress, api здоров.`,
"dev@lab:~$",
[
["^istioctl proxy-config cluster <pod> --fqdn api",`HEALTH FLAGS: outlier ejection`,"err"],
["^kubectl exec <pod> -c istio-proxy -- curl -s localhost:15000\\/clusters \\| grep api",`cx_connect_fail: 47; ejections_active: 1`,"err"],
["^kubectl patch destinationrule api -p .*outlierDetection",`consecutive5xx: 5, interval: 10s`,"ok"],
["^curl -s localhost:15000\\/clusters \\| grep api",`ejections_active: 0`,"ok"]
],
[{re:/proxy-config cluster|15000\/clusters/,l:"увидеть ejection"},
 {re:"patch destinationrule",l:"смягчить outlierDetection"}]);

S("WireGuard","wg1","Туннель молчит — диагностика handshake","Middle",
`<b>Симптом:</b> пинг до пира не идёт.`,
"root@lab:~#",
[
["^wg show",`latest handshake: 2 hours ago; transfer: 0 B received`,"err"],
["^(wg genkey|sed -i \\/etc\\/wireguard\\/wg0\\.conf)",`ключи/конфиг обновлены`,"ok"],
["^wg-quick down wg0 && wg-quick up wg0",``, "dim"],
["^wg show",`latest handshake: 12 seconds ago; transfer: 1.2 KiB`,"ok"],
["^ping -c2 10\\.10\\.0.3",`2 packets transmitted, 2 received`,"ok"]
],
[{re:/^wg show/,l:"проверить handshake до и после"},
 {re:"wg-quick (down|up)",l:"переподнять интерфейс"}]);

S("AWS","aw1","Security Group блокирует порт","Junior",
`<b>Симптом:</b> инстанс не принимает 8080.`,
"dev@aws:~$",
[
["^aws ec2 describe-security-groups .*--query .*IpPermissions",`8080 отсутствует в ingress`,"err"],
["^aws ec2 authorize-security-group-ingress --group-id sg-123 --protocol tcp --port 8080 --cidr 0\\.0\\.0\\.0\\/0",`return: true`,"ok"],
["^curl -m3 -s http:\\/\\/<PUBLIC_IP>:8080\\/healthz",`ok`,"ok"]
],
[{re:/describe-security-groups/,l:"проверить ingress-правила"},
 {re:"authorize-security-group-ingress",l:"открыть порт"},
 {re:"healthz",l:"проверить доступность"}]);

S("AWS","aw2","Под не видит IAM-роль (IRSA)","Senior",
`<b>Симптом:</b> NoCredentialProviders в поде.`,
"dev@aws:~$",
[
["^kubectl -n monitoring exec deploy/thanos -- env \\| grep AWS_ROLE",`(пусто)`,"err"],
["^kubectl -n monitoring annotate sa thanos eks\\.amazonaws\\.com\\/role-arn=arn:aws:iam::123:role\\/thanos",`annotated`,"ok"],
["^kubectl -n monitoring rollout restart deploy/thanos",`restarted`,"dim"],
["^kubectl -n monitoring exec deploy/thanos -- aws sts get-caller-identity --query Arn",`arn:aws:sts::123:assumed-role/thanos`,"ok"]
],
[{re:/annotate sa/,l:"привязать роль к ServiceAccount"},
 {re:"sts get-caller-identity",l:"проверить identity из пода"}]);

S("AWS","aw3","Приватная подсеть без egress","Middle",
`<b>Симптом:</b> инстанс в приватной подсети не качает пакеты.`,
"dev@aws:~$",
[
["^aws ec2 describe-route-tables --filters .*subnet-priv",`только local route`,"err"],
["^aws ec2 create-route --route-table-id rtb-priv --destination-cidr-block 0\\.0\\.0\\.0\\/0 --nat-gateway-id nat-abc",`return: true`,"ok"],
["^aws ec2 describe-route-tables --filters .*subnet-priv",`0.0.0.0/0 → nat-abc`,"ok"]
],
[{re:/describe-route-tables/,l:"проверить маршруты"},
 {re:"create-route",l:"добавить маршрут к NAT"}]);

S("Cloudflare","cf1","Tunnel: origin недоступен для edge","Middle",
`<b>Симптом:</b> 502 от CF на grafana.company.io.`,
"root@srv:~#",
[
["^cloudflared tunnel info grafana",`connections: 0`,"err"],
["^journalctl -u cloudflared \\| tail -5",`Unable to reach origin: connection refused localhost:3000`,"err"],
["^(systemctl start grafana-server|sed -i config\\.yml)",`origin подняли/исправили ingress`,"ok"],
["^cloudflared tunnel info grafana",`connections: 4 (FRA, AMS...)`,"ok"]
],
[{re:/tunnel info/,l:"проверить соединения туннеля"},
 {re:"journalctl -u cloudflared",l:"увидеть ошибку до origin"},
 {re:"(start grafana|config\\.yml)",l:"починить origin"}]);

S("GitLab","gl1","Runner: verify и перерегистрация","Middle",
`<b>Симптом:</b> job'ы не берутся раннером.`,
"dev@lab:~$",
[
["^gitlab-runner verify",`is not alive / token invalid`,"err"],
["^gitlab-runner register --url .*--token glrt-.*--executor docker",`Runner registered successfully`,"ok"],
["^gitlab-runner verify",`is valid, is alive`,"ok"],
["^gitlab-runner run -d",``, "dim"]
],
[{re:/^gitlab-runner verify/,l:"verify до и после"},
 {re:"^gitlab-runner register",l:"перерегистрировать"}]);

S("Rancher/k3s","k3s1","Агент не регистрируется: certificate SAN","Senior",
`<b>Симптом:</b> агент: x509 certificate valid for 10.0.0.11, not kube.corp.io.`,
"root@node3:~#",
[
["^journalctl -u k3s-agent \\| grep -i x509",`certificate is valid for 10.0.0.11, not kube.corp.io`,"err"],
["^(sed -i \\/etc\\/rancher\\/k3s\\/config\\.yaml|echo tls-san)",`tls-san: kube.corp.io добавлен`,"ok"],
["^(systemctl restart k3s|rm .*serving-kube-apiserver\\.crt)",`сертификат перегенерирован`,"ok"],
["^journalctl -u k3s-agent \\| tail -2",`Successfully registered node`,"ok"]
],
[{re:/x509/,l:"подтвердить проблему SAN"},
 {re:"tls-san",l:"добавить SAN"},
 {re:"(restart k3s|serving-kube-apiserver)",l:"перегенерировать серт"}]);

S("Proxmox","px1","Клонировать VM из шаблона","Middle",
`<b>Задача:</b> создать k3s-ноду из шаблона 9000.`,
"root@pve:~#",
[
["^qm clone 9000 101 --name k3s-node-1",`Transfering... done`,"ok"],
["^qm set 101 --memory 8192 --cores 4 --ipconfig0 ip=10\\.0\\.0\\.61\\/24,gw=10\\.0\\.0\\.1",``, "ok"],
["^qm start 101",``, "dim"],
["^qm status 101",`status: running`,"ok"]
],
[{re:/^qm clone/,l:"клонировать шаблон"},
 {re:"^qm (set|start|status)",l:"настроить и запустить"}]);

S("Harbor","hb1","Robot account истёк — CI падает","Middle",
`<b>Симптом:</b> docker push: unauthorized.`,
"dev@ci:~$",
[
["^docker login harbor\\.corp\\.io -u robot\\$shop\\+ci",`unauthorized: authentication required`,"err"],
["^(docker login harbor\\.corp\\.io -u robot\\$shop\\+ci2|UI: Robot Accounts → New)",`новый токен получен (expiry 90d)`,"ok"],
["^docker push harbor\\.corp\\.io\\/shop\\/app:1\\.5\\.0",`digest: sha256:...`,"ok"]
],
[{re:/^docker login/,l:"логин до и после"},
 {re:"^docker push",l:"проверить push"}]);

S("Renovate","rn1","Шторм из 40 PR после онбординга","Middle",
`<b>Симптом:</b> Renovate открыл десятки PR, ревью парализовано.`,
"dev@lab:~$",
[
["^cat renovate\\.json \\| jq .prConcurrentLimit",`null`,"warn"],
["^(sed -i renovate\\.json|cat > renovate\\.json)",`prConcurrentLimit: 5, major: automerge=false`,"ok"],
["^(gh pr list --label renovate \\| wc -l|renovate --dry-run)",`открытых PR: 5`,"ok"]
],
[{re:/prConcurrentLimit/,l:"настроить лимиты"},
 {re:"(gh pr list|dry-run)",l:"проверить"}]);
