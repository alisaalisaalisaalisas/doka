# 🔐 20.3 Секреты и Runtime-безопасность: External Secrets, cert-manager, Falco

> Уровень: Middle→Senior. Цель: связать Vault/облака с K8s без копипасты секретов, автоматизировать PKI и видеть злоумышленника в рантайме.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### External Secrets Operator (ESO)

**Проблема:** GitOps и секреты противоречат друг другу: в Git нельзя, в кластере руками — дрейф. ESO переворачивает задачу: **источник правды — внешний стор** (Vault, AWS Secrets Manager, GCP SM, Azure KV, 1Password), а в кластере ESO создаёт и ротирует обычный `Secret`.

**Объекты:**
- `SecretStore` / `ClusterSecretStore` — «как подключиться к стору» (namespace-scoped / кластерный);
- `ExternalSecret` — «какой путь/ключи взять и в какой Secret положить»;
- `PushSecret` — обратное направление (K8s → стор).

**Сравнение подходов:**

| | **ESO** | **Vault Agent / CSI Provider** | **Sealed Secrets** | **SOPS** |
| :--- | :--- | :--- | :--- | :--- |
| Источник правды | внешний стор | внешний стор | зашифрованный Git | зашифрованный Git |
| GitOps-совместимость | ✅ манифесты в Git без секретов | ⚠️ нужен sidecar/CSI в каждом поде | ✅ | ✅ (расшифровка в CI/Flux-KMS) |
| Ротация | автоматом по `refreshInterval` | по lease токена | пересоздание | пересоздание |
| Зависимость от Vault | только на контроллере | на каждом поде | нет | нет |
| Когда выбирать | GitOps + центральный стор | динамические секреты/базы | нет внешнего стора | файлы в репо, Flux |

#### cert-manager: PKI как код

- `ClusterIssuer`/`Issuer` — «центр сертификации» (ACME Let's Encrypt, self-signed, Vault PKI, CA).
- `Certificate` — заказ: `dnsNames`, `secretName`, `duration`, `renewBefore`.
- **ACME challenge:** `http01` (через Ingress — нужен входящий трафик 80) vs `dns01` (TXT-запись — умеет wildcard и приватные зоны).
- Автопродление: когда `notAfter - now < renewBefore`, создаётся `Order` → `Challenge(s)` → новый секрет.
- CA-injector патчит `ca.crt` в секреты для mutual-TLS.

#### Falco: runtime-детект

**Принцип:** перехват syscall'ов ядра (eBPF/модуль) → события (`execve`, `open`, `connect`) → правила (условия) → алерты. Это **детект**, а не превенция (для превенции — seccomp/AppArmor/политики из [20.1](01-policy-as-code.md)).

**Структура правил:** `list` (константы) → `macro` (переиспользуемые условия) → `rule` (условие + output + priority).

| Falco | Tetragon (Cilium) | Tracee |
| :--- | :--- | :--- |
| Зрелый, огромная база правил | eBPF-политики с **enforce** (kill процесса) | eBPF, богатые события |
| Syscall-центричный | syscall + network + file, policy-as-code | исследовательский, тяжёлый |
| Выбор: классический детект + SIEM | превенция на лету | threat hunting |

---

### 2.2 Конфигурация и синтаксис

#### ESO: Vault KV v2 → Secret

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata: { name: vault }
spec:
  provider:
    vault:
      server: "https://vault.internal:8200"
      path: kv                    # mount point KV v2 (v2 добавляется автоматически)
      version: v2
      auth:
        kubernetes:               # Vault аутентифицирует под через SA-токен
          mountPath: kubernetes
          kubernetesAuthEndpointPath: k8s-cluster-prod   # role в Vault
          serviceAccountRef: { name: external-secrets, namespace: external-secrets }
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: api-db, namespace: prod }
spec:
  refreshInterval: 1h             # ротация: ESO перечитывает стор
  secretStoreRef: { kind: ClusterSecretStore, name: vault }
  target:
    name: api-db-credentials      # итоговый K8s Secret
    creationPolicy: Owner         # Owner = ESO управляет жизнью секрета
  data:
    - secretKey: username
      remoteRef: { key: prod/api-db, property: username }   # kv/prod/api-db
    - secretKey: password
      remoteRef: { key: prod/api-db, property: password }
```

#### cert-manager: wildcard через DNS-01 (Cloudflare)

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata: { name: letsencrypt-prod }
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ops@company.io
    privateKeySecretRef: { name: le-account-key }   # ключ аккаунта ACME
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef: { name: cf-token, key: api-token }  # Zone:DNS:Edit
        selector:
          dnsZones: ["company.io"]
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata: { name: wildcard, namespace: istio-ingress }
spec:
  secretName: wildcard-tls
  duration: 2160h                  # 90d
  renewBefore: 720h                # 30d до конца — перевыпуск
  dnsNames: ["*.company.io"]
  issuerRef: { name: letsencrypt-prod, kind: ClusterIssuer }
```

#### Falco: правило «shell в контейнере»

```yaml
- list: allowed_shell_images
  items: [docker.io/library/busybox, myregistry.corp/debug-tools]

- macro: container_entrypoint
  condition: (container and not container.image.repository in (allowed_shell_images))

- rule: Shell in Production Container
  desc: Запуск shell в контейнере, кроме debug-образов
  condition: >
    spawned_process and container and
    proc.name in (bash, sh, zsh, ash) and
    not container.image.repository in (allowed_shell_images) and
    k8s.ns.name != "kube-system"
  output: >
    SHELL в контейнере (user=%user.name proc=%proc.name cmd=%proc.cmdline
    image=%container.image.repository ns=%k8s.ns.name pod=%k8s.pod.name)
  priority: WARNING
  tags: [container, mitre_execution]
```

**Частые ошибки конфигурации:**
1. ESO: `path: secret/prod/api` при `version: v2` → двойной префикс `data` не добавляется автоматически в remoteRef — путь пишется **без** `data/` (KV v2 API сам мапит).
2. ESO: `creationPolicy: Owner` + ручная правка секрета человеком → ESO затрёт правку на следующем refresh (это фича, но удивляет).
3. cert-manager: `renewBefore` ≥ `duration` → ошибка валидации; `renewBefore` меньше времени решения challenge → серт протухнет до перевыпуска.
4. cert-manager http01 за Cloudflare proxy → challenge получает CDN-ответ, а не pod → `challenge error`. Для LE за прокси — только dns01.
5. Falco: правило без исключения для своих debug-инструментов → алерт-шторм; слишком общий `condition` → CPU-пожар на высоконагруженных нодах.

---

### 2.3 Troubleshooting

```bash
# === ESO ===
kubectl get externalsecrets -A                    # STATUS: SecretSynced?
kubectl describe externalsecret api-db -n prod | tail -20
#  Events: "secret synced" / "could not get secret: 403" → права Vault-роли
kubectl logs -n external-secrets deploy/external-secrets | grep -i error | tail

# Секрет реально обновился? Сравните resourceVersion до/после refreshInterval
kubectl get secret api-db-credentials -n prod -o jsonpath='{.metadata.resourceVersion}'

# === cert-manager ===
kubectl get certificate,order,challenge -A
kubectl describe certificate wildcard -n istio-ingress | tail -15
kubectl describe challenge -n istio-ingress       # причина провала challenge (DNS/HTTP)
cmctl status certificate wildcard -n istio-ingress  # диагностика одним словом

# Проверить TXT-запись dns01 руками (Cloudflare):
dig +short _acme-challenge.company.io TXT

# === Falco ===
kubectl -n falco logs ds/falco | grep -v "^$" | tail -20
falco --list=spawned_process        # какие макросы/поля доступны
# Тест правила без реального вторжения:
kubectl run falco-test --image=busybox --restart=Never -- sh -c 'sleep 60'
# → в логах falco: SHELL в контейнере ... (если правило активно)
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| ESO: `SecretSynced=false`, ошибка 403 | Vault-роль не разрешает путь/политику | `vault policy read k8s-cluster-prod`; проверить bound SA/namespace |
| Секрет не ротируется после смены в Vault | `refreshInterval` большой или ExternalSecret не пересоздан | уменьшить интервал / `kubectl annotate externalsecret force-sync=$(date +%s) --overwrite` |
| Серт не перевыпускается, Ready=False | challenge fail: DNS не propagated / 403 от API Cloudflare | `describe challenge`; проверить токен и зону в solver |
| Wildcard через http01 невозможен | LE не выдаёт wildcard по HTTP | использовать dns01 |
| Falco ест 30% CPU ноды | тяжёлые правила на горячих syscall-путях | отключить избыточные макросы, falcoctl обновить правила, снизить priority-шум |
| Falco алерты не доходят | stdout-only вывод | настроить `falcosidekick` (webhook → Alertmanager/Slack) |

---

### 2.4 Интеграция со стеком

- **GitOps:** ESO — идеальная пара ArgoCD: в Git лежат `ExternalSecret`, ArgoCD синкает их, ESO наполняет Secret; `argocd app diff` не показывает секреты (их там нет).
- **Vault PKI:** cert-manager умеет `issuerRef` на Vault PKI role — внутренние серты для mTLS (см. [Vault Deep Dive](../10-security-and-cloud/03-hashicorp-vault-deep-dive.md)).
- **Ingress/Istio:** `secretName` из Certificate → ingress TLS / Gateway credentialName; wildcard серт один на все хосты.
- **Falco → SIEM:** falcosidekick → Alertmanager/Loki/Elastic; Falco Talon — автоматический ответ (kill pod, isolate node).
- **Kyverno/Gatekeeper:** политика «у Deployment с envFrom secret X должен быть ExternalSecret Y» — контроль того, что секреты приходят только через ESO.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: инженер вручную отредактировал Secret, созданный ESO (`creationPolicy: Owner`). Что произойдёт?**

<details><summary>Ответ</summary>
На следующем refreshInterval ESO перезапишет правку данными из стора — ручные изменения в управляемых секретах не выживают. Правки надо делать в источнике (Vault) и ждать синк или форсировать его аннотацией.
</details>

**В2. Найдите ошибку: `Certificate` с `duration: 8760h` (год) и `renewBefore: 720h` (30 дней) — валидно ли?**

<details><summary>Ответ</summary>
Валидно: renewBefore меньше duration. Ошибкой было бы наоборот (renewBefore ≥ duration — cert-manager отклонит), а также renewBefore, при котором перевыпуск попадает в окно rate-limit'ов LE — тогда серт не обновится вовремя.
</details>

**В3. Почему wildcard-сертификат `*.company.io` нельзя получить через HTTP-01 challenge?**

<details><summary>Ответ</summary>
HTTP-01 доказывает контроль одного FQDN ответом по HTTP на конкретном хосте; wildcard требует доказательства контроля всей зоны — только DNS-01 (TXT-запись _acme-challenge).
</details>

**В4. Чем Falco принципиально отличается от Kyverno/Gatekeeper из подтемы 20.1?**

<details><summary>Ответ</summary>
Kyverno/Gatekeeper — admission-контроль: проверяют объект ДО запуска (статика манифеста). Falco — runtime-детект: смотрит фактические syscall'ы живого процесса (динамика). Они дополняют друг друга: политика не поймёт exec в запущенном контейнере, Falco не предотвратит деплой плохого манифеста.
</details>

**В5. ClusterSecretStore vs SecretStore — что выбрать для платформы с 40 namespace?**

<details><summary>Ответ</summary>
ClusterSecretStore: одна конфигурация подключения на кластер, а namespace-изоляция достигается правами на создание ExternalSecret и (при необходимости) проверкой условий в Vault-роли. SecretStore на каждый namespace — только если сторы/креды реально различаются.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Секрет из Vault в под без единого пароля в Git

**Условие:** приложению `api` нужен `DB_PASSWORD`; он лежит в Vault по пути `secret/prod/api`.

**Шаг 1** — Vault (dev-mode для лабы):
```bash
docker run -d --name vault -p 8200:8200 -e VAULT_DEV_ROOT_TOKEN_ID=root hashicorp/vault:1.15
vault secrets enable -path=secret kv-v2
vault kv put secret/prod/api DB_PASSWORD=s3cr3t
```

**Шаг 2** — установите ESO и создайте `SecretStore` + `ExternalSecret` (шаблоны из 2.2; для dev-mode auth — `token` с `value: root`, в проде — kubernetes-auth).

**Шаг 3** — проверка цепочки:
```bash
kubectl get externalsecret api-db          # STATUS: SecretSynced
kubectl get secret api-db -o jsonpath='{.data.DB_PASSWORD}' | base64 -d   # s3cr3t
vault kv put secret/prod/api DB_PASSWORD=n3w-pass
kubectl annotate externalsecret api-db force-sync=$(date +%s) --overwrite
kubectl get secret api-db -o jsonpath='{.data.DB_PASSWORD}' | base64 -d   # n3w-pass ✅
```

**Проверь себя:** в Git-репо с манифестами `grep -r s3cr3t .` → пусто; секрет в кластере есть и ротируется.

**Разбор:** источник правды — Vault; Git хранит только ссылку. `force-sync`-аннотация — штатный способ немедленной синхронизации без ожидания refreshInterval.

#### Задание 2: Wildcard-сертификат через dns01 (kind + nip.io невозможен → Cloudflare staging)

**Условие:** выпустить `*.dev.company.io` через Let's Encrypt **staging** (без rate-limit рисков).

**Шаг 1** — токен Cloudflare с правом `Zone:DNS:Edit` на `company.io` → секрет:
```bash
kubectl create secret generic cf-token -n cert-manager \
  --from-literal=api-token=<TOKEN>
```

**Шаг 2** — ClusterIssuer с `server: https://acme-staging-v02.api.letsencrypt.org/directory` и dns01-солвером (шаблон 2.2, поправьте dnsZones).

**Шаг 3** — Certificate на `*.dev.company.io`, затем:
```bash
kubectl get certificate -w    # READY: True
kubectl describe order,challenge | grep -E "State|Reason"
dig +short _acme-challenge.dev.company.io TXT   # TXT-запись существует
```

**Проверь себя:** `kubectl get secret wildcard-tls -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -subject -dates` → SAN `*.dev.company.io`, issuer LE staging.

**Разбор:** staging-ACME даёт те же механики без брэйк-рейт лимитов прод-LE; переключение на prod — одна строка `server`. dns01 требует API-доступа к DNS-провайдеру — это и есть плата за wildcard.

#### Задание 3: Falco — детект и разбор алерта

**Условие:** включить детект запуска шеллов и чтения `/etc/shadow` в контейнерах, проверить срабатывание, вывести в stdout + webhook.

**Шаг 1** — установите Falco (helm, driver eBPF):
```bash
helm install falco falcosecurity/falco -n falco --create-namespace \
  --set driver.kind=ebpf \
  --set tty=true
```

**Шаг 2** — добавьте кастомное правило (ConfigMap `falco-rules`, ключ `custom-rules.yaml`) с правилом чтения shadow:
```yaml
- rule: Read Shadow File
  condition: >
    container and open_read and fd.name=/etc/shadow
  output: "SHADOW READ (proc=%proc.name cmd=%proc.cmdline pod=%k8s.pod.name)"
  priority: CRITICAL
```

**Шаг 3** — провокация и проверка:
```bash
kubectl run attacker --image=busybox --restart=Never -- cat /etc/shadow
kubectl -n falco logs ds/falco | grep "SHADOW READ"
# 22:41:03.117 CRITICAL SHADOW READ (proc=cat cmd=cat /etc/shadow pod=attacker)
```

**Проверь себя:** оба события (shell + shadow) видны в `kubectl logs ds/falco`; после установки falcosidekick с webhook на RequestBin — событие приходит наружу.

**Разбор:** `open_read`/`spawned_process` — макросы из стандартного набора правил; поля `%k8s.*` приходят из метаданных контейнера. В проде stdout мало — нужен sidekick → SIEM, а Talon для автоматических контрмер.

---

*Следующая подтема: [20.4 Тестирование инфраструктуры](04-infra-testing.md)*
