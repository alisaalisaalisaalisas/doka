import pathlib, json, re
ROOT=pathlib.Path("C:/Users/User/Desktop/papka/doka")
dump=json.loads((ROOT/"tools/scenarios_dump_regex.json").read_text(encoding="utf-8"))
# Group by src
from collections import defaultdict
grouped=defaultdict(list)
for s in dump:
    grouped[s['_src']].append(s)

def esc(s):
    if s is None: return ""
    return s.replace("\\","\\\\").replace('"','\\"').replace("\n","\\n").replace("`","\\`").replace("${","\\${").replace("\r","")

def gen_files(cat, title, sid):
    tl=title.lower(); cl=cat.lower()
    if cat=="Python" or "python" in cl:
        if "argparse" in tl:
            init='import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--input", required=False)  # BUG\n'
            fixed='import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--input", required=True)\n'
            checks=[{"re": r"required\s*=\s*True", "l": "required=True"}]
            return {"app.py": init}, {"app.py": fixed}, checks, "app.py"
        else:
            init=f'# {title}\n# broken\n'
            fixed=f'# {title} — fixed\n# ok\n'
            checks=[{"re": r"ok", "l": "fixed"}]
            return {"main.py": init, "tests/test_main.py": "def test_ok():\n    assert True\n"}, {"main.py": fixed, "tests/test_main.py": "def test_ok():\n    assert True\n"}, checks, "main.py"
    elif cat=="Go" or cl=="go":
        init='package main\nimport "fmt"\nfunc main(){fmt.Println("broken")}\n'
        fixed='package main\nimport "fmt"\nfunc main(){fmt.Println("ok")}\n'
        checks=[{"re": r"ok", "l": "fixed"}]
        return {"main.go": init, "go.mod": "module app\ngo 1.23\n"}, {"main.go": fixed, "go.mod": "module app\ngo 1.23\n"}, checks, "main.go"
    elif "kubernetes" in cl or cat=="Kubernetes" or "k8s" in cl:
        init='apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 1\n'
        fixed='apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  replicas: 3\n'
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
    elif "sre" in cl or "dr" in cl or "sre dr" in cl.lower():
        init='# SRE DR broken\nstatus: broken\n'
        fixed='# SRE DR fixed\nstatus: ok\n'
        checks=[{"re": r"ok", "l": "ok"}]
        return {"sre/config.yaml": init}, {"sre/config.yaml": fixed}, checks, "sre/config.yaml"
    else:
        safe=re.sub(r'[^a-z0-9]+','-', title.lower())[:15]
        init=f'# {cat}: {title}\nstatus: broken\n'
        fixed=f'# {cat}: {title} — fixed\nstatus: ok\n'
        checks=[{"re": r"ok", "l": "ok"}]
        return {f"project/{safe}.yaml": init}, {f"project/{safe}.yaml": fixed}, checks, f"project/{safe}.yaml"

def gen_brief(cat, title, files, first_cmd, labels):
    active=list(files.keys())[0]
    files_list=", ".join(f"<code>{f}</code>" for f in list(files.keys())[:3])
    brief=f"<h3>Контекст</h3><p>{cat}: <b>{esc(title)}</b>. Работа с <code>{esc(active)}</code>.</p>"
    brief+=f"<h3>Что происходит</h3><p>Симптом: <b>{esc(title)}</b>. Файл <code>{esc(active)}</code> содержит ошибку.</p>"
    steps=labels[:3] if labels else ["диагностика","исправить"]
    brief+="<h3>Что нужно сделать</h3><ul>"+"".join(f"<li>[ ] {esc(s)}</li>" for s in steps)+"</ul>"
    brief+=f"<h3>Ограничения</h3><p>Меняйте только <code>{esc(active)}</code>.</p>"
    brief+=f"<h3>Стартовое состояние</h3><p>Файлы: {files_list}. Активный: <code>{esc(active)}</code>.</p>"
    brief+=f"<h3>Ожидаемый результат</h3><p>Чек-лист зелёный.</p>"
    brief+=f"<h3>Проверка</h3><pre>cat {esc(active)}</pre>"
    return brief

def gen_hints(cat, title, files, first_cmd, labels):
    active=list(files.keys())[0]
    h1=f"Симптом: {title} в {active}. Ищи причину в этом файле."
    h2=f"Открой {active} в редакторе. Начни с cat {active}."
    h3=" → ".join(labels[:3]) if labels else "диагностика → исправление"
    return [h1,h2,h3]

# For each of the three, regenerate
for src in ["scenarios-global-dr-sre.js", "scenarios-global-python.js", "scenarios-global-terraform.js"]:
    scenarios=[s for s in dump if s['_src']==src]
    print(f"Regenerating {src} with {len(scenarios)}")
    out_lines=[]
    out_lines.append(f"/* Global Playground: {src} — enriched with filesystem */\n")
    for s in scenarios:
        cat=s['cat']; sid=s['id']; title=s['title']; level=s['level']; prompt=s['prompt'] or "ubuntu@lab:~$"
        commands=s['commands'] or []
        solution=s['solution'] or []
        labels=[x.get('l') or x.get('label') or "" for x in solution]
        first_cmd=None
        if commands:
            first=commands[0]
            if isinstance(first, list):
                first_cmd=str(first[0])[:30]
            elif isinstance(first, dict):
                first_cmd=str(first.get('re',''))[:30]
        files, solFiles, checks, active = gen_files(cat, title, sid)
        brief=gen_brief(cat, title, files, first_cmd, labels)
        hints=gen_hints(cat, title, files, first_cmd, labels)
        # Serialize commands and solution
        def ser_cmds(cmds):
            parts=[]
            for c in cmds:
                if isinstance(c, list):
                    re_pat=c[0]; out=c[1] if len(c)>1 else ""; cls=c[2] if len(c)>2 else "dim"
                    # re_pat is string like "^python..." 
                    parts.append(f'["{esc(str(re_pat))}",`{esc(out)}`,"{cls}"]')
                elif isinstance(c, dict):
                    re_pat=c.get('re'); l=c.get('l') or ""
                    if isinstance(re_pat, str) and re_pat.startswith("/") and re_pat.endswith("/"):
                        parts.append(f'{{re:{re_pat},l:"{esc(l)}"}}')
                    else:
                        parts.append(f'{{re:"{esc(str(re_pat))}",l:"{esc(l)}"}}')
                else:
                    parts.append("[]")
            return "[" + ",".join(parts) + "]"
        def ser_sol(sol):
            parts=[]
            for c in sol:
                re_pat=c.get('re'); l=c.get('l') or ""
                if isinstance(re_pat, str) and re_pat.startswith("/") and re_pat.endswith("/"):
                    parts.append(f'{{re:{re_pat},l:"{esc(l)}"}}')
                else:
                    parts.append(f'{{re:"{esc(str(re_pat))}",l:"{esc(l)}"}}')
            return "[" + ",".join(parts) + "]"
        cmds_str=ser_cmds(commands)
        sol_str=ser_sol(solution)
        files_js=",".join(f'"{k}":`{esc(v)}`' for k,v in files.items())
        sol_js=",".join(f'"{k}":`{esc(v)}`' for k,v in solFiles.items())
        checks_js=",".join(f'{{re:/{esc(c["re"])}/,l:"{esc(c["l"])}"}}' for c in checks)
        hints_js=",".join(f'"{esc(h)}"' for h in hints)
        s_call=f'S("{esc(cat)}","{esc(sid)}","{esc(title)}","{esc(level)}",`{brief}`,"{esc(prompt)}",{cmds_str},{sol_str},{{file:"{esc(active)}",files:{{{files_js}}},checks:[{checks_js}],solutionFiles:{{{sol_js}}}}} ,{{hints:[{hints_js}]}});\n'
        out_lines.append(s_call)
    path=pathlib.Path("docs/21-playground")/src
    path.write_text("".join(out_lines), encoding="utf-8")
    print(f"Wrote {src}")

print("done")
