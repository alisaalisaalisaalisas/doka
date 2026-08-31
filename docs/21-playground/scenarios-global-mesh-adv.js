/* Global Playground: Mesh Advanced — 35 scenarios */
S("Service Mesh","gc-mesh-1","Cilium eBPF: drop 5% пакетов, policy deny","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Cilium eBPF: drop 5% пакетов, policy deny</b>. Работа с <code>project/cilium-ebpf-dro.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cilium eBPF: drop 5% пакетов, policy deny</b>. Файл <code>project/cilium-ebpf-dro.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cilium-ebpf-dro.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cilium-ebpf-dro.yaml</code>. Активный файл открыт в редакторе. Начните с <code>bpftool prog show | grep xdp</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/cilium-ebpf-dro.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^bpftool prog show | grep xdp", "not loaded", "err"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium bpf lb list", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^bpftool prog show | grep xdp",l:"диагностика"},
 {re:"^cilium bpf lb list",l:"исправить"}],{file:"project/cilium-ebpf-dro.yaml",files:{"project/cilium-ebpf-dro.yaml":`# Service Mesh: Cilium eBPF: drop 5% пакетов, policy deny\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cilium-ebpf-dro.yaml":`# Service Mesh: Cilium eBPF: drop 5% пакетов, policy deny — fixed\nstatus: ok\n`}},{hints:["Симптом: Cilium eBPF: drop 5% пакетов, policy deny в project/cilium-ebpf-dro.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cilium-ebpf-dro.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cilium-ebpf-dro.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-2","Cilium: Hubble flow не видит traffic","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Cilium: Hubble flow не видит traffic</b>. Работа с <code>project/cilium-hubble-f.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cilium: Hubble flow не видит traffic</b>. Файл <code>project/cilium-hubble-f.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cilium-hubble-f.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cilium-hubble-f.yaml</code>. Активный файл открыт в редакторе. Начните с <code>hubble observe --since 1m | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/cilium-hubble-f.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^hubble observe --since 1m | head -20", "flow drop policy", "warn"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium connectivity test", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^hubble observe --since 1m | head -20",l:"диагностика"},
 {re:"^cilium connectivity test",l:"исправить"}],{file:"project/cilium-hubble-f.yaml",files:{"project/cilium-hubble-f.yaml":`# Service Mesh: Cilium: Hubble flow не видит traffic\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cilium-hubble-f.yaml":`# Service Mesh: Cilium: Hubble flow не видит traffic — fixed\nstatus: ok\n`}},{hints:["Симптом: Cilium: Hubble flow не видит traffic в project/cilium-hubble-f.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cilium-hubble-f.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cilium-hubble-f.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-3","Calico BGP: peer down, route not advertised","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Calico BGP: peer down, route not advertised</b>. Работа с <code>project/calico-bgp-peer.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Calico BGP: peer down, route not advertised</b>. Файл <code>project/calico-bgp-peer.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/calico-bgp-peer.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/calico-bgp-peer.yaml</code>. Активный файл открыт в редакторе. Начните с <code>calicoctl get bgpPeer -o wide</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/calico-bgp-peer.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^calicoctl get bgpPeer -o wide", "peer down", "err"],
 ["^calicoctl get ipPool -o yaml | grep blockSize", "blockSize 26", "warn"],
 ["^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'", "patched", "ok"],
 ["^calicoctl node status | grep Established", "Established", "ok"]
],
[{re:"^calicoctl get bgpPeer -o wide",l:"диагностика"},
 {re:"^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'",l:"исправить"}],{file:"project/calico-bgp-peer.yaml",files:{"project/calico-bgp-peer.yaml":`# Service Mesh: Calico BGP: peer down, route not advertised\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/calico-bgp-peer.yaml":`# Service Mesh: Calico BGP: peer down, route not advertised — fixed\nstatus: ok\n`}},{hints:["Симптом: Calico BGP: peer down, route not advertised в project/calico-bgp-peer.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/calico-bgp-peer.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/calico-bgp-peer.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-4","Calico: IPAM block 26 exhausted","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Calico: IPAM block 26 exhausted</b>. Работа с <code>project/calico-ipam-blo.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Calico: IPAM block 26 exhausted</b>. Файл <code>project/calico-ipam-blo.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/calico-ipam-blo.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/calico-ipam-blo.yaml</code>. Активный файл открыт в редакторе. Начните с <code>calicoctl get bgpPeer -o wide</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/calico-ipam-blo.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^calicoctl get bgpPeer -o wide", "peer down", "err"],
 ["^calicoctl get ipPool -o yaml | grep blockSize", "blockSize 26", "warn"],
 ["^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'", "patched", "ok"],
 ["^calicoctl node status | grep Established", "Established", "ok"]
],
[{re:"^calicoctl get bgpPeer -o wide",l:"диагностика"},
 {re:"^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'",l:"исправить"}],{file:"project/calico-ipam-blo.yaml",files:{"project/calico-ipam-blo.yaml":`# Service Mesh: Calico: IPAM block 26 exhausted\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/calico-ipam-blo.yaml":`# Service Mesh: Calico: IPAM block 26 exhausted — fixed\nstatus: ok\n`}},{hints:["Симптом: Calico: IPAM block 26 exhausted в project/calico-ipam-blo.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/calico-ipam-blo.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/calico-ipam-blo.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-5","Istio mTLS: STRICT vs PERMISSIVE 503","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Istio mTLS: STRICT vs PERMISSIVE 503</b>. Работа с <code>project/istio-mtls-stri.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Istio mTLS: STRICT vs PERMISSIVE 503</b>. Файл <code>project/istio-mtls-stri.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/istio-mtls-stri.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/istio-mtls-stri.yaml</code>. Активный файл открыт в редакторе. Начните с <code>istioctl analyze -n prod | gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/istio-mtls-stri.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^istioctl analyze -n prod | grep -A2 mTLS", "STRICT vs PERMISSIVE conflict 503", "warn"],
 ["^kubectl get peerauthentication -n prod -o yaml | grep mode", "mode PERMISSIVE", "warn"],
 ["^kubectl apply -f peerauth-strict.yaml", "applied", "ok"],
 ["^istioctl analyze -n prod | grep -c Error", "0", "ok"]
],
[{re:"^istioctl analyze -n prod | grep -A2 mTLS",l:"диагностика"},
 {re:"^kubectl apply -f peerauth-strict.yaml",l:"исправить"}],{file:"project/istio-mtls-stri.yaml",files:{"project/istio-mtls-stri.yaml":`# Service Mesh: Istio mTLS: STRICT vs PERMISSIVE 503\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/istio-mtls-stri.yaml":`# Service Mesh: Istio mTLS: STRICT vs PERMISSIVE 503 — fixed\nstatus: ok\n`}},{hints:["Симптом: Istio mTLS: STRICT vs PERMISSIVE 503 в project/istio-mtls-stri.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/istio-mtls-stri.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/istio-mtls-stri.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-6","Istio: VirtualService weight 0 vs subset","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Istio: VirtualService weight 0 vs subset</b>. Работа с <code>project/istio-virtualse.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Istio: VirtualService weight 0 vs subset</b>. Файл <code>project/istio-virtualse.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/istio-virtualse.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/istio-virtualse.yaml</code>. Активный файл открыт в редакторе. Начните с <code>istioctl analyze -n prod | gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/istio-virtualse.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^istioctl analyze -n prod | grep -A2 mTLS", "STRICT vs PERMISSIVE conflict 503", "warn"],
 ["^kubectl get peerauthentication -n prod -o yaml | grep mode", "mode PERMISSIVE", "warn"],
 ["^kubectl apply -f peerauth-strict.yaml", "applied", "ok"],
 ["^istioctl analyze -n prod | grep -c Error", "0", "ok"]
],
[{re:"^istioctl analyze -n prod | grep -A2 mTLS",l:"диагностика"},
 {re:"^kubectl apply -f peerauth-strict.yaml",l:"исправить"}],{file:"project/istio-virtualse.yaml",files:{"project/istio-virtualse.yaml":`# Service Mesh: Istio: VirtualService weight 0 vs subset\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/istio-virtualse.yaml":`# Service Mesh: Istio: VirtualService weight 0 vs subset — fixed\nstatus: ok\n`}},{hints:["Симптом: Istio: VirtualService weight 0 vs subset в project/istio-virtualse.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/istio-virtualse.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/istio-virtualse.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-7","Linkerd viz: dashboard not showing golden metrics","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Linkerd viz: dashboard not showing golden metrics</b>. Работа с <code>project/linkerd-viz-das.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Linkerd viz: dashboard not showing golden metrics</b>. Файл <code>project/linkerd-viz-das.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/linkerd-viz-das.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/linkerd-viz-das.yaml</code>. Активный файл открыт в редакторе. Начните с <code>linkerd check --proxy -n prod </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/linkerd-viz-das.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^linkerd check --proxy -n prod | head -20", "proxy not ready", "err"],
 ["^linkerd viz stat deploy -n prod | grep api", "meshed 0/3", "warn"],
 ["^kubectl annotate deploy api -n prod linkerd.io/inject=enabled", "annotated", "ok"],
 ["^linkerd check --proxy -n prod | grep -i ok", "ok", "ok"]
],
[{re:"^linkerd check --proxy -n prod | head -20",l:"диагностика"},
 {re:"^kubectl annotate deploy api -n prod linkerd.io/inject=enabled",l:"исправить"}],{file:"project/linkerd-viz-das.yaml",files:{"project/linkerd-viz-das.yaml":`# Service Mesh: Linkerd viz: dashboard not showing golden metrics\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/linkerd-viz-das.yaml":`# Service Mesh: Linkerd viz: dashboard not showing golden metrics — fixed\nstatus: ok\n`}},{hints:["Симптом: Linkerd viz: dashboard not showing golden metrics в project/linkerd-viz-das.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/linkerd-viz-das.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/linkerd-viz-das.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-8","Linkerd: opaque ports 3306 not meshed","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Linkerd: opaque ports 3306 not meshed</b>. Работа с <code>project/linkerd-opaque-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Linkerd: opaque ports 3306 not meshed</b>. Файл <code>project/linkerd-opaque-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/linkerd-opaque-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/linkerd-opaque-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>linkerd check --proxy -n prod </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/linkerd-opaque-.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^linkerd check --proxy -n prod | head -20", "proxy not ready", "err"],
 ["^linkerd viz stat deploy -n prod | grep api", "meshed 0/3", "warn"],
 ["^kubectl annotate deploy api -n prod linkerd.io/inject=enabled", "annotated", "ok"],
 ["^linkerd check --proxy -n prod | grep -i ok", "ok", "ok"]
],
[{re:"^linkerd check --proxy -n prod | head -20",l:"диагностика"},
 {re:"^kubectl annotate deploy api -n prod linkerd.io/inject=enabled",l:"исправить"}],{file:"project/linkerd-opaque-.yaml",files:{"project/linkerd-opaque-.yaml":`# Service Mesh: Linkerd: opaque ports 3306 not meshed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/linkerd-opaque-.yaml":`# Service Mesh: Linkerd: opaque ports 3306 not meshed — fixed\nstatus: ok\n`}},{hints:["Симптом: Linkerd: opaque ports 3306 not meshed в project/linkerd-opaque-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/linkerd-opaque-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/linkerd-opaque-.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-9","Traefik middleware: stripPrefix не срабатывает","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Traefik middleware: stripPrefix не срабатывает</b>. Работа с <code>project/traefik-middlew.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Traefik middleware: stripPrefix не срабатывает</b>. Файл <code>project/traefik-middlew.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/traefik-middlew.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/traefik-middlew.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get middleware -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/traefik-middlew.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^kubectl get middleware -n prod -o yaml | grep stripPrefix", "stripPrefix not applied", "err"],
 ["^kubectl get ingressroute -n prod -o yaml | grep entryPoints", "websecure 8443", "warn"],
 ["^kubectl apply -f middleware-fix.yaml", "applied", "ok"],
 ["^curl -s http://traefik.prod/metrics | grep entrypoint", "ok", "ok"]
],
[{re:"^kubectl get middleware -n prod -o yaml | grep stripPrefix",l:"диагностика"},
 {re:"^kubectl apply -f middleware-fix.yaml",l:"исправить"}],{file:"project/traefik-middlew.yaml",files:{"project/traefik-middlew.yaml":`# Service Mesh: Traefik middleware: stripPrefix не срабатывает\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/traefik-middlew.yaml":`# Service Mesh: Traefik middleware: stripPrefix не срабатывает — fixed\nstatus: ok\n`}},{hints:["Симптом: Traefik middleware: stripPrefix не срабатывает в project/traefik-middlew.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/traefik-middlew.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/traefik-middlew.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-10","Traefik: TLSStore default cert not found","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Traefik: TLSStore default cert not found</b>. Работа с <code>project/traefik-tlsstor.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Traefik: TLSStore default cert not found</b>. Файл <code>project/traefik-tlsstor.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/traefik-tlsstor.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/traefik-tlsstor.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get middleware -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/traefik-tlsstor.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^kubectl get middleware -n prod -o yaml | grep stripPrefix", "stripPrefix not applied", "err"],
 ["^kubectl get ingressroute -n prod -o yaml | grep entryPoints", "websecure 8443", "warn"],
 ["^kubectl apply -f middleware-fix.yaml", "applied", "ok"],
 ["^curl -s http://traefik.prod/metrics | grep entrypoint", "ok", "ok"]
],
[{re:"^kubectl get middleware -n prod -o yaml | grep stripPrefix",l:"диагностика"},
 {re:"^kubectl apply -f middleware-fix.yaml",l:"исправить"}],{file:"project/traefik-tlsstor.yaml",files:{"project/traefik-tlsstor.yaml":`# Service Mesh: Traefik: TLSStore default cert not found\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/traefik-tlsstor.yaml":`# Service Mesh: Traefik: TLSStore default cert not found — fixed\nstatus: ok\n`}},{hints:["Симптом: Traefik: TLSStore default cert not found в project/traefik-tlsstor.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/traefik-tlsstor.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/traefik-tlsstor.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-11","eBPF XDP: program not loaded on eth0","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>eBPF XDP: program not loaded on eth0</b>. Работа с <code>project/ebpf-xdp-progra.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>eBPF XDP: program not loaded on eth0</b>. Файл <code>project/ebpf-xdp-progra.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ebpf-xdp-progra.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ebpf-xdp-progra.yaml</code>. Активный файл открыт в редакторе. Начните с <code>bpftool prog show | grep xdp</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/ebpf-xdp-progra.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^bpftool prog show | grep xdp", "not loaded", "err"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium bpf lb list", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^bpftool prog show | grep xdp",l:"диагностика"},
 {re:"^cilium bpf lb list",l:"исправить"}],{file:"project/ebpf-xdp-progra.yaml",files:{"project/ebpf-xdp-progra.yaml":`# Service Mesh: eBPF XDP: program not loaded on eth0\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ebpf-xdp-progra.yaml":`# Service Mesh: eBPF XDP: program not loaded on eth0 — fixed\nstatus: ok\n`}},{hints:["Симптом: eBPF XDP: program not loaded on eth0 в project/ebpf-xdp-progra.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ebpf-xdp-progra.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ebpf-xdp-progra.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-12","Cilium: kube-proxy replacement strict","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Cilium: kube-proxy replacement strict</b>. Работа с <code>project/cilium-kube-pro.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cilium: kube-proxy replacement strict</b>. Файл <code>project/cilium-kube-pro.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cilium-kube-pro.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cilium-kube-pro.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cilium status --verbose | head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/cilium-kube-pro.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^cilium status --verbose | head -20", "Cilium 1/1 policy deny", "warn"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium config set kube-proxy-replacement strict", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^cilium status --verbose | head -20",l:"диагностика"},
 {re:"^cilium config set kube-proxy-replacement strict",l:"исправить"}],{file:"project/cilium-kube-pro.yaml",files:{"project/cilium-kube-pro.yaml":`# Service Mesh: Cilium: kube-proxy replacement strict\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cilium-kube-pro.yaml":`# Service Mesh: Cilium: kube-proxy replacement strict — fixed\nstatus: ok\n`}},{hints:["Симптом: Cilium: kube-proxy replacement strict в project/cilium-kube-pro.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cilium-kube-pro.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cilium-kube-pro.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-13","Calico: Typha лимит 100 nodes exceeded","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Calico: Typha лимит 100 nodes exceeded</b>. Работа с <code>project/calico-typha-10.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Calico: Typha лимит 100 nodes exceeded</b>. Файл <code>project/calico-typha-10.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/calico-typha-10.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/calico-typha-10.yaml</code>. Активный файл открыт в редакторе. Начните с <code>calicoctl get bgpPeer -o wide</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/calico-typha-10.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^calicoctl get bgpPeer -o wide", "peer down", "err"],
 ["^calicoctl get ipPool -o yaml | grep blockSize", "blockSize 26", "warn"],
 ["^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'", "patched", "ok"],
 ["^calicoctl node status | grep Established", "Established", "ok"]
],
[{re:"^calicoctl get bgpPeer -o wide",l:"диагностика"},
 {re:"^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'",l:"исправить"}],{file:"project/calico-typha-10.yaml",files:{"project/calico-typha-10.yaml":`# Service Mesh: Calico: Typha лимит 100 nodes exceeded\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/calico-typha-10.yaml":`# Service Mesh: Calico: Typha лимит 100 nodes exceeded — fixed\nstatus: ok\n`}},{hints:["Симптом: Calico: Typha лимит 100 nodes exceeded в project/calico-typha-10.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/calico-typha-10.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/calico-typha-10.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-14","Istio: PeerAuthentication portLevel","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Istio: PeerAuthentication portLevel</b>. Работа с <code>project/istio-peerauthe.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Istio: PeerAuthentication portLevel</b>. Файл <code>project/istio-peerauthe.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/istio-peerauthe.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/istio-peerauthe.yaml</code>. Активный файл открыт в редакторе. Начните с <code>istioctl analyze -n prod | gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/istio-peerauthe.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^istioctl analyze -n prod | grep -A2 mTLS", "STRICT vs PERMISSIVE conflict 503", "warn"],
 ["^kubectl get peerauthentication -n prod -o yaml | grep mode", "mode PERMISSIVE", "warn"],
 ["^kubectl apply -f peerauth-strict.yaml", "applied", "ok"],
 ["^istioctl analyze -n prod | grep -c Error", "0", "ok"]
],
[{re:"^istioctl analyze -n prod | grep -A2 mTLS",l:"диагностика"},
 {re:"^kubectl apply -f peerauth-strict.yaml",l:"исправить"}],{file:"project/istio-peerauthe.yaml",files:{"project/istio-peerauthe.yaml":`# Service Mesh: Istio: PeerAuthentication portLevel\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/istio-peerauthe.yaml":`# Service Mesh: Istio: PeerAuthentication portLevel — fixed\nstatus: ok\n`}},{hints:["Симптом: Istio: PeerAuthentication portLevel в project/istio-peerauthe.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/istio-peerauthe.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/istio-peerauthe.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-15","Linkerd: proxy inject disabled","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Linkerd: proxy inject disabled</b>. Работа с <code>project/linkerd-proxy-i.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Linkerd: proxy inject disabled</b>. Файл <code>project/linkerd-proxy-i.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/linkerd-proxy-i.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/linkerd-proxy-i.yaml</code>. Активный файл открыт в редакторе. Начните с <code>linkerd check --proxy -n prod </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/linkerd-proxy-i.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^linkerd check --proxy -n prod | head -20", "proxy not ready", "err"],
 ["^linkerd viz stat deploy -n prod | grep api", "meshed 0/3", "warn"],
 ["^kubectl annotate deploy api -n prod linkerd.io/inject=enabled", "annotated", "ok"],
 ["^linkerd check --proxy -n prod | grep -i ok", "ok", "ok"]
],
[{re:"^linkerd check --proxy -n prod | head -20",l:"диагностика"},
 {re:"^kubectl annotate deploy api -n prod linkerd.io/inject=enabled",l:"исправить"}],{file:"project/linkerd-proxy-i.yaml",files:{"project/linkerd-proxy-i.yaml":`# Service Mesh: Linkerd: proxy inject disabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/linkerd-proxy-i.yaml":`# Service Mesh: Linkerd: proxy inject disabled — fixed\nstatus: ok\n`}},{hints:["Симптом: Linkerd: proxy inject disabled в project/linkerd-proxy-i.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/linkerd-proxy-i.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/linkerd-proxy-i.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-16","Traefik: entryPoints websecure 8443","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Traefik: entryPoints websecure 8443</b>. Работа с <code>project/traefik-entrypo.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Traefik: entryPoints websecure 8443</b>. Файл <code>project/traefik-entrypo.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/traefik-entrypo.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/traefik-entrypo.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get middleware -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/traefik-entrypo.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^kubectl get middleware -n prod -o yaml | grep stripPrefix", "stripPrefix not applied", "err"],
 ["^kubectl get ingressroute -n prod -o yaml | grep entryPoints", "websecure 8443", "warn"],
 ["^kubectl apply -f middleware-fix.yaml", "applied", "ok"],
 ["^curl -s http://traefik.prod/metrics | grep entrypoint", "ok", "ok"]
],
[{re:"^kubectl get middleware -n prod -o yaml | grep stripPrefix",l:"диагностика"},
 {re:"^kubectl apply -f middleware-fix.yaml",l:"исправить"}],{file:"project/traefik-entrypo.yaml",files:{"project/traefik-entrypo.yaml":`# Service Mesh: Traefik: entryPoints websecure 8443\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/traefik-entrypo.yaml":`# Service Mesh: Traefik: entryPoints websecure 8443 — fixed\nstatus: ok\n`}},{hints:["Симптом: Traefik: entryPoints websecure 8443 в project/traefik-entrypo.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/traefik-entrypo.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/traefik-entrypo.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-17","Cilium: bandwidth manager not enabled","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Cilium: bandwidth manager not enabled</b>. Работа с <code>project/cilium-bandwidt.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cilium: bandwidth manager not enabled</b>. Файл <code>project/cilium-bandwidt.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cilium-bandwidt.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cilium-bandwidt.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cilium status --verbose | head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/cilium-bandwidt.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^cilium status --verbose | head -20", "Cilium 1/1 policy deny", "warn"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium config set kube-proxy-replacement strict", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^cilium status --verbose | head -20",l:"диагностика"},
 {re:"^cilium config set kube-proxy-replacement strict",l:"исправить"}],{file:"project/cilium-bandwidt.yaml",files:{"project/cilium-bandwidt.yaml":`# Service Mesh: Cilium: bandwidth manager not enabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cilium-bandwidt.yaml":`# Service Mesh: Cilium: bandwidth manager not enabled — fixed\nstatus: ok\n`}},{hints:["Симптом: Cilium: bandwidth manager not enabled в project/cilium-bandwidt.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cilium-bandwidt.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cilium-bandwidt.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-18","Calico: BGP password mismatch","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Calico: BGP password mismatch</b>. Работа с <code>project/calico-bgp-pass.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Calico: BGP password mismatch</b>. Файл <code>project/calico-bgp-pass.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/calico-bgp-pass.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/calico-bgp-pass.yaml</code>. Активный файл открыт в редакторе. Начните с <code>calicoctl get bgpPeer -o wide</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/calico-bgp-pass.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^calicoctl get bgpPeer -o wide", "peer down", "err"],
 ["^calicoctl get ipPool -o yaml | grep blockSize", "blockSize 26", "warn"],
 ["^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'", "patched", "ok"],
 ["^calicoctl node status | grep Established", "Established", "ok"]
],
[{re:"^calicoctl get bgpPeer -o wide",l:"диагностика"},
 {re:"^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'",l:"исправить"}],{file:"project/calico-bgp-pass.yaml",files:{"project/calico-bgp-pass.yaml":`# Service Mesh: Calico: BGP password mismatch\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/calico-bgp-pass.yaml":`# Service Mesh: Calico: BGP password mismatch — fixed\nstatus: ok\n`}},{hints:["Симптом: Calico: BGP password mismatch в project/calico-bgp-pass.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/calico-bgp-pass.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/calico-bgp-pass.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-19","Istio: DestinationRule outlierDetection","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Istio: DestinationRule outlierDetection</b>. Работа с <code>project/istio-destinati.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Istio: DestinationRule outlierDetection</b>. Файл <code>project/istio-destinati.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/istio-destinati.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/istio-destinati.yaml</code>. Активный файл открыт в редакторе. Начните с <code>istioctl analyze -n prod | gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/istio-destinati.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^istioctl analyze -n prod | grep -A2 mTLS", "STRICT vs PERMISSIVE conflict 503", "warn"],
 ["^kubectl get peerauthentication -n prod -o yaml | grep mode", "mode PERMISSIVE", "warn"],
 ["^kubectl apply -f peerauth-strict.yaml", "applied", "ok"],
 ["^istioctl analyze -n prod | grep -c Error", "0", "ok"]
],
[{re:"^istioctl analyze -n prod | grep -A2 mTLS",l:"диагностика"},
 {re:"^kubectl apply -f peerauth-strict.yaml",l:"исправить"}],{file:"project/istio-destinati.yaml",files:{"project/istio-destinati.yaml":`# Service Mesh: Istio: DestinationRule outlierDetection\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/istio-destinati.yaml":`# Service Mesh: Istio: DestinationRule outlierDetection — fixed\nstatus: ok\n`}},{hints:["Симптом: Istio: DestinationRule outlierDetection в project/istio-destinati.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/istio-destinati.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/istio-destinati.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-20","Linkerd: multicluster gateway not ready","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Linkerd: multicluster gateway not ready</b>. Работа с <code>project/linkerd-multicl.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Linkerd: multicluster gateway not ready</b>. Файл <code>project/linkerd-multicl.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/linkerd-multicl.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/linkerd-multicl.yaml</code>. Активный файл открыт в редакторе. Начните с <code>linkerd check --proxy -n prod </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/linkerd-multicl.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^linkerd check --proxy -n prod | head -20", "proxy not ready", "err"],
 ["^linkerd viz stat deploy -n prod | grep api", "meshed 0/3", "warn"],
 ["^kubectl annotate deploy api -n prod linkerd.io/inject=enabled", "annotated", "ok"],
 ["^linkerd check --proxy -n prod | grep -i ok", "ok", "ok"]
],
[{re:"^linkerd check --proxy -n prod | head -20",l:"диагностика"},
 {re:"^kubectl annotate deploy api -n prod linkerd.io/inject=enabled",l:"исправить"}],{file:"project/linkerd-multicl.yaml",files:{"project/linkerd-multicl.yaml":`# Service Mesh: Linkerd: multicluster gateway not ready\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/linkerd-multicl.yaml":`# Service Mesh: Linkerd: multicluster gateway not ready — fixed\nstatus: ok\n`}},{hints:["Симптом: Linkerd: multicluster gateway not ready в project/linkerd-multicl.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/linkerd-multicl.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/linkerd-multicl.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-21","Traefik: forwardAuth middleware 401","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Traefik: forwardAuth middleware 401</b>. Работа с <code>project/traefik-forward.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Traefik: forwardAuth middleware 401</b>. Файл <code>project/traefik-forward.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/traefik-forward.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/traefik-forward.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get middleware -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/traefik-forward.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^kubectl get middleware -n prod -o yaml | grep stripPrefix", "stripPrefix not applied", "err"],
 ["^kubectl get ingressroute -n prod -o yaml | grep entryPoints", "websecure 8443", "warn"],
 ["^kubectl apply -f middleware-fix.yaml", "applied", "ok"],
 ["^curl -s http://traefik.prod/metrics | grep entrypoint", "ok", "ok"]
],
[{re:"^kubectl get middleware -n prod -o yaml | grep stripPrefix",l:"диагностика"},
 {re:"^kubectl apply -f middleware-fix.yaml",l:"исправить"}],{file:"project/traefik-forward.yaml",files:{"project/traefik-forward.yaml":`# Service Mesh: Traefik: forwardAuth middleware 401\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/traefik-forward.yaml":`# Service Mesh: Traefik: forwardAuth middleware 401 — fixed\nstatus: ok\n`}},{hints:["Симптом: Traefik: forwardAuth middleware 401 в project/traefik-forward.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/traefik-forward.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/traefik-forward.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-22","eBPF: cilium bpf lb list stuck","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>eBPF: cilium bpf lb list stuck</b>. Работа с <code>project/ebpf-cilium-bpf.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>eBPF: cilium bpf lb list stuck</b>. Файл <code>project/ebpf-cilium-bpf.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ebpf-cilium-bpf.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ebpf-cilium-bpf.yaml</code>. Активный файл открыт в редакторе. Начните с <code>bpftool prog show | grep xdp</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/ebpf-cilium-bpf.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^bpftool prog show | grep xdp", "not loaded", "err"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium bpf lb list", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^bpftool prog show | grep xdp",l:"диагностика"},
 {re:"^cilium bpf lb list",l:"исправить"}],{file:"project/ebpf-cilium-bpf.yaml",files:{"project/ebpf-cilium-bpf.yaml":`# Service Mesh: eBPF: cilium bpf lb list stuck\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ebpf-cilium-bpf.yaml":`# Service Mesh: eBPF: cilium bpf lb list stuck — fixed\nstatus: ok\n`}},{hints:["Симптом: eBPF: cilium bpf lb list stuck в project/ebpf-cilium-bpf.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ebpf-cilium-bpf.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ebpf-cilium-bpf.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-23","Cilium: ClusterMesh apiserver not synced","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Cilium: ClusterMesh apiserver not synced</b>. Работа с <code>project/cilium-clusterm.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cilium: ClusterMesh apiserver not synced</b>. Файл <code>project/cilium-clusterm.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cilium-clusterm.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cilium-clusterm.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cilium status --verbose | head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/cilium-clusterm.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^cilium status --verbose | head -20", "Cilium 1/1 policy deny", "warn"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium config set kube-proxy-replacement strict", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^cilium status --verbose | head -20",l:"диагностика"},
 {re:"^cilium config set kube-proxy-replacement strict",l:"исправить"}],{file:"project/cilium-clusterm.yaml",files:{"project/cilium-clusterm.yaml":`# Service Mesh: Cilium: ClusterMesh apiserver not synced\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cilium-clusterm.yaml":`# Service Mesh: Cilium: ClusterMesh apiserver not synced — fixed\nstatus: ok\n`}},{hints:["Симптом: Cilium: ClusterMesh apiserver not synced в project/cilium-clusterm.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cilium-clusterm.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cilium-clusterm.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-24","Calico: Felix metrics 0","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Calico: Felix metrics 0</b>. Работа с <code>project/calico-felix-me.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Calico: Felix metrics 0</b>. Файл <code>project/calico-felix-me.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/calico-felix-me.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/calico-felix-me.yaml</code>. Активный файл открыт в редакторе. Начните с <code>calicoctl get bgpPeer -o wide</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/calico-felix-me.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^calicoctl get bgpPeer -o wide", "peer down", "err"],
 ["^calicoctl get ipPool -o yaml | grep blockSize", "blockSize 26", "warn"],
 ["^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'", "patched", "ok"],
 ["^calicoctl node status | grep Established", "Established", "ok"]
],
[{re:"^calicoctl get bgpPeer -o wide",l:"диагностика"},
 {re:"^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'",l:"исправить"}],{file:"project/calico-felix-me.yaml",files:{"project/calico-felix-me.yaml":`# Service Mesh: Calico: Felix metrics 0\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/calico-felix-me.yaml":`# Service Mesh: Calico: Felix metrics 0 — fixed\nstatus: ok\n`}},{hints:["Симптом: Calico: Felix metrics 0 в project/calico-felix-me.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/calico-felix-me.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/calico-felix-me.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-25","Istio: sidecar injection webhook fail","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Istio: sidecar injection webhook fail</b>. Работа с <code>project/istio-sidecar-i.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Istio: sidecar injection webhook fail</b>. Файл <code>project/istio-sidecar-i.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/istio-sidecar-i.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/istio-sidecar-i.yaml</code>. Активный файл открыт в редакторе. Начните с <code>istioctl analyze -n prod | gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/istio-sidecar-i.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^istioctl analyze -n prod | grep -A2 mTLS", "STRICT vs PERMISSIVE conflict 503", "warn"],
 ["^kubectl get peerauthentication -n prod -o yaml | grep mode", "mode PERMISSIVE", "warn"],
 ["^kubectl apply -f peerauth-strict.yaml", "applied", "ok"],
 ["^istioctl analyze -n prod | grep -c Error", "0", "ok"]
],
[{re:"^istioctl analyze -n prod | grep -A2 mTLS",l:"диагностика"},
 {re:"^kubectl apply -f peerauth-strict.yaml",l:"исправить"}],{file:"project/istio-sidecar-i.yaml",files:{"project/istio-sidecar-i.yaml":`# Service Mesh: Istio: sidecar injection webhook fail\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/istio-sidecar-i.yaml":`# Service Mesh: Istio: sidecar injection webhook fail — fixed\nstatus: ok\n`}},{hints:["Симптом: Istio: sidecar injection webhook fail в project/istio-sidecar-i.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/istio-sidecar-i.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/istio-sidecar-i.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-26","Linkerd: tap not working due to mTLS","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Linkerd: tap not working due to mTLS</b>. Работа с <code>project/linkerd-tap-not.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Linkerd: tap not working due to mTLS</b>. Файл <code>project/linkerd-tap-not.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/linkerd-tap-not.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/linkerd-tap-not.yaml</code>. Активный файл открыт в редакторе. Начните с <code>linkerd check --proxy -n prod </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/linkerd-tap-not.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^linkerd check --proxy -n prod | head -20", "proxy not ready", "err"],
 ["^linkerd viz stat deploy -n prod | grep api", "meshed 0/3", "warn"],
 ["^kubectl annotate deploy api -n prod linkerd.io/inject=enabled", "annotated", "ok"],
 ["^linkerd check --proxy -n prod | grep -i ok", "ok", "ok"]
],
[{re:"^linkerd check --proxy -n prod | head -20",l:"диагностика"},
 {re:"^kubectl annotate deploy api -n prod linkerd.io/inject=enabled",l:"исправить"}],{file:"project/linkerd-tap-not.yaml",files:{"project/linkerd-tap-not.yaml":`# Service Mesh: Linkerd: tap not working due to mTLS\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/linkerd-tap-not.yaml":`# Service Mesh: Linkerd: tap not working due to mTLS — fixed\nstatus: ok\n`}},{hints:["Симптом: Linkerd: tap not working due to mTLS в project/linkerd-tap-not.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/linkerd-tap-not.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/linkerd-tap-not.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-27","Traefik: rateLimit 100r/s blocks","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Traefik: rateLimit 100r/s blocks</b>. Работа с <code>project/traefik-ratelim.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Traefik: rateLimit 100r/s blocks</b>. Файл <code>project/traefik-ratelim.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/traefik-ratelim.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/traefik-ratelim.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get middleware -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/traefik-ratelim.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^kubectl get middleware -n prod -o yaml | grep stripPrefix", "stripPrefix not applied", "err"],
 ["^kubectl get ingressroute -n prod -o yaml | grep entryPoints", "websecure 8443", "warn"],
 ["^kubectl apply -f middleware-fix.yaml", "applied", "ok"],
 ["^curl -s http://traefik.prod/metrics | grep entrypoint", "ok", "ok"]
],
[{re:"^kubectl get middleware -n prod -o yaml | grep stripPrefix",l:"диагностика"},
 {re:"^kubectl apply -f middleware-fix.yaml",l:"исправить"}],{file:"project/traefik-ratelim.yaml",files:{"project/traefik-ratelim.yaml":`# Service Mesh: Traefik: rateLimit 100r/s blocks\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/traefik-ratelim.yaml":`# Service Mesh: Traefik: rateLimit 100r/s blocks — fixed\nstatus: ok\n`}},{hints:["Симптом: Traefik: rateLimit 100r/s blocks в project/traefik-ratelim.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/traefik-ratelim.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/traefik-ratelim.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-28","eBPF: XDP program attach failed","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>eBPF: XDP program attach failed</b>. Работа с <code>project/ebpf-xdp-progra.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>eBPF: XDP program attach failed</b>. Файл <code>project/ebpf-xdp-progra.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ebpf-xdp-progra.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ebpf-xdp-progra.yaml</code>. Активный файл открыт в редакторе. Начните с <code>bpftool prog show | grep xdp</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/ebpf-xdp-progra.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^bpftool prog show | grep xdp", "not loaded", "err"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium bpf lb list", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^bpftool prog show | grep xdp",l:"диагностика"},
 {re:"^cilium bpf lb list",l:"исправить"}],{file:"project/ebpf-xdp-progra.yaml",files:{"project/ebpf-xdp-progra.yaml":`# Service Mesh: eBPF: XDP program attach failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ebpf-xdp-progra.yaml":`# Service Mesh: eBPF: XDP program attach failed — fixed\nstatus: ok\n`}},{hints:["Симптом: eBPF: XDP program attach failed в project/ebpf-xdp-progra.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ebpf-xdp-progra.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ebpf-xdp-progra.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-29","Cilium: egress gateway masquerade","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Cilium: egress gateway masquerade</b>. Работа с <code>project/cilium-egress-g.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cilium: egress gateway masquerade</b>. Файл <code>project/cilium-egress-g.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cilium-egress-g.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cilium-egress-g.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cilium status --verbose | head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/cilium-egress-g.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^cilium status --verbose | head -20", "Cilium 1/1 policy deny", "warn"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium config set kube-proxy-replacement strict", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^cilium status --verbose | head -20",l:"диагностика"},
 {re:"^cilium config set kube-proxy-replacement strict",l:"исправить"}],{file:"project/cilium-egress-g.yaml",files:{"project/cilium-egress-g.yaml":`# Service Mesh: Cilium: egress gateway masquerade\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cilium-egress-g.yaml":`# Service Mesh: Cilium: egress gateway masquerade — fixed\nstatus: ok\n`}},{hints:["Симптом: Cilium: egress gateway masquerade в project/cilium-egress-g.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cilium-egress-g.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cilium-egress-g.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-30","Calico: node-to-node mesh vs route reflector","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Calico: node-to-node mesh vs route reflector</b>. Работа с <code>project/calico-node-to-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Calico: node-to-node mesh vs route reflector</b>. Файл <code>project/calico-node-to-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/calico-node-to-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/calico-node-to-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>calicoctl get bgpPeer -o wide</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/calico-node-to-.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^calicoctl get bgpPeer -o wide", "peer down", "err"],
 ["^calicoctl get ipPool -o yaml | grep blockSize", "blockSize 26", "warn"],
 ["^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'", "patched", "ok"],
 ["^calicoctl node status | grep Established", "Established", "ok"]
],
[{re:"^calicoctl get bgpPeer -o wide",l:"диагностика"},
 {re:"^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'",l:"исправить"}],{file:"project/calico-node-to-.yaml",files:{"project/calico-node-to-.yaml":`# Service Mesh: Calico: node-to-node mesh vs route reflector\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/calico-node-to-.yaml":`# Service Mesh: Calico: node-to-node mesh vs route reflector — fixed\nstatus: ok\n`}},{hints:["Симптом: Calico: node-to-node mesh vs route reflector в project/calico-node-to-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/calico-node-to-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/calico-node-to-.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-31","Istio: Ambient vs sidecar","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>Istio: Ambient vs sidecar</b>. Работа с <code>project/istio-ambient-v.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Istio: Ambient vs sidecar</b>. Файл <code>project/istio-ambient-v.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/istio-ambient-v.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/istio-ambient-v.yaml</code>. Активный файл открыт в редакторе. Начните с <code>istioctl analyze -n prod | gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/istio-ambient-v.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^istioctl analyze -n prod | grep -A2 mTLS", "STRICT vs PERMISSIVE conflict 503", "warn"],
 ["^kubectl get peerauthentication -n prod -o yaml | grep mode", "mode PERMISSIVE", "warn"],
 ["^kubectl apply -f peerauth-strict.yaml", "applied", "ok"],
 ["^istioctl analyze -n prod | grep -c Error", "0", "ok"]
],
[{re:"^istioctl analyze -n prod | grep -A2 mTLS",l:"диагностика"},
 {re:"^kubectl apply -f peerauth-strict.yaml",l:"исправить"}],{file:"project/istio-ambient-v.yaml",files:{"project/istio-ambient-v.yaml":`# Service Mesh: Istio: Ambient vs sidecar\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/istio-ambient-v.yaml":`# Service Mesh: Istio: Ambient vs sidecar — fixed\nstatus: ok\n`}},{hints:["Симптом: Istio: Ambient vs sidecar в project/istio-ambient-v.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/istio-ambient-v.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/istio-ambient-v.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-32","Linkerd: policy server 403","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Linkerd: policy server 403</b>. Работа с <code>project/linkerd-policy-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Linkerd: policy server 403</b>. Файл <code>project/linkerd-policy-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/linkerd-policy-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/linkerd-policy-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>linkerd check --proxy -n prod </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/linkerd-policy-.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^linkerd check --proxy -n prod | head -20", "proxy not ready", "err"],
 ["^linkerd viz stat deploy -n prod | grep api", "meshed 0/3", "warn"],
 ["^kubectl annotate deploy api -n prod linkerd.io/inject=enabled", "annotated", "ok"],
 ["^linkerd check --proxy -n prod | grep -i ok", "ok", "ok"]
],
[{re:"^linkerd check --proxy -n prod | head -20",l:"диагностика"},
 {re:"^kubectl annotate deploy api -n prod linkerd.io/inject=enabled",l:"исправить"}],{file:"project/linkerd-policy-.yaml",files:{"project/linkerd-policy-.yaml":`# Service Mesh: Linkerd: policy server 403\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/linkerd-policy-.yaml":`# Service Mesh: Linkerd: policy server 403 — fixed\nstatus: ok\n`}},{hints:["Симптом: Linkerd: policy server 403 в project/linkerd-policy-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/linkerd-policy-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/linkerd-policy-.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-33","Traefik: plugins not loaded","Senior", `<h3>Контекст</h3><p>Service Mesh: <b>Traefik: plugins not loaded</b>. Работа с <code>project/traefik-plugins.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Traefik: plugins not loaded</b>. Файл <code>project/traefik-plugins.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/traefik-plugins.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/traefik-plugins.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get middleware -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/traefik-plugins.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^kubectl get middleware -n prod -o yaml | grep stripPrefix", "stripPrefix not applied", "err"],
 ["^kubectl get ingressroute -n prod -o yaml | grep entryPoints", "websecure 8443", "warn"],
 ["^kubectl apply -f middleware-fix.yaml", "applied", "ok"],
 ["^curl -s http://traefik.prod/metrics | grep entrypoint", "ok", "ok"]
],
[{re:"^kubectl get middleware -n prod -o yaml | grep stripPrefix",l:"диагностика"},
 {re:"^kubectl apply -f middleware-fix.yaml",l:"исправить"}],{file:"project/traefik-plugins.yaml",files:{"project/traefik-plugins.yaml":`# Service Mesh: Traefik: plugins not loaded\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/traefik-plugins.yaml":`# Service Mesh: Traefik: plugins not loaded — fixed\nstatus: ok\n`}},{hints:["Симптом: Traefik: plugins not loaded в project/traefik-plugins.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/traefik-plugins.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/traefik-plugins.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-34","eBPF: tc filter not applied","Junior", `<h3>Контекст</h3><p>Service Mesh: <b>eBPF: tc filter not applied</b>. Работа с <code>project/ebpf-tc-filter-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>eBPF: tc filter not applied</b>. Файл <code>project/ebpf-tc-filter-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ebpf-tc-filter-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ebpf-tc-filter-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>bpftool prog show | grep xdp</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/ebpf-tc-filter-.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^bpftool prog show | grep xdp", "not loaded", "err"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium bpf lb list", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^bpftool prog show | grep xdp",l:"диагностика"},
 {re:"^cilium bpf lb list",l:"исправить"}],{file:"project/ebpf-tc-filter-.yaml",files:{"project/ebpf-tc-filter-.yaml":`# Service Mesh: eBPF: tc filter not applied\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ebpf-tc-filter-.yaml":`# Service Mesh: eBPF: tc filter not applied — fixed\nstatus: ok\n`}},{hints:["Симптом: eBPF: tc filter not applied в project/ebpf-tc-filter-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ebpf-tc-filter-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ebpf-tc-filter-.yaml.","Порядок: диагностика → исправить"]});

S("Service Mesh","gc-mesh-35","Cilium: L7 policy http 403","Middle", `<h3>Контекст</h3><p>Service Mesh: <b>Cilium: L7 policy http 403</b>. Работа с <code>project/cilium-l7-polic.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cilium: L7 policy http 403</b>. Файл <code>project/cilium-l7-polic.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cilium-l7-polic.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cilium-l7-polic.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cilium status --verbose | head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/cilium-l7-polic.yaml<br>проверить код</pre>`,
"dev@mesh:~$",
[
 ["^cilium status --verbose | head -20", "Cilium 1/1 policy deny", "warn"],
 ["^cilium config view | grep kube-proxy-replacement", "strict disabled", "warn"],
 ["^cilium config set kube-proxy-replacement strict", "set", "ok"],
 ["^cilium status | grep -i ok", "Ok", "ok"]
],
[{re:"^cilium status --verbose | head -20",l:"диагностика"},
 {re:"^cilium config set kube-proxy-replacement strict",l:"исправить"}],{file:"project/cilium-l7-polic.yaml",files:{"project/cilium-l7-polic.yaml":`# Service Mesh: Cilium: L7 policy http 403\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cilium-l7-polic.yaml":`# Service Mesh: Cilium: L7 policy http 403 — fixed\nstatus: ok\n`}},{hints:["Симптом: Cilium: L7 policy http 403 в project/cilium-l7-polic.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cilium-l7-polic.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cilium-l7-polic.yaml.","Порядок: диагностика → исправить"]});

