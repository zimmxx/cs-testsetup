// Suggested presentation layout, not a measured installation or mounting design.
// x/y remain shared across overview, illustration and 3D; bench heights are mm.
const positions={
  mainframe:[50,50,0,0,-600,-200],laser:[300,50,0,0,-580,160],sensor:[800,50,0,0,600,-200],
  controller:[550,50,0,0,-250,-200],'sleeve-in':[50,185,0,0,-500,40],'sleeve-arm':[300,185,0,0,-260,40],
  'input-arm':[50,320,63,0,-170,120],dut:[300,320,65,0,0,120],'output-arm':[550,320,63,180,170,120],
  'input-fibre-stage':[50,455,0,90,-170,120],'output-fibre-stage':[550,455,0,-90,170,120],
  stage:[300,455,0,0,0,120],camera:[800,455,0,0,0,-100],'sleeve-out':[800,320,0,0,450,40],
};
export function arrangeOnBench(setup){
  return {...setup,benchLayout:'suggested-manual-v1',nodes:setup.nodes.map(n=>positions[n.id]?{...n,x:positions[n.id][0],y:positions[n.id][1],elevationMm:positions[n.id][2],rotationDeg:positions[n.id][3],benchXMm:positions[n.id][4],benchZMm:positions[n.id][5]}:n)};
}
export function addBenchDefaults(setup){
  if(setup.id!=='wst-optical-manual'||setup.benchRevision>=1)return setup;
  return {...setup,benchRevision:1,benchLayout:setup.benchLayout||'suggested-manual-v1',nodes:setup.nodes.map(n=>positions[n.id]?{...n,benchXMm:n.benchXMm??positions[n.id][4],benchZMm:n.benchZMm??positions[n.id][5],elevationMm:n.elevationMm??positions[n.id][2],rotationDeg:n.rotationDeg??positions[n.id][3]}:n)};
}
// Mechanical supports share a mounting location in 3D while keeping their cards
// separately reachable in the schematic editor.
export function benchPosition(node,nodes){
  const support=nodes.find(n=>n.id===node.configuration?.mountingStage);
  const source=support||node;
  return {x:Number.isFinite(source.benchXMm)?source.benchXMm/100:(source.x-440)/55,z:Number.isFinite(source.benchZMm)?source.benchZMm/100:(source.y-255)/65,y:(node.elevationMm||0)/100};
}
