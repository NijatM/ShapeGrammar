import {performance} from 'node:perf_hooks';
import {writeFile} from 'node:fs/promises';
import {findMatches,domain} from '../src/engine/core.mjs';
const line=(a,b,c,d)=>[[a,b],[c,d]],rule={left:[line(0,0,2,0)],right:[line(0,0,2,0),line(1,0,1,1)]};
const scenarios=[['Default finite menu',[line(0,0,6,0),line(3,-3,3,3)],{}],['50,000-candidate empty-host stress',[],{xMin:-25,xMax:25,yMin:-25,yMax:25}],['Dense mixed-carrier host',Array.from({length:15},(_,i)=>line(-8,i-7,8,i-7)).concat(Array.from({length:15},(_,i)=>line(i-7,-8,i-7,8))),{xMin:-10,xMax:10,yMin:-10,yMax:10}]];
const rows=[];
for(const [name,host,config] of scenarios){const started=performance.now();const r=await findMatches(rule,host,config,{maxCandidates:50000,maxMatches:2000,batchSize:256,maxDurationMs:8000});rows.push({name,domain:String(domain(config).total),checked:r.checked,witnesses:r.matches.length,complete:r.complete,reason:r.reason,ms:Math.round((performance.now()-started)*10)/10});}
await writeFile(new URL('../docs/performance-results.json',import.meta.url),JSON.stringify({runtime:process.version,platform:process.platform,architecture:process.arch,scenarios:rows},null,2)+'\n');
console.log(JSON.stringify(rows,null,2));
