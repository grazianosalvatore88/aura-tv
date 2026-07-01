import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';
import { loadAuraDiagnostics } from '../core/auraDiagnostics.js';
import { getXtreamConfig, testXtreamConnection, testXtreamM3u, xtreamM3uRequest, xtreamRequest, explainXtreamFetchError } from '../services/xtreamService.js';
import { countM3uItems, fetchM3uFromUrl, isValidM3uText } from '../services/m3uService.js';
import { buildEpgReportFromM3u, extractEpgUrlFromM3u, extractM3uEpgKeys, fetchEpgFromUrl, loadEpgCache, loadEpgReport, parseXmlTv, saveEpgCache, saveEpgReport } from '../services/epgService.js';

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
    clientMode: 'Auto',
    outputFormat: 'm3u8'
  },
  m3u: {
    playlistUrl: '',
    localName: '',
    localText: '',
    epgUrl: '',
    epgStatus: 'Non caricato'
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
  window.dispatchEvent(new CustomEvent('aura-settings-updated'));
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

function Field({ label, value, type = 'text', placeholder, onChange, className = '' }) {
  return (
    <label className={`settings-field ${className}`.trim()}>
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

function TextAreaField({ label, value, placeholder, onChange }) {
  return (
    <label className="settings-field settings-textarea-field">
      <span>{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={10}
      />
    </label>
  );
}

function FileImportField({ label, onLoad }) {
  return (
    <label className="settings-field file-import-field">
      <span>{label}</span>
      <input
        type="file"
        accept=".m3u,.m3u8,.txt"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          onLoad(text, file.name);
        }}
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


function AuraCoreDiagnosticsCard() {
  let diagnostics = null;
  try {
    diagnostics = loadAuraDiagnostics();
  } catch {
    diagnostics = null;
  }

  if (!diagnostics) {
    return (
      <SettingCard
        eyebrow="AURA Core"
        title="Diagnostica sorgente"
        description="Carica una lista e apri Home o Live TV per generare la diagnostica intelligente."
      >
        <div className="aura-core-diagnostics empty">
          <strong>Nessuna analisi disponibile</strong>
          <span>Il motore AURA Core genererà il report dopo il primo caricamento della sorgente.</span>
        </div>
      </SettingCard>
    );
  }

  const streamCounts = diagnostics.streamCounts || {};
  const compatibility = diagnostics.compatibility || {};

  return (
    <SettingCard
      eyebrow="AURA Core"
      title="Diagnostica sorgente"
      description="Analisi intelligente generata dal motore AURA Core."
    >
      <div className="aura-core-diagnostics">
        <div className="aura-core-score">
          <span>Qualità libreria</span>
          <strong>{diagnostics.healthScore}%</strong>
        </div>
        <div className="settings-mini-grid relaxed">
          <div className="settings-mini-card"><span>Canali caricati</span><strong>{diagnostics.totalChannels}</strong></div>
          <div className="settings-mini-card"><span>Riconosciuti</span><strong>{diagnostics.recognizedChannels}</strong></div>
          <div className="settings-mini-card"><span>Con logo</span><strong>{diagnostics.channelsWithLogo}</strong></div>
          <div className="settings-mini-card"><span>Con EPG</span><strong>{diagnostics.channelsWithEpg}</strong></div>
          <div className="settings-mini-card"><span>HLS</span><strong>{streamCounts.hls || 0}</strong></div>
          <div className="settings-mini-card"><span>DASH</span><strong>{streamCounts.dash || 0}</strong></div>
          <div className="settings-mini-card"><span>Relinker</span><strong>{streamCounts['rai-relinker'] || 0}</strong></div>
          <div className="settings-mini-card"><span>Compatibilità alta</span><strong>{compatibility.alta || 0}</strong></div>
        </div>
      </div>
    </SettingCard>
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
      return Boolean(settings.m3u.playlistUrl || isValidM3uText(settings.m3u.localText));
    }

    if (settings.sourceType === 'M3U locale') {
      return Boolean(isValidM3uText(settings.m3u.localText));
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

  async function importM3uUrl() {
    if (!settings.m3u.playlistUrl) {
      setNotice({ status: 'error', message: 'Inserisci prima un URL M3U.' });
      return;
    }

    try {
      setNotice({ status: 'ok', message: 'Lettura URL M3U in corso...' });
      const m3uText = await fetchM3uFromUrl(settings.m3u.playlistUrl);
      const total = countM3uItems(m3uText);

      updateSettings((current) => ({
        ...current,
        sourceType: 'M3U',
        m3u: {
          ...current.m3u,
          localText: m3uText,
          localName: current.m3u.localName || 'Lista M3U URL',
          epgUrl: current.m3u.epgUrl || extractEpgUrlFromM3u(m3uText)
        },
        connectionStatus: total > 0 ? 'M3U importata' : 'M3U non valida'
      }), true);

      setNotice({
        status: total > 0 ? 'ok' : 'error',
        message: total > 0
          ? `M3U importata: ${total} elementi trovati.`
          : 'La lista M3U non contiene elementi validi.'
      });
    } catch (error) {
      setNotice({ status: 'error', message: error.message || 'Errore import M3U.' });
    }
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

    if (settings.sourceType === 'M3U locale' || settings.sourceType === 'M3U') {
      if (settings.sourceType === 'M3U' && settings.m3u.playlistUrl && !isValidM3uText(settings.m3u.localText)) {
        await importM3uUrl();
        return;
      }

      const total = countM3uItems(settings.m3u.localText || '');
      updateSettings((current) => ({
        ...current,
        connectionStatus: total > 0 ? 'Lista M3U valida' : 'Lista M3U non valida'
      }), true);
      setNotice({
        status: total > 0 ? 'ok' : 'error',
        message: total > 0
          ? `Lista M3U valida: ${total} canali trovati.`
          : 'La lista M3U non contiene canali validi.'
      });
      return;
    }

    if (settings.sourceType !== 'Xtream' && settings.sourceType !== 'Lista con link') {
      updateSettings((current) => ({
        ...current,
        connectionStatus: 'Formato salvato'
      }), true);
      setNotice({ status: 'ok', message: 'Questa sorgente è salvata. Il collegamento reale sarà completato in una fase successiva.' });
      return;
    }

    try {
      setNotice({ status: 'ok', message: 'Test sorgente Xtream in corso...' });
      const result = await testXtreamConnection(getXtreamConfig(settings));

      updateSettings((current) => ({
        ...current,
        xtream: {
          ...current.xtream,
          outputFormat: result.preferredOutput || current.xtream.outputFormat || 'm3u8'
        },
        connectionStatus: result.ok
          ? 'Account attivo'
          : result.code === 'expired'
            ? 'Account scaduto'
            : result.reached
              ? 'Verifica credenziali'
              : 'Errore connessione'
      }), true);

      setNotice({
        status: result.ok ? 'ok' : 'error',
        message: result.message || (result.ok
          ? `Connessione Xtream riuscita. Stato account: ${result.status}.`
          : 'Connessione raggiunta ma credenziali non confermate.')
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
        setNotice({ status: 'error', message: explainXtreamFetchError(fallbackError) || explainXtreamFetchError(error) || 'Errore connessione sorgente.' });
      }
    }
  }

  async function importEpgUrl() {
    const autoUrl = extractEpgUrlFromM3u(settings.m3u.localText || '');
    const epgUrl = String(settings.m3u.epgUrl || autoUrl || '').trim();

    if (!epgUrl) {
      setNotice({ status: 'error', message: 'Inserisci un URL EPG oppure usa una M3U con x-tvg-url.' });
      return;
    }

    try {
      setNotice({ status: 'ok', message: 'Analisi EPG in corso...' });
      const xmlText = await fetchEpgFromUrl(epgUrl);
      const wantedKeys = extractM3uEpgKeys(settings.m3u.localText || '');
      const epg = parseXmlTv(xmlText, wantedKeys);
      const report = buildEpgReportFromM3u(settings.m3u.localText || '', epg);
      const saved = saveEpgCache(epg);
      saveEpgReport(report);

      updateSettings((current) => ({
        ...current,
        m3u: {
          ...current.m3u,
          epgUrl,
          epgStatus: saved
            ? `${report.matchedChannels}/${report.m3uChannels} canali · ${report.savedProgrammes} programmi`
            : 'EPG troppo grande'
        }
      }), true);

      if (saved) window.dispatchEvent(new CustomEvent('aura-epg-updated'));

      setNotice({
        status: saved ? 'ok' : 'error',
        message: saved
          ? `EPG pronta: ${report.matchedChannels}/${report.m3uChannels} canali abbinati, ${report.savedProgrammes} programmi salvati.`
          : 'EPG letta ma troppo grande da salvare.'
      });
    } catch (error) {
      updateSettings((current) => ({
        ...current,
        m3u: {
          ...current.m3u,
          epgStatus: 'Errore EPG'
        }
      }), true);
      setNotice({ status: 'error', message: error.message || 'Errore import EPG.' });
    }
  }

  function loadCachedEpgStatus() {
    const epg = loadEpgCache();
    const report = loadEpgReport();

    if (!epg?.count) {
      setNotice({ status: 'error', message: 'Nessuna EPG salvata.' });
      return;
    }

    if (report) {
      setNotice({
        status: 'ok',
        message: `EPG salvata: ${report.matchedChannels}/${report.m3uChannels} canali, ${report.savedProgrammes} programmi. Mancanti: ${report.missingChannels}.`
      });
      return;
    }

    setNotice({ status: 'ok', message: `EPG salvata: ${epg.count} programmi su ${epg.channelCount || 0} canali.` });
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

    if (settings.sourceType === 'M3U locale' || settings.sourceType === 'M3U') {
      if (settings.sourceType === 'M3U' && settings.m3u.playlistUrl && !isValidM3uText(settings.m3u.localText)) {
        await importM3uUrl();
        return;
      }

      const total = countM3uItems(settings.m3u.localText || '');
      const timestamp = new Date().toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      updateSettings((current) => ({
        ...current,
        connectionStatus: total > 0 ? 'Lista locale aggiornata' : 'Lista locale non valida',
        lastUpdate: timestamp
      }), true);

      setNotice({
        status: total > 0 ? 'ok' : 'error',
        message: total > 0
          ? `Lista locale pronta: ${total} canali disponibili in Live TV.`
          : 'Lista locale non valida.'
      });
      return;
    }

    if (settings.sourceType !== 'Xtream' && settings.sourceType !== 'Lista con link') {
      setNotice({ status: 'error', message: 'Questa sorgente non ha ancora aggiornamento reale.' });
      return;
    }

    try {
      setNotice({ status: 'ok', message: 'Verifica account Xtream in corso...' });
      const account = await testXtreamConnection(getXtreamConfig(settings));

      if (!account.ok) {
        updateSettings((current) => ({
          ...current,
          xtream: {
            ...current.xtream,
            outputFormat: account.preferredOutput || current.xtream.outputFormat || 'm3u8'
          },
          connectionStatus: account.code === 'expired' ? 'Account scaduto' : 'Account non attivo'
        }), true);
        setNotice({ status: 'error', message: account.message || 'Account Xtream non attivo.' });
        return;
      }

      updateSettings((current) => ({
        ...current,
        xtream: {
          ...current.xtream,
          outputFormat: account.preferredOutput || current.xtream.outputFormat || 'm3u8'
        }
      }), true);

      setNotice({ status: 'ok', message: 'Account attivo. Lettura canali in corso...' });
      const streams = await xtreamRequest('get_live_streams', {}, getXtreamConfig({
        ...settings,
        xtream: {
          ...settings.xtream,
          outputFormat: account.preferredOutput || settings.xtream.outputFormat || 'm3u8'
        }
      }));
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
        setNotice({ status: 'ok', message: 'Metodo canali non disponibile. Provo lista M3U...' });
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
        setNotice({ status: 'error', message: explainXtreamFetchError(fallbackError) || explainXtreamFetchError(error) || 'Errore aggiornamento lista.' });
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

  function clearWatchHistory() {
    ['aura-watch-history', 'aura-recent-channels', 'aura-continue-watching'].forEach((key) => localStorage.removeItem(key));
    setNotice({ status: 'ok', message: 'Cronologia cancellata.' });
  }

  function clearFavorites() {
    ['aura-live-favorites', 'aura-movie-favorites', 'aura-series-favorites'].forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new CustomEvent('aura-settings-updated'));
    setNotice({ status: 'ok', message: 'Preferiti cancellati.' });
  }

  function exportBackup() {
    const payload = {
      version: 'AURA TV v3.2.8',
      exportedAt: new Date().toISOString(),
      settings,
      favorites: {
        live: localStorage.getItem('aura-live-favorites'),
        movie: localStorage.getItem('aura-movie-favorites'),
        series: localStorage.getItem('aura-series-favorites')
      },
      epg: localStorage.getItem('aura-epg-report'),
      diagnostics: localStorage.getItem('aura-core-diagnostics')
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aura-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice({ status: 'ok', message: 'Backup esportato.' });
  }

  function clearCache() {
    ['aura-epg-cache', 'aura-epg-report', 'aura-core-diagnostics'].forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new CustomEvent('aura-settings-updated'));
    setNotice({ status: 'ok', message: 'Cache AURA svuotata.' });
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
                    {['M3U', 'Lista con link', 'Xtream', 'Stalker'].map((source) => (
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
                          placeholder="Es. Lista"
                          className="source-name-short"
                          onChange={(value) => updateSourceField('xtream', 'listName', value)}
                        />
                      ) : null}
                      <Field
                        label={settings.sourceType === 'Lista con link' ? 'Link' : 'URL server'}
                        value={settings.xtream.linkUrl || settings.xtream.serverUrl}
                        placeholder="https://server.example.com"
                        className="source-link-long"
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
                      <Field
                        label="Stato connessione"
                        value={settings.connectionStatus}
                        onChange={() => {}}
                      />
                      <Field
                        label="Formato automatico"
                        value={settings.xtream.outputFormat || 'm3u8'}
                        onChange={() => {}}
                      />
                    </div>
                  ) : null}

                  {settings.sourceType === 'M3U locale' ? (
                    <div className="settings-form-grid source-form-spaced single">
                      <Field
                        label="Nome lista"
                        value={settings.m3u.localName || ''}
                        placeholder="Es. Canali test"
                        onChange={(value) => updateSourceField('m3u', 'localName', value)}
                      />
                      <FileImportField
                        label="Carica file M3U"
                        onLoad={(fileText, fileName) => {
                          updateSourceField('m3u', 'localText', fileText);
                          updateSourceField('m3u', 'localName', settings.m3u.localName || fileName);
                          const autoEpg = extractEpgUrlFromM3u(fileText);
                          if (autoEpg) updateSourceField('m3u', 'epgUrl', autoEpg);
                          setNotice({ status: 'ok', message: `File caricato: ${fileName}` });
                        }}
                      />
                      <TextAreaField
                        label="Incolla lista M3U"
                        value={settings.m3u.localText || ''}
                        placeholder="#EXTM3U\n#EXTINF:-1,Nome canale\nhttps://..."
                        onChange={(value) => updateSourceField('m3u', 'localText', value)}
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
                        label="Nome lista"
                        value={settings.m3u.localName || ''}
                        placeholder="Es. Lista"
                        className="source-name-short"
                        onChange={(value) => updateSourceField('m3u', 'localName', value)}
                      />
                      <Field
                        label="Link lista M3U"
                        value={settings.m3u.playlistUrl}
                        placeholder="https://server.example.com/lista.m3u"
                        className="source-link-long"
                        onChange={(value) => updateSourceField('m3u', 'playlistUrl', value)}
                      />
                      <div className="settings-actions inline-actions">
                        <button type="button" className="secondary" onClick={importM3uUrl}>Importa URL M3U</button>
                      </div>
                      <FileImportField
                        label="Carica file M3U"
                        onLoad={(fileText, fileName) => {
                          updateSourceField('m3u', 'localText', fileText);
                          updateSourceField('m3u', 'localName', settings.m3u.localName || fileName);
                          const autoEpg = extractEpgUrlFromM3u(fileText);
                          if (autoEpg) updateSourceField('m3u', 'epgUrl', autoEpg);
                          setNotice({ status: 'ok', message: `File caricato: ${fileName}` });
                        }}
                      />
                      <TextAreaField
                        label="Oppure incolla lista M3U"
                        value={settings.m3u.localText || ''}
                        placeholder="#EXTM3U\n#EXTINF:-1,Nome canale\nhttps://..."
                        onChange={(value) => updateSourceField('m3u', 'localText', value)}
                      />
                      <Field
                        label="URL EPG"
                        value={settings.m3u.epgUrl || ''}
                        placeholder="https://server.example.com/epg.xml"
                        className="source-link-long"
                        onChange={(value) => updateSourceField('m3u', 'epgUrl', value)}
                      />
                      <div className="settings-actions inline-actions">
                        <button type="button" className="secondary" onClick={importEpgUrl}>Analizza EPG</button>
                        <button type="button" className="secondary" onClick={loadCachedEpgStatus}>Riepilogo EPG</button>
                      </div>
                      <Field
                        label="Stato EPG"
                        value={settings.m3u.epgStatus || 'Non caricato'}
                        onChange={() => {}}
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
                </SettingCard>
              </>
            ) : null}

            {activeTab === 'Sorgente TV' ? <AuraCoreDiagnosticsCard /> : null}

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

                <div className="aura-core-mode-note">
                  <strong>Premium non ancora attivo</strong>
                  <span>Lo sblocco definitivo sarà collegato allo store nella fase finale. Nessun tasto fittizio viene mostrato.</span>
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
                  <button type="button" className="secondary" onClick={clearWatchHistory}>Cancella cronologia</button>
                  <button type="button" className="secondary" onClick={clearFavorites}>Cancella preferiti</button>
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
                  <span><strong>Versione</strong>AURA TV v3.2.8</span>
                  <span><strong>Dispositivo</strong>Locale</span>
                  <span><strong>Stato lista</strong>{settings.connectionStatus}</span>
                  <span><strong>Ultimo aggiornamento</strong>{settings.lastUpdate}</span>
                </div>

                <div className="settings-actions danger">
                  <button type="button" className="secondary" onClick={exportBackup}>Esporta backup</button>
                  <button type="button" className="secondary" onClick={clearCache}>Svuota cache</button>
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
