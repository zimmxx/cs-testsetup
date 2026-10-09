import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';
import { createPhotoChipSetup } from '../src/data/photoChipSetup.js';
import { assemblyManifest } from '../scripts/cad-assembly-service.mjs';
import libraryServer from '../scripts/library-server.js';
import { assignModule } from '../src/lib/mainframeAssembly.js';
import { setComponentMount } from '../src/lib/componentMounts.js';
import { workspaceSeed } from '../src/lib/workspace_draft.js';

test('whole-source manifest retains repeated equipment instances, hashes, routing and mount records',async()=>{
  const setup=createPhotoChipSetup(),items=JSON.parse(fs.readFileSync('public/library/equipment.json')).equipment;
  const result=await assemblyManifest(process.cwd(),setup,items,true);
  assert.equal(result.components.length,17);assert.equal(result.includeBench,true);
  const arms=result.components.filter(c=>c.equipmentId==='wst-fibre-arms-manual');assert.equal(arms.length,2);assert.equal(arms[0].sourceSha256,arms[1].sourceSha256);assert.notDeepEqual(arms[0].quaternion,arms[1].quaternion);
  assert.equal(result.components.find(c=>c.id==='photo-holder').legacyMountingStage,'photo-dut-stage');assert.equal(result.setup,setup);
  assert.ok(result.components.every(c=>c.translationMm.every(Number.isFinite)&&/^[a-f0-9]{64}$/.test(c.sourceSha256)));
  await assert.rejects(()=>assemblyManifest(process.cwd(),setup,items.map(e=>e.id==='wst-laser-old'?{...e,stepPath:'library/references/../../package.json'}:e),true),/paths/);
  await assert.rejects(()=>assemblyManifest(process.cwd(),setup,[],true),/source/);
});
test('STEP export endpoint enforces loopback and same origin and rejects malformed or cyclic requests',async()=>{
  let middleware;libraryServer().configureServer({config:{root:process.cwd()},middlewares:{use:fn=>middleware=fn}});
  async function request(data,remote='127.0.0.1',origin='http://localhost:5174'){
    const req=Readable.from([Buffer.from(JSON.stringify(data))]);req.url='/api/library/export-step';req.method='POST';req.headers={host:'localhost:5174',origin};req.socket={remoteAddress:remote};
    let output;const res={statusCode:200,setHeader(){},end:data=>output=JSON.parse(data)};await middleware(req,res,()=>assert.fail());return {status:res.statusCode,...output};
  }
  const setup=createPhotoChipSetup();
  assert.equal((await request({setup,includeBench:true},'192.168.0.2')).status,403);
  assert.equal((await request({setup,includeBench:true},'127.0.0.1','https://example.com')).status,403);
  assert.equal((await request({setup,includeBench:'yes'})).status,400);
  assert.equal((await request({setup:{...setup,nodes:[...setup.nodes,setup.nodes[0]]},includeBench:true})).status,400);
  const cycle=structuredClone(setup);cycle.nodes[0].configuration.mount={parentId:cycle.nodes[0].id,offsetXMm:0,offsetYMm:0,offsetZMm:0};
  assert.equal((await request({setup:cycle,includeBench:true})).status,400);
});
test('installing a rigid-mounted compact module in a housing transfers mounting ownership to its slot',()=>{
  const setup=workspaceSeed(),detached=assignModule(setup,'mainframe','1',''),mounted=setComponentMount(detached,'laser','stage');
  const installed=assignModule(mounted,'mainframe','1','laser'),module=installed.nodes.find(n=>n.id==='laser');
  assert.equal(module.configuration.mount,undefined);assert.equal(module.configuration.mainframeId,'mainframe');assert.equal(module.configuration.mainframeSlot,'1');assert.deepEqual(installed.connections,setup.connections);
});
