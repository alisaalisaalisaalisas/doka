# -*- coding: utf-8 -*-
"""Генератор тренажёра: извлекает все вопросы/ответы из docs/ (формат
`**ВN. вопрос**` + `<details><summary>Ответ</summary>`) и создаёт
интерактивный quiz.html и страницу-описание.

Сканируются ВСЕ разделы docs/*/ — новые Q/A-блоки в любой теме попадают
в колоду автоматически после перегенерации.

Запуск: py tools/build_trainer.py  (из корня репозитория)
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
EXCLUDED_DIRS = {"22-trainer"}          # сам тренажёр не сканируем
SRC_DIRS = [
    d for d in sorted(DOCS.iterdir())
    if d.is_dir() and d.name not in EXCLUDED_DIRS
]
OUT = ROOT / "docs" / "22-trainer"

TOPICS = {
    "01-policy-as-code": "20.1 Policy as Code (OPA/Kyverno)",
    "02-observability-at-scale": "20.2 Observability at Scale",
    "03-secrets-runtime-security": "20.3 Секреты и runtime",
    "04-infra-testing": "20.4 Тестирование инфры",
    "05-registries-dependencies": "20.5 Реестры и зависимости",
    "06-message-brokers": "20.6 RabbitMQ/NATS",
    "07-network-edge": "20.7 Network Edge",
    "08-storage-s3-etcd-longhorn": "20.8 MinIO/etcd/Longhorn",
    "09-iac-nextgen": "20.9 Pulumi/Packer/Crossplane",
    "10-cli-arsenal": "20.10 CLI-арсенал",
    "11-config-languages-and-sentry": "20.11 Jsonnet/CUE/Sentry",
    "12-clouds": "20.12 Облака",
    "13-gitlab-administration": "20.13 GitLab admin",
    "14-rancher-and-k3s": "20.14 Rancher/k3s",
    "15-virtualization": "20.15 KVM/Proxmox/VMware",
    "16-mysql-ha": "20.16 MySQL HA",
    "17-tails": "20.17 Хвосты стека",
    "00-senior-stack-summary": "Свод Части 1",
    "00-senior-stack-summary-p2": "Свод Части 2",
    "00-senior-stack-summary-p3": "Свод Части 3",
    "01-python-for-devops": "Python для DevOps",
    "02-go-for-devops": "Go для DevOps",
    "01-intro-lifecycle": "MLOps 23.1 Введение и жизненный цикл",
    "02-mlflow-tracking": "MLOps 23.2 MLflow",
    "03-data-pipelines": "MLOps 23.3 DVC и пайплайны",
    "04-serving-monitoring": "MLOps 23.4 Сервинг и мониторинг",
}

Q_RE = re.compile(
    r"\*\*(?:В)?\d+\.\s*(.+?)\*\*\s*\n+<details><summary>Ответ</summary>\s*\n(.*?)</details>",
    re.S,
)


def md_to_html(text: str) -> str:
    """Минимальный markdown → HTML для карточек."""
    text = html.escape(text.strip())
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\n", "<br>", text)
    return text


def extract():
    cards = []
    for src in SRC_DIRS:
        for path in sorted(src.glob("*.md")):
            if path.stem == "00-plan":
                continue
            topic = TOPICS.get(path.stem, path.stem)
            text = path.read_text(encoding="utf-8")
            for m in Q_RE.finditer(text):
                q, a = m.group(1).strip(), m.group(2)
                # убрать вложенные details-подсказки из вопроса, если попали
                q = re.sub(r"<details>.*?</details>", "", q, flags=re.S).strip()
                cards.append({"t": topic, "q": md_to_html(q), "a": md_to_html(a)})
    return cards


def tag_for(topic: str) -> str:
    t = re.sub(r"[^a-zа-я0-9]+", "-", topic.lower()).strip("-")
    return "senior-stack::" + t


QUIZ_TEMPLATE = """<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Тренажёр SRS — DevOps Senior Stack</title>
<style>
:root{--bg:#0e1217;--panel:#151b23;--border:#2a3441;--fg:#d5dde5;--dim:#7d8b99;--ok:#4ade80;--err:#f87171;--warn:#fbbf24;--acc:#26c6da}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,Segoe UI,sans-serif}
header{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 16px;background:var(--panel);border-bottom:1px solid var(--border)}
h1{font-size:16px;margin:0 auto 0 0;color:var(--acc)}
select,button,label{background:#1c2530;color:var(--fg);border:1px solid var(--border);border-radius:6px;padding:7px 12px;font:inherit;cursor:pointer}
label{display:flex;gap:6px;align-items:center;font-size:13px}
button:hover{border-color:var(--acc)}
main{max-width:860px;margin:0 auto;padding:20px 16px}
#progress{font-size:13px;color:var(--dim);margin-bottom:6px}
#due{font-size:13px;margin-bottom:10px}
.due-badge{color:var(--warn)}
.bar{height:8px;background:#1c2530;border-radius:4px;overflow:hidden;margin-bottom:16px}
.bar>div{height:100%;background:var(--acc);width:0;transition:width .3s}
.card{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:20px}
.topic{font-size:12px;color:var(--acc);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px}
.q{font-size:17px;font-weight:600;margin-bottom:14px}
.a{background:#0b0f14;border:1px solid var(--border);border-radius:8px;padding:14px;margin:12px 0;font-size:14px;display:none}
.a code{background:#1c2530;padding:1px 5px;border-radius:4px}
.btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.btns .show{margin-left:auto}
.verdict button.again{border-color:var(--err);color:var(--err)}
.verdict button.good{border-color:var(--ok);color:var(--ok)}
.verdict button.easy{border-color:var(--acc);color:var(--acc)}
#done{text-align:center;padding:40px;display:none}
#done b{font-size:22px}
.mode{font-size:13px;color:var(--dim);margin-bottom:8px}
</style></head><body>
<header>
  <h1>🎯 Тренажёр SRS: Senior DevOps Stack</h1>
  <select id="topic"><option value="">Все темы</option></select>
  <select id="mode">
    <option value="srs">Режим: Anki (по расписанию)</option>
    <option value="exam">Режим: экзамен (все подряд)</option>
  </select>
  <button id="shuffle">Перемешать</button>
  <button id="reset">Сбросить прогресс</button>
</header>
<main>
  <div class="mode">Anki-режим: «Снова» — карточка вернётся сегодня; «Хорошо» — интервал ×2.5 (1→3→7→16→35→70 дней); «Легко» — ×3. Прогресс хранится в браузере.</div>
  <div id="due"></div>
  <div id="progress"></div>
  <div class="bar"><div id="bar-fill"></div></div>
  <div class="card" id="card">
    <div class="topic" id="t"></div>
    <div class="q" id="q"></div>
    <div class="a" id="a"></div>
    <div class="btns">
      <button id="show" class="show">Показать ответ</button>
      <span class="verdict" id="verdict" style="display:none">
        <button class="again" id="again">✗ Снова</button>
        <button class="good" id="good">✓ Хорошо</button>
        <button class="easy" id="easy">⚡ Легко</button>
      </span>
    </div>
  </div>
  <div id="done"><b>🎉 На сегодня всё!</b><br><span id="done-stats"></span><br><br>
  <button id="exam-now">Пройти экзамен (все подряд)</button>
  <button onclick="location.reload()">Обновить очередь</button></div>
</main>
<script>
const DATA = __DATA__;
const KEY = "devops-handbook-srs-v2";
const DAY = 86400000;
const IVLS = [1,3,7,16,35,70];                 // дни для «Хорошо»
const topicSel = document.getElementById("topic"),
      modeSel = document.getElementById("mode"),
      progressEl = document.getElementById("progress"),
      dueEl = document.getElementById("due"),
      barFill = document.getElementById("bar-fill"),
      cardEl = document.getElementById("card"),
      doneEl = document.getElementById("done"),
      doneStats = document.getElementById("done-stats"),
      topicEl = document.getElementById("t"),
      qEl = document.getElementById("q"),
      aEl = document.getElementById("a"),
      showBtn = document.getElementById("show"),
      verdictEl = document.getElementById("verdict"),
      againBtn = document.getElementById("again"),
      goodBtn = document.getElementById("good"),
      easyBtn = document.getElementById("easy"),
      shuffleBtn = document.getElementById("shuffle"),
      resetBtn = document.getElementById("reset"),
      examNowBtn = document.getElementById("exam-now");
let state = JSON.parse(localStorage.getItem(KEY) || "{}");  // hash -> {v, due, ivl}
let deck = [], i = 0, shown = false, shuffled = false;

const hash = s => { let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))|0; return "q"+h; };
const isNew = c => !state[hash(c.q+c.t)];
const isDue = c => isNew(c) || (state[hash(c.q+c.t)].due||0) <= Date.now();

[...new Set(DATA.map(c=>c.t))].sort().forEach(t=>{
  const o=document.createElement("option"); o.value=t;
  o.textContent=t+" ("+DATA.filter(c=>c.t===t).length+")"; topicSel.appendChild(o);
});

function rebuild(){
  const f = topicSel.value;
  let pool = DATA.map((c,idx)=>({...c,idx})).filter(c=>!f || c.t===f);
  if(modeSel.value==="srs") pool = pool.filter(isDue);
  if(shuffled) pool.sort(()=>Math.random()-.5);
  deck = pool; i = 0; render();
}
function stats(pool){
  const learned = pool.filter(c=>{const s=state[hash(c.q+c.t)];return s && s.ivl>=7;}).length;
  const due = pool.filter(isDue).length;
  const mastered = pool.filter(c=>{const s=state[hash(c.q+c.t)];return s && s.v==="ok";}).length;
  return {learned, due, mastered, total: pool.length};
}
function render(){
  const f = topicSel.value;
  const pool = DATA.map(c=>c).filter(c=>!f || c.t===f);
  const s = stats(pool);
  const dueNow = pool.filter(isDue).length;
  dueEl.innerHTML = modeSel.value==="srs"
    ? `📌 К повторению сейчас: <span class="due-badge">${dueNow}</span> · Выучено (интервал ≥7д): <b>${s.learned}</b> · Отвечено хоть раз: ${s.mastered}/${s.total}`
    : `Режим экзамена: все ${s.total} карточек подряд.`;
  const answered = deck.filter(c=>state[hash(c.q+c.t)]).length;
  progressEl.textContent = `В очереди: ${deck.length} · Пройдено в этой сессии: ${Math.min(i,deck.length)}`;
  barFill.style.width = deck.length ? (Math.min(i,deck.length)/deck.length*100)+"%" : "0";
  if(!deck.length || i>=deck.length){
    cardEl.style.display="none"; doneEl.style.display="block";
    doneStats.textContent = `Сессия завершена. Вернитесь завтра — Anki-расписание покажет, что повторить.`;
    return;
  }
  const c = deck[i]; shown=false;
  const st = state[hash(c.q+c.t)];
  topicEl.textContent = c.t + (st ? ` · интервал: ${st.ivl||0}д` : " · новая карточка");
  qEl.innerHTML = c.q;
  aEl.innerHTML = "<b>Ответ:</b><br>"+c.a; aEl.style.display="none";
  showBtn.style.display=""; verdictEl.style.display="none";
}
showBtn.onclick = ()=>{ aEl.style.display="block"; shown=true; showBtn.style.display="none"; verdictEl.style.display="inline"; };
function grade(kind){
  if(!shown) return;
  const c = deck[i], h = hash(c.q+c.t), now = Date.now();
  if(kind==="again")      state[h] = {v:"no", due: now + 10*60000, ivl: 0};
  else if(kind==="easy")  state[h] = {v:"ok", due: now + Math.max(IVLS[2],(state[h]?.ivl||0)*3)*DAY, ivl: Math.max(IVLS[2],(state[h]?.ivl||0)*3)};
  else { const cur = (state[h]?.ivl)||0; const next = IVLS[IVLS.findIndex(x=>x>cur)]; if(next===-1||cur>=IVLS.at(-1)) state[h]={v:"ok",due:now+IVLS.at(-1)*DAY,ivl:IVLS.at(-1)}; else state[h]={v:"ok",due:now+next*DAY,ivl:next}; }
  localStorage.setItem(KEY, JSON.stringify(state));
  i++; render();
}
againBtn.onclick = ()=>grade("again");
goodBtn.onclick = ()=>grade("good");
easyBtn.onclick = ()=>grade("easy");
shuffleBtn.onclick = ()=>{ shuffled = true; rebuild(); };
resetBtn.onclick = ()=>{ if(confirm("Сбросить весь SRS-прогресс?")){ state={}; localStorage.removeItem(KEY); shuffled=false; rebuild(); } };
examNowBtn.onclick = ()=>{ modeSel.value="exam"; shuffled=true; rebuild(); };
topicSel.onchange = rebuild; modeSel.onchange = rebuild;
rebuild();
</script></body></html>
"""

INDEX_TEMPLATE = """# 🎯 Тренажёр вопросов: {total} карточек по всему курсу

> Вопросы собираются автоматически из всех разделов, где есть блоки формата
> `**ВN. вопрос**` + спойлер «Ответ» (Senior Stack, MLOps, Python/Go и новые разделы).

| Формат | Ссылка | Для чего |
| :--- | :--- | :--- |
| **Интерактивный SRS-тренажёр** | [quiz.html](quiz.html) | Браузер: Anki-алгоритм (Снова/Хорошо/Легко, интервалы 1→3→7→16→35→70 дней), фильтр по темам, прогресс в localStorage |

## Статистика по темам

| Тема | Вопросов |
| :--- | ---: |
{stats_rows}

## Как заниматься

1. Откройте [quiz.html](quiz.html), выберите тему (или «Все темы»).
2. Отвечайте **вслух** до нажатия «Показать ответ».
3. Честно отмечайте «Снова / Хорошо / Легко» — SRS-расписание само решит, что повторить завтра.
4. Режим «экзамен» — все карточки подряд без расписания.

!!! tip "Регулярность важнее объёма"
    15 минут в день эффективнее 3 часов раз в неделю. Прошли колоду дважды с результатом >90% «знаю» — вы готовы к техническим собеседованиям по этим темам.

## Пересборка тренажёра

После изменения материалов любого раздела (блоки «ВN. вопрос» + «Ответ») перегенерируйте карточки:

```bash
py tools/build_trainer.py
```
"""


def build_index(cards):
    from collections import Counter
    counts = Counter(c["t"] for c in cards)
    rows = "\n".join(
        f"| {t} | {n} |" for t, n in sorted(counts.items()))
    (OUT / "index.md").write_text(
        INDEX_TEMPLATE.format(total=len(cards), stats_rows=rows),
        encoding="utf-8")


def build_quiz(cards):
    html_out = QUIZ_TEMPLATE.replace("__DATA__", json.dumps(cards, ensure_ascii=False))
    (OUT / "quiz.html").write_text(html_out, encoding="utf-8")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cards = extract()
    if not cards:
        raise SystemExit("Не найдено ни одного вопроса — проверьте регулярку!")
    build_quiz(cards)
    build_index(cards)
    from collections import Counter
    print(f"Итого карточек: {len(cards)}")
    for t, n in sorted(Counter(c["t"] for c in cards).items()):
        print(f"  {t}: {n}")


if __name__ == "__main__":
    main()
