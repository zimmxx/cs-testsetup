// Local browser regression checks. Uses bundled Playwright because the in-app
// browser repeatedly timed out connecting to its tab and focus emulation.
import { createRequire } from 'node:module';
import { readFile, writeFile, unlink, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const {chromium}=playwright;
const origin='http://localhost:5174';
const evidence=process.env.QA_EVIDENCE_DIR||path.resolve('.local/qa');await mkdir(evidence,{recursive:true});
const catalogFile=path.resolve('public/library/equipment.json'),backup=await readFile(catalogFile);
const assets=[];
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1625,height:1000},acceptDownloads:true});
page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report=[];
try {
  await page.goto(origin+'/#page=builder');await page.getByRole('heading',{name:'Build setup',exact:true}).waitFor();
  await page.getByRole('button',{name:'Add Tunable laser source',exact:true}).click();await page.getByRole('button',{name:'Add Chip stage / DUT',exact:true}).click();await page.getByRole('button',{name:'Add Optical power sensor',exact:true}).click();
  await page.getByRole('combobox',{name:'From equipment',exact:true}).selectOption({label:'1. Tunable laser source'});await page.getByRole('combobox',{name:'To equipment',exact:true}).selectOption({label:'2. Chip stage / DUT'});await page.getByRole('button',{name:'Connect',exact:true}).click();
  await page.getByLabel('Fibre model',{exact:true}).selectOption('custom');await page.getByLabel('Vendor / model',{exact:true}).fill('Thorlabs input cable');await page.getByLabel('Source connector',{exact:true}).selectOption('FC/PC');await page.getByLabel('Destination connector',{exact:true}).selectOption('FC/APC');
  await page.getByRole('combobox',{name:'From equipment',exact:true}).selectOption({label:'2. Chip stage / DUT'});await page.getByRole('combobox',{name:'To equipment',exact:true}).selectOption({label:'3. Optical power sensor'});await page.getByRole('button',{name:'Connect',exact:true}).click();
  await page.getByLabel('Fibre model',{exact:true}).selectOption('P3-1550PM-FC-5');await page.getByLabel('Source connector',{exact:true}).selectOption('FC/APC');await page.getByLabel('Destination connector',{exact:true}).selectOption('FC/APC');
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export setup',exact:true}).click()]);const exported=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(exported.nodes.length,3);assert.equal(exported.connections.length,2);assert.equal(exported.connections[0].fromConnector,'FC/PC');assert.equal(exported.connections[0].toConnector,'FC/APC');assert.equal(exported.connections[1].fibre,'P3-1550PM-FC-5');
  await page.waitForTimeout(400);await page.reload();await page.getByRole('heading',{name:'Build setup',exact:true}).waitFor();assert.equal(await page.locator('.builder-node').count(),3);assert.equal(await page.locator('.builder-edge').count(),2);report.push('Multiple optical links: distinct models and connector ends, export and reload passed.');
  await page.locator('.builder-equipment').filter({hasText:'Electrical drive & readout'}).dragTo(page.locator('.builder-canvas'),{targetPosition:{x:350,y:230}});assert.equal(await page.locator('.builder-node').count(),4);
  const before=await page.locator('.builder-node').first().getAttribute('transform');const rect=await page.locator('.builder-node').first().boundingBox();await page.mouse.move(rect.x+50,rect.y+30);await page.mouse.down();await page.mouse.move(rect.x+85,rect.y+65,{steps:5});await page.mouse.up();assert.notEqual(await page.locator('.builder-node').first().getAttribute('transform'),before);
  await page.getByRole('combobox',{name:'From equipment',exact:true}).selectOption({label:'4. Electrical drive & readout'});await page.getByRole('combobox',{name:'To equipment',exact:true}).selectOption({label:'2. Chip stage / DUT'});await page.getByRole('button',{name:'Connect',exact:true}).click();await page.getByLabel('Path type',{exact:true}).selectOption('electrical');assert.equal(await page.locator('.builder-edge.electrical').count(),1);report.push('Library drag/drop, canvas pointer movement and mixed electrical path passed.');
  await page.locator('input[type=file][accept=".json"]').setInputFiles({name:'setup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.getByRole('status').filter({hasText:'Setup imported'}).waitFor();assert.equal(await page.locator('.builder-node').count(),3);
  await page.locator('.builder-node').nth(1).click();await page.getByRole('button',{name:'Remove equipment',exact:true}).click();assert.equal(await page.locator('.builder-edge').count(),0);await page.getByRole('button',{name:'Undo last change',exact:true}).click();assert.equal(await page.locator('.builder-edge').count(),2);report.push('JSON import and equipment removal with connected paths / undo passed.');
  await page.getByRole('tab',{name:'Signal path',exact:true}).click();assert.equal(await page.locator('.builder-edge').count(),2);
  await page.getByRole('tab',{name:'3D',exact:true}).click();await page.locator('.model-render canvas').waitFor();await page.waitForTimeout(300);assert.equal(await page.locator('.model-render canvas').count(),1);report.push('Signal view and WebGL 3D scene rendered.');
  await page.getByRole('tab',{name:'Illustrative',exact:true}).click();await page.getByRole('button',{name:'Tunable laser source → Chip stage / DUT',exact:true}).click();await page.screenshot({path:path.join(evidence,'builder-desktop.jpg')});
  await page.getByRole('button',{name:'Admin',exact:true}).click();await page.getByText('Connected to local project library',{exact:true}).waitFor();
  await page.getByLabel('Manufacturer / model',{exact:true}).fill('Keysight 81940A · QA temporary');await page.getByRole('button',{name:'Save to library',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved to public/library'}).waitFor();
  const persisted=JSON.parse(await readFile(catalogFile,'utf8'));assert.ok(persisted.equipment.some(e=>e.model==='Keysight 81940A · QA temporary'));
  await page.getByRole('button',{name:'Equipment library',exact:true}).click();await page.getByRole('heading',{name:'Equipment library',exact:true}).waitFor();await page.getByText('Keysight 81940A · QA temporary',{exact:true}).first().waitFor();report.push('Admin edits wrote project JSON and appeared in equipment library.');
  await page.getByRole('button',{name:'Admin',exact:true}).click();await page.getByLabel('Manufacturer / model',{exact:true}).fill('Keysight 81940A');await page.getByRole('button',{name:'Save to library',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved to public/library'}).waitFor();
  await page.getByRole('button',{name:'Add equipment',exact:true}).click();await page.getByLabel('Equipment ID',{exact:true}).fill('qa-model');await page.getByLabel('Equipment name',{exact:true}).fill('QA model fixture');await page.getByLabel('Manufacturer / model',{exact:true}).fill('Synthetic triangle for renderer test');await page.getByLabel('Category',{exact:true}).fill('QA');
  // Minimal valid binary glTF triangle; test fixture, never a real instrument model.
  const binary=Buffer.alloc(36);[0,0,0,1,0,0,0,1,0].forEach((v,i)=>binary.writeFloatLE(v,i*4));
  const gltf={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0},mode:4}]}],buffers:[{byteLength:36}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[0,0,0],max:[1,1,0]}]};
  let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const glb=Buffer.alloc(12+8+json.length+8+binary.length);glb.write('glTF');glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(json.length,12);glb.writeUInt32LE(0x4e4f534a,16);json.copy(glb,20);const offset=20+json.length;glb.writeUInt32LE(binary.length,offset);glb.writeUInt32LE(0x004e4942,offset+4);binary.copy(glb,offset+8);
  await page.getByLabel('Attach GLB model',{exact:true}).setInputFiles({name:'qa.glb',mimeType:'model/gltf-binary',buffer:glb});await page.getByRole('status').filter({hasText:'File stored'}).waitFor();const modelPath=await page.getByLabel('Model path',{exact:true}).inputValue();assets.push(path.resolve('public',modelPath));
  await page.getByRole('button',{name:'3D model',exact:true}).click();await page.locator('.model-render canvas').waitFor();await page.locator('[data-model-status=loaded]').waitFor();assert.equal(await page.locator('.model-message').count(),0);
  await page.getByRole('button',{name:'Save to library',exact:true}).click();await page.getByRole('status').filter({hasText:'Saved to public/library'}).waitFor();
  report.push('New equipment, GLB upload, unsaved preview and file-backed model reference passed.');
  await page.locator('[data-model-status=loaded]').waitFor();await page.screenshot({path:path.join(evidence,'qa-glb-viewer.jpg')});
  const rejected=await page.request.put(origin+'/api/library/equipment',{headers:{Origin:'https://untrusted.example'},data:{version:1,equipment:[]}});assert.equal(rejected.status(),403);const traversal=await page.request.post(origin+'/api/library/assets?kind=models&id=../../escape&name=x.glb',{data:glb});assert.equal(traversal.status(),400);report.push('Cross-origin writes and invalid asset destinations rejected.');
  await page.getByRole('button',{name:'Build setup',exact:true}).click();await page.setViewportSize({width:390,height:844});await page.getByRole('heading',{name:'Build setup',exact:true}).waitFor();const overflow=await page.evaluate(()=>({width:innerWidth,body:document.documentElement.scrollWidth}));assert.ok(overflow.body<=overflow.width);await page.waitForTimeout(350);await page.screenshot({path:path.join(evidence,'builder-mobile.jpg')});report.push('390px layout has no body horizontal overflow.');
  assert.deepEqual(errors,[]);report.push('No page runtime errors.');
  await writeFile(catalogFile,backup);await page.setViewportSize({width:1625,height:1000});await page.goto(origin+'/#page=admin');await page.reload();await page.getByText('Connected to local project library',{exact:true}).waitFor();await page.screenshot({path:path.join(evidence,'admin-desktop.jpg')});
  await page.getByRole('button',{name:'Build setup',exact:true}).click();await page.getByRole('button',{name:'Tunable laser source → Chip stage / DUT',exact:true}).click();await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(evidence,'builder-desktop.jpg'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.getByRole('heading',{name:'Build setup',exact:true}).scrollIntoViewIfNeeded();await page.waitForTimeout(350);await page.screenshot({path:path.join(evidence,'builder-mobile.jpg'),fullPage:true});
  console.log(JSON.stringify({passed:report},null,2));
} finally {
  await browser.close();await writeFile(catalogFile,backup);
  for(const asset of assets){assert.ok(asset.startsWith(path.resolve('public/library')+path.sep));await unlink(asset);}
}



