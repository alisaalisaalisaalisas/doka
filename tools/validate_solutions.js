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
      o.editorStart=editor.start||editor.initialContent||null;
      o.editorChecks=editor.checks||null;
      o.hints=editor.hints||null;
      o.solutionFiles=editor.solutionFiles||null;
      o.solutionDetail=editor.solution||null;
    }
    if(extra){
      if(extra.hints) o.hints=extra.hints;
      if(extra.solutionFiles) o.solutionFiles=extra.solutionFiles;
    }
    window.SCENARIOS.push(o);
  }, window});
  vm.runInContext(code, ctx, {filename:src});
}
const all=window.SCENARIOS;
let total=0, completeSolutions=0, passing=0, failing=[], multiFile=0, terminalSol=0;
let behaviorChecks=0, implSpecific=0;
for(const s of all){
  total++;
  const hasFiles = !!(s.files && Object.keys(s.files).length) || !!(s.editorFile && s.editorStart);
  const hasSolFiles = !!(s.solutionFiles && Object.keys(s.solutionFiles).length);
  const hasEditorChecks = !!(s.editorChecks && s.editorChecks.length);
  const hasSolution = !!(s.solution && s.solution.length);
  if(hasSolFiles) {
    // check if solution is complete (has content)
    const solContent = Object.values(s.solutionFiles).join("\n");
    if(solContent.length > 20) completeSolutions++;
    if(Object.keys(s.solutionFiles).length >1) multiFile++;
  }
  if(!hasFiles && hasSolution) terminalSol++;
  // Validate solution passes checks
  let passes=true;
  if(hasFiles && hasSolFiles && hasEditorChecks){
    const solText = Object.values(s.solutionFiles).join("\n");
    for(const c of s.editorChecks){
      const re = typeof c.re === 'string' ? new RegExp(c.re, 'i') : c.re;
      if(!re.test(solText)){
        passes=false;
        // check if check is too specific (e.g., checks for exact string like "Semaphore")
        // For now count as behavior vs impl: if re is simple word like "Semaphore" it's impl-specific
        // We'll consider checks that look for generic patterns like "value:" etc as behavior
      }
    }
    // also check alternative: for file tasks, alternative solution could be different formatting but same semantics
    // We'll not test alternative here, just reference
  } else if(hasFiles && hasEditorChecks && !hasSolFiles){
    passes=false;
  }
  if(passes && hasFiles && hasSolFiles) passing++;
  if(!passes) failing.push({id:s.id, cat:s.cat, title:s.title, reason:"solution does not pass checks"});
  // Count behavior vs implementation-specific checks: heuristic
  if(hasEditorChecks){
    for(const c of s.editorChecks){
      const pattern = c.re.toString();
      // impl-specific if it checks for exact variable name like "Semaphore" without being requirement
      // We'll count as behavior if pattern contains generic like "value", "postgres", "s3", " REQUIRED_DB_URL" etc
      // For now just count behavior as all
      behaviorChecks++;
    }
  }
}

console.log(`TOTAL SCENARIOS: ${total}`);
console.log(`Complete solutions (solFiles with content): ${completeSolutions}`);
console.log(`Solutions passing checks (file tasks): ${passing}`);
if(failing.length) {
  console.log(`Failing scenarios: ${failing.length}`);
  failing.slice(0,10).forEach(f=>console.log(`  ${f.id} [${f.cat}] ${f.title} -> ${f.reason}`));
} else {
  console.log("All file tasks solutions PASS");
}
console.log(`Multi-file solutions: ${multiFile}`);
console.log(`Terminal solutions (solution steps): ${terminalSol}`);
console.log(`Behavior checks total: ${behaviorChecks}`);

// Also check for systemd etc: ensure no fake main.py
let fakeMain=0;
for(const s of all){
  const isSystemd = s.brief && /systemd|systemctl/.test(s.brief);
  const hasMain = s.files && s.files['main.py'];
  if(isSystemd && hasMain) fakeMain++;
}
console.log(`Systemd tasks with fake main.py: ${fakeMain} (should be 0)`);

// Check hints
let has3Hints=0;
for(const s of all) if(s.hints && s.hints.length===3) has3Hints++;
console.log(`Scenarios with 3 hints: ${has3Hints}/${total}`);

// Check for generic hints
let genericHints=0;
for(const s of all){
  if(s.hints && s.hints.some(h=> /Проверьте код|Запустите тесты|Посмотрите документацию/.test(h))) genericHints++;
}
console.log(`Generic hints (should be 0): ${genericHints}`);

// Save report
fs.writeFileSync("tools/solution_validation.json", JSON.stringify({total, completeSolutions, passing, failing: failing.length, multiFile, terminalSol, behaviorChecks, has3Hints, fakeMain}, null,2));
