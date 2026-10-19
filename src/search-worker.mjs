import {findMatches,serializeShape,serializeTransform} from './engine/core.mjs';
let controller;
self.onmessage=async event=>{
  if(event.data.type==='cancel'){controller?.abort();return;}
  if(event.data.type!=='search')return;
  controller=new AbortController();
  try{
    const {rule,host,config,limits}=event.data;
    const result=await findMatches(rule,host,config,{...limits,signal:controller.signal,onProgress:progress=>self.postMessage({type:'progress',progress})});
    self.postMessage({type:'result',result:{...result,matches:result.matches.map(m=>({transform:serializeTransform(m.transform),region:serializeShape(m.region),result:serializeShape(m.result)}))}});
  }catch(error){self.postMessage({type:'error',message:error.message});}
};
