import { getEquipment, equipment, setups } from '../data/catalog.js';
import { createManualSetup, upgradeManualSetup } from '../data/manualSetup.js';
import { createObandAssembly } from '../data/obandAssembly.js';
import { upgradePhotoChipSetup } from '../data/photoChipSetup.js';
import { upgradeFrontFacing } from './frontFacing.js';
import { arrangeOnBench, benchPosition } from './benchLayout.js';
import { validateSetup, connectionProblem, connectionRecord } from './setupBuilder.js';
import { housingFor, equipmentPose } from './mainframeAssembly.js';
export const draftPages=['bench_draft','equipment_draft','training_draft'];
export const draftNames={bench_draft:'Bench_draft',equipment_draft:'Equipment_draft',training_draft:'Training_draft'};
export function workspaceSeed(id='wst-optical-manual'){
  const entry=setups.find(s=>s.id===id);
  const source=entry?.published||entry?.template||(id==='wst-optical-manual'?arrangeOnBench(upgradeManualSetup(createManualSetup())):id==='oband-mainframe-assembly'?createObandAssembly():{version:1,id,name:entry?.name||'New setup',nodes:(entry?.equipment||[]).map((equipmentId,i)=>({id:`item-${i}`,equipmentId,label:'',x:40+(i%4)*230,y:40+Math.floor(i/4)*145})),connections:[]});
  return {...upgradeFrontFacing(structuredClone(source)),workspaceName:'Bench_draft',workspaceRevision:1};
}
export function validateWorkspace(data,ids=equipment.map(e=>e.id)){
  validateSetup(data,ids);
  if(!data.id||data.workspaceName!=='Bench_draft'||data.workspaceRevision!==1)throw new Error('Use a Bench_draft workspace export.');
  for(const n of data.nodes)if(n.locked!==undefined&&typeof n.locked!=='boolean')throw new Error('Invalid equipment lock.');
  for(const n of data.nodes)if(n.configuration?.signalRole!==undefined&&!['auto','source','detector','through','electrical','support'].includes(n.configuration.signalRole))throw new Error('Invalid recorded signal role.');
  return upgradeFrontFacing(upgradePhotoChipSetup(data));
}
export const contentSignature=draft=>JSON.stringify(Object.fromEntries(Object.entries(draft).filter(([key])=>!['savedAt','savedAtDraft','publishedAt'].includes(key))));
export const draftStorageKey=id=>`bench_draft:${id}`;
export function workspaceChanges(draft,published){
  if(!published)return ['No published snapshot exists for this setup.'];
  const changes=[];
  if(draft.name!==published.name)changes.push(`Setup name: ${published.name} → ${draft.name}`);
  for(const [collection,label] of [['nodes','Equipment'],['connections','Connection']]){
    const before=new Map((published[collection]||[]).map(item=>[item.id,item]));
    for(const item of draft[collection]){
      const old=before.get(item.id),name=item.label||item.id;
      if(!old)changes.push(`${label} added: ${name}`);
      else if(JSON.stringify(old)!==JSON.stringify(item))changes.push(`${label} changed: ${name}`);
      before.delete(item.id);
    }
    for(const item of before.values())changes.push(`${label} removed: ${item.label||item.id}`);
  }
  for(const key of new Set([...Object.keys(published.measurement||{}),...Object.keys(draft.measurement||{})])){
    const old=published.measurement?.[key]??'',next=draft.measurement?.[key]??'';
    if(old!==next)changes.push(`Measurement ${key}: ${old||'blank'} → ${next||'blank'}`);
  }
  if(JSON.stringify(draft.procedure??null)!==JSON.stringify(published.procedure??null))changes.push('Working guide steps changed.');
  if(JSON.stringify(draft.publication??null)!==JSON.stringify(published.publication??null))changes.push('Publication metadata changed.');
  return changes;
}
export function capabilities(node,draft){
  const item=getEquipment(node.equipmentId),category=item?.category||'';
  const connected=draft.connections.filter(c=>c.from===node.id||c.to===node.id);
  const through=['wst-fibre-arms-manual','wst-wafer-holder-manual','wst-chip-holder-manual','chip-vacuum-stage','fibre'].includes(item?.id),role=node.configuration?.signalRole||'auto';
  const opticalIn=role==='auto'?(through||connected.some(c=>c.type==='optical'&&c.to===node.id)||/Detection|Fibre optics/.test(category)):['detector','through'].includes(role);
  const opticalOut=role==='auto'?(through||connected.some(c=>c.type==='optical'&&c.from===node.id)||/Optical source|Fibre optics/.test(category)):['source','through'].includes(role);
  return {opticalIn,opticalOut,electricalIn:true,electricalOut:true,electricalKnown:connected.some(c=>c.type==='electrical')||category==='Electrical'};
}
export function portProblem(draft,from,to,type){
  const basic=connectionProblem(draft,from,to,type);if(basic)return basic;
  if(type==='optical'){
    if(!capabilities(draft.nodes.find(n=>n.id===from),draft).opticalOut)return 'This equipment has no recorded optical output. Use an optical source or fibre component.';
    if(!capabilities(draft.nodes.find(n=>n.id===to),draft).opticalIn)return 'This equipment has no recorded optical input. Use a detector, fibre component or recorded DUT.';
  }
  return '';
}
export function createDraftConnection(draft,from,to,type){const problem=portProblem(draft,from,to,type);if(problem)throw new Error(problem);return connectionRecord(draft,from,to,type);}
export function traceNetwork(draft,nodeId,edgeId,type='optical'){
  const seed=draft.connections.find(c=>c.id===edgeId);if(seed)type=seed.type;
  const nodes=new Set(seed?[seed.from,seed.to]:nodeId?[nodeId]:[]),edges=new Set(),queue=[...nodes];
  while(queue.length){const id=queue.shift();for(const c of draft.connections){if(c.type!==type||c.from!==id&&c.to!==id)continue;edges.add(c.id);for(const next of [c.from,c.to])if(!nodes.has(next)){nodes.add(next);queue.push(next);}}}
  return {nodes:[...nodes],edges:[...edges],type};
}
export function connectionChecks(draft,edge){
  const out=[];const target=draft.nodes.find(n=>n.id===edge.to),source=draft.nodes.find(n=>n.id===edge.from);
  if(!target||!source)return ['Connection endpoint is missing.'];
  if(edge.type==='optical'){
    if(!capabilities(source,draft).opticalOut||!capabilities(target,draft).opticalIn)out.push('The optical port role needs verification.');
    if(target.equipmentId==='oband-head-81624b'&&edge.toConnector!=='FC/PC')out.push('The recorded 81000FA detector input requires FC/PC. Check the destination end.');
    if(['unspecified',''].includes(edge.fibre)&&!edge.customFibre)out.push('Fibre model or free-space coupling is not recorded.');
    for(const [label,value] of [['Source',edge.fromConnector],['Destination',edge.toConnector]])if(!value||value==='Unspecified')out.push(`${label} connector is not recorded.`);
    // Different connector ends on a hybrid cable are valid. Check mating at a
    // shared sleeve instead of incorrectly comparing opposite ends of a cable.
    for(const n of [source,target])if(n.equipmentId==='wst-mating-sleeve-manual'){
      const ends=draft.connections.filter(c=>c.type==='optical'&&(c.from===n.id||c.to===n.id)).map(c=>c.from===n.id?c.fromConnector:c.toConnector).filter(c=>c&&c!=='Unspecified');
      if(ends.some(c=>c==='FC/PC')&&ends.some(c=>c==='FC/APC'))out.push(`FC/PC and FC/APC are recorded at the same mating sleeve (${n.label||n.id}). Verify this interface.`);
    }
  }else if(!capabilities(source,draft).electricalKnown||!capabilities(target,draft).electricalKnown)out.push('Electrical port functions are unconfirmed; record signal, control or power and the installed connector.');
  return [...new Set(out)];
}
export function measurementChecks(draft){
  const m=draft.measurement||{},out=[];
  if(Number.isFinite(m.startNm)&&Number.isFinite(m.stopNm)&&m.stopNm<=m.startNm)out.push('Stop wavelength must exceed start wavelength.');
  if(Number.isFinite(m.maxPowerMw)&&Number.isFinite(m.laserPowerMw)&&m.laserPowerMw>m.maxPowerMw)out.push('Laser setting exceeds the recorded DUT power limit.');
  if(Number.isFinite(m.allowedStartNm)&&Number.isFinite(m.startNm)&&m.startNm<m.allowedStartNm)out.push('Scan starts below the recorded validated path minimum.');
  if(Number.isFinite(m.allowedStopNm)&&Number.isFinite(m.stopNm)&&m.stopNm>m.allowedStopNm)out.push('Scan stops above the recorded validated path maximum.');
  for(const n of draft.nodes){const item=getEquipment(n.equipmentId);for(const [label,value] of item?.specs||[]){if(!/wavelength|range/i.test(label)||!/nm/i.test(value))continue;const match=value.match(/(\d{3,4})\s*[–—-]\s*(\d{3,4})\s*nm/);if(!match)continue;const min=Number(match[1]),max=Number(match[2]);if(Number.isFinite(m.startNm)&&m.startNm<min||Number.isFinite(m.stopNm)&&m.stopNm>max)out.push(`Scan is outside the recorded ${min}–${max} nm range of ${n.label||item.name}.`);}}
  return [...new Set(out)];
}
export function equipmentReadiness(item,node){
  const cfg=node?.configuration||{};
  return [{label:'Browser 3D model',done:Boolean(item.model3d)},{label:'Equipment picture',done:Boolean(item.image)},{label:'CAD source',done:Boolean(item.stepPath||item.nativeCad?.length)},{label:'Specifications',done:Boolean(item.specs?.length)},{label:'Dimensions',done:Boolean(cfg.dimensions||item.dimensions)},{label:'Asset / serial number',done:Boolean(cfg.serial||item.serial)},{label:'Calibration record',done:Boolean(cfg.calibration||item.calibration)},{label:'Source website',done:Boolean(item.url||cfg.specUrl)}];
}
export function benchCoordinates(node,draft){const p=equipmentPose(node,draft.nodes,benchPosition);return {x:Math.round(p.x*100),z:Math.round(p.z*100)};}
export function benchPatch(node,draft,x,z,snap=true){
  if(node.locked||housingFor(node,draft.nodes)||node.configuration?.mountingStage||node.configuration?.mount)return null;
  const round=v=>snap?Math.round(v/25)*25:Math.round(v);
  return {benchXMm:Math.max(-850,Math.min(850,round(x))),benchZMm:Math.max(-400,Math.min(400,round(z)))};
}
export function updateBenchNode(draft,id,patch){
  const parent=draft.nodes.find(n=>n.id===id);if(!parent)return draft;
  const rotation=patch.rotationDeg!==undefined?patch.rotationDeg-(parent.rotationDeg||0):0;
  const height=patch.elevationMm!==undefined?patch.elevationMm-(parent.elevationMm||0):0;
  return {...draft,nodes:draft.nodes.map(n=>n.id===id?{...n,...patch}:n.configuration?.mountingStage===id&&(rotation||height)?{...n,rotationDeg:(n.rotationDeg||0)+rotation,elevationMm:(n.elevationMm||0)+height}:n)};
}
export async function saveDraftFile(draft){
  validateWorkspace(draft);const response=await fetch('/api/library/workspace-draft',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not save draft workspace.');return result;
}
