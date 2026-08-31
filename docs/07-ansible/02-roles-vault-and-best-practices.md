# 🎭 02. Роли, Коллекции, Jinja2, Vault и Тестирование Molecule

## 📂 Структура Ansible Role

Роли позволяют разбивать плейбуки на независимые переиспользуемые компоненты:

```text
roles/nginx_server/
├── defaults/
│   └── main.yaml    # Дефолтные переменные с низшим приоритетом (можно переопределять)
├── vars/
│   └── main.yaml    # Константные переменные роли с высоким приоритетом
├── tasks/
│   └── main.yaml    # Основные шаги настройки
├── handlers/
│   └── main.yaml    # Обработчики событий (reload, restart)
├── templates/
│   └── site.conf.j2 # Jinja2 шаблоны
├── files/
│   └── static.html  # Статические файлы для прямого копирования
└── meta/
    └── main.yaml    # Зависимости от других ролей
```

---

## 🎨 Jinja2 Шаблонизация

Пример шаблона `templates/site.conf.j2`:
```jinja2
# Конфигурация сгенерирована автоматически через Ansible. Не редактировать вручную!
server {
    listen {{ nginx_port | default(80) }};
    server_name {{ server_domain }};

    root {{ document_root | default('/var/www/html') }};
    index index.html index.htm;

    {% if enable_gzip %}
    gzip on;
    gzip_types text/plain application/json text/css;
    {% endif %}

    # Итерация по списку upstream серверов
    location /api/ {
        proxy_pass http://backend_pool;
    }
}

upstream backend_pool {
{% for host in groups['appservers'] %}
    server {{ hostvars[host]['ansible_host'] }}:8080 weight={{ hostvars[host]['weight'] | default(1) }};
{% endfor %}
}
```

---

## 🔐 Шифрование секретов: Ansible Vault

Ansible Vault позволяет безопасно хранить пароли, приватные ключи и токены прямо в Git в зашифрованном виде (AES-256).

### 1. Команды Ansible Vault:
```bash
# Зашифровать файл с секретами целиком
ansible-vault encrypt vars/secrets.yaml

# Редактировать зашифрованный файл
ansible-vault edit vars/secrets.yaml

# Зашифровать отдельную строковую переменную (inline vault)
ansible-vault encrypt_string 'MySuperSecretPassword123' --name 'db_password'

# Запуск плейбука с запросом пароля от Vault
ansible-playbook -i inventory.yaml site.yaml --ask-vault-pass

# Запуск в CI с паролем из файла или переменной окружения
ansible-playbook -i inventory.yaml site.yaml --vault-password-file .vault_pass.txt
```

### 2. Пример использования зашифрованной переменной:
```yaml
# vars/main.yaml
db_user: "app_admin"
db_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          35373836373831353163353434626135313936653130633939633532653934376332616239303337
          3136653439366432363162386538356133373463326138640a323337353936616434373462376239
```

---

## 🧪 Тестирование ролей с помощью Molecule

**Molecule** автоматически поднимает тестовый Docker-контейнер, накатывает на него роль и выполняет верификацию:

```bash
# Инициализация тестового сценария в роли
molecule init scenario --driver-name docker

# Полный цикл тестирования (Lint -> Destroy -> Create -> Converge -> Idempotence -> Verify -> Destroy)
molecule test
```

---

## 🔬 Deep Dive: шифрование секретов без боли

```bash
# Шифруем ТОЛЬКО значения, файл остается читаемым (inline vault)
ansible-vault encrypt_string 'S3cr3tP@ss' --name 'db_password'

# Rekey всей истории ключей (ротация)
ansible-vault rekey group_vars/prod/vault.yml

# Идемпотентный запуск с ключом из pass/1password
ansible-playbook site.yml --vault-password-file ~/.vault_pass_prod
```

### Molecule: тестирование ролей как кода

```yaml
# molecule/default/molecule.yml
scenario:
  test_sequence:
    - dependency
    - cleanup
    - destroy
    - syntax
    - create
    - prepare
    - converge
    - idempotence      # второй прогон не должен менять state!
    - verify           # ваши assert'ы
    - cleanup
    - destroy
```

```bash
pip install molecule[docker] ansible-lint
molecule test                     # полная матрица за ~2 минуты
ansible-lint roles/nginx          # статический анализ best practices
```

### Precedence переменных (топ-7 из ~22)

```text
1. role defaults (самые слабые)
2. inventory group_vars/all
3. inventory host_vars
4. play vars
5. play vars_files
6. extra-vars (-e) ← ВСЕГДА выигрывает
```

!!! warning «Ansible ≠ Terraform»
    Ansible — конфигурация существующих машин (provisioned state drift fixer); Terraform — создание/уничтожение ресурсов. Порядок: Terraform создаёт VM → Ansible настраивает → приложение деплоит GitOps.

---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production (Ansible Vault/Roles — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `ERROR! Decryption failed` в CI | `ANSIBLE_VAULT_PASSWORD_FILE` не прокинут | `ansible-vault view --vault-password-file <(echo $VAULT_PASS)` |
| `role not found` после `ansible-galaxy install` | `collections_paths` не включает `~/.ansible/collections` | `ansible-galaxy collection list -p /usr/share/ansible/collections` |
| `changed_when: false` скрыл реальную ошибку | Команда упала но `changed_when` false → `failed_when` не сработал | `changed_when: result.rc == 0` + `failed_when: result.rc != 0` |
| `vault.yml` в Git без `!vault` | `ansible-vault encrypt_string` скопирован без `!vault |` | `grep -r '\$ANSIBLE_VAULT'` — должен быть `!vault` tag |

!!! warning «Идемпотентность — закон»
    Любой скрипт/плейбук/модуль должен быть безопасно перезапускаемым. Если второй прогон меняет состояние — это баг, который однажды уронит прод.

## 🧪 Hands-on Lab

```bash
ansible-lint . && molecule list 2>/dev/null; \
ansible-vault view group_vars/prod/vault.yml --ask-vault-pass <<< $VAULT_PASS 2>/dev/null | head -5 || echo 'vault ok'
```

## ✅ Чек-лист зрелости темы

- [ ] Все изменения проходят через PR с обязательным review

    ??? tip "Как закрыть пункт"
        Branch protection запрещает push в main; изменения инфраструктуры/конфигов — только через MR с review. Проверка: история применений соответствует истории мержей, «горячие правки на сервере» отсутствуют как класс.

- [ ] Секреты никогда не хранятся в коде/стейте (Vault/SOPS/secret manager)

    ??? tip "Как закрыть пункт"
        Vault/ESO как источник; gitleaks в pre-commit и CI. Для стейтов — шифрование бэкенда и ограничение доступа IAM. Аудит: grep по репозиторию находит ссылки на переменные, но не значения.

- [ ] Есть dry-run/plan этап и он виден в MR

    ??? tip "Как закрыть пункт"
        plan/--check --diff выполняется CI на каждый MR и публикуется в комментарий — ревьюер видит изменения инфраструктуры до approve. Артефакт плана переиспользуется при apply.

- [ ] Откат воспроизводим одной командой (< 10 минут)

    ??? tip "Как закрыть пункт"
        git revert + pipeline = откат инфраструктуры; helm rollback/GitOps revert для релизов. Отработано учением с таймером: решение → восстановленный сервис. Если есть ручные шаги — они в runbook.

- [ ] Логи пайплайна содержат версии артефактов (image digest, commit SHA)

    ??? tip "Как закрыть пункт"
        Deploy-джоба печатает: SHA коммита, digest образа, версии инструментов. При инциденте вы точно знаете, какой код где исполнялся. Проверка: по логу можно восстановить состояние прода на любой момент.

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🔬 Закрепить | [Lab 08: Vault и Molecule](../16-guided-labs/08-lab-ansible-molecule.md) |
| 🎤 Проверить себя | [Вопросы: Ansible](../14-interview-prep/04-100-devops-interview-questions-bank-part2.md) |

---

## ✅ Проверь себя

**В1. defaults/main.yml vs vars/main.yml — разница приоритетов?**
<details><summary>Ответ</summary>
defaults — переопределяемые дефолты (самый низкий приоритет переменных); vars — внутренние константы роли с высоким приоритетом, которые не предполагается менять снаружи. handlers — реакции на notify, выполняются один раз в конце play.
</details>

**В2. encrypt_string против шифрования файла целиком?**
<details><summary>Ответ</summary>
encrypt_string шифрует только значения: diff/git-история несекретной части остаётся читаемой, меньше конфликтов мержей. Файл целиком проще, но прячет все изменения. Ключ Vault хранить вне репо (CI variables/менеджер секретов).
</details>

**В3. Что делает задачу идемпотентной и почему shell-модуль опасен?**
<details><summary>Ответ</summary>
Идемпотентность: повторный запуск ничего не меняет, если состояние уже достигнуто (модули apt/copy/template проверяют состояние). command/shell выполняется ВСЕГДА — нужен creates:/changed_when:, иначе задача всегда reported changed и ломает diff-режим.
</details>

**В4. Molecule: что проверяет и какой дефолтный сценарий?**
<details><summary>Ответ</summary>
Тестирование ролей: converge (прогон роли на инстансе — docker/podman/VM), verify (assert'ы через ansible/inspec), idempotence (повторный converge должен дать 0 changed). Ловит ошибки синтаксиса и нарушения идемпотентности до проды.
</details>

**В5. Как безопасно посмотреть изменения плейбука без применения?**
<details><summary>Ответ</summary>
ansible-playbook --check --diff: check-mode не меняет систему, diff показывает, что именно изменилось (файлы, пакеты). Обязателен в CI против staging; для модулей без поддержки check — явно помечать.
</details>
