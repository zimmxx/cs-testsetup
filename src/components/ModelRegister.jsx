import { getEquipment } from '../data/catalog.js';
import { localPath } from './UI.jsx';
export default function ModelRegister({nodes}){
  const items=[...new Set(nodes.map(n=>n.equipmentId))].map(getEquipment).filter(Boolean);
  const vendor=items.filter(e=>e.cadKind==='Vendor CAD').length;
  return <details className="panel model-register"><summary><strong>CAD & model review</strong><span>{vendor} vendor models · {items.length-vendor} references / pending</span></summary><p>Every reference can be replaced in Admin. Illustrative shapes support setup planning; dimensions, mounts and cable routing need local verification.</p><div className="table-scroll"><table><thead><tr><th>Equipment</th><th>Model basis</th><th>Review / source</th><th>Local CAD</th></tr></thead><tbody>{items.map(e=><tr key={e.id}><td><strong>{e.name}</strong><small>{e.model}</small></td><td>{e.cadKind||'Pending'}</td><td>{e.cadReview||'Confirm source and geometry.'}{e.url&&<a href={e.url} target="_blank" rel="noreferrer">Supplier / source ↗</a>}</td><td>{e.stepPath?<a href={localPath(e.stepPath)} download>STEP ↓</a>:'Pending'}</td></tr>)}</tbody></table></div></details>;
}
