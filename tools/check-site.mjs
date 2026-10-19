import {readFile,stat,readdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const lessons=JSON.parse(await readFile(path.join(root,'data/lessons.json'),'utf8'));
const lessonIDs=new Set(lessons.map(l=>l.id)),tracks=new Set(lessons.map(l=>l.track));
const sources=JSON.parse(await readFile(path.join(root,'data/source-ids.json'),'utf8')),sourceIDs=new Set(sources);
const research=JSON.parse(await readFile(path.join(root,'data/research.json'),'utf8')),researchIDs=new Set(research.map(r=>r.id));
const refs=JSON.parse(await readFile(path.join(root,'data/references.json'),'utf8'));
if(lessonIDs.size!==34||refs.length!==sourceIDs.size)throw new Error('Content counts disagree.');
for(const l of lessons)for(const s of l.sources)if(!sourceIDs.has(s.id))throw new Error(`Unknown source ${s.id}`);
const failures=[];let checked=0;
function route(value){const [pathname]=value.slice(1).split('?'),[kind,id]=pathname.split('/').filter(Boolean);return !kind||({course:tracks,lesson:lessonIDs,source:sourceIDs,research:researchIDs}[kind]?.has(id))||(!id&&['references','research','glossary','notebook','help'].includes(kind));}
async function check(target,from){target=target.replace(/^<|>$/g,'');if(/^[a-zA-Z][\w+.-]*:/.test(target)||target.startsWith('//'))return;if(target.startsWith('#/')){if(!route(target))failures.push(`${from}: invalid app route ${target}`);return;}const [base]=target.split('#');if(!base)return;const rel=decodeURIComponent(base.split('?')[0]);const absolute=path.resolve(path.dirname(path.join(root,from)),rel);if(!absolute.startsWith(root))return;checked++;if(!await stat(absolute).catch(()=>null))failures.push(`${from}: missing ${target}`);}
const docs=(await readdir(path.join(root,'docs'))).filter(x=>x.endsWith('.md')).map(x=>`docs/${x}`);
const manifest=(await readFile(path.join(root,'Reference/PUBLIC_FILES.txt'),'utf8')).trim().split('\n');
for(const name of ['README.md',...docs,...manifest.filter(x=>x.endsWith('.md'))]){const text=await readFile(path.join(root,name),'utf8');for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g))await check(match[1],name);}
for(const name of ['index.html','lab.html']){const text=await readFile(path.join(root,name),'utf8');const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(ids.length!==new Set(ids).size)failures.push(`${name}: duplicate element IDs`);for(const match of text.matchAll(/(?:href|src)="([^"]+)"/g))await check(match[1].replaceAll('&amp;','&'),name);}
for(const d of refs)for(const f of d.local_files)await check(`./Reference/${f.path}`,'index.html');
if(manifest.some(x=>/ShapeGrammar-(study|workspace|derivation).*\.json|agent-prompt|VSCODE_TERMINAL/i.test(x)))failures.push('Local-only file in reference manifest.');
if(process.argv.includes('--dist')){
  const dist=path.join(root,'dist');
  const declared=JSON.parse(await readFile(path.join(dist,'.shapegrammar-build.json'),'utf8'));
  const expected=new Set(declared.publicPaths),observed=new Set();
  async function scan(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const absolute=path.join(folder,entry.name);if(entry.name==='.DS_Store'&&entry.isFile()){
      // Finder can add folder metadata after a clean build; never upload it.
      await rm(absolute);continue;
    }if(entry.name==='.git'||/agent-prompt|VSCODE_TERMINAL|ShapeGrammar-(study|workspace|derivation)/i.test(entry.name))failures.push(`Private file in distribution: ${entry.name}`);if(entry.isDirectory())await scan(absolute);else{const rel=path.relative(dist,absolute).split(path.sep).join('/');observed.add(rel);if(!expected.has(rel))failures.push(`Undeclared distribution file: ${rel}`);}}}
  await scan(dist);
  for(const rel of expected)if(!observed.has(rel))failures.push(`Missing declared distribution file: ${rel}`);
  if(declared.publicFiles!==observed.size)failures.push('Distribution file count differs from build manifest.');
  if(await stat(path.join(dist,'Reference/1980-Stiny_Introduction to shape and shape grammars.pdf')).catch(()=>null))failures.push('Unregistered pre-existing PDF in distribution.');
  for(const file of ['index.html','lab.html','src/search-worker.mjs','data/lessons.json','.nojekyll'])if(!await stat(path.join(dist,file)).catch(()=>null))failures.push(`Missing distribution file ${file}`);
  execFileSync('python3',[path.join(dist,'Reference/tools/library.py'),'validate'],{cwd:dist,stdio:'inherit'});
}
if(failures.length)throw new Error(failures.join('\n'));
console.log(`PASS: ${checked} local targets; 34 lessons; ${sources.length} sources; private-file boundaries${process.argv.includes('--dist')?'; production distribution':''}.`);
