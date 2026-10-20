import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {EXPERIMENT_IDS,defaultState,evaluateExperiment} from '../src/experiments/model.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const folder=process.argv.includes('--dist')?path.join(root,'dist'):root;
const read=async file=>JSON.parse(await readFile(path.join(folder,file),'utf8'));
const experiments=await read('data/experiments.json'),sources=new Set(await read('data/source-ids.json'));
const ids=new Set(),linked=new Set();
for(const ex of experiments){
  if(ids.has(ex.id)||!EXPERIMENT_IDS.includes(ex.id))throw new Error(`Unknown or duplicate experiment: ${ex.id}`);
  ids.add(ex.id);
  for(const key of ['title','question','intro','notice','scope'])if(typeof ex[key]!=='string'||!ex[key].trim())throw new Error(`Missing ${key}: ${ex.id}`);
  if(!['shape-grammar','set-theory','group-theory'].includes(ex.topic)||!Array.isArray(ex.try_it)||ex.try_it.length<2||ex.try_it.some(s=>typeof s!=='string'||!s.trim()))throw new Error(`Invalid experiment prompts/topic: ${ex.id}`);
  if(ex.lab_example&&!['emergence','ambiguity','crossing'].includes(ex.lab_example))throw new Error(`Unknown lab example: ${ex.id}`);
  if(!ex.sources?.length||new Set(ex.sources.map(s=>s.id)).size!==ex.sources.length)throw new Error(`Missing or repeated source links: ${ex.id}`);
  for(const source of ex.sources){
    if(!sources.has(source.id)||!['concept','reading-prompt'].includes(source.role)||!source.connection?.trim())throw new Error(`Invalid source connection: ${ex.id}`);
    const guide=await read(`Reference/reading-guides/${source.id}.json`),passage=guide.review.evidence[source.evidence];
    if(!Number.isInteger(source.evidence)||!passage||source.url!==passage.url||source.locator!==passage.locator||new URL(source.url).protocol!=='https:')throw new Error(`Unresolved source passage: ${ex.id}/${source.id}`);
    if(!['full-text','selected-sections'].includes(guide.review.level)&&source.role!=='reading-prompt')throw new Error(`Limited source must be labelled as a reading prompt: ${source.id}`);
    linked.add(source.id);
  }
  evaluateExperiment(ex.id,defaultState(ex.id));
}
if(ids.size!==EXPERIMENT_IDS.length)throw new Error('An interactive model has no catalogue entry.');
console.log(`PASS: ${ids.size} interactive experiments; ${linked.size} source guides; exact passage connections, honest review scopes and working default models${folder!==root?'; production distribution':''}.`);
