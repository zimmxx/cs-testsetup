import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validatePublication, publicationDefaults, publishedCatalogEntry, applyPublishedSetups } from '../src/lib/publishedSetups.js';
import { equipment, setups } from '../src/data/catalog.js';
import { createManualSetup } from '../src/data/manualSetup.js';

test('publication preserves installed slots, individual fibre ends, positions and procedure',()=>{
  const draft=createManualSetup();draft.publication=publicationDefaults(draft);draft.nodes[0].signalX=110;draft.nodes[0].signalY=200;
  const snapshot=structuredClone(validatePublication(draft,equipment.map(e=>e.id)));
  const entry=publishedCatalogEntry(snapshot);
  assert.deepEqual(entry.published.nodes,draft.nodes);
  assert.deepEqual(entry.published.connections,draft.connections);
  assert.deepEqual(entry.published.procedure,draft.procedure);
  assert.deepEqual(entry.equipment,[...new Set(draft.nodes.map(n=>n.equipmentId))]);
  draft.nodes[0].x=800;draft.connections[0].toConnector='FC/PC';
  assert.notEqual(entry.published.nodes[0].x,draft.nodes[0].x);
  assert.notEqual(entry.published.connections[0].toConnector,draft.connections[0].toConnector);
});
test('publication rejects incomplete metadata and broken equipment references',()=>{
  const draft=createManualSetup();draft.publication=publicationDefaults(draft);
  assert.throws(()=>validatePublication({...draft,publication:{...draft.publication,bands:[]}},equipment.map(e=>e.id)),/wavelength band/);
  assert.throws(()=>validatePublication({...draft,id:'../bad'},equipment.map(e=>e.id)),/ID/);
  assert.throws(()=>validatePublication({...draft,nodes:[]},equipment.map(e=>e.id)));
});
test('publishing a catalog setup replaces its entry without duplicates and preserves its diagram',()=>{
  const before=setups.find(s=>s.id==='chip-optical-c');
  const original=structuredClone(setups);
  try{const draft=createManualSetup();draft.id=before.id;draft.publication=publicationDefaults(draft);applyPublishedSetups([draft]);
    assert.equal(setups.filter(s=>s.id===before.id).length,1);
    assert.deepEqual(setups.find(s=>s.id===before.id).photos,before.photos);
    assert.equal(setups.find(s=>s.id===before.id).published.nodes.length,draft.nodes.length);
  }finally{setups.splice(0,setups.length,...original);}
});
test('initial published setups use valid complete equipment records',async()=>{
  const catalog=JSON.parse(await readFile(new URL('../public/library/equipment.json',import.meta.url)));
  const index=JSON.parse(await readFile(new URL('../public/library/published/index.json',import.meta.url)));
  assert.equal(index.version,1);assert.ok(index.setups.some(s=>s.id==='wst-optical-manual'));assert.ok(index.setups.some(s=>s.id==='oband-mainframe-assembly'));
  for(const setup of index.setups)validatePublication(setup,catalog.equipment.map(e=>e.id));
});
