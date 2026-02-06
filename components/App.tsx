import { useState, useEffect } from 'react';
import { WebhookManager } from './WebhookManager';
import { MessageEditor } from './MessageEditor';
import { MessagePreview } from './MessagePreview';
import { SettingsBar } from './SettingsBar';
import { Webhook, Message } from '../types/types';
import { StorageService } from '../services/storage';
import '../css/App.css';

function App() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState<Message>(StorageService.getDefaultMessage());
  const [darkMode, setDarkMode] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = StorageService.loadWebhooks();
    setWebhooks(stored);
    if (stored.length > 0 && !selectedWebhookId) {
      setSelectedWebhookId(stored[0].id);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (webhooks.length > 0) {
      StorageService.saveWebhooks(webhooks);
    }
  }, [webhooks]);

  const selectedWebhook = webhooks.find(w => w.id === selectedWebhookId);

  const handleWebhookSelect = (id: string) => {
    setSelectedWebhookId(id);
  };

  const handleAddWebhook = (webhook: Webhook) => {
    setWebhooks(prev => [...prev, webhook]);
    setSelectedWebhookId(webhook.id);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    if (selectedWebhookId === id) {
      const remaining = webhooks.filter(w => w.id !== id);
      setSelectedWebhookId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleReorderWebhooks = (startIndex: number, endIndex: number) => {
    setWebhooks(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que quieres borrar todas las opciones del mensaje actual?')) {
      setCurrentMessage(StorageService.getDefaultMessage());
    }
  };

  const handleLoadMessage = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch message');
      const data = await response.json();
      setCurrentMessage(StorageService.parseMessageJSON(data));
    } catch (error) {
      console.error('Error loading message:', error);
      alert('Error al cargar el mensaje. Verifica la URL.');
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(currentMessage, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discord-message-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <SettingsBar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      
      <div className="app-container">
        <div className="left-panel">
          <WebhookManager
            webhooks={webhooks}
            selectedId={selectedWebhookId}
            onSelect={handleWebhookSelect}
            onAdd={handleAddWebhook}
            onDelete={handleDeleteWebhook}
            onReorder={handleReorderWebhooks}
          />

          <MessageEditor
            message={currentMessage}
            onChange={setCurrentMessage}
            onClear={handleClearAll}
            onLoadMessage={handleLoadMessage}
            onExportJSON={handleExportJSON}
          />
        </div>

        <div className="right-panel">
          <MessagePreview
            message={currentMessage}
            webhook={selectedWebhook}
          />
        </div>
      </div>
    </div>
  );
}

export default App;