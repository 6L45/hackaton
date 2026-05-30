import { useEffect, useState } from 'react';
import { TriageStore } from '../store.js';

export default function DetailPanel({ p }) {
  const treating = p.status === 'treating';
  const [confirming, setConfirming] = useState(false);
  useEffect(() => { setConfirming(false); }, [treating]);
  const stop = (e) => e.stopPropagation();

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
            <>
              <span className="confirm-q">Une équipe est déjà en route. Confirmer un nouvel envoi ?</span>
              <button className="btn danger" onClick={(e) => { stop(e); TriageStore.dispatch(p.id, { force: true }); setConfirming(false); }}>Confirmer l'envoi</button>
              <button className="btn" onClick={(e) => { stop(e); setConfirming(false); }}>Annuler</button>
            </>
          ) : (
            <>
              <button
                className={treating ? 'btn muted' : 'btn primary'}
                onClick={(e) => { stop(e); if (treating) { setConfirming(true); } else { TriageStore.dispatch(p.id); TriageStore.setStatus(p.id, 'treating'); } }}>
                Envoyer une équipe
              </button>
              <button className="btn" onClick={stop}>Appeler le patient</button>
              {treating ? (
                <button className="btn done" onClick={(e) => { stop(e); TriageStore.setStatus(p.id, 'open'); }}>✓ Traité</button>
              ) : (
                <button className="btn" onClick={(e) => { stop(e); TriageStore.setStatus(p.id, 'treating'); }}>Marquer comme traité</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
