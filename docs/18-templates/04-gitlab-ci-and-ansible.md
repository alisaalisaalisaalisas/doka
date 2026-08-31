# 🧰 04. Шаблоны: GitLab CI и Ansible (copy-paste)

> Готовые каркасы для новых проектов. K8s/IaC/Obs шаблоны — в [01–03](01-containers-and-k8s.md).

## 🦊 GitLab CI: универсальный каркас приложения

```yaml
# .gitlab-ci.yml — Docker-приложение: lint → test → build → scan → deploy
stages: [verify, build, security, deploy]

default:
  image: python:3.12-slim
  interruptible: true
  retry:
    max: 2
    when: [runner_system_failure]

workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG

variables:
  IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"

lint:
  stage: verify
  needs: []
  script: [make lint]

test:
  stage: verify
  needs: []
  coverage: '/TOTAL.*\s+(\d+%)/'
  script: [make test-ci]
  artifacts:
    reports:
      junit: report.xml
      coverage_report: { coverage_format: cobertura, path: coverage.xml }

build:
  stage: build
  image: docker:27
  services: [docker:27-dind]
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
  script:
    - docker build --pull -t "$IMAGE" .
    - docker push "$IMAGE"
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH || $CI_COMMIT_TAG

scan:
  stage: security
  needs: [build]
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL "$IMAGE"
  allow_failure: false

.deploy: &deploy
  stage: deploy
  image: alpine/k8s:1.31.3
  before_script:
    - kubectl config use-context "$KUBE_CONTEXT"
  script:
    - kubectl set image "deployment/$APP_NAME $APP_NAME=$IMAGE" -n "$NS"

deploy-staging:
  <<: *deploy
  environment: staging
  variables: { NS: shop-staging }
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

deploy-prod:
  <<: *deploy
  environment: production
  variables: { NS: shop-prod }
  when: manual
  rules:
    - if: $CI_COMMIT_TAG
```

Переменные проекта: `KUBE_CONTEXT` (GitLab agent), `APP_NAME`. Секреты — только protected+masked или Vault.

---

## 🅰️ Ansible: каркас плейбука деплоя с проверками

```yaml
# deploy.yml — типовой деплой приложения на VM
---
- name: Деплой shop-api
  hosts: app_servers            # динамический инвентарь
  become: true
  serial: 2                     # rolling: по 2 хоста
  max_fail_percentage: 0        # любая ошибка останавливает rollout
  vars_files:
    - vars/{{ env }}.yml
  pre_tasks:
    - name: Health до деплоя (фиксируем базовую линию)
      ansible.builtin.uri:
        url: "http://localhost:{{ app_port }}/healthz"
        status_code: 200
      changed_when: false

  tasks:
    - name: Остановить сервис
      ansible.builtin.systemd:
        name: "{{ app_name }}"
        state: stopped

    - name: Выложить артефакт
      ansible.builtin.copy:
        src: "artifacts/{{ app_name }}-{{ app_version }}.tar.gz"
        dest: "/opt/{{ app_name }}/app.tar.gz"
        mode: "0644"
      notify: Start service

    - name: Распаковать релиз
      ansible.builtin.unarchive:
        src: "/opt/{{ app_name }}/app.tar.gz"
        dest: "/opt/{{ app_name }}"
        remote_src: true

  handlers:
    - name: Start service
      ansible.builtin.systemd:
        name: "{{ app_name }}"
        state: started
        daemon_reload: true
      listen: restart stack

  post_tasks:
    - name: Health после старта с ретраями
      ansible.builtin.uri:
        url: "http://localhost:{{ app_port }}/healthz"
        status_code: 200
      register: health
      retries: 12
      delay: 5
      until: health.status == 200
      changed_when: false

    - name: Регистрация результата в мониторинг (пример webhook)
      ansible.builtin.uri:
        method: POST
        url: "{{ alert_webhook }}"
        body_format: json
        body: '{"text":"{{ inventory_hostname }}: {{ app_version }} deployed"}'
      when: alert_webhook is defined
      changed_when: false
```

```bash
ansible-playbook deploy.yml -e env=staging -e app_version=1.7.2 --diff
```

---

## 🅰️ Ansible: роль-скелет (структура каталогов)

```text
roles/app_deploy/
├── defaults/main.yml      # все переменные с безопасными дефолтами
├── tasks/main.yml         # основной поток: install → configure → service
├── tasks/backup.yml       # импортируется перед изменениями (pre-backup)
├── handlers/main.yml      # restart/reload, группировка через listen:
├── templates/             # *.j2 конфиги с validate:
├── files/
├── meta/main.yml          # зависимости-коллекции и минимальная версия ansible
└── molecule/default/      # тесты: molecule.yml / converge.yml / verify.yml
```

```yaml
# meta/main.yml
dependencies:
  - role: geerlingguy.docker
    when: install_docker | default(false)
galaxy_info:
  min_ansible_version: "2.17"
```

---

## 🦊 GitLab CI: джоба Terraform plan в MR

```yaml
tf-plan:
  stage: verify
  image: hashicorp/terraform:1.9
  id_tokens: { VAULT_ID_TOKEN: { aud: https://vault.company.local } }   # секреты без статики
  before_script:
    - cd infra/${TF_DIR}
    - terraform init -backend-config="key=${CI_PROJECT_PATH}/${TF_DIR}"
  script:
    - terraform fmt -check -recursive
    - terraform validate
    - terraform plan -out=tfplan.binary
    - terraform show -json tfplan.binary > tfplan.json
  artifacts:
    paths: [infra/*/tfplan.binary]
    expire_in: 1 week
  resource_group: terraform-${TF_DIR}     # запрет параллельных планов на один стейт!
```

`resource_group` — критично: два одновременных `plan/apply` на один state = lock-инциденты (см. [06.3](../06-terraform/03-terraform-testing-ci-and-state-ops.md)).

---

## ✅ Чек-лист использования

- [ ] Скопировали шаблон → заменили APP_NAME/пути → прогнали на staging
- [ ] Секреты не в YAML: CI-variables (protected+masked) или Vault
- [ ] У деплойных джоб есть `environment:` (история + кнопка Stop)
- [ ] Ansible: второй прогон даёт zero changes; health-check после старта обязателен
- [ ] Для Terraform-джоб задан `resource_group`
