import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {validateReadingGuide,readingGuideHTML} from '../src/reading-guide.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const topics=['shape-grammar','set-theory','group-theory','monster-moonshine','bridges'];
const ids=[],records=new Map();
for(const topic of topics)for(const file of await readdir(path.join(root,'Reference',topic,'metadata')))if(file.endsWith('.json')){const id=file.slice(0,-5);ids.push(id);records.set(id,JSON.parse(await readFile(path.join(root,'Reference',topic,'metadata',file),'utf8')));}
const levels={},failures=[];
for(const id of ids){try{
  const guide=validateReadingGuide(JSON.parse(await readFile(path.join(root,'Reference/reading-guides',`${id}.json`),'utf8')),id);
  if(records.get(id).verification.content_review!==guide.review.level)throw new Error('Canonical metadata and reading scope disagree.');
  const html=readingGuideHTML(guide),targets=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(targets.length!==new Set(targets).size)throw new Error('Duplicate reading target.');
  for(const match of html.matchAll(/data-reading-anchor="([^"]+)"/g))if(!targets.includes(match[1]))throw new Error(`Unresolved reading jump ${match[1]}.`);
  levels[guide.review.level]=(levels[guide.review.level]??0)+1;
}catch(error){failures.push(`${id}: ${error.message}`);}}
for(const file of await readdir(path.join(root,'Reference/reading-guides')))if(file.endsWith('.json')&&!ids.includes(file.slice(0,-5)))failures.push(`Unknown source guide: ${file}`);
if(failures.length)throw new Error(failures.join('\n'));
console.log(`PASS: ${ids.length} source reading guides; valid review scopes, primary links, section citations and reading paths. ${JSON.stringify(levels)}`);
