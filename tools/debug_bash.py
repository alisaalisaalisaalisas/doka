import pathlib, re
t=pathlib.Path("docs/21-playground/scenarios-global-bash.js").read_text(encoding="utf-8")
m=re.search(r'S\(\s*"Bash"\s*,\s*"gc-bash-5".*?\}\);', t, re.DOTALL)
c=m.group(0)
print(c[-500:])
print("--- repr ---")
print(repr(c[-500:]))
