import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Runs the actual application module with bounded document/network adapters.
// This checks routing and recovery logic, not native focus, layout or browser events.
class Element {
  constructor(document,tag='div'){this.document=document;this.tagName=tag.toUpperCase();this.listeners={};this.children=[];this.value='';this.textContent='';this.isConnected=true;this.hidden=false;}
  set id(value){this._id=value;this.document.elements.set(value,this);}
  get id(){return this._id;}
  set innerHTML(value){
    this.html=value;
    if(this.id==='main'){
      for(const [id,element] of this.document.elements)if(!['main','crumb','progress-summary','storage-alert'].includes(id)){element.isConnected=false;this.document.elements.delete(id);}
      for(const match of value.matchAll(/<([\w-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){
        const element=new Element(this.document,match[1]);element.id=match[2];
        if(element.id==='private-note'){element.section=new Element(this.document,'section');element.section.before=other=>{this.document.inserted=other;};}
      }
    }
  }
  get innerHTML(){return this.html??'';}
  addEventListener(type,handler){this.listeners[type]=handler;}
  append(...elements){this.children.push(...elements);}
  closest(selector){if(selector==='section')return this.section;throw new Error(selector);}
  focus(){}
  scrollIntoView(){}
}
class Document {
  constructor(){this.elements=new Map();this.baseURI='http://127.0.0.1:8766/dist/';this.menu={open:true};this.skip={addEventListener(){}};for(const id of ['main','crumb','progress-summary','storage-alert']){const el=new Element(this);el.id=id;}}
  getElementById(id){return this.elements.get(id)??null;}
  createElement(tag){return new Element(this,tag);}
  querySelector(selector){if(selector==='.menu')return this.menu;if(selector==='.skip')return this.skip;throw new Error(selector);}
  querySelectorAll(selector){if(['.side nav a','[data-reading-anchor]'].includes(selector))return [];throw new Error(selector);}
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
async function until(check){for(let i=0;i<100;i++){if(check())return;await settle();}throw new Error('Application did not reach the expected state.');}
let serial=0;
async function app(hash,intercept){
  const previous=Object.fromEntries(['window','document','location','matchMedia','fetch'].map(key=>[key,globalThis[key]]));
  const document=new Document(),listeners={},saved=new Map();
  globalThis.document=document;globalThis.location={hash};
  globalThis.matchMedia=()=>({matches:false,addEventListener(){}});
  globalThis.window={localStorage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)},addEventListener:(type,fn)=>listeners[type]=fn,scrollTo(){}};
  globalThis.fetch=async url=>{
    const path=new URL(url).pathname.replace(/^\/dist\//,'');
    const alternative=await intercept?.(path);if(alternative)return alternative;
    const value=JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
    return {ok:true,json:async()=>value};
  };
  await import(`../src/app.mjs?routing-test=${++serial}`);
  return {document,listeners,saved,restore(){for(const [key,value] of Object.entries(previous))if(value===undefined)delete globalThis[key];else globalThis[key]=value;}};
}

test('failed source experiment links can retry without hiding the guide or losing a pending note',async()=>{
  let calls=0;
  const context=await app('#/source/krishnamurti-1980-arithmetic',path=>{
    if(path==='data/experiments.json'&&++calls===1)return {ok:false,status:503};
  });
  try{
    const doc=context.document;
    await until(()=>doc.getElementById('retry-experiments'));
    assert.match(doc.getElementById('main').innerHTML,/The Arithmetic of Shapes/);
    assert.match(doc.getElementById('main').innerHTML,/reading-section/);
    assert.equal(doc.inserted.children[0].textContent,'Linked experiments could not load');
    const textarea=doc.getElementById('private-note');textarea.value='My observation before retrying';textarea.listeners.input();
    await doc.getElementById('retry-experiments').onclick();
    assert.equal(calls,2);
    assert.match(doc.getElementById('main').innerHTML,/Try linked experiments/);
    assert.match(doc.getElementById('main').innerHTML,/#\/experiment\/shape-arithmetic\?from=krishnamurti-1980-arithmetic/);
    assert.equal(doc.getElementById('private-note').value,'My observation before retrying');
    assert.equal(doc.getElementById('retry-experiments'),null);
  }finally{context.restore();}
});

test('a slow source reading cannot overwrite a newer route',async()=>{
  const guide=JSON.parse(await readFile(new URL('../Reference/reading-guides/krishnamurti-1980-arithmetic.json',import.meta.url),'utf8'));
  let resolveReading,requested=false,delivered=false;
  const context=await app('#/source/krishnamurti-1980-arithmetic',path=>{
    if(path==='Reference/reading-guides/krishnamurti-1980-arithmetic.json'){
      requested=true;return new Promise(resolve=>resolveReading=resolve);
    }
  });
  try{
    await until(()=>requested);
    location.hash='#/experiments';
    await context.listeners.hashchange();
    const html=context.document.getElementById('main').innerHTML;
    assert.match(html,/Try an idea. See what changes./);
    resolveReading({ok:true,json:async()=>{delivered=true;return guide;}});
    await until(()=>delivered);await settle();
    assert.equal(context.document.getElementById('main').innerHTML,html);
  }finally{context.restore();}
});
