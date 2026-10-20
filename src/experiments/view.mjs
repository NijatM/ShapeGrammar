import {q} from '../engine/core.mjs';
import {defaultState,evaluateExperiment,ORIENTATIONS,GROUP_NAMES,TOKENS,square,squareImages} from './model.mjs';

const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options=(values,selected)=>values.map(v=>{const [value,label]=Array.isArray(v)?v:[v,v];return `<option value="${esc(value)}" ${String(value)===String(selected)?'selected':''}>${esc(label)}</option>`;}).join('');
const choose=(key,label,values,selected)=>`<label>${esc(label)}<select data-setting="${key}">${options(values,selected)}</select></label>`;
const range=(key,label,min,max,value,divisor=1)=>`<label>${esc(label)}: <output data-value="${key}">${value/divisor}</output><input type="range" data-setting="${key}" data-divisor="${divisor}" min="${min}" max="${max}" step="1" value="${value}"></label>`;
const check=(key,label,value)=>`<label class="experiment-check"><input type="checkbox" data-setting="${key}" ${value?'checked':''}>${esc(label)}</label>`;
const button=(label,action)=>`<button type="button" data-action="${action}">${esc(label)}</button>`;
const orientations=()=>ORIENTATIONS.map(n=>[n,`${n} · ${GROUP_NAMES[n]}`]);
const weights=[['sum','Sum: maximum'],['intersection','Intersection: minimum'],['difference','A − B: clipped subtraction']];
const fmtSet=a=>a.length?`{${a.join(', ')}}`:'∅';
const yes=v=>v?'Yes':'No';
const coordinates=s=>s.map(([a,b])=>`(${a.map(String).join(',')}) → (${b.map(String).join(',')})`).join('; ')||'Empty line shape';
const panel=(title,body)=>`<figure class="experiment-panel"><figcaption>${esc(title)}</figcaption>${body}</figure>`;
const metrics=entries=>`<dl class="experiment-metrics">${entries.map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
// Screen-space label offsets may be fractional JS numbers; model geometry stays exact.
const asNumber=v=>typeof v==='number'&&Number.isFinite(v)?v:q(v).toNumber();
function frame(shapes){
  const pts=shapes.flatMap(s=>s.flatMap(l=>l)).map(([x,y])=>[asNumber(x),asNumber(y)]);
  if(!pts.length)pts.push([0,0],[1,1]);
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const dx=Math.max(1,x1-x0),dy=Math.max(1,y1-y0),scale=Math.min(336/dx,112/dy),cx=(x0+x1)/2,cy=(y0+y1)/2;
  return (x,y)=>[210+(asNumber(x)-cx)*scale,86-(asNumber(y)-cy)*scale];
}
function svgLines(groups,label,all=groups.map(g=>g.shape),annotations=[]){
  const project=frame(all);
  let body=groups.map(g=>g.shape.map(([a,b])=>{const [x1,y1]=project(...a),[x2,y2]=project(...b);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="experiment-line ${g.style??''}"/>`;}).join('')).join('');
  for(const {x,y,text} of annotations){const [cx,cy]=project(x,y);body+=`<circle cx="${cx}" cy="${cy}" r="4" class="experiment-mark"/><text x="${cx}" y="${cy-15}" text-anchor="middle">${esc(text)}</text>`;}
  if(!groups.some(g=>g.shape.length))body+='<text x="210" y="90" text-anchor="middle">∅ · no line content</text>';
  const desc=groups.map(g=>`${g.style==='query'?'Dashed query':'Line shape'}: ${coordinates(g.shape)}`).join('. ');
  return `<svg viewBox="0 0 420 180" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><desc>${esc(desc)}</desc>${body}</svg>`;
}
const diagram=(title,groups,all,annotations)=>panel(title,svgLines(groups,title,all,annotations));
function labelledSquare(name,title){
  const pts=squareImages(name),project=frame([square(-1,-1,2)]);
  const polygon=pts.map(p=>project(...p).join(',')).join(' ');
  return panel(title,`<svg viewBox="0 0 420 180" role="img" aria-label="${esc(`${title}: ${name}; ${pts.map((p,i)=>`corner ${i+1} at (${p})`).join(', ')}`)}"><polygon points="${polygon}" class="experiment-square"/>${pts.map(([x,y],i)=>{const [tx,ty]=project(x*1.28,y*1.28);return `<text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle">${i+1}</text>`;}).join('')}</svg>`);
}

export function experimentControlsHTML(id,s){
  switch(id){
    case 'parts-across-strokes':return range('start','Query start',0,12,s.start,2)+check('gap','Introduce a real gap from 2.5 to 3.5',s.gap)+button('Across the old join','across')+button('Fully inside the left part','inside');
    case 'shape-arithmetic':return choose('operation','Operation',[['sum','A + B · union'],['difference','A − B · erase'],['intersection','A · B · intersection']],s.operation)+range('start','Start of B / crossing x',0,12,s.start,2)+range('length','Length of horizontal B',1,8,s.length,2)+check('cross','Use a vertical crossing line for B',s.cross)+button('Split the middle','split')+button('Point-only crossing','crossing');
    case 'shared-transformation':return choose('orientation','Orientation',orientations(),s.orientation)+choose('scale','Scale',[['1/2','½'],['1','1'],['2','2']],s.scale)+range('x','Horizontal shift',-2,10,s.x,2)+range('y','Vertical shift',-4,4,s.y,2)+button('Reflect the same match','reflect')+button('Make the query miss','miss');
    case 'witnesses-and-results':return choose('choice','Choose a matching transformation',[[0,'Identity (r0)'],[1,'Reflect across horizontal axis (f0)']],s.choice)+check('identity','Use A → A instead of adding a stem',s.identity);
    case 'seeing-with-identities':return choose('part','Choose the part to recognize',[['left','Left square'],['right','Right square'],['outer','Outer rectangle']],s.part);
    case 'growing-with-rules':return choose('allowUp','Available rules',[['both','Right and up'],['right','Right only']],s.allowUp?'both':'right')+'<p class="small">Changing the rule menu starts a new trace.</p><div class="experiment-button-row">'+button('Add right →','right')+button('Add up ↑','up')+button('Undo last step','undo')+'</div>';
    case 'weights-on-overlap':return range('a','Weight on A',1,5,s.a)+range('b','Weight on B',1,5,s.b)+choose('operation','Operation',weights,s.operation)+button('Equal weights','equal')+button('Subtract a heavier line','heavier');
    case 'qualities-on-overlap':return choose('priority','Which field has higher priority?',[['a','A · horizontal hatching'],['b','B · vertical hatching']],s.priority);
    case 'finite-set-operations':return ['a','b'].map(key=>`<fieldset class="experiment-picks"><legend>Elements in ${key.toUpperCase()}</legend>${TOKENS.map(t=>`<button type="button" data-set="${key}" data-token="${t}" aria-pressed="${s[key].includes(t)}">${t}</button>`).join('')}</fieldset>`).join('')+choose('operation','Operation',[['union','A ∪ B · union'],['intersection','A ∩ B · intersection'],['difference','A ∖ B · difference'],['product','A × B · ordered pairs'],['power','P(A) · all subsets']],s.operation)+button('Try the empty set','empty');
    case 'equivalence-classes':return choose('modulus','Same remainder after division by',[2,3,4],s.modulus)+choose('x','First number x',[0,1,2,3,4,5],s.x)+choose('y','Second number y',[0,1,2,3,4,5],s.y);
    case 'functions-and-bijections':return s.images.map((v,i)=>choose(`image-${i}`,`${'abc'[i]} maps to`,[[0,'a'],[1,'b'],[2,'c']],v)).join('')+button('A reversible cycle','cycle')+button('A collision','collision');
    case 'composition-order':return choose('a','A · applied second in AB',orientations(),s.a)+choose('b','B · applied first in AB',orientations(),s.b)+button('Quarter turn and reflection','noncommute')+button('Try an identity','commute');
    case 'orbits-and-stabilizers':return choose('point','Starting point',[['corner','Corner (1,1)'],['edge','Edge midpoint (1,0)'],['center','Center (0,0)'],['general','General point (2,1)']],s.point)+choose('orientation','Apply this symmetry',orientations(),s.orientation);
    case 'subgroup-builder':return '<fieldset class="experiment-picks experiment-group-picks"><legend>Include these square symmetries</legend>'+ORIENTATIONS.map(g=>`<button type="button" data-member="${g}" aria-pressed="${s.members.includes(g)}"><strong>${g}</strong><span>${esc(GROUP_NAMES[g])}</span></button>`).join('')+'</fieldset><div class="experiment-button-row">'+button('All rotations','rotations')+button('Identity + one reflection','reflection-group')+button('All eight','whole-group')+button('Clear selection','clear-group')+'</div>';
  }
}

export function experimentResult(id,s,r){
  switch(id){
    case 'parts-across-strokes':return {
      visual:diagram('Input stroke history',[{shape:r.strokes}], [r.host,r.query],[{x:3,y:0,text:r.gap?'gap at 3':'old join at 3'}])+diagram('Geometric coverage and dashed query',[{shape:r.host},{shape:r.query,style:'query'}],[r.host,r.query]),
      status:`Query [${r.start.toNumber()}, ${r.end.toNumber()}] ${r.valid?'is':'is not'} a part. ${r.gap?'The real gap removes line content.':'Crossing the old join does not break coverage.'}`,
      detail:`${r.strokes.length} input strokes → ${r.host.length} maximal line${r.host.length===1?'':'s'}. Dashed line = query; solid line = host.`};
    case 'shape-arithmetic':{
      const all=[r.a,r.b,r.result];return {visual:diagram('A · fixed host',[{shape:r.a}],all)+diagram('B · your moving shape',[{shape:r.b,style:'query'}],all)+diagram('Computed result',[{shape:r.result}],all),status:`${{sum:'A + B',difference:'A − B',intersection:'A · B'}[r.operation]} contains ${r.result.length} maximal line${r.result.length===1?'':'s'}. ${r.cross?'A crossing point contributes no shared line interval.':''}`,detail:r.result.length?`Exact segments: ${coordinates(r.result)}.`:'The result is the empty line shape ∅. This does not say that the underlying drawings share no points.'};
    }
    case 'shared-transformation':{
      const all=[r.host,r.left,r.right,...(r.result?[r.result]:[])];return {visual:diagram('Rule left · recognize',[{shape:r.rule.left}],[r.rule.left,r.rule.right])+diagram('Rule right · replace with',[{shape:r.rule.right}],[r.rule.left,r.rule.right])+diagram('Placed left side in the host',[{shape:r.host},{shape:r.left,style:'query'}],all)+(r.valid?diagram('Result using that same transformation',[{shape:r.result}],all):panel('Match failed','<p class="experiment-no-result">No result is computed. The rule cannot apply to this placement.</p>')),status:r.valid?'Valid match. The replacement uses the same orientation, scale and shift.':'The placed left side is not a part of the host. The rule cannot apply here.',detail:`t = ${r.t.orientation}; scale ${r.t.scale}; shift (${r.t.translation.map(String).join(', ')}). Dashed = t(A). Formula: S′ = (S − t(A)) + t(B).`};
    }
    case 'witnesses-and-results':return {visual:metrics([['Transformations',r.witnesses.length],['Distinct parts',r.parts],['Distinct results',r.results]])+diagram('The matched part',[{shape:r.host},{shape:r.chosen.region,style:'query'}],[r.host,r.chosen.result])+diagram('Result of your chosen transformation',[{shape:r.chosen.result}],[r.host,r.chosen.result]),status:`${r.witnesses.length} matching transformations, ${r.parts} geometric part, ${r.results} distinct result${r.results===1?'':'s'}. ${s.identity?'An identity rule leaves both results identical.':'Reflection flips the new stem without changing the matched line.'}`,detail:`All ${r.candidates} allowed orientations checked at scale 1 and shift (0,0). Selected: ${r.chosen.t.orientation}.`};
    case 'seeing-with-identities':return {visual:diagram('Chosen reading · dashed',[{shape:r.host},{shape:r.part,style:'query'}])+diagram('After applying A → A',[{shape:r.result}],[r.host]),status:`The ${r.reading==='outer'?'outer rectangle':r.reading+' square'} is recognized. Geometry before and after: ${r.unchanged?'exactly equal':'different'}.`,detail:'Five maximal lines describe this host. The dashed highlight records your selection; it is not an added line or a claim that the drawing has only three parts.'};
    case 'growing-with-rules':return {visual:diagram('Current drawing · marked square is dashed',[{shape:r.host},{shape:r.focus,style:'query'}]),status:`${r.steps} of 8 available steps · ${r.cells} constructed square${r.cells===1?'':'s'}. Next rule acts at the marked square (${r.x}, ${r.y}).`,detail:r.moves.length?`Trace: ${r.moves.map(m=>m==='right'?'→':'↑').join(' ')}. Shared collinear edges fuse; constructed cells are not permanent line objects.`:'Start with one square. The right rule and up rule each preserve the selected square and add one neighbor.'};
    case 'weights-on-overlap':{
      const rows=[{name:'A',y:47,pieces:[[0,4,r.a]]},{name:'B',y:108,pieces:[[2,6,r.b]]},{name:'Result',y:169,pieces:r.result}];
      const body=rows.map(row=>`<text x="8" y="${row.y+4}">${row.name}</text>`+row.pieces.map(([lo,hi,w])=>`<line x1="${75+lo*51}" y1="${row.y}" x2="${75+hi*51}" y2="${row.y}" class="experiment-line" style="stroke-width:${2+w*1.7}"/><text x="${75+(lo+hi)*25.5}" y="${row.y-17}" text-anchor="middle">w=${w}</text>`).join('')+(!row.pieces.length?`<text x="210" y="${row.y+4}">∅</text>`:'')).join('');
      return {visual:panel('Weighted intervals · A is [0,4], B is [2,6]',`<svg viewBox="0 0 420 220" role="img" aria-label="${esc(`A weight ${r.a}; B weight ${r.b}; result intervals ${r.result.map(p=>`[${p[0]},${p[1]}] weight ${p[2]}`).join('; ')}`)}">${body}${[0,2,4,6].map(n=>`<text x="${75+n*51}" y="210" text-anchor="middle">${n}</text>`).join('')}</svg>`),status:`In the overlap [2,4], the result weight is ${r.overlap}. ${r.overlap===0?'That interval disappears.':r.operation==='sum'?'The larger weight wins; the values do not add arithmetically.':''}`,detail:`${r.result.map(([lo,hi,w])=>`[${lo},${hi}]: weight ${w}`).join(' · ')||'Empty result'}. The thickness is a display of the formal weight.`};
    }
    case 'qualities-on-overlap':return {visual:panel('Fixed regions, changing overlap quality',`<svg viewBox="0 0 420 260" role="img" aria-label="${esc(`Field A horizontal, field B vertical, overlap takes ${r.priority.toUpperCase()} because it has higher priority`)}"><defs><pattern id="ex-quality-a" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 4H8" class="experiment-hatch"/></pattern><pattern id="ex-quality-b" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M4 0V8" class="experiment-hatch"/></pattern></defs><rect x="70" y="100" width="280" height="60" fill="url(#ex-quality-a)"/><rect x="140" y="40" width="70" height="180" fill="url(#ex-quality-b)"/><rect x="140" y="100" width="70" height="60" class="experiment-overlap-clear"/><rect x="140" y="100" width="70" height="60" fill="url(#ex-quality-${r.priority})"/><rect x="70" y="100" width="280" height="60" class="experiment-region-outline"/><rect x="140" y="40" width="70" height="180" class="experiment-region-outline"/><text x="250" y="87">A · horizontal</text><text x="140" y="26">B · vertical</text><text x="175" y="248" text-anchor="middle">overlap → ${r.priority.toUpperCase()}</text></svg>`),status:`${r.priority.toUpperCase()} has higher priority. Only the quality assigned to the shared region changes; the two regions keep the same geometry.`,detail:'Horizontal hatching = A. Vertical hatching = B. This priority choice is supplied by the model, not determined by the outlines.'};
    case 'finite-set-operations':{
      const result=r.operation==='product'?r.result.map(p=>`(${p.join(', ')})`):r.operation==='power'?r.result.map(fmtSet):r.result;
      return {visual:metrics([['A',fmtSet(r.a)],['B',fmtSet(r.b)]])+`<div class="experiment-set-result"><h3>${esc({union:'A ∪ B',intersection:'A ∩ B',difference:'A ∖ B',product:'A × B',power:'P(A)'}[r.operation])}</h3><div class="experiment-tokens">${result.length?result.map(x=>`<span>${esc(x)}</span>`).join(''):'<span>∅</span>'}</div></div>`,status:r.operation==='power'?`P(A) has 2^${r.a.length} = ${r.powerCount} subsets. ${r.a.length?'Each displayed object is a subset.':'The one displayed subset is ∅; P(∅) is {∅}, not ∅.'}`:`${r.result.length} ${r.operation==='product'?'ordered pair':'element'}${r.result.length===1?'':'s'} in the result. A ⊆ B: ${yes(r.subset)}.`,detail:r.operation==='product'?'Pair order matters: (a,b) and (b,a) are different when a ≠ b.':r.operation==='power'?'Members of a power set are sets, not the original element tokens.':'The toggles select membership. They do not create duplicate elements.'};
    }
    case 'equivalence-classes':return {visual:`<div class="experiment-classes">${r.classes.map((c,i)=>`<section><h3>Remainder ${i}</h3><div class="experiment-tokens">${c.map(n=>`<span class="${n===r.x?'chosen-x ':''}${n===r.y?'chosen-y':''}">${n}${n===r.x?' · x':''}${n===r.y?' · y':''}</span>`).join('')}</div></section>`).join('')}</div>`,status:`${r.x} ~ ${r.y}: ${yes(r.related)}. Their remainders are ${r.xClass} and ${r.yClass}. ${r.related?'Both belong to the same class.':'They belong to different classes.'}`,detail:`${r.classes.length} disjoint, nonempty classes cover all six elements. Class sizes: ${r.classes.map(c=>c.length).join(', ')}.`};
    case 'functions-and-bijections':return {visual:panel('The same three-element domain and codomain',`<svg viewBox="0 0 420 245" role="img" aria-label="${esc(r.images.map((v,i)=>`${'abc'[i]} maps to ${'abc'[v]}`).join('; '))}"><defs><marker id="ex-function-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 1L7 4L0 7" class="experiment-arrowhead"/></marker></defs><text x="85" y="25" text-anchor="middle">Domain</text><text x="335" y="25" text-anchor="middle">Codomain</text>${r.images.map((v,i)=>`<line x1="108" y1="${65+i*65}" x2="312" y2="${65+v*65}" class="experiment-map-arrow" marker-end="url(#ex-function-arrow)"/>`).join('')}${[0,1,2].map(i=>`<text x="85" y="${70+i*65}" text-anchor="middle">${'abc'[i]}</text><text x="335" y="${70+i*65}" text-anchor="middle">${'abc'[i]}${r.fibres[i].length===0?' ○':''}</text>`).join('')}</svg>`)+metrics([['Injective',yes(r.injective)],['Surjective',yes(r.surjective)],['Bijective',yes(r.bijective)]]),status:r.bijective?'A reversible pairing: each output has one input. This self-bijection is a permutation.':'This function is not bijective: two inputs collide and at least one output is unused.',detail:r.fibres.map((f,i)=>`${'abc'[i]} receives ${f.length} arrow${f.length===1?'':'s'}`).join(' · ')+'. An open circle marks an unused output.'};
    case 'composition-order':return {visual:labelledSquare('r0','Original labelled square')+labelledSquare(r.b,`First B = ${r.b}`)+labelledSquare(r.ab,`Then A · AB = ${r.ab}`)+labelledSquare(r.ba,`Reverse order · BA = ${r.ba}`),status:`AB = ${r.ab}; BA = ${r.ba}. ${r.commute?'These chosen operations commute.':'These chosen operations do not commute.'}`,detail:'Every diagram tracks the same numbered corners 1, 2, 3 and 4. Turns are counterclockwise. Matching outlines alone would hide the change in point positions.'};
    case 'orbits-and-stabilizers':{
      const px=p=>[210+p[0]*47,126-p[1]*47],original=px(r.point),image=px(r.image);
      const p=squareImages('r0').map(v=>px(v).join(',')).join(' ');
      return {visual:panel('Distinct orbit positions · selected image is filled',`<svg viewBox="0 0 420 255" role="img" aria-label="${esc(`Start (${r.point}); ${r.orientation} gives (${r.image}); orbit ${r.orbit.map(p=>`(${p})`).join(', ')}`)}"><polygon points="${p}" class="experiment-square muted"/><line x1="${original[0]}" y1="${original[1]}" x2="${image[0]}" y2="${image[1]}" class="experiment-map-arrow"/>${r.orbit.map(p=>{const [x,y]=px(p);return `<circle cx="${x}" cy="${y}" r="5" class="experiment-orbit-point"/>`;}).join('')}<circle cx="${original[0]}" cy="${original[1]}" r="11" class="experiment-start-point"/><circle cx="${image[0]}" cy="${image[1]}" r="7" class="experiment-current-point"/></svg>`)+metrics([['Group size',8],['Orbit size',r.orbit.length],['Stabilizer size',r.stabilizers.length]]),status:`8 = ${r.orbit.length} × ${r.stabilizers.length}. ${r.orientation} sends (${r.point}) to (${r.image}).`,detail:`Stabilizer: ${r.stabilizers.join(', ')}. Dashed ring = starting point; filled dot = selected image; small outlined dots = all distinct images.`};
    }
    case 'subgroup-builder':return {visual:`<div class="experiment-group-checks"><h3>${r.isGroup?'This selection is a subgroup':'This selection is not a subgroup'}</h3><ul><li>Identity: ${r.identity?'present':'missing r0'}.</li><li>Closure: ${r.closure?`${r.closure.a} × ${r.closure.b} = ${r.closure.product}, which is outside the selection`:'every selected pair has its product inside the selection'}.</li><li>Inverses: ${r.inverse?`${r.inverse.a} needs ${r.inverse.required}, which is missing`:'all selected elements have their inverse inside the selection'}.</li><li>Associativity is inherited from D₄.</li></ul></div>`,status:r.isGroup?`${r.members.length} selected transformation${r.members.length===1?'':'s'} form a subgroup under the original D₄ composition.`:r.members.length?'The selection fails a required group property. The counterexamples explain what is missing.':'The empty selection has no identity, so it is not a group.',detail:'Composition AB applies B first. This checks a subset of a known group; it does not replace verifying associativity for an arbitrary new operation.'};
  }
}

export function mountExperiment(host,id){
  let state=defaultState(id);
  host.innerHTML=`<section class="experiment-workbench" aria-label="Interactive experiment"><div class="experiment-toolbar"><p>Change a setting. Compare what stays and what changes.</p>${button('Reset experiment','reset')}</div><div class="experiment-controls">${experimentControlsHTML(id,state)}</div><div class="experiment-visual"></div><div class="experiment-feedback" role="status" aria-live="polite" aria-atomic="true"></div><p class="experiment-detail"></p></section>`;
  const controlsHost=host.querySelector('.experiment-controls'),visual=host.querySelector('.experiment-visual'),feedback=host.querySelector('.experiment-feedback'),detail=host.querySelector('.experiment-detail');
  const sync=()=>{
    controlsHost.querySelectorAll('[data-setting]').forEach(el=>{const key=el.dataset.setting;let value=key.startsWith('image-')?state.images[Number(key.slice(6))]:state[key];if(key==='allowUp')value=state.allowUp?'both':'right';if(el.type==='checkbox')el.checked=value;else el.value=String(value);const out=controlsHost.querySelector(`[data-value="${key}"]`);if(out)out.value=String(Number(value)/Number(el.dataset.divisor??1));});
    controlsHost.querySelectorAll('[data-set]').forEach(el=>el.setAttribute('aria-pressed',String(state[el.dataset.set].includes(el.dataset.token))));
    controlsHost.querySelectorAll('[data-member]').forEach(el=>el.setAttribute('aria-pressed',String(state.members.includes(el.dataset.member))));
  };
  const update=()=>{
    try{
      const r=evaluateExperiment(id,state),content=experimentResult(id,state,r);visual.innerHTML=content.visual;feedback.textContent=content.status;detail.textContent=content.detail;
      const up=controlsHost.querySelector('[data-action="up"]'),right=controlsHost.querySelector('[data-action="right"]'),undo=controlsHost.querySelector('[data-action="undo"]');
      if(up)up.disabled=!state.allowUp||r.steps===8;if(right)right.disabled=r.steps===8;if(undo)undo.disabled=!r.steps;
      if(id==='shape-arithmetic')controlsHost.querySelector('[data-setting="length"]').disabled=state.cross;
      sync();
    }catch(error){feedback.textContent=`This setting could not be applied: ${error.message}`;}
  };
  controlsHost.addEventListener('input',event=>{
    const el=event.target,key=el.dataset.setting;if(!key)return;
    if(key.startsWith('image-'))state.images[Number(key.slice(6))]=Number(el.value);
    else if(key==='allowUp'){state.allowUp=el.value==='both';state.moves=[];}
    else{
      const numeric=el.type==='range'||key==='choice'||id==='equivalence-classes'&&['x','y','modulus'].includes(key);
      state[key]=el.type==='checkbox'?el.checked:numeric?Number(el.value):el.value;
    }
    update();
  });
  host.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target||!host.contains(target))return;
    if(target.dataset.set){const {set,token}=target.dataset;state[set]=state[set].includes(token)?state[set].filter(x=>x!==token):[...state[set],token];}
    else if(target.dataset.member){const name=target.dataset.member;state.members=state.members.includes(name)?state.members.filter(x=>x!==name):[...state.members,name];}
    else switch(target.dataset.action){
      case 'reset':state=defaultState(id);break;
      case 'across':state.start=5;break;case 'inside':state.start=0;break;
      case 'split':Object.assign(state,{start:4,length:4,cross:false,operation:'difference'});break;
      case 'crossing':Object.assign(state,{start:6,cross:true,operation:'intersection'});break;
      case 'reflect':Object.assign(state,{orientation:'f0',scale:'1',x:2,y:0});break;
      case 'miss':Object.assign(state,{orientation:'r0',scale:'1',x:2,y:2});break;
      case 'right':if(state.moves.length<8)state.moves.push('right');break;
      case 'up':if(state.allowUp&&state.moves.length<8)state.moves.push('up');break;
      case 'undo':state.moves.pop();break;
      case 'equal':Object.assign(state,{a:3,b:3,operation:'sum'});break;
      case 'heavier':Object.assign(state,{a:2,b:4,operation:'difference'});break;
      case 'empty':Object.assign(state,{a:[],operation:'power'});break;
      case 'cycle':state.images=[1,2,0];break;case 'collision':state.images=[0,0,2];break;
      case 'noncommute':Object.assign(state,{a:'r90',b:'f0'});break;
      case 'commute':state.a='r0';break;
      case 'rotations':state.members=['r0','r90','r180','r270'];break;
      case 'reflection-group':state.members=['r0','f0'];break;
      case 'whole-group':state.members=[...ORIENTATIONS];break;
      case 'clear-group':state.members=[];break;
      default:return;
    }
    update();
  });
  update();
}
