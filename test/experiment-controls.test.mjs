import test from 'node:test';
import assert from 'node:assert/strict';
import {mountExperiment} from '../src/experiments/view.mjs';
import {EXPERIMENT_IDS} from '../src/experiments/model.mjs';

// A bounded DOM adapter for testing our event handlers, not a browser emulator.
// It reads the actual generated controls rather than supplying a second control catalogue.
class Field {
  constructor(tag,markup,owner){
    this.owner=owner;this.tag=tag;
    const opening=markup.slice(0,markup.indexOf('>')+1);
    this.attributes=Object.fromEntries([...opening.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
    this.dataset=Object.fromEntries(Object.entries(this.attributes).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5),v]));
    this.type=this.attributes.type??(tag==='select'?'select-one':tag);this.value=this.attributes.value??'';
    if(tag==='select'){
      const opts=[...markup.matchAll(/<option\b([^>]*)>/g)];const selected=opts.find(m=>/\bselected\b/.test(m[1]))??opts[0];
      this.value=selected?.[1].match(/\bvalue="([^"]*)"/)?.[1]??'';
    }
    this.checked=/\schecked(?:\s|>)/.test(opening);this.disabled=false;
  }
  setAttribute(k,v){this.attributes[k]=String(v);}
  closest(selector){return selector==='button'&&this.tag==='button'?this:null;}
}
const fields=(html,owner)=>[...html.matchAll(/<(input)\b[^>]*>|<(select|button|output)\b[^>]*>.*?<\/\2>/gs)].map(m=>new Field(m[1]??m[2],m[0],owner));
class Controls {
  constructor(markup,owner){this.fields=fields(markup,owner);this.listeners={};}
  addEventListener(type,handler){this.listeners[type]=handler;}
  querySelectorAll(selector){const m=selector.match(/^\[data-([\w-]+)(?:="([^"]*)")?\]$/);assert.ok(m,selector);return this.fields.filter(f=>Object.hasOwn(f.dataset,m[1])&&(m[2]===undefined||f.dataset[m[1]]===m[2]));}
  querySelector(selector){return this.querySelectorAll(selector)[0]??null;}
}
class Host {
  constructor(){this.listeners={};this.output={'.experiment-visual':{},'.experiment-feedback':{},'.experiment-detail':{}};}
  set innerHTML(html){const markup=html.match(/<div class="experiment-controls">(.*?)<\/div><div class="experiment-visual">/s)?.[1];assert.ok(markup);this.controls=new Controls(markup,this);this.reset=fields(html,this).find(f=>f.dataset.action==='reset');assert.ok(this.reset);}
  querySelector(selector){return selector==='.experiment-controls'?this.controls:this.output[selector];}
  contains(field){return field.owner===this;}
  addEventListener(type,handler){this.listeners[type]=handler;}
  get status(){return this.output['.experiment-feedback'].textContent;}
  click(key,value){const field=key==='action'&&value==='reset'?this.reset:this.controls.querySelector(`[data-${key}="${value}"]`);assert.ok(field,`${key}=${value}`);if(!field.disabled)this.listeners.click({target:field});}
  input(key,value){const field=this.controls.querySelector(`[data-setting="${key}"]`);assert.ok(field,key);if(field.type==='checkbox')field.checked=value;else field.value=String(value);this.controls.listeners.input({target:field});}
}
const mount=id=>{const host=new Host();mountExperiment(host,id);return host;};
test('all 14 actual view handlers mount, run every supplied preset and reset without losing controls',()=>{
  for(const id of EXPERIMENT_IDS){
    const host=mount(id),initial=host.status;assert.ok(initial);assert.doesNotMatch(initial,/could not be applied/);
    const controls=host.controls;
    for(const b of controls.fields.filter(f=>f.dataset.action)){
      host.click('action',b.dataset.action);assert.doesNotMatch(host.status,/could not be applied/,`${id}/${b.dataset.action}`);
      host.click('action','reset');assert.equal(host.status,initial);assert.equal(host.controls,controls);
    }
  }
});
test('range, checkbox, select and token handlers update their observations and enabled states',()=>{
  const parts=mount('parts-across-strokes');assert.match(parts.status,/is a part/);
  parts.input('gap',true);assert.match(parts.status,/is not a part/);parts.input('start',0);assert.match(parts.status,/is a part/);
  const arithmetic=mount('shape-arithmetic');arithmetic.click('action','crossing');assert.match(arithmetic.status,/0 maximal/);assert.equal(arithmetic.controls.querySelector('[data-setting="length"]').disabled,true);
  const growth=mount('growing-with-rules');growth.click('action','up');assert.match(growth.status,/1 of 8/);growth.input('allowUp','right');assert.match(growth.status,/0 of 8/);assert.equal(growth.controls.querySelector('[data-action="up"]').disabled,true);
  const functions=mount('functions-and-bijections');functions.input('image-1',0);assert.match(functions.status,/not bijective/);functions.click('action','cycle');assert.match(functions.status,/reversible pairing/);
  const sets=mount('finite-set-operations'),a=sets.controls.fields.find(f=>f.dataset.set==='a'&&f.dataset.token==='a');sets.listeners.click({target:a});assert.equal(a.attributes['aria-pressed'],'false');
  const groups=mount('subgroup-builder');groups.click('action','rotations');assert.match(groups.status,/form a subgroup/);groups.click('member','r90');assert.match(groups.status,/fails a required/);
});
test('identity toggles and numeric witness selection reach the matching view through real handlers',()=>{
  const witnesses=mount('witnesses-and-results');witnesses.input('choice',1);assert.match(witnesses.output['.experiment-detail'].textContent,/Selected: f0/);
  witnesses.input('identity',true);assert.match(witnesses.status,/1 distinct result/);
  const relation=mount('equivalence-classes');relation.input('modulus',4);assert.match(relation.status,/No/);relation.input('y',2);assert.match(relation.status,/Yes/);
  const reflection=mount('shared-transformation');reflection.click('action','miss');assert.match(reflection.status,/cannot apply/);reflection.click('action','reflect');assert.match(reflection.status,/Valid match/);
});
test('native slider units agree with the geometry, visible values, presets and reset',()=>{
  const parts=mount('parts-across-strokes');
  const start=parts.controls.querySelector('[data-setting="start"]');
  const output=parts.controls.querySelector('[data-value="start"]');
  assert.equal(start.attributes.min,'0');assert.equal(start.attributes.max,'6');assert.equal(start.attributes.step,'0.5');
  assert.equal(start.value,'2.5');assert.equal(output.value,'2.5');
  parts.input('start',3.5);assert.match(parts.status,/Query \[3.5, 5.5\] is a part/);
  assert.equal(start.value,'3.5');assert.equal(output.value,'3.5');
  parts.click('action','inside');assert.equal(start.value,'0');assert.equal(output.value,'0');
  parts.click('action','reset');assert.equal(start.value,'2.5');assert.equal(output.value,'2.5');
  const placed=mount('shared-transformation');
  placed.input('x',0.5);assert.match(placed.output['.experiment-detail'].textContent,/shift \(1\/2, 0\)/);
  placed.input('y',-0.5);assert.match(placed.status,/cannot apply/);
  assert.match(placed.output['.experiment-detail'].textContent,/shift \(1\/2, -1\/2\)/);
  placed.click('action','reflect');assert.equal(placed.controls.querySelector('[data-setting="x"]').value,'1');
  const weights=mount('weights-on-overlap');weights.input('a',5);assert.match(weights.status,/weight is 5/);
  assert.equal(weights.controls.querySelector('[data-setting="a"]').attributes.step,'1');
});
