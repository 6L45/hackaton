import ControlBar from './components/ControlBar.jsx';
import TriageView from './components/TriageView.jsx';

export default function App() {
  return (
    <>
      <ControlBar />
      <div className="page">
        <div className="tv-shell">
          <TriageView />
        </div>
      </div>
    </>
  );
}
