# 🤠 20.14 Rancher и k3s: лёгкий Kubernetes и управление флотом

> Уровень: Middle→Senior. k3s — стандарт для edge/малых кластеров; Rancher — панель управления флотом кластеров. Вместе — платформа для distributed-инфраструктуры.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### k3s: Kubernetes в одном бинарнике

k3s (SUSE/Rancher) — сертифицированный K8s ~70MB: всё в одном процессе (apiserver+etcd/kine+controller+scheduler+kubelet+containerd), встроенные Traefik (ingress) и ServiceLB (Klipper).

**Хранилище состояния:**
- Single server → **SQLite** (через kine — перевод K8s-API в SQL).
- HA (3 сервера) → **embedded etcd** (`--cluster-init`) или внешний (MySQL/Postgres/etcd через kine).

**Агенты:** worker-ноды = `k3s agent` с токеном сервера; нет отдельного control-plane компонента.

**k3s vs RKE2:** RKE2 — «взрослый брат» от тех же авторов: security-hardened (CIS-профиль из коробки), компоненты как static pods, для прод-центров. k3s — edge/IoT/малые кластеры. Оба управляются Rancher'ом.

| | k3s | RKE2 | kubeadm |
| :--- | :--- | :--- | :--- |
| Размер/сложность | минимал | средняя | средняя |
| HA datastore | embedded etcd/kine+SQL | etcd | etcd |
| Безопасность | базовая | CIS-hardened | руками |
| Типичное место | edge, homelab, CI | enterprise on-prem | «чистый» upstream |

#### Rancher: control plane над кластерами

Rancher — управление **флотом** кластеров: провижининг (EKS/GKE/AKS/RKE2/k3s одной кнопкой), импорт существующих, RBAC (Global→Cluster→Project→Namespace), приложения (каталог), **Fleet** (GitOps на множество кластеров: bundle → все кластеры с label'ом).

**Ключевые термины:** `cattle-system` (сам Rancher), `local` cluster (кластер, где живёт Rancher), `downstream` (управляемые), `Fleet Bundle` (набор манифестов для таргет-кластеров), `Rancher Proxy` (Rancher проксирует kubectl к downstream).

---

### 2.2 Конфигурация и синтаксис

#### HA k3s: 3 сервера с embedded etcd

```bash
# Сервер 1 (инициализация кластера):
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --token "k3s-super-secret-token" \
  --disable traefik \
  --write-kubeconfig-mode 640
#   --cluster-init = embedded etcd; следующие серверы просто присоединятся

# Серверы 2 и 3:
curl -sfL https://get.k3s.io | sh -s - server \
  --server https://10.0.0.11:6443 \
  --token "k3s-super-secret-token"

# Агенты (workers):
curl -sfL https://get.k3s.io | K3S_URL=https://10.0.0.11:6443 \
  K3S_TOKEN="k3s-super-secret-token" sh -

# Проверка кворума etcd
k3s kubectl get nodes
k3s etcd-snapshot save manual-drill     # снапшоты etcd — встроенные!
k3s etcd-snapshot ls
```

```yaml
# /etc/rancher/k3s/config.yaml — декларативная альтернатива флагам
server: https://10.0.0.11:6443
token: "k3s-super-secret-token"
disable:
  - traefik
  - servicelb          # ставим MetalLB вместо klipper (см. 20.7)
cluster-init: true
etcd-snapshot-schedule-cron: "0 */6 * * *"
etcd-snapshot-retention: 28
node-taint:                            # серверы не принимают workload
  - "CriticalAddonsOnly=true:NoExecute"
tls-san:
  - kube.corp.io                       # для LB перед apiserver
```

#### Rancher (helm) + импорт k3s-кластера

```bash
helm install rancher rancher-stable/rancher \
  -n cattle-system --create-namespace \
  --set hostname=rancher.corp.io \
  --set replicas=3 \
  --set bootstrapPassword=ChangeMeNow
# UI: https://rancher.corp.io → добавить кластер → Import existing → kubectl apply -f ...
kubectl -n cattle-system apply -f imported-cluster.yaml   # агент Rancher'а в k3s
```

**Частые ошибки:** 2 сервера k3s (чётное = нет кворума etcd!); traefik/servicelb забыли disable при установке MetalLB/ingress-nginx (конфликт портов); токен сервера в Git; Rancher на том же кластере, что и прод-workload (blast radius).

---

### 2.3 Troubleshooting

```bash
# k3s: статус и компоненты
systemctl status k3s                    # сервер; k3s-agent — на воркерах
journalctl -u k3s -f | grep -iE "error|failed" | head
k3s kubectl get nodes -o wide
k3s check-config                        # диагностика окружения (ядро, cgroups)

# etcd внутри k3s:
k3s kubectl -n kube-system get pods | grep etcd
k3s etcd-snapshot ls | tail -3
crictl ps | grep -E "kube-apiserver|etcd"     # static-pod'ы k3s

# Агент не подключается:
journalctl -u k3s-agent | grep -iE "token|connect"
#   "certificate is valid for 10-0-0-11..." → нужен --tls-san с внешним именем/IP!

# Rancher:
kubectl -n cattle-system get pods
kubectl -n cattle-system logs deploy/rancher | grep -i error | tail
kubectl -n fleet-system get clusters.fleet.cattle.io    # состояние fleet-бандлов
kubectl get clusterregistrationtokens -A -o yaml | grep -A3 command
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Агент: `certificate is valid for IP, not for <hostname>` | apiserver-серт без внешнего SAN | добавить `tls-san` и перегенерировать (`--cluster-reset` не нужен: удалить `/var/lib/rancher/k3s/server/tls/serving-kube-apiserver.crt` + рестарт) |
| etcd: `lost quorum` после ребута 2 серверов | кластер из 2 серверов | всегда 3 (или 5); восстановление из снапшота `--cluster-reset --cluster-reset-restore-path` |
| Traefik и ingress-nginx дерутся за :80 | не отключён встроенный | `--disable traefik` до первого старта |
| Rancher UI 502 | rancher-pod не готов / downstream недоступен | `kubectl -n cattle-system logs`, проверять webhook-агента в downstream |
| Fleet bundle `NotReady` | Git-репозиторий недоступен/ошибка манифестов | `kubectl -n fleet-default get gitrepos,bundles` + describe |

---

### 2.4 Интеграция со стеком

- **MetalLB + ingress-nginx** вместо встроенных klipper/traefik на «серьёзных» k3s (см. [20.7](07-network-edge.md)).
- **Rancher Fleet ↔ GitOps:** Fleet — это GitOps от Rancher (bundles из Git → кластеры по label-селекторам); конкурирует/дополняет ArgoCD (ArgoCD чаще для app-level, Fleet — для fleet-level).
- **Longhorn** — родное хранилище для k3s (см. [20.8](08-storage-s3-etcd-longhorn.md)); ставится одной кнопкой из Rancher.
- **Observability:** Rancher-каталог ставит kube-prometheus-stack; метрики кластеров стекаются в центральный Thanos.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: k3s-кластер из 2 серверов, один умер навсегда. Что с кластером и как правильно восстановить?**

<details><summary>Ответ</summary>
Embedded etcd потерял кворум (1 из 2) — кластер read-only/недоступен для записей. Восстановление: поднять замену и сделать etcd-restore из снапшота (--cluster-reset --cluster-reset-restore-path) либо добавить третий сервер до инцидента. Урок: чётное число серверов — ошибка проектирования.
</details>

**В2. Найдите ошибку: k3s-агент не регистрируется, в логах «x509: certificate is valid for 10.0.0.11, 10.0.0.1, kubernetes, kubernetes.default..., not for kube.corp.io».**

<details><summary>Ответ</summary>
Агент ходит на kube.corp.io (LB/DNS), но SAN-сертификата apiserver'а не содержит это имя. Нужно tls-san: [kube.corp.io] в конфиге серверов и перегенерация serving-сертификата apiserver.
</details>

**В3. Зачем в k3s нужен kine, если есть etcd?**

<details><summary>Ответ</summary>
kine — shim, переводящий watch/watch-семантику K8s API в SQL: позволяет хранить состояние в SQLite (single server) или внешней MySQL/Postgres вместо etcd. Это упрощает edge-сценарии и переиспользование существующих БД; для HA с embedded-хранилищем выбирают etcd.
</details>

**В4. Чем Fleet отличается от ArgoCD в мире Rancher, и когда что выбирать?**

<details><summary>Ответ</summary>
Fleet заточен на масштаб: один bundle → сотни кластеров по label-селекторам (fleet-level GitOps), глубоко интегрирован с Rancher RBAC. ArgoCD сильнее в app-level UX (UI, sync waves, hooks, analysis). Типично: Fleet для базовой платформы на всех кластерах, ArgoCD внутри кластеров для приложений.
</details>

**В5. Rancher упал целиком (cattle-system мёртв). Что происходит с downstream-кластерами?**

<details><summary>Ответ</summary>
Ничего: downstream-кластеры продолжают работать автономно — Rancher лишь management-plane (RBAC-прокси, UI, fleet). Потеряете только управление/обзор и fleet-синк; kubectl напрямую в кластеры продолжает работать. Это и есть аргумент не держать критичное в Rancher-зависимости.
</details>

---

### 2.6 Практика — 3 задания

### Задание 1: HA k3s из 3 серверов + 1 агент (в VM/Proxmox, см. 20.15)

**Условие:** 3 VM (10.0.0.11-13) + 1 worker (10.0.0.14); embedded etcd; kubeconfig для ноутбука.

```bash
# Шаг 1: сервер 1 — инициализация
ssh ubuntu@10.0.0.11 'curl -sfL https://get.k3s.io | sh -s - server --cluster-init \
  --token k3s-drill --tls-san kube.corp.io --write-kubeconfig-mode 640'

# Шаг 2: серверы 2-3
for ip in 10.0.0.12 10.0.0.13; do
  ssh ubuntu@$ip 'curl -sfL https://get.k3s.io | sh -s - server \
    --server https://10.0.0.11:6443 --token k3s-drill --tls-san kube.corp.io'
done

# Шаг 3: агент
ssh ubuntu@10.0.0.14 'curl -sfL https://get.k3s.io | \
  K3S_URL=https://10.0.0.11:6443 K3S_TOKEN=k3s-drill sh -'

# Шаг 4: kubeconfig на ноутбук (через kube.corp.io → DNS на LB/10.0.0.11)
ssh ubuntu@10.0.0.11 'cat /etc/rancher/k3s/k3s.yaml' | \
  sed 's/127.0.0.1/kube.corp.io/' > ~/.kube/k3s-config
kubectl --kubeconfig ~/.kube/k3s-config get nodes -o wide
# Ожидание: 4 ноды, 3 с ролью control-plane,etcd ✅

# Шаг 5: кворум etcd
kubectl --kubeconfig ~/.kube/k3s-config -n kube-system get pods | grep etcd
#   3 pod'а etcd-... (по одному на сервер) ✅
```

**Проверь себя:** `kubectl get --raw=/readyz?verbose` — ok; выключите сервер 2 (`sudo systemctl stop k3s`) — кластер продолжает принимать `kubectl apply` (кворум 2 из 3).

**Разбор:** --cluster-init на первом + --server на остальных — весь секрет HA. tls-san обязателен, если ходите не по IP первого сервера. Снапшоты etcd включаются в config.yaml (etcd-snapshot-schedule-cron).

### Задание 2: Отказ сервера k3s и восстановление из снапшота (drill)

**Условие:** в кластере из Задания 1 «умерли» все серверы (data-dir потерян); есть снапшот; восстановить на сервере 1.

```bash
# Шаг 0: снапшот заранее (на живом кластере)
ssh ubuntu@10.0.0.11 'k3s etcd-snapshot save pre-drill && k3s etcd-snapshot ls | tail -2'
# Ожидание: pre-drill-<timestamp> в /var/lib/rancher/k3s/server/db/snapshots

# Шаг 1: «катастрофа» на всех серверах
for ip in 10.0.0.11 10.0.0.12 10.0.0.13; do
  ssh ubuntu@$ip 'sudo systemctl stop k3s k3s-agent 2>/dev/null; \
    sudo mv /var/lib/rancher/k3s/server/db /var/lib/rancher/k3s/server/db.broken'
done

# Шаг 2: восстановление на сервере 1 из снапшота
ssh ubuntu@10.0.0.11 'sudo k3s server \
  --cluster-reset \
  --cluster-reset-restore-path /var/lib/rancher/k3s/server/db/snapshots/pre-drill-*.sql.gz \
  --token k3s-drill'
# Ожидание: "Managed etcd cluster reset successful" — ОДНОРАЗОВЫЙ запуск!

# Шаг 3: обычный старт сервера 1, затем 2-3 (db.broken удалить/очистить)
ssh ubuntu@10.0.0.11 'sudo systemctl start k3s'
for ip in 10.0.0.12 10.0.0.13; do
  ssh ubuntu@$ip 'sudo rm -rf /var/lib/rancher/k3s/server/db.broken && sudo systemctl start k3s'
done

# Шаг 4: кластер жив, объекты на момент снапшота
kubectl --kubeconfig ~/.kube/k3s-config get ns   # все namespace'ы из снапшота ✅
```

**Проверь себя:** `kubectl get nodes` — все 4 ноды Ready; созданный ПОСЛЕ снапшота тестовый namespace отсутствует (точка во времени корректна).

**Разбор:** --cluster-reset с restore-path — однокомандное восстановление etcd k3s; ключевые грабли: запуск на ОДНОМ сервере, остальные присоединяются после, db-каталоги на них чистятся. Репетиция обязательна — как и для etcd (20.8).

### Задание 3: Rancher + Fleet — деплой на 2 кластера по лейблу

**Условие:** Rancher управляет k3s-кластером (Задание 1) и kind-кластером; через Fleet задеплоить nginx-демо только на кластеры с лейблом `env=lab`.

```bash
# Шаг 1: Rancher (helm) — см. 2.2; импортируйте k3s (UI: Import existing)
# Шаг 2: в UI каждому кластеру → Labels & Annotations → env=lab (kind) / env=prod (если есть)

# Шаг 3: Git-репозиторий fleet (стартовое состояние):
mkdir fleet-lab && cd fleet-lab && git init
cat > nginx.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: fleet-nginx }
spec:
  replicas: 1
  selector: { matchLabels: { app: fleet-nginx } }
  template:
    metadata: { labels: { app: fleet-nginx } }
    spec: { containers: [{ name: nginx, image: nginx:1.27 }] }
EOF

# Шаг 4: Fleet GitRepo в кластере, где живёт Rancher
kubectl apply -f - <<'EOF'
apiVersion: fleet.cattle.io/v1alpha1
kind: GitRepo
metadata: { name: lab-apps, namespace: fleet-default }
spec:
  repo: https://github.com/<user>/fleet-lab.git
  branch: main
  targets:
    - name: lab-only
      clusterSelector: { matchLabels: { env: lab } }
EOF

# Шаг 5: push и наблюдение
git add -A && git commit -m "fleet demo" && git push
kubectl -n fleet-default get bundles,gitrepos
kubectl get deploy fleet-nginx     # в k3s-кластере под появился ✅
```

**Проверь себя:** в UI Rancher → Continuous Delivery → Git Repos: статус GitRepo=Ready, кластер с env=lab — Bundled; кластер без лейбла — не затронут; изменение nginx.yaml в Git → под обновился без kubectl.

**Разбор:** Fleet — GitOps fleet-level: таргетинг по label'ам кластеров, состояние видно в Rancher UI. Для прод-кластеров добавляется второй target с другим branch/values — канареечный rollout конфигурации по флотам.

---

*Следующая подтема: [20.15 Виртуализация: KVM, Proxmox, VMware](15-virtualization.md)*
