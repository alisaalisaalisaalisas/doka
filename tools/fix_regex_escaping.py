import pathlib, re
DIR=pathlib.Path("docs/21-playground")
for p in DIR.glob("scenarios-*.js"):
    text=p.read_text(encoding="utf-8")
    # Find all re:/.../ patterns and fix double escaping
    # For each occurrence of re:/.../, replace \\ with \ inside
    def replacer(m):
        pat=m.group(1)
        # Fix double backslashes: \\ -> \
        # But be careful: we want to turn \\s to \s, \\( to \(, etc.
        # The pattern currently has \\, we want \
        # So replace \\ with \ 
        # However, we need to handle cases where pat contains \\ that should be \
        # Simple: replace \\ with \
        fixed=pat.replace("\\\\", "\\")
        return f"re:/{fixed}/"
    new_text=re.sub(r're:/((?:[^/\\]|\\.)*)/', replacer, text)
    if new_text!=text:
        p.write_text(new_text, encoding="utf-8")
        print(f"fixed {p.name}")
    else:
        print(f"no change {p.name}")

# Also fix the one we broke specifically for gc-bash-5
# The pattern there is select\(.*Failed but we wrote select\\(.*Failed
# Our fix above should handle it: \\( -> \(
print("done")
