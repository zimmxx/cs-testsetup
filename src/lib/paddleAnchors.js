import * as THREE from 'three';

// FPC562's three thin circular covers, in the vendor GLB's metre coordinates.
// Resolve their actual centres through the displayed model transform instead of
// assuming evenly spaced offsets from the equipment origin.
export function locatePaddleAnchors(model,root){
 if(!model)return [];
 root.updateWorldMatrix(true,true);
 const parts=[];
 model.traverse(mesh=>{
  if(!mesh.isMesh)return;
  mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox,size=box.getSize(new THREE.Vector3());
  if(Math.abs(size.x-.063627)>.001||Math.abs(size.y-.063627)>.001||size.z>.0022)return;
  const local=box.getCenter(new THREE.Vector3()),center=root.worldToLocal(mesh.localToWorld(local.clone()));
  const rim=root.worldToLocal(mesh.localToWorld(local.clone().add(new THREE.Vector3(.028,0,0))));
  const quaternion=root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(mesh.getWorldQuaternion(new THREE.Quaternion()));
  parts.push({center,radius:center.distanceTo(rim),quaternion});
 });
 return parts.length===3?parts.sort((a,b)=>a.center.x-b.center.x):[];
}
