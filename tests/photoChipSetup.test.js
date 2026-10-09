import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createPhotoChipSetup,photoChipEquipment} from '../src/data/photoChipSetup.js';
import {equipment,setups} from '../src/data/catalog.js';
import {validateSetup} from '../src/lib/setupBuilder.js';
import {workspaceSeed,validateWorkspace} from '../src/lib/workspace_draft.js';
const catalog=JSON.parse(fs.readFileSync('public/library/equipment.json','utf8')).equipment;

test('photo chip template stays editable, unapproved and separate from manual wafer settings',()=>{
  const setup=validateSetup(createPhotoChipSetup(),catalog.map(e=>e.id));
  assert.equal(setup.id,'optical-chip-testing-v1');assert.equal(setup.nodes.length,17);
  assert.equal(new Set(setup.nodes.map(n=>n.equipmentId)).size,15);
  assert.equal(photoChipEquipment.length,8);
  for(const key of ['laserPowerMw','inputAngle','outputAngle','coupling','startNm','stopNm','maxPowerMw'])assert.equal(setup.measurement[key],'');
  assert.ok(setup.connections.every(c=>c.notes.startsWith('PROPOSED ROUTE')));
  assert.ok(setup.nodes.every(n=>!n.configuration.mainframeId));
  assert.ok(!setup.connections.some(c=>c.from==='photo-handheld'||c.to==='photo-handheld'||c.from==='photo-illumination-control'));
  for(const n of setup.nodes)if(n.configuration.mountingStage)assert.ok(setup.nodes.some(parent=>parent.id===n.configuration.mountingStage));
  const publication=JSON.parse(fs.readFileSync('public/library/published/index.json','utf8'));
  assert.ok(!publication.setups.some(s=>s.id===setup.id));
});

test('template seeds preserve photo connections and do not mutate catalog or saved records',()=>{
  const entry=setups.find(s=>s.id==='optical-chip-testing-v1'),seed=validateWorkspace(workspaceSeed(entry.id));
  assert.equal(seed.connections.length,6);assert.equal(seed.photoEvidence.files.length,3);
  seed.nodes[0].benchXMm=777;seed.connections[0].fromConnector='FC/PC';
  assert.notEqual(seed.nodes[0].benchXMm,entry.template.nodes[0].benchXMm);
  assert.equal(entry.template.connections[0].fromConnector,'Unspecified');
  for(const folder of ['setups','workspaces_draft']){
    const saved=JSON.parse(fs.readFileSync(`public/library/${folder}/optical-chip-testing-v1${folder==='workspaces_draft'?'_draft':''}.json`,'utf8'));
    validateSetup(saved,catalog.map(e=>e.id));assert.equal(saved.id,entry.id);
  }
});

test('photo originals, source hashes and guide are retained as portable project assets',()=>{
  const setup=createPhotoChipSetup(),manifest=JSON.parse(fs.readFileSync(path.join('public',setup.photoEvidence.manifest),'utf8'));
  assert.equal(manifest.photos.length,3);
  for(const photo of manifest.photos){const bytes=fs.readFileSync(path.join('public',photo.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),photo.sha256);assert.ok(photo.imageWidth>0&&photo.imageHeight>0);}
  assert.ok(fs.existsSync(path.join('public',setup.photoEvidence.guide)));
  for(const record of photoChipEquipment)assert.ok(catalog.some(e=>e.id===record.id));
  for(const node of setup.nodes)assert.ok(equipment.some(e=>e.id===node.equipmentId));
});

test('photo evidence import rejects broken metadata and paths outside reference folders',()=>{
  const s=createPhotoChipSetup(),ids=catalog.map(e=>e.id);
  for(const patch of [{files:'not an array'},{files:['https://example.com/photo.jpg']},{files:['library/references/../secret.jpg']},{guide:'../guide.md'},{manifest:'library/references/source.exe'},{warning:5}])assert.throws(()=>validateSetup({...s,photoEvidence:{...s.photoEvidence,...patch}},ids),/photo evidence/);
});
