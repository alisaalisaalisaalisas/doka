# 🏗️ Шаблоны: Terraform, Ansible, CI/CD

## Структура production Terraform-репозитория

```text
infra/
├── modules/
│   ├── network/          # vpc, subnets, routes
│   ├── kubernetes/       # кластер + node groups
│   └── database/         # rds/pg с бэкапами
├── environments/
│   ├── dev/
│   │   ├── main.tf       # только module "..." блоки
│   │   ├── backend.tf    # state: env/dev
│   │   └── terraform.tfvars
│   ├── staging/
│   └── prod/
├── .tflint.hcl
└── .github/workflows/tf-plan.yaml
```

### versions.tf — пиннинг всего (обязателен!)

```hcl
terraform {
  required_version = "~> 1.10.0"      # патч-обновления ок, минорные нет
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"             # ~> = только патчи
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {                        # ВСЕГДА тегируем всё
    tags = {
      Project     = "shop"
      Environment = var.environment
      ManagedBy   = "terraform"
      Repository  = "github.com/org/infra"
    }
  }
}
```

### Модуль с валидацией входных данных

```hcl
# modules/webapp/variables.tf
variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  validation {
    condition     = can(regex("^(t3|t4g|m6i)\\.", var.instance_type))
    error_message = "Разрешены только t3/t4g/m6i семейства."
  }
}

variable "replicas" {
  type    = number
  default = 2
  validation {
    condition     = var.replicas >= 2 && var.replicas <= 20
    error_message = "Минимум 2 для HA, максимум 20 (квоты)."
  }
}
```

### CI для Terraform (GitHub Actions): plan на PR, apply из main

```yaml
name: terraform
on:
  pull_request: { paths: ["environments/**", "modules/**"] }
  push: { branches: [main], paths: ["environments/**", "modules/**"] }

jobs:
  fmt-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with: { terraform_version: 1.10.0 }
      - run: terraform fmt -check -recursive -diff
      - uses: terraform-linters/setup-tflint@v4
      - run: tflint --init && tflint --recursive

  plan:
    needs: fmt-lint
    runs-on: ubuntu-latest
    strategy: { matrix: { env: [staging] } }   # prod — отдельным защищенным workflow
    defaults: { run: { working-directory: environments/${{ matrix.env }} } }
    permissions: { id-token: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/gha-tf-plan   # OIDC, без секретов!
          aws-region: eu-central-1
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init && terraform plan -out=tfplan -no-color
      - uses: actions/github-script@v7          # план прямо в PR комментарий!
        with:
          script: |
            const fs = require('fs');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner, repo: context.repo.repo,
              body: '### Plan `' + '${{ matrix.env }}' + '`\n```\n' +
                    fs.readFileSync('environments/${{ matrix.env }}/tfplan', 'utf8').slice(0, 60000) +
                    '\n```'
            });

  apply:
    if: github.ref == 'refs/heads/main'
    needs: plan
    environment: production                     # требует approve!
    # ... аналогично plan, но terraform apply tfplan
```

---

## Ansible: skeleton роли с molecule

```yaml
# requirements.yml — зависимости коллекций версионируются!
collections:
  - name: community.docker
    version: ">=3.10.0"
  - name: ansible.posix
    version: ">=1.6.0"
```

```yaml
# site.yml — точка входа, максимум логики в ролях
- import_playbook: playbooks/common.yml
- import_playbook: playbooks/docker-hosts.yml
- import_playbook: playbooks/kube-workers.yml
```

```yaml
# roles/nginx/tasks/main.yaml — идемпотентно и с проверками
---
- name: Install nginx
  ansible.builtin.package:
    name: nginx
    state: present
  notify: restart nginx

- name: Deploy hardened config
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    mode: "0644"
    validate: nginx -t -c %s          # валидация ДО применения!
  notify: reload nginx

- name: Ensure service enabled
  ansible.builtin.systemd_service:
    name: nginx
    enabled: true
    state: started
```

```bash
# Проверка перед коммитом (pre-commit hook)
ansible-lint roles/
molecule test -s default
ansible-playbook site.yml --syntax-check --diff --check -i inventories/staging
```

---

## GitLab CI: полный шаблон с DAG

```yaml
stages: [validate, test, build, deploy]

workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

default:
  interruptible: true
  image: alpine:3.21

.helm-job:
  before_script:
    - apk add helm curl >/dev/null
    - helm repo add bitnami https://charts.bitnami.com/bitnami

lint:helm:
  stage: validate
  extends: .helm-job
  script:
    - helm lint charts/app/
    - helm template charts/app/ -f charts/app/values-prod.yaml > /dev/null

test:unit:
  stage: test
  image: golang:1.23
  coverage: '/coverage: \d+.\d+%/'
  script:
    - go test -race -coverprofile=coverage.out -covermode=atomic ./...

build:image:
  stage: build
  needs: [test:unit, lint:helm]
  parallel:
    matrix:
      - ARCH: [amd64, arm64]
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - /kaniko/executor --context $CI_PROJECT_DIR --dockerfile Dockerfile
      --destination $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA-$ARCH --cache=true

deploy:staging:
  stage: deploy
  needs: [build:image]
  environment: { name: staging, url: https://staging.shop.io }
  script:
    - helm upgrade --install app charts/app/ -n shop-staging
        -f charts/app/values-staging.yaml --set image.tag=$CI_COMMIT_SHA --wait --timeout 5m
    - ./scripts/smoke-test.sh https://staging.shop.io   # проверка после деплоя!

deploy:production:
  stage: deploy
  needs: [deploy:staging]
  when: manual                      # ручной гейт в прод
  environment: { name: production, url: https://shop.io }
  script:
    - helm upgrade --install app charts/app/ -n shop
        -f charts/app/values-prod.yaml --set image.tag=$CI_COMMIT_SHA --wait --timeout 8m
```

!!! warning "Три правила пайплайнов"
    1. Деплой без smoke-теста — не деплой, а надежда.
    2. Прод всегда через ручной гейт или GitOps (никаких автодеплоев в прод из ветки).
    3. Секреты — только через переменные окружения runner'а/Vault, никогда в `.gitlab-ci.yml`.
