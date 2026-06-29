import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';

export default function PlaceholderPage({ activePage, onNavigate }) {
  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="app-main">
        <TopMenu />
        <section className="placeholder-page glass-panel">
          <span className="eyebrow">In costruzione</span>
          <h1>{activePage}</h1>
          <p>Questa pagina sarà sviluppata nella prossima fase mantenendo lo stesso stile grafico di AURA.</p>
          <button type="button" className="primary" onClick={() => onNavigate('Home')}>Torna alla Home</button>
        </section>
      </main>
    </div>
  );
}
