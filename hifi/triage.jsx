/* =========================================================================
   triage.jsx — single "Sobre clinique" triage table (chosen direction).
   Exposes window.TriageView + window.TriageStore.
   Status model:  patient.status = 'open' (à traiter) | 'treating' (en cours)
   Backend plug points marked « ⟵ backend ».
   ========================================================================= */
(function () {
const { PATIENTS, SEVMETA, timeToMin, relTime, NOW_MIN } = window.TRIAGE_DATA;

/* ---------- global store ---------- */
const Store = {
  patients: PATIENTS.map(p => ({ ...p, status: p.acked ? 'treating' : 'open' })),
  nowMin: NOW_MIN,
  listeners: new Set(),
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { this.listeners.forEach(fn => fn()); },
  setStatus(id, status) { const p = this.patients.find(x => x.id === id); if (p) { p.status = status; this.emit(); } },
  _seq: 100,
  _pool: [
    { nom: 'Lambert', prenom: 'Yves', addr: '9 rue Sully', ville: 'Lyon 6e', type: 'Chute détectée', trig: 'Accéléromètre' },
    { nom: 'Caron', prenom: 'Nadia', addr: '14 rue Bossuet', ville: 'Lyon 6e', type: 'SpO₂ basse', trig: 'SpO₂' },
    { nom: 'Roux', prenom: 'Denis', addr: "5 rue d'Alsace", ville: 'Villeurbanne', type: 'Bradycardie', trig: 'Fréq. cardiaque' },
  ],
  injectAlert() {
    this.nowMin += 3;
    const t = this.nowMin;
    const tpl = this._pool[this._seq % this._pool.length];
    const id = ++this._seq;
    const hh = String(Math.floor(t / 60)).padStart(2, '0'), mm = String(t % 60).padStart(2, '0');
    this.patients.unshift({
      id, ...tpl, sev: 5, time: `${hh}:${mm}`, status: 'open', isnew: true, trigVital: tpl.trig,
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

const ICON = {
  search: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5" /><path d="M14 14l-3.2-3.2" strokeLinecap="round" /></svg>,
  chev: <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2l4 4-4 4" /></svg>,
};

const isTodo = p => p.time && p.sev >= 4 && p.status === 'open';

/* ---------- detail panel ---------- */
function DetailPanel({ p }) {
  const treating = p.status === 'treating';
  const [confirming, setConfirming] = React.useState(false);
  React.useEffect(() => { setConfirming(false); }, [treating]);
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
          {confirming ? (
            <React.Fragment>
              <span className="confirm-q">Une équipe est déjà en route. Confirmer un nouvel envoi ?</span>
              <button className="btn danger" onClick={stop}>Confirmer l'envoi</button>
              <button className="btn" onClick={(e) => { stop(e); setConfirming(false); }}>Annuler</button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <button className={treating ? 'btn muted' : 'btn primary'}
                onClick={(e) => { stop(e); if (treating) setConfirming(true); }}>
                Envoyer une équipe
              </button>
              <button className="btn" onClick={stop}>Appeler le patient</button>
              {treating ? (
                <button className="btn done" onClick={(e) => { stop(e); Store.setStatus(p.id, 'open'); }}>✓ Traité</button>
              ) : (
                <button className="btn" onClick={(e) => { stop(e); Store.setStatus(p.id, 'treating'); }}>Marquer comme traité</button>
              )}
              <span className="ahint">actions ⟵ backend</span>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- row ---------- */
function Row({ p, open, hl, onToggle }) {
  const treating = p.status === 'treating';
  const cls = ['row', 'sev-' + p.sev];
  if (open) cls.push('open');
  if (treating) cls.push('treating');
  if (hl) cls.push('hl');
  if (p.isnew) cls.push('isnew');
  return (
    <div className={cls.join(' ')} onClick={onToggle}>
      <span className="cell-state">
        <span className="sdot"></span>
        <span className="slabel">{SEVMETA[p.sev].label}</span>
        {treating && <span className="treat-chip">en cours</span>}
      </span>
      <span className="cell-id"><span className="name">{p.nom}</span> <span className="given">{p.prenom}</span></span>
      <span className="addr">{p.addr}, {p.ville}</span>
      <span>
        {p.time ? (
          <span className="alertpill"><span className="pdot"></span>{p.type}<span className="ptime">· {relTime(p.time)}</span></span>
        ) : (
          <span className="alertpill none"><span className="pdot"></span>Aucune alerte</span>
        )}
      </span>
      <span className="cell-act"><button className="det-btn" onClick={onToggle}>Détails <span className="chev">{ICON.chev}</span></button></span>
    </div>
  );
}

/* ---------- header ---------- */
function Header({ q, setQ, filter, setFilter, todoN, focusTodo, onCounter }) {
  const [clock, setClock] = React.useState('');
  React.useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  const seg = (val, label) => (
    <button className={filter === val ? 'on' : ''} onClick={() => setFilter(val)}>{label}</button>
  );
  return (
    <div className="tv-head">
      <div className="row1">
        <span className="tv-title"><span className="crumb">Triage · </span>File d'attente</span>
        <span className="live mono"><span className="blip"></span>{clock}</span>
        <button className={'counter' + (focusTodo ? ' active' : '')} onClick={onCounter}
          title="Afficher les patients à traiter">
          À traiter <span className="badge">{todoN}</span>
        </button>
      </div>
      <div className="tv-tools">
        <div className="search">
          {ICON.search}
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un patient, une adresse…" />
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

/* ---------- view ---------- */
function TriageView() {
  useStore();
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('tous');
  const [focusTodo, setFocusTodo] = React.useState(false);
  const [openId, setOpenId] = React.useState(Store.patients[0] ? Store.patients[0].id : null);

  const onCounter = () => {
    const on = !focusTodo;
    setFocusTodo(on);
    setFilter(on ? 'todo' : 'tous');
  };
  const setFilterManual = (v) => { setFilter(v); setFocusTodo(false); };

  let list = Store.patients.slice();
  list.sort((a, b) => b.sev - a.sev || (timeToMin(a.time) - timeToMin(b.time)) || a.nom.localeCompare(b.nom));
  const ql = q.trim().toLowerCase();
  const filtered = list.filter(p => {
    if (filter === 'todo' && !isTodo(p)) return false;
    if (filter === 'treating' && p.status !== 'treating') return false;
    if (ql && !(`${p.nom} ${p.prenom} ${p.addr} ${p.ville} ${p.type}`.toLowerCase().includes(ql))) return false;
    return true;
  });
  const todoN = Store.patients.filter(isTodo).length;

  return (
    <div className="tv variant-sobre">
      <Header {...{ q, setQ, filter, setFilter: setFilterManual, todoN, focusTodo, onCounter }} />
      <div className="tv-body">
        <div className="colh">
          <span>État</span><span>Patient</span><span>Adresse</span><span>Type d'alerte</span><span></span>
        </div>
        {filtered.length === 0 && <div className="empty">Aucun patient dans cette vue.</div>}
        {filtered.map(p => {
          const open = openId === p.id;
          const onToggle = (e) => { if (e) e.stopPropagation(); setOpenId(open ? null : p.id); };
          return (
            <div className={'rowwrap sev-' + p.sev + (p.status === 'treating' ? ' treating' : '') + (open ? ' open' : '')} key={p.id}>
              <Row p={p} open={open} hl={focusTodo && isTodo(p)} onToggle={onToggle} />
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
