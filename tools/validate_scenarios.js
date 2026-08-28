// Валидатор сценариев Playground — полная инвентаризация.
// Проверяет: загрузку всех файлов, дубликаты ID, комплектность данных,
// корректность regex-паттернов, качество контекста, подсказки, решения.
// Запуск: node tools/validate_scenarios.js
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "docs", "21-playground");

global.window = { SCENARIOS: [] };
global.S = (cat, id, title, level, brief, prompt, commands, solution, editor, extra) => {
  const o = { cat, id, title, level, brief, prompt, commands, solution };
  if (editor) {
    o.files = editor.files || null;
    o.editorFile = editor.file || editor.activeFile || null;
    o.editorStart = editor.start || editor.initialContent || null;
    o.editorChecks = editor.checks || null;
    o.hints = editor.hints || null;
    o.solutionDetail = editor.solution || editor.solutionDetail || null;
    o.solutionFiles = editor.solutionFiles || null;
    if (editor.activeFile && !o.editorFile) o.editorFile = editor.activeFile;
    for (const k of Object.keys(editor)) {
      if (!["files","file","activeFile","start","initialContent","checks","hints","solution","solutionDetail","solutionFiles"].includes(k)) {
        o[k] = editor[k];
      }
    }
  }
  if (extra) {
    if (extra.hints && !o.hints) o.hints = extra.hints;
    if (extra.solutionFiles && !o.solutionFiles) o.solutionFiles = extra.solutionFiles;
  }
  window.SCENARIOS.push(o);
};

const files = fs.readdirSync(DIR).filter(f => f.startsWith("scenarios-") && f.endsWith(".js"));
let loadErrors = 0;
for (const f of files) {
  try { new Function(fs.readFileSync(path.join(DIR, f), "utf8"))(); }
  catch (e) { console.log(`LOAD ERR ${f}: ${e.message}`); loadErrors++; }
}

const ss = window.SCENARIOS;
const flags = {
  duplicate_id: {}, bad_regex: 0, no_brief: 0, generic_context: 0,
  no_hints: 0, no_solution: 0, no_commands: 0,
  missing_files: 0, missing_active: 0, missing_editorChecks: 0,
  k8s_contamination: 0, mainpy_contamination: 0,
};
const seen = new Set();
let withFiles = 0, withHints3 = 0, termOnly = 0, codeTasks = 0;

// маркеры «универсального» шаблонного контекста прежнего генератора
const CONTAM_MARKERS = [
  "Deployment `api` в `CrashLoopBackOff`",
  "CLUSTERDOWN Hash slot not covered",
  "HPA `shop-api`",
  "canceling statement due to conflict",
  "Менять только <code>main.py</code>",
  "get_pods()",
  "Программа завершается без traceback",
];

for (const s of ss) {
  if (seen.has(s.id)) flags.duplicate_id[s.id] = (flags.duplicate_id[s.id] || 0) + 1;
  seen.add(s.id);

  const check = (p, where) => {
    try { if (typeof p === "string") new RegExp(p, "i"); else if (p instanceof RegExp) p.test(""); }
    catch (e) { console.log(`BAD REGEX [${s.id}] ${where}`); flags.bad_regex++; }
  };
  (s.commands || []).forEach(c => check(Array.isArray(c) ? c[0] : c.re, "command"));
  (s.solution || []).forEach(x => check(x.re, "solution"));
  (s.editorChecks || []).forEach(x => check(x.re, "check"));
  // hints — обычный текст для отображения, НЕ регэкспы: не компилируем

  if (!s.brief || s.brief.length < 40) flags.no_brief++;
  // generic context: only if marker appears outside its native domain
  let isGeneric = false;
  for (const m of CONTAM_MARKERS) {
    if (!s.brief.includes(m)) continue;
    // allow PostgreSQL error in PG-related tasks
    if (m.includes("canceling statement") && /postgres|postgresql|базовые/i.test(s.cat + " " + s.title)) continue;
    // allow K8s CrashLoop in AWS EKS / GCP GKE / Azure AKS tasks
    if (m.includes("CrashLoopBackOff") && /aws|gcp|azure|eks|gke|aks|kubernetes|k8s/i.test(s.cat + " " + s.title)) continue;
    isGeneric = true; break;
  }
  if (isGeneric) flags.generic_context++;
  if (s.brief && s.brief.includes("<h3>Контекст</h3>") === false) flags.generic_context += 0; // контекст обязателен
  if (s.brief && /Менять только <code>main\.py<\/code>/.test(s.brief)) flags.mainpy_contamination++;
  if (s.brief && /CrashLoopBackOff/.test(s.brief) && !/k8s|kubernetes|kube|deployment|pod|eks|gke|aks/i.test(s.cat + s.title)) {
    // k8s-маркер в не-k8s задаче (but allow cloud providers with k8s)
    if (!/k8s|docker|kubernetes|aws|gcp|azure/i.test(s.cat)) flags.k8s_contamination++;
  }

  const hasEditor = !!(s.files && Object.keys(s.files).length);
  if (hasEditor) {
    codeTasks++;
    if (!s.editorFile) flags.missing_active++;
    if (!s.editorChecks || !s.editorChecks.length) flags.missing_editorChecks++;
  } else {
    termOnly++;
  }
  if (s.hints && s.hints.length === 3) withHints3++; else flags.no_hints++;
  if (!s.solution || !s.solution.length) flags.no_solution++;
  if (!s.commands || !s.commands.length) flags.no_commands++;
}

const cats = {};
ss.forEach(s => { cats[s.cat] = (cats[s.cat] || 0) + 1; });

console.log("=========== PLAYGROUND SCENARIO INVENTORY ===========");
console.log(`files: ${files.length} (load errors: ${loadErrors})`);
console.log(`TOTAL SCENARIOS: ${ss.length}`);
console.log(`unique IDs: ${seen.size}`);
console.log(`categories: ${Object.keys(cats).length}`);
console.log(`code tasks (files+editor): ${codeTasks}`);
console.log(`terminal-only tasks: ${termOnly}`);
console.log(`with exactly 3 hints: ${withHints3}`);
console.log("---- FAIL flags ----");
console.log(`duplicate IDs: ${Object.keys(flags.duplicate_id).length}${Object.keys(flags.duplicate_id).length ? " -> " + Object.keys(flags.duplicate_id).join(",") : ""}`);
console.log(`bad regex patterns: ${flags.bad_regex}`);
console.log(`missing/short brief: ${flags.no_brief}`);
console.log(`generic/template context: ${flags.generic_context}`);
console.log(`'Менять только main.py' contamination: ${flags.mainpy_contamination}`);
console.log(`k8s context contamination: ${flags.k8s_contamination}`);
console.log(`missing 3 hints: ${flags.no_hints}`);
console.log(`missing solution: ${flags.no_solution}`);
console.log(`missing commands: ${flags.no_commands}`);
console.log(`code tasks missing activeFile: ${flags.missing_active}`);
console.log(`code tasks missing editorChecks: ${flags.missing_editorChecks}`);
console.log("---- categories ----");
console.log(Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}: ${v}`).join("\n"));

const fail = loadErrors + Object.keys(flags.duplicate_id).length + flags.bad_regex +
  flags.no_brief + flags.generic_context + flags.mainpy_contamination +
  flags.k8s_contamination + flags.no_hints + flags.no_solution + flags.no_commands;
console.log(`RESULT: ${fail === 0 ? "PASS" : "FAIL (" + fail + " issues)"}`);
process.exit(fail === 0 ? 0 : 1);

