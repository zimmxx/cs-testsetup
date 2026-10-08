// Mechanical installation is separate from optical/electrical signal paths.
export const MAINFRAME_ID='wst-mainframe-manual';
export const OBAND_MAINFRAME_ID='oband-mainframe-8164b';
export const MODULE_IDS=['wst-laser-old','wst-sensor-old','oband-laser-81606a','oband-head-interface'];
export const frameProfile=node=>node?.equipmentId===MAINFRAME_ID?{model:'8163B',slots:['1','2'],width:2.13,depth:3.8,height:.96}:node?.equipmentId===OBAND_MAINFRAME_ID?{model:'8164B',slots:['1','2','3','4','0'],width:4.26,depth:5.45,height:1.53}:null;
export const isMainframe=node=>Boolean(frameProfile(node));
export const isCompactModule=node=>MODULE_IDS.includes(node?.equipmentId);
export function acceptsModule(frame,slot,module){
  const profile=frameProfile(frame);slot=String(slot);
  if(!profile?.slots.includes(slot)||!isCompactModule(module))return false;
  if(profile.model==='8163B')return ['wst-laser-old','wst-sensor-old'].includes(module.equipmentId);
  return slot==='0'?module.equipmentId==='oband-laser-81606a':['wst-laser-old','wst-sensor-old','oband-head-interface'].includes(module.equipmentId);
}
export function installedModule(nodes,frameId,slot){return nodes.find(n=>n.configuration?.mainframeId===frameId&&n.configuration?.mainframeSlot===String(slot));}
export function housingFor(node,nodes){
  const frame=nodes.find(n=>n.id===node.configuration?.mainframeId);
  return acceptsModule(frame,node.configuration?.mainframeSlot,node)?frame:null;
}
export function syncModuleSettings(setup){
  if(!['wst-optical-manual','oband-mainframe-assembly'].includes(setup.id))return setup;
  const oband=setup.id==='oband-mainframe-assembly';
  const laser=setup.nodes.find(n=>n.id===(oband?'oband-laser':'laser')),sensor=setup.nodes.find(n=>n.id===(oband?'oband-interface':'sensor'));
  const frame=housingFor(sensor||{},setup.nodes);
  return {...setup,measurement:{...setup.measurement,laserSlot:laser?.configuration?.mainframeSlot||'',sensorSlot:sensor?.configuration?.mainframeSlot||'',sensorMainframe:frame?`Keysight ${frameProfile(frame).model} · ${frame.label||frame.id}`:''}};
}
export function assignModule(setup,frameId,slot,moduleId){
  const frame=setup.nodes.find(n=>n.id===frameId),module=setup.nodes.find(n=>n.id===moduleId);
  if(!frameProfile(frame)?.slots.includes(String(slot)))throw new Error('Select an existing mainframe and one of its slots.');
  if(moduleId&&!acceptsModule(frame,slot,module))throw new Error(frameProfile(frame).model==='8164B'?(String(slot)==='0'?'Slot 0 accepts the 81606A back-loadable tunable laser.':'Slots 1–4 accept compact modules or the optical head interface. The 81624B is an external head.'):'These slots accept the 81940A laser or 81634B sensor.');
  const occupant=installedModule(setup.nodes,frameId,slot);
  if(occupant?.id===moduleId)return setup;
  const previousFrame=module&&housingFor(module,setup.nodes),previousSlot=module?.configuration?.mainframeSlot;
  const nodes=setup.nodes.map(n=>{
    if(n.id!==moduleId&&n.id!==occupant?.id)return n;
    const configuration={...n.configuration};
    delete configuration.mainframeId;delete configuration.mainframeSlot;
    if(n.id===moduleId)Object.assign(configuration,{mainframeId:frameId,mainframeSlot:String(slot)});
    else if(previousFrame&&acceptsModule(previousFrame,previousSlot,n))Object.assign(configuration,{mainframeId:previousFrame.id,mainframeSlot:previousSlot});
    return {...n,configuration};
  });
  return syncModuleSettings({...setup,nodes});
}
export function removeAssemblyNode(setup,id){
  return syncModuleSettings({...setup,nodes:setup.nodes.filter(n=>n.id!==id).map(n=>{
    if(n.configuration?.mainframeId!==id&&n.configuration?.mountingStage!==id)return n;
    const configuration={...n.configuration};
    if(configuration.mainframeId===id){delete configuration.mainframeId;delete configuration.mainframeSlot;}
    if(configuration.mountingStage===id)delete configuration.mountingStage;
    return {...n,configuration};
  }),connections:setup.connections.filter(c=>c.from!==id&&c.to!==id)});
}
export function addMainframeDefaults(setup){
  if(setup.id!=='wst-optical-manual'||setup.mainframeRevision>=1)return setup;
  const frame=setup.nodes.find(n=>n.equipmentId===MAINFRAME_ID);
  if(!frame)return {...setup,mainframeRevision:1};
  let next=setup;
  for(const [id,defaultSlot,setting] of [['laser','1','laserSlot'],['sensor','2','sensorSlot']]){
    const node=next.nodes.find(n=>n.id===id);
    // An explicit existing installation always wins over a default.
    if(!isCompactModule(node)||node.configuration?.mainframeId||node.configuration?.mainframeSlot)continue;
    const requested=String(setup.measurement?.[setting]||defaultSlot);
    const slot=['1','2'].includes(requested)?requested:defaultSlot;
    const free=installedModule(next.nodes,frame.id,slot)?(['1','2'].find(s=>!installedModule(next.nodes,frame.id,s))):slot;
    if(free)next=assignModule(next,frame.id,free,id);
  }
  return {...next,mainframeRevision:1};
}
export function validateAssembly(nodes){
  const occupied=new Set();
  for(const n of nodes){
    const c=n.configuration||{};
    if(c.mainframeId===undefined&&c.mainframeSlot===undefined)continue;
    if(typeof c.mainframeId!=='string'||!housingFor(n,nodes))throw new Error('Invalid mainframe installation: choose a compatible module and a valid housing slot.');
    const key=`${c.mainframeId}:${c.mainframeSlot}`;
    if(occupied.has(key))throw new Error('A mainframe slot can contain only one module.');
    occupied.add(key);
  }
}
// Approximate front-panel geometry in viewer units (1 unit = 100 mm).
// Slot numbers are an editable presentation convention pending a bench photo.
export const slotOffset=slot=>({x:slot==='1'?-.52:-.88,y:.14,z:-2.07});
export function moduleOffset(frame,slot){
  if(frameProfile(frame)?.model!=='8164B')return slotOffset(slot);
  return slot==='0'?{x:-1.2,y:.14,z:-2.94}:{x:-.66-(Number(slot)-1)*.36,y:.54,z:-2.94};
}
export function equipmentPose(node,nodes,basePosition){
  const frame=housingFor(node,nodes);
  if(!frame)return {...basePosition(node,nodes),rotationDeg:node.rotationDeg||0};
  const origin=basePosition(frame,nodes),offset=moduleOffset(frame,node.configuration.mainframeSlot),angle=(frame.rotationDeg||0)*Math.PI/180;
  return {x:origin.x+offset.x*Math.cos(angle)+offset.z*Math.sin(angle),y:origin.y+offset.y,z:origin.z-offset.x*Math.sin(angle)+offset.z*Math.cos(angle),rotationDeg:frame.rotationDeg||0};
}
