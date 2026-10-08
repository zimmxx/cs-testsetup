import { useEffect, useRef, useState } from 'react';
import { Upload, Plus, FileText, FileSliders, ExternalLink, Download, Trash2, Check, BookOpen, X } from 'lucide-react';
import { defaultDocuments, setups } from '../data/catalog.js';
import { documentStore, downloadFile, createId } from '../lib/storage.js';
import { PageHeading, SearchBox, Empty, External, localPath } from './UI.jsx';
import Modal from './Modal.jsx';

const extensions=['pdf','docx','pptx','xlsx','csv','txt','md','png','jpg','jpeg'];
export default function Documents() {
  const [localDocs,setLocalDocs]=useState([]);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('');
  const [setupFilter,setSetupFilter]=useState('');
  const [attachmentSetup,setAttachmentSetup]=useState('all');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [showLink,setShowLink]=useState(false);
  const [removeId,setRemoveId]=useState(null);
  const input=useRef(null);
  async function refresh() {try{setLocalDocs(await documentStore('list'));}catch{setError('The local document store is unavailable. Reference links still work.');}}
  useEffect(()=>{refresh();},[]);
  const docs=[...defaultDocuments,...localDocs];
  const filtered=docs.filter(d=>(!category||d.type===category)&&(!setupFilter||d.setup==='all'||d.setup===setupFilter||d.setup===setups.find(s=>s.id===setupFilter)?.scale)&&`${d.title} ${d.description} ${d.source}`.toLowerCase().includes(query.toLowerCase()));
  async function upload(files) {
    setError('');setMessage('');setBusy(true);let count=0;const failures=[];
    for(const file of files) {
      const ext=file.name.split('.').at(-1).toLowerCase();
      if(!extensions.includes(ext)){failures.push(`${file.name}: unsupported file type.`);continue;}
      if(file.size>25*1024*1024){failures.push(`${file.name}: exceeds the 25 MB limit.`);continue;}
      try {await documentStore('put',{id:createId(),title:file.name,type:'Local document',setup:attachmentSetup,description:`${(file.size/1024).toFixed(0)} KB · attached ${new Date().toLocaleDateString('en-GB')}`,source:'This browser',blob:file,fileName:file.name,addedAt:new Date().toISOString()});count++;}catch{failures.push(`${file.name}: could not save (browser storage may be full).`);}
    }
    await refresh();setBusy(false);setMessage(count?`${count} document${count===1?'':'s'} attached in this browser.`:'');setError(failures.join(' '));if(input.current)input.current.value='';
  }
  async function addLink(e) {
    e.preventDefault();setError(''); const form=new FormData(e.currentTarget);let url;
    try {url=new URL(form.get('url'));if(!['https:','http:'].includes(url.protocol))throw new Error();}catch{setError('Enter a valid http or https URL.');return;}
    try{await documentStore('put',{id:createId(),title:form.get('title').trim(),url:url.href,type:'Saved link',setup:form.get('setup'),description:form.get('description'),source:'This browser'});await refresh();setShowLink(false);setMessage('Reference link saved.');}catch{setError('The link could not be saved in this browser.');}
  }
  async function remove() {try{await documentStore('remove',removeId);await refresh();setRemoveId(null);setMessage('Local document removed.');}catch{setError('Could not remove the local document.');}}
  return <><PageHeading title="Documentation" action={<div className="heading-actions"><button className="button secondary" onClick={()=>{setError('');setShowLink(true);}}><Plus size={16}/>Add link</button><button className="button primary" disabled={busy} onClick={()=>input.current?.click()}><Upload size={16}/>{busy?'Saving…':'Attach documents'}</button></div>}>Keep setup references, manuals and training material within reach.</PageHeading><input ref={input} type="file" multiple accept={extensions.map(e=>`.${e}`).join(',')} className="sr-only" aria-label="Attach documents" onChange={e=>upload([...e.target.files])}/><div className="document-intro"><BookOpen size={26}/><div><h3>Your testing knowledge, in one place</h3><p>The supplied presentation and public references are ready to use. Add your SOPs, manuals and measurement notes as the catalog grows.</p></div><label className="attachment-scope">Attach to<select aria-label="Attach documents to setup" value={attachmentSetup} onChange={e=>setAttachmentSetup(e.target.value)}><option value="all">General library</option>{setups.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div><div className="note">Attached files and saved links stay in this browser on this address. They are not uploaded or shared, and browser storage can be cleared. Keep original files as backups. To include documents in the future GitHub app, add them to the project’s public/documents folder and catalog.</div>{message && <div className="success-message" role="status"><Check size={16}/>{message}</div>}{error && !showLink && <p className="error-text" role="alert">{error}</p>}<div className="library-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search documentation…" label="Search documents"/><select aria-label="Filter document type" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All document types</option>{[...new Set(docs.map(d=>d.type))].map(t=><option key={t}>{t}</option>)}</select><select aria-label="Filter documents by setup" value={setupFilter} onChange={e=>setSetupFilter(e.target.value)}><option value="">All setups</option>{setups.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div className="panel document-list"><div className="rail-heading">Reference library<span>{filtered.length} documents</span></div>{filtered.map(d=><div className="document-row" key={d.id}><div className="document-icon">{d.type==='Presentation'?<FileSliders size={23}/>:<FileText size={23}/>}</div><div className="document-info"><h3>{d.title}</h3><p>{d.description}</p><small>{d.type} · {d.source}{d.setup!=='all' && ` · ${setups.find(s=>s.id===d.setup)?.name || d.setup}`}</small></div><div className="document-actions">{d.url?<External className="button ghost" href={d.url}>Open</External>:d.blob?<button className="button ghost" onClick={()=>downloadFile(d.fileName,d.blob)}><Download size={15}/>Download</button>:<a className="button ghost" href={localPath(d.path)} download><Download size={15}/>Download</a>}{localDocs.some(l=>l.id===d.id)&&<button className="icon-button" aria-label={`Remove ${d.title}`} onClick={()=>setRemoveId(d.id)}><Trash2 size={16}/></button>}</div></div>)}{!filtered.length&&<Empty title="No documents found">Try another search or attach the first document for this setup.</Empty>}</div>{showLink&&<Modal title="Add a reference link" onClose={()=>setShowLink(false)}><form className="link-form" onSubmit={addLink}><label>Title<input name="title" required maxLength={160}/></label><label>Website URL<input name="url" type="url" required placeholder="https://…"/></label><label>Related setup<select name="setup" defaultValue={attachmentSetup}><option value="all">General library</option>{setups.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Description<textarea name="description" rows={3} maxLength={500}/></label>{error&&<p role="alert" className="error-text">{error}</p>}<button className="button primary" type="submit">Save link</button></form></Modal>}{removeId&&<Modal title="Remove local document?" onClose={()=>setRemoveId(null)}><div className="confirm-content"><p>Remove this item from this browser’s library. Your original file will remain on your computer.</p><div className="heading-actions"><button className="button secondary" onClick={()=>setRemoveId(null)}>Keep document</button><button className="button danger" onClick={remove}>Remove</button></div></div></Modal>}</>;
}
