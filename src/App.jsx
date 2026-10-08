import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Shell from './components/Shell.jsx';
import Explorer from './components/Explorer.jsx';
import Setups from './components/Setups.jsx';
import EquipmentLibrary, { EquipmentDetail } from './components/Equipment.jsx';
import Planner from './components/Planner.jsx';
import Documents from './components/Documents.jsx';
import Modal from './components/Modal.jsx';
import { useUrlState } from './lib/urlState.js';
import { getEquipment, getSetup, matchesSetup, setups } from './data/catalog.js';
import { loadLibrary } from './lib/library.js';
import { loadPublishedSetups } from './lib/publishedSetups.js';
const Builder=lazy(()=>import('./components/Builder.jsx'));
const Admin=lazy(()=>import('./components/Admin.jsx'));
const BenchDraft=lazy(()=>import('./components/Bench_draft.jsx'));
const EquipmentDraft=lazy(()=>import('./components/Equipment_draft.jsx'));
const TrainingDraft=lazy(()=>import('./components/Training_draft.jsx'));

export default function App() {
  const [state,update]=useUrlState();
  const [inspected,setInspected]=useState(null);
  const [libraryId,setLibraryId]=useState('laser');
  const [revision,setRevision]=useState(0);
  const [libraryError,setLibraryError]=useState('');
  const [libraryReady,setLibraryReady]=useState(false);
  useEffect(()=>{loadLibrary().then(loadPublishedSetups).then(()=>setRevision(r=>r+1)).catch(error=>setLibraryError(error.message)).finally(()=>setLibraryReady(true));const refresh=()=>setRevision(r=>r+1);window.addEventListener('cs-library-published',refresh);return()=>window.removeEventListener('cs-library-published',refresh);},[]);
  const closeInspector=useCallback(()=>setInspected(null),[]);
  if(!libraryReady) return <div className="model-loading" style={{height:'100vh'}}>Loading equipment library…</div>;
  function navigate(page,patch={}) {update({page,...(page.endsWith('_draft')&&!state.page.endsWith('_draft')?{setup:'wst-optical-manual'}:{}),...(page==='setups'?{scale:'',mode:'',band:'',query:'',status:''}:{}),...patch},true);window.scrollTo({top:0});}
  function explore(id) {const s=getSetup(id);update({page:'explorer',setup:s.id,scale:s.scale,mode:s.mode,band:s.bands[0]||'',status:'',query:'',tab:'overview'},true);window.scrollTo({top:0});}
  function openPlanner(id) {navigate('planner',{setup:id || setups.find(s=>matchesSetup(s,state))?.id || state.setup});}
  return <><a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>Skip to content</a><Shell page={state.page} navigate={navigate}>{libraryError&&<div className="note" role="status">{libraryError} Using the built-in catalog.</div>}<Suspense fallback={<div className="panel" style={{padding:30}}>Loading workspace…</div>}>{state.page==='explorer'?<Explorer key={revision} state={state} update={update} onPlanner={openPlanner} onInspect={setInspected}/>:state.page==='setups'?<Setups state={state} update={update} onExplore={explore}/>:state.page==='equipment'?<EquipmentLibrary key={`${libraryId}-${revision}`} initialId={libraryId} onExplore={explore}/>:state.page==='planner'?<Planner key={state.setup} setupId={state.setup} onExplore={explore} onSetupChange={setup=>update({setup})}/>:state.page==='bench_draft'?<BenchDraft key={state.setup} setupId={state.setup} onSetupChange={setup=>update({setup})} onInspect={setInspected} onTraining={()=>navigate('training_draft')}/>:state.page==='equipment_draft'?<EquipmentDraft onAdmin={()=>navigate('admin')}/>:state.page==='training_draft'?<TrainingDraft key={state.setup} setupId={state.setup} onSetupChange={setup=>update({setup})} onInspect={setInspected} onBench={()=>navigate('bench_draft')}/>:state.page==='builder'?<Builder onInspect={setInspected}/>:state.page==='admin'?<Admin onSaved={()=>setRevision(r=>r+1)}/>:<Documents/>}</Suspense></Shell>{inspected&&<Modal title="Equipment details" onClose={closeInspector} wide><EquipmentDetail item={getEquipment(inspected)}/><div className="modal-footer"><button className="button secondary" onClick={()=>{setLibraryId(inspected);closeInspector();navigate('equipment');}}>Open equipment library<ArrowRight size={15}/></button></div></Modal>}</>;
}


