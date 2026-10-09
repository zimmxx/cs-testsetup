import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { fittedCameraPosition } from '../src/lib/cameraFraming.js';

test('phone camera contains every bench and shelf corner in its perspective frustum',()=>{
  const bounds={min:[-9,-5.8,-4.5],max:[9,12,4.5]},target=[0,2.5,0];
  for(const aspect of [260/370,330/370,375/370,1]){
    const position=fittedCameraPosition([15,13,19],target,bounds,aspect);
    const camera=new PerspectiveCamera(40,aspect,.05,150);
    camera.position.fromArray(position);camera.lookAt(new Vector3(...target));camera.updateMatrixWorld(true);
    for(const x of [bounds.min[0],bounds.max[0]])for(const y of [bounds.min[1],bounds.max[1]])for(const z of [bounds.min[2],bounds.max[2]]){
      const p=new Vector3(x,y,z).project(camera);
      assert.ok(Math.abs(p.x)<=1/1.12+1e-10 && Math.abs(p.y)<=1/1.12+1e-10,`Corner ${[x,y,z]} at aspect ${aspect} is cropped`);
      assert.ok(p.z>-1&&p.z<1);
    }
  }
});

test('camera fitting retains front-facing direction and never zooms closer than the default',()=>{
  const position=[-2.5,1.8,-3],target=[0,.5,0],bounds={min:[-.9,0,-.9],max:[.9,1.8,.9]};
  for(const aspect of [.45,1,2]){
    const fitted=fittedCameraPosition(position,target,bounds,aspect);
    const before=new Vector3(...position).sub(new Vector3(...target)),after=new Vector3(...fitted).sub(new Vector3(...target));
    assert.ok(after.length()+1e-10>=before.length());
    assert.ok(after.normalize().distanceTo(before.normalize())<1e-10);
    assert.ok(fitted[2]<0);
  }
});
