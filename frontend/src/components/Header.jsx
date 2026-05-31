import { useEffect, useState } from 'react';
import { ICON } from './icons.jsx';

export default function Header({ q, setQ, filter, setFilter, todoN, online }) {
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Mutually-exclusive tabs: clicking selects; the active tab is a no-op.
  // `badge` (optional) shows a count chip inside the tag — only when > 0.
  const seg = (val, label, badge) => (
    <button className={filter === val ? 'on' : ''} onClick={() => setFilter(val)}>
      {label}
      {badge > 0 && <span className="seg-badge">{badge}</span>}
    </button>
  );

  return (
    <div className="tv-head">
      <div className="row1">
        <span className="tv-title"><span className="crumb">Triage · </span>File d'attente</span>
        <span className="live mono"><span className="blip"></span>{clock}</span>
        {!online && <span className="live mono" title="Backend injoignable — données de démonstration" style={{ color: '#b4641e' }}>● hors-ligne (mock)</span>}
      </div>
      <div className="tv-tools">
        <div className="search">
          {ICON.search}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un patient, une adresse…" />
        </div>
        <div className="seg2 statusfilter">
          {seg('tous', 'Tous')}
          {seg('sans-treating', 'File active')}
          {seg('todo', 'À traiter', todoN)}
          {seg('treating', 'En cours de traitement')}
        </div>
      </div>
    </div>
  );
}
