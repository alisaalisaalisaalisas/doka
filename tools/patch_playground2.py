# -*- coding: utf-8 -*-
"""Патч playground.html: гонка редакторов, очистка ввода, цели в брифе."""
import pathlib

p = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\docs\21-playground\playground.html")
t = p.read_text(encoding="utf-8")

repl = [
# 1) флаги состояния редактора
("""let editorApi = {getValue:()=>"",setValue:()=>{},setLang:()=>{}};
function makeTextareaFallback(){
  if(document.querySelector("#editor textarea")) return;""",
 """let editorApi = {getValue:()=>"",setValue:()=>{},setLang:()=>{}};
let editorReady = false, monacoStarted = false;   // защита от гонки Monaco/fallback
function makeTextareaFallback(){
  if(editorReady) return;
  editorReady = true;"""),

# 2) Monaco: пометить старт, не создавать если fallback уже есть
("""  s.onload = () => require(["vs/editor/editor.main"], () => {
    monaco.editor.defineTheme("lab",{base:"vs-dark",inherit:true,rules:[],
      colors:{"editor.background":"#0b0f14"}});""",
 """  s.onload = () => { monacoStarted = true; require(["vs/editor/editor.main"], () => {
    if(editorReady) return;                    // fallback уже создан — не дублируем
    editorReady = true;
    monaco.editor.defineTheme("lab",{base:"vs-dark",inherit:true,rules:[],
      colors:{"editor.background":"#0b0f14"}});"""),

("""    loadScenario(current.id);
  });
  s.onerror = () => { makeTextareaFallback(); loadScenario(current.id); };
  document.head.appendChild(s);
  setTimeout(()=>{ if(!window.monaco && !document.querySelector("#editor textarea")){ makeTextareaFallback(); loadScenario(current.id);} }, 4000);""",
 """    loadScenario(current.id);
  }); };
  s.onerror = () => { makeTextareaFallback(); loadScenario(current.id); };
  document.head.appendChild(s);
  setTimeout(()=>{ if(!editorReady && !monacoStarted){ makeTextareaFallback(); loadScenario(current.id);} }, 6000);"""),

# 3) отказоустойчивый ввод: ввод очищается ВСЕГДА, ошибки симулятора видны
("""function runCommand(raw){
  const cmd = raw.trim();
  if(!cmd) return;
  print(current.prompt+" "+cmd, "cmd"); history.push(cmd); hIdx = history.length; executed.push(cmd);
  if(cmd === "clear"){ term.innerHTML=""; return; }
  const rule = current.commands.find(r => RE(r.re).test(cmd));
  if(rule){ if(rule.out) print(rule.out, rule.cls||""); }
  else print(`bash: ${cmd.split(" ")[0]}: команда не входит в сценарий. Нажмите «Подсказки».`, "dim");
}
input.addEventListener("keydown", e=>{
  if(e.key==="Enter"){ runCommand(input.value); input.value=""; }""",
 """function runCommand(raw){
  const cmd = raw.trim();
  if(!cmd) return;
  print(current.prompt+" "+cmd, "cmd"); history.push(cmd); hIdx = history.length; executed.push(cmd);
  if(cmd === "clear"){ term.innerHTML=""; return; }
  try {
    const rule = current.commands.find(r => RE(r.re).test(cmd));
    if(rule){ if(rule.out) print(rule.out, rule.cls||""); }
    else print(`bash: ${cmd.split(" ")[0]}: команда не входит в сценарий. Нажмите «Подсказки».`, "dim");
  } catch(e) {
    print("⚠ ошибка симулятора: " + e.message, "err");
    console.error(e);
  }
}
function submitCommand(){
  const v = input.value;
  input.value = "";                    // ввод очищается ВСЕГДА, до выполнения
  try { runCommand(v); }
  catch(e) { print("⚠ ошибка симулятора: " + e.message, "err"); console.error(e); }
}
input.addEventListener("keydown", e=>{
  if(e.key==="Enter"){ submitCommand(); }"""),

# 4) бриф: цели задания + стартовые файлы
("""  document.getElementById("brief").innerHTML = current.brief || "Описание отсутствует.";""",
 """  const goals = (current.solution||[]).map(s=>`<li>${s.l||s.label}</li>`).join("");
  const filesList = Object.keys(current.files||{}).map(f=>`<span class="file" data-file="${f}">${f}</span>`).join(", ") || "—";
  document.getElementById("brief").innerHTML =
    (current.brief || "Описание отсутствует.") +
    `<hr><div><b>📂 Стартовое состояние:</b> файлы ${filesList} (открыты в редакторе слева)</div>` +
    `<div style="margin-top:6px"><b>🎯 Цели задания</b> (выполните в терминале):<ul style="margin:4px 0 0 18px;padding:0">${goals}</ul></div>`;"""),
]

for old, new in repl:
    assert old in t, "NOT FOUND: " + old[:60]
    t = t.replace(old, new)

p.write_text(t, encoding="utf-8")
print("playground patched: 4/4")
