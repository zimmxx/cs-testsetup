import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { reachArm, prepareTechnician, disposeAvatar } from '../src/lib/technicianAvatar.js';
import { createSimulationLayer } from '../src/lib/simulationScene.js';
import { initialSimulation } from '../src/lib/simulation.js';

test('technician asset is a local self-contained GLB with CC0 provenance, skin and idle animation',()=>{
 const bytes=readFileSync(new URL('../public/library/people/lab-technician.glb',import.meta.url));
 assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(8),bytes.length);assert.ok(bytes.length<10_000_000);
 const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 assert.equal(doc.asset.extras.license,'CC0-1.0');assert.ok(doc.skins.length>0);assert.ok(doc.animations.some(c=>/idle/i.test(c.name)));
 assert.ok(doc.images.every(i=>Number.isInteger(i.bufferView)&&!i.uri));assert.ok(doc.buffers.every(b=>!b.uri));
 assert.ok(!doc.nodes.find(n=>n.name==='Briefcase')?.mesh);
 const jointNames=new Set(doc.nodes.map(n=>n.name));for(const side of ['l','r'])for(const part of ['upperarm','lowerarm','hand'])assert.ok(jointNames.has(`${part}_${side}`));
});

test('technician arm reach preserves anatomical segment lengths and clamps unreachable targets',()=>{
 const root=new THREE.Group(),upper=new THREE.Bone(),lower=new THREE.Bone(),hand=new THREE.Bone();root.add(upper);upper.add(lower);lower.add(hand);lower.position.y=-2;hand.position.y=-1.5;
 for(const target of [new THREE.Vector3(1,-2,1),new THREE.Vector3(50,0,0),new THREE.Vector3(0,0,0)]){
  root.updateMatrixWorld(true);const end=reachArm(upper,lower,hand,target,new THREE.Vector3(-1,-1,1));root.updateMatrixWorld(true);
  const a=upper.getWorldPosition(new THREE.Vector3()),b=lower.getWorldPosition(new THREE.Vector3()),c=hand.getWorldPosition(new THREE.Vector3());
  assert.ok(Math.abs(a.distanceTo(b)-2)<1e-9);assert.ok(Math.abs(b.distanceTo(c)-1.5)<1e-9);assert.ok(c.distanceTo(end)<1e-8);assert.ok(c.toArray().every(Number.isFinite));assert.ok(a.distanceTo(c)<=3.5);
 }
});

test('setup transitions never show an old placeholder figure and ignore late technician loads',()=>{
 const scene=new THREE.Scene(),runtime={current:{settings:initialSimulation(),model:{sources:[]},optics:{powers:{}},action:'',playing:false}},states=[];let ready;
 const layer=createSimulationLayer(scene,[],[],[],runtime,{loadTechnician:callback=>{ready=callback;},onTechnician:s=>states.push(s)});
 layer.update(1);assert.equal(layer.operator.children.length,0);assert.equal(layer.operator.visible,false);
 layer.dispose();const late=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial());let freed=false;late.geometry.addEventListener('dispose',()=>{freed=true;});ready({scene:late});
 assert.equal(freed,true);assert.equal(layer.operator.children.length,0);assert.deepEqual(states,[]);
 disposeAvatar(scene);
});

test('actual technician rig keeps fingers and bone proportions stable across idle loops and smooth target changes',async()=>{
 // Keep the actual mesh, skeleton and animation data. Omit only texture loading
 // so this regression runs in Node without browser image/network dependencies.
 const bytes=readFileSync(new URL('../public/library/people/lab-technician.glb',import.meta.url)),jsonLength=bytes.readUInt32LE(12);
 const doc=JSON.parse(bytes.subarray(20,20+jsonLength).toString()),binary=bytes.subarray(28+jsonLength);
 doc.materials=doc.materials.map(m=>({name:m.name,pbrMetallicRoughness:{metallicFactor:0,roughnessFactor:1}}));delete doc.images;delete doc.textures;
 let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
 const output=Buffer.alloc(28+json.length+binary.length);output.writeUInt32LE(0x46546c67,0);output.writeUInt32LE(2,4);output.writeUInt32LE(output.length,8);output.writeUInt32LE(json.length,12);output.writeUInt32LE(0x4e4f534a,16);json.copy(output,20);output.writeUInt32LE(binary.length,20+json.length);output.writeUInt32LE(0x004e4942,24+json.length);binary.copy(output,28+json.length);
 const gltf=await new GLTFLoader().parseAsync(output.buffer,'');
 const bones=[];gltf.scene.traverse(o=>{if(o.isBone)bones.push(o);});const fingers=bones.filter(b=>/^(index|middle|ring|pinky|thumb)_/.test(b.name));
 const originals=new Map(bones.map(b=>[b.name,{position:b.position.clone(),scale:b.scale.clone(),q:b.quaternion.clone()}]));
 const avatar=prepareTechnician(gltf),target=new THREE.Vector3(1,2,-3),hand=bones.find(b=>b.name==='hand_r');let previous=null;
 for(let frame=0;frame<480;frame++){
  if(frame===240)target.set(-4,1,2);
  avatar.update(frame/30,{target,walking:false,animate:true,pitch:50,displacement:0});
  for(const b of bones){assert.ok(b.position.distanceTo(originals.get(b.name).position)<1e-12);assert.ok(b.scale.distanceTo(originals.get(b.name).scale)<1e-12);assert.ok(b.quaternion.toArray().every(Number.isFinite));}
  for(const b of fingers)assert.ok(b.quaternion.clone().normalize().angleTo(originals.get(b.name).q.clone().normalize())<1e-6,`${b.name} pose changed`);
  const world=hand.getWorldPosition(new THREE.Vector3());if(previous)assert.ok(world.distanceTo(previous)<.65,'hand jumped between frames');previous=world;
 }
 avatar.dispose();disposeAvatar(avatar.root);
});
