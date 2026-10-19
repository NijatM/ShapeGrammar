import {findMatches,serializeShape,serializeDomain} from './engine/core.mjs';
export async function searchResponsive(rule,host,config,options={}){
  if(typeof Worker==='undefined')return findMatches(rule,host,config,options);
  const {signal,onProgress,...limits}=options;
  if(signal?.aborted)return {matches:[],checked:0,total:String(config.total??0),complete:false,reason:'cancelled',transformationCount:0,regionCount:0,resultCount:0};
  return new Promise((resolve,reject)=>{
    let worker,last={checked:0,total:'0'},settled=false;
    const finish=(value,error)=>{if(settled)return;settled=true;signal?.removeEventListener('abort',cancel);worker?.terminate();error?reject(error):resolve(value);};
    const cancel=()=>finish({matches:[],checked:last.checked,total:last.total,complete:false,reason:'cancelled',transformationCount:0,regionCount:0,resultCount:0});
    try{
      worker=new Worker(new URL('./search-worker.mjs',import.meta.url),{type:'module'});
      signal?.addEventListener('abort',cancel,{once:true});
      worker.onmessage=event=>{const data=event.data;if(data.type==='progress'){last=data.progress;onProgress?.(last);}else if(data.type==='result')finish(data.result);else if(data.type==='error')finish(null,new Error(data.message));};
      worker.onerror=()=>{if(settled)return;worker.terminate();signal?.removeEventListener('abort',cancel);settled=true;findMatches(rule,host,config,options).then(resolve,reject);};
      worker.postMessage({type:'search',rule:{left:serializeShape(rule.left),right:serializeShape(rule.right)},host:serializeShape(host),config:serializeDomain(config),limits});
    }catch{worker?.terminate();signal?.removeEventListener('abort',cancel);findMatches(rule,host,config,options).then(resolve,reject);}
  });
}
