import { SEVMETA } from '../mockData.js';
import { relTime } from '../time.js';
import { ICON } from './icons.jsx';

export default function Row({ p, open, hl, nowMin, onToggle }) {
  const treating = p.status === 'treating';
  const cls = ['row', 'sev-' + p.sev];
  if (open) cls.push('open');
  if (treating) cls.push('treating');
  if (hl) cls.push('hl');
  if (p.isnew) cls.push('isnew');
  if (p.behavioral) cls.push('beh');
  return (
    <div className={cls.join(' ')} onClick={onToggle}>
      <span className="cell-state">
        <span className="sdot"></span>
        <span className="slabel">{SEVMETA[p.sev].label}</span>
        {treating && <span className="treat-chip">en cours</span>}
        {p.behavioral && <span className="beh-chip" title={p.behavioral.message}>⚠ Comportement</span>}
      </span>
      <span className="cell-id"><span className="name">{p.nom}</span> <span className="given">{p.prenom}</span></span>
      <span className="addr">{p.addr}, {p.ville}</span>
      <span>
        {p.time ? (
          <span className="alertpill"><span className="pdot"></span>{p.type}<span className="ptime">· {relTime(p.time, nowMin)}</span></span>
        ) : (
          <span className="alertpill none"><span className="pdot"></span>Aucune alerte</span>
        )}
      </span>
      <span className="cell-act"><button className="det-btn" onClick={onToggle}>Détails <span className="chev">{ICON.chev}</span></button></span>
    </div>
  );
}
