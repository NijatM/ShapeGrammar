import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultState,evaluateExperiment,EXPERIMENT_IDS,ORIENTATIONS} from '../src/experiments/model.mjs';
import {equalShapes,serializeShape} from '../src/engine/core.mjs';
import {experimentControlsHTML,experimentResult} from '../src/experiments/view.mjs';

const run=(id,state)=>evaluateExperiment(id,state);
const line=(a,b)=>[[[a,0],[b,0]]];
test('all experiment defaults work and separate copies cannot mutate reset state',()=>{
  for(const id of EXPERIMENT_IDS)assert.ok(run(id,defaultState(id)));
  const state=defaultState('growing-with-rules');state.moves.push('up');assert.deepEqual(defaultState('growing-with-rules').moves,[]);
  assert.throws(()=>defaultState('unknown'));assert.throws(()=>run('parts-across-strokes',{unknown:1}));
});
test('a query crosses a stroke join, while a genuine gap follows independent interval coverage',()=>{
  for(const gap of [false,true])for(let start=0;start<=12;start++){
    const x=start/2,r=run('parts-across-strokes',{start,gap});
    const expected=gap?(x+2<=2.5||x>=3.5&&x+2<=6):x+2<=6;
    assert.equal(r.valid,expected,`start ${x}; gap ${gap}`);
  }
  assert.equal(run('parts-across-strokes').host.length,1);
  assert.equal(run('parts-across-strokes',{gap:true}).host.length,2);
});
test('arithmetic controls produce actual splitting, fusion and line-only intersection',()=>{
  assert.ok(equalShapes(run('shape-arithmetic').result,[...line(0,2),...line(4,6)]));
  assert.ok(equalShapes(run('shape-arithmetic',{operation:'sum'}).result,line(0,6)));
  assert.ok(equalShapes(run('shape-arithmetic',{operation:'intersection'}).result,line(2,4)));
  assert.deepEqual(serializeShape(run('shape-arithmetic',{cross:true,operation:'intersection'}).result),[]);
  assert.ok(equalShapes(run('shape-arithmetic',{cross:true,operation:'difference'}).result,line(0,6)));
});
test('shared-transform experiment reflects the replacement and returns no result for a failed match',()=>{
  const upper=run('shared-transformation'),lower=run('shared-transformation',{orientation:'f0'});
  assert.equal(upper.valid,true);assert.equal(lower.valid,true);
  assert.ok(equalShapes(upper.left,lower.left));assert.equal(equalShapes(upper.result,lower.result),false);
  assert.ok(equalShapes(lower.result,[...line(0,4),[[2,-1],[2,0]]]));
  for(const patch of [{orientation:'r90'},{y:2}]){const r=run('shared-transformation',patch);assert.equal(r.valid,false);assert.equal(r.result,null);}
});
test('witnesses, geometric parts and resulting shapes are counted separately',()=>{
  for(const identity of [false,true]){
    const r=run('witnesses-and-results',{identity});
    assert.equal(r.candidates,8);assert.equal(r.witnesses.length,2);assert.equal(r.parts,1);assert.equal(r.results,identity?1:2);
    assert.deepEqual(r.witnesses.map(w=>w.t.orientation),['r0','f0']);
  }
});
test('identity-rule readings all preserve geometry, including the larger rectangle',()=>{
  const readings=['left','right','outer'].map(part=>run('seeing-with-identities',{part}));
  for(const r of readings){assert.equal(r.unchanged,true);assert.ok(equalShapes(r.result,r.host));assert.equal(r.host.length,5);}
  assert.equal(equalShapes(readings[0].part,readings[2].part),false);
});
test('growth rules really apply in sequence, respect the menu and bound exploration',()=>{
  const staircase=run('growing-with-rules',{moves:['right','up','right']});
  assert.deepEqual([staircase.x,staircase.y,staircase.steps,staircase.cells],[2,1,3,4]);
  const other=run('growing-with-rules',{moves:['right','right','up']});assert.equal(equalShapes(staircase.host,other.host),false);
  assert.throws(()=>run('growing-with-rules',{moves:['up'],allowUp:false}));
  assert.throws(()=>run('growing-with-rules',{moves:Array(9).fill('right')}));
  assert.equal(run('growing-with-rules',{moves:Array(8).fill('right'),allowUp:false}).cells,9);
});
test('weighted overlap uses max/min/truncated subtraction and removes zero-weight content',()=>{
  assert.equal(run('weights-on-overlap',{a:3,b:3}).overlap,3);
  assert.equal(run('weights-on-overlap',{a:2,b:4,operation:'intersection'}).overlap,2);
  const erased=run('weights-on-overlap',{a:2,b:4,operation:'difference'});
  assert.deepEqual(erased.result,[[0,2,2]]);assert.ok(equalShapes(erased.geometry,line(0,2)));
  assert.deepEqual(run('weights-on-overlap',{a:5,b:2,operation:'difference'}).result,[[0,2,5],[2,4,3]]);
  assert.throws(()=>run('weights-on-overlap',{a:0}));
});
test('quality priority changes the chosen field without changing either region or their overlap',()=>{
  const a=run('qualities-on-overlap'),b=run('qualities-on-overlap',{priority:'b'});
  assert.deepEqual(a.a,[0,1,4,2]);assert.deepEqual(a.b,[1,0,2,3]);assert.deepEqual(a.overlap,[1,1,2,2]);
  assert.deepEqual(a.a,b.a);assert.deepEqual(a.b,b.b);assert.deepEqual(a.overlap,b.overlap);assert.notEqual(a.priority,b.priority);
});
test('all finite-set choices have correct membership, pair counts and complete power sets',()=>{
  const tokens=['a','b','c','d'],set=bits=>tokens.filter((_,i)=>bits&2**i);
  for(let a=0;a<16;a++)for(let b=0;b<16;b++){
    const state={a:set(a),b:set(b)};
    for(const [operation,bits] of [['union',a|b],['intersection',a&b],['difference',a&~b]])assert.deepEqual(run('finite-set-operations',{...state,operation}).result,set(bits));
    const product=run('finite-set-operations',{...state,operation:'product'}).result;
    assert.equal(product.length,state.a.length*state.b.length);
    for(const [x,y] of product){assert.ok(state.a.includes(x));assert.ok(state.b.includes(y));}
    const power=run('finite-set-operations',{...state,operation:'power'}).result;
    assert.equal(power.length,2**state.a.length);assert.equal(new Set(power.map(x=>JSON.stringify(x))).size,power.length);
    assert.ok(power.some(s=>!s.length));assert.ok(power.some(s=>s.length===state.a.length));
  }
  assert.deepEqual(run('finite-set-operations',{a:[],operation:'power'}).result,[[]]);
});
test('remainder classes partition the finite universe and satisfy all three equivalence laws',()=>{
  for(const modulus of [2,3,4]){
    const r=run('equivalence-classes',{modulus});
    assert.deepEqual(r.classes.flat().sort((a,b)=>a-b),[0,1,2,3,4,5]);
    const related=(x,y)=>run('equivalence-classes',{modulus,x,y}).related;
    for(let x=0;x<6;x++){assert.equal(related(x,x),true);for(let y=0;y<6;y++){assert.equal(related(x,y),related(y,x));for(let z=0;z<6;z++)if(related(x,y)&&related(y,z))assert.equal(related(x,z),true);}}
  }
  assert.deepEqual(run('equivalence-classes',{modulus:4}).classes.map(c=>c.length),[2,2,1,1]);
});
test('all 27 three-element functions distinguish six bijections from maps with collisions',()=>{
  let bijections=0;
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++){
    const r=run('functions-and-bijections',{images:[a,b,c]});
    assert.deepEqual(r.fibres.flat().sort(),[0,1,2]);assert.equal(r.injective,r.surjective);
    assert.equal(r.bijective,r.injective&&r.surjective);bijections+=Number(r.bijective);
  }
  assert.equal(bijections,6);assert.equal(run('functions-and-bijections',{images:[0,0,2]}).bijective,false);
});
test('composition presets distinguish the two orders while identity commutes',()=>{
  const r=run('composition-order');assert.equal(r.ab,'f90');assert.equal(r.ba,'f270');assert.equal(r.commute,false);assert.notDeepEqual(r.second,r.reversed);
  for(const b of ORIENTATIONS)assert.equal(run('composition-order',{a:'r0',b}).commute,true);
});
test('four point choices give exact orbit/stabilizer counts and selected images',()=>{
  for(const [point,orbit,stabilizer] of [['corner',4,2],['edge',4,2],['center',1,8],['general',8,1]]){
    const r=run('orbits-and-stabilizers',{point});assert.equal(r.orbit.length,orbit);assert.equal(r.stabilizers.length,stabilizer);assert.equal(orbit*stabilizer,8);
  }
  assert.deepEqual(run('orbits-and-stabilizers',{point:'general',orientation:'f90'}).image,[1,2]);
});
test('checking all 256 selections returns exactly the ten actual square-symmetry subgroups',()=>{
  const canonical=members=>[...members].sort().join(','),found=[];
  for(let mask=0;mask<256;mask++){
    const members=ORIENTATIONS.filter((_,i)=>mask&2**i),r=run('subgroup-builder',{members});
    if(r.isGroup)found.push(canonical(members));
  }
  const expected=[['r0'],['r0','r180'],...['f0','f90','f180','f270'].map(f=>['r0',f]),['r0','r90','r180','r270'],['r0','r180','f0','f180'],['r0','r180','f90','f270'],ORIENTATIONS];
  assert.deepEqual(found.sort(),expected.map(canonical).sort());
  assert.deepEqual(run('subgroup-builder').closure,{a:'r90',b:'r90',product:'r180'});
});
test('all interactive views render controls, accessible diagrams and finite textual observations',()=>{
  for(const id of EXPERIMENT_IDS){
    const s=defaultState(id),controls=experimentControlsHTML(id,s),result=experimentResult(id,s,run(id,s));
    assert.match(controls,/<(?:input|select|button)/);
    for(const text of [controls,result.visual,result.status,result.detail]){assert.equal(typeof text,'string');assert.doesNotMatch(text,/undefined|NaN|Infinity/);}
    const svgCount=[...result.visual.matchAll(/<svg\b/g)].length;
    assert.equal([...result.visual.matchAll(/<svg\b[^>]*role="img"[^>]*aria-label="[^"]+"/g)].length,svgCount);
    assert.equal([...result.visual.matchAll(/<\/svg>/g)].length,svgCount);
    const ids=[...result.visual.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  }
});
test('failed matching is shown as no result computed, rather than as a valid empty shape',()=>{
  const state={...defaultState('shared-transformation'),y:2},view=experimentResult('shared-transformation',state,run('shared-transformation',state));
  assert.match(view.visual,/No result is computed/);assert.doesNotMatch(view.visual,/∅ · no line content/);assert.match(view.status,/cannot apply/);
});
test('the empty-set power set and identity witness results have unambiguous visible explanations',()=>{
  const s={...defaultState('finite-set-operations'),a:[],operation:'power'},sets=experimentResult('finite-set-operations',s,run('finite-set-operations',s));
  assert.match(sets.status,/P\(∅\) is \{∅\}, not ∅/);
  const w={...defaultState('witnesses-and-results'),identity:true},witnesses=experimentResult('witnesses-and-results',w,run('witnesses-and-results',w));
  assert.match(witnesses.status,/2 matching transformations, 1 geometric part, 1 distinct result/);
});
