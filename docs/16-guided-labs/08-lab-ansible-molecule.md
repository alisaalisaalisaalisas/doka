# 🅰️ Lab 08: Ansible-роль с нуля — идемпотентность, Vault и Molecule

> **Время:** 75 минут | **Уровень:** Junior→Middle | **Нужно:** Docker, Python 3.10+
> **Результат:** пишете роль по стандарту, шифруете секреты Vault'ом и проверяете её Molecule-тестами в Docker — как в реальном CI.

!!! tip "Интерактивная версия"
    Эту лабу можно прогнать в симуляторе прямо на сайте — с автопроверкой шагов: [Песочница → сценарий «Lab 08»](../21-playground/playground.html?scenario=lab08). Реальные руки — по шагам ниже.

## 🧪 Часть 1: Окружение и каркас роли (10 мин)

```bash
python3 -m venv ~/.venvs/ansible && source ~/.venvs/ansible/bin/activate
pip install "ansible-core>=2.17" molecule molecule-plugins[docker] docker
ansible --version && molecule drivers

mkdir -p ~/labs/lab08 && cd ~/labs/lab08
# Стандартная структура роли
ansible-galaxy init nginx_hardening
cd nginx_hardening
tree -L 2 .    # defaults/ handlers/ tasks/ templates/ meta/ ...
```
---

## 🧪 Часть 2: Роль «nginx с харденингом» (20 мин)

```yaml
# defaults/main.yml — всё изменяемое только через дефолты
nginx_port: 8080
nginx_worker_processes: auto
server_tokens_off: true
ssl_enabled: false
```

```yaml
# tasks/main.yml
---
- name: Установить nginx
  ansible.builtin.package:
    name: nginx
    state: present

- name: Сгенерировать конфиг из шаблона
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    mode: "0644"
    validate: nginx -t -c %s        # сломанный конфиг не применится!
  notify: Restart nginx

- name: Включить и запустить сервис
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true
```

```jinja
{# templates/nginx.conf.j2 #}
worker_processes {{ nginx_worker_processes }};
events { worker_connections 1024; }
http {
  {% if server_tokens_off %}server_tokens off;{% endif %}
  server {
    listen {{ nginx_port }};
    location /healthz { return 200 "ok\n"; }
  }
}
```

```yaml
# handlers/main.yml
---
- name: Restart nginx
  ansible.builtin.service:
    name: nginx
    state: restarted
```

Плейбук для прогона против Docker-цели:

```yaml
# playbook.yml (рядом с ролью)
---
- hosts: all
  become: true
  roles:
    - role: nginx_hardening
      vars: { nginx_port: 8080 }
```

---

## 🧪 Часть 3: Идемпотентность — тест двойного прогона (10 мин)

Molecule сам поднимет Docker-контейнер как «хост»:

```yaml
# molecule/default/molecule.yml
---
dependency: { name: galaxy }
driver: { name: docker }
platforms:
  - name: nginx-lab
    image: geerlingguy/docker-debian12-ansible:latest   # внутри уже готов ansible
    pre_build_image: true
    privileged: true          # для systemd внутри контейнера
provisioner:
  name: ansible
verifier: { name: ansible }
```

```bash
molecule create                 # контейнер поднялся
molecule converge               # роль применилась
molecule idempotence            # ГЛАВНЫЙ тест: второй прогон = 0 changed
```

Если `idempotence` красный — ищите задачу с `shell/command` без `creates`/`changed_when` (см. раздел [07.3](../07-ansible/03-ansible-collections-performance-and-awx.md)).

---

## 🧪 Часть 4: Проверки (verify) — роль доказывает, что работает (15 мин)

```yaml
# molecule/default/verify.yml
---
- hosts: all
  become: true
  tasks:
    - name: Конфиг на месте и валиден
      ansible.builtin.command: nginx -t
      changed_when: false

    - name: Порт отвечает 200
      ansible.builtin.uri:
        url: "http://localhost:{{ nginx_port }}/healthz"
        status_code: 200
      register: health
      retries: 5
      delay: 2
      until: health.status == 200

    - name: server_tokens выключен (заголовок отсутствует)
      ansible.builtin.uri:
        url: "http://localhost:{{ nginx_port }}/"
      register: resp
      failed_when: "'Server' in resp.server | default('') and resp.server != ''"

    - name: Сервис в автозагрузке
      ansible.builtin.assert:
        that: "'enabled' in service_state.status"
      vars:
        service_state: "{{ ansible_facts.services['nginx.service'] }}"
  pre_tasks:
    - name: Собрать факты о сервисах
      ansible.builtin.service_facts:
```

```bash
molecule verify         # зелёный = роль делает то, что заявлено
```

Добавьте негативный сценарий: `molecule/default/create.yml` не трогаем, но проверим отказоустойчивость конфига:

```bash
# Сломать шаблон и убедиться, что validate спасёт прод
echo '{{ broken_var }' >> templates/nginx.conf.j2
molecule converge       # ожидаем FAIL на этапе template c понятной ошибкой
git checkout -- templates/nginx.conf.j2 2>/dev/null || sed -i '$ d' templates/nginx.conf.j2
```

---

## 🧪 Часть 5: Секреты через Ansible Vault (10 мин)

```bash
ansible-vault create group_vars/all/vault.yml
# внутрь:
# vault_admin_password: "S3cure-Lab-Pass!"
ansible-vault encrypt_string 'S3cure-Lab-Pass!' --name vault_api_token

# Роль использует vault_api_token напрямую (переменные мапятся в defaults):
# defaults/main.yml → api_token: "{{ vault_api_token }}"

# Прогон с паролем из env (для CI), файл пароля НЕ коммитится:
echo 'export ANSIBLE_VAULT_PASSWORD=lab123' > ~/.vault-pass.env
molecule converge -- -e @group_vars/all/vault.yml --vault-id dev@prompt
```

Правило: в Git попадает только зашифрованное; `.vault-pass.txt` — в `.gitignore`; ротация секрета = перешифровка (`ansible-vault rekey`).

---

## 🧪 Часть 6: Molecule в CI (GitLab CI) (10 мин)

```yaml
molecule-test:
  stage: test
  image: python:3.12-slim
  variables:
    DOCKER_HOST: tcp://docker:2376
  services: [docker:27-dind]
  before_script:
    - pip install ansible-core molecule molecule-plugins[docker] docker
  script:
    - cd roles/nginx_hardening
    - molecule test            # create → converge → idempotence → verify → destroy
  rules:
    - changes: [roles/**/*]
```

`molecule test` одной командой гоняет весь цикл и уничтожает контейнер — идеальная джоба для MR.

---

## ✅ Проверь себя

1. Чем `template + validate` лучше `copy` для конфигов? *(сломанный конфиг отвалится на этапе генерации, а не рестарта сервиса)*
2. Почему второй прогон должен давать `changed=0`? Что это доказывает? *(идемпотентность — безопасность повторных деплоев)*
3. Где живут лимиты файла для сервиса: limits.conf или systemd? *(systemd override; limits.conf игнорируется юнитами)*
4. Как проверить роль без реального сервера? *(molecule + docker driver, pre_build_image с ansible внутри)*
5. Что произойдёт при потере vault-password? *(доступ к секретам утерян навсегда — хранить пароль в менеджере секретов команды)*

## 🎯 Куда дальше

- Обернуть роль в collection и опубликовать приватно ([07.3](../07-ansible/03-ansible-collections-performance-and-awx.md)).
- Добавить второй scenario Molecule под rootless/Podman.
- Подключить ansible-lint в pre-commit: `pip install ansible-lint && ansible-lint`.
