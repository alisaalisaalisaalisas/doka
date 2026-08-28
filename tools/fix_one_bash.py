import pathlib, re
path=pathlib.Path("docs/21-playground/scenarios-global-bash.js")
text=path.read_text(encoding="utf-8")
# Find gc-bash-5
# It currently is: S("Bash","gc-bash-5",...,"dev@bash:~$",[...],[...],{hints:[...]});
# We need to insert editor before hints
# Find the chunk for gc-bash-5
m=re.search(r'S\(\s*"Bash"\s*,\s*"gc-bash-5".*?\}\);', text, re.DOTALL)
if not m:
    print("not found")
else:
    chunk=m.group(0)
    print("found chunk len", len(chunk))
    # Check if has files
    if "files:" in chunk:
        print("already has files")
    else:
        # Create new editor
        files={
            "data.json": '{\n  "items": [\n    {"name": "a", "status": "Failed"},\n    {"name": "b", "status": "Running"}\n  ]\n}',
            "query.jq": '.items[] | select(.status=="Failed") | .name'
        }
        solFiles={
            "data.json": '{\n  "items": [\n    {"name": "a", "status": "Failed"},\n    {"name": "b", "status": "Running"}\n  ]\n}',
            "query.jq": '.items[] | select(.status=="Failed") | .name'
        }
        checks=[{"re": r"select\(.*Failed", "l": "фильтрует Failed"}]
        def esc(s): return s.replace("\\","\\\\").replace('"','\\"').replace("\n","\\n").replace("`","\\`").replace("${","\\${")
        files_js=",".join(f'"{k}":`{esc(v)}`' for k,v in files.items())
        sol_js=",".join(f'"{k}":`{esc(v)}`' for k,v in solFiles.items())
        checks_js=",".join(f'{{re:/{esc(c["re"])}/,l:"{esc(c["l"])}"}}' for c in checks)
        new_editor=f'{{file:"data.json",files:{{{files_js}}},checks:[{checks_js}],solutionFiles:{{{sol_js}}}}}'
        # Insert before hints: find ",{hints"
        # The chunk ends with ",{hints:[...]});"
        # Find the last ",{hints"
        pos=chunk.rfind(",{hints")
        if pos==-1:
            pos=chunk.rfind(", {hints")
        if pos==-1:
            print("hints pos not found")
        else:
            new_chunk=chunk[:pos+1] + new_editor + "," + chunk[pos+1:]
            text=text.replace(chunk, new_chunk)
            path.write_text(text, encoding="utf-8")
            print("patched gc-bash-5")
            # Verify
            new_text=path.read_text(encoding="utf-8")
            m2=re.search(r'S\(\s*"Bash"\s*,\s*"gc-bash-5".*?\}\);', new_text, re.DOTALL)
            print("new chunk has files", "files:" in m2.group(0))
