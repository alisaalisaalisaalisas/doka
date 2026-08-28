import pathlib, re
path=pathlib.Path("docs/21-playground/scenarios-global-bash.js")
text=path.read_text(encoding="utf-8")
# Find gc-bash-5 chunk
m=re.search(r'S\(\s*"Bash"\s*,\s*"gc-bash-5".*?\}\);', text, re.DOTALL)
if not m:
    print("not found")
else:
    chunk=m.group(0)
    # Find hints
    hints_pos=chunk.find("{hints:")
    print(f"hints_pos {hints_pos}")
    # Find last comma before hints
    comma_pos=chunk.rfind(",", 0, hints_pos)
    print(f"comma_pos {comma_pos}, char before: {repr(chunk[comma_pos-5:comma_pos+5])}")
    # The chunk should be S(..., [solution], {hints:...});
    # We want to insert new_editor before the comma that precedes hints? Actually we need to insert after the comma
    # The structure is ..., [solution], {hints:...}
    # So after [solution] there is , then {hints
    # We want ..., [solution], {editor}, {hints:...}
    # So we insert new_editor + "," after the comma that is before hints? Let's see
    # Actually we want to keep the comma before hints, and insert new_editor + ","
    # So new_chunk = chunk[:comma_pos+1] + new_editor + "," + chunk[comma_pos+1:]
    files={
        "data.json": '{\n  "items": [\n    {"name": "a", "status": "Failed"}\n  ]\n}',
        "query.jq": '.items[] | select(.status=="Failed")'
    }
    solFiles={
        "data.json": '{\n  "items": [\n    {"name": "a", "status": "Failed"}\n  ]\n}',
        "query.jq": '.items[] | select(.status=="Failed") | .name'
    }
    checks=[{"re": r"select\(.*Failed", "l": "фильтрует Failed"}]
    def esc(s): return s.replace("\\","\\\\").replace('"','\\"').replace("\n","\\n").replace("`","\\`").replace("${","\\${")
    files_js=",".join(f'"{k}":`{esc(v)}`' for k,v in files.items())
    sol_js=",".join(f'"{k}":`{esc(v)}`' for k,v in solFiles.items())
    checks_js=",".join(f'{{re:/{esc(c["re"])}/,l:"{esc(c["l"])}"}}' for c in checks)
    new_editor=f'{{file:"data.json",files:{{{files_js}}},checks:[{checks_js}],solutionFiles:{{{sol_js}}}}}'
    new_chunk=chunk[:comma_pos+1] + new_editor + "," + chunk[comma_pos+1:]
    # Verify
    if "files:" in new_chunk and "solutionFiles:" in new_chunk:
        text=text.replace(chunk, new_chunk)
        path.write_text(text, encoding="utf-8")
        print("patched")
    else:
        print("failed to insert")
