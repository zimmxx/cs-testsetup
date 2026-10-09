import { equipmentPose, housingFor, validateAssembly } from './mainframeAssembly.js';
import { benchPosition } from './benchLayout.js';
import { rotateVector, inverseQuaternion, multiplyQuaternion, quaternionAngles } from './placement.js';

export const mountParentId=node=>node?.configuration?.mount?.parentId||node?.configuration?.mountingStage||node?.configuration?.mainframeId;
const pose=(node,nodes)=>equipmentPose(node,nodes,benchPosition);
export function mountCandidates(node,nodes){
  return nodes.filter(parent=>{
    if(parent.id===node.id)return false;
    const seen=new Set();let p=parent;
    while(p){if(p.id===node.id||seen.has(p.id))return false;seen.add(p.id);p=nodes.find(n=>n.id===mountParentId(p));}
    return true;
  });
}
// Attach/detach preserve the world pose; offsets and Euler angles become local
// only while a rigid mount is active. Signal connections are never modified.
export function setComponentMount(setup,id,parentId){
  const node=setup.nodes.find(n=>n.id===id);if(!node)throw new Error('Select equipment first.');
  if(node.locked)throw new Error('Unlock this placement before changing its mount.');
  if(housingFor(node,setup.nodes))throw new Error('Use mainframe slots to unmount this module first.');
  const world=pose(node,setup.nodes),configuration={...node.configuration};
  delete configuration.mount;delete configuration.mountingStage;
  let patch;
  if(parentId){
    const parent=mountCandidates(node,setup.nodes).find(n=>n.id===parentId);if(!parent)throw new Error('Choose a parent that does not create a mounting cycle.');
    const origin=pose(parent,setup.nodes),inverse=inverseQuaternion(origin.quaternion),offset=rotateVector([world.x-origin.x,world.y-origin.y,world.z-origin.z],inverse);
    configuration.mount={parentId,offsetXMm:offset[0]*100,offsetYMm:offset[1]*100,offsetZMm:offset[2]*100};
    patch=quaternionAngles(multiplyQuaternion(inverse,world.quaternion));
  }else patch={benchXMm:world.x*100,benchZMm:world.z*100,elevationMm:world.y*100,...quaternionAngles(world.quaternion)};
  const next={...setup,nodes:setup.nodes.map(n=>n.id===id?{...n,...patch,configuration}:n)};
  validateAssembly(next.nodes);return next;
}
