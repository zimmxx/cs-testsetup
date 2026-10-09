import { mountCandidates, mountParentId } from '../lib/componentMounts.js';
import { benchCoordinates } from '../lib/workspace_draft.js';
import { housingFor } from '../lib/mainframeAssembly.js';
import './placement.css';

export default function PlacementEditor({node,setup,editing=true,onPatch,onMount}){
  const module=housingFor(node,setup.nodes),mount=node.configuration?.mount,parentId=mountParentId(node),parent=setup.nodes.find(n=>n.id===parentId),disabled=!editing||node.locked;
  const field=(key,label,value,patch)=> <label key={key}>{label}<input aria-label={label} type="number" step="any" min="-5000" max="5000" disabled={disabled} value={Math.round((value??0)*1000)/1000} onChange={e=>{if(e.target.value==='')return;const n=Number(e.target.value);if(Number.isFinite(n)&&Math.abs(n)<=5000)onPatch(patch?patch(n):{[key]:n});}}/></label>;
  const turn=(key,delta)=>onPatch({[key]:(((node[key]||0)+delta+180)%360+360)%360-180});
  return <div className="placement-editor">
    {module?<p>Installed in {module.label||module.id}, Slot {node.configuration.mainframeSlot}. Rotate or tilt the housing to move its modules together.</p>:<>
      <span className="placement-caption">{mount?'Offsets in the parent’s local axes':'Position on the bench · mm'}</span>
      <div className="placement-grid">{mount?['X','Y','Z'].map(axis=>field(`offset${axis}Mm`,`Mount ${axis} offset (mm)`,mount[`offset${axis}Mm`],value=>({configuration:{...node.configuration,mount:{...mount,[`offset${axis}Mm`]:value}}}))):<>
        {!parentId&&field('benchXMm','Bench X (mm)',node.benchXMm??benchCoordinates(node,setup).x)}
        {!parentId&&field('benchZMm','Bench depth (mm)',node.benchZMm??benchCoordinates(node,setup).z)}
        {field('elevationMm','Height (mm)',node.elevationMm)}
      </>}</div>
      <span className="placement-caption">Orientation · {mount?'relative to parent':'bench axes'}</span>
      <div className="placement-angles">{[['rotationDeg','Yaw Y (°)'],['tiltDeg','Tilt X (°)'],['rollDeg','Roll Z (°)']].map(([key,label])=><div key={key}>{field(key,label,node[key])}<button type="button" className="button secondary" disabled={disabled} aria-label={`Decrease ${label} by 15 degrees`} onClick={()=>turn(key,-15)}>−15°</button><button type="button" className="button secondary" disabled={disabled} aria-label={`Increase ${label} by 15 degrees`} onClick={()=>turn(key,15)}>+15°</button></div>)}</div>
      <div className="placement-actions"><button type="button" className="button secondary" disabled={disabled} onClick={()=>turn('rotationDeg',-90)}>↶ 90°</button><button type="button" className="button secondary" disabled={disabled} onClick={()=>turn('rotationDeg',90)}>↷ 90°</button><button type="button" className="button secondary" disabled={disabled} onClick={()=>turn('rotationDeg',180)}>Face opposite · 180°</button></div>
      <label>Mount to component<select aria-label="Mount to component" disabled={disabled} value={parentId||''} onChange={e=>onMount(e.target.value)}><option value="">Independent on bench</option>{mountCandidates(node,setup.nodes).map(p=><option key={p.id} value={p.id}>{p.label||p.id}</option>)}</select></label>
      {parent&&<p>Mounted to <strong>{parent.label||parent.id}</strong>. Translation follows this parent.{mount?' Angles and offsets follow its rotation and tilt.':' Convert to a rigid mount to enable local offsets and tilt.'}</p>}
      {parentId&&!mount&&<button type="button" className="button secondary" disabled={disabled} onClick={()=>onMount(parentId)}>Use rigid mount · keep position</button>}
      {mount&&<button type="button" className="button secondary" disabled={disabled} onClick={()=>onPatch({configuration:{...node.configuration,mount:{...mount,offsetXMm:0,offsetYMm:0,offsetZMm:0}}})}>Align mounting origins</button>}
      <p className="placement-help">Attach and detach keep the current pose. Origins are bottom-centre of each preview. This rigid placement is a visual mounting aid; face/concentric mates and mechanical fit are checked in SolidWorks. Undo restores any edit.</p>
      {node.locked&&editing&&<button type="button" className="button secondary" onClick={()=>onPatch({locked:false})}>Unlock placement</button>}
    </>}
  </div>;
}
