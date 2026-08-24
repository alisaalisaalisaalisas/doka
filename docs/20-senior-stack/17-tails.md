# 🧩 20.17 Хвосты стека: Linkerd, Locust, Grype/Snyk, CRI-O

> Финальное дополнение — закрывает последние позиции исходного списка технологий. Каждая — компактный deep-dive уровня собеседования.

**Оглавление:** [Linkerd](#linkerd-mesh-без-лишнего) · [Locust](#locust-нагрузка-на-python) · [Grype/Snyk](#grype--snyk-сканеры-уязвимостей) · [CRI-O](#cri-o-runtime-только-для-kubernetes) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## Linkerd: mesh без лишнего

### Теория

Linkerd — самый «лёгкий» service mesh: data-plane на **Rust** (linkerd2-proxy, ~10MB, p99 накладные расходы < 1ms), установка одной командой, golden-метрики из коробки.

| | **Linkerd** | **Istio** |
| :--- | :--- | :--- |
| Data plane | Rust-прокси, минимален | Envoy (мощнее, тяжелее) |
| Настройка | почти нулевая (zero-config mTLS) | огромная (VirtualService/DestinationRule/...) |
| Фичи | mTLS, retries, timeouts, authz policy, multicluster | + fault injection, WASM, advanced traffic mgmt |
| Ресурсы на под | ~10MB RAM | ~100MB RAM |
| Когда выбирать | «нужен mTLS + наблюдаемость без боли» | нужны продвинутые traffic-фильтры, экосистема |

**Архитектура:** `linkerd-controller` (destination, identity, proxy-injector) + sidecar-прокси в каждом поде (inject через annotation `linkerd.io/inject: enabled`). Ambient/sidecar-less у Linkerd нет — есть «workload extension» для отдельных случаев (проверить актуальное состояние в docs).

### Конфигурация и Troubleshooting

```bash
linkerd install --crds | kubectl apply -f -
linkerd install | kubectl apply -f -
linkerd inject deploy.yaml | kubectl apply -f -      # или annotation
linkerd check                                        # полная проверка mesh!

# mTLS: все ли связи зашифрованы?
linkerd viz stat deploy -n prod --from src --to dst
#   столбец SECURED: ✅/✗
linkerd viz tap deploy/api -n prod | grep tls=       # живой трафик

# Авторизация (Server/ServerAuthorization CRD):
kubectl apply -f - <<'EOF'
apiVersion: policy.linkerd.io/v1beta1
kind: Server
metadata: { name: api-8080, namespace: prod }
spec: { podSelector: { matchLabels: { app: api } }, port: 8080 }
---
apiVersion: policy.linkerd.io/v1beta1
kind: ServerAuthorization
metadata: { name: web-to-api, namespace: prod }
spec:
  server: api-8080
  client: { meshTLS: { serviceAccounts: [{ name: web, namespace: prod }] } }
EOF

# Диагностика: прокси не инжектится?
linkerd inject --manual deploy.yaml    # что ДОЛЖНО добавиться
kubectl get ns prod -o jsonpath='{.metadata.labels}'   # linkerd.io/inject: enabled?
```

---

## Locust: нагрузка на Python

### Теория

Locust — нагрузочный тест **кодом на Python**: пользовательские сценарии любой сложности (логин → корзина → чек-out с ветвлениями), распределённый режим master/worker из коробки.

| | **k6** (см. [20.4](04-infra-testing.md)) | **Locust** |
| :--- | :--- | :--- |
| Язык | JS (быстрый движок Go) | Python (гибкость, библиотеки) |
| Сложные сценарии | средне | **отлично** (классы, наследование, любые API) |
| RPS на инстанс | высокий | ниже (GIL) — нужен distributed |
| UI | нет (Grafana) | встроенный веб-UI :8089 |
| Когда | CI-гейты, простые профили | бизнес-сценарии, прототипирование нагрузки |

### Синтаксис и distributed

```python
# locustfile.py
from locust import HttpUser, task, between

class ShopUser(HttpUser):
    wait_time = between(1, 3)                     # think-time

    def on_start(self):                           # логин один раз на виртуального юзера
        self.client.post("/login", json={"u": "load", "p": "test"})

    @task(3)                                      # вес: 3:1
    def browse(self):
        self.client.get("/api/products", name="GET /products")   # name = тег для статистики

    @task(1)
    def checkout(self):
        with self.client.post("/api/checkout", catch_response=True) as r:
            if r.status_code == 201 and "order_id" in r.json():
                r.success()
            else:
                r.failure(f"bad checkout: {r.status_code}")
```

```bash
# Headless в CI
locust -f locustfile.py --headless -u 50 -r 10 --run-time 3m --host https://staging.shop.io \
  --html report.html --only-summary

# Распределённо: master + N workers (каждый worker = отдельная машина/процесс)
locust -f locustfile.py --master --expect-workers 4
locust -f locustfile.py --worker --master-host=10.0.0.5
#   1000 VU / 4 workers = 250 VU на каждого; UI на master:8089
```

**Частые ошибки:** забыли `wait_time` (closed-loop шторм без think-time); `name` не задан → URL с ID замусорили статистику; один worker на 2 vCPU для 5000 VU → упор в генератор (см. 20.4).

---

## Grype / Snyk: сканеры уязвимостей

### Теория

| | **Trivy** ([10.1](../10-security-and-cloud/01-devsecops-and-secrets.md)) | **Grype** (Anchore) | **Snyk** |
| :--- | :--- | :--- | :--- |
| Модель | all-in-one (образы, IaC, секреты) | SBOM-центричный: ест Syft SBOM | SaaS-платформа SCA |
| Сильная сторона | один инструмент на всё | точный матчинг по SBOM, оффлайн-БД | fix-PR'ы, мониторинг проектов, приоритизация reachability |
| Цена | OSS | OSS | коммерческий (free tier) |
| Связка | CI-гейт | `syft → grype` (стандарт SBOM-пайпа) | зависимости приложений, IDE |

**SBOM-конвейер (стандарт индустрии):**

```bash
syft packages dir:. -o cyclonedx-json > sbom.json     # что внутри
grype sbom:sbom.json --fail-on high                   # что уязвимо (гейт CI)
grype registry:harbor.corp.io/shop/app:1.4.2 --only-fixed   # только с фиксом
grype sbom:sbom.json -o json | jq '[.matches[] | select(.vulnerability.severity=="Critical")] | length'
```

**Snyk в CI:** `snyk test` (разово), `snyk monitor` (непрерывный мониторинг новых CVE в уже задействованных зависимостях), `snyk fix`/PR'ы. Политики: игнорирование с TTL и обоснованием (`--policy-path=.snyk`).

**Частые ошибки:** сканировать только образ, забыв зависимости приложения (SCA); гейт на Critical без учёта `--only-fixed` (нечего фиксить — блокируем релиз навсегда); игноры без TTL → вечный техдолг.

---

## CRI-O: runtime только для Kubernetes

### Теория

CRI-O — контейнерный runtime, реализующий **только CRI** (Kubernetes Container Runtime Interface). Без Docker-совместимости, без swarm — минимум поверхности. Дефолт в **OpenShift**.

| | **containerd** | **CRI-O** |
| :--- | :--- | :--- |
| Наследие | из Docker (плагины, широкая экосистема) | чистый K8s-фокус (RedHat) |
| Конфиг | TOML, богатый | `/etc/containers/registries.conf` (общий с Podman!) |
| Рантаймы | runc/crun + shim'ы | crun/runc/kata |
| CLI отладки | crictl + ctr/nerdctl | crictl |
| Когда | дефолт k8s-мира | OpenShift, минимализм, Podman-экосистема |

### Диагностика

```bash
crictl ps -a | head                    # поды-контейнеры (как docker ps)
crictl images | head
crictl logs <container-id>
crictl exec -it <id> sh
crictl info | jq '.status.conditions'  # статус runtime

# Конфигурация registry (общая с Podman!):
cat /etc/containers/registries.conf
#   [[registry]] prefix="harbor.corp.io" insecure=false
#   [[registry.mirror]] location="harbor-mirror.corp.io"

journalctl -u crio | grep -iE "error|pull" | tail
#  "image not found" → registries.conf / auth (`crictl pull` с --creds для теста)
```

---

## 2.5 Проверь себя — 5 вопросов

**В1. Команда хочет «mTLS между всеми сервисами и golden-метрики, без изучения 40 CRD». Linkerd или Istio — и почему?**

<details><summary>Ответ</summary>
Linkerd: zero-config mTLS включается инжектом sidecar'а, golden-метрики (RPS/latency/success rate) идут из коробки, Rust-прокси лёгок. Istio оправдан, когда нужны продвинутые фичи Envoy (fault injection, WASM-фильтры, тонкий traffic shaping).
</details>

**В2. Найдите ошибку: Locust-тест без wait_time даёт «5000 RPS», а прод держит 800 при том же числе пользователей.**

<details><summary>Ответ</summary>
Нет wait_time (think-time): каждый виртуальный пользователь гонит запросы без пауз — это closed-loop шторм, а не модель людей. Реальные пользователи «думают» 1-3с; без этого профиль нагрузки и латентность нерепрезентативны.
</details>

**В3. Чем Grype-подход «SBOM → скан» лучше прямого сканирования образа?**

<details><summary>Ответ</summary>
SBOM (от Syft) строится один раз и переиспользуется: сканировать можно оффлайн (локальная CVE-БД), перепроверять старые артефакты при новых CVE без пересборки, прикладывать SBOM к поставке (compliance). Прямой скан — одноразовая операция «здесь и сейчас».
</details>

**В4. Зачем CRI-O общий `/etc/containers/registries.conf` с Podman, и что это даёт эксплуатации?**

<details><summary>Ответ</summary>
Один источник конфигурации registry (mirrors, insecure, auth) для рантайма кластера и для ручной работы инженера через Podman на той же ноде. Отладка «почему pull падает» идентична в обоих случаях — меньше когнитивной нагрузки.
</details>

**В5. Сценарий: в CI гейт `grype --fail-on critical` блокирует релиз, но все Critical — в базовом образе distroless, фиксов ещё нет. Что делать?**

<details><summary>Ответ</summary>
Гейт с `--only-fixed` (блокировать только уязвимости с доступным фиксом) + временный игнор с TTL и обоснованием в .grype.yaml + апгрейд базового образа в бэклоге. Блокировать релиз навсегда из-за нефиксируемого CVE — путь к отключению сканера.
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: Linkerd — mTLS и авторизация за 15 минут

```bash
# Шаг 0: кластер kind + demo-app (podinfo)
linkerd install --crds | kubectl apply -f - && linkerd install | kubectl apply -f -
linkerd check                                        # все галочки ✅
kubectl create ns prod
kubectl -n prod create deploy api --image=ghcr.io/stefanprodan/podinfo:latest
kubectl -n prod create deploy web --image=nginx:1.27

# Шаг 1: инжект sidecar'ов
kubectl -n prod get deploy -o yaml | linkerd inject - | kubectl apply -f -
kubectl -n prod get pods                             # 2/2 Running (app + linkerd-proxy)

# Шаг 2: проверить mTLS
linkerd viz stat deploy -n prod
#   SECURED: ✅ (после первого трафика между подами)
kubectl -n prod exec deploy/web -c linkerd-proxy -- curl -s localhost:4191/metrics | grep tls

# Шаг 3: ServerAuthorization — только web может ходить в api:8080
kubectl apply -f - <<'EOF'
apiVersion: policy.linkerd.io/v1beta1
kind: Server
metadata: { name: api-8080, namespace: prod }
spec: { podSelector: { matchLabels: { app: api } }, port: 9898 }
---
apiVersion: policy.linkerd.io/v1beta1
kind: ServerAuthorization
metadata: { name: web-only, namespace: prod }
spec:
  server: api-8080
  client: { meshTLS: { serviceAccounts: [{ name: web }] } }
EOF
# Шаг 4: под БЕЗ авторизации получает отказ — это и есть zero-trust ✅
```

**Проверь себя:** `linkerd viz stat deploy -n prod` — SECURED ✅; под без ServerAuthorization при запросе к api:9898 получает отказ (в логах прокси `Forbidden`).

**Разбор:** mTLS включается инжектом (нулевая конфигурация), а Server/ServerAuthorization — декларативный zero-trust: «кто может звонить в этот порт». Аналог Kyverno для трафика (см. [20.1](01-policy-as-code.md)).

### Задание 2: Locust — распределённый прогон с бизнес-сценарием

```bash
# Шаг 1: locustfile (стартовое состояние) — из раздела 2.2
pip install locust
# Шаг 2: smoke локально
locust -f locustfile.py --headless -u 5 -r 1 --run-time 30s \
  --host https://staging.shop.io --html smoke.html
#   Ожидание в конце: Aggregated ... 0 failures ✅

# Шаг 3: распределённо (2 процесса на одной машине = имитация workers)
locust -f locustfile.py --master --expect-workers 2 &
sleep 5
locust -f locustfile.py --worker --master-host=localhost &
locust -f locustfile.py --worker --master-host=localhost &
# Шаг 4: UI на http://localhost:8089 → Start: 200 users, spawn 20/s
#   Смотрите RPS/p95 в реальном времени; workers показывают users/2 каждый
```

**Проверь себя:** в UI master'а — Workers: 2, суммарные Users: 200; `name="GET /products"` сгруппировал статистику (нет URL с ID); при `catch_response` битые checkout'ы считаются failures, а не просто 4xx.

**Разбор:** master/worker — путь к тысячам VU: генераторы масштабируются горизонтально, статистика агрегируется на master. `name=` — критично: без него каждый URL товара = отдельная строка статистики.

### Задание 3: Supply-chain гейт: syft → grype → политика

```bash
# Шаг 0: цель — любой локальный образ (соберите demo из Lab 02 или возьмите alpine)
docker pull alpine:3.20

# Шаг 1: SBOM
syft packages alpine:3.20 -o cyclonedx-json=sbom.json
jq '.components | length' sbom.json        # ~15-20 пакетов

# Шаг 2: скан с гейтом
grype sbom:sbom.json --fail-on high; echo "gate=$?"
#   Ожидание: таблица CVE; exit 1 если есть High/Critical с фиксом

# Шаг 3: только фиксируемые + JSON для отчёта
grype sbom:sbom.json --only-fixed -o json | \
  jq '{critical: [.matches[]|select(.vulnerability.severity=="Critical")]|length,
       high:     [.matches[]|select(.vulnerability.severity=="High")]|length}'
# Шаг 4: политика игноров с TTL (.grype.yaml в репо):
#   ignore:
#     - vulnerability: CVE-2024-XXXX
#       fix-state: not-fixed
#       expires: 2026-12-31          # игнор протухнет сам
#       reason: "ждём апдейт base image, тикет SEC-123"
grype sbom:sbom.json --file .grype.yaml --fail-on high
```

**Проверь себя:** `grype --fail-on high` возвращает exit-код, который можно поставить в CI (`allow_failure: false` в GitLab); игнор с истёкшим TTL снова начинает падать — политика самовыдворяется.

**Разбор:** связка syft(SBOM)→grype(матчинг)→политика(TTL-игноры) — воспроизводимый supply-chain-гейт: один и тот же SBOM сканируется при новых CVE без пересборки образа. Snyk добавляет сверху fix-PR'ы и reachability-анализ.

---

*Далее: [Тренажёр вопросов — все 200+ карточек](../22-trainer/index.md) · [Песочница: терминал и редактор](../21-playground/index.md)*
