import pathlib, json, re
ROOT=pathlib.Path("C:/Users/User/Desktop/papka/doka")
dump=json.loads((ROOT/"tools/scenarios_dump_regex.json").read_text(encoding="utf-8"))

# Get one file
src="scenarios-global-python.js"
scenarios=[s for s in dump if s.get('_src')==src]
print(f"Found {len(scenarios)} for {src}")
s=scenarios[0]
print(s['cat'], s['id'], s['title'])
print("has_files", bool(s.get('files')))
print("has_solFiles", bool(s.get('solutionFiles')))
print("brief snippet", s['brief'][:200].replace("\n"," ")[:150])
print("commands", s['commands'][:2])
print("solution", s['solution'][:2])
# Try to generate files
def esc(s):
    return s.replace("\\","\\\\").replace('"','\\"').replace("\n","\\n").replace("`","\\`").replace("${","\\${")
def gen_brief(cat,title,files,first_cmd,labels):
    active=list(files.keys())[0]
    files_list=", ".join(f"<code>{f}</code>" for f in list(files.keys())[:3])
    brief=f"<h3>Контекст</h3><p>{cat}: <b>{title}</b>. Файл <code>{active}</code> сломан.</p>"
    brief+=f"<h3>Что происходит</h3><p>Симптом: {title}. Проверка падает.</p>"
    steps=labels[:3] if labels else ["диагностика","исправить"]
    brief+="<h3>Что нужно сделать</h3><ul>"+"".join(f"<li>[ ] {esc(s)}</li>" for s in steps)+"</ul>"
    brief+=f"<h3>Ограничения</h3><p>Меняйте только <code>{active}</code>.</p>"
    brief+=f"<h3>Стартовое состояние</h3><p>Файлы: {files_list}. Активный: <code>{active}</code>.</p>"
    brief+=f"<h3>Ожидаемый результат</h3><p>Чек-лист зелёный.</p>"
    brief+=f"<h3>Проверка</h3><pre>cat {active}</pre>"
    return brief

# quick test
files={"app.py": "broken"}
sol={"app.py": "fixed"}
checks=[{"re": r"fixed", "l": "fixed"}]
brief=gen_brief(s['cat'], s['title'], files, "cat app.py", ["диагностика","исправить"])
print("generated brief", brief[:200])
# Serialize commands
def serialize_commands(cmds):
    parts=[]
    for c in cmds:
        if isinstance(c, list):
            re_pat=c[0]
            # re_pat is string like "/^.../" or "^..."
            if isinstance(re_pat, str) and re_pat.startswith("/") and re_pat.rfind("/")>0:
                # keep as regex
                out=c[1] if len(c)>1 else ""
                cls=c[2] if len(c)>2 else "dim"
                parts.append(f'[/{re_pat[1:-1]}/,`{esc(out)}`,"{cls}"]')
            else:
                out=c[1] if len(c)>1 else ""
                cls=c[2] if len(c)>2 else "dim"
                parts.append(f'["{esc(str(re_pat))}",`{esc(out)}`,"{cls}"]')
        elif isinstance(c, dict):
            re_pat=c.get('re') or c.get('pattern') or ""
            l=c.get('l') or c.get('label') or ""
            if isinstance(re_pat, str) and re_pat.startswith("/") and re_pat.endswith("/"):
                parts.append(f'{{re:{re_pat},l:"{esc(l)}"}}')
            else:
                parts.append(f'{{re:"{esc(str(re_pat))}",l:"{esc(l)}"}}')
    return "[" + ",".join(parts) + "]"

print(serialize_commands(s['commands'][:2]))
