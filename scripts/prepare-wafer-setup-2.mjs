// One-time evidence/asset preparation; never overwrite edited catalog/draft records.
// node scripts/prepare-wafer-setup-2.mjs <photo1> <photo2> <photo3> <photo4> <occt-folder>
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {wafer2Equipment,createPhotoWaferSetup2} from '../src/data/photoWaferSetup2.js';
const run=promisify(execFile),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
if(args.length!==5)throw new Error('Provide four JPEG files and the local occt-import-js folder.');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const exists=async file=>{try{await fs.access(file);return true;}catch{return false;}};
const write=async(file,data)=>{await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');};
async function copy(bytes,relative){const file=path.join(root,'public',relative);if(await exists(file)){if(hash(await fs.readFile(file))!==hash(bytes))throw new Error('Different evidence already exists: '+relative);return;}await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);}
function size(bytes){for(let o=2;o+9<bytes.length;){if(bytes[o++]!==255)throw new Error('Invalid JPEG');while(bytes[o]===255)o++;const marker=bytes[o++],length=bytes.readUInt16BE(o);if([192,193,194].includes(marker))return {imageHeight:bytes.readUInt16BE(o+3),imageWidth:bytes.readUInt16BE(o+5)};o+=length;}throw new Error('Missing JPEG dimensions');}
const photos=[];
for(let i=0;i<4;i++){const bytes=await fs.readFile(args[i]),reference=`library/references/wafer-manual-setup-2/Photo-${i+1}.jpg`,image=`library/images/wafer-setup-2-photo-${i+1}.jpg`;await copy(bytes,reference);await copy(bytes,image);photos.push({photo:i+1,path:reference,image,originalFilename:path.basename(args[i]),sha256:hash(bytes),...size(bytes)});}
const catalogFile=path.join(root,'public/library/equipment.json'),catalog=JSON.parse(await fs.readFile(catalogFile,'utf8'));
const imagesFile=path.join(root,'public/library/images/sources.json'),images=JSON.parse(await fs.readFile(imagesFile,'utf8'));
for(const seed of wafer2Equipment){
  if(catalog.equipment.some(e=>e.id===seed.id)){console.log('Preserved equipment',seed.id);continue;}
  const step=path.join(root,'public',seed.stepPath),model=path.join(root,'public',seed.model3d);
  if(!await exists(step))throw new Error('Run generate-wafer-setup-2-cad.py first.');
  if(!await exists(model))await run(process.execPath,[path.join(root,'scripts/convert-step.mjs'),step,model,path.resolve(args[4])],{cwd:root,windowsHide:true,timeout:120000,maxBuffer:2*1024*1024});
  const photo=photos.find(p=>p.image===seed.image),record={...seed,imageSha256:photo.sha256,imageWidth:photo.imageWidth,imageHeight:photo.imageHeight,stepSha256:hash(await fs.readFile(step))};
  catalog.equipment.push(record);images.equipment.push({equipmentId:record.id,name:record.name,model:record.model,...Object.fromEntries(Object.entries(record).filter(([key])=>key.startsWith('image')))});
  await write(path.join(path.dirname(step),'provenance.json'),{equipmentId:record.id,source:'Four user Setup 2 photos, received 2026-10-13',cadKind:record.cadKind,review:record.cadReview,photos:photos.map(p=>p.path),generator:'scripts/generate-wafer-setup-2-cad.py',units:'millimetres / Y-up',verifiedDimensions:false,sha256:record.stepSha256});
}
await write(catalogFile,catalog);await write(imagesFile,images);
const setup=createPhotoWaferSetup2();
for(const [relative,data] of [[`library/setups/${setup.id}.json`,setup],[`library/workspaces_draft/${setup.id}_draft.json`,{...setup,workspaceName:'Bench_draft',workspaceRevision:1}]])if(!await exists(path.join(root,'public',relative)))await write(path.join(root,'public',relative),data);
const manifest=path.join(root,'public',setup.photoEvidence.manifest);
if(!await exists(manifest))await write(manifest,{version:1,setupId:setup.id,asOf:'2026-10-13',photos,
 observed:['SETUP 2 bench label','Circular openwork carrier, no wafer visibly loaded','Separate large rail/handwheel wafer motion assembly','Two opposing silver arms on micrometer stages','Two front-left paddle/loop assemblies','Overhead microscope and button-control camera','Dual monitors, desktop PC, keyboard/tray and aluminium gantry','Keithley-labelled upper-left instrument and two optical instrument housings','Small three-button digital indicator and rear auxiliary mounts'],
 userConfirmations:[{date:'2026-10-13',statement:'It is the same used as Manual Wafer Optical Measurements',interpretation:'Core instruments 8163B / 81940A / 81634B; slot order unconfirmed'},{date:'2026-10-13',statement:'Remove larger right-hand shelf instrument; redundant/not used',action:'Excluded from Setup 2; shared library record and other setups retained'}],
 excluded:[{photoObservation:'Large right-hand shelf housing',reason:'User confirmed unused/redundant'}],
 inferred:['Slot 1/2 display assignments remain provisional despite confirmed 8163B / 81940A / 81634B identities','MAX313D and try3 arm geometry reused as provisional matches','Left input / right output and two-controller return path are proposed','C-band only for catalog filtering','Camera-to-PC-to-displays and keyboard data links are candidates'],
 unknown:['Actual room, instrument models/options/serials/calibration','Laser/detector modules, band and head/interface details','Fibre type/connector ends/sleeves/length/cut tips','Controller roles and traceable optical signal direction','Wafer diameter, retention/vacuum, carrier pattern and stage axes/travel','Coupling type/angles/power/scan/approved limits','Measured table/shelf geometry, mount offsets and clearances','Red electrical lead destinations and auxiliary mount purpose','Imaging/video/control interfaces and indicator axis/units'],
 mechanicalMounts:setup.nodes.filter(n=>n.configuration.mountingStage||n.configuration.mount||n.configuration.mainframeId).map(n=>({instanceId:n.id,parentId:n.configuration.mountingStage||n.configuration.mount?.parentId||n.configuration.mainframeId,kind:n.configuration.mainframeId?'Confirmed module identity; provisional slot order':'Provisional mechanical support',...(n.configuration.mount?{offsets:n.configuration.mount}:{})})),
 connections:setup.connections.map(c=>({id:c.id,evidence:'Proposed / unverified',purpose:c.type==='optical'?'Candidate measurement route':'Candidate workstation image/data link'})),
 reviewStatus:'Editable unpublished draft; no operational approval'});
console.log(JSON.stringify({setup:setup.id,instances:setup.nodes.length,paths:setup.connections.length,newEquipment:wafer2Equipment.length,libraryRecords:catalog.equipment.length,published:false}));
