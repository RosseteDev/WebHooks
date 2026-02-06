import { useState } from 'react';
import { Webhook } from '../types/types';
import { StorageService } from '../services/storage';
import '../css/WebhookManager.css';

interface Props {
  webhooks: Webhook[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (webhook: Webhook) => void;
  onDelete: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export function WebhookManager({ webhooks, selectedId, onSelect, onAdd, onDelete }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWebhookInfo = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return {
        name: data.name || 'Webhook',
        avatarUrl: data.avatar 
          ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
          : undefined
      };
    } catch (error) {
      console.warn('No se pudo obtener info del webhook, usando valores por defecto:', error);
      return { name: 'Webhook', avatarUrl: undefined };
    }
  };

  const handleUrlChange = async (url: string) => {
    setNewWebhookUrl(url);
    
    if (StorageService.isValidWebhookUrl(url)) {
      setLoading(true);
      try {
        const info = await fetchWebhookInfo(url);
        if (!newWebhookName.trim()) {
          setNewWebhookName(info.name);
        }
        // El avatarUrl se guardará al crear el webhook
      } catch (error) {
        console.error('Error fetching webhook info:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdd = async () => {
    setError('');
    
    if (!StorageService.isValidWebhookUrl(newWebhookUrl)) {
      setError('URL de webhook inválida. Debe ser de Discord.');
      return;
    }

    setLoading(true);
    try {
      // Obtener información del webhook
      const info = await fetchWebhookInfo(newWebhookUrl);
      
      const webhook: Webhook = {
        id: StorageService.generateId(),
        name: newWebhookName.trim() || info.name,
        url: newWebhookUrl.trim(),
        avatarUrl: info.avatarUrl,
        createdAt: Date.now()
      };

      onAdd(webhook);
      setNewWebhookName('');
      setNewWebhookUrl('');
      setShowAddModal(false);
    } catch (error) {
      setError('Error al obtener información del webhook');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDragStart = () => {
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    // Implementar si es necesario
  };

  return (
    <div className="webhook-manager">
      <div className="webhook-header">
        <h3>Webhooks</h3>
        <button 
          className="btn-add" 
          onClick={() => setShowAddModal(true)}
          title="Agregar webhook"
        >
          +
        </button>
      </div>

      <div className="webhook-grid">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className={`webhook-card ${selectedId === webhook.id ? 'selected' : ''}`}
            draggable
            onDragStart={() => handleDragStart()}
            onDragOver={(e) => handleDragOver(e)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(webhook.id)}
          >
            <div className="webhook-avatar">
              {webhook.avatarUrl ? (
                <img src={webhook.avatarUrl} alt={webhook.name} />
              ) : (
                <div className="avatar-placeholder">{webhook.name[0]?.toUpperCase()}</div>
              )}
            </div>
            <div className="webhook-name">{webhook.name}</div>
            <button
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`¿Eliminar webhook "${webhook.name}"?`)) {
                  onDelete(webhook.id);
                }
              }}
              title="Eliminar"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar Webhook</h3>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>URL del Webhook *</label>
              <input
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={newWebhookUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={loading}
              />
              <div className="hint">
                La URL debe ser de Discord. El nombre se obtendrá automáticamente.
              </div>
            </div>
            
            <div className="form-group">
              <label>Nombre Personalizado (opcional)</label>
              <input
                type="text"
                placeholder="Dejar vacío para usar el nombre del webhook"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                maxLength={80}
                disabled={loading}
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)} disabled={loading}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAdd}
                disabled={loading || !newWebhookUrl.trim()}
              >
                {loading ? 'Cargando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}