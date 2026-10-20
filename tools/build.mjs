import {readFile,writeFile,mkdir,rm,readdir,copyFile,stat,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),dist=path.join(root,'dist');
execFileSync('python3',['Reference/tools/library.py','validate'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['tools/check-readings.mjs'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['tools/check-experiments.mjs'],{cwd:root,stdio:'inherit'});
const sourceFiles=(await readdir(path.join(root,'Reference'),{withFileTypes:true})).filter(e=>e.isDirectory());
const records=[];
for(const topic of sourceFiles){const folder=path.join(root,'Reference',topic.name,'metadata');try{for(const name of await readdir(folder))if(name.endsWith('.json'))records.push(JSON.parse(await readFile(path.join(folder,name),'utf8')));}catch(error){if(error.code!=='ENOENT')throw error;}}
records.sort((a,b)=>a.id.localeCompare(b.id));
const keys=['id','topic','title','authors','year','doi','reading_url','stable_url','tags','relevance','license_redistribution','local_files','locators','verification','pages','venue','publication_type','editors','contributors','contributor_roles','edition_version','annotation_file'];
const compact=[];
for(const d of records){const guide=JSON.parse(await readFile(path.join(root,'Reference/reading-guides',`${d.id}.json`),'utf8'));const overview=guide.sections.find(s=>s.id==='overview').text;const preview=overview.length>180?overview.slice(0,177).replace(/\s+\S*$/,'')+'…':overview;compact.push({...Object.fromEntries(keys.map(k=>[k,d[k]??null])),reading_guide:{level:guide.review.level,kind:guide.kind,preview}});}
await writeFile(path.join(root,'data/references.json'),JSON.stringify(compact)+'\n');
await writeFile(path.join(root,'data/source-ids.json'),JSON.stringify(records.map(d=>d.id))+'\n');
try{await access(dist);await access(path.join(dist,'.shapegrammar-build.json'));await rm(dist,{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;if(await stat(dist).catch(()=>null))throw new Error('Refusing to overwrite an existing unmarked dist folder.');}
await mkdir(dist,{recursive:true});
const files=['index.html','lab.html'];
const localOnly=name=>/^(AGENTS|CLAUDE|GEMINI|SKILL)/i.test(name)||/\.(agent|instructions|prompt|chatmode)\.md$/i.test(name)||/agent-prompt|agent-instructions|VSCODE_TERMINAL|ShapeGrammar-(workspace|study|derivation)/i.test(name);
async function collect(folder){for(const entry of await readdir(path.join(root,folder),{withFileTypes:true})){if(entry.name.startsWith('.')||localOnly(entry.name))continue;const rel=path.posix.join(folder,entry.name);if(entry.isDirectory())await collect(rel);else if(/\.(mjs|css|json|svg|md)$/.test(entry.name))files.push(rel);else throw new Error(`Unreviewed public asset: ${rel}`);}}
for(const folder of ['src','data','docs'])await collect(folder);
for(const rel of (await readFile(path.join(root,'Reference/PUBLIC_FILES.txt'),'utf8')).trim().split('\n')){if(!rel.startsWith('Reference/')||rel.includes('..')||localOnly(path.basename(rel)))throw new Error(`Unsafe reference path: ${rel}`);files.push(rel);}
let bytes=0;
for(const rel of [...new Set(files)]){const dest=path.join(dist,rel);await mkdir(path.dirname(dest),{recursive:true});await copyFile(path.join(root,rel),dest);bytes+=(await stat(dest)).size;}
await writeFile(path.join(dist,'.nojekyll'),'');
const lessons=JSON.parse(await readFile(path.join(root,'data/lessons.json'),'utf8'));
const report={version:'1.0.0',lessons:lessons.length,sources:records.length,publicFiles:new Set(files).size+2,publicPaths:[...new Set([...files,'.nojekyll','.shapegrammar-build.json'])].sort(),bytesWithoutBuildManifest:bytes,excluded:['Git metadata','local prompts/instructions','private workspace/study downloads','unregistered originals']};
await writeFile(path.join(dist,'.shapegrammar-build.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,publicPaths:undefined},null,2));
