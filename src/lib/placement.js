// Rigid transforms use millimetres and right-handed Y-up coordinates.
// Euler order YXZ: yaw about Y, tilt about X, roll about Z.
export const identityQuaternion=[0,0,0,1];
export function multiplyQuaternion(a,b){
  const [x,y,z,w]=a,[X,Y,Z,W]=b;
  return [w*X+x*W+y*Z-z*Y,w*Y-x*Z+y*W+z*X,w*Z+x*Y-y*X+z*W,w*W-x*X-y*Y-z*Z];
}
export function nodeQuaternion(node){
  const half=d=>(d||0)*Math.PI/360;
  const x=half(node.tiltDeg),y=half(node.rotationDeg),z=half(node.rollDeg);
  return multiplyQuaternion(multiplyQuaternion([0,Math.sin(y),0,Math.cos(y)],[Math.sin(x),0,0,Math.cos(x)]),[0,0,Math.sin(z),Math.cos(z)]);
}
export function rotateVector(v,q){
  const r=multiplyQuaternion(multiplyQuaternion(q,[...v,0]),[-q[0],-q[1],-q[2],q[3]]);
  return r.slice(0,3);
}
export function quaternionAngles(q){
  const [x,y,z,w]=q,m23=2*(y*z-x*w),m13=2*(x*z+y*w),m33=1-2*(x*x+y*y),m21=2*(x*y+z*w),m22=1-2*(x*x+z*z);
  const tilt=Math.asin(-Math.max(-1,Math.min(1,m23)));
  const yaw=Math.abs(m23)<.9999999?Math.atan2(m13,m33):Math.atan2(-2*(x*z-y*w),1-2*(y*y+z*z));
  const roll=Math.abs(m23)<.9999999?Math.atan2(m21,m22):0;
  const deg=r=>Math.round(r*180/Math.PI*1e8)/1e8;
  return {rotationDeg:deg(yaw),tiltDeg:deg(tilt),rollDeg:deg(roll)};
}
export const inverseQuaternion=q=>[-q[0],-q[1],-q[2],q[3]];
