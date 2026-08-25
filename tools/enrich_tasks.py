# -*- coding: utf-8 -*-
"""Добавляет к каждой задаче (разд. 15) подсказку-спойлер и поле ввода ответа
с JS-проверкой по ключевым инструментам решения. Идемпотентно."""
import pathlib
import re
import html

DIR = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\docs\15-hands-on-practice")
FILES = ["01-100-devops-practical-tasks-part1.md", "02-100-devops-practical-tasks-part2.md"]

STOP = {
    "the", "and", "for", "var", "name", "image", "spec", "metadata", "apiversion",
    "apps", "containers", "env", "ports", "type", "true", "false", "none", "null",
    "user", "workingdirectory", "description", "after", "restart", "restartsec",
    "limitnofile", "privatetmp", "wantedby", "multi-user", "target", "network",
    "get", "post", "http", "https", "localhost", "com", "www", "bin", "usr", "opt",
    "etc", "tmp", "dev", "proc", "sys", "log", "logs", "conf", "yaml", "yml", "json",
    "sh", "py", "js", "txt", "bak", "new", "old", "all", "and", "not", "out", "end",
    "print", "data", "file", "path", "test", "demo", "app", "api", "web", "value",
    "server", "host", "port", "list", "from", "into", "then", "else", "elif",
}


def tools_from(block: str):
    m = re.search(r"```[a-zA-Z]*\n(.*?)(?:```|\Z)", block, re.S)
    if not m:
        return []
    for line in m.group(1).splitlines():
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("//"):
            continue
        toks = re.findall(r"[A-Za-z][A-Za-z0-9_.+-]{2,}", s)
        tools = [t for t in toks if t.lower() not in STOP]
        seen, uniq = set(), []
        for t in tools:
            if t.lower() not in seen:
                seen.add(t.lower())
                uniq.append(t)
        return uniq[:4]
    return []


def widget(pattern: str, tools: list[str]) -> str:
    tools_html = ", ".join(f"<code>{html.escape(t)}</code>" for t in tools) or "см. решение"
    pat = html.escape(pattern, quote=True)
    return (
        "<details><summary>💡 Подсказка (инструменты)</summary>\n\n"
        f"<p>Ключевые инструменты: {tools_html}. "
        "Начните с них — полное решение ниже под спойлером.</p>\n\n"
        "</details>\n\n"
        f'<div class="answer-check" data-answer="{pat}"></div>\n'
    )


PAGE_JS = """
<script>
(function(){
  document.querySelectorAll(".answer-check").forEach(function(box){
    if(box.dataset.ready) return; box.dataset.ready = "1";
    var pat = box.getAttribute("data-answer");
    var inp = document.createElement("input");
    inp.placeholder = "✍️ Введите вашу команду/решение…";
    inp.style.cssText = "width:75%;max-width:640px;background:#0b0f14;color:#cde3ea;border:1px solid #2a3441;border-radius:6px;padding:7px 10px;font:13px 'JetBrains Mono',Consolas,monospace;margin:4px 0";
    var btn = document.createElement("button");
    btn.textContent = "Проверить ответ";
    btn.style.cssText = "margin-left:8px;cursor:pointer;background:#1c2530;color:#d5dde5;border:1px solid #2a3441;border-radius:6px;padding:7px 12px";
    var res = document.createElement("span"); res.style.cssText = "margin-left:10px;font-size:14px";
    box.appendChild(inp); box.appendChild(btn); box.appendChild(res);
    function check(){
      var ok = false;
      try { ok = new RegExp(pat, "i").test(inp.value); } catch(e) {}
      res.innerHTML = ok
        ? '<span style="color:#4ade80">✓ Верно! Сверьте с эталонным решением ниже.</span>'
        : '<span style="color:#f87171">✗ Пока не то — загляните в подсказку 💡</span>';
      if(ok) inp.style.borderColor = "#4ade80";
    }
    btn.onclick = check;
    inp.addEventListener("keydown", function(e){ if(e.key==="Enter") check(); });
  });
})();
</script>
"""


def process(text: str) -> tuple[str, int]:
    if "answer-check" in text:
        return text, -1
    blocks = re.split(r"(?=^### Задача)", text, flags=re.M)
    count = 0
    out = []
    for b in blocks:
        if b.startswith("### Задача") and "<summary>👁" in b and "answer-check" not in b:
            tools = tools_from(b)
            if tools:
                pattern = r"\b(" + "|".join(re.escape(t) for t in tools) + r")\b"
                widget_html = widget(pattern, tools)
                # вставить ПЕРЕД details с решением
                b = re.sub(r"(<details>\n<summary>👁)", widget_html + r"\1", b, count=1)
                count += 1
        out.append(b)
    return "".join(out) + PAGE_JS, count


for name in FILES:
    p = DIR / name
    t = p.read_text(encoding="utf-8")
    new, n = process(t)
    if n == -1:
        print(name, ": уже обогащено — skip")
        continue
    p.write_text(new, encoding="utf-8")
    print(f"{name}: подсказок+инпутов добавлено — {n}")
