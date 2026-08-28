import pathlib, re
p=pathlib.Path("mkdocs.yml")
text=p.read_text(encoding="utf-8")
# Fix lines like "      - Lab: Flux: 05-..."
# They should be "      - \"Lab: Flux\": 05-..."
# Pattern: 6 spaces, -, space, title with colon, colon, space, path
# We need to quote the title part

def replacer(m):
    indent=m.group(1)
    title=m.group(2).strip()
    path=m.group(3)
    # If title already quoted, keep
    if title.startswith('"') and title.endswith('"'):
        return m.group(0)
    # If title contains :, quote it
    if ":" in title:
        return f'{indent}"{title}": {path}'
    return m.group(0)

# Regex for nav entries: indent (6 spaces or more) + "- " + title + ": " + path
# But title may contain colon, so we need to handle
# We look for lines starting with 6 spaces, "-", space, then capture title until ": " followed by folder/
# Use regex: ^(\s+-\s+)(.+?):\s+(\S+)$
lines=text.split("\n")
new_lines=[]
for line in lines:
    # Check if line is a nav entry with colon in title
    # e.g., "      - Lab: Flux: 05-gitops-and-cicd/28-flux-lab.md"
    # This has two colons: one in title, one as separator
    # We can detect by counting: if line contains ": " and the part after last ": " is a path with "/"
    # And the line starts with "      - "
    if line.startswith("      - ") and ": " in line:
        # Split from right: path is after last ": "
        # Find last occurrence of ": "
        last_colon=line.rfind(": ")
        title_part=line[8:last_colon].strip()  # after "      - "
        path_part=line[last_colon+2:].strip()
        # If title_part contains ":" and not already quoted, and path contains "/"
        if ":" in title_part and "/" in path_part and not (title_part.startswith('"') and title_part.endswith('"')):
            # Also need to ensure path is a .md file
            if path_part.endswith(".md"):
                new_line=f'      - "{title_part}": {path_part}'
                new_lines.append(new_line)
                continue
    new_lines.append(line)

p.write_text("\n".join(new_lines), encoding="utf-8")
print("fixed")
