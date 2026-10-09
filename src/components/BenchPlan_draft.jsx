import { useRef } from 'react';
import { getEquipment } from '../data/catalog.js';
import { benchCoordinates, benchPatch } from '../lib/workspace_draft.js';
import { housingFor } from '../lib/mainframeAssembly.js';

export default function BenchPlan_draft({draft,selected,onSelect,onMove,onMoveStart,snap}){
  const svg=useRef(null),drag=useRef(null);
  const nodes=draft.nodes.filter(n=>!housingFor(n,draft.nodes)&&!n.configuration?.mountingStage&&!n.configuration?.mount);
  function point(e){const p=svg.current.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.current.getScreenCTM().inverse());}
  function start(e,n){onSelect(n.id);if(n.locked)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);const p=point(e),b=benchCoordinates(n,draft);drag.current={id:n.id,dx:p.x-(b.x+900)/2,dy:p.y-(b.z+450)/2,started:false};}
  function move(e){const g=drag.current;if(!g)return;const n=draft.nodes.find(n=>n.id===g.id),p=point(e);if(!g.started){onMoveStart();g.started=true;}const patch=benchPatch(n,draft,(p.x-g.dx)*2-900,(p.y-g.dy)*2-450,snap);if(patch)onMove(n.id,patch);}
  return <div className="draft-bench-plan"><svg ref={svg} viewBox="-42 -42 984 548" aria-label="Top-down bench placement in millimetres" onPointerMove={move} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
    <defs><pattern id="draft-bench-holes" width="12.5" height="12.5" patternUnits="userSpaceOnUse"><circle cx="6.25" cy="6.25" r=".9" fill="#bcc5d7"/></pattern></defs><rect width="900" height="450" rx="8" fill="#eef1f8" stroke="#cad1df"/><rect width="900" height="450" rx="8" fill="url(#draft-bench-holes)"/><path d="M450 0v450M0 225h900" stroke="#abb6cd" strokeDasharray="5 5"/>
    {[-900,-600,-300,0,300,600,900].map(x=><g key={x}><text x={(x+900)/2} y="-17" textAnchor="middle">{x} mm</text><path d={`M${(x+900)/2} -8v8`} stroke="#a9b4cb"/></g>)}
    {[-450,-225,0,225,450].map(z=><text key={z} x="-13" y={(z+450)/2+4} textAnchor="end">{z}</text>)}
    {nodes.map(n=>{const b=benchCoordinates(n,draft),item=getEquipment(n.equipmentId);return <g key={n.id} transform={`translate(${(b.x+900)/2} ${(b.z+450)/2})`} className={`draft-bench-item ${selected===n.id?'selected':''}`} role="button" tabIndex={0} aria-label={`Position ${n.label||item.name}`} onPointerDown={e=>start(e,n)} onClick={()=>onSelect(n.id)} onKeyDown={e=>{if(e.key==='Enter'){onSelect(n.id);}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const patch=benchPatch(n,draft,b.x+(e.key==='ArrowRight'?25:e.key==='ArrowLeft'?-25:0),b.z+(e.key==='ArrowDown'?25:e.key==='ArrowUp'?-25:0),snap);if(patch){onMoveStart();onMove(n.id,patch);}}}}><rect x="-53" y="-25" width="106" height="50" rx="8"/><circle r="4" fill="#7562d6"/><path d="M0 0v-16l-4 5m4-5l4 5" stroke="#7d70a4" fill="none" transform={`rotate(${n.rotationDeg||0})`}/><text y="17" textAnchor="middle">{(n.label||item.name).slice(0,18)}{n.locked?' 🔒':''}</text></g>;})}
    <text x="450" y="480" textAnchor="middle">Suggested 1800 × 900 mm bench · 25 mm grid · equipment markers are not footprints</text>
  </svg><p>Drag a marker or use arrow keys. Mounted modules and fibre arms follow their parent housing or stage. This plan changes 3D placement; diagram cards have separate positions.</p></div>;
}
