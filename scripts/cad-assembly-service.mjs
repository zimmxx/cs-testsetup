import { readFile, writeFile, mkdtemp, rm, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { previewTransform, sourcePlacement } from '../src/lib/cadAssembly.js';
const execute=promisify(execFile);
export async function cadRuntime(root){
  let python=process.env.CS_CAD_PYTHON;
  if(!python)try{python=(await readFile(path.join(root,'.local/cad-python/python-path.txt'),'utf8')).trim();}catch{}
  if(!python)return null;
  try{await access(python);await access(path.join(root,'.local/cad-python/OCP/__init__.py'));return python;}catch{return null;}
}
export async function assemblyManifest(root,setup,items,includeBench=true){
  const sources=new Map();
  await Promise.all([...new Set(setup.nodes.map(n=>n.equipmentId))].map(async id=>{
    const item=items.find(e=>e.id===id);
    if(!item?.stepPath||!item?.model3d||!item.cadKind)throw new Error(`STEP source and dimensional preview required: ${id}.`);
    const source=path.resolve(root,'public',item.stepPath),model=path.resolve(root,'public',item.model3d),referenceRoot=path.resolve(root,'public/library/references'),modelRoot=path.resolve(root,'public/library/models');
    if(!source.startsWith(referenceRoot+path.sep)||!model.startsWith(modelRoot+path.sep))throw new Error('CAD paths must stay inside the project library.');
    const [bytes,preview]=await Promise.all([readFile(source),readFile(model)]);
    sources.set(id,{stepPath:item.stepPath,sourceSha256:createHash('sha256').update(bytes).digest('hex'),preview:previewTransform(preview),cadKind:item.cadKind,cadReview:item.cadReview});
  }));
  return {version:1,name:setup.name,setupId:setup.id||null,createdAt:new Date().toISOString(),units:'mm',axes:'right-handed Y-up; Euler order YXZ',includeBench,
    limitations:'Placements are visual estimates. Rigid mounts are recorded, not SolidWorks mates. Supplied STEP BREP is preserved; illustrative sources remain illustrative. Source subassemblies are complete compounds within each equipment component. No native feature history or physical fibre geometry is generated.',
    components:setup.nodes.map(n=>{const source=sources.get(n.equipmentId);return {id:n.id,equipmentId:n.equipmentId,label:n.label||n.id,...sourcePlacement(n,setup.nodes,source.preview),stepPath:source.stepPath,sourceSha256:source.sourceSha256,cadKind:source.cadKind,cadReview:source.cadReview,mount:n.configuration?.mount||null,legacyMountingStage:n.configuration?.mountingStage||null,mainframe:n.configuration?.mainframeId||null,slot:n.configuration?.mainframeSlot||null};}),setup};
}
export async function exportAssemblyPackage(root,manifest){
  const python=await cadRuntime(root);if(!python)throw new Error('Local STEP assembly runtime unavailable. See the SolidWorks handoff guide to install it.');
  const directory=await mkdtemp(path.join(os.tmpdir(),'cs-cad-assembly-'));
  try{
    const input=path.join(directory,'manifest.json'),output=path.join(directory,'setup.zip');
    await writeFile(input,JSON.stringify(manifest));
    await execute(python,[path.join(root,'scripts/export-step-assembly.py'),input,output],{cwd:root,timeout:240000,maxBuffer:4*1024*1024,windowsHide:true});
    return await readFile(output);
  }catch(error){throw new Error(error.killed?'STEP assembly export timed out; try a smaller setup.':`STEP assembly export failed: ${error.stderr?.trim().slice(-600)||error.message}`);}
  finally{if(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep+'cs-cad-assembly-'))await rm(directory,{recursive:true,force:true});}
}
