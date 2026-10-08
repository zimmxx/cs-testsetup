import { useState } from 'react';
import { getEquipment } from '../data/catalog.js';
import { Inspector } from './SetupCanvas.jsx';
import { EquipmentDetail } from './Equipment.jsx';
import Modal from './Modal.jsx';
import { localPath } from './UI.jsx';

function Instrument({item}) {
  if(item.image) return <image href={localPath(item.image)} x="-52" y="-42" width="105" height="82"/>;
  if(/stage|wafer|position/i.test(item.id+' '+item.category)) return <g><ellipse cy="28" rx="61" ry="20" fill="#9aa3bb"/><rect x="-42" y="-12" width="84" height="38" rx="4" fill="#b7bfd1"/><path d="M-42 -12l18 -13h84l-18 13" fill="#d3daea"/><rect x="-17" y="-30" width="35" height="23" rx="2" fill="#64578c"/><path d="M-12 -25h25M-12 -20h25M-12 -15h25" stroke="#baabda"/></g>;
  if(/polarisation/i.test(item.id)) return <g><rect x="-48" y="11" width="96" height="19" rx="4" fill="#434862"/>{[-28,0,28].map(x=><g key={x}><rect x={x-3} y="-10" width="6" height="26" fill="#8d93aa"/><ellipse cx={x} cy="-8" rx="15" ry="24" fill="none" stroke="#737b95" strokeWidth="7"/></g>)}</g>;
  if(/fibre/i.test(item.category)) return <g><path d="M-45 25v-40l45 -20M45 25v-40l-45 -20" fill="none" stroke="#949db3" strokeWidth="9"/><rect x="-58" y="20" width="38" height="14" rx="3" fill="#656f8a"/><rect x="20" y="20" width="38" height="14" rx="3" fill="#656f8a"/><path d="M-47 -15C-72 -50 67 -55 47 -15" fill="none" stroke="#d8b747" strokeWidth="3"/></g>;
  return <g><path d="M-56 -29l18 -13h112l-18 13" fill="#d4dbea"/><path d="M56 -29l18 -13v65l-18 13" fill="#9da7bc"/><rect x="-56" y="-29" width="112" height="65" rx="5" fill="#b9c2d5"/><rect x="-46" y="-19" width="69" height="29" rx="3" fill="#303851"/><path d="M-39 -5h13l7 -7 9 13 7 -6h18" fill="none" stroke="#b6a8f4" strokeWidth="2"/><circle cx="40" cy="-4" r="7" fill="#858ea7"/>{[-34,-15,5,37].map(x=><circle key={x} cx={x} cy="23" r="4" fill="#68768e"/>)}</g>;
}
export default function BuildOverview({draft,selected,onSelect,onInspect}) {
  const [inspected,setInspected]=useState(null);
  const selectedNode=draft.nodes.find(n=>n.id===selected);
  const positions=new Map(draft.nodes.map(n=>[n.id,{x:82+n.x*.88,y:160+n.y*.78}]));
  return <div className="canvas-section build-overview"><div className="canvas-toolbar"><span>Interactive setup overview · select equipment to inspect</span></div><div className="native-schematic"><svg viewBox="0 0 1000 690" aria-label={`${draft.name} interactive setup overview`}><defs><pattern id="overview-bench-grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="1.4" fill="#aeb8cc"/></pattern></defs><rect width="1000" height="690" fill="#f6f7fc"/><path d="M30 102h940v488l-24 25H30Z" fill="#c6cedf"/><rect x="30" y="102" width="940" height="488" rx="12" fill="#e5e9f2"/><rect x="30" y="102" width="940" height="488" rx="12" fill="url(#overview-bench-grid)"/>
    {draft.connections.map(c=>{const a=positions.get(c.from),b=positions.get(c.to);if(!a||!b)return null;return <path key={c.id} d={`M${a.x+45} ${a.y+25} C${a.x+95} ${a.y+75},${b.x-95} ${b.y+75},${b.x-45} ${b.y+25}`} stroke={c.type==='optical'?'#d4b342':'#8a75bd'} strokeWidth="4" strokeDasharray={c.type==='electrical'?'8 5':undefined} fill="none"/>;})}
    {draft.nodes.map((n,i)=>{const item=getEquipment(n.equipmentId),p=positions.get(n.id);return <g key={n.id} transform={`translate(${p.x} ${p.y})`} role="button" tabIndex={0} aria-label={`Inspect overview ${n.label||item.name}`} aria-pressed={selected===n.id} className={`overview-instrument ${selected===n.id?'selected':''}`} onClick={()=>onSelect(n.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(n.id);}}}><rect className="overview-focus" x="-67" y="-61" width="151" height="135" rx="12"/><Instrument item={item}/><circle cx="-50" cy="-48" r="13" fill={selected===n.id?'#6658d9':'#fff'} stroke="#998ccf"/><text x="-50" y="-44" textAnchor="middle" fill={selected===n.id?'white':'#6658d9'} fontSize="11">{i+1}</text><text className="overview-label" y="60" textAnchor="middle">{(n.label||item.name).slice(0,27)}</text></g>;})}
    {!draft.nodes.length&&<g><text x="500" y="330" textAnchor="middle" fill="#787e98" fontSize="21">Add equipment to build your overview</text><text x="500" y="363" textAnchor="middle" fill="#959bb0" fontSize="13">The overview follows your equipment layout and connections.</text></g>}
    <text x="500" y="651" textAnchor="middle" className="schematic-sub">Illustrative bench · positions follow this setup · not to scale</text></svg></div>
    <div className="component-shortcuts">{draft.nodes.map(n=><button key={n.id} className={selected===n.id?'selected':''} aria-pressed={selected===n.id} onClick={()=>onSelect(n.id)}>{n.label||getEquipment(n.equipmentId).name}</button>)}</div>
    {selectedNode?<Inspector id={selectedNode.equipmentId} onInspect={onInspect||setInspected}/>:<div className="canvas-caption">Select a numbered equipment marker to show its role and key specification.</div>}
    {inspected&&<Modal title="Equipment details" onClose={()=>setInspected(null)} wide><EquipmentDetail item={getEquipment(inspected)}/></Modal>}
  </div>;
}
