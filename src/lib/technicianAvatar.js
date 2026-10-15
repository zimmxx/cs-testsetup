import * as THREE from 'three';

const up=new THREE.Vector3(0,1,0);
export function disposeAvatar(root){
 root.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();}});
}

// Rotate a bone towards a point while preserving the source rig's twist.
function aim(bone,child,target){
 const origin=bone.getWorldPosition(new THREE.Vector3()),current=child.getWorldPosition(new THREE.Vector3()).sub(origin),desired=target.clone().sub(origin);
 if(current.lengthSq()<1e-12||desired.lengthSq()<1e-12)return;
 const world=bone.getWorldQuaternion(new THREE.Quaternion()),delta=new THREE.Quaternion().setFromUnitVectors(current.normalize(),desired.normalize());
 const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();bone.quaternion.copy(parent.multiply(delta.multiply(world)));bone.updateWorldMatrix(false,true);
}

export function reachArm(upper,lower,hand,target,pole){
 if(!upper||!lower||!hand)return null;
 const shoulder=upper.getWorldPosition(new THREE.Vector3()),elbow=lower.getWorldPosition(new THREE.Vector3()),wrist=hand.getWorldPosition(new THREE.Vector3());
 const a=shoulder.distanceTo(elbow),b=elbow.distanceTo(wrist);if(a<1e-6||b<1e-6)return null;
 // Keep a small elbow bend at full reach, away from the straight-arm singularity.
 const delta=target.clone().sub(shoulder),distance=THREE.MathUtils.clamp(delta.length(),Math.abs(a-b)+1e-4,(a+b)*.97),direction=delta.lengthSq()>1e-10?delta.normalize():new THREE.Vector3(0,-1,0);
 const bend=pole.clone().sub(shoulder).addScaledVector(direction,-pole.clone().sub(shoulder).dot(direction));
 if(bend.lengthSq()<1e-10)bend.copy(up).addScaledVector(direction,-up.dot(direction));
 if(bend.lengthSq()<1e-10)bend.set(1,0,0);bend.normalize();
 const along=(a*a-b*b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along));
 const joint=shoulder.clone().addScaledVector(direction,along).addScaledVector(bend,height),end=shoulder.clone().addScaledVector(direction,distance);
 aim(upper,lower,joint);aim(lower,hand,end);return end;
}

export function prepareTechnician(gltf){
 const model=gltf.scene,wrapper=new THREE.Group();wrapper.name='Textured lab technician';wrapper.add(model);
 model.updateMatrixWorld(true);
 // Tailored work jacket and trousers, retaining the anatomical skin/hair textures.
 model.traverse(o=>{if(o.isMesh){o.frustumCulled=false;
  if(/short01|hairline|eyebrow/i.test(o.name))for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.color.set('#111218');m.roughness=.72;}
  if(/male_elegantsuit/.test(o.name)){
   const geometry=o.geometry.clone(),positions=geometry.attributes.position,colors=new Float32Array(positions.count*3),jacket=new THREE.Color('#94b7c4'),trousers=new THREE.Color('#283c50');
   for(let i=0;i<positions.count;i++){const c=positions.getY(i)>.87?jacket:trousers;c.toArray(colors,i*3);}
   geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));o.geometry.dispose();o.geometry=geometry;
   const previous=o.material;o.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.84,side:THREE.DoubleSide});
   for(const m of Array.isArray(previous)?previous:[previous]){Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose();});m.dispose();}
 }}});
 const box=new THREE.Box3().setFromObject(model),height=box.max.y-box.min.y;if(!Number.isFinite(height)||height<=0)throw Error('Invalid technician geometry');
 const scale=11.4/height;wrapper.scale.setScalar(scale);model.position.y=-box.min.y;wrapper.rotation.y=Math.PI;
 const bones=new Map();model.traverse(o=>{if(o.isBone)bones.set(o.name,o);});
 const rest=new Map([...bones].map(([name,b])=>[name,{q:b.quaternion.clone(),p:b.position.clone(),s:b.scale.clone()}]));
 // One pose owner: the source idle clip also animates hands/fingers. Mixing it
 // with per-frame rest resets and IK causes cached track values to fight the pose.
 const previousPose=new Map(),smoothTarget=new THREE.Vector3();let targetInitialized=false;
 // Small, application-authored ID clip. Attached to the chest to follow the pose.
 const chest=bones.get('spine_03');
 if(chest){const badge=new THREE.Group();badge.name='Technician ID badge';const card=new THREE.Mesh(new THREE.BoxGeometry(.065,.09,.004),new THREE.MeshStandardMaterial({color:'#f7fafb',roughness:.7}));badge.add(card);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(.055,.016,.005),new THREE.MeshStandardMaterial({color:'#258880'}));stripe.position.set(0,.027,.003);badge.add(stripe);
  const portrait=new THREE.Mesh(new THREE.BoxGeometry(.018,.025,.005),new THREE.MeshStandardMaterial({color:'#46667c'}));portrait.position.set(-.015,-.005,.003);badge.add(portrait);
  badge.position.set(-.095,1.28,.16);model.add(badge);model.updateMatrixWorld(true);chest.attach(badge);
 }
 let previousTime=null;
 return {root:wrapper,update(time,{target,walking,animate,pitch,displacement}){
   const dt=previousTime===null?1/60:Math.min(.05,Math.max(0,time-previousTime));previousTime=time;
   for(const [name,b] of bones){const r=rest.get(name);b.quaternion.copy(r.q);b.position.copy(r.p);b.scale.copy(r.s);}
   const blend=animate?1-Math.exp(-10*dt):1;
   if(animate)bones.get('spine_02')?.rotateX(Math.sin(time*1.5)*.006);
   if(walking&&animate)for(const [side,phase] of [['l',0],['r',Math.PI]]){bones.get(`thigh_${side}`)?.rotateX(Math.sin(time*5+phase)*.14);bones.get(`calf_${side}`)?.rotateX(Math.max(0,Math.sin(time*5+phase))*.12);}
   if(target){
    if(!targetInitialized){smoothTarget.copy(target);targetInitialized=true;}else smoothTarget.lerp(target,blend);
    wrapper.updateWorldMatrix(true,true);
    const spine=bones.get('spine_01'),chest=bones.get('spine_03');
    if(spine&&chest){const origin=spine.getWorldPosition(new THREE.Vector3()),length=origin.distanceTo(chest.getWorldPosition(new THREE.Vector3())),angle=(walking?0:7)*Math.PI/180;
     const lean=origin.clone().add(new THREE.Vector3(0,Math.cos(angle),-Math.sin(angle)).multiplyScalar(length));aim(spine,chest,lean);}
    bones.get('head')?.rotateX(.03);wrapper.updateWorldMatrix(true,true);
    const shoulder=bones.get('upperarm_r')?.getWorldPosition(new THREE.Vector3());
    if(shoulder){reachArm(bones.get('upperarm_r'),bones.get('lowerarm_r'),bones.get('hand_r'),smoothTarget,shoulder.clone().add(new THREE.Vector3(-1,-.4,1.1)));
     const wrist=bones.get('hand_r');if(wrist)wrist.rotateY(.12*Math.sin(displacement/Math.max(1,pitch)*Math.PI*2));
     // Retain the authored relaxed fingers; arbitrary local-axis curls distort
     // this rig's knuckles and the skinned surface between adjacent fingers.
    }
   }
   for(const [name,b] of bones){const previous=previousPose.get(name),solved=b.quaternion.clone();if(previous)b.quaternion.copy(previous).slerp(solved,blend);previousPose.set(name,b.quaternion.clone());}
   wrapper.updateWorldMatrix(true,true);
  },dispose(){previousPose.clear();}};
}
