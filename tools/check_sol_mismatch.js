const fs=require('fs'),path=require('path');
const DIR='docs/21-playground';
const html=fs.readFileSync(path.join(DIR,'playground.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(s=>s.startsWith('scenarios-'));
global.window={SCENARIOS:[]};
const vm=require('vm');
for(const src of scripts){
  const code=fs.readFileSync(path.join(DIR,src),'utf8');
  const ctx=vm.createContext({S:(...args)=>{
    const [cat,id,title,level,brief,prompt,commands,solution,editor,extra]=args;
    const o={cat,id,title,level,brief,prompt,commands,solution,editor,extra,_src:src};
    if(editor){
      o.files=editor.files||null;
      o.editorFile=editor.file||editor.activeFile||null;
      o.hints=editor.hints||null;
      o.solutionFiles=editor.solutionFiles||null;
      o.editorChecks=editor.checks||null;
    }
    if(extra && extra.hints) o.hints=extra.hints;
    if(extra && extra.solutionFiles) o.solutionFiles=extra.solutionFiles;
    window.SCENARIOS.push(o);
  }, window});
  vm.runInContext(code, ctx, {filename:src});
}
const all=window.SCENARIOS;
console.log("total",all.length);
for(const s of all){
  const hasFiles = s.files && Object.keys(s.files).length>0;
  const hasSol = s.solutionFiles && Object.keys(s.solutionFiles).length>0;
  if(hasSol && !hasFiles){
    console.log(`SOL without FILES: ${s.id} [${s.cat}] ${s.title} src=${s._src}`);
  }
  if(hasFiles && !hasSol){
    console.log(`FILES without SOL: ${s.id} [${s.cat}] ${s.title} src=${s._src} files=${Object.keys(s.files)}`);
  }
}
console.log("withFiles", all.filter(s=>s.files && Object.keys(s.files).length).length);
console.log("withSol", all.filter(s=>s.solutionFiles && Object.keys(s.solutionFiles).length).length);
