import { equipment, setups } from '../data/catalog.js';
import { validateSetup } from './setupBuilder.js';
const originalSetups=structuredClone(setups);
export const publicationDefaults=draft=>{
  const original=originalSetups.find(s=>s.id===draft.id);
  return {scale:original?.scale||'Wafer',mode:original?.mode||'Optical',bands:original?.bands||(draft.id==='oband-mainframe-assembly'?['O-band']:['C-band']),lab:original?.lab||'Local bench · location to confirm',description:original?.description||'Published equipment layout, connections and working guide.',...draft.publication};
};
export function validatePublication(data,equipmentIds){
  validateSetup(data,equipmentIds);
  if(!data.id||!data.name.trim()||!data.nodes.length)throw new Error('Set a setup ID and name, and add equipment before publishing.');
  const p=data.publication;
  if(!p||!['Wafer','Chip'].includes(p.scale)||!['Optical','Electrical'].includes(p.mode)||!Array.isArray(p.bands)||new Set(p.bands).size!==p.bands.length||p.bands.some(b=>!['C-band','O-band','MIR','Visible'].includes(b)))throw new Error('Check the publication scale, mode and wavelength bands.');
  if(p.mode==='Optical'&&!p.bands.length)throw new Error('Select at least one wavelength band for optical measurements.');
  for(const key of ['lab','description'])if(typeof p[key]!=='string'||p[key].length>10000)throw new Error(`Check publication ${key}.`);
  return data;
}
export function publishedCatalogEntry(data,original=originalSetups.find(s=>s.id===data.id)){
  const p=data.publication;
  return {...original,id:data.id,name:data.name,subtitle:`${p.scale} · ${p.mode} · published builder layout`,scale:p.scale,mode:p.mode,bands:p.bands,status:'Published',lab:p.lab,description:p.description,capabilities:original?.capabilities||['Published equipment arrangement','Recorded optical and electrical paths'],equipment:[...new Set(data.nodes.map(n=>n.equipmentId))],kind:original?.kind||(p.mode==='Electrical'?'electrical':'optical'),photos:original?.photos||[],source:original?.source||'deck',guide:original?.guide||(p.mode==='Electrical'?'electrical':'optical'),note:original?.note||'Published layout is a documentation record. Confirm operating limits and the approved local procedure.',published:data,publishedAt:data.publishedAt};
}
export function applyPublishedSetups(items){
  if(!Array.isArray(items)||new Set(items.map(s=>s.id)).size!==items.length)throw new Error('Invalid published setup library.');
  items.forEach(s=>validatePublication(s,equipment.map(e=>e.id)));
  const merged=new Map(originalSetups.map(s=>[s.id,s]));
  items.forEach(s=>merged.set(s.id,publishedCatalogEntry(s)));
  setups.splice(0,setups.length,...merged.values());
}
export async function loadPublishedSetups(){
  const response=await fetch(`${import.meta.env.BASE_URL}library/published/index.json`,{cache:'no-store'});
  if(response.status===404)return;
  if(!response.ok)throw new Error('Could not load published setups.');
  const data=await response.json();
  if(data.version!==1)throw new Error('Invalid published setup library version.');
  applyPublishedSetups(data.setups);
}
export async function publishSetup(draft){
  const snapshot=validatePublication({...structuredClone(draft),publication:publicationDefaults(draft)},equipment.map(e=>e.id));
  const response=await fetch('/api/library/publish',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(snapshot)});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||'Could not publish setup.');
  await loadPublishedSetups();
  window.dispatchEvent(new Event('cs-library-published'));
  return result;
}
