import { useEffect, useState } from 'react';
const defaults = { page: 'explorer', scale: 'Chip', mode: 'Optical', band: 'C-band', setup: 'chip-optical-c', tab: 'overview', query: '', status: '' };
export const normalizeSetupView=view=>view==='illustrative'?'signal':view;
function parseState() {
  const p = new URLSearchParams(window.location.hash.slice(1));
  const state = { ...defaults };
  Object.keys(defaults).forEach(k => { if (p.has(k)) state[k] = p.get(k); });
  if (!['explorer', 'setups', 'equipment', 'planner', 'documents', 'builder', 'admin', 'bench_draft', 'equipment_draft', 'training_draft'].includes(state.page)) state.page = 'explorer';
  if(state.page.endsWith('_draft')&&!p.has('setup'))state.setup='wst-optical-manual';
  state.tab=normalizeSetupView(state.tab);
  if (!['overview', '3d', 'signal', 'diagram', 'equipment', 'guide'].includes(state.tab)) state.tab = 'overview';
  if (!['', 'Chip', 'Wafer'].includes(state.scale)) state.scale = '';
  if (!['', 'Optical', 'Electrical'].includes(state.mode)) state.mode = '';
  if (!['', 'C-band', 'O-band', 'MIR', 'Visible'].includes(state.band)) state.band = '';
  return state;
}
export function useUrlState() {
  const [state, setState] = useState(parseState);
  useEffect(() => { const onPop = () => setState(parseState()); window.addEventListener('popstate', onPop); window.addEventListener('hashchange', onPop); return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('hashchange', onPop); }; }, []);
  function update(patch, push = false) {
    const next = { ...state, ...patch };
    const params = new URLSearchParams(next);
    window.history[push ? 'pushState' : 'replaceState'](null, '', `${window.location.pathname}${window.location.search}#${params}`);
    setState(next);
  }
  return [state, update];
}
