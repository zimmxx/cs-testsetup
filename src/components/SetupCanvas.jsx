import { useState } from 'react';
import { Cpu, Image, Network, ArrowRight, Camera, Zap, CircleDot, Radio } from 'lucide-react';
import { getEquipment, photoSources } from '../data/catalog.js';
import { asset } from './UI.jsx';

const opticalPoints = [
  { id: 'laser', label: 'Laser source', x: 13, y: 18 },
  { id: 'polarisation', label: 'Polarisation controller', x: 33, y: 29 },
  { id: 'stage', label: 'Photonic chip (DUT)', x: 53, y: 24 },
  { id: 'fibre', label: 'Fibre arms', x: 66, y: 44 },
  { id: 'detector', label: 'Optical detector', x: 86, y: 14 },
];
export function Inspector({ id, onInspect }) {
  const item = getEquipment(id);
  if (!item) return null;
  return <div className="inspector" aria-live="polite"><div className="equipment-symbol"><Cpu size={26}/></div><div className="inspector-name"><h3>{item.name}</h3><p>{item.model}</p></div><div className="inspector-spec"><span>Key specification</span><strong>{item.specs[0]?.[1]||'Not recorded'}</strong></div><div className="inspector-role"><span>Role</span><p>{item.role}</p></div><button className="button secondary" onClick={()=>onInspect(item.id)}>View equipment<ArrowRight size={15}/></button></div>;
}

function Block({ x, y, title, sub, variant = '' }) {
  return <g transform={`translate(${x} ${y})`}><rect className={`schematic-box ${variant}`} width="154" height="92" rx="10"/><rect x="13" y="15" width="128" height="37" rx="5" fill="#242448"/><path d="M27 36h12l9-12 10 24 10-17 10 5h37" stroke="#b3a9ff" strokeWidth="2" fill="none"/><text x="77" y="71" textAnchor="middle" className="schematic-label">{title}</text><text x="77" y="112" textAnchor="middle" className="schematic-sub">{sub}</text></g>;
}

function Schematic({ setup, selected, onSelect }) {
  const electrical = setup.kind === 'electrical';
  const wafer = setup.kind === 'wafer' || setup.scale === 'Wafer';
  const nodes = electrical ? [
    ['electrical', 'Drive & readout', 16, 29], [wafer ? 'wafer' : 'stage', wafer ? 'Wafer / probes' : 'Chip / probes', 51, 26], ['camera', 'Alignment camera', 81, 29],
  ] : [
    [setup.equipment.includes('laser')?'laser':'band-source', 'Optical source', 15, 25], ['polarisation', 'Polarisation', 34, 44], [wafer?'wafer':'stage', wafer?'Wafer platform':'Chip stage', 53, 24], ['fibre', 'Fibre coupling', 68, 45], [setup.equipment.includes('detector')?'detector':'band-detector', 'Optical detector', 87, 25],
  ].filter(([id])=>setup.equipment.includes(id));
  return <div className="native-schematic"><svg viewBox="0 0 900 350" role="img" aria-label={`${setup.name}, illustrative equipment layout. Use the component buttons to inspect.`}><defs><pattern id="bench-grid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1.7" fill="#bcc1d1"/></pattern></defs><rect x="28" y="180" width="844" height="118" rx="14" fill="#e5e8f0"/><rect x="28" y="180" width="844" height="118" rx="14" fill="url(#bench-grid)"/><path d="M40 290h817v18H40z" fill="#b9bfd0"/><Block x={50} y={107} title={electrical?'Electrical drive':'Optical source'} sub={electrical?'Bias / current':'Band-specific configuration'}/><Block x={700} y={107} title={electrical?'Camera display':'Power readout'} sub={electrical?'Visual alignment':'Synchronised acquisition'}/>{wafer ? <g><ellipse cx="450" cy="223" rx="136" ry="48" fill="#979eb8"/><ellipse cx="450" cy="216" rx="125" ry="43" fill="#514878" stroke="#8072b6" strokeWidth="3"/><path d="M340 206h220M337 222h226M390 178v73M420 175v82M450 174v84M480 176v79M510 181v69" stroke="#a99ec3" strokeWidth="1"/></g> : <g><rect x="379" y="202" width="142" height="51" rx="6" fill="#9fa7bf"/><rect x="400" y="180" width="100" height="42" rx="4" fill="#dadfeb"/><rect x="431" y="166" width="43" height="32" rx="2" fill="#5b508a"/><path d="M437 173h31M437 181h31M437 189h31" stroke="#c9b8f2"/></g>}<path d={electrical?'M203 158C274 158 292 211 404 211M203 187C293 187 293 225 425 218':'M198 195C281 306 325 181 430 192M474 192C568 177 611 293 721 191'} fill="none" stroke={electrical?'#bf6a70':'#dac052'} strokeWidth="4"/><path d="M348 121v48l80 23M552 121v48l-79 23" stroke="#8c94ad" strokeWidth="8" fill="none"/><rect x="345" y="118" width="21" height="43" rx="4" fill="#b3b9ca"/><rect x="534" y="118" width="21" height="43" rx="4" fill="#b3b9ca"/>{!electrical && <g><rect x="255" y="196" width="73" height="24" rx="3" fill="#34364c"/>{[267,290,312].map(x=><circle key={x} cx={x} cy="195" r="8" fill="#74778a"/>)}</g>}<text x="450" y="327" textAnchor="middle" className="schematic-sub">{wafer?'Wafer-level arrangement':'Chip-level arrangement'} · schematic, not to scale</text></svg>{nodes.map(([id,label,x,y],i)=><button key={id} className={`hotspot ${selected===id?'active':''}`} style={{left:`${x}%`,top:`${y}%`}} aria-label={`Inspect ${label}`} aria-pressed={selected===id} onClick={()=>onSelect(id)}><span>{i+1}</span><strong>{label}</strong></button>)}</div>;
}

export default function SetupCanvas({ setup, selected, onSelect, onInspect }) {
  const [view, setView] = useState('interactive');
  const [photo, setPhoto] = useState(0);
  const illustrated = setup.id === 'chip-optical-c' || setup.id === 'chip-array';
  const points = opticalPoints.filter(p=>setup.equipment.includes(p.id));
  return <div className="canvas-section"><div className="canvas-toolbar"><span><CircleDot size={14}/>Select a component to explore</span><div className="segmented"><button className={view==='interactive'?'active':''} onClick={()=>setView('interactive')}><Network size={14}/>Interactive</button><button className={view==='photos'?'active':''} onClick={()=>setView('photos')} disabled={!setup.photos.length}><Image size={14}/>Lab photos</button></div></div>{view==='photos' && setup.photos.length ? <div className="photo-view"><img src={asset(setup.photos[photo] || setup.photos[0])} alt={`${setup.name} reference from ${setup.photoSource ? "user-supplied bench photos" : "the supplied testing presentation"}`}/><div className="photo-caption">{setup.photoSource || `Presentation reference · slide ${photoSources[setup.photos[photo] || setup.photos[0]] || 'reference'}`} · photos do not establish current availability</div>{setup.photos.length>1 && <div className="photo-thumbnails">{setup.photos.map((p,i)=><button key={p} aria-label={`Show reference photo ${i+1}`} aria-pressed={photo===i} onClick={()=>setPhoto(i)}><img src={asset(p)} alt=""/></button>)}</div>}</div> : <>{illustrated ? <div className="bench-canvas"><img className="bench-image" src={asset('optical-bench-v2.png')} alt="Illustrative optical bench with laser, polarisation controller, chip mounting assembly, fibre arms and power detector"/>{points.map((p,i)=><button key={p.id} className={`hotspot ${selected===p.id?'active':''}`} style={{left:`${p.x}%`,top:`${p.y}%`}} aria-label={`Inspect ${p.label}`} aria-pressed={selected===p.id} onClick={()=>onSelect(p.id)}><span>{i+1}</span><strong>{p.label}</strong></button>)}</div> : <Schematic setup={setup} selected={selected} onSelect={onSelect}/>}<div className="canvas-caption">Illustrative equipment layout · Use Signal path for the connection sequence.</div><div className="component-shortcuts">{setup.equipment.map(id=><button key={id} className={selected===id?'selected':''} aria-pressed={selected===id} onClick={()=>onSelect(id)}>{getEquipment(id).name}</button>)}</div><Inspector id={selected} onInspect={onInspect}/></>}</div>;
}
