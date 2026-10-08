import test from 'node:test';
import assert from 'node:assert/strict';
import { blankSetup, addNode, newConnection, validateSetup, clampPosition } from '../src/lib/setupBuilder.js';
import { validateEquipment } from '../src/lib/library.js';
import { equipment } from '../src/data/catalog.js';
test('mixed paths retain separate fibre and connector details through JSON export',()=>{
  const nodes=['laser','stage','detector','electrical'].map((id,i)=>addNode(id,i));
  const a={...newConnection(nodes[0].id,nodes[1].id),fibre:'custom',customFibre:'Input SM fibre',fromConnector:'FC/PC',toConnector:'FC/APC'};
  const b={...newConnection(nodes[1].id,nodes[2].id),fibre:'P3-1550PM-FC-5',fromConnector:'FC/APC',toConnector:'FC/APC'};
  const c={...newConnection(nodes[3].id,nodes[1].id),type:'electrical'};
  const setup={...blankSetup(),nodes,connections:[a,b,c]};
  const imported=validateSetup(JSON.parse(JSON.stringify(setup)),equipment.map(e=>e.id));
  assert.equal(imported.connections[0].toConnector,'FC/APC');assert.equal(imported.connections[0].fromConnector,'FC/PC');assert.equal(imported.connections[1].fibre,'P3-1550PM-FC-5');assert.equal(imported.connections[2].type,'electrical');
});
test('invalid imports reject missing equipment, dangling edges and non-finite positions',()=>{
  const a=addNode('laser',0),b=addNode('stage',1);const data={...blankSetup(),nodes:[a,b],connections:[newConnection(a.id,b.id)]};
  assert.throws(()=>validateSetup({...data,nodes:[{...a,x:Infinity},b]},['laser','stage']));
  assert.throws(()=>validateSetup(data,['laser']));
  assert.throws(()=>validateSetup({...data,nodes:[a]},['laser','stage']));
  assert.throws(()=>validateSetup({...data,nodes:[a,{...b,id:a.id}]},['laser','stage']));
  assert.deepEqual(clampPosition(-50,900),{x:0,y:510});
});
test('catalog edits require stable IDs, specification pairs and local asset paths',()=>{
  const item=structuredClone(equipment[0]);assert.equal(validateEquipment(item),item);
  assert.throws(()=>validateEquipment({...item,id:'../../escape'}));
  assert.throws(()=>validateEquipment({...item,model3d:'../../model.glb'}));
  assert.throws(()=>validateEquipment({...item,url:'javascript:alert(1)'}));
  assert.throws(()=>validateEquipment({...item,specs:[['Power']]}));
});
