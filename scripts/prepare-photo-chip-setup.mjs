// Explicit one-time preparation; preserves existing equipment and saved drafts.
// First: python scripts/generate-photo-chip-cad.py
// Then: node scripts/prepare-photo-chip-setup.mjs <photo1.jpg> <photo2.jpg> <photo3.jpg> <occt-package-folder>
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {photoChipEquipment, createPhotoChipSetup} from '../src/data/photoChipSetup.js';
const run=promisify(execFile),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.length!==4)throw new Error('Provide three JPEG photos and the local occt-import-js package folder.');
const checksum=buffer=>createHash('sha256').update(buffer).digest('hex');
const writeJson=(file,data)=>fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
const exists=async file=>{try{await fs.access(file);return true;}catch{return false;}};
function jpegSize(data){
  if(data.readUInt16BE(0)!==0xffd8)throw new Error('Source must be JPEG.');
  for(let offset=2;offset+9<data.length;){
    if(data[offset++]!==0xff)throw new Error('Invalid JPEG marker.');
    while(data[offset]===0xff)offset++;
    const marker=data[offset++];
    if(marker===0xd9||marker===0xda)break;
    const length=data.readUInt16BE(offset);
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {imageHeight:data.readUInt16BE(offset+3),imageWidth:data.readUInt16BE(offset+5)};
    offset+=length;
  }
  throw new Error('JPEG dimensions unavailable.');
}
async function preserveCopy(buffer,file){
  if(await exists(file)){if(checksum(await fs.readFile(file))!==checksum(buffer))throw new Error(`Refusing to overwrite a different source photo: ${file}`);return;}
  await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,buffer);
}
const photos=[];
for(let i=0;i<3;i++){
  const bytes=await fs.readFile(args[i]);
  const reference=`library/references/optical-chip-testing-v1/Photo-${i+1}.jpg`,image=`library/images/optical-chip-v1-photo-${i+1}.jpg`;
  await preserveCopy(bytes,path.join(root,'public',reference));await preserveCopy(bytes,path.join(root,'public',image));
  photos.push({photo:i+1,path:reference,image,...jpegSize(bytes),sha256:checksum(bytes),originalFilename:path.basename(args[i])});
}
const catalogFile=path.join(root,'public/library/equipment.json'),catalog=JSON.parse(await fs.readFile(catalogFile,'utf8'));
const sourcesFile=path.join(root,'public/library/images/sources.json'),sources=JSON.parse(await fs.readFile(sourcesFile,'utf8'));
for(const seed of photoChipEquipment){
  if(catalog.equipment.some(e=>e.id===seed.id)){console.log('Preserved existing library record:',seed.id);continue;}
  const source=path.join(root,'public',seed.stepPath),model=path.join(root,'public',seed.model3d);
  if(!await exists(source))throw new Error('Run generate-photo-chip-cad.py first.');
  if(!await exists(model))await run(process.execPath,[path.join(root,'scripts/convert-step.mjs'),source,model,path.resolve(args[3])],{cwd:root,windowsHide:true,timeout:120000,maxBuffer:2*1024*1024});
  const photo=photos.find(p=>p.image===seed.image);
  const record={...seed,imageSha256:photo.sha256,imageWidth:photo.imageWidth,imageHeight:photo.imageHeight,stepSha256:checksum(await fs.readFile(source))};
  catalog.equipment.push(record);
  sources.equipment.push({equipmentId:record.id,...Object.fromEntries(Object.entries(record).filter(([k])=>k.startsWith('image'))),name:record.name,model:record.model});
  await writeJson(path.join(path.dirname(source),'provenance.json'),{equipmentId:record.id,source:'User-supplied bench photos',cadKind:record.cadKind,review:record.cadReview,photos:photos.map(p=>p.path),generator:'scripts/generate-photo-chip-cad.py',units:'Illustrative millimetres',verifiedDimensions:false,sha256:record.stepSha256});
}
await writeJson(catalogFile,catalog);await writeJson(sourcesFile,sources);
const setup=createPhotoChipSetup();
const setupFile=path.join(root,`public/library/setups/${setup.id}.json`),draftFile=path.join(root,`public/library/workspaces_draft/${setup.id}_draft.json`);
if(!await exists(setupFile))await writeJson(setupFile,setup);
if(!await exists(draftFile))await writeJson(draftFile,{...setup,workspaceName:'Bench_draft',workspaceRevision:1});
const manifestFile=path.join(root,'public/library/references/optical-chip-testing-v1/photo-evidence.json');
if(!await exists(manifestFile))await writeJson(manifestFile,{version:1,setupId:setup.id,asOf:'2026-10-09',photos,
  observed:['Two silver fibre arms on black positioning stages','Separate front DUT motion stage with copper holder','Overhead microscope/camera and shelf monitor','Blue LED illuminator and cream shelf instrument','Orange/black handheld instrument','Thorlabs-branded optical table; room labels LAB 2077 and SETUP 3'],
  inferred:['8163B mainframe candidate','81940A and 81634B modules from existing inventory, not visible module identification','FPC562 controller and MAX313D stages as library candidates','Proposed left input/right output signal direction','C-band as a provisional filter allocation'],
  unknown:['Actual models/options/serials/calibration','Traceable cable endpoints, sleeve count, connector types and cut lengths','Coupling type/angle, power, scan range and limits','Stage travel, bench/shelf dimensions and hole pitch','Camera video/data route and illumination/controller relationship','Whether the handheld meter is used in the measurement'],
  mechanicalMounts:setup.nodes.filter(n=>n.configuration.mountingStage).map(n=>({instanceId:n.id,parentId:n.configuration.mountingStage,kind:'Provisional mechanical support; not a signal connection'})),
  connections:setup.connections.map(c=>({id:c.id,evidence:'Proposed; unverified',purpose:c.type==='optical'?'Candidate measurement path':'Candidate observation link'})),
  reviewStatus:'Draft; no operational approval and no Setup Explorer publication'});
console.log(JSON.stringify({setup:setup.id,instances:setup.nodes.length,newComponentDefinitions:photoChipEquipment.length,libraryRecords:catalog.equipment.length,photos:photos.length,published:false}));
