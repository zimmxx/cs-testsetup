import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { locatePaddleAnchors } from '../src/lib/paddleAnchors.js';
import { disposeAvatar } from '../src/lib/technicianAvatar.js';

test('paddle rings use the actual FPC562 cover centres, spacing and radius through the displayed CAD transform',async()=>{
 const bytes=readFileSync(new URL('../public/library/models/fpc562.glb',import.meta.url));
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const root=new THREE.Group(),model=gltf.scene,box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3());
 model.scale.setScalar(10);model.position.set(-center.x*10,-box.min.y*10,-center.z*10);root.add(model);
 const anchors=locatePaddleAnchors(model,root);assert.equal(anchors.length,3);
 for(let i=0;i<3;i++){assert.ok(Math.abs(anchors[i].center.x-(i-1)*.79248)<1e-5);assert.ok(Math.abs(anchors[i].center.y-.60325)<1e-5);assert.ok(Math.abs(anchors[i].radius-.28)<1e-8);}
 root.position.set(5,2,-4);root.rotation.set(.2,.8,.1);const rotated=locatePaddleAnchors(model,root);
 for(let i=0;i<3;i++){assert.ok(rotated[i].center.distanceTo(anchors[i].center)<1e-8);assert.ok(Math.abs(rotated[i].radius-anchors[i].radius)<1e-8);}
 assert.deepEqual(locatePaddleAnchors(null,root),[]);disposeAvatar(root);
});
