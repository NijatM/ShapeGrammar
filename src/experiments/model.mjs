import {q,D4,normalize,sum,common,difference,isPart,equalShapes,rule,domain,applyRule,transformShape,transformations,shapeKey} from '../engine/core.mjs';
import {compose,stabilizer} from '../activities.mjs';

const defaults={
  'parts-across-strokes':{start:5,gap:false},
  'shape-arithmetic':{start:4,length:4,cross:false,operation:'difference'},
  'shared-transformation':{orientation:'r0',scale:'1',x:2,y:0},
  'witnesses-and-results':{identity:false,choice:0},
  'seeing-with-identities':{part:'left'},
  'growing-with-rules':{moves:[],allowUp:true},
  'weights-on-overlap':{a:2,b:4,operation:'sum'},
  'qualities-on-overlap':{priority:'a'},
  'finite-set-operations':{a:['a','b'],b:['b','c'],operation:'union'},
  'equivalence-classes':{modulus:3,x:2,y:5},
  'functions-and-bijections':{images:[0,1,2]},
  'composition-order':{a:'r90',b:'f0'},
  'orbits-and-stabilizers':{point:'corner',orientation:'r0'},
  'subgroup-builder':{members:['r0','r90']}
};
export const EXPERIMENT_IDS=Object.freeze(Object.keys(defaults));
export const ORIENTATIONS=Object.freeze(Object.keys(D4));
export const TOKENS=Object.freeze(['a','b','c','d']);
export const GROUP_NAMES=Object.freeze({r0:'Identity',r90:'Turn 90°',r180:'Turn 180°',r270:'Turn 270°',f0:'Reflect across horizontal axis',f90:'Reflect across y = x',f180:'Reflect across vertical axis',f270:'Reflect across y = −x'});
export function defaultState(id){if(!Object.hasOwn(defaults,id))throw new TypeError('Unknown experiment.');return structuredClone(defaults[id]);}
const pick=(v,values)=>{if(!values.includes(v))throw new TypeError('Choose one of the available values.');return v;};
const integer=(v,lo,hi)=>{if(!Number.isSafeInteger(v)||v<lo||v>hi)throw new RangeError('Value is outside this experiment’s range.');return v;};
const bool=v=>{if(typeof v!=='boolean')throw new TypeError('Use a boolean choice.');return v;};
const segment=(x0,y0,x1,y1)=>[[x0,y0],[x1,y1]];
const horizontal=(lo,hi)=>[segment(lo,0,hi,0)];
export const square=(x=0,y=0,size=1)=>{
  const a=q(x),b=q(y),c=a.add(size),d=b.add(size);
  return [segment(a,b,c,b),segment(c,b,c,d),segment(c,d,a,d),segment(a,d,a,b)];
};
const stem=()=>rule({left:horizontal(0,2),right:[...horizontal(0,2),segment(1,0,1,1)]});
const unitTransform={orientation:'r0',scale:1,translation:[0,0]};
const action=(name,p)=>{const [a,b,c,d]=D4[pick(name,ORIENTATIONS)];return [a*p[0]+b*p[1],c*p[0]+d*p[1]];};
const vertices=[[1,1],[-1,1],[-1,-1],[1,-1]];
export const squareImages=name=>vertices.map(p=>action(name,p));

export function evaluateExperiment(id,patch={}){
  const s={...defaultState(id),...patch};
  if(Object.keys(s).some(k=>!Object.hasOwn(defaults[id],k)))throw new TypeError('Unknown experiment setting.');
  switch(id){
    case 'parts-across-strokes':{
      const start=q(integer(s.start,0,12)).div(2),gap=bool(s.gap);
      const strokes=gap?[segment(0,0,'5/2',0),segment('7/2',0,6,0)]:[segment(0,0,3,0),segment(3,0,6,0)];
      const query=horizontal(start,start.add(2)),host=normalize(strokes);
      return {strokes,host,query,start,end:start.add(2),valid:isPart(query,host),gap};
    }
    case 'shape-arithmetic':{
      const start=q(integer(s.start,0,12)).div(2),length=q(integer(s.length,1,8)).div(2);
      const a=horizontal(0,6),b=bool(s.cross)?[segment(start,-2,start,2)]:horizontal(start,start.add(length));
      const operations={sum,intersection:common,difference};
      const operation=pick(s.operation,Object.keys(operations));
      return {a,b,result:operations[operation](a,b),overlap:common(a,b),operation,start,length,cross:s.cross};
    }
    case 'shared-transformation':{
      const t={orientation:pick(s.orientation,ORIENTATIONS),scale:pick(s.scale,['1/2','1','2']),translation:[q(integer(s.x,-2,10)).div(2),q(integer(s.y,-4,4)).div(2)]};
      const r=stem(),host=horizontal(0,4),left=transformShape(r.left,t),right=transformShape(r.right,t),valid=isPart(left,host);
      const config=domain({xMin:-1,xMax:5,yMin:-2,yMax:2,step:'1/2',scales:['1/2',1,2]});
      return {rule:r,t,host,left,right,valid,result:valid?applyRule(r,host,t,config):null};
    }
    case 'witnesses-and-results':{
      bool(s.identity);integer(s.choice,0,1);
      const host=horizontal(0,2),r=s.identity?rule({left:host,right:host}):stem();
      const config=domain({xMin:0,xMax:0,yMin:0,yMax:0,scales:[1]});
      const witnesses=[...transformations(config)].filter(t=>isPart(transformShape(r.left,t),host)).map(t=>({t,region:transformShape(r.left,t),result:applyRule(r,host,t,config)}));
      return {host,rule:r,witnesses,chosen:witnesses[s.choice],parts:new Set(witnesses.map(w=>shapeKey(w.region))).size,results:new Set(witnesses.map(w=>shapeKey(w.result))).size,candidates:Number(config.total)};
    }
    case 'seeing-with-identities':{
      const parts={left:square(0,0,2),right:square(2,0,2),outer:[segment(0,0,4,0),segment(4,0,4,2),segment(4,2,0,2),segment(0,2,0,0)]};
      const part=parts[pick(s.part,Object.keys(parts))],host=sum(parts.left,parts.right),r=rule({left:part,right:part});
      const result=applyRule(r,host,unitTransform,domain({xMin:0,xMax:0,yMin:0,yMax:0,scales:[1],orientations:['r0']}));
      return {host,part,result,unchanged:equalShapes(host,result),reading:s.part};
    }
    case 'growing-with-rules':{
      bool(s.allowUp);
      if(!Array.isArray(s.moves)||s.moves.length>8)throw new RangeError('Use at most eight steps.');
      const seed=square(),config=domain({xMin:0,xMax:8,yMin:0,yMax:8,scales:[1],orientations:['r0']});
      let host=normalize(seed),x=0,y=0;
      for(const move of s.moves){
        pick(move,s.allowUp?['right','up']:['right']);
        const dx=move==='right'?1:0,dy=move==='up'?1:0;
        const r=rule({left:seed,right:sum(seed,square(dx,dy))});
        host=applyRule(r,host,{...unitTransform,translation:[x,y]},config);x+=dx;y+=dy;
      }
      return {host,focus:square(x,y),x,y,steps:s.moves.length,cells:s.moves.length+1,moves:[...s.moves],allowUp:s.allowUp};
    }
    case 'weights-on-overlap':{
      const a=integer(s.a,1,5),b=integer(s.b,1,5),operation=pick(s.operation,['sum','intersection','difference']);
      const overlap=operation==='sum'?Math.max(a,b):operation==='intersection'?Math.min(a,b):Math.max(a-b,0);
      const pieces=[[0,2,operation==='intersection'?0:a],[2,4,overlap],[4,6,operation==='sum'?b:0]];
      const result=[];
      for(const [lo,hi,weight] of pieces){if(!weight)continue;const prev=result.at(-1);if(prev&&prev[1]===lo&&prev[2]===weight)prev[1]=hi;else result.push([lo,hi,weight]);}
      return {a,b,operation,overlap,result,geometry:normalize(result.map(([lo,hi])=>segment(lo,0,hi,0)))};
    }
    case 'qualities-on-overlap':return {priority:pick(s.priority,['a','b']),a:[0,1,4,2],b:[1,0,2,3],overlap:[1,1,2,2]};
    case 'finite-set-operations':{
      for(const list of [s.a,s.b])if(!Array.isArray(list)||list.length>4||list.some(x=>!TOKENS.includes(x)))throw new TypeError('Use the four available elements.');
      const a=TOKENS.filter(x=>s.a.includes(x)),b=TOKENS.filter(x=>s.b.includes(x));
      const operation=pick(s.operation,['union','intersection','difference','product','power']);
      const values={union:TOKENS.filter(x=>a.includes(x)||b.includes(x)),intersection:a.filter(x=>b.includes(x)),difference:a.filter(x=>!b.includes(x)),product:a.flatMap(x=>b.map(y=>[x,y])),power:Array.from({length:2**a.length},(_,bits)=>a.filter((_,i)=>bits&(1<<i)))};
      return {a,b,operation,result:values[operation],subset:a.every(x=>b.includes(x)),powerCount:2**a.length};
    }
    case 'equivalence-classes':{
      const modulus=integer(s.modulus,2,4),x=integer(s.x,0,5),y=integer(s.y,0,5);
      const elements=[0,1,2,3,4,5],classes=Array.from({length:modulus},(_,r)=>elements.filter(n=>n%modulus===r));
      return {modulus,x,y,classes,related:x%modulus===y%modulus,xClass:x%modulus,yClass:y%modulus};
    }
    case 'functions-and-bijections':{
      if(!Array.isArray(s.images)||s.images.length!==3)throw new TypeError('Supply one output for each of the three inputs.');
      const images=s.images.map(x=>integer(x,0,2)),fibres=[0,1,2].map(y=>images.flatMap((v,x)=>v===y?[x]:[]));
      return {images,fibres,injective:fibres.every(f=>f.length<=1),surjective:fibres.every(f=>f.length>=1),bijective:fibres.every(f=>f.length===1)};
    }
    case 'composition-order':{
      const a=pick(s.a,ORIENTATIONS),b=pick(s.b,ORIENTATIONS),ab=compose(a,b),ba=compose(b,a);
      return {a,b,ab,ba,commute:ab===ba,first:squareImages(b),second:squareImages(ab),reversed:squareImages(ba)};
    }
    case 'orbits-and-stabilizers':{
      const point=pick(s.point,['corner','edge','center','general']),p={corner:[1,1],edge:[1,0],center:[0,0],general:[2,1]}[point];
      const images=ORIENTATIONS.map(name=>({name,point:action(name,p)})),orbit=[...new Map(images.map(v=>[v.point.join(','),v.point])).values()];
      const stabilizers=stabilizer(p),orientation=pick(s.orientation,ORIENTATIONS);
      return {point:p,images,orbit,stabilizers,image:action(orientation,p),orientation,groupSize:8};
    }
    case 'subgroup-builder':{
      if(!Array.isArray(s.members)||s.members.length>8||s.members.some(x=>!ORIENTATIONS.includes(x)))throw new TypeError('Choose square symmetries.');
      const members=ORIENTATIONS.filter(g=>s.members.includes(g)),identity=members.includes('r0');
      let closure=null,inverse=null;
      for(const a of members){for(const b of members){const product=compose(a,b);if(!members.includes(product)&&!closure)closure={a,b,product};}
        const required=ORIENTATIONS.find(b=>compose(a,b)==='r0'&&compose(b,a)==='r0');if(!members.includes(required)&&!inverse)inverse={a,required};}
      return {members,identity,closure,inverse,isGroup:!!members.length&&identity&&!closure&&!inverse};
    }
  }
}
