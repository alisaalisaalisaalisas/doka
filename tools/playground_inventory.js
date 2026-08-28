#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const playgroundDir=path.join(__dirname,'../docs/21-playground');
const html=fs.readFileSync(path.join(playgroundDir,'playground.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(s=>s.startsWith('scenarios-'));
console.log(`Found ${scripts.length} scenario scripts in playground.html`);
global.window={SCENARIOS:[]};
function S(cat,id,title,level,brief,prompt,commands,solution,editor,extra){
  const o={cat,id,title,level,brief,prompt,commands,solution};
  if(editor){
    o.files=editor.files||null;
    o.editorFile=editor.file||editor.activeFile||null;
    o.editorStart=editor.start||editor.initialContent||null;
    o.editorChecks=editor.checks||null;
    o.hints=editor.hints||null;
    o.solutionDetail=editor.solution||editor.solutionDetail||null;
    o.solutionFiles=editor.solutionFiles||null;
    if(editor.activeFile && !o.editorFile) o.editorFile=editor.activeFile;
  }
  if(extra){
    if(extra.hints && !o.hints) o.hints=extra.hints;
    if(extra.solutionFiles && !o.solutionFiles) o.solutionFiles=extra.solutionFiles;
  }
  // handle S() extra hints passed as 10th arg via global extra variable? In playground.html S references `extra` variable from outer scope - but our S is called with 9 args, so we check global after
  window.SCENARIOS.push(o);
}
function S2(cat,id,title,level,brief,prompt,commands,solution,editorOpts){
  const o={cat,id,title,level,brief,prompt,commands,solution,
    files:editorOpts&&editorOpts.files||null,
    editorFile:editorOpts&&(editorOpts.activeFile||editorOpts.file)||null,
    editorStart:editorOpts&&(editorOpts.start||editorOpts.initialContent)||null,
    editorChecks:editorOpts&&editorOpts.checks||null,
    hints:editorOpts&&editorOpts.hints||null,
    solutionDetail:editorOpts&&(editorOpts.solution||editorOpts.solutionDetail)||null,
    solutionFiles:editorOpts&&editorOpts.solutionFiles||null,
  };
  window.SCENARIOS.push(o);
}
global.S=S; global.S2=S2;
let extra=undefined;
for(const src of scripts){
  const full=path.join(playgroundDir,src);
  if(!fs.existsSync(full)){ console.error(`MISSING FILE ${src}`); continue; }
  let code=fs.readFileSync(full,'utf8');
  // The original playground.html S function references a variable `extra` that is passed as 10th argument via something like S(..., editor, {hints:...})? Actually check - S definition accesses `extra` without param. Our version handles it if caller passes 10 args: the 10th becomes extra variable? But JS S only has 9 params, 10th is ignored. We need to capture if code does S(..., {...}, {...}) with 10 args. So we patch: eval with wrapper that maps 10th arg to global extra
  // Replace S( to call with extra detection: not needed, we intercept by redefining S to take ...args
  try{
    // Use vm to execute
    const vm=require('vm');
    // Wrap code to make S capture 10th arg
    // Redefine S inside vm context to capture all args
    const ctx=vm.createContext({S:(...args)=>{
        const [cat,id,title,level,brief,prompt,commands,solution,editor,x]=args;
        const o={cat,id,title,level,brief,prompt,commands,solution};
        if(editor){
          o.files=editor.files||null;
          o.editorFile=editor.file||editor.activeFile||null;
          o.editorStart=editor.start||editor.initialContent||null;
          o.editorChecks=editor.checks||null;
          o.hints=editor.hints||null;
          o.solutionDetail=editor.solution||editor.solutionDetail||null;
          o.solutionFiles=editor.solutionFiles||null;
        }
        if(x){
          if(x.hints && !o.hints) o.hints=x.hints;
          if(x.solutionFiles && !o.solutionFiles) o.solutionFiles=x.solutionFiles;
          if(x.solution && !o.solutionDetail) o.solutionDetail=x.solution;
        }
        // also handle editor may be null and hints in 9th position? etc
        if(!o.hints && editor && editor.hints) o.hints=editor.hints;
        window.SCENARIOS.push(o);
      }, S2: (...args)=>{
        const [cat,id,title,level,brief,prompt,commands,solution,editorOpts]=args;
        const o={cat,id,title,level,brief,prompt,commands,solution,
          files:editorOpts&&editorOpts.files||null,
          editorFile:editorOpts&&(editorOpts.activeFile||editorOpts.file)||null,
          editorStart:editorOpts&&(editorOpts.start||editorOpts.initialContent)||null,
          editorChecks:editorOpts&&editorOpts.checks||null,
          hints:editorOpts&&editorOpts.hints||null,
          solutionDetail:editorOpts&&(editorOpts.solution||editorOpts.solutionDetail)||null,
          solutionFiles:editorOpts&&editorOpts.solutionFiles||null,
        };
        window.SCENARIOS.push(o);
      }, window});
    vm.runInContext(code, ctx, {filename: src});
  }catch(e){
    console.error(`ERROR loading ${src}: ${e.message}`);
  }
}
const all=window.SCENARIOS;
console.log(`\nTOTAL SCENARIOS LOADED: ${all.length}`);

// duplicate IDs
const byId=new Map();
const dup=[];
for(const s of all){
  if(!byId.has(s.id)) byId.set(s.id, []);
  byId.get(s.id).push(s);
}
for(const [id,arr] of byId.entries()){
  if(arr.length>1) dup.push({id,count:arr.length, titles:arr.map(a=>a.title)});
}
console.log(`Unique IDs: ${byId.size}  Duplicates: ${dup.length}`);
if(dup.length) console.log(dup.slice(0,20));

// Inventory per category
const byCat={};
for(const s of all){ byCat[s.cat]=(byCat[s.cat]||0)+1 }
console.log("\nBy category:");
for(const [k,v] of Object.entries(byCat).sort((a,b)=>b[1]-a[1])) console.log(`  ${k}: ${v}`);

// Check missing fields
let missingBrief=0, missingPrompt=0, missingCommands=0, missingSolution=0, missingHints=0, missingChecks=0, missingFiles=0, missingActiveFile=0, missingSolutionFiles=0;
let genericContext=0, kubernetesContamination=0;
let hasFilesCount=0, hasSolutionFilesCount=0, hasHints3=0;
let terminalOnlyWithFakeFile=0;
let fsIssues=[];

for(const s of all){
  if(!s.brief) missingBrief++;
  if(!s.prompt) missingPrompt++;
  if(!s.commands || !s.commands.length) missingCommands++;
  if(!s.solution || !s.solution.length) missingSolution++;
  const hints=s.hints||[];
  if(!hints.length) missingHints++;
  else if(hints.length===3) hasHints3++;
  const checks=s.editorChecks||[];
  if(!checks.length) missingChecks++;
  const files=s.files;
  const hasFiles=files && Object.keys(files).length>0;
  if(hasFiles) hasFilesCount++;
  else missingFiles++;
  if(hasFiles && !s.editorFile) missingActiveFile++;
  if(s.solutionFiles && Object.keys(s.solutionFiles).length) hasSolutionFilesCount++; else missingSolutionFiles++;
  // generic context detection
  if(s.brief && /Kubernetes-кластере запущено приложение/.test(s.brief)) { genericContext++; }
  // k8s contamination: brief mentions k8s but category is not k8s/helm?
  if(s.brief && /Kubernetes/.test(s.brief) && !/k8s|helm|Kubernetes/i.test(s.cat)) {
    // check if it's actually a k8s task but category is linux/python etc - potential contamination
    // Count if cat is python, git, linux etc but brief has k8s template
    if(/В Kubernetes/.test(s.brief)) kubernetesContamination++;
  }
  // systemd fake file check
  if(s.brief && /systemd|systemctl/.test(s.brief) && hasFiles){
    // check if files contain main.py artificially
    if(files && files['main.py']) terminalOnlyWithFakeFile++;
  }
}

console.log(`\nHasFiles: ${hasFilesCount}  MissingFiles: ${missingFiles}`);
console.log(`HasSolutionFiles: ${hasSolutionFilesCount}  MissingSolutionFiles: ${missingSolutionFiles}`);
console.log(`MissingActiveFile: ${missingActiveFile}`);
console.log(`MissingBrief: ${missingBrief} MissingPrompt: ${missingPrompt} MissingCommands: ${missingCommands} MissingSolution: ${missingSolution} MissingHints: ${missingHints} MissingChecks: ${missingChecks}`);
console.log(`Has 3 hints: ${hasHints3}/${all.length}`);
console.log(`Generic context (Kubernetes template): ${genericContext}`);
console.log(`Kubernetes contamination (k8s context in non-k8s cat): ${kubernetesContamination}`);
console.log(`Terminal systemd tasks with fake main.py: ${terminalOnlyWithFakeFile}`);

// Detailed per scenario inventory (first 5 examples)
console.log(`\n--- SAMPLE INVENTORY (first 10) ---`);
for(let i=0;i<Math.min(10,all.length);i++){
  const s=all[i];
  console.log(`${s.id} | ${s.cat} | ${s.title} | level=${s.level} | hasBrief=${!!s.brief} hasFiles=${!!(s.files && Object.keys(s.files).length)} active=${s.editorFile||'NONE'} hints=${(s.hints||[]).length} solFiles=${s.solutionFiles?Object.keys(s.solutionFiles).length:0} checks=${(s.editorChecks||[]).length} cmds=${(s.commands||[]).length}`);
}

// Detect categories with missing files vs type
// For terminal tasks, hasFiles should be false; for code tasks should be true
// Check consistency: title/brief indicates systemd but files exist etc

// Find broken file references
let brokenFileRefs=0;
for(const s of all){
  if(s.editorFile && s.files && !s.files[s.editorFile]) brokenFileRefs++;
}
console.log(`\nBroken file references (activeFile not in files): ${brokenFileRefs}`);

// Check level distribution
const byLevel={};
for(const s of all) byLevel[s.level]=(byLevel[s.level]||0)+1
console.log("\nBy level:", byLevel);

// Save JSON inventory for further tools
fs.writeFileSync(path.join(__dirname,'inventory_report.json'), JSON.stringify({
  total: all.length,
  uniqueIds: byId.size,
  duplicates: dup,
  byCategory: byCat,
  stats: {hasFilesCount, missingFiles, hasSolutionFilesCount, missingSolutionFiles, missingActiveFile, missingBrief, missingPrompt, missingCommands, missingSolution, missingHints, missingChecks, hasHints3, genericContext, kubernetesContamination, terminalOnlyWithFakeFile, brokenFileRefs, byLevel}
}, null, 2));
console.log("\nReport saved to tools/inventory_report.json");
