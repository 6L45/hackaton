import { useEffect, useState } from 'react';
import { ICON } from './icons.jsx';

export default function Header({ q, setQ, filter, setFilter, todoN, focusTodo, onCounter, online }) {
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const seg = (val, label) => (
    <button className={filter === val ? 'on' : ''} onClick={() => setFilter(val)}>{label}</button>
  );

  return (
    <div className="tv-head">
      <div className="row1">
        <span className="tv-title"><span className="crumb">Triage · </span>File d'attente</span>
        <span className="live mono"><span className="blip"></span>{clock}</span>
        {!online && <span className="live mono" title="Backend injoignable — données de démonstration" style={{ color: '#b4641e' }}>● hors-ligne (mock)</span>}
        <button className={'counter' + (focusTodo ? ' active' : '')} onClick={onCounter} title="Afficher les patients à traiter">
          À traiter <span className="badge">{todoN}</span>
        </button>
      </div>
      <div className="tv-tools">
        <div className="search">
          {ICON.search}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un patient, une adresse…" />
        </div>
        <div className="seg2 statusfilter">
          {seg('tous', 'Tous')}
          {seg('todo', 'À traiter')}
          {seg('treating', 'En cours de traitement')}
        </div>
      </div>
    </div>
  );
}
