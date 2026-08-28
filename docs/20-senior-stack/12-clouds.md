# ☁️ 20.12 Облака: AWS, GCP, Azure, Cloudflare

> Уровень: Middle→Senior. Не «кнопки консоли», а сетевые/IAM-модели, которые спрашивают на собеседовании, и различия, на которых валятся.

**Оглавление:** [Сетевые модели](#сетевые-модели-aws-vs-gcp-vs-azure) · [IAM и identity для K8s](#iam-и-identity-для-kubernetes) · [EKS/GKE/AKS](#managed-kubernetes-eksgkeaks) · [Cloudflare](#cloudflare-периметр-и-zero-trust) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## Сетевые модели: AWS vs GCP vs Azure

### Теория

| Концепт | **AWS** | **GCP** | **Azure** |
| :--- | :--- | :--- | :--- |
| Сеть | VPC (региональная) | **VPC глобальная**, подсети региональные | VNet (региональная) |
| Файрвол | Security Groups (stateful, на ENI) + NACL (stateless, на subnet) | Firewall Rules (на VPC, таргет по tags/SA) | NSG (stateful, на NIC/subnet) |
| NAT для приватных подсетей | NAT Gateway ($ за обработку!) | Cloud NAT | NAT Gateway / Azure Firewall |
| Маршрутизация кастомная | Route Tables | Routes | UDR (User Defined Routes) |
| Приватный доступ к API облака | VPC Endpoints (Interface/Gateway) | Private Google Access / PSC | Private Endpoints |
| DNS | Route53 | Cloud DNS | Azure DNS / Private DNS Zones |

**Ключевые отличия, которые любят спрашивать:**

1. **GCP VPC — глобальная:** подсети в разных регионах живут в одной VPC, маршруты между ними автоматом. В AWS/Azure peering/TGW/VNet-peering — отдельные конструкции.
2. **SG vs Firewall Rules:** AWS SG вешается на интерфейс; GCP-правило — на сеть с таргет-тегами/сервис-аккаунтами (централизованнее).
3. **NAT:** в AWS каждый NAT GW ≈ $32/мес + $0.045/GB — забытые NAT'ы в 3 AZ = заметный счёт. GCP Cloud NAT дешевле и не привязан к AZ.
4. **Egress — главный скрытый cost:** трафик «наружу» интернета и между регионами платный у всех трёх; внутри AZ/региона у провайдера — бесплатно.

### Конфигурация и диагностика

```bash
# === AWS: что у меня с сетью ===
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].[InstanceId,PrivateIpAddress,SubnetId,VpcId]' \
  --output table
aws ec2 describe-route-tables --filters "Name=vpc-id,Values=vpc-0abc" \
  --query 'RouteTables[].Routes[].[DestinationCidrBlock,GatewayId,NatGatewayId]'
#   0.0.0.0/0 → nat-xxx  = приватная подсеть ходит наружу через NAT

# === GCP ===
gcloud compute networks subnets list --filter="region:eu-central1"
gcloud compute firewall-rules list --filter="network:prod-vpc" \
  --format="table(name,direction,allowed[].map().firewall_rule().list(),sourceRanges.list())"
#   GCP: нет SG — правила таргетятся network tags: --target-tags=web

# === Azure ===
az network vnet list -o table
az network nsg rule list --nsg-name prod-nsg -g rg-prod -o table \
  --query "[].{name:name,prio:priority,access:access,port:destinationPortRange}"
```

**Частые ошибки:** приватная подсеть без NAT-маршрута (образы не тянутся); SG «разрешить всё от security group id» забыли при пересоздании группы; в GCP ждут SG на инстансе и не находят (их нет — tags); Azure: NSG на subnet перекрыл NSG на NIC (приоритеты).

---

## IAM и identity для Kubernetes

### Теория

Задача: под в кластере должен ходить в API облака **без статических ключей**. У каждого облака — свой механизм привязки identity:

| | **Механизм** | Как работает |
| :--- | :--- | :--- |
| AWS | **IRSA** (IAM Roles for Service Accounts) | EKS поднимает OIDC-провайдер; SA с аннотацией `eks.amazonaws.com/role-arn` получает токен → AWS STS обменивает на временные креды роли |
| GCP | **Workload Identity** | KSA (k8s SA) связывается с GSA через binding; метадата-сервер отдаёт токен GSA |
| Azure | **Workload Identity (Managed Identity)** | Federated credential между managed identity и OIDC-issuer кластера |

**Принцип общий:** доверие через OIDC-токены кластера, никаких Access Keys в секретах. Это прямой аналог Vault kubernetes-auth (см. [20.3](03-secrets-runtime-security.md)).

### Конфигурация

```bash
# === AWS IRSA (eksctl делает за 2 команды) ===
eksctl create iamserviceaccount \
  --cluster prod-eks --namespace monitoring --name thanos-s3 \
  --attach-policy-arn arn:aws:iam::123:policy/thanos-s3-ro --approve

kubectl -n monitoring annotate sa thanos-s3 \
  eks.amazonaws.com/role-arn=arn:aws:iam::123:role/thanos-s3 --overwrite
# Проверка из пода:
kubectl -n monitoring run t --rm -it --image=amazon/aws-cli --overrides='
  {"spec":{"serviceAccountName":"thanos-s3"}}' -- s3 ls
#   2026-01-01 thanos-blocks   ← креды роли работают, ключей нигде нет ✅

# === GCP Workload Identity ===
gcloud iam service-accounts add-iam-policy-binding \
  gsa@project.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:project.svc.id.goog[monitoring/thanos-s3]"
kubectl -n monitoring annotate sa thanos-s3 \
  iam.gke.io/gcp-service-account=gsa@project.iam.gserviceaccount.com
```

**Частые ошибки:** OIDC-провайдер кластера не создан (IRSA молча не работает → `NoCredentialProviders`); в политике роли нет `sts:AssumeRoleWithWebIdentity` trust для OIDC; GCP: забыли `--workload-pool=project.svc.id.goog` на кластере.

### Troubleshooting

```bash
aws sts get-caller-identity          # кто я сейчас (из пода — должна быть роль, не юзер)
gcloud auth list && gcloud config get-value account
az account show --query "{sub:id,user:user.name}" -o json
# Под-уровень AWS: env AWS_ROLE_ARN / AWS_WEB_IDENTITY_TOKEN_FILE смонтированы?
kubectl exec -n monitoring deploy/thanos -- env | grep AWS
```

---

## Managed Kubernetes: EKS/GKE/AKS

### Теория

| | **EKS** | **GKE** | **AKS** |
| :--- | :--- | :--- | :--- |
| Control plane | $73/мес, HA в 3 AZ | Standard: $74/мес (zonal free-уровень исчез), **Autopilot** — платите за поды | Free (SLA платно) |
| Ноды | Managed Node Groups, Karpenter для autoscale | Node Pools, Autopilot = ноды вообще не ваши | Node Pools, scale-set |
| CNI | VPC CNI (поды = IP из VPC!) | Dataplane V2 (eBPF) / Calico | Azure CNI / kubenet |
| Фишка | зрелая экосистема, Karpenter | Autopilot: минимум ops | интеграция с Entra ID |

**VPC CNI (AWS) — важная особенность:** каждый под получает IP из подсети VPC → планирование IP-адресов критично (`--max-pods`, префиксы /28). В GKE/Azure CNI тоже тянет IP из VPC (опционально), но есть режимы с NAT-подобным пулом.

### Диагностика

```bash
eksctl get nodegroup --cluster prod-eks
kubectl get nodes -L topology.kubernetes.io/zone,beta.kubernetes.io/instance-type
kubectl describe node ip-10-0-1-5 | grep -A5 "Allocated resources"   # IP/порты исчерпаны?
gcloud container clusters describe prod --region eu-central1 \
  --format="value(status,endpoint,currentMasterVersion)"
az aks show -g rg -n prod --query "{k8s:kubernetesVersion,pools:agentPoolProfiles[].{name:name,count:count}}"
```

---

## Cloudflare: периметр и Zero Trust

### Теория

Cloudflare — не «CDN», а периметр: DNS-прокси, WAF, Zero Trust, edge-вычисления.

- **Проксирование:** оранжевое облако = трафик идёт через CF (WAF, кэш, скрытие origin IP); серое = только DNS.
- **Origin Certificate** — серт на 15 лет, доверенный **только CF** → origin принимает лишь трафик CF (плюс firewall по IP-диапазонам CF).
- **Tunnel (cloudflared)** — исходящее соединение origin → CF: **ни одного открытого входящего порта**. Идеально для homelab (см. [19-career](../19-career/01-home-lab-setup.md)) и приватных сервисов.
- **Zero Trust Access** — identity-aware прокси: приложение за Tunnel + Access = «войти может только юзер с Google-identity из группы devops».

### Конфигурация: Tunnel для приватного сервиса

```bash
cloudflared tunnel login                          # браузер-аутентификация зоны
cloudflared tunnel create grafana                 # получаем credentials JSON
cat > ~/.cloudflared/config.yml <<'EOF'
tunnel: grafana
credentials-file: /etc/cloudflared/tunnel.json
ingress:
  - hostname: grafana.company.io
    service: http://localhost:3000                # локальный сервис БЕЗ открытых портов
  - service: http_status:404
EOF
cloudflared tunnel route dns grafana grafana.company.io
cloudflared tunnel run grafana
```

**Частые ошибки:** origin-серт поставили, но не включили «Full (strict)» в SSL-режиме (получится loop/ошибка); Tunnel за NAT без keepalive-соединения; Access-политика «Bypass» для service-токена забыли для API-путей.

### Troubleshooting

```bash
cloudflared tunnel info grafana        # активные соединения edge
journalctl -u cloudflared | grep -iE "err|register" | tail
curl -sI https://grafana.company.io | grep -i cf-ray   # трафик реально через CF?
#   cf-ray: ....-FRA  ← точка присутствия; ошибки 52x = origin недоступен для CF
```

---

## AWS Deep Dive: IAM, VPC, EC2, EKS, S3

### IAM: users → roles → policies → STS

```bash
# Policy JSON наименьших привилегий (least privilege)
cat > /tmp/policy.json <<'YAML'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject","s3:ListBucket"],
    "Resource": ["arn:aws:s3:::app-bucket","arn:aws:s3:::app-bucket/*"],
    "Condition": {"IpAddress":{"aws:SourceIp":"203.0.113.0/24"}}
  }]
}
YAML
aws iam create-policy --policy-name s3-readonly --policy-document file:///tmp/policy.json
aws iam attach-role-policy --role-name app-role --policy-arn arn:aws:iam::123:policy/s3-readonly

# STS: assume role → временные креды 15мин–12ч
aws sts assume-role --role-arn arn:aws:iam::123:role/app-role --role-session-name debug --duration-seconds 3600
# В пода EKS — автоматически через IRSA (см. выше), без ключей
aws sts get-caller-identity  # кто я: AssumedRole или User
aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123:role/app-role --action-names s3:ListBucket --resource-arns arn:aws:s3:::app-bucket
```

**IAM troubleshooting:** `AccessDenied` → `aws cloudtrail lookup-events --lookup-attributes AttributeKey=Username,AttributeValue=alice | jq .Events[0].CloudTrailEvent | fromjson | .errorCode`; `iam:PassRole` недостаёт для EKS.

### VPC deep: subnet types, SG vs NACL, NAT, Egress cost

```bash
# VPC с 3 AZ: 1 публичная + 2 приватные (app, db) + NAT per AZ
aws ec2 describe-vpcs --query 'Vpcs[].[VpcId,CidrBlock,IsDefault]'
aws ec2 describe-subnets --query 'Subnets[].[SubnetId,CidrBlock,AvailabilityZone,MapPublicIpOnLaunch]' --output table
aws ec2 describe-security-groups --group-ids sg-abc --output json | jq '.SecurityGroups[0].IpPermissions'
# SG stateful: ответ разрешён автоматически
aws ec2 describe-network-acls --query 'NetworkAcls[].[NetworkAclId,Entries[]]' | head -40
# NACL stateless: нужен inbound + outbound, номер rule — порядок!

# Проверка egress cost (главный счёт)
aws ce get-cost-and-usage --time-period Start=2026-07-01,End=2026-08-01 --granularity MONTHLY --metrics BlendedCost --group-by Type=DIMENSION,Key=SERVICE | jq '.ResultsByTime[].Groups[] | select(.Keys[0]=="EC2-Other")'
# NAT GW cost отдельно
aws ec2 describe-nat-gateways --query 'NatGateways[].[NatGatewayId,State,SubnetId]'
```

### S3: классы, encryption, least privilege

```bash
aws s3api create-bucket --bucket app-bucket --region eu-central1 --create-bucket-configuration LocationConstraint=eu-central1
aws s3api put-bucket-encryption --bucket app-bucket --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms","KMSMasterKeyID":"alias/app"}}]}'
aws s3api put-public-access-block --bucket app-bucket --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3 ls s3://app-bucket --recursive --human-readable
aws s3api get-bucket-policy --bucket app-bucket | jq .
```

### CloudWatch vs Prometheus

```bash
aws cloudwatch put-metric-data --metric-name RequestLatency --namespace App --value 120 --unit Milliseconds
aws logs describe-log-groups --log-group-name-prefix /aws/eks/prod
aws logs put-retention-policy --log-group-name /aws/eks/prod --retention-in-days 30
```

**AWS check-list security/cost:** IAM `*` → убрать, NACL deny-all default, NAT per AZ ($96/3 AZ), S3 `BlockPublicAccess` + KMS, `aws-nuke` sandbox cost.

---

## GCP Deep Dive: IAM, VPC, GKE, Storage, Logging

```bash
# IAM: SA + binding (least privilege)
gcloud iam service-accounts create app-sa --display-name="app"
gcloud projects add-iam-policy-binding PROJECT --member="serviceAccount:app-sa@PROJECT.iam.gserviceaccount.com" --role="roles/storage.objectViewer"
gcloud iam service-accounts get-iam-policy app-sa@PROJECT.iam.gserviceaccount.com
gcloud policy-intelligence query-activity --project=PROJECT --activity-type=serviceAccountLastAuthentication

# VPC firewall централизовано на сети
gcloud compute firewall-rules create allow-web --network prod-vpc --allow tcp:80,tcp:443 --target-tags web --source-ranges 0.0.0.0/0
gcloud compute firewall-rules describe allow-web --format=json | jq .allowed
gcloud compute routes list --filter="network:prod-vpc" --format="table(name,destRange,nextHopGateway)"

# GKE Autopilot vs Standard
gcloud container clusters describe prod --region eu-central1 --format="value(autopilot.enabled,currentMasterVersion)"
# Autopilot: ноды не ваши, платите за pod requests
gcloud container node-pools list --cluster prod --region eu-central1

# Cloud Storage classes
gsutil ls -L gs://prod-bucket | grep -i class  # STANDARD, NEARLINE, COLDLINE, ARCHIVE
gsutil lifecycle get gs://prod-bucket
gcloud storage buckets describe gs://prod-bucket --format="value(encryption.defaultKmsKeyName)"

# Logging/Monitoring (аналог CloudWatch)
gcloud logging logs list --project=PROJECT
gcloud logging sinks list
gcloud monitoring dashboards list | head
```

---

## Azure Deep Dive: Entra ID, RBAC, VNet, AKS, Blob, Monitor

```bash
# Entra ID + Managed Identity → Workload Identity
az ad sp list --display-name myapp --query "[].{id:appId,oid:objectId}" -o table
az identity create -g rg-prod -n app-id --query principalId -o tsv
az role assignment create --assignee <principalId> --role "Storage Blob Data Reader" --scope /subscriptions/<sub>/resourceGroups/rg-prod/providers/Microsoft.Storage/storageAccounts/prodsa

# federated credential (OIDC)
az identity federated-credential create --name k8s-federated --identity-name app-id -g rg-prod \
  --issuer "https://oidc.prod.westeurope.azmk8s.io/<oidc-id>/" --subject system:serviceaccount:prod:thanos --audience api://AzureADTokenExchange

# VNet + NSG (приоритеты 100-4096, lower wins)
az network vnet list -o table
az network nsg show -g rg-prod -n prod-nsg --query "securityRules[].{name:name,prio:priority,access:access,port:destinationPortRange}" -o table
az network nsg rule create -g rg-prod --nsg-name prod-nsg -n allow-web --priority 100 --access Allow --destination-port-ranges 80 443 --source-address-prefixes Internet

# AKS
az aks show -g rg-prod -n prod-aks --query "{k8s:kubernetesVersion, pools:agentPoolProfiles[].{name:name,count:count,mode:mode}}" -o json
az aks get-credentials -g rg-prod -n prod-aks
kubectl get nodes -L agentpool,topology.kubernetes.io/zone

# Blob Storage
az storage account show -g rg-prod -n prodsa --query "{sku:sku.name, kind:kind, tier:accessTier}" -o json
az storage container list --account-name prodsa --auth-mode login -o table
az storage blob list --container-name prod --account-name prodsa --query "[].{name:name,tier:properties.accessTier}" -o table

# Monitor (Log Analytics + Metrics)
az monitor log-analytics workspace list -o table
az monitor metrics list --resource "/subscriptions/.../aks/prod-aks" --metric "node_cpu_usage_percentage" | head -20
```

**Azure cost:** NAT GW $32 + egress, storage transactions, Log Analytics ingestion 2.76€/GB.

---

## 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: поды в приватной подсети AWS не тянут образы из ECR, а из интернета — тянут. В чём разница и что чинить?**

<details><summary>Ответ</summary>
ECR-эндпоинты идут через VPC Endpoints: для них нужен Interface Endpoint (ecr.api, ecr.dkr) + S3 Gateway Endpoint (слои образов), иначе трафик к ECR идёт мимо NAT-маршрута или заблокирован. «Из интернета тянутся» — через NAT GW; значит маршрут есть, а endpoint-политики/DNS — нет.
</details>

**В2. Найдите ошибку: в GCP создали firewall-правило allow:8080 с target-tag=web, но инстанс не принимает трафик — при этом в AWS такой же SG работает.**

<details><summary>Ответ</summary>
В GCP у инстанса нет network tag `web` (или правило не в той сети/VPC). GCP-правила таргетятся по тегам/сервис-аккаунтам, а не по «группе безопасности на интерфейсе», как SG в AWS — тег нужно проставить на VM.
</details>

**В3. Чем IRSA принципиально отличается от «положить AWS_ACCESS_KEY_ID в Secret»?**

<details><summary>Ответ</summary>
IRSA: короткоживущие временные креды, выдаваемые через OIDC-обмен под конкретный SA и роль; ключи не существуют как артефакт, ротация автоматична. Secret-ключи — статические, вечные, утекают через логи/образы/репо. IRSA — fail-closed по scope.
</details>

**В4. Зачем origin за Cloudflare Tunnel не нужен открытый входящий порт, и что это меняет для homelab без белого IP?**

<details><summary>Ответ</summary>
cloudflared держит ИСХОДЯЩЕЕ соединение к edge CF, а CF проксирует входящий трафик через него (reverse-коннект). NAT/файрвол не трогаем, белый IP не нужен — доступ к сервисам через домен зоны CF.
</details>

**В5. В AKS поды получают IP из VNet, и подсеть «кончилась». Какие есть пути решения и их цена?**

<details><summary>Ответ</summary>
Azure CNI тянет IP из подсети на каждый под: расширить подсеть, перейти на Azure CNI Overlay (поды из приватного пула, NAT на ноду) или kubenet. Overlay — рекомендуемый путь: экономит VNet-адреса, но теряется прямая достижимость подов из VNet.
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: AWS — приватная подсеть с NAT и проверкой egress (LocalStack/реальный аккаунт sandbox)

**Условие (стартовое состояние):** VPC `10.0.0.0/16`; публичная подсеть `10.0.1.0/24` (IGW), приватная `10.0.2.0/24` без маршрута наружу. Инстанс в приватной подсети не может `apt update`.

```bash
# Шаг 1: диагностика маршрутов приватной подсети
aws ec2 describe-route-tables --filters "Name=association.subnet-id,Values=subnet-priv" \
  --query 'RouteTables[].Routes[].[DestinationCidrBlock,GatewayId,NatGatewayId]' --output table
# Ожидание: только local → egress нет ✅ (диагноз подтверждён)

# Шаг 2: NAT GW в ПУБЛИЧНОЙ подсети + EIP
ALLOC=$(aws ec2 allocate-address --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id subnet-pub --allocation-id $ALLOC \
      --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT

# Шаг 3: маршрут в таблицу приватной подсети
aws ec2 create-route --route-table-id rtb-priv \
  --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT

# Шаг 4: проверка из инстанса приватной подсети (SSM)
aws ssm start-session --target i-priv
sudo apt update && echo "EGRESS OK"     # пакеты тянутся ✅
curl -s --max-time 5 ifconfig.me        # EIP NAT-шлюза — не приватный IP инстанса
```

**Проверь себя:** `describe-route-tables` приватной подсети показывает `0.0.0.0/0 → nat-...`; из инстанса `ifconfig.me` возвращает EIP NAT'а.

**Разбор:** приватность = «нет IGW-маршрута», а не «нет сети»; egress идёт через NAT в публичной подсети. В проде — NAT GW в каждой AZ (иначе AZ с упавшим NAT теряет egress) и учёт $0.045/GB в бюджете.

### Задание 2: GKE + Workload Identity — под с правами GCS без ключей

**Условие:** под должен читать бакет GCS; ноль JSON-ключей.

```bash
# Шаг 0: кластер с workload pool (если нет)
gcloud container clusters update prod --region eu-central1 --workload-pool=PROJECT.svc.id.goog

# Шаг 1: GSA + права на бакет
gcloud iam service-accounts create thanos-reader
gsutil iam ch serviceAccount:thanos-reader@PROJECT.iam.gserviceaccount.com:objectViewer gs://thanos-blocks

# Шаг 2: связка KSA ↔ GSA
gcloud iam service-accounts add-iam-policy-binding \
  thanos-reader@PROJECT.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:PROJECT.svc.id.goog[monitoring/thanos]"

kubectl -n monitoring create sa thanos
kubectl -n monitoring annotate sa thanos \
  iam.gke.io/gcp-service-account=thanos-reader@PROJECT.iam.gserviceaccount.com

# Шаг 3: проверка из пода
kubectl -n monitoring run gcs --rm -it --image=google/cloud-sdk:slim \
  --overrides='{"spec":{"serviceAccountName":"thanos"}}' -- \
  gcloud storage ls gs://thanos-blocks
# Ожидание: содержимое бакета ✅; `gcloud auth list` → GSA, не user
```

**Проверь себя:** в поде нет GOOGLE_APPLICATION_CREDENTIALS-файла с ключом (`ls /root` — пусто); доступ работает только у SA `thanos`, у `default` — отказ.

**Разбор:** binding «KSA в namespace X ↔ GSA» — точечный: даже другой namespace не получит права. Это и есть least-privilege без секретов; JSON-ключи GSA в репо — красный флаг на любом собеседовании.

### Задание 3: Cloudflare Tunnel — приватный сервис без открытых портов

**Условие:** домен в CF; открыть доступ к Grafana на сервере, не открывая ни одного входящего порта; доступ только для команды (Access).

```bash
# Шаг 0: старт — сервер за NAT, grafana на localhost:3000
cloudflared tunnel login
cloudflared tunnel create grafana        # сохранит credentials в ~/.cloudflared/

# Шаг 1: конфиг туннеля
mkdir -p /etc/cloudflared && cp ~/.cloudflared/*.json /etc/cloudflared/tunnel.json
cat > /etc/cloudflared/config.yml <<'EOF'
tunnel: grafana
credentials-file: /etc/cloudflared/tunnel.json
ingress:
  - hostname: grafana.company.io
    service: http://localhost:3000
  - service: http_status:404
EOF
cloudflared tunnel route dns grafana grafana.company.io    # CNAME в зоне CF
cloudflared service install && systemctl start cloudflared

# Шаг 2: проверка снаружи (с ноутбука)
curl -sI https://grafana.company.io | grep -i "cf-ray"
#   cf-ray: ....-FRA → трафик через CF ✅; порт 3000 на сервере закрыт (ss -tlpn | grep 3000 — только localhost)

# Шаг 3: Zero Trust Access (в CF dashboard: Zero Trust → Access → Applications):
#   домен grafana.company.io, policy: email in @company.io → теперь curl без SSO = 302 на login
```

**Проверь себя:** `ss -tlpn | grep -E ':3000'` показывает bind только на 127.0.0.1; снаружи `curl -sI` даёт `cf-ray` и 302 на `cloudflareaccess.com` (Access включён); после SSO-логина Grafana открывается.

**Разбор:** Tunnel = reverse-connection: origin сам подключается к edge, входящих портов ноль — это же решение для homelab (19.1) и «внутренних» панелей без VPN. Access добавляет identity-слой перед приложением: даже открытый URL не отдаст UI без SSO.

---

*Следующая подтема: [20.13 GitLab administration](13-gitlab-administration.md)*
