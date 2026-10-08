import { useState } from 'react';
import { getEquipment } from '../data/catalog.js';
import { isMainframe, installedModule, frameProfile, acceptsModule } from '../lib/mainframeAssembly.js';

export default function MainframeSlots({draft,onAssign,onDrop,onSelect,onFocus,readOnly=false}){
  const [hover,setHover]=useState('');
  const frames=draft.nodes.filter(isMainframe);
  if(!frames.length)return null;
  return <section className="mainframe-installation" aria-label="Mainframe module installation">
    <div className="mainframe-heading"><strong>Mainframe slots</strong><span>{readOnly?'Published module installation · select a module to inspect.':'Drag a compatible module from the equipment library into a slot, or choose an existing instance.'}</span></div>
    {frames.map(frame=>{const profile=frameProfile(frame),oband=profile.model==='8164B';return <div className="mainframe-unit" key={frame.id}>
      <div className={`mainframe-front ${oband?'mainframe-8164b':''}`}><div className="mainframe-display"><small>KEYSIGHT · {profile.model}</small><strong>Lightwave<br/>{oband?'measurement system':'multimeter'}</strong><span>{oband?'O-band laser + detector':'Laser + power sensor'}</span><button onClick={()=>onFocus(frame.id)}>Inspect assembly in 3D</button></div>
      {profile.slots.map(slot=>{const module=installedModule(draft.nodes,frame.id,slot),key=`${frame.id}-${slot}`,choices=draft.nodes.filter(n=>acceptsModule(frame,slot,n));return <div className={`module-bay ${slot==='0'?'module-bay-horizontal':''} ${module?'occupied':''} ${hover===key?'drop-ready':''}`} key={slot} data-mainframe-id={frame.id} data-slot={slot} onDragOver={e=>{if(readOnly)return;e.preventDefault();e.dataTransfer.dropEffect=e.dataTransfer.types.includes('application/cs-module-instance')?'move':'copy';setHover(key);}} onDragLeave={()=>setHover('')} onDrop={e=>{if(readOnly)return;e.preventDefault();setHover('');onDrop(frame.id,slot,e.dataTransfer);}}>
        <span className="module-slot-number">Slot {slot}{slot==='0'?' · horizontal TLS bay':''}</span>
        {module?<button className="module-faceplate" draggable={!readOnly} onDragStart={e=>{e.dataTransfer.setData('application/cs-module-instance',module.id);e.dataTransfer.effectAllowed='move';}} onClick={()=>onSelect(module.id)} aria-label={`Inspect Slot ${slot} ${getEquipment(module.equipmentId).model}`}><strong>{getEquipment(module.equipmentId).model.replace('Keysight ','')}</strong><span>{/laser/.test(module.equipmentId)?'Tunable laser':module.equipmentId==='oband-head-interface'?'Single-head interface':'Power sensor'}</span><i className={module.equipmentId==='oband-head-interface'?'module-head-port':'module-optical-port'}/><small>{module.label||module.id}</small></button>:<div className="module-empty">Empty slot<br/><small>{slot==='0'?'81606A TLS':readOnly?'Unoccupied':'Drop module here'}</small></div>}
        {!readOnly&&<label><span className="sr-only">{frame.label||frame.id} Slot {slot} module</span><select aria-label={`${frame.id} Slot ${slot} module`} value={module?.id||''} onChange={e=>onAssign(frame.id,slot,e.target.value)}><option value="">Empty / unmount</option>{choices.map(n=><option value={n.id} key={n.id}>{n.label||getEquipment(n.equipmentId).model} · {n.id}</option>)}</select></label>}
      </div>;})}</div>
      <p>{frame.label||`${profile.model} mainframe`} · {oband?'Slot 0 hosts the back-loadable TLS. Slot 3 links to the external 81624B through the confirmed 81618A single-head interface.':'Slot numbers are editable defaults; verify the installed order.'} {readOnly?'Installation is managed in Build setup.':'Moving between compatible occupied slots swaps the modules. Signal paths stay with each module.'}</p>
    </div>;})}
  </section>;
}
