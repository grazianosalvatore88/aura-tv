import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';
import { getXtreamConfig, testXtreamConnection, testXtreamM3u, xtreamM3uRequest, xtreamRequest } from '../services/xtreamService.js';

const settingsTabs = [
  'Sorgente TV',
  'Player',
  'Premium',
  'Privacy',
  'Sistema'
];

const defaultSettings = {
  sourceType: 'Xtream',
  xtream: {
    listName: '',
    serverUrl: '',
    linkUrl: '',
    username: '',
    password: '',
    clientMode: 'Auto'
  },
  m3u: {
    playlistUrl: ''
  },
  stalker: {
    portalUrl: '',
    macAddress: ''
  },
  organizationMode: 'AURA consigliata',
  connectionStatus: 'Non configurata',
  lastSaved: '',
  lastUpdate: 'Mai',
  player: {
    quality: 'Auto',
    fastZapping: true,
    programInfo: true,
    startLastChannel: false
  },
  premium: {
    status: 'Trial attivo',
    daysLeft: 5
  },
  privacy: {
    watchHistory: true,
    localFavorites: true,
    diagnostics: false
  }
};

function safeLoadSettings() {
  try {
    const stored = localStorage.getItem('aura-tv-settings');
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored);
    return {
      ...defaultSettings,
      ...parsed,
      xtream: {
        ...defaultSettings.xtream,
        ...(parsed.xtream || {})
      },
      m3u: {
        ...defaultSettings.m3u,
        ...(parsed.m3u || {})
      },
      stalker: {
        ...defaultSettings.stalker,
        ...(parsed.stalker || {})
      },
      player: {
        ...defaultSettings.player,
        ...(parsed.player || {})
      },
      premium: {
        ...defaultSettings.premium,
        ...(parsed.premium || {})
      },
      privacy: {
        ...defaultSettings.privacy,
        ...(parsed.privacy || {})
      }
    };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(nextSettings) {
  localStorage.setItem('aura-tv-settings', JSON.stringify(nextSettings));
}

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

function Field({ label, value, type = 'text', placeholder, onChange }) {
  return (
    <label className="settings-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ToggleRow({ title, subtitle, active = true, onToggle }) {
  return (
    <button type="button" className="toggle-row interactive" onClick={onToggle}>
      <span>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      <em className={active ? 'toggle-switch active' : 'toggle-switch'} />
    </button>
  );
}

function ChoiceRow({ title, choices, active, onChange }) {
  return (
    <div className="choice-row interactive">
      <span>{title}</span>
      <div>
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            className={choice === active ? 'active' : ''}
            onClick={() => onChange(choice)}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusBanner({ status, message }) {
  if (!message) return null;

  return (
    <div className={status === 'error' ? 'settings-status error' : 'settings-status'}>
      {message}
    </div>
  );
}

export default function Settings({ activePage = 'Impostazioni', onNavigate = () => {} }) {
  const [activeTab, setActiveTab] = useState('Sorgente TV');
  const [settings, setSettings] = useState(defaultSettings);
  const [notice, setNotice] = useState({ status: 'ok', message: '' });

  useEffect(() => {
    setSettings(safeLoadSettings());
  }, []);

  useEffect(() => {
    if (!notice.message) return;
    const timeout = window.setTimeout(() => setNotice({ status: 'ok', message: '' }), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const activeSource = settings.sourceType.toLowerCase();
  const sourceReady = useMemo(() => {
    if (settings.sourceType === 'Xtream' || settings.sourceType === 'Lista con link') {
      return Boolean((settings.xtream.serverUrl || settings.xtream.linkUrl) && settings.xtream.username && settings.xtream.password);
    }

    if (settings.sourceType === 'M3U') {
      return Boolean(settings.m3u.playlistUrl);
    }

    return Boolean(settings.stalker.portalUrl && settings.stalker.macAddress);
  }, [settings]);

  function updateSettings(updater, silent = false) {
    setSettings((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      saveSettings(next);
      return next;
    });

    if (!silent) {
      setNotice({ status: 'ok', message: 'Impostazione aggiornata.' });
    }
  }

  function updateSourceField(section, field, value) {
    updateSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value
      },
      connectionStatus: 'Da testare'
    }), true);
  }

  async function testConnection() {
    if (!sourceReady) {
      setNotice({ status: 'error', message: 'Completa i campi della sorgente prima di testare la connessione.' });
      updateSettings((current) => ({
        ...current,
        connectionStatus: 'Campi mancanti'
      }), true);
      return;
    }

    if (settings.sourceType !== 'Xtream' && settings.sourceType !== 'Lista con link') {
      updateSettings((current) => ({
        ...current,
        connectionStatus: 'Formato salvato'
      }), true);
      setNotice({ status: 'ok', message: 'Per ora il collegamento reale è attivo su Xtream. M3U e Stalker saranno collegati dopo.' });
      return;
    }

    try {
      setNotice({ status: 'ok', message: `Test sorgente in corso · compatibilità ${settings.xtream.clientMode || 'Auto'}...` });
      const result = await testXtreamConnection(getXtreamConfig(settings));

      updateSettings((current) => ({
        ...current,
        connectionStatus: result.ok ? 'Test riuscito' : 'Verifica credenziali'
      }), true);

      setNotice({
        status: result.ok ? 'ok' : 'error',
        message: result.ok
          ? `Connessione Xtream riuscita. Stato account: ${result.status}.`
          : 'Connessione raggiunta ma credenziali non confermate.'
      });
    } catch (error) {
      try {
        setNotice({ status: 'ok', message: 'Metodo principale non disponibile. Provo modalità alternativa...' });
        const m3uOk = await testXtreamM3u(getXtreamConfig(settings));

        updateSettings((current) => ({
          ...current,
          connectionStatus: m3uOk ? 'Fallback M3U riuscito' : 'Errore connessione'
        }), true);

        setNotice({
          status: m3uOk ? 'ok' : 'error',
          message: m3uOk
            ? 'Modalità alternativa riuscita. AURA userà la lista compatibile.'
            : 'Connessione Xtream non riuscita.'
        });
      } catch (fallbackError) {
        updateSettings((current) => ({
          ...current,
          connectionStatus: 'Errore connessione'
        }), true);
        setNotice({ status: 'error', message: fallbackError.message || error.message || 'Errore connessione sorgente.' });
      }
    }
  }

  function saveSource() {
    if (!sourceReady) {
      setNotice({ status: 'error', message: 'Completa i campi richiesti prima di salvare la sorgente.' });
      return;
    }

    const timestamp = new Date().toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    updateSettings((current) => ({
      ...current,
      connectionStatus: 'Salvata',
      lastSaved: timestamp
    }), true);
    setNotice({ status: 'ok', message: 'Sorgente salvata sul dispositivo.' });
  }

  async function updateList() {
    if (!sourceReady) {
      setNotice({ status: 'error', message: 'Inserisci e salva una sorgente prima di aggiornare la lista.' });
      return;
    }

    if (settings.sourceType !== 'Xtream' && settings.sourceType !== 'Lista con link') {
      setNotice({ status: 'error', message: 'Per ora l’aggiornamento reale della lista è attivo su Xtream.' });
      return;
    }

    try {
      setNotice({ status: 'ok', message: 'Lettura canali Xtream in corso...' });
      const streams = await xtreamRequest('get_live_streams', {}, getXtreamConfig(settings));
      const total = Array.isArray(streams) ? streams.length : 0;

      const timestamp = new Date().toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      updateSettings((current) => ({
        ...current,
        connectionStatus: 'Lista aggiornata',
        lastUpdate: timestamp
      }), true);

      setNotice({ status: 'ok', message: `Lista Live TV letta correttamente: ${total} canali trovati.` });
    } catch (error) {
      try {
        setNotice({ status: 'ok', message: 'API canali non disponibile. Provo lista M3U...' });
        const m3uText = await xtreamM3uRequest('mpegts', getXtreamConfig(settings));
        const total = String(m3uText || '').split('#EXTINF').length - 1;

        const timestamp = new Date().toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        updateSettings((current) => ({
          ...current,
          connectionStatus: 'Lista M3U aggiornata',
          lastUpdate: timestamp
        }), true);

        setNotice({ status: 'ok', message: `Fallback M3U riuscito: ${Math.max(total, 0)} elementi trovati.` });
      } catch (fallbackError) {
        updateSettings((current) => ({
          ...current,
          connectionStatus: 'Errore lista'
        }), true);
        setNotice({ status: 'error', message: fallbackError.message || error.message || 'Errore aggiornamento lista.' });
      }
    }
  }

  function clearSource() {
    updateSettings((current) => ({
      ...current,
      xtream: defaultSettings.xtream,
      m3u: defaultSettings.m3u,
      stalker: defaultSettings.stalker,
      connectionStatus: 'Non configurata',
      lastSaved: '',
      lastUpdate: 'Mai'
    }), true);
    setNotice({ status: 'ok', message: 'Sorgente cancellata.' });
  }

  function setSourceType(sourceType) {
    updateSettings((current) => ({
      ...current,
      sourceType,
      connectionStatus: 'Da testare'
    }), true);
  }

  function setOrganizationMode(organizationMode) {
    updateSettings((current) => ({
      ...current,
      organizationMode
    }), true);
  }

  function updatePlayer(field, value) {
    updateSettings((current) => ({
      ...current,
      player: {
        ...current.player,
        [field]: value
      }
    }));
  }

  function updatePrivacy(field, value) {
    updateSettings((current) => ({
      ...current,
      privacy: {
        ...current.privacy,
        [field]: value
      }
    }));
  }

  function resetApp() {
    localStorage.removeItem('aura-tv-settings');
    setSettings(defaultSettings);
    setNotice({ status: 'ok', message: 'Impostazioni ripristinate.' });
  }

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
            <p>Gestisci sorgente TV, player, privacy e licenza AURA.</p>
          </div>
        </header>

        <StatusBanner status={notice.status} message={notice.message} />

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
                  title="Configura lista"
                  description="Inserisci la sorgente che AURA userà per caricare canali, film, serie e sport."
                >
                  <div className="source-type-grid">
                    {['Lista con link', 'Xtream', 'M3U', 'Stalker'].map((source) => (
                      <button
                        key={source}
                        type="button"
                        className={settings.sourceType === source ? 'active' : ''}
                        onClick={() => setSourceType(source)}
                      >
                        {source}
                      </button>
                    ))}
                  </div>

                  {(settings.sourceType === 'Xtream' || settings.sourceType === 'Lista con link') ? (
                    <div className="settings-form-grid source-form-spaced">
                      {settings.sourceType === 'Lista con link' ? (
                        <Field
                          label="Nome lista"
                          value={settings.xtream.listName || ''}
                          placeholder="Es. Lista principale"
                          onChange={(value) => updateSourceField('xtream', 'listName', value)}
                        />
                      ) : null}
                      <Field
                        label={settings.sourceType === 'Lista con link' ? 'Link' : 'URL server'}
                        value={settings.xtream.linkUrl || settings.xtream.serverUrl}
                        placeholder="https://server.example.com"
                        onChange={(value) => {
                          updateSourceField('xtream', 'linkUrl', value);
                          updateSourceField('xtream', 'serverUrl', value);
                        }}
                      />
                      <Field
                        label="Username"
                        value={settings.xtream.username}
                        placeholder="Inserisci username"
                        onChange={(value) => updateSourceField('xtream', 'username', value)}
                      />
                      <Field
                        label="Password"
                        value={settings.xtream.password}
                        type="password"
                        placeholder="Inserisci password"
                        onChange={(value) => updateSourceField('xtream', 'password', value)}
                      />
                      <ChoiceRow
                        title="Compatibilità"
                        choices={['Auto', 'Standard', 'Alta', 'Diretta', 'Web']}
                        active={settings.xtream.clientMode || 'Auto'}
                        onChange={(value) => updateSourceField('xtream', 'clientMode', value)}
                      />
                      <Field
                        label="Stato connessione"
                        value={settings.connectionStatus}
                        onChange={() => {}}
                      />
                    </div>
                  ) : null}

                  {settings.sourceType === 'M3U' ? (
                    <div className="settings-form-grid source-form-spaced single">
                      <Field
                        label="URL lista M3U"
                        value={settings.m3u.playlistUrl}
                        placeholder="https://server.example.com/lista.m3u"
                        onChange={(value) => updateSourceField('m3u', 'playlistUrl', value)}
                      />
                      <Field
                        label="Stato connessione"
                        value={settings.connectionStatus}
                        onChange={() => {}}
                      />
                    </div>
                  ) : null}

                  {settings.sourceType === 'Stalker' ? (
                    <div className="settings-form-grid source-form-spaced">
                      <Field
                        label="Portal URL"
                        value={settings.stalker.portalUrl}
                        placeholder="http://portal.example.com/c"
                        onChange={(value) => updateSourceField('stalker', 'portalUrl', value)}
                      />
                      <Field
                        label="MAC address"
                        value={settings.stalker.macAddress}
                        placeholder="00:1A:79:00:00:00"
                        onChange={(value) => updateSourceField('stalker', 'macAddress', value)}
                      />
                      <Field
                        label="Stato connessione"
                        value={settings.connectionStatus}
                        onChange={() => {}}
                      />
                      <Field
                        label="Ultimo aggiornamento"
                        value={settings.lastUpdate}
                        onChange={() => {}}
                      />
                    </div>
                  ) : null}

                  <div className="settings-actions">
                    <button type="button" className="primary" onClick={testConnection}>Test connessione</button>
                    <button type="button" className="secondary" onClick={saveSource}>Salva sorgente</button>
                    <button type="button" className="secondary" onClick={updateList}>Aggiorna lista</button>
                    <button type="button" className="secondary danger-button" onClick={clearSource}>Cancella sorgente</button>
                  </div>
                </SettingCard>

                <SettingCard
                  eyebrow="Organizzazione"
                  title="Organizzazione AURA"
                  description="Scegli se far ordinare i contenuti ad AURA o mantenere più vicina la struttura originale della lista."
                >
                  <ChoiceRow
                    title="Modalità categorie"
                    choices={['AURA consigliata', 'Originale lista']}
                    active={settings.organizationMode}
                    onChange={setOrganizationMode}
                  />

                  <div className="organization-explanation">
                    {settings.organizationMode === 'AURA consigliata' ? (
                      <p>
                        AURA mostra categorie ordinate e pulite, unisce i doppioni e presenta la lista come una piattaforma TV.
                      </p>
                    ) : (
                      <p>
                        La struttura resta più vicina alla playlist originale: potresti vedere gruppi e nomi meno ordinati.
                      </p>
                    )}
                  </div>

                  <div className="settings-mini-grid relaxed">
                    <ToggleRow title="Unisci qualità duplicate" subtitle="Un solo contenuto con HD, FHD e 4K dietro" active={true} onToggle={() => setNotice({ status: 'ok', message: 'Questa funzione resterà sempre attiva nel motore AURA.' })} />
                    <ToggleRow title="Loghi e metadata" subtitle="Usa loghi, poster, descrizioni e informazioni disponibili" active={true} onToggle={() => setNotice({ status: 'ok', message: 'Questa funzione resterà sempre attiva nel motore AURA.' })} />
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
                <div className="settings-stack">
                  <ChoiceRow
                    title="Qualità preferita"
                    choices={['Auto', '4K', 'FHD', 'HD']}
                    active={settings.player.quality}
                    onChange={(quality) => updatePlayer('quality', quality)}
                  />
                  <ToggleRow
                    title="Zapping rapido"
                    subtitle="Cambio canale veloce con CH+ e CH-"
                    active={settings.player.fastZapping}
                    onToggle={() => updatePlayer('fastZapping', !settings.player.fastZapping)}
                  />
                  <ToggleRow
                    title="Mostra info programma"
                    subtitle="Overlay con titolo, orario e dettagli"
                    active={settings.player.programInfo}
                    onToggle={() => updatePlayer('programInfo', !settings.player.programInfo)}
                  />
                  <ToggleRow
                    title="Avvia ultimo canale"
                    subtitle="Apre l’ultimo canale guardato"
                    active={settings.player.startLastChannel}
                    onToggle={() => updatePlayer('startLastChannel', !settings.player.startLastChannel)}
                  />
                </div>
              </SettingCard>
            ) : null}

            {activeTab === 'Premium' ? (
              <SettingCard
                eyebrow="AURA Premium"
                title="Licenza"
                description="Gestione trial e sblocco definitivo del dispositivo."
              >
                <div className="premium-status-card">
                  <span>{settings.premium.status}</span>
                  <strong>{settings.premium.daysLeft} giorni</strong>
                  <small>Accesso completo a tutte le funzioni durante il periodo di prova.</small>
                </div>

                <div className="settings-actions">
                  <button type="button" className="primary" onClick={() => setNotice({ status: 'ok', message: 'Lo sblocco Premium sarà collegato allo store nella fase finale.' })}>Sblocca AURA Premium</button>
                  <button type="button" className="secondary" onClick={() => setNotice({ status: 'ok', message: 'Ripristino acquisto pronto per il collegamento allo store.' })}>Ripristina acquisto</button>
                </div>
              </SettingCard>
            ) : null}

            {activeTab === 'Privacy' ? (
              <SettingCard
                eyebrow="Privacy"
                title="Dati locali"
                description="Gestione cronologia, preferiti e dati salvati sul dispositivo."
              >
                <div className="settings-stack">
                  <ToggleRow
                    title="Cronologia visione"
                    subtitle="Salva film e serie TV da riprendere"
                    active={settings.privacy.watchHistory}
                    onToggle={() => updatePrivacy('watchHistory', !settings.privacy.watchHistory)}
                  />
                  <ToggleRow
                    title="Preferiti locali"
                    subtitle="Memorizza canali, film e serie salvati"
                    active={settings.privacy.localFavorites}
                    onToggle={() => updatePrivacy('localFavorites', !settings.privacy.localFavorites)}
                  />
                  <ToggleRow
                    title="Diagnostica"
                    subtitle="Invia solo informazioni tecniche anonime"
                    active={settings.privacy.diagnostics}
                    onToggle={() => updatePrivacy('diagnostics', !settings.privacy.diagnostics)}
                  />
                </div>

                <div className="settings-actions danger">
                  <button type="button" className="secondary" onClick={() => setNotice({ status: 'ok', message: 'Cronologia cancellata.' })}>Cancella cronologia</button>
                  <button type="button" className="secondary" onClick={() => setNotice({ status: 'ok', message: 'Preferiti cancellati.' })}>Cancella preferiti</button>
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
                  <span><strong>Versione</strong>AURA TV v2.6</span>
                  <span><strong>Dispositivo</strong>Locale</span>
                  <span><strong>Stato lista</strong>{settings.connectionStatus}</span>
                  <span><strong>Ultimo aggiornamento</strong>{settings.lastUpdate}</span>
                </div>

                <div className="settings-actions danger">
                  <button type="button" className="secondary" onClick={() => setNotice({ status: 'ok', message: 'Backup esportato in modalità demo.' })}>Esporta backup</button>
                  <button type="button" className="secondary" onClick={() => setNotice({ status: 'ok', message: 'Cache svuotata.' })}>Svuota cache</button>
                  <button type="button" className="secondary" onClick={resetApp}>Reset app</button>
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
