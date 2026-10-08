import { publicationDefaults } from '../lib/publishedSetups.js';
export default function PublishSetup({draft,onChange,onPublish,disabled,saving,panelRef,lockId=false}){
  const p=publicationDefaults(draft);
  function patch(values){onChange({...draft,publication:{...p,...values}});}
  return <details ref={panelRef} className="panel publish-setup"><summary>Publish to Setup Explorer</summary><p>Publish the confirmed layout, slots, connections, settings and guide. Later draft edits appear in Explorer only after publishing again.</p><div className="settings-grid">
    <label>Setup ID<input aria-label="Setup ID" readOnly={lockId} title={lockId?'Stable ID for this draft workspace':undefined} value={draft.id||''} placeholder="e.g. manual-wafer-optical" onChange={e=>onChange({...draft,id:e.target.value})}/></label>
    <label>Published scale<select value={p.scale} onChange={e=>patch({scale:e.target.value})}><option>Wafer</option><option>Chip</option></select></label>
    <label>Published mode<select value={p.mode} onChange={e=>patch({mode:e.target.value})}><option>Optical</option><option>Electrical</option></select></label>
    <label>Lab / location<input value={p.lab} onChange={e=>patch({lab:e.target.value})}/></label>
    <label className="publication-description">Setup description<textarea rows={2} value={p.description} onChange={e=>patch({description:e.target.value})}/></label>
  </div><fieldset className="publication-bands"><legend>Published wavelength bands</legend>{['C-band','O-band','MIR','Visible'].map(b=><label key={b}><input type="checkbox" checked={p.bands.includes(b)} onChange={e=>patch({bands:e.target.checked?[...p.bands,b]:p.bands.filter(v=>v!==b)})}/>{b}</label>)}</fieldset><button className="button primary" disabled={disabled} onClick={onPublish}>{saving?'Publishing…':'Publish to Setup Explorer'}</button><p className="builder-help">Published means available to view in this app. It does not certify the equipment or approve a measurement procedure.</p></details>;
}
