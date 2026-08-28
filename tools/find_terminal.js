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
      o.file=editor.file||editor.activeFile||null;
      o.checks=editor.checks||null;
      o.solutionFiles=editor.solutionFiles||null;
    }
    if(extra){
      if(extra.hints) o.hints=extra.hints;
      if(extra.solutionFiles) o.solutionFiles=extra.solutionFiles;
    }
    window.SCENARIOS.push(o);
  }, window});
  vm.runInContext(code, ctx, {filename:src});
}
for(const s of window.SCENARIOS){
  const hasFiles = !!(s.files && Object.keys(s.files).length) || !!(s.file && s.start);
  if(!hasFiles){
    console.log(`TERMINAL ONLY: ${s._src} ${s.cat} ${s.id} ${s.title}`);
  }
}
