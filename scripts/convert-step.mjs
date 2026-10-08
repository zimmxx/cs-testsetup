// Offline converter. Install occt-import-js 0.0.23 separately; it is not shipped in the web app.
// node scripts/convert-step.mjs <input.step> <output.glb> <converter package folder>
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const [input,output,converter,orientation]=process.argv.slice(2);
if(!input||!output||!converter)throw new Error('Provide input STEP, output GLB and occt-import-js folder.');
const require=createRequire(import.meta.url);
const occt=await require(path.resolve(converter))();
const result=occt.ReadStepFile(new Uint8Array(await readFile(input)),{linearUnit:'millimeter',linearDeflectionType:'absolute_value',linearDeflection:0.08,angularDeflection:0.35});
let partNames=[];if(input.endsWith('-Reference.step'))try{partNames=JSON.parse(await readFile(input+'.parts.json','utf8'));}catch{}
if(partNames.length&&partNames.length!==result.meshes?.length)throw new Error('Generated solids did not all tessellate. Check the source STEP.');
if(!result.success||!result.meshes?.length||!result.meshes.some(m=>m.attributes?.position?.array?.length>=9&&m.index?.array?.length>=3))throw new Error('STEP import produced no tessellated mesh geometry.');
const gltf={asset:{version:'2.0',generator:'CORNERSTONE STEP converter / occt-import-js 0.0.23'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],accessors:[],bufferViews:[],buffers:[]};
let offset=0,triangles=0;const chunks=[];const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
function accessor(values,kind,type,componentType,target){
  const typed=new kind(values),buffer=Buffer.from(typed.buffer);const view=gltf.bufferViews.length;
  gltf.bufferViews.push({buffer:0,byteOffset:offset,byteLength:buffer.length,target});chunks.push(buffer);offset+=buffer.length;
  const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}
  const entry={bufferView:view,componentType,count:values.length/(type==='VEC3'?3:1),type};
  if(type==='VEC3'&&target===34962&&kind===Float32Array){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<typed.length;i++){const a=i%3;min[a]=Math.min(min[a],typed[i]);max[a]=Math.max(max[a],typed[i]);}entry.min=min;entry.max=max;}
  const id=gltf.accessors.length;gltf.accessors.push(entry);return id;
}
for(const mesh of result.meshes){
  if(partNames.length)mesh.name=partNames[gltf.meshes.length];
  if(!mesh.attributes?.position?.array?.length||!mesh.index?.array?.length)continue;
  const positions=mesh.attributes.position.array.map(v=>v/1000); // glTF uses metres.
  if(positions.some(v=>!Number.isFinite(v)))throw new Error('Non-finite vertex coordinates.');
  for(let i=0;i<positions.length;i++){const a=i%3;bounds.min[a]=Math.min(bounds.min[a],positions[i]*1000);bounds.max[a]=Math.max(bounds.max[a],positions[i]*1000);}
  const attributes={POSITION:accessor(positions,Float32Array,'VEC3',5126,34962)};
  if(mesh.attributes.normal)attributes.NORMAL=accessor(mesh.attributes.normal.array,Float32Array,'VEC3',5126,34962);
  const indices=mesh.index.array;if(indices.some(i=>i<0||i>=positions.length/3))throw new Error('Invalid triangle index.');
  triangles+=indices.length/3;
  const reference=input.endsWith('-Reference.step');
  const palette=reference?(/black|dark|aperture/i.test(mesh.name)?[.12,.14,.18]:/gold/i.test(mesh.name)?[.76,.58,.2]:/copper/i.test(mesh.name)?[.7,.38,.22]:/screen/i.test(mesh.name)?[.16,.28,.34]:/wafer/i.test(mesh.name)?[.3,.28,.49]:[.63,.67,.72]):null;
  const material=gltf.materials.length;gltf.materials.push({name:reference?'Illustrative reference display':mesh.color?'CAD colour':'Neutral CAD display',pbrMetallicRoughness:{baseColorFactor:[...(palette||mesh.color||[0.42,0.45,0.49]),1],metallicFactor:reference&&/silver|gold|copper/.test(mesh.name)?0.55:0.15,roughnessFactor:0.6},doubleSided:false});
  const index=accessor(indices,Uint32Array,'SCALAR',5125,34963);
  const id=gltf.meshes.length;gltf.meshes.push({name:mesh.name,primitives:[{attributes,indices:index,material}]});
  gltf.scenes[0].nodes.push(gltf.nodes.length);gltf.nodes.push({name:mesh.name,mesh:id,...(orientation==='--z-up'?{rotation:[-Math.SQRT1_2,0,0,Math.SQRT1_2]}:{})});
}
const binary=Buffer.concat(chunks);gltf.buffers.push({byteLength:binary.length});
let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const header=Buffer.alloc(12);header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);
const jsonHeader=Buffer.alloc(8);jsonHeader.writeUInt32LE(json.length);jsonHeader.writeUInt32LE(0x4e4f534a,4);
const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(binary.length);binHeader.writeUInt32LE(0x004e4942,4);
const data=Buffer.concat([header,jsonHeader,json,binHeader,binary]);await writeFile(output,data);
const metadata={source:path.basename(input),converter:'occt-import-js 0.0.23 / OpenCascade',tessellation:{linearDeflectionMm:0.08,angularDeflectionRad:0.35},units:'metres in GLB; source bounds reported in mm',meshCount:result.meshes.length,triangles,boundsMm:bounds,extentsMm:bounds.max.map((v,i)=>v-bounds.min[i]),glbBytes:data.length,orientation:orientation==='--z-up'?'Source Z-up rotated -90 degrees about X for viewer Y-up':'Unmodified source axes; verify mounting orientation visually'};
await writeFile(output+'.metadata.json',JSON.stringify(metadata,null,2)+'\n');console.log(JSON.stringify(metadata));
