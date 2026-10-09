import { createId } from './storage.js';
import { manualGroups, instanceFields } from '../data/manualSetup.js';
import { validateAssembly } from './mainframeAssembly.js';
export const blankSetup=()=>({version:1,name:'Untitled setup',nodes:[],connections:[]});
export const connectors=['Unspecified','FC/PC','FC/APC','SC/PC','SC/APC','LC/PC','LC/APC','Bare fibre','Other'];
export const fibres=[
  {id:'unspecified',name:'Unspecified / add custom model'},
  {id:'P3-1550PM-FC-2',name:'Thorlabs P3-1550PM-FC-2',note:'User-reported manual bench PM lead; nominal 2 m. Verify installed ends and wavelength coverage.'},
  {id:'P3-SMF28Y-FC-5',name:'Thorlabs P3-SMF28Y-FC-5',note:'Presentation reference: SM, 1260–1625 nm, 5 m. Verify actual cable and connector ends.'},
  {id:'P3-1550PM-FC-5',name:'Thorlabs P3-1550PM-FC-5',note:'Presentation reference: PM, 1550 nm, 5 m. Verify actual cable and connector ends.'},
  {id:'custom',name:'Custom fibre / vendor model'},
];
export function addNode(equipmentId,index,x,y) {return {id:createId(),equipmentId,label:'',x:x??80+(index%4)*210,y:y??50+(Math.floor(index/4)%4)*145};}
export const signalPosition=(node,index)=>({signalX:node.signalX??50+(index%4)*250,signalY:node.signalY??60+Math.floor(index/4)*145});
export function addSignalNode(equipmentId,index,x,y){
  if(!Number.isFinite(x)||!Number.isFinite(y))return addNode(equipmentId,index);
  const layout=clampPosition(x,y);
  return {...addNode(equipmentId,index,layout.x,layout.y),signalX:Math.max(0,Math.min(880,x)),signalY:Math.max(0,Math.min(5000,y))};
}
export function newConnection(from,to) {return {id:createId(),from,to,type:'optical',fromPort:'Output',toPort:'Input',fibre:'unspecified',customFibre:'',fromConnector:'Unspecified',toConnector:'Unspecified',length:'',notes:''};}
export function connectionRecord(setup,from,to,type){return {...newConnection(from,to),type,...(type==='optical'&&setup.nodes.find(n=>n.id===to)?.equipmentId==='oband-head-81624b'?{toPort:'81000FA adapter · 81624B optical input',toConnector:'FC/PC'}:{})};}
export function connectionProblem(setup,from,to,type) {
  if(!setup.nodes.some(n=>n.id===from)||!setup.nodes.some(n=>n.id===to)||from===to)return 'Connect two different equipment items.';
  if(setup.connections.length>=300)return 'Maximum 300 connections per setup.';
  if(setup.connections.some(c=>c.from===from&&c.to===to&&c.type===type))return 'This path already exists. Select the line to edit its details.';
  return '';
}
export function validateSetup(data,equipmentIds) {
  if(data?.version!==1||typeof data.name!=='string'||!Array.isArray(data.nodes)||!Array.isArray(data.connections)||data.nodes.length>100||data.connections.length>300) throw new Error('Use a version 1 setup file with up to 100 equipment items and 300 connections.');
  const ids=new Set();
  for(const n of data.nodes) {if(typeof n.id!=='string'||ids.has(n.id)||!equipmentIds.includes(n.equipmentId)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||n.x<0||n.x>880||n.y<0||n.y>510||typeof n.label!=='string') throw new Error('Invalid or unknown equipment in this setup.');for(const key of ['elevationMm','rotationDeg','benchXMm','benchZMm'])if(n[key]!==undefined&&(!Number.isFinite(n[key])||Math.abs(n[key])>5000))throw new Error('Invalid bench height or rotation.');ids.add(n.id);}
  if(data.id!==undefined && !/^[a-z0-9][a-z0-9-]{0,79}$/.test(data.id)) throw new Error('Invalid setup ID.');
  if(data.photoEvidence!==undefined){
    const p=data.photoEvidence;
    const reference=value=>typeof value==='string'&&value.length<=500&&/^library\/references\/[a-zA-Z0-9 _./-]+$/.test(value)&&!value.split('/').includes('..');
    if(!p||p.version!==1||!Array.isArray(p.files)||!p.files.length||p.files.length>12||p.files.some(file=>!reference(file)||!/\.(jpg|jpeg|png|webp)$/i.test(file))||!reference(p.manifest)||!p.manifest.endsWith('.json')||typeof p.guide!=='string'||!/^documents\/[a-zA-Z0-9_-]+\.md$/.test(p.guide)||typeof p.warning!=='string'||p.warning.length>10000)throw new Error('Invalid photo evidence: use local reference images, a manifest and a Markdown guide.');
  }
  for(const n of data.nodes)for(const [key,max] of [['signalX',880],['signalY',5000]])if(n[key]!==undefined&&(!Number.isFinite(n[key])||n[key]<0||n[key]>max))throw new Error('Invalid signal-path position.');
  if(data.measurement!==undefined){
    if(!data.measurement||typeof data.measurement!=='object'||Array.isArray(data.measurement)) throw new Error('Invalid measurement settings.');
    for(const [key,,type] of manualGroups.flatMap(g=>g.fields)) {
      const v=data.measurement[key];if(v===undefined||v==='')continue;
      if(type==='number'?(typeof v!=='number'||!Number.isFinite(v)||v<0&&key!=='temperatureC'):typeof v!=='string'||v.length>10000) throw new Error(`Invalid measurement setting: ${key}.`);
    }
  }
  for(const n of data.nodes) if(n.configuration!==undefined){
    if(!n.configuration||typeof n.configuration!=='object'||Array.isArray(n.configuration))throw new Error('Invalid equipment configuration.');
    for(const [key] of instanceFields)if(n.configuration[key]!==undefined&&(typeof n.configuration[key]!=='string'||n.configuration[key].length>10000))throw new Error(`Invalid equipment field: ${key}.`);
  }
  if(data.procedure!==undefined&&(!Array.isArray(data.procedure)||data.procedure.length>50||data.procedure.some(s=>typeof s.title!=='string'||typeof s.text!=='string'||s.title.length>300||s.text.length>10000)))throw new Error('Invalid working guide.');
  const edges=new Set();
  for(const c of data.connections) {
    if(typeof c.id!=='string'||edges.has(c.id)||!ids.has(c.from)||!ids.has(c.to)||c.from===c.to||!['optical','electrical'].includes(c.type)) throw new Error('Invalid connection in this setup.');
    for(const k of ['fromPort','toPort','fibre','customFibre','fromConnector','toConnector','length','notes']) if(typeof c[k]!=='string') throw new Error('Connection details are incomplete.');
    edges.add(c.id);
  }
  validateAssembly(data.nodes);
  return data;
}
export const clampPosition=(x,y)=>({x:Math.max(0,Math.min(880,x)),y:Math.max(0,Math.min(510,y))});
