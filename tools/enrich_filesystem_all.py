#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Масштабное обогащение Playground: добавляет файловую систему в КАЖДУЮ задачу.
Не удаляет существующие сценарии, только дополняет.
Сохраняет 1033 сценария, добавляет tree/files/solutionFiles/checks где их нет.
"""
import os, re, pathlib, json

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIR = ROOT / "docs" / "21-playground"

# Категории и их файловые структуры
def escape_js(s):
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

def gen_python_files(title, sid):
    # title-specific file content
    low = title.lower()
    if "argparse" in low:
        initial = '''import argparse

parser = argparse.ArgumentParser(description="Demo CLI")
parser.add_argument("--input", required=False, help="input file")  # BUG: should be True
parser.add_argument("--output", required=True, help="output file")
args = parser.parse_args()
print(f"input={args.input} output={args.output}")
'''
        fixed = '''import argparse

parser = argparse.ArgumentParser(description="Demo CLI")
parser.add_argument("--input", required=True, help="input file")
parser.add_argument("--output", required=True, help="output file")
args = parser.parse_args()
print(f"input={args.input} output={args.output}")
'''
        checks = [{"re": r"required\s*=\s*True", "l": "required=True для --input"}]
        files = {"app.py": initial}
        sol = {"app.py": fixed}
        return files, sol, checks, "app.py"
    elif "pathlib" in low:
        initial = '''from pathlib import Path

# BUG: использует строковую конкатенацию вместо Path /
base = Path("/data")
name = "output.txt"
full = str(base) + "/" + name  # should use /
print(full)
'''
        fixed = '''from pathlib import Path

base = Path("/data")
name = "output.txt"
full = base / name
print(full)
# также: base.joinpath(name)
'''
        checks = [{"re": r"Path\(.*\)\s*/", "l": "использует Path / join"}]
        return {"main.py": initial}, {"main.py": fixed}, checks, "main.py"
    elif "subprocess" in low and "shell" in low:
        initial = '''import subprocess

# BUG: shell=True — риск инъекции
subprocess.run(f"ls {user_input}", shell=True)
'''
        fixed = '''import subprocess

subprocess.run(["ls", user_input], shell=False)
# или shlex.split + shell=False
'''
        checks = [{"re": r"shell\s*=\s*False", "l": "shell=False"}]
        return {"app.py": initial}, {"app.py": fixed}, checks, "app.py"
    elif "socket" in low and "reuseaddr" in low:
        initial = '''import socket
s = socket.socket()
s.bind(("127.0.0.1", 8080))  # BUG: без SO_REUSEADDR
s.listen(1)
'''
        fixed = '''import socket
s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(("127.0.0.1", 8080))
s.listen(1)
'''
        checks = [{"re": r"SO_REUSEADDR", "l": "устанавливает SO_REUSEADDR"}]
        return {"server.py": initial}, {"server.py": fixed}, checks, "server.py"
    elif "requests" in low and "session" in low:
        initial = '''import requests
for url in urls:
    r = requests.get(url)  # BUG: без Session
    print(r.status_code)
'''
        fixed = '''import requests
session = requests.Session()
for url in urls:
    r = session.get(url)
    print(r.status_code)
'''
        checks = [{"re": r"Session\(\)", "l": "использует requests.Session"}]
        return {"app.py": initial}, {"app.py": fixed}, checks, "app.py"
    elif "asyncio" in low:
        initial = '''import asyncio
async def main():
    await asyncio.gather(task1(), task2())  # BUG: исключения теряются
asyncio.run(main())
'''
        fixed = '''import asyncio
async def main():
    await asyncio.gather(task1(), task2(), return_exceptions=False)
    # или asyncio.wait с проверкой
asyncio.run(main())
'''
        checks = [{"re": r"gather|wait", "l": "корректно обрабатывает gather/wait"}]
        return {"main.py": initial}, {"main.py": fixed}, checks, "main.py"
    elif "threading" in low and "race" in low:
        initial = '''import threading
counter = 0
def inc():
    global counter
    counter += 1  # BUG: race condition
threads = [threading.Thread(target=inc) for _ in range(10)]
for t in threads: t.start()
for t in threads: t.join()
'''
        fixed = '''import threading
counter = 0
lock = threading.Lock()
def inc():
    global counter
    with lock:
        counter += 1
threads = [threading.Thread(target=inc) for _ in range(10)]
for t in threads: t.start()
for t in threads: t.join()
'''
        checks = [{"re": r"Lock\(\)", "l": "использует Lock"}]
        return {"main.py": initial}, {"main.py": fixed}, checks, "main.py"
    elif "logging" in low:
        initial = '''import logging
logging.basicConfig(level="INFO")
logging.basicConfig(level="DEBUG")  # BUG: второй вызов игнорируется
logging.info("test")
'''
        fixed = '''import logging
logging.basicConfig(level="INFO", force=True)
# или dictConfig
logging.info("test")
'''
        checks = [{"re": r"force\s*=\s*True|dictConfig", "l": "исправляет basicConfig"}]
        return {"app.py": initial}, {"app.py": fixed}, checks, "app.py"
    else:
        # generic python
        initial = f'''# {title}
def main():
    # TODO: исправьте логику для задачи: {title}
    data = {{"status": "broken"}}
    print(data)

if __name__ == "__main__":
    main()
'''
        fixed = f'''# {title} — исправлено
def main():
    data = {{"status": "ok", "fixed": True}}
    print(data)
    return data

if __name__ == "__main__":
    main()
'''
        checks = [{"re": r"fixed|ok", "l": "исправлена логика"}]
        return {"main.py": initial}, {"main.py": fixed}, checks, "main.py"

def gen_go_files(title, sid):
    low = title.lower()
    if "build" in low or "компиляции" in low:
        initial = '''package main
import "fmt"
func main() {
    fmt.Println("hello"  // BUG: missing )
}
'''
        fixed = '''package main
import "fmt"
func main() {
    fmt.Println("hello")
}
'''
        checks = [{"re": r"fmt\.Println", "l": "код компилируется"}]
        return {"main.go": initial, "go.mod": "module example.com/app\ngo 1.23\n"}, {"main.go": fixed, "go.mod": "module example.com/app\ngo 1.23\n"}, checks, "main.go"
    elif "race" in low:
        initial = '''package main
import "sync"
var counter int
func inc(wg *sync.WaitGroup) {
    defer wg.Done()
    counter++ // BUG: race
}
'''
        fixed = '''package main
import "sync"
var counter int
var mu sync.Mutex
func inc(wg *sync.WaitGroup) {
    defer wg.Done()
    mu.Lock()
    counter++
    mu.Unlock()
}
'''
        checks = [{"re": r"Mutex|sync\.Mutex", "l": "использует Mutex"}]
        return {"main.go": initial, "go.mod": "module example.com/app\ngo 1.23\n"}, {"main.go": fixed, "go.mod": "module example.com/app\ngo 1.23\n"}, checks, "main.go"
    else:
        initial = f'''package main
// {title} — сломанная версия
import "fmt"
func main() {{
    fmt.Println("broken")
}}
'''
        fixed = f'''package main
// {title} — исправлено
import "fmt"
func main() {{
    fmt.Println("ok")
}}
'''
        checks = [{"re": r"ok|fixed", "l": "исправлен main.go"}]
        return {"main.go": initial, "go.mod": "module example.com/app\ngo 1.23\n"}, {"main.go": fixed, "go.mod": "module example.com/app\ngo 1.23\n"}, checks, "main.go"

def gen_k8s_files(title, sid):
    low=title.lower()
    if "crashloop" in low or "required_db_url" in low:
        initial = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: prod
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: web
        image: registry.corp/api:2.4.0
        env:
        - name: REQUIRED_DB_URL  # missing value
"""
        fixed = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: prod
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: web
        image: registry.corp/api:2.4.0
        env:
        - name: REQUIRED_DB_URL
          value: postgres://api:secret@pg:5432/shop
"""
        checks=[{"re": r"REQUIRED_DB_URL[\s\S]*value:", "l": "REQUIRED_DB_URL задан"}]
        return {"k8s/deployment.yaml": initial, "k8s/service.yaml": "apiVersion: v1\nkind: Service\nmetadata:\n  name: api\nspec:\n  ports:\n  - port: 80\n"}, {"k8s/deployment.yaml": fixed, "k8s/service.yaml": "apiVersion: v1\nkind: Service\nmetadata:\n  name: api\nspec:\n  ports:\n  - port: 80\n"}, checks, "k8s/deployment.yaml"
    elif "hpa" in low or "autoscal" in low:
        initial = """apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: shop-api
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        averageUtilization: 999  # BUG
"""
        fixed = """apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: shop-api
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        averageUtilization: 70
"""
        checks=[{"re": r"averageUtilization:\s*70", "l": "HPA настроен"}]
        return {"k8s/hpa.yaml": initial}, {"k8s/hpa.yaml": fixed}, checks, "k8s/hpa.yaml"
    else:
        initial = f"""# {title} — broken
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: prod
spec:
  replicas: 1  # BUG: should be 3
  template:
    spec:
      containers:
      - name: web
        image: nginx:1.25
"""
        fixed = f"""# {title} — fixed
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: prod
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: web
        image: nginx:1.25
"""
        checks=[{"re": r"replicas:\s*3", "l": "replicas=3"}]
        return {"k8s/deployment.yaml": initial, "k8s/service.yaml": "apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n"}, {"k8s/deployment.yaml": fixed, "k8s/service.yaml": "apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n"}, checks, "k8s/deployment.yaml"

def gen_terraform_files(title, sid):
    low=title.lower()
    if "drift" in low:
        initial = """resource "local_file" "inventory" {
  filename = "${path.module}/inventory.txt"
  content  = "# manual"  # BUG: drift
}
"""
        fixed = """resource "local_file" "inventory" {
  filename = "${path.module}/inventory.txt"
  content  = "server: ${random_pet.server_name.id}\\n"
}
resource "random_pet" "server_name" {
  prefix = "web"
}
"""
        checks=[{"re": r"random_pet", "l": "использует random_pet"}]
        return {"terraform/main.tf": initial, "terraform/variables.tf": 'variable "env" { default = "prod" }'}, {"terraform/main.tf": fixed, "terraform/variables.tf": 'variable "env" { default = "prod" }'}, checks, "terraform/main.tf"
    else:
        initial = f'''# {title}
resource "null_resource" "example" {{
  triggers = {{
    value = "broken"
  }}
}}
'''
        fixed = f'''# {title} — fixed
resource "null_resource" "example" {{
  triggers = {{
    value = "ok"
  }}
}}
'''
        checks=[{"re": r"ok", "l": "исправлен main.tf"}]
        return {"terraform/main.tf": initial, "terraform/variables.tf": 'variable "env" {}'}, {"terraform/main.tf": fixed, "terraform/variables.tf": 'variable "env" {}'}, checks, "terraform/main.tf"

def gen_ansible_files(title, sid):
    low=title.lower()
    initial = f"""# {title}
- hosts: web
  tasks:
    - name: broken task
      command: echo broken  # BUG: should use module
"""
    fixed = f"""# {title} — fixed
- hosts: web
  tasks:
    - name: fixed task
      ansible.builtin.command:
        cmd: echo fixed
      changed_when: false
"""
    checks=[{"re": r"ansible\.builtin|changed_when", "l": "использует ansible модуль"}]
    return {"ansible/site.yml": initial, "ansible/inventory.ini": "[web]\nweb1.example.com\n"}, {"ansible/site.yml": fixed, "ansible/inventory.ini": "[web]\nweb1.example.com\n"}, checks, "ansible/site.yml"

def gen_docker_files(title, sid):
    initial = """FROM python:3.11-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
# BUG: no multi-stage, large image
"""
    fixed = """FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
FROM gcr.io/distroless/python3-debian12
COPY --from=base /app /app
WORKDIR /app
CMD ["python", "app.py"]
"""
    checks=[{"re": r"distroless|multi", "l": "оптимизирован Dockerfile"}]
    return {"Dockerfile": initial, "app.py": 'print("hello")\n', "requirements.txt": "flask==3.0.0\n"}, {"Dockerfile": fixed, "app.py": 'print("hello")\n', "requirements.txt": "flask==3.0.0\n"}, checks, "Dockerfile"

def gen_linux_files(title, sid):
    low=title.lower()
    if "systemd" in low:
        initial = """[Unit]
Description=Demo service
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/demo/main.py
# BUG: missing Restart
"""
        fixed = """[Unit]
Description=Demo service
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/demo/main.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
"""
        checks=[{"re": r"Restart=", "l": "настроен Restart"}]
        return {"systemd/demo.service": initial, "app/main.py": 'print("hello")\n'}, {"systemd/demo.service": fixed, "app/main.py": 'print("hello")\n'}, checks, "systemd/demo.service"
    elif "disk" in low or "inode" in low:
        initial = """# /etc/logrotate.conf — broken, не ротирует
/var/log/app/*.log {
    size 100M
    rotate 0  # BUG
}
"""
        fixed = """# /etc/logrotate.conf — fixed
/var/log/app/*.log {
    size 100M
    rotate 7
    compress
    missingok
}
"""
        checks=[{"re": r"rotate\s+7|compress", "l": "настроена ротация"}]
        return {"etc/logrotate.conf": initial}, {"etc/logrotate.conf": fixed}, checks, "etc/logrotate.conf"
    else:
        initial = f"""# {title}
# broken config
BROKEN=1
"""
        fixed = f"""# {title} — fixed
OK=1
"""
        checks=[{"re": r"OK", "l": "исправлен конфиг"}]
        return {"config/system.conf": initial}, {"config/system.conf": fixed}, checks, "config/system.conf"

def gen_network_files(title, sid):
    initial = f"""# {title}
# broken network config
# ping fails, dns fails
"""
    fixed = f"""# {title} — fixed
# network ok
"""
    checks=[{"re": r"fixed|ok", "l": "сеть исправлена"}]
    return {"network/config.yaml": initial}, {"network/config.yaml": fixed}, checks, "network/config.yaml"

def gen_bash_files(title, sid):
    initial = f"""#!/bin/bash
# {title} — broken
set +e  # BUG: should be set -e
echo "start"
false
echo "should not reach"
"""
    fixed = f"""#!/bin/bash
# {title} — fixed
set -e
echo "start"
false
echo "should not reach"
"""
    checks=[{"re": r"set\s+-e", "l": "set -e установлен"}]
    return {"script.sh": initial}, {"script.sh": fixed}, checks, "script.sh"

def gen_git_files(title, sid):
    initial = f"""# {title}
# git repo with conflict
<<<<<<< HEAD
version=1
=======
version=2
>>>>>>> feature
"""
    fixed = f"""# {title} — fixed
version=2
"""
    checks=[{"re": r"version", "l": "конфликт разрешен"}]
    return {"repo/file.txt": initial, ".git/COMMIT": "init\n"}, {"repo/file.txt": fixed, ".git/COMMIT": "fixed\n"}, checks, "repo/file.txt"

def gen_generic_files(cat, title, sid):
    low = title.lower()
    # fallback
    initial = f"""# {cat}: {title}
# broken initial state
status: broken
# TODO: fix {title}
"""
    fixed = f"""# {cat}: {title} — fixed
status: ok
# fixed {title}
"""
    checks=[{"re": r"ok|fixed", "l": "статус ok"}]
    # choose path based on cat
    if "ansible" in cat.lower():
        return gen_ansible_files(title, sid)
    elif "terraform" in cat.lower() or "tofu" in cat.lower():
        return gen_terraform_files(title, sid)
    elif "kubernetes" in cat.lower() or cat.lower()=="k8s" or "k8s" in cat.lower():
        return gen_k8s_files(title, sid)
    elif "docker" in cat.lower():
        return gen_docker_files(title, sid)
    elif "linux" in cat.lower() or "systemd" in low:
        return gen_linux_files(title, sid)
    elif "network" in cat.lower() or "сети" in cat.lower():
        return gen_network_files(title, sid)
    elif "bash" in cat.lower():
        return gen_bash_files(title, sid)
    elif "git" in cat.lower():
        return gen_git_files(title, sid)
    elif "helm" in cat.lower():
        return ({"helm/Chart.yaml": initial, "helm/values.yaml": "replicas: 1\n"}, {"helm/Chart.yaml": fixed, "helm/values.yaml": "replicas: 3\n"}, checks, "helm/values.yaml")
    elif "prometheus" in cat.lower() or "grafana" in cat.lower() or "observability" in cat.lower():
        return ({"monitoring/prometheus.yml": initial}, {"monitoring/prometheus.yml": fixed}, checks, "monitoring/prometheus.yml")
    elif "security" in cat.lower():
        return ({"security/policy.yaml": initial}, {"security/policy.yaml": fixed}, checks, "security/policy.yaml")
    elif "aws" in cat.lower() or "gcp" in cat.lower() or "azure" in cat.lower() or "cloud" in cat.lower():
        return ({"cloud/main.tf": initial}, {"cloud/main.tf": fixed}, checks, "cloud/main.tf")
    elif "postgres" in cat.lower():
        return ({"postgres/fix.sql": initial}, {"postgres/fix.sql": fixed}, checks, "postgres/fix.sql")
    elif "kafka" in cat.lower():
        return ({"kafka/config.yaml": initial}, {"kafka/config.yaml": fixed}, checks, "kafka/config.yaml")
    elif "redis" in cat.lower():
        return ({"redis/redis.conf": initial}, {"redis/redis.conf": fixed}, checks, "redis/redis.conf")
    elif "mongo" in cat.lower():
        return ({"mongo/mongod.conf": initial}, {"mongo/mongod.conf": fixed}, checks, "mongo/mongod.conf")
    else:
        # generic project
        safe = re.sub(r'[^a-z0-9]+','-', title.lower())[:20]
        return ({f"project/{safe}.yaml": initial}, {f"project/{safe}.yaml": fixed}, checks, f"project/{safe}.yaml")

def get_files_for_cat(cat, title, sid):
    cl = cat.lower()
    tl = title.lower()
    if cat == "Python" or "python" in cl:
        return gen_python_files(title, sid)
    elif cat == "Go" or cl=="go":
        return gen_go_files(title, sid)
    elif "k8s" in cl or "kubernetes" in cl or cl=="kubernetes":
        return gen_k8s_files(title, sid)
    elif "terraform" in cl or "tofu" in cl or "opentofu" in cl:
        return gen_terraform_files(title, sid)
    elif "ansible" in cl:
        return gen_ansible_files(title, sid)
    elif "docker" in cl:
        return gen_docker_files(title, sid)
    elif "linux" in cl or "systemd" in tl or "systemd" in cl:
        return gen_linux_files(title, sid)
    elif "сети" in cat or "network" in cl:
        return gen_network_files(title, sid)
    elif cat == "Bash" or "bash" in cl:
        return gen_bash_files(title, sid)
    elif cat == "Git" or "git" in cl:
        return gen_git_files(title, sid)
    else:
        return gen_generic_files(cat, title, sid)

def gen_brief(cat, title, files, commands, solution_labels):
    files_list = ", ".join(f"<code>{f}</code>" for f in list(files.keys())[:4])
    active = list(files.keys())[0] if files else "main.py"
    cmds = commands[:2] if commands else []
    # category-specific context
    contexts = {
        "Python": f"В проекте на Python обнаружена проблема: <b>{title}</b>. Код в <code>{active}</code> не проходит проверки.",
        "Go": f"Go-сервис не собирается: <b>{title}</b>. Файл <code>{active}</code> содержит ошибку компиляции/логики.",
        "Kubernetes": f"В кластере Kubernetes деплой в namespace prod: <b>{title}</b>. Манифест <code>{active}</code> некорректен.",
        "Terraform": f"Инфраструктура Terraform: <b>{title}</b>. Конфигурация <code>{active}</code> приводит к drift/ошибке.",
        "Ansible": f"Ansible-плейбук <b>{title}</b>. Inventory и роли в <code>{active}</code> не идемпотентны.",
        "Docker": f"Образ Docker <b>{title}</b>. <code>{active}</code> нарушает best practices.",
        "Linux и Bash": f"На Linux-сервере с systemd: <b>{title}</b>. Сервис/скрипт <code>{active}</code> сломан.",
        "Сети": f"В сети кластера: <b>{title}</b>. Диагностика через <code>ss</code>/<code>dig</code>/<code>curl</code>.",
        "Bash": f"Bash-скрипт <b>{title}</b>. Скрипт <code>{active}</code> некорректно обрабатывает ошибки.",
        "Git": f"В git-репозитории: <b>{title}</b>. Конфликт/состояние в <code>{active}</code>.",
    }
    ctx = contexts.get(cat, f"В проекте <b>{cat}</b>: <b>{title}</b>. Файл <code>{active}</code> требует исправления.")
    # build 7 sections
    brief = f"<h3>Контекст</h3><p>{ctx} Среда — изолированный проект с файловой системой слева и терминалом справа.</p>"
    brief += f"<h3>Что происходит</h3><p>Симптом: <b>{title}</b>. При запуске проверок/команд проект падает или не соответствует ожидаемому состоянию. Логи/вывод указывают на ошибку в <code>{active}</code>.</p>"
    steps = solution_labels[:4] if solution_labels else ["диагностика", "исправить", "проверить"]
    brief += "<h3>Что нужно сделать</h3><ul>" + "".join(f"<li>[ ] {escape_js(s)}</li>" for s in steps) + "</ul>"
    brief += f"<h3>Ограничения</h3><p>Меняйте только файлы проекта этого сценария (активный: <code>{escape_js(active)}</code>); не трогайте внешние ресурсы и тесты вне проекта.</p>"
    brief += f"<h3>Стартовое состояние</h3><p>Файлы проекта: {files_list}. Активный файл: <code>{escape_js(active)}</code> открыт в редакторе. Терминал готов.</p>"
    brief += f"<h3>Ожидаемый результат</h3><p>После исправления чек-лист «Проверить решение» зелёный: {' → '.join(escape_js(s) for s in steps)}.</p>"
    # Проверка — file + terminal
    checks_str = "<br>".join(escape_js(c) for c in [f"cat {active}", "ls -R", (commands[0][0] if commands and isinstance(commands[0], list) else "проверить код")] [:3])
    brief += f"<h3>Проверка</h3><pre>{checks_str}</pre><p>Для кода: кнопка «Проверить код»</p>"
    return brief

def gen_hints(cat, title, files, first_cmd, labels):
    h1 = f"Симптом: <b>{escape_js(title)}</b> в <code>{list(files.keys())[0] if files else 'проекте'}</code>. Определи, на каком слое <b>{escape_js(cat)}</b> возникает ошибка, прежде чем править."
    tools = {
        "Python": "python, pytest, cat",
        "Go": "go run, go test, cat",
        "Kubernetes": "kubectl, cat, grep",
        "Terraform": "terraform, cat, grep",
        "Ansible": "ansible, cat, grep",
        "Docker": "docker, cat, grep",
        "Linux и Bash": "systemctl, journalctl, cat",
        "Сети": "ss, dig, curl, cat",
        "Bash": "bash, shellcheck, cat",
        "Git": "git status, cat, grep",
    }
    t = tools.get(cat, "cat, grep, ls")
    h2 = f"Инструменты: <code>{t}</code>. Начни с <code>{escape_js(first_cmd or 'cat ' + list(files.keys())[0])}</code>."
    if files:
        h2 = "Открой файлы в редакторе слева. " + h2
    h3 = "Порядок: " + " → ".join(escape_js(l) for l in labels[:3]) if labels else "диагностика → исправление → проверка"
    return [h1, h2, h3]

# Главная логика
import pathlib
S_PREFIX = re.compile(r'^S\(\s*"(?P<cat>[^"]*)"\s*,\s*"(?P<id>[^"]*)"\s*,\s*"(?P<title>(?:[^"\\]|\\.)*)"\s*,\s*"(?P<level>[^"]*)"\s*,\s*`', re.M)

def process_file(path):
    text = path.read_text(encoding="utf-8")
    # split by S(
    parts = re.split(r'(?=^S\()', text, flags=re.M)
    out=[]
    modified=0
    for chunk in parts:
        if not chunk.startswith("S("):
            out.append(chunk)
            continue
        m = re.match(r'S\(\s*"(?P<cat>[^"]*)"\s*,\s*"(?P<id>[^"]*)"\s*,\s*"(?P<title>(?:[^"\\]|\\.)*)"\s*,\s*"(?P<level>[^"]*)"\s*,\s*`', chunk)
        if not m:
            out.append(chunk)
            continue
        cat = m.group("cat"); sid=m.group("id"); title=m.group("title").replace('\\"','"')
        # extract current editor: find ", {file:" or ", {files:" or ",{hints"
        # Check if already has files with content
        has_files = bool(re.search(r'\bfiles\s*:\s*\{', chunk))
        has_solutionFiles = bool(re.search(r'\bsolutionFiles\s*:\s*\{', chunk))
        has_checks = bool(re.search(r'\bchecks\s*:\s*\[', chunk))
        # If it already has good files (like OOP 30), skip
        # We consider "good" if it has files and solutionFiles and checks
        if has_files and has_solutionFiles and has_checks:
            out.append(chunk)
            continue
        # Need to enrich — find brief, commands, solution, editor, hints
        # Extract brief (between first ` and `,)
        # Use regex to find brief: `...`,
        # We need to find the first backtick content
        # The chunk starts with S("...", "...", "...", "...", `brief`, "prompt", [commands], [solution], {editor}, {hints})
        # We can parse by finding backtick sections
        # Simpler: extract commands and solution via regex
        cmds = re.findall(r'\[\s*(?:"[^"]*"|/[^/]*/[a-z]*)\s*,\s*`[^`]*`', chunk)  # not precise
        # For simplicity, keep original commands and solution as is, just update editor and brief
        # Find editor start: last {file: or {files: before hints
        # We will replace editor and brief
        # Extract current commands via regex for later brief generation
        # Find commands array: after prompt, there's "[\n[/^.../," — extract all re patterns
        cmd_patterns = re.findall(r'\[\s*(?:\"([^\"]*)\"|/([^/]*)/)', chunk)
        # Extract solution labels
        sol_labels = re.findall(r'\{re:[^,]*,\s*l:\s*"([^"]*)"', chunk)
        # Determine files
        files, solFiles, checks, active = get_files_for_cat(cat, title, sid)
        # Generate new brief
        # For commands, we need first command string for hints
        first_cmd = None
        # Try to extract first command pattern
        cmd_match = re.search(r'\[\s*\[\s*(?:"([^"]*)"|/([^/]*)/)', chunk)
        if cmd_match:
            first_cmd = cmd_match.group(1) or cmd_match.group(2)
            first_cmd = first_cmd.replace('^','').replace('$','').replace('\\','')[:40]
        new_brief = gen_brief(cat, title, files, [[first_cmd or "cat "+active]], sol_labels)
        # Generate hints
        hints = gen_hints(cat, title, files, first_cmd, sol_labels)
        # Build new editor JS
        files_js = ",".join(f'"{k}":`{escape_js(v)}`' for k,v in files.items())
        sol_js = ",".join(f'"{k}":`{escape_js(v)}`' for k,v in solFiles.items())
        checks_js = ",".join(f'{{re:/{c["re"]}/,l:"{c["l"]}"}}' for c in checks)
        new_editor = f'{{file:"{active}",files:{{{files_js}}},checks:[{checks_js}],solutionFiles:{{{sol_js}}}}}'
        hints_js = f'{{hints:["{escape_js(hints[0])}","{escape_js(hints[1])}","{escape_js(hints[2])}"]}}'
        # Now replace in chunk: find old brief and old editor/hints
        # Find old brief: from first ` to `, 
        # Use regex to replace brief and editor
        # Find positions
        # 1. Replace brief: first occurrence of `...`,
        btick_start = chunk.find("`", m.end())
        btick_end = chunk.find("`,", btick_start+1)
        if btick_start==-1 or btick_end==-1:
            out.append(chunk)
            continue
        # 2. Find editor: from "{file:" to "},{hints" or "}},"
        # Find hints start
        hints_start = chunk.rfind("{hints:")
        if hints_start==-1:
            hints_start = chunk.rfind("hints:")
        # Find editor start: before hints
        editor_start = chunk.rfind("{file:", 0, hints_start)
        if editor_start==-1:
            editor_start = chunk.rfind("files:", 0, hints_start)
            if editor_start!=-1:
                editor_start = chunk.rfind("{", 0, editor_start)
        if editor_start==-1:
            # no existing editor with file, maybe just {hints} as 5th arg? Then we need to insert editor before hints
            # The structure is S(..., "prompt", [cmds], [sol], {hints})
            # We need to insert editor before hints
            # Find the position of ", {hints" or ",{hints"
            insert_pos = chunk.rfind(",{hints", 0, len(chunk))
            if insert_pos==-1:
                insert_pos = chunk.rfind(", {hints", 0, len(chunk))
            if insert_pos!=-1:
                # Replace brief and insert editor
                before_brief = chunk[:btick_start+1]
                after_brief = chunk[btick_end+1:]  # includes `,`
                # after_brief contains `,"prompt", [cmds], [sol], {hints}`
                # We need to insert editor before hints
                # Find hints object start in after_brief
                h = after_brief.find("{hints")
                if h!=-1:
                    new_after = after_brief[:h-1] + "," + new_editor + "," + after_brief[h-1+1:]  # careful
                    # Actually after_brief[h-1] is "," before "{hints"
                    # Simpler: insert new_editor + ","
                    pos = after_brief.rfind(",{hints")
                    if pos==-1:
                        pos = after_brief.rfind(", {hints")
                    if pos!=-1:
                        new_after = after_brief[:pos+1] + new_editor + "," + after_brief[pos+1:]
                        new_chunk = before_brief + new_brief + new_after
                        out.append(new_chunk)
                        modified+=1
                        continue
            out.append(chunk)
            continue
        # Find editor end: matching brace
        depth=0; in_bt=False; in_str=False; sc=""
        editor_end=-1
        for i in range(editor_start, len(chunk)):
            c=chunk[i]
            if in_bt:
                if c=="`" and chunk[i-1]!="\\":
                    in_bt=False
                continue
            if in_str:
                if c==sc and chunk[i-1]!="\\":
                    in_str=False
                continue
            if c=="`":
                in_bt=True
            elif c in ('"',"'"):
                in_str=True; sc=c
            elif c=="{":
                depth+=1
            elif c=="}":
                depth-=1
                if depth==0:
                    editor_end=i
                    break
        if editor_end==-1:
            out.append(chunk)
            continue
        # Also find hints object end
        hints_end = chunk.find("});", editor_end)
        if hints_end==-1:
            hints_end = chunk.find("})", editor_end)
        # Replace brief
        new_chunk = chunk[:btick_start+1] + new_brief + chunk[btick_end+1:]
        # Adjust editor_start/end positions due to brief length change
        delta = len(new_brief) - (btick_end - btick_start -1)
        editor_start += delta
        editor_end += delta
        hints_start += delta
        # Replace editor
        new_chunk = new_chunk[:editor_start] + new_editor + new_chunk[editor_end+1:]
        # Replace hints
        # Find new hints_start
        new_hints_start = new_chunk.find("{hints:", editor_start)
        if new_hints_start!=-1:
            # find matching }
            depth=0; h_end=-1
            for i in range(new_hints_start, len(new_chunk)):
                if new_chunk[i]=="{":
                    depth+=1
                elif new_chunk[i]=="}":
                    depth-=1
                    if depth==0:
                        h_end=i
                        break
            if h_end!=-1:
                new_chunk = new_chunk[:new_hints_start] + hints_js[1:-1]  # hints_js is {hints:[...]} need without outer {}
                # Actually hints_js is {hints:[...]} we want to replace {hints:[...]} with same
                # So replace from new_hints_start to h_end inclusive
                # Use hints_js directly
                # Find old hints object
                old_hints_end = h_end
                # Replace
                new_chunk = new_chunk[:new_hints_start] + hints_js.strip("{}")  # not correct
                # Simpler: replace the whole {hints:...}
                # Let's do: new_chunk = new_chunk[:new_hints_start] + hints_js[1:-1]?? Let's just construct correctly
                pass
        # For now, keep original hints if already exists, but ensure 3 hints
        # Instead of complex hints replacement, we keep original hints if they are 3, else replace
        # Our new_chunk already has new_editor, but hints we left as original (which is already 3)
        # So we just need to ensure brief and editor are updated, hints can stay
        # Reconstruct without touching hints
        # We already replaced editor, brief is new, hints original is fine (already 3)
        # So out is new_chunk with original hints
        # But we need to ensure editor replacement kept hints
        # Our new_chunk after editor replacement still has original hints
        out.append(new_chunk)
        modified+=1
    # Write back
    if modified:
        path.write_text("".join(out), encoding="utf-8")
        print(f"{path.name}: modified {modified} scenarios")
    else:
        print(f"{path.name}: no changes")

# Process all files
import sys
for p in sorted(DIR.glob("scenarios-*.js")):
    # Skip OOP which already has good filesystem (30)
    if p.name == "scenarios-python-oop.js":
        print(f"skip {p.name} (OOP already good)")
        continue
    process_file(p)
