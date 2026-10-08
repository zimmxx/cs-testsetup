import { Network, Database, Cpu, CalendarDays, BookOpen, GraduationCap, ChevronRight, Menu, X, ArrowUpRight, PencilRuler, Settings2 } from 'lucide-react';
import { useState } from 'react';

export const navItems = [
  { id: 'explorer', title: 'Setup explorer', icon: Network },
  { id: 'setups', title: 'Available setups', icon: Database },
  { id: 'equipment', title: 'Equipment library', icon: Cpu },
  { id: 'builder', title: 'Build setup', icon: PencilRuler },
  { id: 'planner', title: 'Measurement planner', icon: CalendarDays },
  { id: 'documents', title: 'Documentation', icon: BookOpen },
];
export const draftNavItems = [
  {id:'bench_draft',title:'Bench_draft',icon:PencilRuler},
  {id:'equipment_draft',title:'Equipment_draft',icon:Cpu},
  {id:'training_draft',title:'Training_draft',icon:GraduationCap},
];
export default function Shell({ page, navigate, children }) {
  const [menu, setMenu] = useState(false);
  function go(id) { navigate(id); setMenu(false); }
  const current = page==='admin'?{title:'Admin'}:[...navItems,...draftNavItems].find(n => n.id === page);
  return <div className="app-shell">
    <aside className={`sidebar ${menu ? 'open' : ''}`} aria-label="Main navigation">
      <button className="brand" onClick={() => go('explorer')} aria-label="CORNERSTONE home"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20"/><path d="M5 16h38M4 24h40M5 32h38M16 5v38M24 4v40M32 5v38"/></svg><span><strong>CORNERSTONE</strong><small>TEST SETUP</small></span></button>
      <button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMenu(false)}><X/></button>
      <nav>{navItems.map(({id,title,icon:Icon}) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} aria-current={page === id ? 'page' : undefined} onClick={() => go(id)}><Icon size={21}/><span>{title}</span></button>)}</nav>
      <div className="draft-nav-label">PREVIEW WORKSPACES</div><nav aria-label="Draft workspaces">{draftNavItems.map(({id,title,icon:Icon})=><button key={id} className={`nav-item draft-nav-item ${page===id?'active':''}`} aria-current={page===id?'page':undefined} onClick={()=>go(id)}><Icon size={19}/><span>{title}</span></button>)}</nav>
      <button className="training-link" onClick={() => {navigate('explorer', {tab:'guide'});setMenu(false);}}><GraduationCap size={24}/><span><strong>Training starts here</strong><small>Learn the equipment, connections and measurement workflow.</small></span><ChevronRight size={18}/></button>
      <div className="sidebar-footer">CORNERSTONE · Southampton<span>Local workspace · v0.1.0</span></div>
      <button className={`admin-nav ${page==='admin'?'active':''}`} onClick={()=>go('admin')} aria-current={page==='admin'?'page':undefined}><Settings2 size={13}/>Admin</button>
    </aside>
    {menu && <button className="scrim" aria-label="Dismiss menu" onClick={() => setMenu(false)}/>}
    <div className="workspace"><header className="topbar"><div><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMenu(true)}><Menu size={22}/></button><span className="muted">Workspace</span><span className="separator">/</span><strong>{current?.title}</strong></div><button className="top-docs" onClick={() => go('documents')}><BookOpen size={17}/><span>Documentation</span><ArrowUpRight size={16}/></button></header><main id="main-content" tabIndex={-1}>{children}</main><footer className="workspace-footer"><span>A working reference for CORNERSTONE testing</span><span>Catalog snapshot · 30 September 2026</span></footer></div>
  </div>;
}
