// Fit a bounding box along the existing viewing direction, keeping its target.
// The corner depths matter: the near edge of a bench is wider in perspective.
export function fittedCameraPosition(position, target, bounds, aspect, fovDeg=40, padding=1.12) {
  if (!bounds || !Number.isFinite(aspect) || aspect<=0) return [...position];
  const subtract=(a,b)=>a.map((v,i)=>v-b[i]);
  const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>{const length=Math.hypot(...a);return a.map(v=>v/length);};
  const offset=subtract(position,target),back=unit(offset),right=unit(cross([0,1,0],back)),up=cross(back,right);
  const vertical=Math.tan(fovDeg*Math.PI/360)/padding,horizontal=vertical*aspect;
  let distance=Math.hypot(...offset);
  for(const x of [bounds.min[0],bounds.max[0]])for(const y of [bounds.min[1],bounds.max[1]])for(const z of [bounds.min[2],bounds.max[2]]){
    const corner=subtract([x,y,z],target),depth=dot(corner,back);
    distance=Math.max(distance,Math.abs(dot(corner,right))/horizontal+depth,Math.abs(dot(corner,up))/vertical+depth);
  }
  return target.map((v,i)=>v+back[i]*distance);
}
