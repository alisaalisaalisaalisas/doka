/* Global Playground: Cloudflare — 30 scenarios */
S("Cloudflare","gc-cf-1","Tunnel: cloudflared not connected","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: cloudflared not connected</b>. Работа с <code>project/tunnel-cloudfla.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: cloudflared not connected</b>. Файл <code>project/tunnel-cloudfla.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-cloudfla.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-cloudfla.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/tunnel-cloudfla.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-1", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-1",l:"исправить"}],{file:"project/tunnel-cloudfla.yaml",files:{"project/tunnel-cloudfla.yaml":`# Cloudflare: Tunnel: cloudflared not connected\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-cloudfla.yaml":`# Cloudflare: Tunnel: cloudflared not connected — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: cloudflared not connected в project/tunnel-cloudfla.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-cloudfla.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-cloudfla.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-2","Tunnel: ingress rule missing","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: ingress rule missing</b>. Работа с <code>project/tunnel-ingress-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: ingress rule missing</b>. Файл <code>project/tunnel-ingress-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-ingress-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-ingress-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/tunnel-ingress-.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-2", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-2",l:"исправить"}],{file:"project/tunnel-ingress-.yaml",files:{"project/tunnel-ingress-.yaml":`# Cloudflare: Tunnel: ingress rule missing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-ingress-.yaml":`# Cloudflare: Tunnel: ingress rule missing — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: ingress rule missing в project/tunnel-ingress-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-ingress-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-ingress-.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-3","WAF: rule blocks legit traffic 403","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>WAF: rule blocks legit traffic 403</b>. Работа с <code>project/waf-rule-blocks.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WAF: rule blocks legit traffic 403</b>. Файл <code>project/waf-rule-blocks.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/waf-rule-blocks.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/waf-rule-blocks.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s https://api.cloudflare</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/waf-rule-blocks.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\" --output json", "check output: missing or blocked", "warn"],
 ["^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-3 --data '{\"mode\":\"disable\"}'", "fixed / updated", "ok"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "ok verified", "ok"]
],
[{re:"^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"",l:"диагностика"},
 {re:"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-3 --data '{\"mode\":\"disable\"}'",l:"исправить"}],{file:"project/waf-rule-blocks.yaml",files:{"project/waf-rule-blocks.yaml":`# Cloudflare: WAF: rule blocks legit traffic 403\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/waf-rule-blocks.yaml":`# Cloudflare: WAF: rule blocks legit traffic 403 — fixed\nstatus: ok\n`}},{hints:["Симптом: WAF: rule blocks legit traffic 403 в project/waf-rule-blocks.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/waf-rule-blocks.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/waf-rule-blocks.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-4","WAF: managed rule false positive","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>WAF: managed rule false positive</b>. Работа с <code>project/waf-managed-rul.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WAF: managed rule false positive</b>. Файл <code>project/waf-managed-rul.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/waf-managed-rul.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/waf-managed-rul.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s https://api.cloudflare</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/waf-managed-rul.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\" --output json", "check output: missing or blocked", "warn"],
 ["^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-4 --data '{\"mode\":\"disable\"}'", "fixed / updated", "ok"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "ok verified", "ok"]
],
[{re:"^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"",l:"диагностика"},
 {re:"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-4 --data '{\"mode\":\"disable\"}'",l:"исправить"}],{file:"project/waf-managed-rul.yaml",files:{"project/waf-managed-rul.yaml":`# Cloudflare: WAF: managed rule false positive\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/waf-managed-rul.yaml":`# Cloudflare: WAF: managed rule false positive — fixed\nstatus: ok\n`}},{hints:["Симптом: WAF: managed rule false positive в project/waf-managed-rul.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/waf-managed-rul.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/waf-managed-rul.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-5","DNS: CNAME not proxied","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>DNS: CNAME not proxied</b>. Работа с <code>project/dns-cname-not-p.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS: CNAME not proxied</b>. Файл <code>project/dns-cname-not-p.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-cname-not-p.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-cname-not-p.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api.corp.io +short</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/dns-cname-not-p.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^dig api.corp.io +short", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^dig api.corp.io TXT +short", "check output: missing or blocked", "warn"],
 ["^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true", "fixed / updated", "ok"],
 ["^dig api.corp.io +short", "ok verified", "ok"]
],
[{re:"^dig api.corp.io +short",l:"диагностика"},
 {re:"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true",l:"исправить"}],{file:"project/dns-cname-not-p.yaml",files:{"project/dns-cname-not-p.yaml":`# Cloudflare: DNS: CNAME not proxied\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-cname-not-p.yaml":`# Cloudflare: DNS: CNAME not proxied — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS: CNAME not proxied в project/dns-cname-not-p.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-cname-not-p.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-cname-not-p.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-6","DNS: TTL 1 Auto vs 300","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>DNS: TTL 1 Auto vs 300</b>. Работа с <code>project/dns-ttl-1-auto-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS: TTL 1 Auto vs 300</b>. Файл <code>project/dns-ttl-1-auto-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-ttl-1-auto-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-ttl-1-auto-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api.corp.io +short</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/dns-ttl-1-auto-.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^dig api.corp.io +short", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^dig api.corp.io TXT +short", "check output: missing or blocked", "warn"],
 ["^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true", "fixed / updated", "ok"],
 ["^dig api.corp.io +short", "ok verified", "ok"]
],
[{re:"^dig api.corp.io +short",l:"диагностика"},
 {re:"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true",l:"исправить"}],{file:"project/dns-ttl-1-auto-.yaml",files:{"project/dns-ttl-1-auto-.yaml":`# Cloudflare: DNS: TTL 1 Auto vs 300\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-ttl-1-auto-.yaml":`# Cloudflare: DNS: TTL 1 Auto vs 300 — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS: TTL 1 Auto vs 300 в project/dns-ttl-1-auto-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-ttl-1-auto-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-ttl-1-auto-.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-7","Zero Trust: Access policy denies user","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>Zero Trust: Access policy denies user</b>. Работа с <code>project/zero-trust-acce.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Zero Trust: Access policy denies user</b>. Файл <code>project/zero-trust-acce.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/zero-trust-acce.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/zero-trust-acce.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared access list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/zero-trust-acce.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared access list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared access list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared access policy update allow-7 --decision allow --include email:alice@corp.io", "fixed / updated", "ok"],
 ["^cloudflared access list", "ok verified", "ok"]
],
[{re:"^cloudflared access list",l:"диагностика"},
 {re:"^cloudflared access policy update allow-7 --decision allow --include email:alice@corp.io",l:"исправить"}],{file:"project/zero-trust-acce.yaml",files:{"project/zero-trust-acce.yaml":`# Cloudflare: Zero Trust: Access policy denies user\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/zero-trust-acce.yaml":`# Cloudflare: Zero Trust: Access policy denies user — fixed\nstatus: ok\n`}},{hints:["Симптом: Zero Trust: Access policy denies user в project/zero-trust-acce.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/zero-trust-acce.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/zero-trust-acce.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-8","Zero Trust: Warp device posture failed","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>Zero Trust: Warp device posture failed</b>. Работа с <code>project/zero-trust-warp.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Zero Trust: Warp device posture failed</b>. Файл <code>project/zero-trust-warp.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/zero-trust-warp.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/zero-trust-warp.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared access list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/zero-trust-warp.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared access list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared access list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared access policy update allow-8 --decision allow --include email:alice@corp.io", "fixed / updated", "ok"],
 ["^cloudflared access list", "ok verified", "ok"]
],
[{re:"^cloudflared access list",l:"диагностика"},
 {re:"^cloudflared access policy update allow-8 --decision allow --include email:alice@corp.io",l:"исправить"}],{file:"project/zero-trust-warp.yaml",files:{"project/zero-trust-warp.yaml":`# Cloudflare: Zero Trust: Warp device posture failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/zero-trust-warp.yaml":`# Cloudflare: Zero Trust: Warp device posture failed — fixed\nstatus: ok\n`}},{hints:["Симптом: Zero Trust: Warp device posture failed в project/zero-trust-warp.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/zero-trust-warp.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/zero-trust-warp.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-9","Tunnel: QUIC vs http2 fallback","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: QUIC vs http2 fallback</b>. Работа с <code>project/tunnel-quic-vs-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: QUIC vs http2 fallback</b>. Файл <code>project/tunnel-quic-vs-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-quic-vs-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-quic-vs-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/tunnel-quic-vs-.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-9", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-9",l:"исправить"}],{file:"project/tunnel-quic-vs-.yaml",files:{"project/tunnel-quic-vs-.yaml":`# Cloudflare: Tunnel: QUIC vs http2 fallback\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-quic-vs-.yaml":`# Cloudflare: Tunnel: QUIC vs http2 fallback — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: QUIC vs http2 fallback в project/tunnel-quic-vs-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-quic-vs-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-quic-vs-.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-10","WAF: rate limiting blocks API","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>WAF: rate limiting blocks API</b>. Работа с <code>project/waf-rate-limiti.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WAF: rate limiting blocks API</b>. Файл <code>project/waf-rate-limiti.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/waf-rate-limiti.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/waf-rate-limiti.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s https://api.cloudflare</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/waf-rate-limiti.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\" --output json", "check output: missing or blocked", "warn"],
 ["^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-10 --data '{\"mode\":\"disable\"}'", "fixed / updated", "ok"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "ok verified", "ok"]
],
[{re:"^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"",l:"диагностика"},
 {re:"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-10 --data '{\"mode\":\"disable\"}'",l:"исправить"}],{file:"project/waf-rate-limiti.yaml",files:{"project/waf-rate-limiti.yaml":`# Cloudflare: WAF: rate limiting blocks API\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/waf-rate-limiti.yaml":`# Cloudflare: WAF: rate limiting blocks API — fixed\nstatus: ok\n`}},{hints:["Симптом: WAF: rate limiting blocks API в project/waf-rate-limiti.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/waf-rate-limiti.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/waf-rate-limiti.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-11","DNS: DNSSEC not validated","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>DNS: DNSSEC not validated</b>. Работа с <code>project/dns-dnssec-not-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS: DNSSEC not validated</b>. Файл <code>project/dns-dnssec-not-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-dnssec-not-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-dnssec-not-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api.corp.io +short</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/dns-dnssec-not-.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^dig api.corp.io +short", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^dig api.corp.io TXT +short", "check output: missing or blocked", "warn"],
 ["^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true", "fixed / updated", "ok"],
 ["^dig api.corp.io +short", "ok verified", "ok"]
],
[{re:"^dig api.corp.io +short",l:"диагностика"},
 {re:"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true",l:"исправить"}],{file:"project/dns-dnssec-not-.yaml",files:{"project/dns-dnssec-not-.yaml":`# Cloudflare: DNS: DNSSEC not validated\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-dnssec-not-.yaml":`# Cloudflare: DNS: DNSSEC not validated — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS: DNSSEC not validated в project/dns-dnssec-not-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-dnssec-not-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-dnssec-not-.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-12","Zero Trust: Gateway DNS filtering blocks","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>Zero Trust: Gateway DNS filtering blocks</b>. Работа с <code>project/zero-trust-gate.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Zero Trust: Gateway DNS filtering blocks</b>. Файл <code>project/zero-trust-gate.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/zero-trust-gate.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/zero-trust-gate.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api.corp.io +short</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/zero-trust-gate.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^dig api.corp.io +short", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^dig api.corp.io TXT +short", "check output: missing or blocked", "warn"],
 ["^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true", "fixed / updated", "ok"],
 ["^dig api.corp.io +short", "ok verified", "ok"]
],
[{re:"^dig api.corp.io +short",l:"диагностика"},
 {re:"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true",l:"исправить"}],{file:"project/zero-trust-gate.yaml",files:{"project/zero-trust-gate.yaml":`# Cloudflare: Zero Trust: Gateway DNS filtering blocks\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/zero-trust-gate.yaml":`# Cloudflare: Zero Trust: Gateway DNS filtering blocks — fixed\nstatus: ok\n`}},{hints:["Симптом: Zero Trust: Gateway DNS filtering blocks в project/zero-trust-gate.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/zero-trust-gate.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/zero-trust-gate.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-13","Tunnel: credentials.json expired","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: credentials.json expired</b>. Работа с <code>project/tunnel-credenti.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: credentials.json expired</b>. Файл <code>project/tunnel-credenti.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-credenti.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-credenti.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/tunnel-credenti.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-13", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-13",l:"исправить"}],{file:"project/tunnel-credenti.yaml",files:{"project/tunnel-credenti.yaml":`# Cloudflare: Tunnel: credentials.json expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-credenti.yaml":`# Cloudflare: Tunnel: credentials.json expired — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: credentials.json expired в project/tunnel-credenti.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-credenti.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-credenti.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-14","WAF: custom rule regex too broad","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>WAF: custom rule regex too broad</b>. Работа с <code>project/waf-custom-rule.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WAF: custom rule regex too broad</b>. Файл <code>project/waf-custom-rule.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/waf-custom-rule.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/waf-custom-rule.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s https://api.cloudflare</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/waf-custom-rule.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\" --output json", "check output: missing or blocked", "warn"],
 ["^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-14 --data '{\"mode\":\"disable\"}'", "fixed / updated", "ok"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "ok verified", "ok"]
],
[{re:"^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"",l:"диагностика"},
 {re:"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-14 --data '{\"mode\":\"disable\"}'",l:"исправить"}],{file:"project/waf-custom-rule.yaml",files:{"project/waf-custom-rule.yaml":`# Cloudflare: WAF: custom rule regex too broad\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/waf-custom-rule.yaml":`# Cloudflare: WAF: custom rule regex too broad — fixed\nstatus: ok\n`}},{hints:["Симптом: WAF: custom rule regex too broad в project/waf-custom-rule.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/waf-custom-rule.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/waf-custom-rule.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-15","DNS: wildcard not covered","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>DNS: wildcard not covered</b>. Работа с <code>project/dns-wildcard-no.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS: wildcard not covered</b>. Файл <code>project/dns-wildcard-no.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-wildcard-no.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-wildcard-no.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api.corp.io +short</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/dns-wildcard-no.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^dig api.corp.io +short", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^dig api.corp.io TXT +short", "check output: missing or blocked", "warn"],
 ["^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true", "fixed / updated", "ok"],
 ["^dig api.corp.io +short", "ok verified", "ok"]
],
[{re:"^dig api.corp.io +short",l:"диагностика"},
 {re:"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true",l:"исправить"}],{file:"project/dns-wildcard-no.yaml",files:{"project/dns-wildcard-no.yaml":`# Cloudflare: DNS: wildcard not covered\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-wildcard-no.yaml":`# Cloudflare: DNS: wildcard not covered — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS: wildcard not covered в project/dns-wildcard-no.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-wildcard-no.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-wildcard-no.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-16","Zero Trust: service token expired","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>Zero Trust: service token expired</b>. Работа с <code>project/zero-trust-serv.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Zero Trust: service token expired</b>. Файл <code>project/zero-trust-serv.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/zero-trust-serv.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/zero-trust-serv.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared access list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/zero-trust-serv.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared access list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared access list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared access policy update allow-16 --decision allow --include email:alice@corp.io", "fixed / updated", "ok"],
 ["^cloudflared access list", "ok verified", "ok"]
],
[{re:"^cloudflared access list",l:"диагностика"},
 {re:"^cloudflared access policy update allow-16 --decision allow --include email:alice@corp.io",l:"исправить"}],{file:"project/zero-trust-serv.yaml",files:{"project/zero-trust-serv.yaml":`# Cloudflare: Zero Trust: service token expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/zero-trust-serv.yaml":`# Cloudflare: Zero Trust: service token expired — fixed\nstatus: ok\n`}},{hints:["Симптом: Zero Trust: service token expired в project/zero-trust-serv.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/zero-trust-serv.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/zero-trust-serv.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-17","Tunnel: ha with 2 replicas not balanced","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: ha with 2 replicas not balanced</b>. Работа с <code>project/tunnel-ha-with-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: ha with 2 replicas not balanced</b>. Файл <code>project/tunnel-ha-with-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-ha-with-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-ha-with-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/tunnel-ha-with-.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-17", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-17",l:"исправить"}],{file:"project/tunnel-ha-with-.yaml",files:{"project/tunnel-ha-with-.yaml":`# Cloudflare: Tunnel: ha with 2 replicas not balanced\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-ha-with-.yaml":`# Cloudflare: Tunnel: ha with 2 replicas not balanced — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: ha with 2 replicas not balanced в project/tunnel-ha-with-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-ha-with-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-ha-with-.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-18","WAF: Bot Fight Mode blocks","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>WAF: Bot Fight Mode blocks</b>. Работа с <code>project/waf-bot-fight-m.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WAF: Bot Fight Mode blocks</b>. Файл <code>project/waf-bot-fight-m.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/waf-bot-fight-m.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/waf-bot-fight-m.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s https://api.cloudflare</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/waf-bot-fight-m.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\" --output json", "check output: missing or blocked", "warn"],
 ["^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-18 --data '{\"mode\":\"disable\"}'", "fixed / updated", "ok"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "ok verified", "ok"]
],
[{re:"^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"",l:"диагностика"},
 {re:"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-18 --data '{\"mode\":\"disable\"}'",l:"исправить"}],{file:"project/waf-bot-fight-m.yaml",files:{"project/waf-bot-fight-m.yaml":`# Cloudflare: WAF: Bot Fight Mode blocks\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/waf-bot-fight-m.yaml":`# Cloudflare: WAF: Bot Fight Mode blocks — fixed\nstatus: ok\n`}},{hints:["Симптом: WAF: Bot Fight Mode blocks в project/waf-bot-fight-m.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/waf-bot-fight-m.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/waf-bot-fight-m.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-19","DNS: apex vs www","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>DNS: apex vs www</b>. Работа с <code>project/dns-apex-vs-www.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS: apex vs www</b>. Файл <code>project/dns-apex-vs-www.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-apex-vs-www.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-apex-vs-www.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api.corp.io +short</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/dns-apex-vs-www.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^dig api.corp.io +short", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^dig api.corp.io TXT +short", "check output: missing or blocked", "warn"],
 ["^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true", "fixed / updated", "ok"],
 ["^dig api.corp.io +short", "ok verified", "ok"]
],
[{re:"^dig api.corp.io +short",l:"диагностика"},
 {re:"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true",l:"исправить"}],{file:"project/dns-apex-vs-www.yaml",files:{"project/dns-apex-vs-www.yaml":`# Cloudflare: DNS: apex vs www\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-apex-vs-www.yaml":`# Cloudflare: DNS: apex vs www — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS: apex vs www в project/dns-apex-vs-www.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-apex-vs-www.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-apex-vs-www.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-20","Zero Trust: device enrollment missing","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>Zero Trust: device enrollment missing</b>. Работа с <code>project/zero-trust-devi.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Zero Trust: device enrollment missing</b>. Файл <code>project/zero-trust-devi.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/zero-trust-devi.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/zero-trust-devi.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared access list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/zero-trust-devi.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared access list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared access list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared access policy update allow-20 --decision allow --include email:alice@corp.io", "fixed / updated", "ok"],
 ["^cloudflared access list", "ok verified", "ok"]
],
[{re:"^cloudflared access list",l:"диагностика"},
 {re:"^cloudflared access policy update allow-20 --decision allow --include email:alice@corp.io",l:"исправить"}],{file:"project/zero-trust-devi.yaml",files:{"project/zero-trust-devi.yaml":`# Cloudflare: Zero Trust: device enrollment missing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/zero-trust-devi.yaml":`# Cloudflare: Zero Trust: device enrollment missing — fixed\nstatus: ok\n`}},{hints:["Симптом: Zero Trust: device enrollment missing в project/zero-trust-devi.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/zero-trust-devi.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/zero-trust-devi.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-21","Tunnel: private network route missing","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: private network route missing</b>. Работа с <code>project/tunnel-private-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: private network route missing</b>. Файл <code>project/tunnel-private-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-private-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-private-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/tunnel-private-.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-21", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-21",l:"исправить"}],{file:"project/tunnel-private-.yaml",files:{"project/tunnel-private-.yaml":`# Cloudflare: Tunnel: private network route missing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-private-.yaml":`# Cloudflare: Tunnel: private network route missing — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: private network route missing в project/tunnel-private-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-private-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-private-.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-22","WAF: logpush not enabled","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>WAF: logpush not enabled</b>. Работа с <code>project/waf-logpush-not.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WAF: logpush not enabled</b>. Файл <code>project/waf-logpush-not.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/waf-logpush-not.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/waf-logpush-not.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s https://api.cloudflare</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/waf-logpush-not.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\" --output json", "check output: missing or blocked", "warn"],
 ["^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-22 --data '{\"mode\":\"disable\"}'", "fixed / updated", "ok"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "ok verified", "ok"]
],
[{re:"^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"",l:"диагностика"},
 {re:"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-22 --data '{\"mode\":\"disable\"}'",l:"исправить"}],{file:"project/waf-logpush-not.yaml",files:{"project/waf-logpush-not.yaml":`# Cloudflare: WAF: logpush not enabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/waf-logpush-not.yaml":`# Cloudflare: WAF: logpush not enabled — fixed\nstatus: ok\n`}},{hints:["Симптом: WAF: logpush not enabled в project/waf-logpush-not.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/waf-logpush-not.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/waf-logpush-not.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-23","DNS: CAA record blocks Let's Encrypt","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>DNS: CAA record blocks Let's Encrypt</b>. Работа с <code>project/dns-caa-record-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS: CAA record blocks Let's Encrypt</b>. Файл <code>project/dns-caa-record-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-caa-record-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-caa-record-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api.corp.io +short</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/dns-caa-record-.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^dig api.corp.io +short", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^dig api.corp.io TXT +short", "check output: missing or blocked", "warn"],
 ["^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true", "fixed / updated", "ok"],
 ["^dig api.corp.io +short", "ok verified", "ok"]
],
[{re:"^dig api.corp.io +short",l:"диагностика"},
 {re:"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true",l:"исправить"}],{file:"project/dns-caa-record-.yaml",files:{"project/dns-caa-record-.yaml":`# Cloudflare: DNS: CAA record blocks Let's Encrypt\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-caa-record-.yaml":`# Cloudflare: DNS: CAA record blocks Let's Encrypt — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS: CAA record blocks Let's Encrypt в project/dns-caa-record-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-caa-record-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-caa-record-.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-24","Zero Trust: Access group include vs require","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>Zero Trust: Access group include vs require</b>. Работа с <code>project/zero-trust-acce.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Zero Trust: Access group include vs require</b>. Файл <code>project/zero-trust-acce.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/zero-trust-acce.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/zero-trust-acce.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared access list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/zero-trust-acce.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared access list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared access list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared access policy update allow-24 --decision allow --include email:alice@corp.io", "fixed / updated", "ok"],
 ["^cloudflared access list", "ok verified", "ok"]
],
[{re:"^cloudflared access list",l:"диагностика"},
 {re:"^cloudflared access policy update allow-24 --decision allow --include email:alice@corp.io",l:"исправить"}],{file:"project/zero-trust-acce.yaml",files:{"project/zero-trust-acce.yaml":`# Cloudflare: Zero Trust: Access group include vs require\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/zero-trust-acce.yaml":`# Cloudflare: Zero Trust: Access group include vs require — fixed\nstatus: ok\n`}},{hints:["Симптом: Zero Trust: Access group include vs require в project/zero-trust-acce.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/zero-trust-acce.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/zero-trust-acce.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-25","Tunnel: origin cert expired","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: origin cert expired</b>. Работа с <code>project/tunnel-origin-c.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: origin cert expired</b>. Файл <code>project/tunnel-origin-c.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-origin-c.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-origin-c.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/tunnel-origin-c.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-25", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-25",l:"исправить"}],{file:"project/tunnel-origin-c.yaml",files:{"project/tunnel-origin-c.yaml":`# Cloudflare: Tunnel: origin cert expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-origin-c.yaml":`# Cloudflare: Tunnel: origin cert expired — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: origin cert expired в project/tunnel-origin-c.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-origin-c.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-origin-c.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-26","WAF: DDoS sensitivity high","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>WAF: DDoS sensitivity high</b>. Работа с <code>project/waf-ddos-sensit.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WAF: DDoS sensitivity high</b>. Файл <code>project/waf-ddos-sensit.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/waf-ddos-sensit.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/waf-ddos-sensit.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s https://api.cloudflare</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/waf-ddos-sensit.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\" --output json", "check output: missing or blocked", "warn"],
 ["^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-26 --data '{\"mode\":\"disable\"}'", "fixed / updated", "ok"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "ok verified", "ok"]
],
[{re:"^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"",l:"диагностика"},
 {re:"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-26 --data '{\"mode\":\"disable\"}'",l:"исправить"}],{file:"project/waf-ddos-sensit.yaml",files:{"project/waf-ddos-sensit.yaml":`# Cloudflare: WAF: DDoS sensitivity high\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/waf-ddos-sensit.yaml":`# Cloudflare: WAF: DDoS sensitivity high — fixed\nstatus: ok\n`}},{hints:["Симптом: WAF: DDoS sensitivity high в project/waf-ddos-sensit.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/waf-ddos-sensit.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/waf-ddos-sensit.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-27","DNS: secondary setup not syncing","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>DNS: secondary setup not syncing</b>. Работа с <code>project/dns-secondary-s.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS: secondary setup not syncing</b>. Файл <code>project/dns-secondary-s.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-secondary-s.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-secondary-s.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api.corp.io +short</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/dns-secondary-s.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^dig api.corp.io +short", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^dig api.corp.io TXT +short", "check output: missing or blocked", "warn"],
 ["^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true", "fixed / updated", "ok"],
 ["^dig api.corp.io +short", "ok verified", "ok"]
],
[{re:"^dig api.corp.io +short",l:"диагностика"},
 {re:"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true",l:"исправить"}],{file:"project/dns-secondary-s.yaml",files:{"project/dns-secondary-s.yaml":`# Cloudflare: DNS: secondary setup not syncing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-secondary-s.yaml":`# Cloudflare: DNS: secondary setup not syncing — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS: secondary setup not syncing в project/dns-secondary-s.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-secondary-s.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-secondary-s.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-28","Zero Trust: split tunnel excludes","Junior", `<h3>Контекст</h3><p>Cloudflare: <b>Zero Trust: split tunnel excludes</b>. Работа с <code>project/zero-trust-spli.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Zero Trust: split tunnel excludes</b>. Файл <code>project/zero-trust-spli.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/zero-trust-spli.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/zero-trust-spli.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/zero-trust-spli.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared access policy update allow-28 --decision allow --include email:alice@corp.io", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared access policy update allow-28 --decision allow --include email:alice@corp.io",l:"исправить"}],{file:"project/zero-trust-spli.yaml",files:{"project/zero-trust-spli.yaml":`# Cloudflare: Zero Trust: split tunnel excludes\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/zero-trust-spli.yaml":`# Cloudflare: Zero Trust: split tunnel excludes — fixed\nstatus: ok\n`}},{hints:["Симптом: Zero Trust: split tunnel excludes в project/zero-trust-spli.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/zero-trust-spli.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/zero-trust-spli.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-29","Tunnel: health check fails","Middle", `<h3>Контекст</h3><p>Cloudflare: <b>Tunnel: health check fails</b>. Работа с <code>project/tunnel-health-c.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tunnel: health check fails</b>. Файл <code>project/tunnel-health-c.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tunnel-health-c.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tunnel-health-c.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cloudflared tunnel list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/tunnel-health-c.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^cloudflared tunnel list", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^cloudflared tunnel list --output json", "check output: missing or blocked", "warn"],
 ["^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-29", "fixed / updated", "ok"],
 ["^cloudflared tunnel list", "ok verified", "ok"]
],
[{re:"^cloudflared tunnel list",l:"диагностика"},
 {re:"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-29",l:"исправить"}],{file:"project/tunnel-health-c.yaml",files:{"project/tunnel-health-c.yaml":`# Cloudflare: Tunnel: health check fails\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tunnel-health-c.yaml":`# Cloudflare: Tunnel: health check fails — fixed\nstatus: ok\n`}},{hints:["Симптом: Tunnel: health check fails в project/tunnel-health-c.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tunnel-health-c.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tunnel-health-c.yaml.","Порядок: диагностика → исправить"]});

S("Cloudflare","gc-cf-30","WAF: skip rule for monitoring IP","Senior", `<h3>Контекст</h3><p>Cloudflare: <b>WAF: skip rule for monitoring IP</b>. Работа с <code>project/waf-skip-rule-f.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WAF: skip rule for monitoring IP</b>. Файл <code>project/waf-skip-rule-f.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/waf-skip-rule-f.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/waf-skip-rule-f.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -s https://api.cloudflare</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/waf-skip-rule-f.yaml<br>проверить код</pre>`,
"dev@cf:~$",
[
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\" --output json", "check output: missing or blocked", "warn"],
 ["^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-30 --data '{\"mode\":\"disable\"}'", "fixed / updated", "ok"],
 ["^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"", "ok verified", "ok"]
],
[{re:"^curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header \"Authorization: Bearer token\"",l:"диагностика"},
 {re:"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-30 --data '{\"mode\":\"disable\"}'",l:"исправить"}],{file:"project/waf-skip-rule-f.yaml",files:{"project/waf-skip-rule-f.yaml":`# Cloudflare: WAF: skip rule for monitoring IP\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/waf-skip-rule-f.yaml":`# Cloudflare: WAF: skip rule for monitoring IP — fixed\nstatus: ok\n`}},{hints:["Симптом: WAF: skip rule for monitoring IP в project/waf-skip-rule-f.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/waf-skip-rule-f.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/waf-skip-rule-f.yaml.","Порядок: диагностика → исправить"]});

