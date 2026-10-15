import * as THREE from 'three';
import { worldMotion } from './simulation.js';
import { locatePaddleAnchors } from './paddleAnchors.js';
import { prepareTechnician, disposeAvatar } from './technicianAvatar.js';
// Optional layer. It never alters the source setup, GLB or imported CAD joints.
export function createSimulationLayer(scene,roots,paths,nodes,runtime,options={}){
 const home=new Map(roots.map(r=>[r.userData.nodeId,{position:r.position.clone(),quaternion:r.quaternion.clone()}]));
 const operator=new THREE.Group();scene.add(operator);
 let avatar=null,disposed=false;operator.visible=false;operator.position.set(-5,-5.8,5.5);
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.65});
 const knobs=[];
 for(const group of ['input','output','dut'])for(let i=0;i<3;i++){
  const k=new THREE.Group(),disc=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.16,24),material('#2f536d'));disc.rotation.x=Math.PI/2;k.add(disc);
  const tick=new THREE.Mesh(new THREE.BoxGeometry(.035,.14,.025),material('#d5f4f4'));tick.position.set(0,.07,.1);k.add(tick);scene.add(k);knobs.push({group,axis:['x','y','z'][i],index:i,mesh:k});
 }
 paths.forEach(p=>{p.baseCurve=p.curve;});
 const photons=[];for(const p of paths)if(p.edge.type==='optical'){
  p.baseCurve=p.curve;for(let j=0;j<3;j++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.065,8,6),new THREE.MeshBasicMaterial({color:'#88eaff',toneMapped:false}));scene.add(mesh);photons.push({path:p,mesh,phase:j/3});}
 }
 const carriages=['input','output','dut'].map(group=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(group==='dut'?1.15:.6,.03,group==='dut'?.85:.6),material('#79969f'));scene.add(mesh);return {group,mesh};});
 const paddles=[];for(const n of nodes.filter(n=>/polarisation|polarization/.test(n.equipmentId)).slice(0,1))for(let i=0;i<3;i++){const mesh=new THREE.Mesh(new THREE.TorusGeometry(1,.045,8,48),material('#4bafac'));scene.add(mesh);mesh.name=`Paddle ${i+1} alignment ring`;mesh.visible=false;paddles.push({id:n.id,index:i,mesh});}
 const paddleModels=new Map(),paddleAnchors=new Map();
 const sourceLeds=(runtime.current?.model.sources||[]).map(n=>{const root=roots.find(r=>r.userData.nodeId===n.id);if(!root)return null;const mesh=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),new THREE.MeshBasicMaterial({color:'#6c7c89',toneMapped:false}));mesh.position.set(0,.16,.08);root.add(mesh);return {id:n.id,mesh};}).filter(Boolean);
 if(options.loadTechnician){options.loadTechnician(gltf=>{if(disposed){disposeAvatar(gltf.scene);return;}try{avatar=prepareTechnician(gltf);operator.add(avatar.root);options.onTechnician?.('loaded');options.onReady?.();}catch(error){console.warn('Technician preparation failed',error);disposeAvatar(gltf.scene);options.onTechnician?.('unavailable');}},error=>{if(!disposed){console.warn('Technician loading failed',error);options.onTechnician?.('unavailable');}});}
 let geometryKey='';
 return {operator,dispose(){disposed=true;avatar?.dispose();},update(time){
  const data=runtime.current;if(!data)return;const s=data.settings,m=data.model,offsets=new Map();
  // NanoMax bases remain bolted in their initial bench pose; only arm roots move.
  for(const id of [m.inputStage,m.outputStage]){const base=roots.find(r=>r.userData.nodeId===id),h=home.get(id);if(base&&h){base.position.copy(h.position);base.quaternion.copy(h.quaternion);}}
  for(const [group,id] of [['input',m.input],['output',m.output],['dut',m.dut]]){
   if(!id||!home.has(id))continue;const v=s.motion[group],h=home.get(id),root=roots.find(r=>r.userData.nodeId===id);
   // mm -> viewer units, with an explicit visual magnification for µm motions.
   const position=worldMotion(v,group),d=new THREE.Vector3(position.x,position.y,position.z).multiplyScalar(s.exaggeration/100000);offsets.set(id,d);
   root.position.copy(h.position).add(d);root.quaternion.copy(h.quaternion);
   if(group==='dut')root.rotateY(v.yaw*Math.PI/180);else{
    root.rotateZ((v.angle-s.targetAngle)*Math.PI/180*(group==='input'?1:-1));
    const foot=root.userData.mountPresentation?.armFoot;
    if(foot){const pivot=new THREE.Vector3().fromArray(foot);root.position.add(pivot.clone().applyQuaternion(h.quaternion)).sub(pivot.applyQuaternion(root.quaternion));}
   }
   offsets.set(id,root.position.clone().sub(h.position));
  }
  const key=JSON.stringify([...offsets].map(([id,v])=>[id,v.x,v.y,v.z]));
  if(key!==geometryKey){geometryKey=key;for(const p of paths){
   const a=offsets.get(p.edge.from)||new THREE.Vector3(),b=offsets.get(p.edge.to)||new THREE.Vector3(),points=[];
   for(let i=0;i<=40;i++){const u=i/40;points.push(p.baseCurve.getPoint(u).addScaledVector(a,1-u).addScaledVector(b,u));}
   p.curve=new THREE.CatmullRomCurve3(points);p.line.geometry.dispose();p.line.geometry=new THREE.TubeGeometry(p.curve,48,.025,6,false);
   const end=p.curve.getPoint(1);p.arrow.position.copy(end);p.arrow.setDirection(end.clone().sub(p.curve.getPoint(.94)).normalize());
  }}
  const tint=s.wavelengthNm===1310?'#d899ff':'#6af1ef';
  for(const led of sourceLeds)led.mesh.material.color.set(s.laserOn&&led.id===data.sourceId?tint:'#6c7c89');
  for(const p of paths)if(p.edge.type==='optical'){
   const power=data.optics.powers[p.edge.id]||0,on=power>1e-9;p.line.material.color.set(on?tint:'#7e8b9d');p.line.material.emissive.set(on?tint:'#000000');p.line.material.emissiveIntensity=on?.35+.4*Math.min(1,power/Math.max(.001,s.powerMw)):0;p.arrow.setColor(new THREE.Color(on?tint:'#7e8b9d'));
  }
  for(const {path,mesh,phase} of photons){const p=data.optics.powers[path.edge.id]||0;mesh.visible=s.photons&&p>1e-9;mesh.material.color.set(tint);mesh.position.copy(path.curve.getPoint(((s.animate?time:0)*.22+phase)%1));mesh.scale.setScalar(.5+Math.min(1,p/Math.max(.001,s.powerMw))*.7);}
  for(const k of knobs){const stageId=m[`${k.group}Stage`],h=home.get(stageId);k.mesh.visible=Boolean(h);if(!h)continue;k.mesh.position.copy(h.position).add(new THREE.Vector3((k.index-1)*.4,.6,1.15));k.mesh.rotation.z=-s.motion[k.group][k.axis]/s.pitch*Math.PI*2;}
  for(const c of carriages){const root=roots.find(r=>r.userData.nodeId===m[c.group]);c.mesh.visible=Boolean(root);if(root){const foot=root.userData.mountPresentation?.armFoot;c.mesh.position.copy(foot?root.localToWorld(new THREE.Vector3().fromArray(foot)):root.position).add(new THREE.Vector3(0,-.015,0));c.mesh.quaternion.copy(root.quaternion);}}
  for(const p of paddles){
   const root=roots.find(r=>r.userData.nodeId===p.id),model=root?.userData.modelRoot;
   if(model&&paddleModels.get(p.id)!==model){paddleModels.set(p.id,model);paddleAnchors.set(p.id,locatePaddleAnchors(model,root));}
   const anchor=paddleAnchors.get(p.id)?.[p.index];p.mesh.visible=Boolean(anchor);if(!anchor)continue;
   p.mesh.position.copy(root.localToWorld(anchor.center.clone()));p.mesh.scale.setScalar(anchor.radius);
   p.mesh.quaternion.copy(root.getWorldQuaternion(new THREE.Quaternion())).multiply(anchor.quaternion);p.mesh.rotateX(s.paddles[p.index]*Math.PI/180);
  }
  operator.visible=s.operator&&Boolean(avatar);const action=data.action||'',walk=/Prepare/.test(action),control=/Scan/i.test(action)?'dut':/output/i.test(action)?'output':data.playing?'input':data.target||'input',target=home.get(m[`${control}Stage`])?.position;
  const destination=new THREE.Vector3(target?Math.max(-6,Math.min(5,target.x-1.2)):-5,-5.8,walk?8:5.5),walking=operator.position.distanceTo(destination)>.15;
  operator.position.lerp(destination,s.animate?.09:1);operator.position.y=-5.8;
  if(avatar){operator.updateWorldMatrix(true,true);avatar.update(time,{target:target?.clone().add(new THREE.Vector3((['x','y','z'].indexOf(data.playing?'x':data.activeAxis||'x')-1)*.4,.7,1.2)),walking:walk||walking,animate:s.animate,pitch:s.pitch,displacement:s.motion[control][data.playing?'x':data.activeAxis||'x']});}

 }};
}
