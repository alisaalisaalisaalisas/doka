const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'../docs/21-playground');
global.window={SCENARIOS:[]};
global.S=(cat,id,title,level,brief,prompt,commands,solution,editor,extra)=>{
  const o={cat,id,title,level,brief,prompt,commands,solution};
  if(editor){
    o.files=editor.files||null; o.editorFile=editor.file||editor.activeFile||null; o.hints=editor.hints||null;
    o.solutionFiles=editor.solutionFiles||null; o.editorChecks=editor.checks||null;
  }
  if(extra){ if(extra.hints) o.hints=extra.hints; }
  o.cat=cat; o.id=id; o.title=title; o.level=level; o.brief=brief;
  window.SCENARIOS.push(o);
};
const files=fs.readdirSync(DIR).filter(f=>f.startsWith('scenarios-')&&f.endsWith('.js'));
for(const f of files){ new Function(fs.readFileSync(path.join(DIR,f),'utf8'))(); }
const CONTAM=["Deployment `api` в `CrashLoopBackOff`","CLUSTERDOWN Hash slot not covered","HPA `shop-api`","canceling statement due to conflict","Менять только <code>main.py</code>","get_pods()","Программа завершается без traceback"];
for(const s of window.SCENARIOS){
  if(CONTAM.some(m=>s.brief.includes(m))){
    console.log(`GENERIC ${s.id} [${s.cat}] ${s.title} -> contains ${CONTAM.find(m=>s.brief.includes(m))}`);
  }
  if(s.brief && /CrashLoopBackOff/.test(s.brief) && !/k8s|kubernetes|kube|deployment|pod/i.test(s.cat+s.title)){
    if(!/k8s|docker|kubernetes/i.test(s.cat)){
      console.log(`K8S_CONTAM ${s.id} [${s.cat}] ${s.title}`);
    }
  }
}
