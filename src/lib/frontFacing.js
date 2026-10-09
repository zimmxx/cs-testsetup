// Generated instrument fronts lie on local -Z. Bench photographs are viewed
// from +Z; yaw 180 points their panels toward that side of the table.
const ids={
  'optical-chip-testing-v1':{'photo-mainframe':'wst-mainframe-manual','photo-laser':'wst-laser-old','photo-sensor':'wst-sensor-old','photo-display':'chip-display-monitor-v1','photo-led':'chip-led-illuminator-v1','photo-illumination-control':'chip-illumination-controller-v1'},
  'wst-optical-manual':{mainframe:'wst-mainframe-manual'},
  'oband-mainframe-assembly':{'oband-mainframe':'oband-mainframe-8164b'},
};
export function upgradeFrontFacing(setup){
  if(!ids[setup?.id]||setup.frontFacingRevision>=1)return setup;
  return {...setup,frontFacingRevision:1,nodes:setup.nodes.map(n=>ids[setup.id][n.id]===n.equipmentId&&!n.configuration?.mount&&!n.configuration?.mainframeId&&!n.tiltDeg&&!n.rollDeg&&!(n.rotationDeg||0)?{...n,rotationDeg:180}:n)};
}
