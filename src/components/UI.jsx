import { Search, ExternalLink, ArrowRight } from 'lucide-react';

export const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
export const localPath = name => `${import.meta.env.BASE_URL}${name}`;
export function Status({ value }) { return <span className={`status status-${value.toLowerCase().replaceAll(' ', '-')}`}><span />{value}</span>; }
export function SearchBox({ value, onChange, placeholder = 'Search…', label = 'Search' }) { return <div className="search-box"><Search size={17}/><input aria-label={label} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></div>; }
export function Empty({ title = 'No matching setups', children, action }) { return <div className="empty"><Search size={30}/><h3>{title}</h3><p>{children}</p>{action}</div>; }
export function External({ href, children, className = '' }) { return <a className={`external ${className}`} href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={14}/></a>; }
export function PageHeading({ title, children, action }) { return <div className="page-heading"><div><h1>{title}</h1><p>{children}</p></div>{action}</div>; }
export function FilterBar({ state, update, extra = false }) {
  const fields = [['scale', 'Scale', ['Chip', 'Wafer']], ['mode', 'Mode', ['Optical', 'Electrical']], ['band', 'Wavelength', ['C-band', 'O-band', 'MIR', 'Visible']]];
  return <div className="filter-bar">{fields.map(([key, label, options]) => <label key={key}><span>{label}</span><select value={state[key]} onChange={e => update({ [key]: e.target.value, ...(key === 'mode' && e.target.value === 'Electrical' ? { band: '' } : {}) })}><option value="">All {key === 'band' ? 'bands' : label.toLowerCase() + 's'}</option>{options.map(o => <option key={o}>{o}</option>)}</select></label>)}{extra && <label><span>Status</span><select value={state.status} onChange={e => update({status:e.target.value})}><option value="">All statuses</option>{['Published','Documented','Service listed','Needs verification','Planned','In development'].map(v=><option key={v}>{v}</option>)}</select></label>}<button className="text-button clear" onClick={() => update({ scale: '', mode: '', band: '', status: '', query: '' })}>Clear filters</button></div>;
}
export function PlannerPrompt({ onOpen }) { return <div className="planner-prompt"><div className="prompt-icon">◷</div><div><h3>Measurement time</h3><p>Estimate your session from chips, waveguides and sweeps.</p></div><button className="button primary" onClick={onOpen}>Open planner <ArrowRight size={17}/></button></div>; }
