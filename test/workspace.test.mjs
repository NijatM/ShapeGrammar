import test from 'node:test';
import assert from 'node:assert/strict';
import { Derivation, shapeKey } from '../src/engine/core.mjs';
import { encodeWorkspace, decodeWorkspace, saveWorkspace, restoreWorkspace, STORAGE_KEY, LIMITS } from '../src/workspace.mjs';
const line = [[0,0],[2,0]], rule = {left:[line],right:[line,[[1,0],[1,'1/2']]]};
function fixture(){const session=new Derivation([line],{xMin:0,xMax:0,yMin:0,yMax:0,scales:[1],orientations:['r0','f0']});session.apply(rule,{orientation:'r0',scale:1,translation:[0,0]});session.undo();return session;}
test('workspace round trip retains selected rule, exact fractions, cursor and redo branch',()=>{
  const original=fixture(), restored=decodeWorkspace(encodeWorkspace(original,rule));
  assert.equal(restored.session.cursor,0);assert.equal(restored.session.length,1);
  assert.deepEqual(restored.session.export().domain.orientations,['r0','f0']);
  assert.equal(shapeKey(restored.rule.right),shapeKey(rule.right));
  original.redo();restored.session.redo();assert.equal(shapeKey(restored.session.current),shapeKey(original.current));
});
test('legacy derivation files import; empty histories do not invent a selected rule',()=>{
  assert.equal(decodeWorkspace(JSON.stringify(fixture().export())).legacy,true);
  const empty=new Derivation([],{scales:[1]});assert.equal(decodeWorkspace(JSON.stringify(empty.export())).rule,null);
});
test('tampered replay, missing domains, invalid rules and future versions are rejected',()=>{
  const source=JSON.parse(encodeWorkspace(fixture(),rule));
  for(const mutate of [d=>d.version=9,d=>delete d.derivation.domain.step,d=>d.derivation.steps[0].expectedResult=[],d=>d.rule.left=[],d=>d.derivation.steps[0].transform.orientation='r45']){
    const data=structuredClone(source);mutate(data);assert.throws(()=>decodeWorkspace(JSON.stringify(data)));
  }
  assert.throws(()=>decodeWorkspace('{broken'));
});
test('file, history, geometry and coordinate budgets reject oversized imports before replay',()=>{
  assert.throws(()=>decodeWorkspace(' '.repeat(LIMITS.bytes+1)),/1 MiB/);
  const source=JSON.parse(encodeWorkspace(fixture(),rule));
  for(const mutate of [d=>d.derivation.steps=Array(201).fill(d.derivation.steps[0]),d=>d.derivation.initial=Array(257).fill(d.derivation.initial[0]),d=>d.rule.left[0][0][0]='9'.repeat(129)]){
    const data=structuredClone(source);mutate(data);assert.throws(()=>decodeWorkspace(JSON.stringify(data)));
  }
});
test('storage failures and invalid replacements preserve the prior saved copy',()=>{
  const entries=new Map(),storage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};
  const text=encodeWorkspace(fixture(),rule);saveWorkspace(storage,text);
  assert.throws(()=>saveWorkspace(storage,'{}'));assert.equal(entries.get(STORAGE_KEY),text);
  assert.equal(restoreWorkspace(storage).session.length,1);
  assert.throws(()=>saveWorkspace({...storage,setItem(){throw new Error('Quota exceeded');}},text),/Quota/);
  assert.equal(entries.get(STORAGE_KEY),text);
  assert.throws(()=>restoreWorkspace({getItem:()=>null}),/No saved/);
});
