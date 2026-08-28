import pathlib
ROOT=pathlib.Path("C:/Users/User/Desktop/papka/doka/docs")
for p in ROOT.rglob("*.md"):
    text=p.read_text(encoding="utf-8")
    if "```mermaid" in text and "Источник" in text:
        # Replace the mermaid block
        old="""```mermaid
graph TD
    A[Источник] --> B[Обработка]
    B --> C[Хранение]
    C --> D[Потребитель]
```"""
        new="""```mermaid
graph TD
    A["Source"] --> B["Processing"]
    B --> C["Storage"]
    C --> D["Consumer"]
```"""
        if old in text:
            text=text.replace(old, new)
            p.write_text(text, encoding="utf-8")
            print(f"fixed {p.relative_to(ROOT)}")
        else:
            # Try with different whitespace
            import re
            pattern=re.compile(r'```mermaid\s+graph TD\s+A\[Источник\].*?```', re.DOTALL)
            if pattern.search(text):
                text=pattern.sub(new, text)
                p.write_text(text, encoding="utf-8")
                print(f"fixed regex {p.relative_to(ROOT)}")

print("done")
