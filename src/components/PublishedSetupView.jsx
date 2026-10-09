import { useMemo, useState } from 'react';
import { getEquipment } from '../data/catalog.js';
import { connectionProblem, connectionRecord } from '../lib/setupBuilder.js';
import { nodeName } from './SetupGraph.jsx';
import SetupView from './SetupView.jsx';
import MainframeSlots from './MainframeSlots.jsx';
import { Inspector } from './SetupCanvas.jsx';
import { manualGroups } from '../data/manualSetup.js';
import PhotoSetupEvidence from './PhotoSetupEvidence.jsx';

export function catalogLayout(setup){return setup.published||setup.template||{version:1,id:setup.id,name:setup.name,nodes:setup.equipment.map((id,i)=>({id:`catalog-${i}`,equipmentId:id,label:'',x:30+(i%4)*235,y:35+Math.floor(i/4)*145})),connections:[]};}
export default function PublishedSetupView({setup,mode,onMode,onInspect}){
  const original=useMemo(()=>catalogLayout(setup),[setup]);
  const [draft,setDraft]=useState(()=>structuredClone(original)),[selected,setSelected]=useState(null),[edgeId,setEdgeId]=useState(null),[pathType,setPathType]=useState('optical'),[notice,setNotice]=useState(''),[changed,setChanged]=useState(false),[focus,setFocus]=useState(null),[resetKey,setResetKey]=useState(0);
  const node=draft.nodes.find(n=>n.id===selected),edge=draft.connections.find(c=>c.id===edgeId);
  function select(id){setSelected(id);setEdgeId(null);}
  function connect(from,to,type){const error=connectionProblem(draft,from,to,type);if(error){setNotice(error);return;}const c=connectionRecord(draft,from,to,type);setDraft(d=>({...d,connections:[...d.connections,c]}));setEdgeId(c.id);setSelected(null);setChanged(true);setNotice('Preview connection added. The published setup is unchanged.');}
  function reset(){setDraft(structuredClone(original));setChanged(false);setSelected(null);setEdgeId(null);setNotice('Published layout restored.');setResetKey(k=>k+1);}
  return <div className="published-setup-view">
    <div className="published-view-note"><span>{setup.published?`Published layout · ${new Date(setup.publishedAt).toLocaleDateString()}`:'Catalog preview · layout and connections have not been published yet.'}{changed?' · temporary view changes':''}</span><button className="text-button" onClick={reset}>Reset view</button></div>
    {mode==='signal'&&<div className="connection-tools"><label>Preview path<select aria-label="Preview connection type" value={pathType} onChange={e=>setPathType(e.target.value)}><option value="optical">Optical fibre</option><option value="electrical">Electrical cable</option></select></label><p>Drag cards or connect ports to explore. Changes stay in this view; use Build setup to edit and publish.</p></div>}
    {notice&&<div className="builder-notice" role="status">{notice}</div>}
    {!setup.published&&<div className="builder-help model-disclosure">{setup.template?'Photo-derived draft preview. Routes are proposed and require review; this setup has not been published.':'Equipment is arranged as a catalog preview. No signal connections are assumed.'} Publish the actual setup from Build setup to replace this preview.</div>}
    <PhotoSetupEvidence evidence={draft.photoEvidence}/>
    {draft.nodes.some(n=>['wst-mainframe-manual','oband-mainframe-8164b'].includes(n.equipmentId))&&<details className="published-mainframes"><summary>Mainframe installation · inspect slots</summary><MainframeSlots draft={draft} readOnly onSelect={select} onFocus={id=>{setFocus({id});onMode('3d');select(id);}}/></details>}
    <SetupView key={resetKey} draft={draft} mode={mode} selected={selected} edgeId={edgeId} onSelect={select} onSelectEdge={id=>{setEdgeId(id);setSelected(null);}} onMove={(id,pos)=>{setDraft(d=>({...d,nodes:d.nodes.map(n=>n.id===id?{...n,...pos}:n)}));setChanged(true);}} onConnect={connect} pathType={pathType} focusRequest={focus} onInspect={onInspect}/>
    {node&&mode!=='overview'&&<Inspector id={node.equipmentId} onInspect={onInspect}/>}
    {node&&node.configuration&&<details className="published-instance"><summary>Installed instance · {nodeName(node)}</summary><dl className="spec-list">{Object.entries(node.configuration).filter(([,value])=>value!==''&&value!==undefined).map(([label,value])=><div key={label}><dt>{label.replace(/([A-Z])/g,' $1')}</dt><dd>{String(value)}</dd></div>)}</dl></details>}
    {edge&&<section className="published-connection" aria-label="Connection details"><h3>{edge.type==='optical'?'Optical':'Electrical'} connection</h3><p>{nodeName(draft.nodes.find(n=>n.id===edge.from))} → {nodeName(draft.nodes.find(n=>n.id===edge.to))}</p><dl className="spec-list">{[['Source port',edge.fromPort],['Destination port',edge.toPort],...(edge.type==='optical'?[['Fibre model',edge.customFibre||edge.fibre],['Source connector',edge.fromConnector],['Destination connector',edge.toConnector],['Length',edge.length]]:[]),['Notes',edge.notes]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'Not recorded'}</dd></div>)}</dl><div className="published-endpoints">{[edge.from,edge.to].map(id=>{const n=draft.nodes.find(n=>n.id===id);return <button key={id} className="button secondary" onClick={()=>onInspect(n.equipmentId)}>View equipment · {nodeName(n)}</button>;})}</div></section>}
    {original.measurement&&<details className="published-instance"><summary>Published measurement settings</summary><p className="builder-help">Recorded settings and unconfirmed values. Edit them in Build setup and publish an updated version.</p>{manualGroups.map(group=><div key={group.title}><h4>{group.title}</h4><dl className="spec-list">{group.fields.map(([key,label,,unit])=><div key={key}><dt>{label}{typeof unit==='string'?` (${unit})`:''}</dt><dd>{original.measurement[key]!==''&&original.measurement[key]!==undefined?String(original.measurement[key]):'Not recorded'}</dd></div>)}</dl></div>)}</details>}
  </div>;
}
