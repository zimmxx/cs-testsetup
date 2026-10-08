import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {obandEquipment,createObandAssembly} from '../src/data/obandAssembly.js';
const catalogPath='public/library/equipment.json',catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
const reviews={
 'oband-mainframe-8164b':'Generated 8164B enclosure with four upper compact bays and one lower horizontal TLS bay. Published 426 W × 145 H × 545 D mm outer envelope and user-supplied photo. Bay positions, wall thickness and panel details are illustrative, not vendor CAD.',
 'oband-laser-81606a':'Generated horizontal back-loadable 81606A module silhouette. Body dimensions, internal shape, ports and rear extraction handle are estimated; installed range 1240–1380 nm is user-confirmed. Not vendor CAD.',
 'oband-head-interface':'Generated 81618A compact single-head interface silhouette. Model and Slot 3 are user-confirmed; connector offsets and body depth are estimated. Not vendor CAD.',
 'oband-head-81624b':'Generated external 81624B head with illustrative 81000FA FC adapter. Head dimensions, cable stub and adapter mounting are estimated. User reports FC/PC optical input. Not vendor CAD.',
 'oband-adapter-81000fa':'Illustrative 81000FA FC connector adapter reference. Exact threads, aperture, dimensions and mating geometry are unmeasured. Not vendor CAD.',
};
for(const seed of obandEquipment){
 const old=catalog.equipment.find(e=>e.id===seed.id);if(old)continue;
 const stepPath=`library/references/${seed.id}/${seed.id}-Reference.step`,model3d=`library/models/${seed.id}.glb`,cadReview=reviews[seed.id];
 const bytes=await fs.readFile('public/'+stepPath);
 const item={...seed,stepPath,model3d,cadKind:'Illustrative reference',cadReview,cadSource:seed.url,stepSha256:createHash('sha256').update(bytes).digest('hex'),modelReference:`STEP: ${stepPath}\nGLB: ${model3d}\n${cadReview}`};
 catalog.equipment.push(item);
 await fs.writeFile(`public/library/references/${seed.id}/provenance.json`,JSON.stringify({equipmentId:seed.id,generatedAt:'2026-10-08',kind:item.cadKind,review:cadReview,sources:[seed.url,...(seed.id==='oband-mainframe-8164b'?['https://images.cdn-krs.com/upload/2025/04/10/20250410195018-d49944c0.jpg','https://www.keysight.com/us/en/assets/7018-01037/data-sheets/5988-3924.pdf']:seed.id==='oband-laser-81606a'?['https://www.keysight.com/us/en/assets/7018-01659/data-sheets/5989-7321.pdf']:[])],units:'millimetres',method:'Closed faceted reference solids, not a vendor mechanical assembly'},null,2)+'\n');
}
await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
const file='public/library/setups/oband-mainframe-assembly.json';
try{await fs.access(file);console.log('Preserved existing saved O-band setup.');}catch{const setup=createObandAssembly();for(const n of setup.nodes){const e=catalog.equipment.find(e=>e.id===n.equipmentId);Object.assign(n.configuration,{cadReference:e.stepPath,modelReference:e.model3d});}await fs.writeFile(file,JSON.stringify(setup,null,2)+'\n');}
console.log('O-band catalog and local saved assembly prepared.');
