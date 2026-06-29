import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';

const settingsTabs = [
  'Sorgente TV',
  'Player',
  'Aspetto',
  'Premium',
  'Privacy',
  'Sistema'
];

function SettingCard({ eyebrow, title, description, children }) {
  return (
    <section className="settings-card glass-panel">
      <div className="settings-card-head">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, type = 'text', placeholder }) {
  return (
    <label className="settings-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} readOnly />
    </label>
  );
}

function ToggleRow({ title, subtitle, active = true }) {
  return (
    <button type="button" className="toggle-row">
      <span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      <em className={active ? 'toggle-switch active' : 'toggle-switch'} />
    </button>
  );
}

function ChoiceRow({ title, choices, active }) {
  return (
    <div className="choice-row">
      <span>{title}</span>
      <div>
        {choices.map((choice) => (
          <button key={choice} type="button" className={choice === active ? 'active' : ''}>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Settings({ activePage = 'Impostazioni', onNavigate = () => {} }) {
  const [activeTab, setActiveTab] = useState('Sorgente TV');

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main settings-page clean-library-page">
        <TopMenu
          onNavigate={onNavigate}
          placeholder="Cerca nelle impostazioni..."
        />

        <header className="clean-page-header settings-header">
          <div>
            <span className="eyebrow">Configurazione dispositivo</span>
            <h1>Impostazioni</h1>
            <p>Gestisci sorgente TV, player, aspetto, privacy e licenza AURA.</p>
          </div>
        </header>

        <div className="settings-layout">
          <aside className="settings-tabs glass-panel">
            {settingsTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </aside>

          <div className="settings-content">
            {activeTab === 'Sorgente TV' ? (
              <>
                <SettingCard
                  eyebrow="Sorgente TV"
                  title="Importa lista IPTV"
                  description="Configura la sorgente che AURA userà per organizzare canali, film, serie e sport."
                >
                  <div className="source-type-grid">
                    <button type="button" className="active">Xtream</button>
                    <button type="button">M3U</button>
                    <button type="button">Stalker</button>
                  </div>

                  <div className="settings-form-grid">
                    <Field label="URL server" value="" placeholder="https://server.example.com" />
                    <Field label="Username" value="" placeholder="Inserisci username" />
                    <Field label="Password" value="" type="password" placeholder="Inserisci password" />
                    <Field label="Stato connessione" value="Non configurata" />
                  </div>

                  <div className="settings-actions">
                    <button type="button" className="primary">Test connessione</button>
                    <button type="button" className="secondary">Salva sorgente</button>
                    <button type="button" className="secondary">Aggiorna lista</button>
                  </div>
                </SettingCard>

                <SettingCard
                  eyebrow="Motore AURA"
                  title="Organizzazione contenuti"
                  description="Dopo l’importazione, AURA riordina automaticamente canali, film, serie TV e sport."
                >
                  <div className="settings-mini-grid">
                    <ToggleRow title="Unisci qualità duplicate" subtitle="Un solo contenuto con HD, FHD e 4K dietro" />
                    <ToggleRow title="Categorie pulite" subtitle="Nasconde gruppi disordinati della lista originale" />
                    <ToggleRow title="Loghi e metadata" subtitle="Usa loghi, poster, descrizioni e informazioni disponibili" />
                  </div>
                </SettingCard>
              </>
            ) : null}

            {activeTab === 'Player' ? (
              <SettingCard
                eyebrow="Player"
                title="Riproduzione"
                description="Preferenze generali per qualità, zapping e overlay."
              >
                <ChoiceRow title="Qualità preferita" choices={['Auto', '4K', 'FHD', 'HD']} active="Auto" />
                <ToggleRow title="Zapping rapido" subtitle="Cambio canale veloce con CH+ e CH-" />
                <ToggleRow title="Mostra info programma" subtitle="Overlay con titolo, orario e dettagli" />
                <ToggleRow title="Avvia ultimo canale" subtitle="Apre l’ultimo canale guardato" active={false} />
              </SettingCard>
            ) : null}

            {activeTab === 'Aspetto' ? (
              <SettingCard
                eyebrow="Aspetto"
                title="Interfaccia"
                description="Personalizza resa grafica e modalità TV."
              >
                <ChoiceRow title="Tema" choices={['Scuro', 'Automatico']} active="Scuro" />
                <ChoiceRow title="Effetti grafici" choices={['Ridotti', 'Normali', 'Alti']} active="Alti" />
                <ChoiceRow title="Modalità TV" choices={['Compatta', 'Cinematica']} active="Cinematica" />
                <ToggleRow title="Animazioni fluide" subtitle="Transizioni e hover premium" />
              </SettingCard>
            ) : null}

            {activeTab === 'Premium' ? (
              <SettingCard
                eyebrow="AURA Premium"
                title="Licenza"
                description="Gestione trial e sblocco definitivo del dispositivo."
              >
                <div className="premium-status-card">
                  <span>Trial attivo</span>
                  <strong>5 giorni</strong>
                  <small>Accesso completo a tutte le funzioni durante il periodo di prova.</small>
                </div>

                <div className="settings-actions">
                  <button type="button" className="primary">Sblocca AURA Premium</button>
                  <button type="button" className="secondary">Ripristina acquisto</button>
                </div>
              </SettingCard>
            ) : null}

            {activeTab === 'Privacy' ? (
              <SettingCard
                eyebrow="Privacy"
                title="Dati locali"
                description="Gestione cronologia, preferiti e dati salvati sul dispositivo."
              >
                <ToggleRow title="Cronologia visione" subtitle="Salva film e serie TV da riprendere" />
                <ToggleRow title="Preferiti locali" subtitle="Memorizza canali, film e serie salvati" />
                <ToggleRow title="Diagnostica" subtitle="Invia solo informazioni tecniche anonime" active={false} />

                <div className="settings-actions danger">
                  <button type="button" className="secondary">Cancella cronologia</button>
                  <button type="button" className="secondary">Cancella preferiti</button>
                </div>
              </SettingCard>
            ) : null}

            {activeTab === 'Sistema' ? (
              <SettingCard
                eyebrow="Sistema"
                title="Backup e reset"
                description="Gestione dati, cache e informazioni dispositivo."
              >
                <div className="device-info-grid">
                  <span><strong>Versione</strong>AURA TV v2.5</span>
                  <span><strong>Dispositivo</strong>Locale</span>
                  <span><strong>Stato lista</strong>Non configurata</span>
                  <span><strong>Ultimo aggiornamento</strong>Mai</span>
                </div>

                <div className="settings-actions danger">
                  <button type="button" className="secondary">Esporta backup</button>
                  <button type="button" className="secondary">Svuota cache</button>
                  <button type="button" className="secondary">Reset app</button>
                </div>
              </SettingCard>
            ) : null}
          </div>
        </div>

        <RemoteLegend
          commands={[
            { key: 'OK', label: 'Modifica' },
            { key: 'BACK', label: 'Indietro' },
            { key: 'rosso', color: 'red', label: 'Reset' },
            { key: 'verde', color: 'green', label: 'Salva' },
            { key: 'giallo', color: 'yellow', label: 'Test connessione' },
            { key: 'blu', color: 'blue', label: 'Info' }
          ]}
        />
      </main>
    </div>
  );
}
