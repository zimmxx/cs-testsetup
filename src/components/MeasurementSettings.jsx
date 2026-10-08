import { manualGroups, initialProcedure } from '../data/manualSetup.js';
export default function MeasurementSettings({draft,onChange}) {
  const m=draft.measurement||{};
  const managedHousing=['wst-optical-manual','oband-mainframe-assembly'].includes(draft.id)&&draft.mainframeRevision>=1;
  const housingFields=['laserSlot','sensorSlot','sensorMainframe'];
  const fields=manualGroups.flatMap(g=>g.fields), completed=fields.filter(([key])=>m[key]!==''&&m[key]!==undefined).length;
  const problems=[];
  if(m.startNm!==''&&m.stopNm!==''&&m.startNm!==undefined&&m.stopNm!==undefined&&m.stopNm<=m.startNm)problems.push('Stop wavelength must be greater than start wavelength.');
  if(m.stepNm===0)problems.push('Wavelength step must be greater than zero.');
  if(m.laserPowerMw!==''&&m.maxPowerMw!==''&&m.maxPowerMw!==undefined&&m.laserPowerMw>m.maxPowerMw)problems.push('Laser output setting exceeds the entered DUT power limit. Check losses and the actual DUT power.');
  for(const [key,label] of [['inputAngle','Input angle'],['outputAngle','Output angle']])if(m[key]>90)problems.push(`${label} must be between 0° and 90° from wafer normal.`);
  if(m.allowedStartNm!==''&&m.allowedStartNm!==undefined&&m.startNm!==''&&m.startNm!==undefined&&m.startNm<m.allowedStartNm)problems.push('Start wavelength is below the validated path range.');
  if(m.allowedStopNm!==''&&m.allowedStopNm!==undefined&&m.stopNm!==''&&m.stopNm!==undefined&&m.stopNm>m.allowedStopNm)problems.push('Stop wavelength is above the validated path range.');
  const procedure=draft.procedure||initialProcedure;
  return <section className="panel measurement-settings"><div className="section-heading"><div><h3>Measurement settings & working guide</h3><p>Fill in what you know. Blank values remain unconfirmed.</p></div><span className="settings-progress">{completed} / {fields.length} fields entered</span></div>
    <p className="builder-help">Editable measurement record and planning guide. Instrument control is performed on the bench.{draft.id==='wst-optical-manual'?' User-reported starting values: 10 mW laser setpoint and 10° from wafer normal.':''}</p>
    {problems.length>0&&<div className="settings-warnings" role="status">{problems.map(p=><p key={p}>{p}</p>)}</div>}
    {manualGroups.map((group,i)=><details key={group.title} open={i===0||undefined}><summary>{group.title}</summary><div className="settings-grid">{group.fields.map(([key,label,type,unit])=><label key={key}>{label}{typeof unit==='string'?` (${unit})`:''}{type==='select'?<select aria-label={label} value={m[key]??''} onChange={e=>onChange({measurement:{...m,[key]:e.target.value}})}><option value="">Not specified</option>{unit.map(v=><option key={v}>{v}</option>)}</select>:<input aria-label={label} readOnly={managedHousing&&housingFields.includes(key)} title={managedHousing&&housingFields.includes(key)?'Updated through Mainframe slots above':undefined} type={type==='number'?'number':type==='date'?'date':'text'} step={type==='number'?'any':undefined} min={type==='number'&&key!=='temperatureC'?0:undefined} placeholder="Not specified" value={m[key]??''} onChange={e=>{const value=type==='number'&&e.target.value!==''?Number(e.target.value):e.target.value;onChange({measurement:{...m,[key]:value}});}}/>}{managedHousing&&housingFields.includes(key)&&<small>Updated through Mainframe slots above.</small>}</label>)}</div></details>)}
    <details><summary>Working guide · edit each step</summary><p className="builder-help">Draft sequence for this manual bench. Add the exact local procedure and post-processing instructions before marking it reviewed.</p>{procedure.map((s,i)=><div className="procedure-step" key={i}><label>Step {i+1} title<input aria-label={`Step ${i+1} title`} value={s.title} onChange={e=>onChange({procedure:procedure.map((v,j)=>i===j?{...v,title:e.target.value}:v)})}/></label><label>Instructions<textarea aria-label={`Step ${i+1} instructions`} rows={3} value={s.text} onChange={e=>onChange({procedure:procedure.map((v,j)=>i===j?{...v,text:e.target.value}:v)})}/></label></div>)}</details>
  </section>;
}
