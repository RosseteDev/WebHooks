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
        alert('Error al cargar el mensaje compartido. El enlace puede estar corrupto.');
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

  // Función para extraer el message ID de una URL de Discord
  const extractMessageIdFromDiscordUrl = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      
      // Verificar si es una URL de Discord
      if (!parsed.hostname.includes('discord.com') && !parsed.hostname.includes('discordapp.com')) {
        return null;
      }

      // Formato: https://discord.com/channels/GUILD_ID/CHANNEL_ID/MESSAGE_ID
      const pathParts = parsed.pathname.split('/').filter(p => p);
      
      if (pathParts[0] === 'channels' && pathParts.length === 4) {
        const messageId = pathParts[3];
        return messageId;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const handleLoadMessage = async (url: string) => {
    // Verificar si es una URL de Discord
    const messageId = extractMessageIdFromDiscordUrl(url);
    
    if (messageId) {
      // Es una URL de Discord - necesitamos un webhook seleccionado
      if (!selectedWebhook) {
        alert('Para cargar mensajes de Discord, primero selecciona el webhook que envió el mensaje.');
        return;
      }
      
      // Confirmar con el usuario
      const confirmed = window.confirm(
        'Cargar mensaje de Discord eliminará todo el contenido actual del editor. ¿Continuar?'
      );
      
      if (!confirmed) {
        return;
      }
      
      try {
        // Construir URL del webhook + message ID
        const webhookUrl = selectedWebhook.url;
        const fetchUrl = `${webhookUrl}/messages/${messageId}`;
        
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Mensaje no encontrado. Verifica que:\n1. El mensaje exista\n2. Fue enviado por el webhook seleccionado\n3. El ID del mensaje sea correcto');
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('Este mensaje no fue enviado por el webhook seleccionado, o el webhook ya no tiene acceso.');
          } else {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        const parsed = StorageService.parseMessageJSON(data);
        setMessage(parsed);
        
      } catch (error) {
        console.error('Load error:', error);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          alert('Error de red. Verifica tu conexión a internet.');
        } else if (error instanceof Error) {
          alert(error.message);
        } else {
          alert('Error al cargar mensaje desde Discord.');
        }
      }
      
      return;
    }
    
    // No es una URL de Discord, intentar cargar como URL normal de JSON
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Recurso no encontrado. Verifica que la URL sea correcta.');
        } else if (response.status === 403 || response.status === 401) {
          throw new Error('No tienes permisos para acceder a este recurso.');
        } else {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      const parsed = StorageService.parseMessageJSON(data);
      setMessage(parsed);
      
    } catch (error) {
      console.error('Load error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Error de red. Verifica tu conexión a internet.');
      } else if (error instanceof SyntaxError) {
        alert('El contenido descargado no es un JSON válido.');
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al cargar mensaje desde URL. Verifica que la URL sea válida.');
      }
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