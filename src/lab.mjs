import { D4, q, rule, sum, domain, serializeDomain, serializeShape, transformShape,
  serializeTransform, validateAlignment, applyRule, Derivation } from './engine/core.mjs';
import { encodeWorkspace, decodeWorkspace, saveWorkspace, restoreWorkspace, checkShape, LIMITS } from './workspace.mjs';
import {searchResponsive} from './search-client.mjs';

const $ = id => document.getElementById(id);
const seg = (x0,y0,x1,y1) => [[x0,y0],[x1,y1]];
const stem = { left:[seg(0,0,2,0)], right:[seg(0,0,2,0),seg(1,0,1,1)] };
const examples = {
  emergence:{host:[seg(0,0,3,0),seg(3,0,6,0)],rule:stem,xMax:6,
    text:'Two strokes meet at x = 3. The rule can find a part across that earlier boundary. The shape keeps the line, rather than a fixed list of strokes.'},
  ambiguity:{host:[seg(0,0,2,0)],rule:stem,xMax:0,
    text:'Identity and reflection find the same horizontal part. Their added stems point in different directions. Choose each transformation to compare the consequences.'},
  crossing:{host:[seg(-3,0,3,0),seg(0,-3,0,3)],rule:{left:[seg(0,0,1,0)],right:[]},xMax:3,xMin:-3,yMin:-3,yMax:3,
    text:'The rule removes a line segment. The crossing point is not itself a one-dimensional line part; deleting a horizontal part does not cut the vertical line.'}
};
let session, currentRule, config, active=null, matches=[], busy=false, controller=null, drawing=false, pending=null;
let ruleDraft, ruleDrawing=false, rulePending=null;
let view={x:-2,y:-5,w:12,h:9};
const ns='http://www.w3.org/2000/svg';
function svgNode(name,attrs){const node=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));return node;}
function lines(parent,shape,cls){for(const [a,b] of shape)parent.append(svgNode('line',{x1:q(a[0]).toNumber(),y1:-q(a[1]).toNumber(),x2:q(b[0]).toNumber(),y2:-q(b[1]).toNumber(),class:cls}));}
function bounds(shapes){const pts=shapes.flatMap(s=>s.flatMap(x=>x)).map(p=>[q(p[0]).toNumber(),-q(p[1]).toNumber()]);if(!pts.length)return{x:-2,y:-5,w:12,h:9};const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const x=Math.min(...xs)-1,y=Math.min(...ys)-1;return{x,y,w:Math.max(3,Math.max(...xs)-x+1),h:Math.max(3,Math.max(...ys)-y+1)};}
function draw(){
  const svg=$('canvas');svg.replaceChildren();svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);svg.classList.toggle('drawing',drawing);
  const spacing=Math.max(1,Math.ceil(Math.max(view.w,view.h)/50));
  for(let i=0,start=Math.ceil(view.x/spacing)*spacing;i<52;i++){const x=start+i*spacing;if(x>view.x+view.w)break;svg.append(svgNode('line',{x1:x,y1:view.y,x2:x,y2:view.y+view.h,class:x===0?'axis':'grid-line'}));}
  for(let i=0,start=Math.ceil(view.y/spacing)*spacing;i<52;i++){const y=start+i*spacing;if(y>view.y+view.h)break;svg.append(svgNode('line',{x1:view.x,y1:y,x2:view.x+view.w,y2:y,class:y===0?'axis':'grid-line'}));}
  lines(svg,session.current,'shape-line');if(active){lines(svg,active.region,'match-line');if(active.valid)lines(svg,active.result,'result-line');}
  if(pending)svg.append(svgNode('circle',{cx:pending[0],cy:-pending[1],r:.06,fill:'currentColor'}));
  $('history').textContent=`Step ${session.cursor} / ${session.length} · ${session.current.length} maximal line${session.current.length===1?'':'s'}`;
  for(const [id,shape] of [['left-preview',ruleDraft?.left??currentRule.left],['right-preview',ruleDraft?.right??currentRule.right]]){const p=$(id);p.replaceChildren();const b=bounds([ruleDraft?.left??currentRule.left,ruleDraft?.right??currentRule.right]);p.setAttribute('viewBox',`${b.x} ${b.y} ${b.w} ${b.h}`);lines(p,shape,'rule-line');}
  controls(); renderHistory();
}
function controls(){
  document.querySelectorAll('button,input,select,textarea,fieldset').forEach(el=>{el.disabled=busy;});
  $('cancel').disabled=!busy;$('undo').disabled=busy||!session.cursor;$('redo').disabled=busy||session.cursor===session.length;
  $('witness').disabled=busy||!matches.length;$('apply').disabled=busy||!active?.valid;
  $('draw').disabled=busy||session.length>0;$('draw').setAttribute('aria-pressed',String(drawing));
  $('line-form').querySelectorAll('input,button').forEach(el=>{el.disabled=busy||session.length>0;});
}
function message(text){$('status').textContent=text;}
function quantity(value,noun){return `${value} ${noun}${String(value)==='1'?'':'s'}`;}
function clearMatches(){matches=[];active=null;pending=null;$('witness').replaceChildren(new Option('Find parts to begin',''));$('counts').textContent='';}
function draftChanged(){return JSON.stringify(ruleDraft)!==JSON.stringify({left:serializeShape(currentRule.left),right:serializeShape(currentRule.right)});}
function readDomain(){return domain({xMin:$('xmin').value.trim(),xMax:$('xmax').value.trim(),yMin:$('ymin').value.trim(),yMax:$('ymax').value.trim(),step:$('step').value.trim(),scales:$('scales').value.split(',').map(x=>x.trim()),orientations:[...$('orientations').querySelectorAll('input:checked')].map(el=>el.value)});}
function showDomain(){const d=readDomain();$('domain-count').textContent=`${quantity(d.total.toLocaleString(),'transformation')} · ${quantity(d.orientations.length,'orientation')}. Limits: 50,000 candidates / 2,000 witnesses / 8 seconds.`;return d;}
function guarded(action){try{action();}catch(error){message(error.message);}}
function selectWitness(index){const m=matches[index];if(!m)return;active={...m,valid:true};const t=serializeTransform(m.transform);$('orientation').value=t.orientation;$('manual-scale').value=t.scale;$('tx').value=t.translation[0];$('ty').value=t.translation[1];draw();}
async function search(){
  if(draftChanged()){message('The rule preview has unactivated edits. Choose Use this rule before searching.');return;}
  try{const next=showDomain();if(JSON.stringify(serializeDomain(next))!==JSON.stringify(serializeDomain(config))){config=next;session=new Derivation(session.current,config);}}
  catch(error){message(error.message);return;}
  clearMatches();drawing=false;controller=new AbortController();busy=true;draw();message('Looking for parts…');
  try{
    const result=await searchResponsive(currentRule,session.current,config,{signal:controller.signal,maxCandidates:50000,maxMatches:2000,maxDurationMs:8000,batchSize:256,onProgress:p=>message(`Checked ${p.checked.toLocaleString()} of ${p.total} transformations…`)});
    matches=[...result.matches];$('witness').replaceChildren();
    matches.forEach((m,i)=>{const t=serializeTransform(m.transform);$('witness').add(new Option(`${i+1}. ${t.orientation} · scale ${t.scale} · shift (${t.translation.join(', ')})`,String(i)));});
    if(!matches.length)$('witness').add(new Option('No matching transformations',''));
    const reason={'cancelled':'Search cancelled (intermediate witnesses discarded)','candidate-limit':'Candidate limit reached','match-limit':'Witness limit reached','duration-limit':'Eight-second time limit reached'}[result.reason];
    message(result.complete?`Complete: checked all ${quantity(result.total,'transformation')}.${matches.length?'':' No matching part in this domain.'}`:`${reason||'Search incomplete'}: partial results only (${result.checked} checked).`);
    $('counts').textContent=`${quantity(result.transformationCount,'transformation')} · ${quantity(result.regionCount,'distinct part')} · ${quantity(result.resultCount,'distinct result')}`;
    if(matches.length)selectWitness(0);
  }catch(error){message(error.message);}finally{busy=false;controller=null;draw();}
}
function loadExample(key){$('example').value=key;const e=examples[key];currentRule=rule(e.rule);config=domain({xMin:e.xMin??0,xMax:e.xMax,yMin:e.yMin??0,yMax:e.yMax??0,scales:[1]});session=new Derivation(e.host,config);for(const [id,key] of [['xmin','xMin'],['xmax','xMax'],['ymin','yMin'],['ymax','yMax'],['step','step']])$(id).value=String(config[key]);ruleDraft={left:serializeShape(currentRule.left),right:serializeShape(currentRule.right)};rulePending=null;$('scales').value='1';$('orientations').querySelectorAll('input').forEach(el=>{el.checked=true;});$('left').value=JSON.stringify(serializeShape(currentRule.left));$('right').value=JSON.stringify(serializeShape(currentRule.right));$('explanation').textContent=e.text;drawing=false;clearMatches();view=bounds([session.current,currentRule.right]);showDomain();draw();search();}
for(const name of Object.keys(D4)){
  $('orientation').add(new Option(name,name));
  const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=name;input.checked=true;label.append(input,document.createTextNode(name));$('orientations').append(label);
}
$('orientations').addEventListener('change',()=>{clearMatches();draw();guarded(()=>{showDomain();message('Orientations changed. Find parts again to start a derivation with this domain.');});});
$('example').addEventListener('change',()=>loadExample($('example').value));
$('domain-form').addEventListener('submit',event=>{event.preventDefault();search();});
for(const id of ['xmin','xmax','ymin','ymax','step','scales'])$(id).addEventListener('input',()=>{clearMatches();draw();guarded(()=>{showDomain();message('Search settings changed. Find parts again. Changing the domain starts a new derivation from this shape.');});});
$('cancel').addEventListener('click',()=>controller?.abort());
$('witness').addEventListener('change',()=>selectWitness(Number($('witness').value)));
$('apply').addEventListener('click',()=>guarded(()=>{if(!active?.valid||busy)return;if(session.cursor>=LIMITS.steps)throw new Error('This workspace supports 200 steps. Export it and start a new drawing to continue.');checkShape(serializeShape(active.result));session.apply(currentRule,active.transform);clearMatches();drawing=false;message('Rule applied. Find parts in the new shape, or undo this step.');draw();}));
for(const id of ['orientation','manual-scale','tx','ty'])$(id).addEventListener('input',()=>{active=null;message('Check the edited alignment before applying it.');draw();});
for(const action of ['undo','redo'])$(action).addEventListener('click',()=>{session[action]();clearMatches();message(action==='undo'?'Returned to the previous shape.':'Restored the next shape.');draw();});
$('fit').addEventListener('click',()=>{view=bounds([session.current,...(active?[active.region,active.result??[]]:[])]);draw();});
$('new').addEventListener('click',()=>guarded(()=>{config=readDomain();session=new Derivation([],config);clearMatches();drawing=true;message('New empty drawing. Add a line with two clicks or the coordinate fields.');draw();}));
$('draw').addEventListener('click',()=>{drawing=!drawing;pending=null;message(drawing?'Click two integer grid points. Coordinate fields also accept fractions.':'Drawing tool off.');draw();});
function addLine(a,b){if(busy||session.length)return;const shape=sum(session.current,[seg(...a,...b)]);checkShape(serializeShape(shape));session=new Derivation(shape,config);clearMatches();message('Line added. Find parts when your drawing is ready.');draw();}
$('line-form').addEventListener('submit',event=>{event.preventDefault();guarded(()=>{const data=new FormData(event.currentTarget);addLine([data.get('x0').trim(),data.get('y0').trim()],[data.get('x1').trim(),data.get('y1').trim()]);});});
$('canvas').addEventListener('click',event=>{if(!drawing||busy||session.length)return;guarded(()=>{const p=new DOMPoint(event.clientX,event.clientY).matrixTransform($('canvas').getScreenCTM().inverse());const next=[Math.round(p.x),Math.round(-p.y)];if(!pending){pending=next;draw();}else addLine(pending,next);});});
$('rule-form').addEventListener('submit',event=>{event.preventDefault();guarded(()=>{const left=JSON.parse($('left').value),right=JSON.parse($('right').value);if(left.length>128||right.length>128)throw new Error('Use at most 128 segments per side.');const candidateRule=rule({left,right});checkShape(serializeShape(candidateRule.left));checkShape(serializeShape(candidateRule.right));currentRule=candidateRule;ruleDraft={left:serializeShape(currentRule.left),right:serializeShape(currentRule.right)};clearMatches();message('Rule updated. Find parts again.');draw();});});
$('manual-form').addEventListener('submit',event=>{event.preventDefault();guarded(()=>{if(draftChanged())throw new Error('Choose Use this rule to activate the preview before checking an alignment.');const d=readDomain();if(JSON.stringify(serializeDomain(d))!==JSON.stringify(serializeDomain(config)))throw new Error('Find parts once to use the changed search settings.');const t={orientation:$('orientation').value,scale:$('manual-scale').value.trim(),translation:[$('tx').value.trim(),$('ty').value.trim()]};const check=validateAlignment(currentRule,session.current,t,config);active={...check,transform:t,region:transformShape(currentRule.left,t),result:check.valid?applyRule(currentRule,session.current,t,config):null};message(check.valid?'Valid alignment. You can apply this transformation.':check.reason==='unsupported-transform'?'This transformation is outside the declared search menu.':'The aligned left side is not part of this shape.');draw();});});
function workspaceMessage(text){$('workspace-status').textContent=text;}
function workspaceAction(action){try{action();}catch(error){workspaceMessage(`Could not complete: ${error.message} The open workspace is unchanged.`);}}
function installWorkspace(decoded){
  const next=decoded.session.export();
  session=decoded.session;config=domain(next.domain);if(decoded.rule)currentRule=decoded.rule;ruleDraft={left:serializeShape(currentRule.left),right:serializeShape(currentRule.right)};rulePending=null;
  for(const [id,key] of [['xmin','xMin'],['xmax','xMax'],['ymin','yMin'],['ymax','yMax'],['step','step']])$(id).value=String(config[key]);
  $('scales').value=config.scales.map(String).join(',');
  $('orientations').querySelectorAll('input').forEach(el=>{el.checked=config.orientations.includes(el.value);});
  $('left').value=JSON.stringify(serializeShape(currentRule.left));$('right').value=JSON.stringify(serializeShape(currentRule.right));
  $('example').value='';$('explanation').textContent='Restored workspace. Find parts to continue the derivation.';
  drawing=false;clearMatches();view=bounds([session.current,currentRule.right]);showDomain();draw();message('Workspace restored; undo/redo history is retained.');
  workspaceMessage(decoded.legacy&&!decoded.rule?'Imported a legacy derivation without a rule history; the current rule editor was retained.':'Workspace restored. The saved copy is unchanged until you save again.');
}
$('save').addEventListener('click',()=>workspaceAction(()=>{saveWorkspace(window.localStorage,encodeWorkspace(session,currentRule));workspaceMessage('Saved on this browser. Your drawing, rule and history can be restored here.');}));
$('restore').addEventListener('click',()=>workspaceAction(()=>installWorkspace(restoreWorkspace(window.localStorage))));
$('import').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file||busy)return;
  busy=true;controls();workspaceMessage('Checking file and replaying its derivation…');
  try{if(file.size>LIMITS.bytes)throw new Error('Files must be no larger than 1 MiB.');const decoded=decodeWorkspace(await file.text());installWorkspace(decoded);}
  catch(error){workspaceMessage(`Import failed: ${error.message} The open workspace is unchanged.`);}
  finally{event.target.value='';busy=false;draw();}
});
$('export').addEventListener('click',()=>workspaceAction(()=>{const text=encodeWorkspace(session,currentRule);const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ShapeGrammar-workspace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);workspaceMessage('Workspace download prepared, including the selected rule and undo/redo history.');}));
function renderHistory(){
  const list=$('history-list'),data=session.export();list.replaceChildren();
  const start=document.createElement('li'),initial=document.createElement('button');initial.type='button';initial.textContent='0 / initial shape';initial.disabled=busy||session.cursor===0;initial.onclick=()=>jump(0);start.append(initial);list.append(start);
  data.steps.forEach((step,index)=>{const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=`${index+1} / ${step.transform.orientation}, scale ${step.transform.scale}, shift (${step.transform.translation.join(', ')})`;button.disabled=busy||session.cursor===index+1;button.onclick=()=>jump(index+1);li.append(button);list.append(li);});
}
function jump(cursor){while(session.cursor>cursor)session.undo();while(session.cursor<cursor)session.redo();clearMatches();message(`Returned to step ${cursor}.`);draw();}
for(const [id,dx,dy] of [['pan-left',-.25,0],['pan-right',.25,0],['pan-up',0,-.25],['pan-down',0,.25]])$(id).onclick=()=>{view={...view,x:view.x+view.w*dx,y:view.y+view.h*dy};draw();};
for(const [id,factor] of [['zoom-in',.75],['zoom-out',4/3]])$(id).onclick=()=>{const w=view.w*factor,h=view.h*factor;if(w<.001||w>1e8)return;view={x:view.x+(view.w-w)/2,y:view.y+(view.h-h)/2,w,h};draw();};
$('canvas').addEventListener('pointermove',event=>{const matrix=$('canvas').getScreenCTM();if(!matrix)return;const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());$('pointer-coordinates').textContent=`(${Math.round(p.x)}, ${Math.round(-p.y)})`;});
function editRule(side,a,b){const next=serializeShape(sum(ruleDraft[side],[seg(...a,...b)]));checkShape(next);ruleDraft[side]=next;syncDraft();}
function syncDraft(){rulePending=null;$('left').value=JSON.stringify(ruleDraft.left);$('right').value=JSON.stringify(ruleDraft.right);clearMatches();message('Rule draft changed. Choose Use this rule to activate it.');draw();}
$('rule-draw').onclick=()=>{ruleDrawing=!ruleDrawing;rulePending=null;$('rule-draw').setAttribute('aria-pressed',String(ruleDrawing));message(ruleDrawing?'Click two half-grid points in either rule preview.':'Rule drawing off.');};
for(const [id,side] of [['left-preview','left'],['right-preview','right']])$(id).addEventListener('click',event=>{if(!ruleDrawing||busy)return;guarded(()=>{const p=new DOMPoint(event.clientX,event.clientY).matrixTransform($(id).getScreenCTM().inverse()),point=[String(q(Math.round(p.x*2)).div(2)),String(q(Math.round(-p.y*2)).div(2))];if(!rulePending||rulePending.side!==side){rulePending={side,point};message('First rule point selected. Click the second point.');}else editRule(side,rulePending.point,point);});});
$('rule-line-form').addEventListener('submit',event=>{event.preventDefault();guarded(()=>editRule($('rule-side').value,[$('rule-x0').value.trim(),$('rule-y0').value.trim()],[$('rule-x1').value.trim(),$('rule-y1').value.trim()]));});
for(const [id,side] of [['clear-left','left'],['clear-right','right']])$(id).onclick=()=>{ruleDraft[side]=[];syncDraft();};
$('activate-rule').onclick=()=>$('rule-form').requestSubmit();

const requested=new URLSearchParams(location.search).get('example');
loadExample(Object.hasOwn(examples,requested)?requested:'emergence');

if(matchMedia('(max-width:860px)').matches)document.querySelector('.menu').open=false;
matchMedia('(max-width:860px)').addEventListener('change',event=>{if(!event.matches)document.querySelector('.menu').open=true;});
