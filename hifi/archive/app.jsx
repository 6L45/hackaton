/* =========================================================================
   app.jsx — mounts the 3 directions side-by-side on the design canvas, plus
   a global control bar (theme switch + "simulate incoming alert").
   ========================================================================= */
const { useState, useEffect } = React;

function ControlBar() {
  const [theme, setTheme] = useState('light');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const [pulse, setPulse] = useState(false);

  const wrap = {
    position: 'fixed', top: 14, right: 16, zIndex: 9000,
    display: 'flex', alignItems: 'center', gap: 8,
    background: theme === 'dark' ? '#1b2029' : '#ffffff',
    border: '1px solid ' + (theme === 'dark' ? '#333b48' : '#d6dbe2'),
    borderRadius: 12, padding: '7px 9px',
    boxShadow: '0 6px 24px rgba(20,28,50,.16)',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    color: theme === 'dark' ? '#e9ecf2' : '#1b2130',
  };
  const seg = { display: 'flex', background: theme === 'dark' ? '#0f1219' : '#f0f2f6', borderRadius: 9, padding: 3 };
  const segBtn = (on) => ({
    border: 'none', cursor: 'pointer', borderRadius: 7, padding: '6px 11px',
    fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: 6,
    background: on ? (theme === 'dark' ? '#1b2029' : '#fff') : 'transparent',
    color: on ? (theme === 'dark' ? '#e9ecf2' : '#1b2130') : (theme === 'dark' ? '#9aa3b3' : '#586073'),
    boxShadow: on ? '0 1px 2px rgba(20,28,50,.12)' : 'none',
  });
  const sim = {
    border: 'none', cursor: 'pointer', borderRadius: 9, padding: '8px 13px',
    fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
    background: '#5b3fd6', color: '#fff', display: 'flex', alignItems: 'center', gap: 7,
    boxShadow: pulse ? '0 0 0 4px rgba(91,63,214,.25)' : 'none', transition: 'box-shadow .2s',
  };
  return (
    <div style={wrap}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: .3, color: theme === 'dark' ? '#646d7e' : '#98a0ad', fontFamily: "'IBM Plex Mono', monospace", padding: '0 4px' }}>THÈME</span>
      <div style={seg}>
        <button style={segBtn(theme === 'light')} onClick={() => setTheme('light')}>☀ Clair</button>
        <button style={segBtn(theme === 'dark')} onClick={() => setTheme('dark')}>☾ Sombre</button>
      </div>
      <button style={sim} onClick={() => { window.TriageStore.injectAlert(); setPulse(true); setTimeout(() => setPulse(false), 600); }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>＋</span> Simuler une alerte
      </button>
    </div>
  );
}

const { DesignCanvas, DCSection, DCArtboard } = window;

function App() {
  return (
    <React.Fragment>
      <ControlBar />
      <DesignCanvas>
        <DCSection id="triage" title="Triage patients — hi-fi"
          subtitle="3 directions · même moteur, mêmes données · accent violet, clair/sombre · rouges en tête par ordre chrono">
          <DCArtboard id="sobre" label="A · Sobre clinique" width={1080} height={1200} style={{ background: 'var(--surface)' }}>
            <TriageView variant="sobre" />
          </DCArtboard>
          <DCArtboard id="cockpit" label="B · Cockpit (dense)" width={1080} height={1240} style={{ background: 'var(--surface2)' }}>
            <TriageView variant="cockpit" />
          </DCArtboard>
          <DCArtboard id="carte" label="C · Carte patient (aéré)" width={1080} height={1420} style={{ background: 'var(--surface)' }}>
            <TriageView variant="carte" />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
