import { useState } from 'react';
import { ChevronRight, MapPin, Link, Check, Cpu, ArrowRight, X } from 'lucide-react';
import { setups, matchesSetup, sources } from '../data/catalog.js';
import { FilterBar, PageHeading, Empty, Status, PlannerPrompt, External, asset } from './UI.jsx';
import SetupCanvas from './SetupCanvas.jsx';
import PublishedSetupView from './PublishedSetupView.jsx';
import '../builder.css';
import Guide from './Guide.jsx';
import { SetupEquipment } from './Equipment.jsx';

const tabs=[['overview','Setup overview'],['3d','3D'],['signal','Signal path'],['diagram','Setup diagram'],['equipment','Equipment'],['guide','How-to guide']];
export default function Explorer({ state, update, onPlanner, onInspect }) {
  const matches=setups.filter(s=>matchesSetup(s,state));
  const selected=matches.find(s=>s.id===state.setup) || matches[0];
  const [selectedComponent,setSelectedComponent]=useState('laser');
  const [copied,setCopied]=useState(false);
  const [copyError,setCopyError]=useState('');
  const component=selected?.equipment.includes(selectedComponent)?selectedComponent:selected?.equipment[0];
  async function copyLink() {
    update({setup:selected.id});
    try { await navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2000); } catch {setCopyError('Copy the address from your browser to share this view.');}
  }
  return <><PageHeading title="Explore your test setup">View published bench layouts, inspect every connection and follow the measurement guide.</PageHeading><FilterBar state={state} update={update}/><div className="explorer-layout"><aside className="panel results-rail"><div className="rail-heading">Matching setups<span>{matches.length}</span></div><div className="result-list">{matches.map(s=><button key={s.id} className={`setup-result ${selected?.id===s.id?'selected':''}`} aria-pressed={selected?.id===s.id} onClick={()=>update({setup:s.id},true)}><div className="setup-thumb">{s.photos.length?<img src={asset(s.photos[0])} alt=""/>:<Cpu size={24}/>}</div><span><strong>{s.name}</strong><small>{s.subtitle}</small>{!['Documented','Service listed'].includes(s.status) && <span className="result-status">{s.status}</span>}</span><ChevronRight size={16}/></button>)}</div><div className="rail-note">Select a test to explore the equipment, connections and workflow.<br/><br/>Electrical tests without optical readout appear when Wavelength is set to All bands.</div></aside><section className="panel setup-panel">{selected?<><div className="setup-heading"><div><h2>{selected.name}</h2><p>{selected.description}</p></div><button className="icon-button copy-button" aria-label="Copy setup link" onClick={copyLink}>{copied?<Check size={18}/>:<Link size={18}/>}</button></div>{copyError && <p role="status" className="inline-message">{copyError}</p>}<div className="setup-meta"><span><MapPin size={13}/>{selected.lab}</span><Status value={selected.status}/></div><div className="tabs" role="tablist" aria-label="Setup views">{tabs.map(([id,label])=><button key={id} role="tab" id={`tab-${id}`} aria-controls="setup-tabpanel" aria-selected={state.tab===id} onClick={()=>update({tab:id})} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const i=tabs.findIndex(t=>t[0]===id);const next=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length][0];update({tab:next});document.getElementById(`tab-${next}`)?.focus();}}} tabIndex={state.tab===id?0:-1}>{label}</button>)}</div><div role="tabpanel" id="setup-tabpanel" aria-labelledby={`tab-${state.tab}`}>{['overview','3d','signal'].includes(state.tab)?<PublishedSetupView key={selected.id} setup={selected} mode={state.tab} onMode={tab=>update({tab})} onInspect={onInspect}/>:state.tab==='diagram'?<SetupCanvas key={selected.id} setup={selected} selected={component} onSelect={setSelectedComponent} onInspect={onInspect}/>:state.tab==='equipment'?<SetupEquipment setup={selected} onInspect={onInspect}/>:<Guide key={selected.id} setup={selected}/>}</div><details className="capabilities"><summary>Capabilities & source notes</summary><ul>{selected.capabilities.map(c=><li key={c}>{c}</li>)}</ul><p>{selected.note}</p><p className="source-note">{selected.slide && <>Presentation slide {selected.slide} · </>}{sources[selected.source].url?<External href={sources[selected.source].url}>{sources[selected.source].label}</External>:sources[selected.source].label}</p></details></>:<Empty action={<button className="button secondary" onClick={()=>update({scale:'',mode:'',band:'',status:'',query:''})}>Show all setups</button>}>No documented match for this combination. Try another band, or clear the filters to see planned configurations.</Empty>}</section></div><PlannerPrompt onOpen={()=>onPlanner(selected?.id)}/></>;
}
