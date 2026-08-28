import pathlib, json, re
ROOT=pathlib.Path("C:/Users/User/Desktop/papka/doka")
dump=json.loads((ROOT/"tools/scenarios_dump_regex.json").read_text(encoding="utf-8"))
# Filter for one file
src="scenarios-global-python.js"
scenarios=[s for s in dump if s.get('_src')==src]
print(f"Processing {len(scenarios)} for {src}")

def esc(s):
    if s is None: return ""
    return s.replace("\\","\\\\").replace('"','\\"').replace("\n","\\n").replace("`","\\`").replace("${","\\${").replace("\r","")

def gen_files(cat, title, sid):
    tl=title.lower()
    if "argparse" in tl:
        init='import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--input", required=False)  # BUG\nargs = parser.parse_args()\n'
        fixed='import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--input", required=True)\nargs = parser.parse_args()\n'
        checks=[{"re": r"required\s*=\s*True", "l": "required=True"}]
        return {"app.py": init}, {"app.py": fixed}, checks, "app.py"
    else:
        init=f'# {title}\n# broken\n'
        fixed=f'# {title} — fixed\n# ok\n'
        checks=[{"re": r"ok", "l": "fixed"}]
        return {"main.py": init, "tests/test_main.py": "def test_ok():\n    assert True\n"}, {"main.py": fixed, "tests/test_main.py": "def test_ok():\n    assert True\n"}, checks, "main.py"

def gen_brief(cat, title, files, first_cmd, labels):
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

# Test generation for first scenario
s=scenarios[0]
cat=s['cat']; title=s['title']; sid=s['id']; level=s['level']; prompt=s['prompt']
commands=s['commands']; solution=s['solution']
labels=[x.get('l') for x in solution]
first_cmd=commands[0][0] if commands and isinstance(commands[0], list) else "cat app.py"
files, solFiles, checks, active = gen_files(cat, title, sid)
brief=gen_brief(cat, title, files, first_cmd, labels)
print("brief", brief[:200])
# Serialize
def serialize_commands(cmds):
    parts=[]
    for c in cmds:
        if isinstance(c, list):
            re_pat=c[0]; out=c[1] if len(c)>1 else ""; cls=c[2] if len(c)>2 else "dim"
            # re_pat is string like "^python3..."
            parts.append(f'["{esc(str(re_pat))}",`{esc(out)}`,"{cls}"]')
        elif isinstance(c, dict):
            re_pat=c.get('re'); l=c.get('l') or c.get('label') or ""
            # re_pat may be "/^.../" or "^..."
            if isinstance(re_pat, str) and re_pat.startswith("/") and re_pat.rfind("/")>0:
                parts.append(f'{{re:{re_pat},l:"{esc(l)}"}}')
            else:
                parts.append(f'{{re:"{esc(str(re_pat))}",l:"{esc(l)}"}}')
    return "[" + ",".join(parts) + "]"

def serialize_solution(sol):
    parts=[]
    for c in sol:
        re_pat=c.get('re'); l=c.get('l') or c.get('label') or ""
        if isinstance(re_pat, str) and re_pat.startswith("/") and re_pat.endswith("/"):
            parts.append(f'{{re:{re_pat},l:"{esc(l)}"}}')
        else:
            parts.append(f'{{re:"{esc(str(re_pat))}",l:"{esc(l)}"}}')
    return "[" + ",".join(parts) + "]"

cmds_str=serialize_commands(commands)
sol_str=serialize_solution(solution)
files_js=",".join(f'"{k}":`{esc(v)}`' for k,v in files.items())
sol_js=",".join(f'"{k}":`{esc(v)}`' for k,v in solFiles.items())
checks_js=",".join(f'{{re:/{esc(c["re"])}/,l:"{esc(c["l"])}"}}' for c in checks)
hints=[f"Hint1 for {title}", f"Hint2 for {title}", f"Hint3 for {title}"]
hints_js=",".join(f'"{esc(h)}"' for h in hints)
new_editor=f'{{file:"{esc(active)}",files:{{{files_js}}},checks:[{checks_js}],solutionFiles:{{{sol_js}}}}}'
hints_obj=f'{{hints:[{hints_js}]}}'
s_call=f'S("{esc(cat)}","{esc(sid)}","{esc(title)}","{esc(level)}",`{brief}`,"{esc(prompt)}",{cmds_str},{sol_str},{new_editor},{hints_obj});'
print(s_call[:1000])
# Write test file
out_path=ROOT/"docs/21-playground/scenarios-global-python.js.test"
out_path.write_text('/* Test */\n'+s_call, encoding='utf-8')
print("written test")
