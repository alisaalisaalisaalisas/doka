const fs=require('fs'),path=require('path');
const playgroundDir='docs/21-playground';
const html=fs.readFileSync(path.join(playgroundDir,'playground.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(s=>s.startsWith('scenarios-'));
global.window={SCENARIOS:[]};
const vm=require('vm');
let srcToScenarios={};
for(const src of scripts){
  const before=window.SCENARIOS.length;
  const code=fs.readFileSync(path.join(playgroundDir,src),'utf8');
  const ctx=vm.createContext({S:(...args)=>{
    const [cat,id,title,level,brief,prompt,commands,solution,editor,x]=args;
    const o={cat,id,title,level,brief,prompt,commands,solution,editor,x, _src:src};
    if(editor){
      o.files=editor.files||null;
      o.editorFile=editor.file||editor.activeFile||null;
      o.hints=editor.hints||null;
      o.solutionFiles=editor.solutionFiles||null;
      o.editorChecks=editor.checks||null;
      o.solutionDetail=editor.solution||null;
    }
    if(x){ if(x.hints) o.hints=x.hints; if(x.solutionFiles) o.solutionFiles=x.solutionFiles; }
    window.SCENARIOS.push(o);
  }, window});
  vm.runInContext(code, ctx, {filename: src});
  const after=window.SCENARIOS.length;
  srcToScenarios[src]=after-before;
  //console.log(src, after-before)
}
const all=window.SCENARIOS;
const withFiles=all.filter(s=>s.files && Object.keys(s.files).length);
console.log("withFiles total", withFiles.length);
withFiles.forEach(s=> {
  console.log(`${s._src} | ${s.cat} | ${s.id} | ${s.title} | files=${Object.keys(s.files).join(',')} | active=${s.editorFile} | solFiles=${s.solutionFiles?Object.keys(s.solutionFiles).join(','):'NONE'} | hints=${(s.hints||[]).length} | checks=${(s.editorChecks||[]).length} | cmds=${(s.commands||[]).length}`);
});
// check for solutionFiles completeness
console.log("\n--- Check scenario content detail for first file scenario ---");
if(withFiles[0]){
  const s=withFiles[0];
  console.log("ID",s.id);
  console.log("brief",s.brief.slice(0,500));
  console.log("editor",JSON.stringify(s.editor,null,2).slice(0,2000));
  console.log("solutionDetail",JSON.stringify(s.solutionDetail,null,2)?.slice(0,2000));
}
// find python scenarios that should have files but don't - sample their brief and solution
const py=all.filter(s=>s.cat==='Python');
console.log("\nPython sample detailed");
py.slice(0,2).forEach(s=>{
  console.log("ID",s.id, "title",s.title);
  console.log("brief", s.brief.slice(0,800).replace(/\n/g,' '));
  console.log("solution", JSON.stringify(s.solution).slice(0,500));
  console.log("commands", JSON.stringify(s.commands).slice(0,500));
  console.log("editor", s.editor);
  console.log("---");
});
