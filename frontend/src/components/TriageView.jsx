import { useEffect, useState } from 'react';
import { TriageStore, useTriage } from '../store.js';
import { timeToMin } from '../time.js';
import Header from './Header.jsx';
import Row from './Row.jsx';
import DetailPanel from './DetailPanel.jsx';

const isTodo = (p) => p.time && p.sev >= 4 && p.status === 'open';

export default function TriageView() {
  const { patients, nowMin, online, loading } = useTriage();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('tous');
  const [focusTodo, setFocusTodo] = useState(false);
  const [openId, setOpenId] = useState(null);

  // Start polling the backend once mounted.
  useEffect(() => {
    TriageStore.start();
    return () => TriageStore.stop();
  }, []);

  // Open the first row by default once data arrives.
  useEffect(() => {
    if (openId == null && patients.length) setOpenId(patients[0].id);
  }, [patients, openId]);

  const onCounter = () => {
    const on = !focusTodo;
    setFocusTodo(on);
    setFilter(on ? 'todo' : 'tous');
  };
  const setFilterManual = (v) => { setFilter(v); setFocusTodo(false); };

  const list = patients.slice();
  list.sort((a, b) => b.sev - a.sev || timeToMin(a.time) - timeToMin(b.time) || a.nom.localeCompare(b.nom));
  const ql = q.trim().toLowerCase();
  const filtered = list.filter((p) => {
    if (filter === 'todo' && !isTodo(p)) return false;
    if (filter === 'treating' && p.status !== 'treating') return false;
    if (ql && !`${p.nom} ${p.prenom} ${p.addr} ${p.ville} ${p.type}`.toLowerCase().includes(ql)) return false;
    return true;
  });
  const todoN = patients.filter(isTodo).length;

  return (
    <div className="tv variant-sobre">
      <Header {...{ q, setQ, filter, setFilter: setFilterManual, todoN, focusTodo, onCounter, online }} />
      <div className="tv-body">
        <div className="colh">
          <span>État</span><span>Patient</span><span>Adresse</span><span>Type d'alerte</span><span></span>
        </div>
        {loading && <div className="empty">Chargement…</div>}
        {!loading && filtered.length === 0 && <div className="empty">Aucun patient dans cette vue.</div>}
        {filtered.map((p) => {
          const open = openId === p.id;
          const onToggle = (e) => { if (e) e.stopPropagation(); setOpenId(open ? null : p.id); };
          return (
            <div className={'rowwrap sev-' + p.sev + (p.status === 'treating' ? ' treating' : '') + (open ? ' open' : '')} key={p.id}>
              <Row p={p} open={open} hl={focusTodo && isTodo(p)} nowMin={nowMin} onToggle={onToggle} />
              {open && <DetailPanel p={p} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
