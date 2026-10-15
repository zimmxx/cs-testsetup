import * as THREE from 'three';

export function boundsInRoot(object,root){
 root.updateWorldMatrix(true,true);const result=new THREE.Box3();
 object.traverse(mesh=>{if(!mesh.isMesh||mesh.userData.presentationOverlay)return;mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox;
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])result.expandByPoint(root.worldToLocal(mesh.localToWorld(new THREE.Vector3(x,y,z))));
 });return result;
}

export function nanoMaxMountPoint(root){
 const model=root.userData.modelRoot;if(!model)return null;
 const full=boundsInRoot(model,root),candidates=[];
 model.traverse(mesh=>{if(!mesh.isMesh)return;const box=boundsInRoot(mesh,root),size=box.getSize(new THREE.Vector3());
  if(size.x>.25&&size.z>.25&&size.y<.13&&Math.abs(full.max.y-box.max.y)<.015)candidates.push({box,area:size.x*size.z});
 });
 const top=candidates.sort((a,b)=>b.area-a.area)[0];if(!top)return null;
 const point=top.box.getCenter(new THREE.Vector3());point.y=top.box.max.y;return point;
}

export function registerFibreArmMounts(roots,nodes){
 for(const node of nodes){
  if(node.equipmentId!=='wst-fibre-arms-manual')continue;
  const stageId=node.configuration?.mountingStage||node.configuration?.mount?.parentId,stageNode=nodes.find(n=>n.id===stageId);
  if(stageNode?.equipmentId!=='fibre-arm-stage')continue;
  const arm=roots.find(r=>r.userData.nodeId===node.id),stage=roots.find(r=>r.userData.nodeId===stageId),model=arm?.userData.modelRoot;
  if(!model||!stage?.userData.modelRoot||model.userData.registeredStage===stage.userData.modelRoot)continue;
  const base=model.getObjectByName('Alley_Jig_Design_Split_Base'),mount=nanoMaxMountPoint(stage);if(!base||!mount)continue;
  const current={position:arm.position.clone(),quaternion:arm.quaternion.clone()},home=arm.userData.presentationHome;
  if(home){arm.position.copy(home.position);arm.quaternion.copy(home.quaternion);}
  const footBox=boundsInRoot(base,arm),foot=footBox.getCenter(new THREE.Vector3());foot.y=footBox.min.y;
  const destination=arm.worldToLocal(stage.localToWorld(mount.clone())),delta=destination.sub(foot);
  model.position.add(delta);model.userData.registeredStage=stage.userData.modelRoot;
  arm.position.copy(current.position);arm.quaternion.copy(current.quaternion);arm.updateWorldMatrix(true,true);
  arm.userData.mountPresentation={stageId,registration:'CAD base footprint to NanoMax top platform',offset:delta.toArray(),armFoot:foot.clone().add(delta).toArray()};
 }
}

export function sampleKind(equipmentId){
 if(['wst-wafer-holder-manual','wafer-carrier-2'].includes(equipmentId))return 'wafer';
 if(['chip-vacuum-stage','wst-chip-holder-manual'].includes(equipmentId))return 'chip';
 return null;
}

export function addDummySample(root,equipmentId){
 const kind=sampleKind(equipmentId),model=root.userData.modelRoot;if(!kind||!model||root.userData.sampleOverlay)return;
 const box=boundsInRoot(model,root),center=box.getCenter(new THREE.Vector3()),group=new THREE.Group();
 group.name=kind==='wafer'?'Illustrative 8-inch silicon wafer':'Illustrative silicon photonics chip';group.position.set(center.x,box.max.y+.002,center.z);
 group.userData={illustrative:true,sampleKind:kind,diameterMm:kind==='wafer'?203.2:undefined};
 const silicon=new THREE.MeshStandardMaterial({color:kind==='wafer'?'#27364f':'#354968',metalness:.65,roughness:.24});
 if(kind==='wafer'){
  const shape=new THREE.Shape(),radius=1.016;for(let i=0;i<=128;i++){const angle=i/128*Math.PI*2,r=i===96?radius-.025:radius,x=Math.cos(angle)*r,z=Math.sin(angle)*r;if(i===0)shape.moveTo(x,z);else shape.lineTo(x,z);}shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.00725,bevelEnabled:false,steps:1});geometry.rotateX(-Math.PI/2);group.add(new THREE.Mesh(geometry,silicon));
  const lines=[];for(let x=-.9;x<.95;x+=.1)for(let z=-.9;z<.95;z+=.1){if(Math.max(Math.hypot(x,z),Math.hypot(x+.09,z),Math.hypot(x,z+.09),Math.hypot(x+.09,z+.09))>.99)continue;const corners=[[x,z],[x+.09,z],[x+.09,z+.09],[x,z+.09]];for(let i=0;i<4;i++)lines.push(corners[i][0],.008,corners[i][1],corners[(i+1)%4][0],.008,corners[(i+1)%4][1]);}
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lines,3)),new THREE.LineBasicMaterial({color:'#7f91ad',transparent:true,opacity:.6})));
 }else{const chip=new THREE.Mesh(new THREE.BoxGeometry(.1,.00525,.06),silicon);chip.position.y=.00525/2;group.add(chip);}
 const y=kind==='wafer'?.010:.008,route=new THREE.CatmullRomCurve3([new THREE.Vector3(-.025,y,0),new THREE.Vector3(-.01,y,0),new THREE.Vector3(0,y,.012),new THREE.Vector3(.01,y,0),new THREE.Vector3(.025,y,0)]);
 group.add(new THREE.Mesh(new THREE.TubeGeometry(route,24,.0008,5,false),new THREE.MeshStandardMaterial({color:'#e1b65e',metalness:.5,roughness:.4})));
 for(const x of [-.025,.025]){const coupler=new THREE.Mesh(new THREE.BoxGeometry(.008,.001,.012),new THREE.MeshStandardMaterial({color:'#e7c575',metalness:.6,roughness:.3}));coupler.position.set(x,y,0);group.add(coupler);}
 root.add(group);root.userData.sampleOverlay=group;return group;
}
