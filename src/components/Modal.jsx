import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide = false }) {
  const ref=useRef(null);
  useEffect(()=>{
    const previous=document.activeElement;
    const container=ref.current;
    container.querySelector('button,input,select,textarea,a[href]')?.focus();
    function onKey(e) {
      if(e.key==='Escape') onClose();
      if(e.key==='Tab') {
        const controls=[...container.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')];
        const first=controls[0],last=controls.at(-1);
        if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
        if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
      }
    }
    const overflow=document.body.style.overflow; document.body.style.overflow='hidden';
    container.addEventListener('keydown',onKey);
    return ()=>{container.removeEventListener('keydown',onKey);document.body.style.overflow=overflow;previous?.focus();};
  },[onClose]);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={ref} className={`modal ${wide?'wide':''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div>{children}</section></div>;
}
