#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P1-ремонт контента сценариев Playground.

Чинит шаблонный мусор, оставленный прежним генератором:
  1. Контекст-«контаминация»: в Kafka-задачах контекст про Redis и т.п.
  2. «Ограничения: Менять только main.py…» — врёт для терминальных задач.
  3. «Стартовое состояние» — согласуется с реальными files сценария.
  4. «Ожидаемый результат» — собирается из шагов решения (solution labels).
  5. «Проверка: python main.py / pytest» — заменяется на команды, которые
     реально поддерживаются командным движком сценария.
  6. Генерирует 3 task-specific подсказки (10-м аргументом S(...)).
  7. Устраняет дубликаты ID (переименование).
Идемпотентен: повторный запуск не портит данные.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, "docs", "21-playground")

S_PREFIX = re.compile(
    r'^(?P<head>S\(\s*"(?P<cat>[^"]*)"\s*,\s*"(?P<id>[^"]*)"\s*,\s*"(?P<title>(?:[^"\\]|\\.)*)"\s*,\s*"(?P<level>[^"]*)"\s*,\s*)',
    re.M,
)
CMD_ROW = re.compile(
    r'^\s*\[\s*(?:"(?P<spat>(?:[^"\\]|\\.)*)"|/(?P<rpat>(?:[^/\\\n]|\\.)*)/[a-z]*)\s*,',
    re.M,
)
SOL_ROW = re.compile(
    r'\{re:\s*(?:"(?P<sp>(?:[^"\\]|\\.)*)"|/(?P<rp>(?:[^/\\\n]|\\.)*)/[a-z]*)\s*,\s*l\s*:\s*"(?P<label>(?:[^"\\]|\\.)*)"',
)

def unesc(s):
    return (s.replace("\\'", "'").replace('\\"', '"').replace("\\n", "\n")
             .replace("\\t", "\t").replace("\\\\", "\\").replace("\\`", "`"))

def esc_js(s):
    return (s.replace("\\", "\\\\").replace('"', '\\"')
             .replace("\n", "\\n").replace("\t", "\\t")
             .replace("${", "\\${"))

def clean_pattern(p):
    p = unesc(p)
    p = re.sub(r'^\^', '', p)
    p = re.sub(r'\$$', '', p)
    p = p.replace(r'\b', '').replace(r'\.', '.').replace(r'\/', '/')
    p = p.replace('\\\\', '\\')
    p = re.sub(r'\(\?:', '(', p)
    p = re.sub(r'\(([^()|]*)\|[^()]*\)', r'\1', p)
    p = p.replace('.*', '…').replace('.+', '…')
    p = re.sub(r'\\s\+', ' ', p)
    p = re.sub(r'\s+', ' ', p).strip().strip('…').strip()
    return p or "…"

def tool_roots(patterns):
    roots = []
    for p in patterns:
        c = clean_pattern(p).split("…")[0].strip()
        if not c:
            continue
        tok = c.split()[0].lstrip('(')
        for t in re.split(r'[|,]', tok):
            t = t.strip()
            if t and t not in roots:
                roots.append(t)
    return roots

def title_words(title):
    t = unesc(title).lower()
    stop = {"и", "в", "на", "с", "не", "для", "как", "что", "это", "от", "по",
            "the", "a", "to", "of", "code", "exit", "нет", "под", "при"}
    return [w for w in re.findall(r'[a-zа-яё0-9_\-]{3,}', t) if w not in stop]

def context_is_foreign(ctx, keywords):
    low = ctx.lower()
    return not any(kw and kw.lower() in low for kw in keywords)

def first_sentence(text):
    m = re.match(r'(.{40,}?[.!?])\s', text)
    return m.group(1) if m else text[:160]

# --- генерация блоков -------------------------------------------------------

def gen_context(cat, title, tools):
    tool_str = ", ".join("<code>%s</code>" % x for x in tools[:5]) if tools else "команды терминала"
    return ("<h3>Контекст</h3><p><b>%s.</b> %s. Среда сценария симулирует "
            "%s-окружение; основные инструменты терминала здесь: %s.</p>"
            % (esc_js(cat), esc_js(unesc(title)), esc_js(cat), tool_str))

def gen_limits(has_files, active):
    if has_files:
        a = " (активный: <code>%s</code>)" % esc_js(active) if active else ""
        return ("<h3>Ограничения</h3><p>Меняйте только файлы проекта этого сценария"
                "%s; тесты и несвязанные ресурсы не трогайте.</p>" % a)
    return ("<h3>Ограничения</h3><p>Терминальная задача: изменения выполняются "
            "командами в терминале; правка файлов кода не требуется. Не выходите "
            "за пределы окружения сценария.</p>")

def gen_initial(has_files, files, active, first_cmd):
    if has_files:
        fl = ", ".join("<code>%s</code>" % esc_js(f) for f in files[:6])
        a = " Активный файл: <code>%s</code>." % esc_js(active) if active else ""
        return ("<h3>Стартовое состояние</h3><p>Файлы проекта: %s.%s "
                "Редактор уже открыт на активном файле.</p>" % (fl, a))
    fc = " Начните с: <code>%s</code>." % esc_js(first_cmd) if first_cmd else ""
    return ("<h3>Стартовое состояние</h3><p>Окружение подготовлено, проблема уже "
            "воспроизведена.%s</p>" % fc)

def gen_expected(labels):
    if labels:
        lst = " → ".join(esc_js(unesc(l)) for l in labels[:4])
        more = " → …" if len(labels) > 4 else ""
        return ("<h3>Ожидаемый результат</h3><p>Чек-лист «Проверить решение» полностью "
                "зелёный: %s%s.</p>" % (lst, more))
    return ("<h3>Ожидаемый результат</h3><p>Все шаги «Что нужно сделать» выполнены и "
            "подтверждены кнопкой «Проверить решение».</p>")

def gen_check(cmds, has_files):
    rows = [esc_js(c) for c in cmds[:3]]
    pre = "<br>".join(rows) if rows else "см. подсказки"
    if has_files:
        return "<h3>Проверка</h3><pre>%s</pre><p>для кода: кнопка «Проверить код»</p>" % pre
    return "<h3>Проверка</h3><pre>%s</pre>" % pre

def gen_hints(cat, symptom, tools, first_cmd, labels, has_files):
    if symptom:
        sym = unesc(symptom)
        h1 = ("Симптом: %s. Определите, на каком слое %s возникает проблема, "
              "прежде чем что-то менять." % (esc_js(first_sentence(sym)), esc_js(cat)))
    else:
        h1 = ("Зафиксируйте симптом и определите, какой слой %s отвечает за это "
              "поведение: меняйте по одному параметру и проверяйте после каждого "
              "изменения." % esc_js(cat))
    tl = ", ".join("<code>%s</code>" % x for x in tools[:3]) if tools else "команды сценария"
    h2 = "Рабочие инструменты сценария: %s." % tl
    if first_cmd:
        h2 += " Диагноз начинайте с <code>%s</code>." % esc_js(first_cmd)
    if has_files:
        h2 = ("Правьте файлы в редакторе; проверка кода — кнопкой «Проверить код». " + h2)
    if labels:
        h3 = ("Порядок действий: " + " → ".join(esc_js(unesc(l)) for l in labels[:3])
              + (" → …" if len(labels) > 3 else ""))
    else:
        h3 = "Разбейте задачу на шаги «диагноз → исправление → проверка» и выполняйте команды по одной."
    return [h1, h2, h3]

# --- восстановление повреждённых брифов -------------------------------------

DAMAGED_MARK = re.compile(r'^`<b>(?:Симптом|Задача)</b>')


def rebuild_brief(cat, title, sym, tools, labels, patterns, files, active, stats):
    """Собирает полный бриф из реальных данных сценария (для повреждённых)."""
    parts = []
    parts.append(gen_context(cat, title, tools))
    if sym:
        parts.append("<h3>Что происходит</h3><p>%s</p>" % esc_js(unesc(sym)))
    if labels:
        items = "".join("<li>[ ] %s</li>" % esc_js(unesc(l)) for l in labels)
        parts.append("<h3>Что нужно сделать</h3><ul>%s</ul>" % items)
    parts.append(gen_limits(bool(files), active))
    parts.append(gen_initial(bool(files), files, active,
                             clean_pattern(patterns[0]) if patterns else None))
    parts.append(gen_expected(labels))
    shown = []
    for p in patterns:
        c = clean_pattern(p)
        if c not in shown:
            shown.append(c)
    parts.append(gen_check(shown, bool(files)))
    stats["rebuilt"] += 1
    return "".join(parts)


def repair_damaged_briefs(src, stats):
    """Находит брифы-обрубки (symptom-only + лишняя запятая) и восстанавливает их."""
    chunks = re.split(r'(?=^S\()', src, flags=re.M)
    out = []
    for ch in chunks:
        if not ch.startswith("S("):
            out.append(ch)
            continue
        m = S_PREFIX.match(ch)
        if not m:
            out.append(ch)
            continue
        open_idx = ch.find("`", m.end())
        if open_idx == -1:
            out.append(ch)
            continue
        term_re = re.compile(r'(?<!\\)`,$', re.M)
        term = term_re.search(ch, open_idx + 1)
        if not term:
            out.append(ch)
            continue
        brief = ch[open_idx + 1:term.start()]
        rest = ch[term.end():]

        # повредждённые = брифы без единого <h3> (обрубок «симптом-only»)
        if "<h3>" in brief:
            out.append(ch)
            continue

        # данные сценария
        patterns = [mm.group("spat") if mm.group("spat") is not None else mm.group("rpat")
                    for mm in CMD_ROW.finditer(rest)]
        tools = tool_roots(patterns)
        labels = [mm.group("label") for mm in SOL_ROW.finditer(rest)]
        files, active = [], None
        fm = re.search(r'files\s*:\s*\{([^}]*)\}', rest)
        if fm:
            files = re.findall(r'"((?:[^"\\]|\\.)*)"\s*:', fm.group(1))
        am = re.search(r'\bfile\s*:\s*"((?:[^"\\]|\\.)*)"|\bactiveFile\s*:\s*"((?:[^"\\]|\\.)*)"', rest)
        if am:
            active = am.group(1) or am.group(2)
        if active and active not in files:
            files = [active] + files
        sym = re.sub(r'<[^>]+>', '', brief).strip()
        sym = re.sub(r'^(Симптом|Задача)\s*:\s*', '', sym).strip()

        # симптом мог остаться только в hints h1 ("Симптом: ...") — возьмём оттуда
        if not sym:
            hm = re.search(r'"Симптом:\s*(.+?)"', rest)
            if hm:
                sym = hm.group(1)

        new_brief = rebuild_brief(m.group("cat"), m.group("title"), sym, tools,
                                  labels, patterns, files, active, stats)
        # лишняя запятая после терминатора: `,\n,\n"prompt" -> `,\n"prompt"
        rest_fixed = re.sub(r'^,\s*\n\s*(?=")', '', rest)
        if rest_fixed != rest:
            stats["stray_commas"] += 1
        ch = ch[:open_idx + 1] + new_brief + ch[term.start():term.end()] + rest_fixed
        out.append(ch)
    return "".join(out)


# маркеры шаблонного мусора прежнего генератора в контекстах
CONTAM_MARKERS = [
    "CrashLoopBackOff", "CLUSTERDOWN", "canceling statement due to conflict",
    "HPA `shop-api`", "shop-api", "REQUIRED_DB_URL", "Плейбук `template`",
    "validate: nginx -t %s", "hot_standby_feedback", "LogQL: rate",
    "kubectl logs --previous", "rollout` не катит", "Unexpected drift",
]


def norm_ctx(t):
    return re.sub(r'\s+', ' ', t).strip()


def collect_context_freqs(src, freqs):
    for ch in re.split(r'(?=^S\()', src, flags=re.M):
        if not ch.startswith("S("):
            continue
        m = S_PREFIX.match(ch)
        if not m:
            continue
        open_idx = ch.find("`", m.end())
        if open_idx == -1:
            continue
        term = re.compile(r'(?<!\\)`,$', re.M).search(ch, open_idx + 1)
        if not term:
            continue
        brief = ch[open_idx + 1:term.start()]
        cm = re.match(r'<h3>Контекст</h3><p>(.*?)</p>', brief, re.S)
        if cm:
            key = norm_ctx(cm.group(1))[:200]
            freqs[key] = freqs.get(key, 0) + 1


# --- обработка одного S-вызова ----------------------------------------------

def process_chunk(chunk, used_ids, stats, ctx_freqs=None):
    m = S_PREFIX.match(chunk)
    if not m:
        return chunk
    cat, sid, title = m.group("cat"), m.group("id"), m.group("title")

    if sid in used_ids:
        new = sid + "b"
        k = 1
        while new in used_ids:
            k += 1
            new = "%s%c" % (sid, ord('b') + k - 1)
        chunk = chunk[:m.start("id")] + new + chunk[m.end("id"):]
        stats["renamed"].append("%s->%s" % (sid, new))
        sid = new
    used_ids.add(sid)

    open_idx = chunk.find("`", m.end())
    if open_idx == -1:
        return chunk
    term_re = re.compile(r'(?<!\\)`,$', re.M)
    term = term_re.search(chunk, open_idx + 1)
    if not term:
        return chunk
    brief = chunk[open_idx + 1:term.start()]
    rest = chunk[term.end():]

    patterns = [mm.group("spat") if mm.group("spat") is not None else mm.group("rpat")
                for mm in CMD_ROW.finditer(rest)]
    tools = tool_roots(patterns)
    sol_labels = [mm.group("label") for mm in SOL_ROW.finditer(rest)]

    files, active = [], None
    fm = re.search(r'files\s*:\s*\{([^}]*)\}', rest)
    if fm:
        files = re.findall(r'"((?:[^"\\]|\\.)*)"\s*:', fm.group(1))
    am = re.search(r'\bfile\s*:\s*"((?:[^"\\]|\\.)*)"|\bactiveFile\s*:\s*"((?:[^"\\]|\\.)*)"', rest)
    if am:
        active = am.group(1) or am.group(2)
    if active and active not in files:
        files = [active] + files
    has_files = bool(files)
    has_hints = bool(re.search(r'\bhints\s*:', rest))

    sym = None
    sm = re.search(r'<h3>Что происходит</h3><p>(.*?)</p>', brief, re.S)
    if sm:
        sym = re.sub(r'<[^>]+>', '', sm.group(1))
        sym = re.sub(r'^\s*(Симптом|Задача)\s*:\s*', '', sym).strip()

    keywords = [cat.lower()] + title_words(title) + [t.lower() for t in tools]
    new_brief = brief

    cm = re.match(r'<h3>Контекст</h3><p>(.*?)</p>', new_brief, re.S)
    if cm:
        ctx_text = re.sub(r'<[^>]+>', '', cm.group(1))
        key = norm_ctx(cm.group(1))[:200]
        freq = (ctx_freqs or {}).get(key, 1)
        contaminated = any(mk in cm.group(1) for mk in CONTAM_MARKERS)
        if contaminated or freq > 1:
            new_brief = gen_context(cat, title, tools) + new_brief[cm.end():]
            stats["ctx_replaced"] += 1
        else:
            stats["ctx_kept"] += 1

    garbage_limits = ("<h3>Ограничения</h3><p>Менять только <code>main.py</code> "
                      "(или команду). Не удалять <code>get_pods()</code>. "
                      "Сохранить интерфейс.</p>")
    if garbage_limits in new_brief:
        new_brief = new_brief.replace(garbage_limits, gen_limits(has_files, active))
        stats["limits"] += 1

    ss = re.search(r'<h3>Стартовое состояние</h3><p>.*?</p>', new_brief, re.S)
    if ss:
        new_brief = (new_brief[:ss.start()] +
                     gen_initial(has_files, files, active,
                                 clean_pattern(patterns[0]) if patterns else None) +
                     new_brief[ss.end():])
        stats["initial"] += 1

    ore = re.search(r'<h3>Ожидаемый результат</h3><p>.*?</p>', new_brief, re.S)
    if ore:
        new_brief = (new_brief[:ore.start()] + gen_expected(sol_labels) + new_brief[ore.end():])
        stats["expected"] += 1

    ck = re.search(r'<h3>Проверка</h3><pre>.*?</pre>(<p>.*?</p>)?', new_brief, re.S)
    if ck:
        shown = []
        for p in patterns:
            c = clean_pattern(p)
            if c not in shown:
                shown.append(c)
        new_brief = (new_brief[:ck.start()] + gen_check(shown, has_files) + new_brief[ck.end():])
        stats["check"] += 1

    chunk = chunk[:open_idx + 1] + new_brief + chunk[term.start():]

    if not has_hints:
        hints = gen_hints(cat, sym, tools,
                          clean_pattern(patterns[0]) if patterns else None,
                          sol_labels, has_files)
        hint_js = "{hints:[" + ",".join('"%s"' % esc_js(h) for h in hints) + "]}"
        idx = chunk.rfind(");")
        chunk = chunk[:idx].rstrip() + "," + hint_js + chunk[idx:]
        stats["hints"] += 1

    return chunk


def main():
    stats = {"ctx_replaced": 0, "ctx_kept": 0, "limits": 0, "initial": 0,
             "expected": 0, "check": 0, "hints": 0, "renamed": [],
             "rebuilt": 0, "stray_commas": 0, "no_h3": 0}
    used_ids = set()
    ctx_freqs = {}
    files_list = sorted(f for f in os.listdir(DIR)
                        if f.startswith("scenarios-") and f.endswith(".js"))
    for f in files_list:
        with open(os.path.join(DIR, f), encoding="utf-8") as fh:
            collect_context_freqs(fh.read(), ctx_freqs)
    for f in files_list:
        path = os.path.join(DIR, f)
        with open(path, encoding="utf-8") as fh:
            src = fh.read()
        src = repair_damaged_briefs(src, stats)
        chunks = re.split(r'(?=^S\()', src, flags=re.M)
        out = []
        for ch in chunks:
            if ch.startswith("S("):
                ch = process_chunk(ch, used_ids, stats, ctx_freqs)
            out.append(ch)
        with open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write("".join(out))
    print("STATS:", stats)


if __name__ == "__main__":
    main()


