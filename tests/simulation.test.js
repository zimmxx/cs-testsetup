import test from 'node:test';
import assert from 'node:assert/strict';
import { equipment } from '../src/data/catalog.js';
import { workspaceSeed } from '../src/lib/workspace_draft.js';
import { initialSimulation, perfectFibreAlignment, identifySimulation, opticalSimulation, coupling, polarizationTE, turnDisplacement, demoFrame, validateSimulation, interpolatePose, equipmentMotionProfile } from '../src/lib/simulation.js';
import {createSimulationLayer} from '../src/lib/simulationScene.js';
import * as THREE from 'three';
const aligned=()=>{const s=initialSimulation();for(const g of ['input','output','dut'])Object.assign(s.motion[g],{x:0,y:0,z:0});s.laserOn=true;return s;};

test('perfect fibre alignment matches the current DUT position and yaw without changing power or polarisation',()=>{
 const state=initialSimulation();Object.assign(state.motion.dut,{x:100,y:-35,z:22,yaw:3});state.targetAngle=12;state.paddles=[20,45,30];
 const before=structuredClone(state),next=perfectFibreAlignment(state);
 assert.equal(coupling(next,'input'),1);assert.equal(coupling(next,'output'),1);assert.deepEqual(next.motion.dut,state.motion.dut);assert.deepEqual(next.paddles,state.paddles);assert.equal(next.laserOn,state.laserOn);assert.deepEqual(state,before);
 Object.assign(state.motion.dut,{x:2000,yaw:5});assert.throws(()=>perfectFibreAlignment(state),/travel limit/);
});
test('simulation identifies independent arms, wafer/chip support and connected source on the three manual benches',()=>{
 for(const id of ['wst-optical-manual','wafer-manual-setup-2','chip-manual-setup4']){
  const s=workspaceSeed(id),before=structuredClone(s),m=identifySimulation(s,equipment);assert.ok(m.supported);assert.notEqual(m.inputStage,m.outputStage);assert.notEqual(m.dutStage,m.inputStage);assert.ok(m.sourceId);assert.deepEqual(s,before);
 }
});
test('laser off yields no light; aligned path has passive loss; inactive sources and disconnected detectors stay dark',()=>{
 const s=workspaceSeed('chip-manual-setup4'),m=identifySimulation(s,equipment),v=aligned();
 const on=opticalSimulation(s,m,v,m.sourceId);assert.ok(Math.abs(on.detectorMw-.7)<1e-9);assert.equal(on.lit.length,5);
 assert.ok(Object.keys(on.powers).every(id=>s.connections.find(c=>c.id===id).type==='optical'));
 assert.equal(opticalSimulation(s,m,{...v,laserOn:false},m.sourceId).lit.length,0);
 assert.equal(opticalSimulation(s,m,v,'c4-santec-laser').detectorMw,0);
 const broken={...s,connections:s.connections.filter(c=>c.id!=='C4-O3')};assert.equal(opticalSimulation(broken,m,v,m.sourceId).detectorMw,0);
 const inputBroken=opticalSimulation({...s,connections:s.connections.filter(c=>c.id!=='C4-O2')},m,v,m.sourceId);assert.equal(inputBroken.inputMw,0);assert.equal(inputBroken.dutMw,0);assert.equal(inputBroken.outputMw,0);
 const cycle={...s,connections:[...s.connections,{id:'loop',from:'c4-controller',to:'c4-laser',type:'optical'}]};assert.ok(Number.isFinite(opticalSimulation(cycle,m,v,m.sourceId).detectorMw));
});
test('misalignment, height, tip angle, sample yaw and ideal paddle rotations influence coupling without creating gain',()=>{
 const v=aligned();assert.equal(coupling(v,'input'),1);
 for(const [g,k,value] of [['input','x',10],['input','y',20],['input','angle',20],['dut','yaw',5]]){const s=structuredClone(v);s.motion[g][k]=value;assert.ok(coupling(s,'input')<.1);}
 assert.ok(Math.abs(polarizationTE([0,0,0])-1)<1e-10);assert.ok(polarizationTE([0,45,0])<1e-10);
 for(let i=0;i<100;i++){const p=polarizationTE([i,i*1.2,i*.5]);assert.ok(p>=0&&p<=1);}
});
test('micrometer revolution pitch, differential travel stops and interpolation use physical units',()=>{
 assert.equal(turnDisplacement(0,360,50,150),50);assert.equal(turnDisplacement(149,360,50,150),150);assert.equal(turnDisplacement(-149,-360,50,150),-150);
 const a=initialSimulation(),b=aligned(),before=structuredClone(a);assert.equal(interpolatePose(a,b,.5).motion.input.x,7);assert.deepEqual(a,before);assert.equal(interpolatePose(a,b,.5).laserOn,false);assert.equal(interpolatePose(a,b,1).laserOn,true);
});
test('guided demo begins/ends dark, aligns both tips then scans the sample and preserves bounded settings',()=>{
 assert.equal(demoFrame(0).laserOn,false);assert.equal(demoFrame(32).laserOn,false);assert.equal(demoFrame(31).phase,6);
 const peak=demoFrame(23);assert.equal(peak.motion.input.x,0);assert.equal(peak.motion.output.x,0);assert.ok(peak.laserOn);
 assert.ok(Math.abs(demoFrame(25.5).motion.dut.x)>7.9);
});
test('animation import validates each pose, ID, lengths and numerical values',()=>{
 const data={version:1,setupId:'test-setup',settings:initialSimulation(),keyframes:[{label:'Start',settings:aligned()}]};assert.equal(validateSimulation(data,'test-setup'),data);
 for(const mutate of [s=>s.settings.motion.input.x=Infinity,s=>s.settings.pitch=0,s=>s.settings.powerMw=-1,s=>s.keyframes[0].settings.paddles=[NaN,0,0],s=>s.keyframes=Array(41).fill(s.keyframes[0]),s=>s.setupId='other']){const s=structuredClone(data);mutate(s);assert.throws(()=>validateSimulation(s,'test-setup'));}
});
test('all library records have explicit motion representation without invented joints',()=>{
 for(const e of equipment){const p=equipmentMotionProfile(e);assert.equal(typeof p.interactive,'boolean');assert.ok(p.motion&&p.evidence);}
 assert.ok(equipmentMotionProfile({id:'fibre-arm-stage'}).evidence.includes('50 µm/rev'));
 assert.equal(equipmentMotionProfile({id:'unknown-meter',category:'Detection'}).interactive,false);
});
test('3D simulation layer moves the arm/holder while retaining stage bases and finite electrical/optical curves',()=>{
 const scene=new THREE.Scene(),ids=['arm-in','arm-out','holder','stage-in','stage-out','stage-dut','controller'];
 const roots=ids.map((id,i)=>{const r=new THREE.Group();r.userData.nodeId=id;r.position.set(i,1,0);scene.add(r);return r;});
 const edges=[{id:'opt',type:'optical',from:'arm-in',to:'holder'},{id:'elec',type:'electrical',from:'stage-in',to:'holder'}];
 const paths=edges.map(edge=>({edge,curve:new THREE.LineCurve3(new THREE.Vector3(),new THREE.Vector3(2,1,0)),line:new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial()),arrow:new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3())}));
 const v=aligned();v.motion.input.x=10;const runtime={current:{settings:v,model:{input:'arm-in',output:'arm-out',dut:'holder',inputStage:'stage-in',outputStage:'stage-out',dutStage:'stage-dut'},optics:{powers:{opt:1}},playing:false,action:''}};
 const controllerModel=new THREE.Group();controllerModel.scale.setScalar(10);for(const x of [-.08,0,.08]){const face=new THREE.Mesh(new THREE.BoxGeometry(.063627,.063627,.001575));face.position.set(x,.05,0);controllerModel.add(face);}roots[6].add(controllerModel);roots[6].userData.modelRoot=controllerModel;
 const layer=createSimulationLayer(scene,roots,paths,[{id:'controller',equipmentId:'polarisation-test'}],runtime);layer.update(1);assert.ok(Math.abs(roots[0].position.x-.06)<1e-12);assert.equal(roots[3].position.x,3);
 layer.update(2);assert.ok(Math.abs(roots[0].position.x-.06)<1e-12);for(const p of paths)assert.ok(p.curve.getPoint(.5).toArray().every(Number.isFinite));
 // Fibre Y is horizontal world Z; fibre Z is vertical world Y. DUT controls use the same convention.
 Object.assign(v.motion.input,{x:0,y:20,z:30});Object.assign(v.motion.output,{y:-10,z:15});Object.assign(v.motion.dut,{y:5,z:7});layer.update(3);
 assert.ok(Math.abs(roots[0].position.y-1.18)<1e-12);assert.ok(Math.abs(roots[0].position.z-.12)<1e-12);
 assert.ok(Math.abs(roots[1].position.y-1.09)<1e-12);assert.ok(Math.abs(roots[1].position.z+.06)<1e-12);
 assert.ok(Math.abs(roots[2].position.y-1.042)<1e-12);assert.ok(Math.abs(roots[2].position.z-.03)<1e-12);
 const matched=aligned();Object.assign(matched.motion.input,{y:7,z:5});Object.assign(matched.motion.dut,{y:7,z:5});assert.equal(coupling(matched,'input'),1);
 v.paddles[0]=90;layer.update(4);const paddle=scene.children.find(o=>o.geometry?.type==='TorusGeometry');assert.ok(paddle.quaternion.angleTo(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2))<1e-10);
 scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});
});
