import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
const per = parseInt(process.argv[3] || '80', 10);
const sql = readFileSync(file, 'utf8');
const head = sql.slice(0, sql.indexOf('from (values') + 'from (values'.length);
const tailStart = sql.indexOf('\n) as v(');
const tail = sql.slice(tailStart);
const body = sql.slice(head.length, tailStart);
// split tuples top-level
let inStr=false, depth=0, tStart=-1; const tuples=[];
for(let i=0;i<body.length;i++){const ch=body[i];
  if(inStr){if(ch==="'"){if(body[i+1]==="'"){i++;continue;}inStr=false;}continue;}
  if(ch==="'"){inStr=true;continue;}
  if(ch==='('){if(depth===0)tStart=i;depth++;continue;}
  if(ch===')'){depth--;if(depth===0)tuples.push(body.slice(tStart,i+1));continue;}
}
const base = file.replace(/\.sql$/,'');
let part=0;
for(let i=0;i<tuples.length;i+=per){
  part++;
  const chunk=tuples.slice(i,i+per).join(',\n');
  writeFileSync(`${base}-p${part}.sql`, head+'\n'+chunk+tail);
}
console.log(`${tuples.length} tuples -> ${part} delfiler (${per}/st)`);
