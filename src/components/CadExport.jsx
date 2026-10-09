import { useState } from 'react';
import { Download } from 'lucide-react';
import Modal from './Modal.jsx';
import { downloadFile } from '../lib/storage.js';
import './placement.css';

export default function CadExport({setup,localAvailable}){
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[bench,setBench]=useState(true),[notice,setNotice]=useState('');
  async function exportStep(){
    setBusy(true);setNotice('Assembling source STEP geometry at the current positions…');
    try{
      const response=await fetch('/api/library/export-step',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({setup,includeBench:bench})});
      if(!response.ok){const error=await response.json();throw new Error(error.error||'CAD export failed.');}
      const blob=await response.blob();downloadFile(`${setup.id||'setup'}-solidworks.zip`,blob,'application/zip');
      setNotice('Downloaded: whole setup STEP, placement manifest, editable setup JSON and SolidWorks instructions.');
    }catch(e){setNotice(e.message);}finally{setBusy(false);}
  }
  return <><button className="button secondary" onClick={()=>setOpen(true)}><Download size={14}/>Export CAD</button>{open&&<Modal title="Export setup for SolidWorks" onClose={()=>!busy&&setOpen(false)}><div className="cad-export-panel"><p>Export every equipment instance at its current position and orientation using its source STEP geometry. Repeated equipment remains separate, named components.</p><label><input type="checkbox" checked={bench} disabled={busy} onChange={e=>setBench(e.target.checked)}/>Include illustrative optical bench</label><p>Rigid mounting records and the original setup JSON accompany the STEP. Native SolidWorks feature history and mechanical mate definitions must be added in SolidWorks. Optical/electrical lines are diagram paths and are recorded in JSON, rather than exported as physical fibres.</p>{!localAvailable&&<p>Whole-setup STEP assembly requires the local CAD runtime. On GitHub Pages, export the setup JSON and open it on localhost to generate STEP.</p>}<div className="cad-export-actions"><button className="button primary" disabled={!localAvailable||busy||!setup.nodes.length} onClick={exportStep}>{busy?'Generating STEP…':'Download STEP assembly package'}</button><button className="button secondary" disabled={busy} onClick={()=>downloadFile(`${setup.id||'setup'}-cad-layout.json`,setup)}>Export editable layout JSON</button></div><p role="status">{notice}</p><a href={`${import.meta.env.BASE_URL}documents/SOLIDWORKS-HANDOFF.md`} target="_blank" rel="noreferrer">SolidWorks import and return workflow</a></div></Modal>}</>;
}
