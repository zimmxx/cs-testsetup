import test from 'node:test';
import assert from 'node:assert/strict';
import {createObandAssembly,obandEquipment} from '../src/data/obandAssembly.js';
import {createManualSetup} from '../src/data/manualSetup.js';
import {assignModule,acceptsModule,installedModule,validateAssembly,frameProfile,equipmentPose} from '../src/lib/mainframeAssembly.js';
import {validateSetup} from '../src/lib/setupBuilder.js';
import {equipment} from '../src/data/catalog.js';
import {benchPosition} from '../src/lib/benchLayout.js';

test('O-band template separates Slot 3 interface from remote detector and preserves the confirmed range',()=>{
 const s=createObandAssembly();validateSetup(s,equipment.map(e=>e.id));
 assert.equal(installedModule(s.nodes,'oband-mainframe',0).equipmentId,'oband-laser-81606a');
 assert.equal(installedModule(s.nodes,'oband-mainframe',3).equipmentId,'oband-head-interface');
 assert.equal(s.nodes.find(n=>n.id==='oband-head').configuration.mainframeId,undefined);
 assert.equal(s.connections.length,1);assert.equal(s.connections[0].type,'electrical');
 assert.equal(s.connections[0].from,'oband-head');assert.equal(s.connections[0].to,'oband-interface');
 assert.equal(s.measurement.laserSlot,'0');assert.equal(s.measurement.sensorSlot,'3');
 assert.ok(obandEquipment.find(e=>e.id==='oband-laser-81606a').specs.some(row=>row[1].includes('1240–1380 nm (user-confirmed)')));
 assert.equal(obandEquipment.find(e=>e.id==='oband-head-interface').model,'Keysight 81618A');
});
test('8164B reserves horizontal Slot 0 for extended TLS and rejects a remote detector in a compact slot',()=>{
 const s=createObandAssembly(),frame=s.nodes[0];assert.deepEqual(frameProfile(frame).slots,['1','2','3','4','0']);
 assert.throws(()=>assignModule(s,frame.id,'3','oband-laser'),/Slots 1/);
 assert.throws(()=>assignModule(s,frame.id,'0','oband-interface'),/Slot 0/);
 assert.throws(()=>assignModule(s,frame.id,'3','oband-head'),/external head/);
 const changed=assignModule(s,frame.id,'4','oband-interface');assert.equal(changed.measurement.sensorSlot,'4');assert.deepEqual(changed.connections,s.connections);validateAssembly(changed.nodes);
 const p=equipmentPose(changed.nodes[1],changed.nodes,benchPosition),i=equipmentPose(changed.nodes[2],changed.nodes,benchPosition);assert.ok(p.y<i.y);
});
test('cross-housing replacement cannot move an incompatible interface into an 8163B',()=>{
 const s=createManualSetup(),o=createObandAssembly(),combined={...s,nodes:[...s.nodes,...o.nodes]};
 assert.equal(acceptsModule(s.nodes.find(n=>n.id==='mainframe'),'1',o.nodes.find(n=>n.id==='oband-interface')),false);
 const moved=assignModule(combined,'oband-mainframe','3','laser');validateAssembly(moved.nodes);
 assert.equal(installedModule(moved.nodes,'oband-mainframe',3).id,'laser');
 assert.equal(moved.nodes.find(n=>n.id==='oband-interface').configuration.mainframeId,undefined);
 assert.equal(installedModule(moved.nodes,'mainframe',1),undefined);
});
