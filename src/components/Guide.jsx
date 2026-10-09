import { useState } from 'react';
import { Check, RotateCcw, ArrowUpRight, Download } from 'lucide-react';
import { guideSteps, sources } from '../data/catalog.js';
import { readLocal, writeLocal, downloadFile } from '../lib/storage.js';
import { External } from './UI.jsx';

export default function Guide({ setup }) {
  const [progress, setProgress] = useState(() => readLocal('guide-progress', {}));
  const [saveError, setSaveError] = useState(false);
  const recorded=setup.published||setup.template;
  const steps = recorded?.procedure?.length?recorded.procedure.map(s=>[s.title,s.text]):guideSteps[setup.guide];
  const done = progress[setup.id] || [];
  function save(next) { setProgress(next); setSaveError(!writeLocal('guide-progress',next)); }
  function toggle(index) { save({...progress, [setup.id]:done.includes(index)?done.filter(i=>i!==index):[...done,index]}); }
  return <div className="tab-content guide"><div className="section-heading"><div><h3>Your measurement workflow</h3><p>A guided path from preparation to post-processing.</p></div><button className="text-button" onClick={()=>save({...progress,[setup.id]:[]})}><RotateCcw size={14}/>Reset</button></div><div className="note">Draft training outline · Follow the approved local SOP and equipment training. This checklist is guidance, not a validated operating procedure.</div><div className="guide-progress"><span>{done.length} of {steps.length} steps reviewed</span><div><span style={{width:`${done.length/steps.length*100}%`}}/></div></div>{saveError && <p role="alert" className="error-text">Your progress could not be saved in this browser.</p>}<ol className="guide-steps">{steps.map(([title,text],i)=><li key={title} className={done.includes(i)?'completed':''}><button className="step-check" aria-label={`${done.includes(i)?'Unmark':'Mark'} step ${i+1}: ${title}`} aria-pressed={done.includes(i)} onClick={()=>toggle(i)}>{done.includes(i)?<Check size={17}/>:i+1}</button><div><h4>{title}</h4><p>{text}</p></div></li>)}</ol><div className="guide-footer"><External className="button secondary" href={sources.suite.url}>Open cs-testsuite</External><button className="button ghost" onClick={()=>downloadFile(`${setup.id}-checklist.txt`, `${setup.name}\nDraft training outline – use the approved local SOP\n\n${steps.map(([t,d],i)=>`${done.includes(i)?'[x]':'[ ]'} ${i+1}. ${t}\n${d}`).join('\n\n')}`, 'text/plain')}><Download size={15}/>Export checklist</button></div></div>;
}
