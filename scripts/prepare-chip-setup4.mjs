// Explicit evidence/model preparation; existing catalog, CAD and drafts are preserved.
// node scripts/prepare-chip-setup4.mjs <photo1> <photo2> <photo3> <occt-folder>
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chip4Equipment,createPhotoChipSetup4} from '../src/data/photoChipSetup4.js';
const run=promisify(execFile),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2);
if(args.length!==4)throw new Error('Provide three JPEG files and the local OCCT folder.');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const exists=async file=>{try{await fs.access(file);return true;}catch{return false;}};
const write=async(file,data)=>{await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');};
async function copy(bytes,relative){const file=path.join(root,'public',relative);if(await exists(file)){if(hash(await fs.readFile(file))!==hash(bytes))throw new Error('Evidence conflict: '+relative);return;}await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);}
function size(bytes){for(let o=2;o+9<bytes.length;){if(bytes[o++]!==255)throw new Error('Invalid JPEG');while(bytes[o]===255)o++;const marker=bytes[o++],length=bytes.readUInt16BE(o);if([192,193,194].includes(marker))return {imageHeight:bytes.readUInt16BE(o+3),imageWidth:bytes.readUInt16BE(o+5)};o+=length;}throw new Error('Missing JPEG dimensions');}
const photos=[];
for(let i=0;i<3;i++){const bytes=await fs.readFile(args[i]),reference=`library/references/chip-manual-setup4/Photo-${i+1}.jpg`,image=`library/images/chip-setup4-photo-${i+1}.jpg`;await copy(bytes,reference);await copy(bytes,image);photos.push({photo:i+1,path:reference,image,originalFilename:path.basename(args[i]),sha256:hash(bytes),...size(bytes)});}
const catalogFile=path.join(root,'public/library/equipment.json'),catalog=JSON.parse(await fs.readFile(catalogFile,'utf8'));
const imagesFile=path.join(root,'public/library/images/sources.json'),images=JSON.parse(await fs.readFile(imagesFile,'utf8'));
for(const seed of chip4Equipment){
 if(catalog.equipment.some(e=>e.id===seed.id)){console.log('Preserved',seed.id);continue;}
 const step=path.join(root,'public',seed.stepPath),model=path.join(root,'public',seed.model3d);
 if(!await exists(step))throw new Error('Generate the illustrative CAD first.');
 if(!await exists(model))await run(process.execPath,[path.join(root,'scripts/convert-step.mjs'),step,model,path.resolve(args[3])],{cwd:root,windowsHide:true,timeout:120000,maxBuffer:2*1024*1024});
 const photo=photos.find(p=>p.image===seed.image),record={...seed,imageSha256:photo.sha256,imageWidth:photo.imageWidth,imageHeight:photo.imageHeight,stepSha256:hash(await fs.readFile(step))};
 catalog.equipment.push(record);images.equipment.push({equipmentId:record.id,name:record.name,model:record.model,...Object.fromEntries(Object.entries(record).filter(([key])=>key.startsWith('image')))});
 await write(path.join(path.dirname(step),'provenance.json'),{equipmentId:record.id,source:'Three user Setup 4 photos, received 2026-10-13',cadKind:record.cadKind,review:record.cadReview,photos:photos.map(p=>p.path),generator:'scripts/generate-chip-setup4-cad.py',units:'millimetres / Y-up',verifiedDimensions:false,sha256:record.stepSha256});
}
await write(catalogFile,catalog);await write(imagesFile,images);
const setup=createPhotoChipSetup4();
for(const [relative,data] of [[`library/setups/${setup.id}.json`,setup],[`library/workspaces_draft/${setup.id}_draft.json`,{...setup,workspaceName:'Bench_draft',workspaceRevision:1}]])if(!await exists(path.join(root,'public',relative)))await write(path.join(root,'public',relative),data);
const manifest=path.join(root,'public',setup.photoEvidence.manifest);
if(!await exists(manifest))await write(manifest,{version:1,setupId:setup.id,asOf:'2026-10-13',photos,
 userConfirmations:[{date:'2026-10-13',statement:'Name it chip-manual-setup4',action:'Use requested ID; photo label also SETUP 4'},{date:'2026-10-13',statement:'Keysight 81606A and external detector head',action:'Default active system; Santec inactive'},{date:'2026-10-13',statement:'Same supplied vacuum chip holder',action:'Reuse chip-vacuum-stage actual supplied CAD'}],
 observed:['SETUP 4 shelf label','81606A / 1310 labels in horizontal laser slot','White Santec TSL-570 and modular power meter on shelf','Black cylindrical head with yellow band and head cable','Two opposing silver arms and separate front DUT stage','Copper sample block/fixture','Overhead microscope and button-control camera','Two displays, tower, shelf/frame and right auxiliary stage'],
 inferred:['8164B housing, 81618A interface/slot 3 and 81624B head are reference candidates','MPM-210 family identification needs model/suffix confirmation','MAX313D/try3 arm and microscope models reused provisionally','Keysight source/head path and camera/PC/display links are proposed','O-band filter allocation from 1310 label'],
 unknown:['Exact detector/interface identities and active fibre endpoints','Installed wavelength options, detector/interface identity, slots and MPM channels','Fibre models/connector ends/sleeves/length/tips and input/output direction','Coupling/angles/power/scan/calibration/approved limits','Holder retention/vacuum/heating, stage axes/travel and auxiliary role','Measured table/shelf/placements and camera/objective/illumination/data links'],
 mechanicalMounts:setup.nodes.filter(n=>n.configuration.mountingStage||n.configuration.mount||n.configuration.mainframeId).map(n=>({instanceId:n.id,parentId:n.configuration.mountingStage||n.configuration.mount?.parentId||n.configuration.mainframeId,kind:'Provisional support / module placement'})),
 connections:setup.connections.map(c=>({id:c.id,evidence:'Proposed / unverified',purpose:c.type==='optical'?'Candidate Keysight measurement route':'Candidate head/image/data link'})),
 vendorReferences:[{url:'https://inst.santec.com/products/test-and-measurement/tunablelaser/tsl-570',reviewedAt:'2026-10-13'},{url:'https://www.santec.com/dcms_media/other/instruments_MPM-210-M-E.pdf',reviewedAt:'2026-10-13'}],reviewStatus:'Unpublished draft; no operational approval'});
console.log(JSON.stringify({setup:setup.id,instances:setup.nodes.length,uniqueEquipment:new Set(setup.nodes.map(n=>n.equipmentId)).size,paths:setup.connections.length,newEquipment:chip4Equipment.length,libraryRecords:catalog.equipment.length,published:false}));
