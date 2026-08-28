#!/usr/bin/env python3
import pathlib, re, json, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
DIR = ROOT / "docs" / "21-playground"

# Load all scenarios with source tracking
import subprocess, os
# Use Node to dump scenarios as JSON
node_script = ROOT / "tools" / "dump_scenarios.js"
node_script.write_text(r'''
const fs=require('fs'),path=require('path');
const DIR='docs/21-playground';
const html=fs.readFileSync(path.join(DIR,'playground.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(s=>s.startsWith('scenarios-'));
global.window={SCENARIOS:[]};
const vm=require('vm');
let srcMap={};
for(const src of scripts){
  const before=window.SCENARIOS.length;
  const code=fs.readFileSync(path.join(DIR,src),'utf8');
  const ctx=vm.createContext({S:(...args)=>{
    const [cat,id,title,level,brief,prompt,commands,solution,editor,extra]=args;
    const o={cat,id,title,level,brief,prompt,commands,solution,editor,extra,_src:src};
    if(editor){
      o.files=editor.files||null;
      o.file=editor.file||editor.activeFile||null;
      o.start=editor.start||editor.initialContent||null;
      o.checks=editor.checks||null;
      o.hints=editor.hints||null;
      o.solutionFiles=editor.solutionFiles||null;
      o.solutionDetail=editor.solution||null;
    }
    if(extra){
      if(extra.hints) o.hints=extra.hints;
      if(extra.solutionFiles) o.solutionFiles=extra.solutionFiles;
    }
    window.SCENARIOS.push(o);
  }, window});
  vm.runInContext(code, ctx, {filename:src});
  srcMap[src]=window.SCENARIOS.slice(before).map(s=>s.id);
}
fs.writeFileSync('tools/scenarios_dump.json', JSON.stringify({scenarios: window.SCENARIOS, srcMap}, null,2));
console.log('dumped', window.SCENARIOS.length);
''', encoding='utf-8')
os.system('node tools/dump_scenarios.js')

import json
data=json.loads((ROOT/'tools/scenarios_dump.json').read_text(encoding='utf-8'))
scenarios=data['scenarios']
srcMap=data['srcMap']
print(f"Loaded {len(scenarios)} scenarios")

# Build lookup by id
by_id={s['id']: s for s in scenarios}

# Group by src
from collections import defaultdict
grouped=defaultdict(list)
for s in scenarios:
    grouped[s['_src']].append(s)

# Define file generation (reuse from previous)
def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("`", "\\`").replace("${", "\\${").replace("\r","")

def gen_files(cat, title, sid):
    # same as before, but simplified
    cl=cat.lower(); tl=title.lower()
    if cat=="Python" or "python" in cl:
        if "argparse" in tl:
            init='''import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--input", required=False)  # BUG
args = parser.parse_args()
'''
            fixed='''import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--input", required=True)
args = parser.parse_args()
'''
            checks=[{"re": r"required\s*=\s*True", "l": "required=True"}]
            return {"app.py": init}, {"app.py": fixed}, checks, "app.py"
        elif "pathlib" in tl:
            init='from pathlib import Path\np = Path("/data")\nfull = str(p) + "/file.txt"\n'
            fixed='from pathlib import Path\np = Path("/data")\nfull = p / "file.txt"\n'
            checks=[{"re": r"/|joinpath", "l": "Path /"}]
            return {"main.py": init}, {"main.py": fixed}, checks, "main.py"
        elif "subprocess" in tl and "shell" in tl:
            init='import subprocess\nsubprocess.run(f"ls {x}", shell=True)\n'
            fixed='import subprocess\nsubprocess.run(["ls", x], shell=False)\n'
            checks=[{"re": r"shell\s*=\s*False", "l": "shell=False"}]
            return {"app.py": init}, {"app.py": fixed}, checks, "app.py"
        else:
            init=f'# {title}\n# broken\nstatus="broken"\n'
            fixed=f'# {title} — fixed\nstatus="ok"\n'
            checks=[{"re": r"ok", "l": "fixed"}]
            return {"main.py": init, "requirements.txt": "pytest\n", "tests/test_main.py": 'def test_ok():\n    assert True\n'}, {"main.py": fixed, "requirements.txt": "pytest\n", "tests/test_main.py": 'def test_ok():\n    assert True\n'}, checks, "main.py"
    elif cat=="Go" or cl=="go":
        init='package main\nimport "fmt"\nfunc main(){fmt.Println("broken")}\n'
        fixed='package main\nimport "fmt"\nfunc main(){fmt.Println("ok")}\n'
        checks=[{"re": r"ok", "l": "fixed"}]
        return {"main.go": init, "go.mod": "module app\ngo 1.23\n"}, {"main.go": fixed, "go.mod": "module app\ngo 1.23\n"}, checks, "main.go"
    elif "kubernetes" in cl or cat=="Kubernetes" or "k8s" in cl:
        init='''apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: web
        image: nginx:1.25
'''
        fixed='''apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: web
        image: nginx:1.25
'''
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
        init='# broken network\nstatus: broken\n'
        fixed='# fixed network\nstatus: ok\n'
        checks=[{"re": r"ok", "l": "ok"}]
        return {"network/config.yaml": init}, {"network/config.yaml": fixed}, checks, "network/config.yaml"
    elif cat=="Bash" or "bash" in cl:
        init='#!/bin/bash\nset +e\necho broken\n'
        fixed='#!/bin/bash\nset -e\necho fixed\n'
        checks=[{"re": r"set\s+-e", "l": "set -e"}]
        return {"script.sh": init}, {"script.sh": fixed}, checks, "script.sh"
    elif cat=="Git" or "git" in cl:
        init='<<<<<<< HEAD\nversion=1\n=======\nversion=2\n>>>>>>> feature\n'
        fixed='version=2\n'
        checks=[{"re": r"version", "l": "resolved"}]
        return {"repo/file.txt": init}, {"repo/file.txt": fixed}, checks, "repo/file.txt"
    else:
        # generic
        safe=re.sub(r'[^a-z0-9]+','-', title.lower())[:15]
        init=f'# {cat}: {title}\nstatus: broken\n'
        fixed=f'# {cat}: {title} — fixed\nstatus: ok\n'
        checks=[{"re": r"ok", "l": "ok"}]
        # choose path based on cat
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
    # category-specific
    ctx_map={
        "Python": f"Python-проект: <b>{title}</b>. Код в <code>{active}</code> не проходит тесты.",
        "Go": f"Go-модуль: <b>{title}</b>. <code>{active}</code> содержит ошибку.",
        "Kubernetes": f"Kubernetes-кластер prod: <b>{title}</b>. Манифест <code>{active}</code> некорректен.",
        "Terraform": f"Terraform: <b>{title}</b>. Конфигурация <code>{active}</code> вызывает drift.",
        "Ansible": f"Ansible: <b>{title}</b>. Плейбук <code>{active}</code> не идемпотентен.",
        "Docker": f"Docker: <b>{title}</b>. <code>{active}</code> нарушает best practices.",
        "Linux и Bash": f"Linux systemd: <b>{title}</b>. <code>{active}</code> сломан.",
        "Сети": f"Сеть: <b>{title}</b>. Диагностика <code>{active}</code>.",
        "Bash": f"Bash: <b>{title}</b>. Скрипт <code>{active}</code> падает.",
        "Git": f"Git: <b>{title}</b>. Конфликт в <code>{active}</code>.",
    }
    ctx=ctx_map.get(cat, f"{cat}: <b>{title}</b>. Файл <code>{active}</code> требует исправления.")
    brief=f"<h3>Контекст</h3><p>{ctx} Проект — файловая система слева, редактор в центре, терминал справа.</p>"
    brief+=f"<h3>Что происходит</h3><p>Симптом: <b>{title}</b>. При проверке <code>{active}</code> проект падает. Логи указывают на ошибку в этом файле.</p>"
    steps=labels[:4] if labels else ["диагностика","исправить","проверить"]
    brief+="<h3>Что нужно сделать</h3><ul>"+"".join(f"<li>[ ] {esc(s)}</li>" for s in steps)+"</ul>"
    brief+=f"<h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>{esc(active)}</code>); внешние ресурсы не трогайте.</p>"
    brief+=f"<h3>Стартовое состояние</h3><p>Файлы: {files_list}. Активный файл открыт в редакторе. Терминал готов. Начните с: <code>{esc(first_cmd or 'cat '+active)}</code>.</p>"
    brief+=f"<h3>Ожидаемый результат</h3><p>Чек-лист зелёный: {' → '.join(esc(s) for s in steps)}.</p>"
    brief+=f"<h3>Проверка</h3><pre>{esc(first_cmd or 'cat '+active)}<br>проверить код</pre><p>Кнопка «Проверить код»</p>"
    return brief

def gen_hints(cat, title, files, first_cmd, labels):
    active=list(files.keys())[0]
    h1=f"Симптом: {title} в {active}. Определи слой {cat} и причину."
    h2=f"Инструменты: cat, ls, grep. Начни с cat {active} и {first_cmd or 'проверки'}."
    h3=" → ".join(labels[:3]) if labels else "диагностика → исправление → проверка"
    return [h1,h2,h3]

# Process each src file
for src, ids in srcMap.items():
    if src=="scenarios-python-oop.js":
        print(f"skip {src} (OOP keep)")
        continue
    path=DIR / src
    text=path.read_text(encoding='utf-8')
    # For each id in this file, we will regenerate that S call if it lacks files
    # Instead of patching, we regenerate the whole file from scenarios data
    new_parts=[]
    # Keep header comment (first line)
    header=text.split("S(")[0]
    new_parts.append(header)
    for sid in ids:
        s=by_id[sid]
        cat=s['cat']; title=s['title']; level=s['level']; prompt=s['prompt']
        commands=s['commands'] or []
        solution=s['solution'] or []
        editor=s['editor'] or {}
        # Check if has files
        has_files= bool(s.get('files') and len(s['files'])>0) or bool(s.get('file') and s.get('start'))
        has_solFiles= bool(s.get('solutionFiles') and len(s['solutionFiles'])>0)
        has_checks= bool(s.get('checks') and len(s['checks'])>0)
        # Extract labels for brief
        labels=[x.get('l') or x.get('label') or "" for x in solution]
        first_cmd=None
        if commands:
            first=commands[0]
            if isinstance(first, list):
                pat=first[0]
                if isinstance(pat, str):
                    first_cmd=pat.replace("^","").replace("$","").replace("\\","")[:40]
                else:
                    first_cmd=str(pat)[:40]
            elif isinstance(first, dict):
                pat=first.get('re')
                if pat:
                    first_cmd=str(pat)[:40]
        # If missing files, generate
        if not has_files or not has_solFiles or not has_checks:
            files, solFiles, checks, active = gen_files(cat, title, sid)
            # Use generated files if missing, else keep original
            if not has_files:
                # use generated
                pass
            else:
                # keep original files but ensure checks/solFiles
                if has_files and s.get('files'):
                    files=s['files']
                    active=s.get('file') or list(files.keys())[0]
                elif s.get('file') and s.get('start'):
                    files={s['file']: s['start']}
                    active=s['file']
                if has_solFiles:
                    solFiles=s['solutionFiles']
                if has_checks:
                    checks=s['checks']
            # Generate new brief and hints if needed
            # Keep original brief if it already has 7 sections and is not generic?
            # We will replace with new detailed brief for terminal tasks that had generic brief
            # Check if brief is generic (contains "Требуется диагностика Python")
            is_generic = "Требуется диагностика" in (s.get('brief') or "")
            if is_generic or not has_files:
                new_brief=gen_brief(cat, title, files, first_cmd, labels)
            else:
                new_brief=s.get('brief') or gen_brief(cat, title, files, first_cmd, labels)
            # Hints: keep if 3 and not generic, else regenerate
            hints=s.get('hints') or []
            if len(hints)!=3 or any("Требуется диагностика" in h for h in hints):
                hints=gen_hints(cat, title, files, first_cmd, labels)
            # Build editor
            files_js=",".join(f'"{k}":`{esc(v)}`' for k,v in files.items())
            sol_js=",".join(f'"{k}":`{esc(v)}`' for k,v in solFiles.items())
            checks_js=",".join(f'{{re:/{esc(c["re"]) if isinstance(c["re"], str) else c["re"].pattern if hasattr(c["re"], "pattern") else str(c["re"])}/,l:"{esc(c["l"])}"}}' for c in checks)
            # Need to handle re being string or RegExp object from dump (it will be string)
            # In dump, re is string, so we need to handle
            # Rebuild checks_js correctly
            checks_parts=[]
            for c in checks:
                pat=c.get('re')
                if isinstance(pat, str):
                    pat_str=pat
                    # if it already includes regex delimiters, keep
                    if pat_str.startswith('/') and pat_str.endswith('/'):
                        pat_str=pat_str[1:-1]
                    checks_parts.append(f'{{re:/{esc(pat_str)}/,l:"{esc(c.get("l",""))}"}}')
                else:
                    checks_parts.append(f'{{re:/{esc(str(pat))}/,l:"{esc(c.get("l",""))}"}}')
            checks_js=",".join(checks_parts)
            new_editor=f'{{file:"{esc(active)}",files:{{{files_js}}},checks:[{checks_js}],solutionFiles:{{{sol_js}}}}}'
            hints_js=",".join(f'"{esc(h)}"' for h in hints)
            hints_obj=f'{{hints:[{hints_js}]}}'
            # Build commands and solution JS
            # Keep original commands and solution as JS literals: we need to reconstruct from original file
            # Instead, we will keep original JS snippet for commands/solution by extracting from original text
            # Find the S call in original text for this sid and extract commands/solution part
            # Simpler: use the original commands/solution from dump, but we need to serialize them as JS
            # For now, serialize commands and solution as JSON-like but with regex
            # We'll reconstruct commands as in original: each command is [re, out, cls] or {re,l}
            # From dump, commands is list of lists or dicts with re as string
            # We need to output as JS: [/^pat/,`out`,"cls"] or {re:/pat/,l:"label"}
            # Let's try to extract original JS for commands/solution by parsing original file chunk
            # Find chunk for this sid in original text
            pattern=re.compile(r'S\(\s*"'+re.escape(cat)+r'"\s*,\s*"'+re.escape(sid)+r'".*?,\s*`.*?`,\s*"[^"]*"\s*,\s*(\[.*?\])\s*,\s*(\[.*?\])\s*,\s*(\{.*?\})\s*(?:,\s*(\{.*?\}))?\s*\);', re.DOTALL)
            m=pattern.search(text)
            if m:
                cmds_js=m.group(1)
                sol_js_orig=m.group(2)
                editor_js_orig=m.group(3)
                extra_js=m.group(4) or ""
                # Use original cmds/sol
                cmds_str=cmds_js
                sol_str=sol_js_orig
            else:
                # fallback: serialize from dump
                def serialize_cmd(c):
                    if isinstance(c, list):
                        re_pat=c[0] if len(c)>0 else ""
                        out=c[1] if len(c)>1 else ""
                        cls=c[2] if len(c)>2 else "dim"
                        if isinstance(re_pat, str):
                            return f'["{esc(re_pat)}",`{esc(out)}`,"{cls}"]'
                        else:
                            return f'[/{esc(str(re_pat))}/,`{esc(out)}`,"{cls}"]'
                    elif isinstance(c, dict):
                        re_pat=c.get('re') or c.get('pattern') or ""
                        out=c.get('out') or c.get('l') or ""
                        return f'{{re:/{esc(str(re_pat))}/,l:"{esc(out)}"}}'
                    else:
                        return "[]"
                cmds_str="[" + ",".join(serialize_cmd(c) for c in commands) + "]"
                sol_str="[" + ",".join(f'{{re:/{esc(c.get("re",""))}/,l:"{esc(c.get("l",""))}"}}' for c in solution) + "]"
            # Now build final S call
            # Use original level and title etc
            # Brief is new_brief
            s_call=f'S("{esc(cat)}","{esc(sid)}","{esc(title)}","{esc(level)}",`{new_brief}`,"{esc(prompt)}",{cmds_str},{sol_str},{new_editor},{hints_obj});\n'
            new_parts.append(s_call)
        else:
            # keep original chunk as is (extract from original file)
            # Find original S call text for this sid
            # Use regex to extract
            pattern=re.compile(r'(S\(\s*"'+re.escape(cat)+r'"\s*,\s*"'+re.escape(sid)+r'".*?\);)', re.DOTALL)
            m=pattern.search(text)
            if m:
                new_parts.append(m.group(1)+"\n")
            else:
                # fallback: keep as is
                new_parts.append(f'// missing {sid}\n')
    # Write new file
    new_content="".join(new_parts)
    # Ensure header is preserved if not already
    if not new_content.startswith("/*"):
        new_content="/* Auto-enriched */\n"+new_content
    path.write_text(new_content, encoding='utf-8')
    print(f"Wrote {src}: {len(ids)} scenarios")

print("done")
