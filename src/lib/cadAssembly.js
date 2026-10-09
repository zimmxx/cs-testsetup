import { equipmentPose, housingFor } from './mainframeAssembly.js';
import { benchPosition } from './benchLayout.js';
import { multiplyQuaternion, rotateVector } from './placement.js';

function compose(parent,node){
  if(node.matrix||node.scale?.some(v=>v!==1))throw new Error('Source STEP export requires a rigid, unscaled preview transform.');
  const q=multiplyQuaternion(parent.q,node.rotation||[0,0,0,1]),offset=rotateVector(node.translation||[0,0,0],parent.q);
  return {q,t:parent.t.map((v,i)=>v+offset[i])};
}
export function previewTransform(bytes){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw new Error('Invalid preview GLB.');
  const length=view.getUint32(12,true),data=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+length))),transforms=[],min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  function walk(id,parent){
    const node=data.nodes[id],transform=compose(parent,node);
    if(node.mesh!==undefined){
      transforms.push(transform);
      for(const primitive of data.meshes[node.mesh].primitives){
        const bounds=data.accessors[primitive.attributes.POSITION];
        if(!bounds.min||!bounds.max)throw new Error('Preview bounds are missing.');
        for(let mask=0;mask<8;mask++){
          const v=rotateVector(bounds.min.map((_,i)=>mask&(1<<i)?bounds.max[i]:bounds.min[i]),transform.q).map((v,i)=>v+transform.t[i]);
          for(let i=0;i<3;i++){min[i]=Math.min(min[i],v[i]);max[i]=Math.max(max[i],v[i]);}
        }
      }
    }
    for(const child of node.children||[])walk(child,transform);
  }
  for(const id of data.scenes[data.scene||0].nodes)walk(id,{q:[0,0,0,1],t:[0,0,0]});
  if(!transforms.length||!min.every(Number.isFinite))throw new Error('Preview has no geometry.');
  const first=transforms[0];
  for(const transform of transforms)if([...transform.q,...transform.t].some((v,i)=>Math.abs(v-[...first.q,...first.t][i])>1e-8))throw new Error('Preview uses independent part transforms; source-to-preview mapping must be supplied before STEP export.');
  return {...first,min,max};
}
// Same bottom-centre/front registration as ModelScene. No mesh-to-STEP
// conversion: this matrix places the original source geometry in mm.
export function sourcePlacement(node,nodes,preview){
  const world=equipmentPose(node,nodes,benchPosition),centre=preview.min.map((v,i)=>(v+preview.max[i])/2),registered=preview.t.map((v,i)=>v-(i===1?preview.min[1]:i===2&&housingFor(node,nodes)?preview.min[2]:centre[i]));
  const offset=rotateVector(registered.map(v=>v*1000),world.quaternion);
  return {quaternion:multiplyQuaternion(world.quaternion,preview.q),translationMm:[world.x*100+offset[0],world.y*100+offset[1],world.z*100+offset[2]],worldOriginMm:[world.x*100,world.y*100,world.z*100],worldQuaternion:world.quaternion};
}
