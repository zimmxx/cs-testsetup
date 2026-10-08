import test from 'node:test';
import assert from 'node:assert/strict';
import { createManualSetup, upgradeManualSetup } from '../src/data/manualSetup.js';
import { equipment } from '../src/data/catalog.js';
import { validateSetup } from '../src/lib/setupBuilder.js';
const ids=equipment.map(e=>e.id);
test('manual path preserves all sleeves, cleaved ends and known settings through export',()=>{
  const setup=validateSetup(JSON.parse(JSON.stringify(createManualSetup())),ids);
  assert.equal(setup.measurement.laserPowerMw,10);assert.equal(setup.measurement.startNm,'');
  assert.equal(setup.nodes.filter(n=>n.equipmentId==='wst-mating-sleeve-manual').length,3);
  assert.deepEqual(setup.connections.map(c=>c.id),['M-O1','M-O5','M-O6','M-O2','GC-IN','GC-OUT','M-O3','M-O4']);
  assert.equal(setup.connections.find(c=>c.id==='M-O2').toConnector,'Bare fibre');
  assert.equal(setup.connections.find(c=>c.id==='M-O3').fromConnector,'Bare fibre');
  assert.equal(setup.connections.find(c=>c.id==='M-O1').fibre,'P3-1550PM-FC-2');
  setup.nodes[0].configuration.serial='LAB-123';setup.measurement.startNm=1525;setup.procedure[0].text='Local procedure';
  const restored=validateSetup(JSON.parse(JSON.stringify(setup)),ids);
  assert.equal(restored.nodes[0].configuration.serial,'LAB-123');assert.equal(restored.procedure[0].text,'Local procedure');
});
test('manual imports reject invalid settings and unsafe file IDs, but allow partial drafts',()=>{
  const setup=createManualSetup();assert.equal(validateSetup(setup,ids),setup);
  assert.throws(()=>validateSetup({...setup,id:'../../escape'},ids));
  assert.throws(()=>validateSetup({...setup,measurement:{laserPowerMw:'ten'}},ids));
  assert.throws(()=>validateSetup({...setup,measurement:{laserPowerMw:-5}},ids));
  assert.throws(()=>validateSetup({...setup,procedure:[{title:1,text:'Bad'}]},ids));
});
test('stage role update preserves edited settings, connections and placement and runs only once',()=>{
  const old=createManualSetup();old.nodes=old.nodes.filter(n=>n.equipmentId!=='fibre-arm-stage');old.name='My edited setup';old.measurement.startNm=1540;old.nodes[0].x=123;old.nodes[0].configuration.serial='USER-SERIAL';
  const corrected=validateSetup(upgradeManualSetup(old),ids);
  assert.equal(corrected.name,old.name);assert.equal(corrected.measurement.startNm,1540);assert.equal(corrected.nodes[0].x,123);assert.equal(corrected.nodes[0].configuration.serial,'USER-SERIAL');assert.deepEqual(corrected.connections,old.connections);
  assert.equal(corrected.nodes.filter(n=>n.equipmentId==='fibre-arm-stage').length,2);
  assert.equal(corrected.nodes.find(n=>n.id==='input-arm').configuration.mountingStage,'input-fibre-stage');
  assert.equal(corrected.nodes.find(n=>n.id==='stage').equipmentId,'wst-stage-manual');
  assert.equal(upgradeManualSetup(corrected),corrected);
  corrected.nodes=corrected.nodes.filter(n=>n.id!=='output-fibre-stage');assert.equal(upgradeManualSetup(corrected).nodes.length,13);
});
