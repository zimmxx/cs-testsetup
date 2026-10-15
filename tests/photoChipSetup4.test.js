import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createPhotoChipSetup4,chip4Equipment} from '../src/data/photoChipSetup4.js';
import {validateSetup} from '../src/lib/setupBuilder.js';
import {validateEquipment} from '../src/lib/library.js';
import {workspaceSeed} from '../src/lib/workspace_draft.js';
import {equipmentPose} from '../src/lib/mainframeAssembly.js';
import {benchPosition} from '../src/lib/benchLayout.js';
import {rotateVector} from '../src/lib/placement.js';
const catalog=JSON.parse(fs.readFileSync('public/library/equipment.json')).equipment,ids=catalog.map(e=>e.id);
test('Setup 4 retains independent instrument alternatives and does not inherit other bench settings',()=>{
 const s=validateSetup(createPhotoChipSetup4(),ids);
 assert.equal(s.id,'chip-manual-setup4');assert.equal(s.nodes.length,20);assert.equal(s.connections.length,9);assert.equal(chip4Equipment.length,6);
 for(const key of ['startNm','stopNm','laserPowerMw','maxPowerMw','inputAngle','outputAngle','coupling'])assert.equal(s.measurement[key],'');
 for(const id of ['c4-santec-laser','c4-santec-meter','c4-aux-stage'])assert.ok(!s.connections.some(c=>c.from===id||c.to===id));
 assert.equal(s.nodes.find(n=>n.id==='c4-holder').equipmentId,'chip-vacuum-stage');assert.ok(s.connections.every(c=>c.notes.startsWith('PROPOSED ROUTE')));
 assert.equal(s.nodes.find(n=>n.id==='c4-laser').configuration.mainframeSlot,'0');
 assert.ok(!JSON.parse(fs.readFileSync('public/library/published/index.json')).setups.some(e=>e.id===s.id));
 const seed=workspaceSeed(s.id);seed.nodes[0].benchXMm=999;assert.notEqual(createPhotoChipSetup4().nodes[0].benchXMm,999);
 for(const folder of ['setups','workspaces_draft']){
  const saved=validateSetup(JSON.parse(fs.readFileSync(`public/library/${folder}/${s.id}${folder==='workspaces_draft'?'_draft':''}.json`)),ids);
  assert.deepEqual(saved.nodes,s.nodes);assert.deepEqual(saved.connections,s.connections);
 }
});
test('Setup 4 geometry references preserve source hashes, module orientation and inward tips',()=>{
 const s=createPhotoChipSetup4(),pose=id=>equipmentPose(s.nodes.find(n=>n.id===id),s.nodes,benchPosition);
 assert.ok(rotateVector([1,0,0],pose('c4-input-arm').quaternion)[0]>.99);assert.ok(rotateVector([1,0,0],pose('c4-output-arm').quaternion)[0]<-.99);
 for(const id of ['c4-mainframe','c4-laser','c4-interface','c4-upper-display','c4-lower-display','c4-santec-laser','c4-santec-meter'])assert.ok(rotateVector([0,0,-1],pose(id).quaternion)[2]>.99,id);
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),m=JSON.parse(fs.readFileSync('public/'+s.photoEvidence.manifest));assert.equal(m.photos.length,3);
 for(const p of m.photos)assert.equal(hash(fs.readFileSync('public/'+p.path)),p.sha256);
 assert.ok(fs.existsSync('public/'+s.photoEvidence.guide));
 for(const seed of chip4Equipment){const e=validateEquipment(catalog.find(i=>i.id===seed.id));assert.equal(e.cadKind,'Illustrative reference');assert.equal(hash(fs.readFileSync('public/'+e.stepPath)),e.stepSha256);assert.equal(hash(fs.readFileSync('public/'+e.image)),e.imageSha256);const b=fs.readFileSync('public/'+e.model3d);assert.equal(b.toString('utf8',0,4),'glTF');assert.ok(JSON.parse(fs.readFileSync('public/'+e.model3d+'.metadata.json')).triangles>0);}
});
