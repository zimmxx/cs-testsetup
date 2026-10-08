import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import {addNode,newConnection} from '../src/lib/setupBuilder.js';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const {chromium}=playwright;
const evidence=process.env.QA_EVIDENCE_DIR||path.resolve('.local/qa');await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1625,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5174/#page=builder',{waitUntil:'domcontentloaded',timeout:120000});await page.getByRole('heading',{name:'Build setup',exact:true}).waitFor();
  const nodes=['laser','polarisation','stage','detector'].map((id,i)=>addNode(id,i,50+i*240,130));const draft={version:1,name:'Optical chip setup review',nodes,connections:[newConnection(nodes[0].id,nodes[1].id),newConnection(nodes[1].id,nodes[2].id),newConnection(nodes[2].id,nodes[3].id)]};
  await page.locator('input[type=file][accept=".json"]').setInputFiles({name:'setup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(draft))});
  await page.getByRole('tab',{name:'Setup overview',exact:true}).click();await page.getByRole('button',{name:'Inspect overview Tunable laser source',exact:true}).click();
  await page.locator('.build-overview .inspector').getByText('1520–1630 nm',{exact:true}).waitFor();await page.getByRole('button',{name:'View equipment',exact:true}).click();await page.getByRole('dialog').getByText('Wavelength accuracy',{exact:true}).waitFor();await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.getByRole('tab',{name:'Illustrative',exact:true}).click();assert.equal(await page.locator('.builder-node').count(),4);await page.getByRole('tab',{name:'Setup overview',exact:true}).click();await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(evidence,'build-overview.jpg')});
  await page.getByRole('button',{name:'Documentation',exact:true}).first().click();await page.getByRole('heading',{name:'Testing setup collection workbook',exact:true}).waitFor();const file=await page.request.get('http://localhost:5174/documents/CORNERSTONE_Setup_Collection_Workbook.docx');assert.equal(file.status(),200);
  assert.deepEqual(errors,[]);console.log('Overview selection, shared specifications, equipment dialog, draft preservation and workbook download all passed.');
} finally {await browser.close();}
