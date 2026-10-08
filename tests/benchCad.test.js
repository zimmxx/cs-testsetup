import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createManualSetup, upgradeManualSetup } from '../src/data/manualSetup.js';
import { arrangeOnBench, benchPosition } from '../src/lib/benchLayout.js';
import { connectionProblem, validateSetup } from '../src/lib/setupBuilder.js';
import { validateEquipment } from '../src/lib/library.js';

const catalog=JSON.parse(fs.readFileSync('public/library/equipment.json','utf8')).equipment;
test('equipment CAD is valid and native-only sources explicitly remain pending',()=>{
  for(const e of catalog){
    validateEquipment(e);assert.ok(e.cadKind,e.id);assert.ok(e.cadReview,e.id);
    for(const native of e.nativeCad||[]){const file=fs.readFileSync(path.join('public',native.path));assert.ok(file.length>100,native.path);assert.equal(createHash('sha256').update(file).digest('hex'),native.sha256,native.path);}
    if(e.cadKind==='User-provided native CAD - preview pending'){assert.ok(e.nativeCad.length>0,e.id);assert.ok(!e.stepPath&&!e.model3d,e.id);continue;}
    const source=fs.readFileSync(path.join('public',e.stepPath));assert.ok(source.subarray(0,512).toString().includes('ISO-10303-21;'),e.id);
    if(e.stepSha256)assert.equal(createHash('sha256').update(source).digest('hex'),e.stepSha256,e.id);
    const buffer=fs.readFileSync(path.join('public',e.model3d));assert.equal(buffer.toString('ascii',0,4),'glTF');assert.equal(buffer.readUInt32LE(8),buffer.length);
    const gltf=JSON.parse(buffer.toString('utf8',20,20+buffer.readUInt32LE(12)));
    assert.ok(gltf.meshes.length>0,e.id);
    for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){const position=gltf.accessors[primitive.attributes.POSITION];assert.ok(position.count>=3,e.id);assert.ok(position.min.every(Number.isFinite)&&position.max.every(Number.isFinite),e.id);assert.ok(gltf.accessors[primitive.indices].count>=3,e.id);}
    const metadataPath=path.join('public',e.model3d+'.metadata.json');if(fs.existsSync(metadataPath)){const meta=JSON.parse(fs.readFileSync(metadataPath,'utf8'));assert.ok(meta.triangles>0&&meta.extentsMm.every(v=>Number.isFinite(v)&&v>0),e.id);}
  }
});
test('bench migration preserves edited layout and settings; mechanical arms follow their support',()=>{
  const setup=createManualSetup();setup.nodes[0].x=99;setup.measurement.laserPowerMw=7;setup.nodes[0].benchXMm=123;
  const migrated=upgradeManualSetup(setup);assert.equal(migrated.nodes[0].x,99);assert.equal(migrated.nodes[0].benchXMm,123);assert.equal(migrated.measurement.laserPowerMw,7);assert.deepEqual(migrated.connections,setup.connections);
  assert.equal(upgradeManualSetup(migrated),migrated);
  const arranged=arrangeOnBench(migrated),arm=arranged.nodes.find(n=>n.id==='input-arm'),stage=arranged.nodes.find(n=>n.id==='input-fibre-stage');
  assert.equal(benchPosition(arm,arranged.nodes).x,benchPosition(stage,arranged.nodes).x);assert.ok(benchPosition(arm,arranged.nodes).y>0);
  assert.throws(()=>validateSetup({...arranged,nodes:arranged.nodes.map(n=>({...n,benchXMm:Infinity}))},catalog.map(e=>e.id)));
});
test('drag connection guards reject self, missing and duplicate paths but allow mixed types',()=>{
  const s=createManualSetup();assert.ok(connectionProblem(s,'laser','laser','optical'));assert.ok(connectionProblem(s,'laser','missing','optical'));
  assert.ok(connectionProblem(s,'laser','sleeve-in','optical'));assert.equal(connectionProblem(s,'laser','sleeve-in','electrical'),'');
  assert.ok(connectionProblem({...s,connections:Array(300).fill(s.connections[0])},'mainframe','sensor','electrical'));
});
