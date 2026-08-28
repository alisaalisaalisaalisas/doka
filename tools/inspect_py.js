const fs=require('fs'),path=require('path');
const playgroundDir='docs/21-playground';
const html=fs.readFileSync(path.join(playgroundDir,'playground.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(s=>s.startsWith('scenarios-'));
global.window={SCENARIOS:[]};
const vm=require('vm');
for(const src of scripts){
  const code=fs.readFileSync(path.join(playgroundDir,src),'utf8');
  const ctx=vm.createContext({S:(...args)=>{
    const [cat,id,title,level,brief,prompt,commands,solution,editor,x]=args;
    const o={cat,id,title,level,brief,prompt,commands,solution,editor,x};
    if(editor){
      o.files=editor.files||null;
      o.editorFile=editor.file||editor.activeFile||null;
      o.hints=editor.hints||null;
      o.solutionFiles=editor.solutionFiles||null;
      o.editorChecks=editor.checks||null;
    }
    if(x && x.hints) o.hints=x.hints;
    if(x && x.solutionFiles) o.solutionFiles=x.solutionFiles;
    window.SCENARIOS.push(o);
  }, window});
  vm.runInContext(code, ctx, {filename: src});
}
const all=window.SCENARIOS;
const py=all.filter(s=>s.cat==='Python');
console.log('Python count',py.length);
py.slice(0,5).forEach(s=>{
  console.log('---',s.id, s.title);
  console.log('files', s.files? Object.keys(s.files): 'NONE');
  console.log('editorFile', s.editorFile);
  console.log('editorChecks', s.editorChecks? JSON.stringify(s.editorChecks).slice(0,200): 'NONE');
  console.log('brief snippet', (s.brief||'').slice(0,200).replace(/<[^>]+>/g,'').slice(0,120));
});
console.log('Python with files', py.filter(s=>s.files && Object.keys(s.files).length).length);
const go=all.filter(s=>s.cat==='Go');
console.log('Go with files', go.filter(s=>s.files && Object.keys(s.files).length).length);
console.log('Go count', go.length);
go.slice(0,3).forEach(s=>{
  console.log('GO',s.id,s.title,'files',s.files?Object.keys(s.files):'NONE', 'checks', s.editorChecks? s.editorChecks.length:0);
});
const linuxCats=[...new Set(all.filter(s=>s.cat.includes('Linux')).map(s=>s.cat))];
console.log('Linux cats', linuxCats);
const linuxAll=all.filter(s=>s.cat.includes('Linux'));
linuxAll.slice(0,3).forEach(s=> console.log(s.cat, s.id, s.title, 'files', s.files?Object.keys(s.files):'NONE'));
