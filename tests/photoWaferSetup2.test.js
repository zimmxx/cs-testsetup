import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createPhotoWaferSetup2,wafer2Equipment} from '../src/data/photoWaferSetup2.js';
import {setups} from '../src/data/catalog.js';
import {validateSetup} from '../src/lib/setupBuilder.js';
import {validateEquipment} from '../src/lib/library.js';
import {workspaceSeed,validateWorkspace} from '../src/lib/workspace_draft.js';
import {equipmentPose} from '../src/lib/mainframeAssembly.js';
import {benchPosition} from '../src/lib/benchLayout.js';
import {rotateVector} from '../src/lib/placement.js';
const catalog=JSON.parse(fs.readFileSync('public/library/equipment.json')).equipment;
const ids=catalog.map(e=>e.id);
test('Setup 2 is an editable wafer draft without inherited chip, power or module assumptions',()=>{
 const s=validateSetup(createPhotoWaferSetup2(),ids);
 assert.equal(s.publication.scale,'Wafer');assert.equal(s.nodes.length,23);assert.equal(s.connections.length,10);assert.equal(wafer2Equipment.length,11);
 assert.ok(!s.nodes.some(n=>n.id==='w2-right-mainframe'||n.equipmentId==='oband-mainframe-8164b'));
 assert.equal(s.nodes.find(n=>n.id==='w2-holder').equipmentId,'wafer-carrier-2');
 assert.equal(s.nodes.find(n=>n.id==='w2-wafer-stage').equipmentId,'wafer-xy-motion-stage-2');
 assert.ok(!s.nodes.some(n=>n.equipmentId==='chip-vacuum-stage'));
 const installed=s.nodes.filter(n=>n.configuration.mainframeId);
 assert.deepEqual(installed.map(n=>n.equipmentId),['wst-laser-old','wst-sensor-old']);
 assert.ok(installed.every(n=>n.configuration.mainframeId==='w2-mainframe'));
 assert.ok(installed.every(n=>/provisional|confirm actual slot/.test(n.configuration.notes)));
 for(const key of ['laserPowerMw','maxPowerMw','inputAngle','outputAngle','coupling','startNm','stopNm'])assert.equal(s.measurement[key],'');
 assert.ok(s.connections.every(c=>c.notes.startsWith('PROPOSED ROUTE')));
 for(const id of ['w2-right-mainframe','w2-shelf-smu','w2-indicator','w2-aux-mount-a','w2-aux-mount-b'])assert.ok(!s.connections.some(c=>c.from===id||c.to===id));
 assert.ok(!JSON.parse(fs.readFileSync('public/library/published/index.json')).setups.some(e=>e.id===s.id));
});
test('Setup 2 mounts, inward arm tips and instrument fronts retain the intended world poses',()=>{
 const s=createPhotoWaferSetup2(),pose=id=>equipmentPose(s.nodes.find(n=>n.id===id),s.nodes,benchPosition);
 const left=rotateVector([1,0,0],pose('w2-input-arm').quaternion),right=rotateVector([1,0,0],pose('w2-output-arm').quaternion);
 assert.ok(left[0]>.99&&right[0]<-.99);
 for(const id of ['w2-mainframe','w2-left-display','w2-right-display','w2-pc','w2-shelf-smu'])assert.ok(rotateVector([0,0,-1],pose(id).quaternion)[2]>.99,id);
 assert.ok(Math.abs(pose('w2-keyboard').y-3.83)<1e-10);assert.ok(Math.abs(pose('w2-right-display').y-6.49)<1e-10);
 const seed=validateWorkspace(workspaceSeed(s.id));seed.nodes[0].benchXMm=123;
 assert.notEqual(setups.find(e=>e.id===s.id).template.nodes[0].benchXMm,123);
 for(const folder of ['setups','workspaces_draft']){
  const file=`public/library/${folder}/${s.id}${folder==='workspaces_draft'?'_draft':''}.json`,saved=validateSetup(JSON.parse(fs.readFileSync(file)),ids);
  assert.deepEqual(saved.nodes,s.nodes);assert.deepEqual(saved.connections,s.connections);
 }
});
test('Setup 2 preserves evidence and all new component CAD/picture hashes with geometry',()=>{
 const s=createPhotoWaferSetup2(),manifest=JSON.parse(fs.readFileSync('public/'+s.photoEvidence.manifest));
 assert.equal(manifest.photos.length,4);assert.equal(manifest.connections.length,10);
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 for(const photo of manifest.photos)assert.equal(hash(fs.readFileSync('public/'+photo.path)),photo.sha256);
 assert.ok(fs.existsSync('public/'+s.photoEvidence.guide));
 for(const seed of wafer2Equipment){
  const item=validateEquipment(catalog.find(e=>e.id===seed.id));assert.equal(item.cadKind,'Illustrative reference');
  assert.equal(hash(fs.readFileSync('public/'+item.stepPath)),item.stepSha256);assert.equal(hash(fs.readFileSync('public/'+item.image)),item.imageSha256);
  const glb=fs.readFileSync('public/'+item.model3d);assert.equal(glb.toString('utf8',0,4),'glTF');
  const json=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));assert.ok(json.meshes.length>0);
  assert.ok(JSON.parse(fs.readFileSync('public/'+item.model3d+'.metadata.json')).triangles>0);
 }
});
