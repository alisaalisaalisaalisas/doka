# 🏗️ 20.9 IaC next-gen: Pulumi, Packer, Crossplane

> Уровень: Middle→Senior. Terraform/Ansible уже освоены (разд. 06-07); здесь — три инструмента, которые закрывают то, что HCL не умеет.

**Оглавление:** [Pulumi](#pulumi-iac-на-реальных-языках) · [Packer](#packer-golden-образы) · [Crossplane](#crossplane-облако-как-crd) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## Pulumi: IaC на реальных языках

### Теория

Pulumi = модель Terraform (декларативно, state, plan/apply), но программа пишется на **TypeScript/Python/Go/C#**. Циклы, функции, типы, тесты — без HCL-костылей.

**Архитектура:** CLI → engine строит граф → провайдеры (многие — обёртки над terraform-provider'ами!) → state (Pulumi Cloud / S3 / self-hosted). `pulumi preview` ≈ `terraform plan`.

**Ключевые термины:** `Stack` (экземпляр инфры: dev/prod — как workspace, но first-class), `pulumi config set --secret` (шифрование в стейте), `Output<T>` (значения, известные после создания — «промисы» инфры), `Automation API` (запуск Pulumi из кода — IaC как библиотека).

**vs Terraform:** выбор за абстракциями и тестами; против — экосистема HCL больше, «два стейта» в компании хуже, чем один.

### Конфигурация и синтаксис (TypeScript)

```typescript
// index.ts — VPC + S3 с тегами из конфига стека
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const env = pulumi.getStack();                       // dev | prod

const tags = { Project: "shop", Env: env, ManagedBy: "pulumi" };

const vpc = new aws.ec2.Vpc("main", {
  cidrBlock: config.require("cidr"),                 // pulumi config set cidr 10.200.0.0/16
  enableDnsHostnames: true,
  tags,
});

const bucket = new aws.s3.Bucket("logs", {
  bucket: `shop-logs-${env}`,
  versioning: { enabled: true },
  serverSideEncryptionConfiguration: {
    rule: { applyServerSideEncryptionByDefault: { sseAlgorithm: "aws:kms" } },
  },
  tags,
});

export const vpcId = vpc.id;                          // Output: доступно после apply
export const bucketArn = bucket.arn;
```

```bash
pulumi new aws-typescript -s dev        # шаблон + стек
pulumi config set aws:region eu-central-1
pulumi config set cidr 10.200.0.0/16
pulumi up                               # preview + confirm + apply (как plan+apply)
pulumi stack output vpcId               # значение после создания
pulumi destroy -s dev                   # снести стек
```

**Частые ошибки:** `Output` используют как строку без `apply()` (получат `[object Object]`); секреты в коде вместо `--secret`; один стейт на dev+prod вместо стеков; забытый `pulumi destroy` в тестовых стеках.

### Troubleshooting

```bash
pulumi stack                     # текущий стек, конфиг, URL стейта
pulumi stack export | jq '.deployment.pending_operations'   # застрявшие операции (после Ctrl+C)
pulumi refresh                   # дрейф: привести стейт к реальности (как -refresh-only)
pulumi logs --follow             # логи ресурсов (lambda и т.п.)
pulumi whoami -v                 # бэкенд и права
```

---

## Packer: golden-образы

### Теория

Packer собирает **машинообразы** (AMI, qcow2 для Proxmox/KVM, docker image): builder (где собираем) → provisioner (чем настраиваем: shell/ansible/file) → post-processor (экспорт/теги). Результат — неизменяемый артефакт с версией; Terraform потом создаёт VM из него. Это фундамент immutable infrastructure.

### Конфигурация (HCL2)

```hcl
# ubuntu-docker.pkr.hcl — образ для Proxmox/KVM с предустановленным Docker
packer {
  required_plugins {
    qemu = { version = ">= 1.1", source = "github.com/hashicorp/qemu" }
  }
}

variable "iso_url"      { type = string, default = "https://releases.ubuntu.com/24.04/ubuntu-24.04-live-server-amd64.iso" }
variable "ssh_password" { type = string, sensitive = true }

source "qemu" "ubuntu-docker" {
  iso_url        = var.iso_url
  iso_checksum   = "file:https://releases.ubuntu.com/24.04/SHA256SUMS"
  disk_size      = "10G"
  format         = "qcow2"
  output_directory = "./build"
  ssh_username   = "packer"
  ssh_password   = var.ssh_password
  ssh_timeout    = "30m"
  boot_command   = ["<esc><esc>esc>autoinstall<wait>"]   # + autoinstall seed (cloud-init)
  shutdown_command = "echo packer | sudo -S shutdown -P now"
}

build {
  sources = ["source.qemu.ubuntu-docker"]
  provisioner "shell" {
    inline = [
      "sudo apt-get update && sudo apt-get install -y docker.io",
      "sudo systemctl enable --now docker",
    ]
  }
  provisioner "ansible" { playbook_file = "./ansible/hardening.yml" }   # переиспользование ролей!
  post-processor "manifest" { output = "build/manifest.json" }          # версия образа для Terraform
}
```

```bash
packer init . && packer validate -var ssh_password=... .
packer build -var ssh_password=... ubuntu-docker.pkr.hcl
jq '.builds[-1].custom_data' build/manifest.json   # ID образа → вход для terraform var
```

**Частые ошибки:** `boot_command` не совпадает с ISO (версия/локаль) → сборка висит на ssh_timeout; нет `iso_checksum` (небезопасно и медленно); образ без hardening уходит в прод; manifest не сохраняется — Terraform не знает, что брать.

### Troubleshooting

```bash
packer build -on-error=ask .      # при ошибке оставить VM живой для отладки по SSH
packer build -debug .             # пауза перед каждым шагом, ключи -debug сохраняются
ls -la packer_cache/              # ISO кэшируются тут (не качайте каждый раз)
```

---

## Crossplane: облако как CRD

### Теория

Crossplane — control-plane поверх облаков: инфраструктура описывается **K8s-объектами** и постоянно **reconcile'ится** (в отличие от Terraform — one-shot apply). Платформенная команда собирает из провайдерских ресурсов **Compositions** и даёт разработчикам простые **Claims** (`RequestBucket`), как PVC.

**Слои:** `Provider` (подключение к AWS/и т.д.) → `Managed Resources` (Bucket, RDS — низкий уровень) → `XRD + Composition` (свой «класс ресурсов»: XPostgreSQL → собирается из RDS+secret+monitoring) → `Claim` (запрос разработчика в namespace).

**vs Terraform:** continuous drift-correction, RBAC K8s, self-service для разработчиков; против — сложность composition, зрелость провайдеров ниже TF-экосистемы, отладка тяжелее.

### Конфигурация и синтаксис

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata: { name: provider-aws-s3 }
spec: { package: xpkg.upbound.io/upbound/provider-aws-s3:v1 }
---
apiVersion: aws.crossplane.io/v1beta1
kind: ProviderConfig
metadata: { name: default }
spec:
  credentials:
    source: IRSA                      # IAM Role for Service Account — без статических ключей!
---
apiVersion: s3.aws.crossplane.io/v1beta1
kind: Bucket
metadata: { name: shop-logs-prod }
spec:
  forProvider:
    region: eu-central-1
    versioningConfiguration: { status: Enabled }
    tagging: { tagSet: [{ key: env, value: prod }] }
  providerConfigRef: { name: default }
```

**Claim-уровень (то, что видит разработчик):**

```yaml
apiVersion: platform.shop.io/v1alpha1
kind: ObjectStorage            # XRD, собранный платформенной командой
metadata: { name: app-logs, namespace: team-a }
spec:
  location: eu-central-1
  size: small                  # composition сам решит: versioning, шифрование, lifecycle
```

**Частые ошибки:** статические ключи в ProviderConfig вместо IRSA/Workload Identity; composition без `connectionDetails` → креды созданного бакета не попадают в Secret; нет `deletionPolicy: Orphan` для shared-ресурсов → удаление claim удаляет прод-бакет.

### Troubleshooting

```bash
kubectl get managed                          # все облачные ресурсы и их Synced/Ready
kubectl describe bucket shop-logs-prod       # события: почему не Ready (права IAM!)
kubectl get claims,xrds,compositions         # слой платформы
kubectl -n crossplane-system logs deploy/crossplane | grep -i error | tail
```

---

## 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: `pulumi up` прервали Ctrl+C в момент создания RDS. Что в стейте и как чинить?**

<details><summary>Ответ</summary>
Ресурс может остаться в pending_operations — стейт «не знает», создался ли он. Смотрим stack export → pending_operations; если ресурс реально создан — pulumi refresh/stack import, если нет — повторный up. Никогда не правьте стейт руками без бэкапа (stack export сохраняет историю).
</details>

**В2. Найдите ошибку: Packer-шаблон без `iso_checksum`, сборка раз за разом качает ISO заново и иногда падает на распаковке.**

<details><summary>Ответ</summary>
Нет checksum: Packer не может верифицировать/кэшировать надёжно, битые загрузки приводят к падениям. Нужен iso_checksum (file:URL на SHA256SUMS или явный хэш) — тогда ISO кэшируется в packer_cache и проверяется.
</details>

**В3. Чем Crossplane принципиально отличается от Terraform в модели работы с инфрой?**

<details><summary>Ответ</summary>
Terraform — императивный one-shot apply: запустил — получил, дрейф ловится планом вручную. Crossplane — контроллеры K8s: ресурс описан как CRD и постоянно reconcile'ится к желаемому (как Deployment для подов), с RBAC и claims для self-service.
</details>

**В4. Зачем Packer-пайплайну post-processor `manifest`, если образ и так виден в облаке?**

<details><summary>Ответ</summary>
manifest.json фиксирует ID/имя собранного артефакта машиночитаемо — следующий шаг пайплайна (Terraform/Pulumi) берёт его как input var без хрупкого поиска «последнего AMI по тегу». Это связка immutable-конвейера build→provision.
</details>

**В5. Команда хочет дать разработчикам «базу данных по кнопке». Terraform-модуль или Crossplane Claim — что выбрать и почему?**

<details><summary>Ответ</summary>
Если «по кнопке» = заявка через GitOps с постоянным reconciling, RBAC по namespace и автогенерацией кредов в Secret — Crossplane Claim. Если разовые проекции инфры руками платформенной команды — достаточно TF-модуля. Claim выигрывает на self-service и drift-correction, проигрывает сложностью поддержки composition.
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: Pulumi — стек с секретом и Output (TypeScript)

**Условие:** создать стек `dev` с S3-бакетом, имя которого зависит от стека; секретный токен — через config secret.

```bash
# Шаг 1: каркас проекта (стартовое состояние: пустой каталог)
mkdir shop-iac && cd shop-iac
pulumi new aws-typescript --stack dev --yes
pulumi config set aws:region eu-central-1

# Шаг 2: секретный конфиг
pulumi config set --secret apiToken "super-secret-123"
pulumi config get apiToken        # super-secret-123 (расшифровка локально)
grep apiToken Pulumi.dev.yaml     # зашифровано: secure:v1:... ✅ (не plaintext!)

# Шаг 3: код (index.ts) — см. шаблон из 2.2; добавить чтение секрета:
#   const token = config.requireSecret("apiToken");
#   new aws.s3.BucketObject("token", { bucket, content: pulumi.interpolate`tok=${token}` });

# Шаг 4: жизненный цикл
pulumi up          # preview: "+ 2 to create" → yes → создано, outputs в конце
pulumi stack output bucketArn
pulumi destroy --yes && pulumi stack rm dev --yes    # гигиена лабы
```

**Проверь себя:** в `Pulumi.dev.yaml` значение секрета начинается с `secure:`; `pulumi up` второй раз даёт `No changes` (идемпотентность).

**Разбор:** стек = изолированный экземпляр (dev/prod — разные YAML-файлы стейта); `requireSecret` шифрует значение и в стейте, и в логах preview. Идемпотентность — тот же контракт, что у Terraform.

### Задание 2: Packer — docker-образ с provisioner'ом (быстрая лаба без VM)

**Условие:** собрать docker-образ через Packer с shell-provisioner и manifest — понять конвейер build→artifact.

```bash
# Шаг 0: старт — пустой каталог, установлен packer
mkdir packer-lab && cd packer-lab
cat > docker.pkr.hcl <<'EOF'
packer { required_plugins { docker = { version = ">= 1.1", source = "github.com/hashicorp/docker" } } }

source "docker" "ubuntu" {
  image  = "ubuntu:24.04"
  commit = true
}

build {
  sources = ["source.docker.ubuntu"]
  provisioner "shell" {
    inline = ["apt-get update", "apt-get install -y curl jq", "rm -rf /var/lib/apt/lists/*"]
  }
  post-processor "manifest" { output = "manifest.json" }
}
EOF

# Шаг 1: валидация и сборка
packer init . && packer validate . && packer build .
# Ожидание: ==> docker ubuntu: Provisioning with shell script...
#           Build 'docker' finished after ~1 minute ✅

# Шаг 2: результат — image ID в manifest
jq -r '.builds[-1].artifact_id' manifest.json
# Ожидание: Docker: sha256:...
docker images | head -3
```

**Проверь себя:** `docker run <sha256-id> jq --version` → версия jq (provisioner сработал); повторный `packer build` создаёт новый образ (immutable-артефакт, не «обновление»).

**Разбор:** тот же конвейер, что и для VM-образов (builder→provisioner→manifest), но за минуту. В проде builder — amazon-ebs/qemu, provisioner — ansible-роль (переиспользование с конфиг-менеджментом).

### Задание 3: Crossplane — Bucket как managed resource (kind + provider-k8s/минимальный)

**Условие:** поставить Crossplane, подключить provider (для лабы — `provider-kubernetes` или MinIO через provider-upbound-minio), создать Bucket-ресурс, увидеть reconcile-статус.

```bash
# Шаг 1: установка Crossplane в kind
helm repo add crossplane-stable https://charts.crossplane.io/stable && helm repo update
helm install crossplane crossplane-stable/crossplane -n crossplane-system --create-namespace
kubectl -n crossplane-system get pods    # crossplane + rbac-manager Running

# Шаг 2: провайдер (пример: upbound provider-minio для S3-совместимого MinIO)
kubectl apply -f - <<'EOF'
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata: { name: provider-minio }
spec: { package: xpkg.upbound.io/upbound/provider-minio:v0.15 }
EOF
kubectl get providers                     # INSTALLED: True (ждать скачивания пакета)

# Шаг 3: ProviderConfig + Bucket (стартовое состояние: MinIO из задания 20.8.1)
kubectl apply -f - <<EOF
apiVersion: minio.crossplane.io/v1
kind: ProviderConfig
metadata: { name: default }
spec:
  credentials:
    source: Secret
    secretRef: { namespace: crossplane-system, name: minio-creds, key: creds }
---
apiVersion: minio.crossplane.io/v1
kind: Bucket
metadata: { name: crossplane-bucket }
spec:
  forProvider: { region: us-east-1 }
  providerConfigRef: { name: default }
EOF
kubectl get bucket crossplane-bucket -o jsonpath='{.status.conditions}' | jq
# Ожидание: [{type: Synced, status: True}, {type: Ready, status: True}] ✅

# Шаг 4: проверить в MinIO и удалить
mc ls local/ | grep crossplane-bucket
kubectl delete bucket crossplane-bucket   # GC удалит и в MinIO
```

**Проверь себя:** `kubectl get managed` показывает Bucket с Synced=True/Ready=True; после `kubectl delete` бакет исчез из MinIO (deletionPolicy по умолчанию Delete).

**Разбор:** ключевой опыт — увидеть K8s-контроллер, управляющий ВНЕКЛАСТЕРНЫМ ресурсом: conditions Synced/Ready, события с ошибками IAM/кредов. Это фундамент понимания platform-building на Crossplane.

---

*Следующая подтема: [20.10 CLI-арсенал senior'а](10-cli-arsenal.md)*
