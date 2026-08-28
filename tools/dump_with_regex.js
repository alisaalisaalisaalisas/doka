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
      o.start=editor.start||editor.initialContent||null;
      o.checks=editor.checks||null;
      o.hints=editor.hints||null;
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
// Convert regex to string
function replacer(key, value){
  if(value instanceof RegExp){
    return value.toString();
  }
  return value;
}
// Need to handle nested regex in commands/solution/checks
for(const s of window.SCENARIOS){
  if(s.commands){
    s.commands = s.commands.map(c=>{
      if(Array.isArray(c)){
        let re=c[0];
        if(re instanceof RegExp) c[0]=re.toString();
        return c;
      } else if(c && c.re){
        if(c.re instanceof RegExp) c.re=c.re.toString();
        return c;
      }
      return c;
    });
  }
  if(s.solution){
    s.solution = s.solution.map(c=>{
      if(c && c.re && c.re instanceof RegExp) c.re=c.re.toString();
      return c;
    });
  }
  if(s.checks){
    s.checks = s.checks.map(c=>{
      if(c && c.re && c.re instanceof RegExp) c.re=c.re.toString();
      return c;
    });
  }
}
fs.writeFileSync('tools/scenarios_dump_regex.json', JSON.stringify(window.SCENARIOS, replacer, 2));
console.log('dumped', window.SCENARIOS.length);
