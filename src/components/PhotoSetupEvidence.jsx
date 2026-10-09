import { localPath } from './UI.jsx';

export default function PhotoSetupEvidence({evidence}) {
  if(!evidence)return null;
  return <details className="panel" style={{padding:16,marginBottom:16}}>
    <summary>Photo-derived draft · reference photos &amp; review notes</summary>
    <p className="note">{evidence.warning}</p>
    <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{evidence.files.map((file,i)=><a key={file} href={localPath(file)} target="_blank" rel="noreferrer" style={{flex:'1 1 170px'}}><img src={localPath(file)} alt={`Source bench photo ${i+1}`} style={{width:'100%',height:230,objectFit:'contain'}}/>Open photo {i+1}</a>)}</div>
    <p><a href={localPath(evidence.guide)} download>Download photo-to-setup agent guide (.md)</a></p>
  </details>;
}
