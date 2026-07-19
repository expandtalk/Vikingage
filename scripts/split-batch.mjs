import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
const per = parseInt(process.argv[3] || '80', 10);
const sql = readFileSync(file, 'utf8');
const head = sql.slice(0, sql.indexOf('from (values') + 'from (values'.length);
const tailStart = sql.indexOf('\n) as v(');
const tail = sql.slice(tailStart);
const body = sql.slice(head.length, tailStart);
// split tuples top-level — förstår både '..''..'-strängar och $tag$...$tag$-dollarcitering
let depth=0, tStart=-1; const tuples=[];
for(let i=0;i<body.length;i++){const ch=body[i];
  if(ch==="'"){ i++; while(i<body.length){ if(body[i]==="'"){ if(body[i+1]==="'"){i++;}else break; } i++; } continue; }
  if(ch==='$'){ const m=body.slice(i,i+20).match(/^\$([A-Za-z]*)\$/); if(m){ const close=m[0]; const end=body.indexOf(close,i+close.length); i = end<0?body.length:end+close.length-1; continue; } }
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
