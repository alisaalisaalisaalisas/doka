const fs=require('fs');
const files=['docs/21-playground/scenarios-base.js','docs/21-playground/scenarios-mlops.js'];
for(const f of files){
  const txt=fs.readFileSync(f,'utf8');
  console.log('===',f,'===');
  // extract S calls with files
  const re=/S\("([^"]+)","([^"]+)","([^"]+)".*?files:\s*\{([\s\S]*?)\}\s*,/g;
  let m;
  while((m=re.exec(txt))!==null){
    console.log(`ID ${m[2]} cat ${m[1]} title ${m[3]}`);
    console.log(m[4].slice(0,800));
    console.log('---');
  }
}
