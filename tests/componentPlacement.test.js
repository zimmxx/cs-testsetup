import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Quaternion, Vector3, Euler } from 'three';
import { createPhotoChipSetup } from '../src/data/photoChipSetup.js';
import { workspaceSeed, updateBenchNode } from '../src/lib/workspace_draft.js';
import { equipmentPose, removeAssemblyNode } from '../src/lib/mainframeAssembly.js';
import { benchPosition } from '../src/lib/benchLayout.js';
import { setComponentMount, mountCandidates } from '../src/lib/componentMounts.js';
import { validateSetup } from '../src/lib/setupBuilder.js';
import { equipment } from '../src/data/catalog.js';
import { upgradeFrontFacing } from '../src/lib/frontFacing.js';
import { nodeQuaternion, rotateVector, quaternionAngles } from '../src/lib/placement.js';
import { previewTransform, sourcePlacement } from '../src/lib/cadAssembly.js';
const pose=(s,id)=>equipmentPose(s.nodes.find(n=>n.id===id),s.nodes,benchPosition);
const near=(a,b)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-6,`${v} != ${b[i]}`));
const world=p=>[p.x,p.y,p.z];
test('YXZ rotations match independent Three.js Euler transforms and round-trip across gimbal lock',()=>{
  for(const [rotationDeg,tiltDeg,rollDeg] of [[180,0,0],[37,-25,11],[-70,90,43],[19,-90,-5]]){
    const n={rotationDeg,tiltDeg,rollDeg},q=nodeQuaternion(n),expected=new Quaternion().setFromEuler(new Euler(tiltDeg*Math.PI/180,rotationDeg*Math.PI/180,rollDeg*Math.PI/180,'YXZ'));
    near(rotateVector([1,2,3],q),new Vector3(1,2,3).applyQuaternion(expected).toArray());
    near(rotateVector([1,2,3],nodeQuaternion(quaternionAngles(q))),rotateVector([1,2,3],q));
  }
});
test('rigid attach, nested movement and detach preserve poses and optical records',()=>{
  const original=createPhotoChipSetup(),before=pose(original,'photo-display');
  let s=setComponentMount(original,'photo-display','photo-shelf');
  near(world(pose(s,'photo-display')),world(before));near(pose(s,'photo-display').quaternion,before.quaternion);
  s=setComponentMount(s,'photo-led','photo-display');
  const child=pose(s,'photo-led'),root=pose(s,'photo-shelf');
  s=updateBenchNode(s,'photo-shelf',{rotationDeg:90,tiltDeg:20,rollDeg:10,benchXMm:75,elevationMm:12});
  const newRoot=pose(s,'photo-shelf'),newChild=pose(s,'photo-led'),rotation=nodeQuaternion(s.nodes.find(n=>n.id==='photo-shelf'));
  const expectedOffset=rotateVector(world(child).map((v,i)=>v-world(root)[i]),rotation);
  near(world(newChild),world(newRoot).map((v,i)=>v+expectedOffset[i]));
  const detached=setComponentMount(s,'photo-led','');near(world(pose(detached,'photo-led')),world(newChild));
  near(rotateVector([1,2,3],pose(detached,'photo-led').quaternion),rotateVector([1,2,3],newChild.quaternion));
  assert.deepEqual(detached.connections,original.connections);validateSetup(JSON.parse(JSON.stringify(detached)),equipment.map(e=>e.id));
  const removed=removeAssemblyNode(s,'photo-display');near(world(pose(removed,'photo-led')),world(newChild));
  assert.equal(removed.nodes.find(n=>n.id==='photo-led').configuration.mount,undefined);
});
test('legacy arm mount conversion keeps the tip pose and allows independent rotation',()=>{
  const s=workspaceSeed(),arm=s.nodes.find(n=>n.id==='input-arm'),before=pose(s,arm.id);
  const attached=setComponentMount(s,arm.id,arm.configuration.mountingStage);
  near(world(pose(attached,arm.id)),world(before));near(pose(attached,arm.id).quaternion,before.quaternion);
  assert.equal(attached.nodes.find(n=>n.id===arm.id).configuration.mountingStage,undefined);
  const rotated=updateBenchNode(attached,arm.id,{rotationDeg:45,tiltDeg:10});
  assert.notDeepEqual(pose(rotated,arm.id).quaternion,before.quaternion);
});
test('imports and mounting actions reject cycles, dangling parents, non-finite offsets and locked edits',()=>{
  const s=createPhotoChipSetup(),mounted=setComponentMount(s,'photo-display','photo-shelf');
  assert.ok(!mountCandidates(mounted.nodes.find(n=>n.id==='photo-shelf'),mounted.nodes).some(n=>n.id==='photo-display'));
  assert.throws(()=>setComponentMount(mounted,'photo-shelf','photo-display'),/cycle/);
  const invalid=structuredClone(mounted);invalid.nodes.find(n=>n.id==='photo-display').configuration.mount.offsetXMm=Infinity;
  assert.throws(()=>validateSetup(invalid,equipment.map(e=>e.id)),/offset/);
  invalid.nodes.find(n=>n.id==='photo-display').configuration.mount={parentId:'missing',offsetXMm:0,offsetYMm:0,offsetZMm:0};
  assert.throws(()=>validateSetup(invalid,equipment.map(e=>e.id)),/mount/);
  s.nodes[0].tiltDeg=NaN;assert.throws(()=>validateSetup(s,equipment.map(e=>e.id)),/rotation/);
  delete s.nodes[0].tiltDeg;s.nodes[0].locked=true;assert.throws(()=>setComponentMount(s,s.nodes[0].id,'photo-shelf'),/Unlock/);
});
test('front panels face the photographed side; migration preserves alternative equipment and custom angles',()=>{
  const current=createPhotoChipSetup();
  for(const id of ['photo-mainframe','photo-laser','photo-sensor','photo-display','photo-led','photo-illumination-control'])assert.ok(rotateVector([0,0,-1],pose(current,id).quaternion)[2]>.999);
  const old=structuredClone(current);delete old.frontFacingRevision;old.nodes.forEach(n=>n.rotationDeg=0);
  old.nodes.find(n=>n.id==='photo-display').rotationDeg=45;old.nodes.find(n=>n.id==='photo-led').equipmentId='chip-handheld-power-meter-v1';
  const upgraded=upgradeFrontFacing(old);assert.equal(upgraded.nodes.find(n=>n.id==='photo-mainframe').rotationDeg,180);assert.equal(upgraded.nodes.find(n=>n.id==='photo-display').rotationDeg,45);assert.equal(upgraded.nodes.find(n=>n.id==='photo-led').rotationDeg,0);
  assert.equal(upgradeFrontFacing(upgraded),upgraded);assert.deepEqual(upgraded.connections,old.connections);
});
test('STEP source placement includes preview corrections, registration, assembly slots and instance tilt',()=>{
  const library=JSON.parse(fs.readFileSync('public/library/equipment.json')).equipment;
  const s=createPhotoChipSetup();s.nodes.find(n=>n.id==='photo-input-arm').tiltDeg=12;
  for(const n of s.nodes){
    const e=library.find(e=>e.id===n.equipmentId),preview=previewTransform(fs.readFileSync('public/'+e.model3d)),placed=sourcePlacement(n,s.nodes,preview),p=pose(s,n.id);
    const source=[12,23,34],sourcePreview=new Vector3(...source).multiplyScalar(.001).applyQuaternion(new Quaternion().fromArray(preview.q)).add(new Vector3(...preview.t));
    const centre=preview.min.map((v,i)=>(v+preview.max[i])/2);
    sourcePreview.sub(new Vector3(centre[0],preview.min[1],centre[2])).multiplyScalar(1000).applyQuaternion(new Quaternion().fromArray(p.quaternion)).add(new Vector3(p.x*100,p.y*100,p.z*100));
    near(rotateVector(source,placed.quaternion).map((v,i)=>v+placed.translationMm[i]),sourcePreview.toArray());
  }
  const wafer=workspaceSeed(),module=wafer.nodes.find(n=>n.id==='laser'),e=library.find(e=>e.id===module.equipmentId),preview=previewTransform(fs.readFileSync('public/'+e.model3d)),placed=sourcePlacement(module,wafer.nodes,preview);
  const localFront=rotateVector(preview.min.map(v=>v*1000),placed.quaternion).map((v,i)=>v+placed.translationMm[i]);
  assert.ok(localFront.every(Number.isFinite));
});
