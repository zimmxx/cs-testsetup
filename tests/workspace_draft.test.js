import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { equipment } from '../src/data/catalog.js';
import { applyLibrary } from '../src/lib/library.js';
import { workspaceSeed, validateWorkspace, draftStorageKey, contentSignature, workspaceChanges, portProblem, connectionChecks, traceNetwork, benchPatch, updateBenchNode, measurementChecks } from '../src/lib/workspace_draft.js';
import { newConnection, addSignalNode, signalPosition, validateSetup } from '../src/lib/setupBuilder.js';
import libraryServer from '../scripts/library-server.js';
import { cleanBuildBackups } from '../scripts/clean-build-backups.mjs';
import { normalizeSetupView } from '../src/lib/urlState.js';

test('legacy illustrative links open the single Signal path view',()=>{
  assert.equal(normalizeSetupView('illustrative'),'signal');
  assert.equal(normalizeSetupView('signal'),'signal');
  assert.equal(normalizeSetupView('overview'),'overview');
});
test('adding equipment to a long Signal path preserves the drop location and valid physical coordinates',()=>{
  const node=addSignalNode('wst-laser-old',0,340,1250);
  assert.equal(node.signalX,340);assert.equal(node.signalY,1250);assert.equal(node.y,510);
  const restored=JSON.parse(JSON.stringify(node));assert.deepEqual(signalPosition(restored,0),{signalX:340,signalY:1250});
  validateSetup({version:1,name:'Long signal diagram',nodes:[restored],connections:[]},equipment.map(e=>e.id));
});

test('draft workspaces have separate names, storage and validated exports',()=>{
  const draft=workspaceSeed();assert.equal(draft.workspaceName,'Bench_draft');
  assert.equal(draftStorageKey(draft.id),'bench_draft:wst-optical-manual');
  assert.equal(validateWorkspace(draft),draft);
  assert.throws(()=>validateWorkspace({...draft,workspaceName:'Build setup'}));
  assert.throws(()=>validateWorkspace({...draft,id:'../bad'}));
  const independent=workspaceSeed();draft.nodes[0].x=800;assert.notEqual(independent.nodes[0].x,800);
  assert.equal(contentSignature(independent),contentSignature({...independent,savedAtDraft:'today'}));
});
test('optical port roles reject support hardware and reverse detector paths',()=>{
  const draft=workspaceSeed();
  assert.match(portProblem(draft,'camera','sensor','optical'),/output/);
  assert.match(portProblem(draft,'sensor','laser','optical'),/output/);
  assert.equal(portProblem({...draft,connections:[]},'laser','sensor','optical'),'');
  assert.match(portProblem(draft,'laser','laser','optical'),/different/);
});
test('custom equipment can receive a recorded optical role without changing the shared catalog',()=>{
  const draft=workspaceSeed(),camera=draft.nodes.find(n=>n.id==='camera');
  camera.configuration.signalRole='through';validateWorkspace(draft);
  assert.equal(portProblem(draft,'laser','camera','optical'),'');
  camera.configuration.signalRole='support';assert.match(portProblem(draft,'laser','camera','optical'),/input/);
  camera.configuration.signalRole='unknown';assert.throws(()=>validateWorkspace(draft),/signal role/);
});
test('hybrid fibres are valid while PC/APC mating mismatches are flagged',()=>{
  const draft=workspaceSeed();draft.connections=[];
  const a={...newConnection('laser','controller'),fromConnector:'FC/APC',toConnector:'FC/PC',fibre:'custom',customFibre:'Hybrid patch cable'};
  assert.equal(connectionChecks(draft,a).some(s=>/mating sleeve/.test(s)),false);
  const sleeve=draft.nodes.find(n=>n.equipmentId==='wst-mating-sleeve-manual');
  const b={...a,to:sleeve.id,toConnector:'FC/PC'},c={...a,from:sleeve.id,to:'controller',fromConnector:'FC/APC'};draft.connections=[b,c];
  assert.equal(connectionChecks(draft,b).some(s=>/same mating sleeve/.test(s)),true);
});
test('network trace terminates on cycles and keeps signal types separate',()=>{
  const draft={nodes:[],connections:[{id:'1',from:'a',to:'b',type:'optical'},{id:'2',from:'b',to:'c',type:'optical'},{id:'3',from:'c',to:'a',type:'optical'},{id:'4',from:'a',to:'d',type:'electrical'}]};
  assert.deepEqual(new Set(traceNetwork(draft,'a',null).nodes),new Set(['a','b','c']));
  assert.deepEqual(traceNetwork(draft,null,'4').edges,['4']);
});
test('bench placement snaps, bounds, locks and preserves mounted dependencies',()=>{
  const draft=workspaceSeed(),node=draft.nodes.find(n=>n.id==='mainframe');
  assert.deepEqual(benchPatch(node,draft,113,-67),{benchXMm:125,benchZMm:-75});
  assert.deepEqual(benchPatch(node,draft,10000,-10000),{benchXMm:850,benchZMm:-400});
  assert.equal(benchPatch({...node,locked:true},draft,0,0),null);
  assert.equal(benchPatch(draft.nodes.find(n=>n.id==='laser'),draft,0,0),null);
  assert.equal(benchPatch(draft.nodes.find(n=>n.id==='input-arm'),draft,0,0),null);
});
test('mechanically mounted arms preserve their relative height and rotation when a stage moves',()=>{
  const draft=workspaceSeed(),stage=draft.nodes.find(n=>n.id==='input-fibre-stage'),arm=draft.nodes.find(n=>n.id==='input-arm');
  const next=updateBenchNode(draft,stage.id,{elevationMm:(stage.elevationMm||0)+20,rotationDeg:(stage.rotationDeg||0)+90});
  const mounted=next.nodes.find(n=>n.id===arm.id);
  assert.equal(mounted.elevationMm,(arm.elevationMm||0)+20);assert.equal(mounted.rotationDeg,(arm.rotationDeg||0)+90);
  assert.notEqual(mounted,arm);assert.equal(draft.nodes.find(n=>n.id===arm.id).elevationMm,arm.elevationMm);
});
test('measurement checks report inverted scan and exceeding recorded power limit',()=>{
  const draft=workspaceSeed();draft.measurement={startNm:1600,stopNm:1500,laserPowerMw:10,maxPowerMw:5};
  assert.equal(measurementChecks(draft).length,2);
});
test('review changes reports placement, connection removal and measurement changes',()=>{
  const old=workspaceSeed(),draft=structuredClone(old);draft.nodes[0].locked=true;draft.connections.pop();draft.measurement.laserPowerMw=5;
  const changes=workspaceChanges(draft,old);
  assert.equal(changes.length,3);assert.ok(changes.some(s=>s==='Equipment changed: Laser'));
  assert.ok(changes.some(s=>s.includes('Measurement laserPowerMw: 10 → 5')));
  assert.equal(workspaceChanges(old,old).length,0);
});
test('measurement checks use explicitly recorded path limits',()=>{
  const draft=workspaceSeed();draft.measurement={startNm:1500,stopNm:1650,allowedStartNm:1520,allowedStopNm:1630};
  assert.equal(measurementChecks(draft).length,2);
});
test('local draft API saves atomically without changing catalog or publication and rejects unsafe requests',async()=>{
  const temporary=await mkdtemp(path.join(os.tmpdir(),'cs-workspace-draft-'));
  const root=path.join(temporary,'public','library');await mkdir(root,{recursive:true});
  await writeFile(path.join(root,'equipment.json'),'original catalog');await mkdir(path.join(root,'published'));
  await writeFile(path.join(root,'published','index.json'),'original publication');
  let middleware;libraryServer().configureServer({config:{root:temporary},middlewares:{use:fn=>middleware=fn}});
  async function request(data,{origin='http://localhost:5174',remote='127.0.0.1'}={}){
    const req=Readable.from([Buffer.from(JSON.stringify(data))]);req.url='/api/library/workspace-draft';req.method='PUT';req.headers={host:'localhost:5174',origin};req.socket={remoteAddress:remote};
    let output;const res={statusCode:200,setHeader(){},end:value=>output=JSON.parse(value)};
    await middleware(req,res,()=>assert.fail('Unexpected fallthrough'));return {status:res.statusCode,...output};
  }
  try{
    const draft=workspaceSeed();const first=await request(draft);assert.equal(first.saved,true,JSON.stringify(first));
    const file=path.join(root,'workspaces_draft',`${draft.id}_draft.json`);
    assert.equal(JSON.parse(await readFile(file,'utf8')).workspaceName,'Bench_draft');
    draft.name='Revised draft';await request(draft);assert.notEqual(JSON.parse(await readFile(`${file}.bak`,'utf8')).name,draft.name);
    assert.equal(await readFile(path.join(root,'equipment.json'),'utf8'),'original catalog');
    assert.equal(await readFile(path.join(root,'published','index.json'),'utf8'),'original publication');
    assert.equal((await request({...draft,id:'../escape'})).status,400);
    assert.equal((await request(draft,{origin:'https://example.com'})).status,403);
    assert.equal((await request(draft,{remote:'192.168.0.2'})).status,403);
    assert.equal((await request({version:1,workspaceName:'Equipment_draft',equipment:structuredClone(equipment)})).saved,true);
    assert.equal((await request({version:1,workspaceName:'Equipment_draft',equipment:[]})).status,400);
  }finally{await rm(temporary,{recursive:true,force:true});}
});
test('saved draft fixtures use valid records and separate filenames',async()=>{
  const library=JSON.parse(await readFile(new URL('../public/library/equipment.json',import.meta.url)));
  const before=structuredClone(equipment);
  try{applyLibrary(library.equipment);for(const id of ['wst-optical-manual','oband-mainframe-assembly']){
    const draft=JSON.parse(await readFile(new URL(`../public/library/workspaces_draft/${id}_draft.json`,import.meta.url)));
    validateWorkspace(draft,equipment.map(e=>e.id));
  }}finally{equipment.splice(0,equipment.length,...before);}
});
test('production cleanup excludes recovery copies but preserves original CAD and draft JSON',async()=>{
  const temporary=await mkdtemp(path.join(os.tmpdir(),'cs-build-draft-'));
  const folder=path.join(temporary,'library','workspaces_draft');await mkdir(folder,{recursive:true});
  try{
    for(const name of ['example_draft.json','example_draft.json.bak','example_draft.json.tmp','model.step'])await writeFile(path.join(folder,name),'keep');
    await cleanBuildBackups(temporary);
    assert.equal(await readFile(path.join(folder,'example_draft.json'),'utf8'),'keep');
    assert.equal(await readFile(path.join(folder,'model.step'),'utf8'),'keep');
    await assert.rejects(readFile(path.join(folder,'example_draft.json.bak')));
    await assert.rejects(readFile(path.join(folder,'example_draft.json.tmp')));
  }finally{await rm(temporary,{recursive:true,force:true});}
});
