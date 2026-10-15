import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {boundsInRoot,nanoMaxMountPoint,registerFibreArmMounts,addDummySample,sampleKind} from '../src/lib/benchPresentation.js';
import {createSimulationLayer} from '../src/lib/simulationScene.js';
import {initialSimulation} from '../src/lib/simulation.js';
async function load(name){const b=readFileSync(new URL(`../public/library/models/${name}.glb`,import.meta.url));return (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;}
function fit(model){const b=new THREE.Box3().setFromObject(model),c=b.getCenter(new THREE.Vector3());model.scale.setScalar(10);model.position.set(-c.x*10,-b.min.y*10,-c.z*10);return model;}
test('actual supplied arms sit on NanoMax top plates while the complete stage bases stay fixed during simulation',async()=>{
 const [stageSource,armSource]=await Promise.all([load('max313d'),load('fibre-arm-try3-inward')]),scene=new THREE.Scene(),roots=[],nodes=[];
 for(const [side,x,yaw] of [['input',-1.8,Math.PI/2],['output',1.8,-Math.PI/2]]){
  for(const type of ['stage','arm']){const id=`${side}-${type}`,r=new THREE.Group();r.userData.nodeId=id;r.position.set(x,type==='arm'?.65:0,0);r.rotation.y=type==='stage'?yaw:side==='output'?Math.PI:0;r.userData.presentationHome={position:r.position.clone(),quaternion:r.quaternion.clone()};r.userData.modelRoot=fit((type==='stage'?stageSource:armSource).clone(true));r.add(r.userData.modelRoot);scene.add(r);roots.push(r);nodes.push({id,equipmentId:type==='stage'?'fibre-arm-stage':'wst-fibre-arms-manual',configuration:type==='arm'?{mountingStage:`${side}-stage`}:{}});}
 }
 // Model loading may finish while a nonzero simulation offset is displayed.
 roots[1].position.x+=.2;registerFibreArmMounts(roots,nodes);assert.ok(Math.abs(roots[1].position.x+1.6)<1e-12);roots[1].position.copy(roots[1].userData.presentationHome.position);
 for(const side of ['input','output']){const arm=roots.find(r=>r.userData.nodeId===`${side}-arm`),stage=roots.find(r=>r.userData.nodeId===`${side}-stage`),footBox=boundsInRoot(arm.userData.modelRoot.getObjectByName('Alley_Jig_Design_Split_Base'),arm),foot=footBox.getCenter(new THREE.Vector3());foot.y=footBox.min.y;assert.ok(arm.localToWorld(foot).distanceTo(stage.localToWorld(nanoMaxMountPoint(stage)))<1e-7);}
 const settings=initialSimulation(),runtime={current:{settings,model:{input:'input-arm',output:'output-arm',inputStage:'input-stage',outputStage:'output-stage',sources:[]},optics:{powers:{}},playing:false}};
 const bases=roots.filter(r=>r.userData.nodeId.endsWith('stage')).map(r=>({root:r,p:r.position.clone(),q:r.quaternion.clone()})),layer=createSimulationLayer(scene,roots,[],nodes,runtime);
 for(const axis of ['x','y','z']){settings.motion.input[axis]=100;settings.motion.output[axis]=-100;layer.update(1);for(const b of bases){assert.ok(b.p.distanceTo(b.root.position)<1e-12);assert.ok(b.q.angleTo(b.root.quaternion)<1e-7);}}
 settings.motion.input.angle=20;layer.update(2);
 const input=roots[1],foot=new THREE.Vector3().fromArray(input.userData.mountPresentation.armFoot),expected=foot.clone().applyQuaternion(input.userData.presentationHome.quaternion).add(input.userData.presentationHome.position).add(new THREE.Vector3(settings.motion.input.x,settings.motion.input.z,settings.motion.input.y).multiplyScalar(settings.exaggeration/100000));
 input.updateWorldMatrix(true,true);assert.ok(input.localToWorld(foot).distanceTo(expected)<1e-7);
 assert.notEqual(roots[1].position.x,roots[1].userData.presentationHome.position.x);layer.dispose();
});
test('illustrative chip and 203.2 mm wafer follow their respective holder without altering equipment geometry',()=>{
 for(const [id,kind] of [['chip-vacuum-stage','chip'],['wafer-carrier-2','wafer'],['wst-wafer-holder-manual','wafer']]){
  const root=new THREE.Group(),model=new THREE.Mesh(new THREE.BoxGeometry(.85,.25,.64));model.position.y=.125;root.add(model);root.userData.modelRoot=model;
  const sample=addDummySample(root,id);assert.equal(sampleKind(id),kind);assert.equal(sample.parent,root);assert.equal(sample.userData.illustrative,true);assert.ok(Math.abs(sample.position.y-.252)<1e-7);
  if(kind==='wafer'){assert.equal(sample.userData.diameterMm,203.2);sample.children[0].geometry.computeBoundingBox();assert.ok(Math.abs(sample.children[0].geometry.boundingBox.getSize(new THREE.Vector3()).x-2.032)<1e-6);}
  const count=root.children.length;assert.equal(addDummySample(root,id),undefined);assert.equal(root.children.length,count);root.position.set(2,3,4);root.updateMatrixWorld(true);assert.ok(Math.abs(sample.getWorldPosition(new THREE.Vector3()).y-3.252)<1e-7);
 }
 assert.equal(sampleKind('fibre-arm-stage'),null);
});
