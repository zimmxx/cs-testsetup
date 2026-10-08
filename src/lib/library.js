import { equipment } from '../data/catalog.js';
const original = structuredClone(equipment);
export async function libraryStatus() {
  // Production hosting is static; its file-writing API exists only in Vite dev.
  if (!import.meta.env?.DEV) return null;
  try { const response=await fetch('/api/library/status'); return response.ok?await response.json():null; }
  catch { return null; }
}
export function validateEquipment(item) {
  if (!item || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(item.id)) throw new Error('Use a unique ID with lowercase letters, numbers and hyphens.');
  for (const key of ['name','model','category','location','status','role','alternatives','note']) if (typeof item[key] !== 'string' || (['name','model','category'].includes(key) && !item[key].trim())) throw new Error(`Check the ${key} field.`);
  if (!Array.isArray(item.specs) || item.specs.some(row=>!Array.isArray(row)||row.length!==2||row.some(v=>typeof v!=='string'))) throw new Error('Specifications must be label / value pairs.');
  if (item.url && !/^https?:\/\//i.test(item.url)) throw new Error('Manufacturer link must start with https:// or http://.');
  for (const key of ['image','model3d']) if (item[key] && !/^library\/(images|models)\/[a-zA-Z0-9._-]+$/.test(item[key])) throw new Error('Assets must be inside library/images or library/models.');
  if(item.stepPath&&!/^library\/references\/[a-zA-Z0-9 _./-]+\.(step|stp)$/i.test(item.stepPath))throw new Error('STEP files must be inside library/references.');
  if(item.stepPath?.split('/').some(segment=>segment==='..'))throw new Error('STEP paths cannot traverse folders.');
  if(item.nativeCad!==undefined&&(!Array.isArray(item.nativeCad)||item.nativeCad.length>10||item.nativeCad.some(asset=>typeof asset.label!=='string'||asset.label.length>500||typeof asset.path!=='string'||!/^library\/references\/[a-zA-Z0-9 _./-]+\.(sldprt|sldasm)$/i.test(asset.path)||asset.path.split('/').includes('..'))))throw new Error('Native CAD must link to local SolidWorks source files.');
  if(item.nativeCadNote!==undefined&&(typeof item.nativeCadNote!=='string'||item.nativeCadNote.length>10000))throw new Error('Invalid native CAD note.');
  for(const key of ['cadKind','cadReview','cadSource'])if(item[key]!==undefined&&(typeof item[key]!=='string'||item[key].length>10000))throw new Error('Invalid CAD provenance.');
  return item;
}
export function applyLibrary(items) {
  const merged = new Map(original.map(item=>[item.id,item]));
  items.forEach(item=>merged.set(item.id,validateEquipment(item)));
  equipment.splice(0,equipment.length,...merged.values());
}
export async function loadLibrary() {
  const response=await fetch(`${import.meta.env.BASE_URL}library/equipment.json`,{cache:'no-store'});
  if (!response.ok) throw new Error('Could not load the equipment library.');
  const data=await response.json();
  if (!Array.isArray(data.equipment)) throw new Error('Invalid equipment library.');
  applyLibrary(data.equipment);
}
export async function saveEquipment(item) {
  validateEquipment(item);
  const next=equipment.filter(e=>e.id!==item.id).concat(item);
  const response=await fetch('/api/library/equipment',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:1,equipment:next})});
  const result=await response.json();
  if (!response.ok) throw new Error(result.error||'Could not save to the project folder.');
  applyLibrary(next);
}
export async function uploadAsset(file,kind,id,axis='y') {
  if (file.size>40*1024*1024) throw new Error('Maximum asset size is 40 MB.');
  const response=await fetch(`/api/library/assets?kind=${kind}&id=${encodeURIComponent(id)}&name=${encodeURIComponent(file.name)}&axis=${axis==='z'?'z':'y'}`,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file});
  const result=await response.json();
  if (!response.ok) throw new Error(result.error||'Asset upload failed.');
  return kind==='step'?result:result.path;
}
