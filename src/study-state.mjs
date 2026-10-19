export const STUDY_KEY='ShapeGrammar.study.v1';
export const MAX_STUDY_BYTES=1048576;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const notes=value=>{if(typeof value!=='string'||value.length>20000)throw new TypeError('Each note must be text of at most 20,000 characters.');return value;};
export function emptyStudy(){return {format:'ShapeGrammar.study',version:1,lessons:{},sources:{}};}
export function parseStudy(text,lessons,sourceIDs){
  if(typeof text!=='string'||text.length>MAX_STUDY_BYTES||new TextEncoder().encode(text).length>MAX_STUDY_BYTES)throw new TypeError('Study files must be no larger than 1 MiB.');
  const data=JSON.parse(text),lessonMap=new Map(lessons.map(l=>[l.id,l])),sources=new Set(sourceIDs);
  if(!object(data)||data.format!=='ShapeGrammar.study'||data.version!==1||!object(data.lessons)||!object(data.sources))throw new TypeError('Unsupported learning-data format.');
  const result=emptyStudy();
  for(const [id,value] of Object.entries(data.lessons)){
    const lesson=lessonMap.get(id);if(!lesson||!object(value)||!object(value.answers)||typeof value.practiced!=='boolean')throw new TypeError('Unknown lesson or malformed progress.');
    const answers={};for(const [index,answer] of Object.entries(value.answers)){
      if(!/^\d+$/.test(index)||String(Number(index))!==index||!lesson.checks[Number(index)]||!Number.isInteger(answer)||answer<0||answer>=lesson.checks[Number(index)].options.length)throw new TypeError('Invalid knowledge-check answer.');
      answers[index]=answer;
    }
    result.lessons[id]={answers,practiced:value.practiced,notes:notes(value.notes)};
  }
  for(const [id,value] of Object.entries(data.sources)){
    if(!sources.has(id)||!object(value))throw new TypeError('Unknown reference or malformed note.');
    result.sources[id]={notes:notes(value.notes)};
  }
  return result;
}
export function progressFor(lesson,state){
  const entry=state.lessons[lesson.id];
  const correct=lesson.checks.reduce((n,q,i)=>n+(entry?.answers[i]===q.answer?1:0),0);
  return {correct,total:lesson.checks.length,complete:correct===lesson.checks.length&&entry?.practiced===true};
}
export class StudyStore{
  constructor(storage,lessons,sourceIDs){this.storage=storage;this.lessons=lessons;this.sourceIDs=sourceIDs;this.state=emptyStudy();this.blocked=false;this.recovery=null;this.error=null;
    try{const raw=storage?.getItem(STUDY_KEY);if(raw!==null&&raw!==undefined){this.recovery=raw;this.state=parseStudy(raw,lessons,sourceIDs);this.recovery=null;}}
    catch(error){this.blocked=true;this.error=error.message;}
  }
  export(){return JSON.stringify(this.state,null,2);}
  save(){if(this.blocked)throw new Error('Existing saved data could not be read. Export a recovery copy, then import valid data or reset before saving.');if(!this.storage)throw new Error('Browser storage is unavailable. Download your learning data to keep it.');const text=this.export();if(new TextEncoder().encode(text).length>MAX_STUDY_BYTES)throw new Error('Learning data exceeds 1 MiB. Download a copy and shorten notes.');this.storage.setItem(STUDY_KEY,text);}
  lesson(id){if(!this.lessons.some(l=>l.id===id))throw new TypeError('Unknown lesson.');return this.state.lessons[id]??={answers:{},practiced:false,notes:''};}
  answer(id,index,value){const lesson=this.lessons.find(l=>l.id===id);if(!lesson?.checks[index]||!Number.isInteger(value)||value<0||value>=lesson.checks[index].options.length)throw new TypeError('Invalid answer.');this.lesson(id).answers[index]=value;this.save();}
  practiced(id,value){this.lesson(id).practiced=Boolean(value);this.save();}
  note(kind,id,value){notes(value);if(kind==='lesson')this.lesson(id).notes=value;else{if(!this.sourceIDs.includes(id))throw new TypeError('Unknown source.');this.state.sources[id]={notes:value};}this.save();}
  import(text){const next=parseStudy(text,this.lessons,this.sourceIDs);if(!this.storage)throw new Error('Browser storage is unavailable.');this.storage.setItem(STUDY_KEY,JSON.stringify(next));this.state=next;this.blocked=false;this.error=null;this.recovery=null;}
  reset(){if(!this.storage)throw new Error('Browser storage is unavailable.');this.storage.removeItem(STUDY_KEY);this.state=emptyStudy();this.blocked=false;this.error=null;this.recovery=null;}
}
