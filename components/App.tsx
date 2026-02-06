import { useState, useEffect } from 'react';
import { Message, Webhook } from '../types/types';
import { StorageService } from '../services/storage';
import { WebhookManager } from './WebhookManager';
import { MessageEditor } from './MessageEditor';
import { MessagePreview } from './MessagePreview';
import { BackupsManager } from './BackupsManager';
import { ShareMessage } from './ShareMessage';
import { SettingsModal } from './SettingsModal';
import { SettingsBar } from './SettingsBar';
import '../css/App.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(StorageService.getDefaultMessage());
  const [showBackups, setShowBackups] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Cargar webhooks al montar
  useEffect(() => {
    const loaded = StorageService.loadWebhooks();
    setWebhooks(loaded);
    if (loaded.length > 0 && !selectedWebhookId) {
      setSelectedWebhookId(loaded[0].id);
    }
  }, []);

  // Cargar mensaje compartido desde URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    
    if (shareData) {
      try {
        const decoded = decodeShareUrl(shareData);
        setMessage(decoded);
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error loading shared message:', error);
      }
    }
  }, []);

  const decodeShareUrl = (data: string): Message => {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const decoded = atob(padded);
    const json = decodeURIComponent(
      decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  };

  const handleAddWebhook = (webhook: Webhook) => {
    const updated = [...webhooks, webhook];
    setWebhooks(updated);
    StorageService.saveWebhooks(updated);
    setSelectedWebhookId(webhook.id);
  };

  const handleDeleteWebhook = (id: string) => {
    const updated = webhooks.filter(w => w.id !== id);
    setWebhooks(updated);
    StorageService.saveWebhooks(updated);
    if (selectedWebhookId === id) {
      setSelectedWebhookId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleClearMessage = () => {
    if (window.confirm('¿Limpiar todo el mensaje actual?')) {
      setMessage(StorageService.getDefaultMessage());
    }
  };

  const handleLoadMessage = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const parsed = StorageService.parseMessageJSON(data);
      setMessage(parsed);
    } catch (error) {
      console.error('Load error:', error);
      alert('Error al cargar mensaje desde URL');
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(message, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'message.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedWebhook = webhooks.find(w => w.id === selectedWebhookId);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <SettingsBar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenBackups={() => setShowBackups(true)}
        onOpenShare={() => setShowShare(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="app-container">
        <div className="left-panel">
          <WebhookManager
            webhooks={webhooks}
            selectedId={selectedWebhookId}
            onSelect={setSelectedWebhookId}
            onAdd={handleAddWebhook}
            onDelete={handleDeleteWebhook}
            onReorder={() => {}}
          />

          <MessageEditor
            message={message}
            onChange={setMessage}
            onClear={handleClearMessage}
            onLoadMessage={handleLoadMessage}
            onExportJSON={handleExportJSON}
          />
        </div>

        <div className="right-panel">
          <MessagePreview
            message={message}
            webhook={selectedWebhook}
          />
        </div>
      </div>

      {showBackups && (
        <BackupsManager
          currentMessage={message}
          onLoad={setMessage}
          onClose={() => setShowBackups(false)}
        />
      )}

      {showShare && (
        <ShareMessage
          message={message}
          onClose={() => setShowShare(false)}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;