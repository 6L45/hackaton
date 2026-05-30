/* =========================================================================
   triage.jsx — shared interactive triage engine, rendered in 3 directions
   (variant: "sobre" | "cockpit" | "carte"). Exposes window.TriageView and
   window.TriageStore (global patient list so "simulate alert" + ACK affect
   all three boards at once).
   ========================================================================= */
(function () {
const { PATIENTS, SEVMETA, ALERT_TYPES, timeToMin, relTime, relShort, NOW_MIN } = window.TRIAGE_DATA;

/* ---------- global store (patients + ack + injected alerts) ---------- */
const Store = {
  patients: PATIENTS.map(p => ({ ...p })),
  nowMin: NOW_MIN,
  listeners: new Set(),
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { this.listeners.forEach(fn => fn()); },
  toggleAck(id) {
    const p = this.patients.find(x => x.id === id);
    if (p) { p.acked = !p.acked; this.emit(); }
  },
  _seq: 100,
  _pool: [
    { nom: 'Lambert', prenom: 'Yves', initials: 'YL', addr: '9 rue Sully', ville: 'Lyon 6e', type: 'Chute détectée', trig: 'Accéléromètre' },
    { nom: 'Caron', prenom: 'Nadia', initials: 'NC', addr: '14 rue Bossuet', ville: 'Lyon 6e', type: 'SpO₂ basse', trig: 'SpO₂' },
    { nom: 'Roux', prenom: 'Denis', initials: 'DR', addr: '5 rue d\'Alsace', ville: 'Villeurbanne', type: 'Bradycardie', trig: 'Fréq. cardiaque' },
  ],
  injectAlert() {
    this.nowMin += 3;
    const t = this.nowMin;
    const tpl = this._pool[(this._seq) % this._pool.length];
    const id = ++this._seq;
    const hh = String(Math.floor(t / 60)).padStart(2, '0'), mm = String(t % 60).padStart(2, '0');
    this.patients.unshift({
      id, ...tpl, sev: 5, time: `${hh}:${mm}`, acked: false, isnew: true,
      trigVital: tpl.trig, trend: PATIENTS[1].trend,
      vitals: [{ n: tpl.trig, val: 'Seuil franchi', unit: '', trig: true }, { n: 'Fréq. cardiaque', val: '124', unit: 'bpm' }, { n: 'SpO₂', val: '88', unit: '%' }],
    });
    this.emit();
    setTimeout(() => { const p = this.patients.find(x => x.id === id); if (p) { p.isnew = false; this.emit(); } }, 7500);
  },
};
window.TriageStore = Store;

function useStore() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => Store.subscribe(force), []);
  return Store;
}

/* ---------- little bits ---------- */
function Sparkline({ data, w = 80, h = 26 }) {
  const min = Math.min(...data), max = Math.max(...data), rng = (max - min) || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - min) / rng) * (h - 4)}`);
  const last = pts[pts.length - 1].split(',');
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts.join(' ')} style={{ stroke: 'var(--acc)' }} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" style={{ fill: 'var(--acc)' }} />
    </svg>
  );
}

const ICON = {
  search: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5" /><path d="M14 14l-3.2-3.2" strokeLinecap="round" /></svg>,
  chev: <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4" /></svg>,
  caret: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M2 4l3.5 3.5L9 4" /></svg>,
};

function keyVital(p) {
  const t = p.vitals.find(v => v.trig) || p.vitals[0];
  return t || { val: '—', unit: '', n: '' };
}

/* ---------- detail panel (shared) ---------- */
function DetailPanel({ p }) {
  const store = Store;
  const stop = e => e.stopPropagation();
  return (
    <div className="detail" onClick={stop}>
      <div className="detgrid">
        <div className="dbox">
          <h4>Données capteurs · IoT</h4>
          <p className="dnote">Valeurs renvoyées par le backend au déclenchement de l'alerte</p>
          <div className="vitals">
            {p.vitals.map((x, i) => (
              <div key={i} className={'vital' + (x.trig ? ' trig' : '')}>
                <span className="vv">{x.val}{x.unit && <small>{x.unit}</small>}</span>
                <span className="vn">{x.n}</span>
                {x.trig && <span className="flag">déclencheur</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="dbox">
          <h4>Position GPS</h4>
          <p className="dnote">Dernière position du module mobile · maj 30 s</p>
          <div className="map">
            <div className="grid"></div>
            <div className="road" style={{ left: 0, right: 0, top: '63%', height: '14px' }}></div>
            <div className="road" style={{ top: 0, bottom: 0, left: '44%', width: '14px' }}></div>
            <span className="lbl">GPS · live</span>
            <span className="ping"></span>
            <span className="pin"><i></i></span>
          </div>
          <div className="gpsmeta">
            <span><b>Adresse</b> · {p.addr}, {p.ville}</span>
            <span><b>Statut</b> · à domicile</span>
          </div>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={stop}>Envoyer une équipe</button>
          <button className="btn" onClick={stop}>Appeler le patient</button>
          <button className="btn" onClick={(e) => { stop(e); store.toggleAck(p.id); }}>
            {p.acked ? 'Rouvrir' : 'Marquer comme traité'}
          </button>
          <span className="ahint">actions ⟵ backend</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- rows per variant ---------- */
function AckBtn({ p }) {
  return (
    <button className={'ack-btn' + (p.acked ? ' done' : '')} title="Accusé de réception"
      onClick={(e) => { e.stopPropagation(); Store.toggleAck(p.id); }}>
      {p.acked ? '✓ Vu' : 'ACK'}
    </button>
  );
}

function RowSobre({ p, open, onToggle }) {
  return (
    <div className={'row sev-' + p.sev + (open ? ' open' : '') + (p.acked ? ' acked' : '') + (p.isnew ? ' isnew' : '')} onClick={onToggle}>
      <span className="cell-state"><span className="sdot"></span><span className="slabel">{SEVMETA[p.sev].label}</span></span>
      <span><span className="name">{p.nom}</span> <span className="given">{p.prenom}</span></span>
      <span className="addr">{p.addr}, {p.ville}</span>
      <span className="atype">{p.type}</span>
      <span className={'when' + (p.time ? '' : ' none')}>{p.time || '—'}</span>
      <span className="cell-act"><button className="det-btn" onClick={onToggle}>Détails <span className="chev">{ICON.chev}</span></button></span>
    </div>
  );
}

function RowCockpit({ p, open, onToggle }) {
  return (
    <div className={'row sev-' + p.sev + (open ? ' open' : '') + (p.acked ? ' acked' : '') + (p.isnew ? ' isnew' : '')} onClick={onToggle}>
      <span className="sevblock"><span className="rk">{p.sev}</span><span className="cd">{SEVMETA[p.sev].code}</span></span>
      <span><span className="name">{p.nom}</span> <span className="given">{p.prenom}</span></span>
      <span className="addr">{p.addr}, {p.ville}</span>
      <span><div className="atype">{p.type}</div><div className="when" style={{ color: 'var(--ink-faint)', fontSize: '11.5px' }}>{p.time ? relShort(p.time) : '—'}</div></span>
      <span>{p.trend ? <Sparkline data={p.trend} /> : null}</span>
      <span style={{ display: 'flex', justifyContent: 'center' }}>{p.time ? <AckBtn p={p} /> : null}</span>
      <span className="cell-act"><button className="det-btn" onClick={onToggle}>Détails <span className="chev">{ICON.chev}</span></button></span>
    </div>
  );
}

function RowCarte({ p, open, onToggle }) {
  const kv = keyVital(p);
  return (
    <div className={'row sev-' + p.sev + (open ? ' open' : '') + (p.acked ? ' acked' : '') + (p.isnew ? ' isnew' : '')} onClick={onToggle}>
      <span className="avatar">{p.initials}</span>
      <span className="carte-id">
        <div><span className="name">{p.nom}</span> <span className="given">{p.prenom}</span></div>
        <div className="addr">{p.addr}, {p.ville}</div>
      </span>
      {p.time ? (
        <span className="alertpill"><span className="pdot"></span>{p.type}<span className="ptime">· {relTime(p.time)}</span></span>
      ) : (
        <span className="alertpill" style={{ opacity: .7 }}><span className="pdot"></span>Aucune alerte</span>
      )}
      <span className="keyvital">
        <div className="kv">{kv.val}{kv.unit && <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}> {kv.unit}</span>}</div>
        <div className="kl">{kv.n}</div>
      </span>
      <span className="carte-act">
        {p.time ? <AckBtn p={p} /> : null}
        <button className="det-btn" onClick={onToggle}>Détails <span className="chev">{ICON.chev}</span></button>
      </span>
    </div>
  );
}

const ROW = { sobre: RowSobre, cockpit: RowCockpit, carte: RowCarte };

/* ---------- header / filters ---------- */
function Header({ variant, q, setQ, sevSet, toggleSev, type, setType, scope, setScope, unacked, shown }) {
  const [clock, setClock] = React.useState('');
  React.useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  const stop = e => e.stopPropagation();
  return (
    <div className="tv-head" onPointerDown={stop}>
      <div className="row1">
        <span className="tv-title"><span className="crumb">Triage · </span>File d'attente</span>
        <span className="live mono"><span className="blip"></span>{clock}</span>
        <span className="counter">À traiter <span className="badge">{unacked}</span></span>
      </div>
      <div className="tv-tools">
        <div className="search">
          {ICON.search}
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un patient, une adresse…" />
        </div>
        <div className="chips">
          {[5, 4, 3, 2, 1].map(s => (
            <span key={s} className={'chip sev-' + s + (sevSet.has(s) ? ' on' : '')} onClick={() => toggleSev(s)}>
              <span className="cdot"></span>{SEVMETA[s].label}
            </span>
          ))}
        </div>
        <div className="select">
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="all">Tous types d'alerte</option>
            {ALERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {ICON.caret}
        </div>
        <div className="seg2">
          <button className={scope === 'actives' ? 'on' : ''} onClick={() => setScope('actives')}>Actives</button>
          <button className={scope === 'tous' ? 'on' : ''} onClick={() => setScope('tous')}>Tous</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- the view ---------- */
function TriageView({ variant = 'sobre' }) {
  useStore();
  const [q, setQ] = React.useState('');
  const [sevSet, setSevSet] = React.useState(new Set([5, 4, 3, 2, 1]));
  const [type, setType] = React.useState('all');
  const [scope, setScope] = React.useState('actives');
  const [openId, setOpenId] = React.useState(Store.patients[0] ? Store.patients[0].id : null);

  const toggleSev = s => setSevSet(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });

  let list = Store.patients.slice();
  // sort: severity desc, then chronological (earliest alert first within band), then name
  list.sort((a, b) => b.sev - a.sev || (timeToMin(a.time) - timeToMin(b.time)) || a.nom.localeCompare(b.nom));
  const ql = q.trim().toLowerCase();
  const filtered = list.filter(p => {
    if (!sevSet.has(p.sev)) return false;
    if (type !== 'all' && p.type !== type) return false;
    if (scope === 'actives' && !p.time) return false;
    if (ql && !(`${p.nom} ${p.prenom} ${p.addr} ${p.ville} ${p.type}`.toLowerCase().includes(ql))) return false;
    return true;
  });
  const unacked = Store.patients.filter(p => p.time && p.sev >= 4 && !p.acked).length;
  const Row = ROW[variant];

  const cols = variant === 'sobre'
    ? ['État', 'Patient', 'Adresse', "Type d'alerte", 'Heure', '']
    : ['', 'Patient', 'Adresse', 'Alerte', 'Tendance', 'ACK', ''];

  return (
    <div className={'tv variant-' + variant}>
      <Header {...{ variant, q, setQ, sevSet, toggleSev, type, setType, scope, setScope, unacked, shown: filtered.length }} />
      <div className="tv-body">
        {variant !== 'carte' && (
          <div className="colh" style={{ gridTemplateColumns: variant === 'sobre' ? '130px 1.25fr 1.5fr 1.4fr 78px 100px' : '64px 1.3fr 1.4fr 96px 84px 70px 132px' }}>
            {cols.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
        {filtered.length === 0 && <div className="empty">Aucun patient ne correspond aux filtres.</div>}
        {filtered.map(p => {
          const open = openId === p.id;
          const onToggle = (e) => { if (e) e.stopPropagation(); setOpenId(open ? null : p.id); };
          return (
            <div className={'rowwrap sev-' + p.sev + (open ? ' open' : '')} key={p.id}>
              <Row p={p} open={open} onToggle={onToggle} />
              {open && <DetailPanel p={p} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.TriageView = TriageView;
})();
