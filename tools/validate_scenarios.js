// Валидатор всех паттернов сценариев
const fs = require("fs");
const path = require("path");
const DIR = "docs/21-playground";
global.window = { SCENARIOS: [] };
global.S = (cat, id, title, level, brief, prompt, commands, solution, editor) => {
  const o = { cat, id, title, level, brief, prompt, commands, solution, ...(editor || {}) };
  window.SCENARIOS.push(o);
};
for (const f of fs.readdirSync(DIR).filter(f => f.startsWith("scenarios-"))) {
  try { new Function(fs.readFileSync(path.join(DIR, f), "utf8"))(); }
  catch (e) { console.log(f + ": LOAD ERR " + e.message); }
}
let bad = 0;
for (const s of window.SCENARIOS) {
  const check = (p, where) => {
    try { if (typeof p === "string") new RegExp(p, "i"); }
    catch (e) { console.log(`BAD [${s.id}] ${where}: "${p}" -> ${e.message}`); bad++; }
  };
  (s.commands || []).forEach(c => check(Array.isArray(c) ? c[0] : c.re, "command"));
  (s.solution || []).forEach(x => check(x.re, "solution"));
  (s.editorChecks || []).forEach(x => check(x.re, "check"));
}
console.log(`scenarios=${window.SCENARIOS.length} badPatterns=${bad}`);
