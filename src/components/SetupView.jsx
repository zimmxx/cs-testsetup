import { lazy, Suspense } from 'react';
import BuildOverview from './BuildOverview.jsx';
import SetupGraph, { nodeName } from './SetupGraph.jsx';
const ModelScene=lazy(()=>import('./ModelScene.jsx'));

export default function SetupView({draft,mode,selected,onSelect,focusRequest,onInspect,...graphProps}) {
  return <>
    {mode==='overview'?<BuildOverview draft={draft} selected={selected} onSelect={onSelect} onInspect={onInspect}/>:mode==='3d'?<><Suspense fallback={<div className="model-stage model-loading">Loading 3D viewer…</div>}><ModelScene nodes={draft.nodes} connections={draft.connections} onSelect={onSelect} focusRequest={focusRequest}/></Suspense><div className="builder-help model-disclosure">Installed modules follow their mainframe housing; arms follow their support stages. Use Explode modules to inspect the insertion. Geometry and slot placement are illustrative.</div></>:<SetupGraph draft={draft} mode={mode} selected={selected} onSelect={onSelect} {...graphProps}/>}
    <div className="builder-canvas-footer"><span><i className="optical-dot"/>Optical path <i className="electrical-dot"/>Electrical path</span><span>{mode==='3d'?'Drag to orbit · scroll to zoom':mode==='overview'?'Select equipment to inspect':'Drag cards to arrange · drag right port to left port'}</span></div>
    <div className="builder-node-access" hidden={mode==='overview'}>{draft.nodes.map(n=><button className={selected===n.id?'active':''} key={n.id} onClick={()=>onSelect(n.id)}>{nodeName(n)}</button>)}</div>
    {draft.connections.length>0&&<details className="connection-shortcuts"><summary>Inspect connections ({draft.connections.length})</summary><div className="builder-node-access">{draft.connections.map(c=><button key={c.id} className={graphProps.edgeId===c.id?'active':''} onClick={()=>graphProps.onSelectEdge?.(c.id)}>{c.type==='optical'?'Optical':'Electrical'} · {nodeName(draft.nodes.find(n=>n.id===c.from))} → {nodeName(draft.nodes.find(n=>n.id===c.to))}</button>)}</div></details>}
  </>;
}
