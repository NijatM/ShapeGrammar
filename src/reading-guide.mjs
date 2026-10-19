export const REVIEW_LEVELS=Object.freeze({
  'full-text':'Full text reviewed',
  'selected-sections':'Selected sections reviewed',
  'abstract-only':'Abstract / description reviewed',
  'bibliographic-only':'Publication details only',
  'secondary-citation-only':'Supporting citation only'
});
const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const https=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
export function validateReadingGuide(guide,id){
  const fail=message=>{throw new TypeError(`Invalid reading guide ${id}: ${message}`);};
  if(!guide||guide.schema_version!==1||guide.source_id!==id)fail('identity or version');
  if(!Object.hasOwn(REVIEW_LEVELS,guide.review?.level))fail('review level');
  if(!guide.kind||!guide.review.material||!guide.review.limitations||!/^\d{4}-\d{2}-\d{2}$/.test(guide.review.date??''))fail('review scope');
  const evidence=guide.review.evidence;
  if(!Array.isArray(evidence)||!evidence.length||evidence.some(v=>!https(v.url)||!v.locator||!v.description))fail('evidence');
  if(!https(guide.original?.url)||!guide.original.label||!['full-text','publication-record','citation-evidence'].includes(guide.original.type))fail('original link');
  if(!Array.isArray(guide.sections)||guide.sections.length<3||!guide.sections.some(s=>s.id==='overview'))fail('sections');
  const ids=new Set();
  for(const section of guide.sections){
    if(!/^[a-z][a-z-]*$/.test(section.id??'')||ids.has(section.id)||!section.title||typeof section.text!=='string'||!section.text.trim())fail('section identity/text');
    ids.add(section.id);
    if(!Array.isArray(section.evidence)||!section.evidence.length||section.evidence.some(n=>!Number.isInteger(n)||n<0||n>=evidence.length))fail('section citations');
  }
  if(!Array.isArray(guide.reading_path)||guide.reading_path.some(v=>!v.label||!v.locator||!https(v.url)))fail('reading path');
  if(!Array.isArray(guide.terms)||guide.terms.some(v=>!v.term||!v.meaning))fail('terms');
  return guide;
}
export function readingGuideHTML(guide){
  validateReadingGuide(guide,guide.source_id);
  const citations=refs=>`<span class="reading-citations">${[...new Set(refs)].map(n=>`<button type="button" data-reading-anchor="reading-evidence-${n+1}" aria-label="Reading evidence ${n+1}">[${n+1}]</button>`).join(' ')}</span>`;
  const overview=guide.sections.find(s=>s.id==='overview');
  const others=guide.sections.filter(s=>s.id!=='overview');
  return `<section class="reading-guide" aria-label="Reading notes"><div class="reading-scope"><p class="eyebrow">${e(guide.kind)} / ${e(REVIEW_LEVELS[guide.review.level])}</p><p>${e(guide.review.material)}</p></div><section id="reading-overview" class="reading-summary"><h2>${e(overview.title)}</h2><p>${e(overview.text)} ${citations(overview.evidence)}</p></section><nav class="reading-outline" aria-label="In this reading note">${others.map(s=>`<button type="button" data-reading-anchor="reading-${e(s.id)}">${e(s.title)}</button>`).join('')}</nav>${others.map(s=>`<section id="reading-${e(s.id)}" class="reading-section"><h2>${e(s.title)}</h2><p>${e(s.text)} ${citations(s.evidence)}</p></section>`).join('')}${guide.terms.length?`<section class="reading-terms"><h2>A few useful terms</h2><dl>${guide.terms.map(t=>`<dt>${e(t.term)}</dt><dd>${e(t.meaning)}</dd>`).join('')}</dl></section>`:''}${guide.reading_path.length?`<section class="reading-route"><h2>Where to look in the original</h2><ol>${guide.reading_path.map(p=>`<li><a href="${e(p.url)}" target="_blank" rel="noopener noreferrer">${e(p.label)} ↗</a><span>${e(p.locator)}</span></li>`).join('')}</ol></section>`:''}<details class="reading-evidence"><summary>Passages and review scope</summary><p>${e(guide.review.limitations)}</p><ol>${guide.review.evidence.map((v,i)=>`<li id="reading-evidence-${i+1}" tabindex="-1"><a href="${e(v.url)}" target="_blank" rel="noopener noreferrer">${e(v.locator)} ↗</a><p>${e(v.description)}</p></li>`).join('')}</ol><p class="small">Reviewed ${e(guide.review.date)}. These are condensed reading notes in my own words. Follow the original for the full argument, figures and qualifications.</p></details></section>`;
}
