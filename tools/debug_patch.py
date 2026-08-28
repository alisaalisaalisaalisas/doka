import re, pathlib
for path in [pathlib.Path("docs/21-playground/scenarios-base.js"), pathlib.Path("docs/21-playground/scenarios-mlops.js")]:
    text=path.read_text(encoding="utf-8")
    for sid in ["crashloop","jq-audit","pg-conflict","registry-push","tf-drift","ml1b"]:
        m=re.search(r'S\(".*?",\s*"'+re.escape(sid)+r'"', text)
        if not m: continue
        start=m.start()
        snippet=text[start:start+6000]
        # find checks
        has_checks="checks:" in snippet[:5000]
        has_sol="solutionFiles" in snippet[:5000]
        print(f"{path.name} {sid} has_checks {has_checks} has_sol {has_sol}")
        # show around checks
        idx=snippet.find("checks:")
        if idx!=-1:
            print(snippet[idx-100:idx+400].replace("\n","\\n")[:600])
        else:
            print("no checks found, snippet tail", snippet[2000:2600].replace("\n","\\n")[:600])
        print("---")
