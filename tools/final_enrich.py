import pathlib, re, json
ROOT=pathlib.Path("C:/Users/User/Desktop/papka/doka")
DIR=ROOT/"docs/21-playground"

def esc(s):
    if s is None: return ""
    return s.replace("\\","\\\\").replace('"','\\"').replace("\n","\\n").replace("`","\\`").replace("${","\\${").replace("\r","")

def gen_files(cat, title, sid):
    tl=title.lower(); cl=cat.lower()
    # Python
    if cat=="Python" or "python" in cl:
        if "argparse" in tl:
            init='import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--input", required=False)  # BUG\nargs = parser.parse_args()\n'
            fixed='import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--input", required=True)\nargs = parser.parse_args()\n'
            checks=[{"re": r"required\s*=\s*True", "l": "required=True"}]
            return {"app.py": init}, {"app.py": fixed}, checks, "app.py"
        elif "pathlib" in tl:
            init='from pathlib import Path\np = Path("/data")\nfull = str(p) + "/file.txt"\n'
            fixed='from pathlib import Path\np = Path("/data")\nfull = p / "file.txt"\n'
            checks=[{"re": r"Path\(.*\)\s*/", "l": "Path /"}]
            return {"main.py": init}, {"main.py": fixed}, checks, "main.py"
        elif "subprocess" in tl:
            init='import subprocess\nsubprocess.run(f"ls {x}", shell=True)\n'
            fixed='import subprocess\nsubprocess.run(["ls", x], shell=False)\n'
            checks=[{"re": r"shell\s*=\s*False", "l": "shell=False"}]
            return {"app.py": init}, {"app.py": fixed}, checks, "app.py"
        elif "socket" in tl:
            init='import socket\ns=socket.socket()\ns.bind(("127.0.0.1",8080))\n'
            fixed='import socket\ns=socket.socket()\ns.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\ns.bind(("127.0.0.1",8080))\n'
            checks=[{"re": r"SO_REUSEADDR", "l": "SO_REUSEADDR"}]
            return {"server.py": init}, {"server.py": fixed}, checks, "server.py"
        else:
            init=f'# {title}\n# broken - needs fix\nprint("broken")\n'
            fixed=f'# {title} — fixed\nprint("ok")\n'
            checks=[{"re": r"ok", "l": "fixed"}]
            # For Python, provide a small project structure
            return {"main.py": init, "tests/test_main.py": "def test_ok():\n    assert True\n", "requirements.txt": "pytest\n"}, {"main.py": fixed, "tests/test_main.py": "def test_ok():\n    assert True\n", "requirements.txt": "pytest\n"}, checks, "main.py"
    elif cat=="Go" or cl=="go":
        init='package main\nimport "fmt"\nfunc main(){fmt.Println("broken")}\n'
        fixed='package main\nimport "fmt"\nfunc main(){fmt.Println("ok")}\n'
        checks=[{"re": r"ok", "l": "fixed"}]
        return {"main.go": init, "go.mod": "module app\ngo 1.23\n", "main_test.go": 'package main\nimport "testing"\nfunc TestOk(t *testing.T){}\n'}, {"main.go": fixed, "go.mod": "module app\ngo 1.23\n", "main_test.go": 'package main\nimport "testing"\nfunc TestOk(t *testing.T){}\n'}, checks, "main.go"
    elif "kubernetes" in cl or cat=="Kubernetes" or "k8s" in cl:
        init='apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n'
        fixed='apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25\n'
        checks=[{"re": r"replicas:\s*3", "l": "replicas=3"}]
        return {"k8s/deployment.yaml": init, "k8s/service.yaml": "apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n"}, {"k8s/deployment.yaml": fixed, "k8s/service.yaml": "apiVersion: v1\nkind: Service\nmetadata:\n  name: app\n"}, checks, "k8s/deployment.yaml"
    elif "terraform" in cl:
        init='resource "null_resource" "x" { triggers = { v="broken" } }\n'
        fixed='resource "null_resource" "x" { triggers = { v="ok" } }\n'
        checks=[{"re": r"ok", "l": "fixed"}]
        return {"terraform/main.tf": init, "terraform/variables.tf": 'variable "env" {}\n'}, {"terraform/main.tf": fixed, "terraform/variables.tf": 'variable "env" {}\n'}, checks, "terraform/main.tf"
    elif "ansible" in cl:
        init='- hosts: web\n  tasks:\n    - command: echo broken\n'
        fixed='- hosts: web\n  tasks:\n    - ansible.builtin.command:\n        cmd: echo fixed\n'
        checks=[{"re": r"ansible\.builtin", "l": "ansible module"}]
        return {"ansible/site.yml": init, "ansible/inventory.ini": "[web]\nweb1\n"}, {"ansible/site.yml": fixed, "ansible/inventory.ini": "[web]\nweb1\n"}, checks, "ansible/site.yml"
    elif "docker" in cl:
        init='FROM python:3.11\nCOPY . .\nCMD ["python","app.py"]\n'
        fixed='FROM python:3.11 AS base\nCOPY . .\nFROM gcr.io/distroless/python3-debian12\nCOPY --from=base /app /app\nCMD ["python","app.py"]\n'
        checks=[{"re": r"distroless", "l": "distroless"}]
        return {"Dockerfile": init, "app.py": 'print("hi")\n'}, {"Dockerfile": fixed, "app.py": 'print("hi")\n'}, checks, "Dockerfile"
    elif "linux" in cl or "systemd" in tl:
        init='[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n'
        fixed='[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n'
        checks=[{"re": r"Restart", "l": "Restart"}]
        return {"systemd/demo.service": init, "app/main.py": 'print("hi")\n'}, {"systemd/demo.service": fixed, "app/main.py": 'print("hi")\n'}, checks, "systemd/demo.service"
    elif "сети" in cat or "network" in cl:
        init='# broken network\n'
        fixed='# fixed network\n'
        checks=[{"re": r"fixed", "l": "fixed"}]
        return {"network/config.yaml": init}, {"network/config.yaml": fixed}, checks, "network/config.yaml"
    elif cat=="Bash" or "bash" in cl:
        init='#!/bin/bash\nset +e\necho broken\n'
        fixed='#!/bin/bash\nset -e\necho fixed\n'
        checks=[{"re": r"set\s+-e", "l": "set -e"}]
        return {"script.sh": init}, {"script.sh": fixed}, checks, "script.sh"
    elif cat=="Git" or "git" in cl:
        init='<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n'
        fixed='v2\n'
        checks=[{"re": r"v2", "l": "resolved"}]
        return {"repo/file.txt": init}, {"repo/file.txt": fixed}, checks, "repo/file.txt"
    else:
        # generic
        safe=re.sub(r'[^a-z0-9]+','-', title.lower())[:15]
        init=f'# {cat}: {title}\nstatus: broken\n'
        fixed=f'# {cat}: {title} — fixed\nstatus: ok\n'
        checks=[{"re": r"ok", "l": "ok"}]
        if "helm" in cl:
            return {"helm/Chart.yaml": init, "helm/values.yaml": "replicas: 1\n"}, {"helm/Chart.yaml": fixed, "helm/values.yaml": "replicas: 3\n"}, checks, "helm/values.yaml"
        elif "prometheus" in cl or "grafana" in cl:
            return {"monitoring/prometheus.yml": init}, {"monitoring/prometheus.yml": fixed}, checks, "monitoring/prometheus.yml"
        elif "aws" in cl or "gcp" in cl or "azure" in cl:
            return {"cloud/main.tf": init}, {"cloud/main.tf": fixed}, checks, "cloud/main.tf"
        elif "postgres" in cl:
            return {"postgres/fix.sql": init}, {"postgres/fix.sql": fixed}, checks, "postgres/fix.sql"
        elif "kafka" in cl:
            return {"kafka/config.yaml": init}, {"kafka/config.yaml": fixed}, checks, "kafka/config.yaml"
        elif "redis" in cl:
            return {"redis/redis.conf": init}, {"redis/redis.conf": fixed}, checks, "redis/redis.conf"
        else:
            return {f"project/{safe}.yaml": init}, {f"project/{safe}.yaml": fixed}, checks, f"project/{safe}.yaml"

def gen_brief(cat, title, files, first_cmd, labels):
    active=list(files.keys())[0]
    files_list=", ".join(f"<code>{f}</code>" for f in list(files.keys())[:4])
    brief=f"<h3>Контекст</h3><p>{cat}: <b>{esc(title)}</b>. Работа с <code>{esc(active)}</code> в проекте.</p>"
    brief+=f"<h3>Что происходит</h3><p>Симптом: <b>{esc(title)}</b>. Файл <code>{esc(active)}</code> содержит ошибку, проверки падают.</p>"
    steps=labels[:3] if labels else ["диагностика","исправить","проверить"]
    brief+="<h3>Что нужно сделать</h3><ul>"+"".join(f"<li>[ ] {esc(s)}</li>" for s in steps)+"</ul>"
    brief+=f"<h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>{esc(active)}</code>).</p>"
    brief+=f"<h3>Стартовое состояние</h3><p>Файлы: {files_list}. Активный файл открыт в редакторе. Начните с <code>{esc(first_cmd or 'cat '+active)}</code>.</p>"
    brief+=f"<h3>Ожидаемый результат</h3><p>Чек-лист зелёный: {' → '.join(esc(s) for s in steps)}.</p>"
    brief+=f"<h3>Проверка</h3><pre>cat {esc(active)}<br>проверить код</pre>"
    return brief

def gen_hints(cat, title, files, first_cmd, labels):
    active=list(files.keys())[0]
    h1=f"Симптом: {title} в {active}. Ищи причину в коде/конфиге этого файла."
    h2=f"Открой {active} в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat {active}."
    h3="Порядок: " + " → ".join(labels[:3]) if labels else "диагностика → исправление → проверка"
    return [h1,h2,h3]

# Process each file
for src_path in sorted(DIR.glob("scenarios-*.js")):
    if src_path.name=="scenarios-python-oop.js":
        print(f"skip {src_path.name}")
        continue
    text=src_path.read_text(encoding="utf-8")
    # Split into chunks
    parts=re.split(r'(?=^S\()', text, flags=re.M)
    out=[]
    modified=0
    for chunk in parts:
        if not chunk.startswith("S("):
            out.append(chunk)
            continue
        # Parse cat, id, title, level via regex
        m=re.match(r'S\(\s*"(?P<cat>[^"]*)"\s*,\s*"(?P<id>[^"]*)"\s*,\s*"(?P<title>(?:[^"\\]|\\.)*)"\s*,\s*"(?P<level>[^"]*)"', chunk)
        if not m:
            out.append(chunk)
            continue
        cat=m.group("cat"); sid=m.group("id"); title=m.group("title").replace('\\"','"'); level=m.group("level")
        # Check if has files
        has_files = bool(re.search(r'\bfiles\s*:\s*\{', chunk))
        has_solFiles = bool(re.search(r'\bsolutionFiles\s*:\s*\{', chunk))
        has_checks = bool(re.search(r'\bchecks\s*:\s*\[', chunk))
        if has_files and has_solFiles and has_checks:
            out.append(chunk)
            continue
        # Need to enrich — extract prompt, commands, solution, hints
        # Find prompt: after brief `..., "prompt",
        # Find brief end: first `...`,
        # Use simple: find first ` and matching `,
        # Instead, use data from dump for this sid
        # For now, generate files using title
        files, solFiles, checks, active = gen_files(cat, title, sid)
        # Extract labels from solution: find {re:...,l:"..."}
        labels=re.findall(r'l\s*:\s*"([^"]*)"', chunk)
        if not labels:
            labels=["диагностика","исправить","проверить"]
        # Extract first command pattern for brief
        first_cmd_match=re.search(r'\[\s*(?:\"([^\"]*)\"|/([^/]*)/)', chunk)
        first_cmd=None
        if first_cmd_match:
            first_cmd=first_cmd_match.group(1) or first_cmd_match.group(2)
            if first_cmd:
                first_cmd=first_cmd.replace("^","").replace("$","")[:30]
        # Generate new brief and hints
        new_brief=gen_brief(cat, title, files, first_cmd, labels)
        new_hints=gen_hints(cat, title, files, first_cmd, labels)
        # Find brief: between first ` and `,
        # Use regex to replace brief
        # Find the first backtick content
        bt1=chunk.find("`", m.end())
        bt2=chunk.find("`,", bt1+1)
        if bt1==-1 or bt2==-1:
            out.append(chunk)
            continue
        # Replace brief
        before=chunk[:bt1+1]
        after=chunk[bt2:]
        # after starts with `, -> we need to replace content between
        new_chunk=before + new_brief + after
        # Now replace editor: find old editor (from {file: to before hints)
        # Find hints start
        hints_pos=new_chunk.rfind("{hints:")
        if hints_pos==-1:
            hints_pos=new_chunk.rfind("hints:")
        # Find editor start
        editor_start=new_chunk.rfind("{file:", 0, hints_pos if hints_pos!=-1 else len(new_chunk))
        if editor_start==-1:
            editor_start=new_chunk.rfind("files:", 0, hints_pos if hints_pos!=-1 else len(new_chunk))
            if editor_start!=-1:
                editor_start=new_chunk.rfind("{", 0, editor_start)
        if editor_start!=-1 and hints_pos!=-1:
            # Find editor end (matching })
            depth=0; in_bt=False; in_str=False; sc=""
            editor_end=-1
            for i in range(editor_start, len(new_chunk)):
                c=new_chunk[i]
                if in_bt:
                    if c=="`" and new_chunk[i-1]!="\\":
                        in_bt=False
                    continue
                if in_str:
                    if c==sc and new_chunk[i-1]!="\\":
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
            if editor_end!=-1:
                # Build new editor
                files_js=",".join(f'"{k}":`{esc(v)}`' for k,v in files.items())
                sol_js=",".join(f'"{k}":`{esc(v)}`' for k,v in solFiles.items())
                checks_js=",".join(f'{{re:/{esc(c["re"])}/,l:"{esc(c["l"])}"}}' for c in checks)
                new_editor=f'{{file:"{esc(active)}",files:{{{files_js}}},checks:[{checks_js}],solutionFiles:{{{sol_js}}}}}'
                new_chunk=new_chunk[:editor_start] + new_editor + new_chunk[editor_end+1:]
                # Update hints_pos
                hints_pos=new_chunk.find("{hints:")
                if hints_pos!=-1:
                    # find hints end
                    depth=0; h_end=-1
                    for i in range(hints_pos, len(new_chunk)):
                        if new_chunk[i]=="{":
                            depth+=1
                        elif new_chunk[i]=="}":
                            depth-=1
                            if depth==0:
                                h_end=i
                                break
                    if h_end!=-1:
                        hints_js=",".join(f'"{esc(h)}"' for h in new_hints)
                        new_hints_js=f'{{hints:[{hints_js}]}}'
                        new_chunk=new_chunk[:hints_pos] + new_hints_js + new_chunk[h_end+1:]
        elif editor_start==-1 and hints_pos!=-1:
            # No editor, insert before hints
            insert_pos=new_chunk.rfind(",{hints", 0, hints_pos+10)
            if insert_pos==-1:
                insert_pos=new_chunk.rfind(", {hints", 0, hints_pos+10)
            if insert_pos!=-1:
                files_js=",".join(f'"{k}":`{esc(v)}`' for k,v in files.items())
                sol_js=",".join(f'"{k}":`{esc(v)}`' for k,v in solFiles.items())
                checks_js=",".join(f'{{re:/{esc(c["re"])}/,l:"{esc(c["l"])}"}}' for c in checks)
                new_editor=f'{{file:"{esc(active)}",files:{{{files_js}}},checks:[{checks_js}],solutionFiles:{{{sol_js}}}}}'
                new_chunk=new_chunk[:insert_pos+1] + new_editor + "," + new_chunk[insert_pos+1:]
                # replace hints as well
                hp=new_chunk.find("{hints:")
                if hp!=-1:
                    depth=0; he=-1
                    for i in range(hp, len(new_chunk)):
                        if new_chunk[i]=="{":
                            depth+=1
                        elif new_chunk[i]=="}":
                            depth-=1
                            if depth==0:
                                he=i
                                break
                    if he!=-1:
                        hints_js=",".join(f'"{esc(h)}"' for h in new_hints)
                        new_hints_js=f'{{hints:[{hints_js}]}}'
                        new_chunk=new_chunk[:hp] + new_hints_js + new_chunk[he+1:]
        out.append(new_chunk)
        modified+=1
    if modified:
        src_path.write_text("".join(out), encoding="utf-8")
        print(f"{src_path.name}: enriched {modified}")
    else:
        print(f"{src_path.name}: no changes")
