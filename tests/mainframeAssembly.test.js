import test from 'node:test';
import assert from 'node:assert/strict';
import { createManualSetup, upgradeManualSetup } from '../src/data/manualSetup.js';
import { assignModule, installedModule, equipmentPose, removeAssemblyNode, validateAssembly } from '../src/lib/mainframeAssembly.js';
import { benchPosition } from '../src/lib/benchLayout.js';
import { validateSetup } from '../src/lib/setupBuilder.js';
import { equipment } from '../src/data/catalog.js';

test('default housing, slot swap, unmount and round trip preserve signal paths and records',()=>{
  const s=createManualSetup();s.nodes[0].configuration.serial='LASER-123';
  assert.equal(installedModule(s.nodes,'mainframe',1).id,'laser');assert.equal(installedModule(s.nodes,'mainframe',2).id,'sensor');
  const swapped=assignModule(s,'mainframe','2','laser');
  assert.equal(installedModule(swapped.nodes,'mainframe',1).id,'sensor');assert.equal(installedModule(swapped.nodes,'mainframe',2).id,'laser');
  assert.equal(swapped.measurement.laserSlot,'2');assert.equal(swapped.measurement.sensorSlot,'1');
  assert.deepEqual(swapped.connections,s.connections);assert.equal(swapped.nodes[0].configuration.serial,'LASER-123');
  const detached=assignModule(swapped,'mainframe','2','');assert.equal(detached.nodes.length,s.nodes.length);assert.deepEqual(detached.connections,s.connections);
  assert.equal(detached.measurement.laserSlot,'');assert.equal(upgradeManualSetup(detached).nodes[0].configuration.mainframeId,undefined);
  const roundtrip=JSON.parse(JSON.stringify(swapped));assert.equal(validateSetup(roundtrip,equipment.map(e=>e.id)),roundtrip);
});
test('housing migration respects recorded slot order and does not reset existing data',()=>{
  const s=createManualSetup();delete s.mainframeRevision;
  for(const n of s.nodes){delete n.configuration.mainframeId;delete n.configuration.mainframeSlot;}
  s.measurement.laserSlot='2';s.measurement.sensorSlot='1';s.measurement.laserPowerMw=7;s.nodes[0].x=123;
  const migrated=upgradeManualSetup(s);assert.equal(installedModule(migrated.nodes,'mainframe',2).id,'laser');assert.equal(installedModule(migrated.nodes,'mainframe',1).id,'sensor');
  assert.equal(migrated.measurement.laserPowerMw,7);assert.equal(migrated.nodes[0].x,123);assert.deepEqual(migrated.procedure,s.procedure);assert.deepEqual(migrated.connections,s.connections);
  assert.equal(upgradeManualSetup(migrated),migrated);
});
test('mounted modules follow housing translation and rotation; deletion detaches dependants',()=>{
  const s=createManualSetup(),laser=s.nodes.find(n=>n.id==='laser'),frame=s.nodes.find(n=>n.id==='mainframe');
  Object.assign(frame,{benchXMm:100,benchZMm:200,elevationMm:20,rotationDeg:0});
  let p=equipmentPose(laser,s.nodes,benchPosition);assert.equal(p.x,.48);assert.ok(Math.abs(p.z+.07)<1e-9);assert.equal(p.y,.34);
  frame.rotationDeg=90;p=equipmentPose(laser,s.nodes,benchPosition);assert.ok(Math.abs(p.x+1.07)<1e-9);assert.ok(Math.abs(p.z-2.52)<1e-9);assert.equal(p.rotationDeg,90);
  const detached=removeAssemblyNode(s,'mainframe');validateAssembly(detached.nodes);assert.equal(detached.nodes[0].configuration.mainframeId,undefined);assert.deepEqual(detached.connections,s.connections);assert.equal(detached.measurement.sensorMainframe,'');
});
test('imports reject incompatible modules, dangling housing IDs and duplicate occupancy',()=>{
  const s=createManualSetup();assert.throws(()=>assignModule(s,'mainframe','1','camera'));assert.throws(()=>assignModule(s,'laser','1','sensor'));assert.throws(()=>assignModule(s,'mainframe','3','sensor'));
  const invalid=structuredClone(s);invalid.nodes.find(n=>n.id==='sensor').configuration.mainframeSlot='1';assert.throws(()=>validateAssembly(invalid.nodes),/only one/);
  invalid.nodes.find(n=>n.id==='sensor').configuration.mainframeId='missing';assert.throws(()=>validateSetup(invalid,equipment.map(e=>e.id)),/Invalid mainframe/);
});
