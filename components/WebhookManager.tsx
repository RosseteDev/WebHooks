import { useState } from 'react';
import { Webhook } from '../types/types';
import { StorageService } from '../services/storage';
import { WebhookContextMenu } from '../components/WebhookContextMenu';
import '../css/WebhookManager.css';

interface Props {
  webhooks: Webhook[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (webhook: Webhook) => void;
  onDelete: (id: string) => void;
  onReorder: (webhooks: Webhook[]) => void;
}

const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Projects', 'Testing'];
const WEBHOOK_COLORS = ['#5865F2', '#57F287', '#FEE75C', '#ED4245', '#EB459E', '#F26522'];

export function WebhookManager({ webhooks, selectedId, onSelect, onAdd, onDelete, onReorder }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuWebhook, setContextMenuWebhook] = useState<Webhook | null>(null);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookCategory, setNewWebhookCategory] = useState('');
  const [newWebhookColor, setNewWebhookColor] = useState(WEBHOOK_COLORS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const categories = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...webhooks.map(w => w.category).filter(Boolean)
  ])) as string[];

  const fetchWebhookInfo = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        name: data.name || 'Webhook',
        avatarUrl: data.avatar 
          ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
          : undefined
      };
    } catch (error) {
      console.warn('No se pudo obtener info del webhook:', error);
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
      const info = await fetchWebhookInfo(newWebhookUrl);
      
      const webhook: Webhook = {
        id: StorageService.generateId(),
        name: newWebhookName.trim() || info.name,
        url: newWebhookUrl.trim(),
        avatarUrl: info.avatarUrl,
        createdAt: Date.now(),
        category: newWebhookCategory || undefined,
        color: newWebhookColor,
        isFavorite: false
      };

      onAdd(webhook);
      setNewWebhookName('');
      setNewWebhookUrl('');
      setNewWebhookCategory('');
      setNewWebhookColor(WEBHOOK_COLORS[0]);
      setShowAddModal(false);
    } catch (error) {
      setError('Error al obtener información del webhook');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (webhook: Webhook) => {
    const updated = webhooks.map(w => 
      w.id === webhook.id 
        ? { ...w, isFavorite: !w.isFavorite }
        : w
    );
    StorageService.saveWebhooks(updated);
    onReorder(updated);
  };

  const handleChangeCategory = (webhook: Webhook, category: string) => {
    const updated = webhooks.map(w => 
      w.id === webhook.id 
        ? { ...w, category: category || undefined }
        : w
    );
    StorageService.saveWebhooks(updated);
    onReorder(updated);
  };

  const handleChangeColor = (webhook: Webhook, color: string) => {
    const updated = webhooks.map(w => 
      w.id === webhook.id 
        ? { ...w, color }
        : w
    );
    StorageService.saveWebhooks(updated);
    onReorder(updated);
  };

  const handleDeleteWebhook = (webhook: Webhook) => {
    if (window.confirm(`¿Eliminar webhook "${webhook.name}"?`)) {
      onDelete(webhook.id);
      setShowContextMenu(false);
    }
  };

  const handleOpenContextMenu = (webhook: Webhook, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuWebhook(webhook);
    setShowContextMenu(true);
  };

  // Drag & Drop handlers
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragEnter = (id: string) => {
    if (draggedItem && draggedItem !== id) {
      setDragOverItem(id);
    }
  };

  const handleDragEnd = () => {
    if (draggedItem && dragOverItem) {
      const draggedIndex = webhooks.findIndex(w => w.id === draggedItem);
      const targetIndex = webhooks.findIndex(w => w.id === dragOverItem);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newWebhooks = [...webhooks];
        const [removed] = newWebhooks.splice(draggedIndex, 1);
        newWebhooks.splice(targetIndex, 0, removed);
        
        StorageService.saveWebhooks(newWebhooks);
        onReorder(newWebhooks);
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Filtrado de webhooks
  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesSearch = webhook.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || webhook.category === filterCategory;
    const matchesFavorite = !showFavoritesOnly || webhook.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const sortedWebhooks = [...filteredWebhooks].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  return (
    <div className="webhook-manager">
      <div className="webhook-header">
        <h3>Webhooks</h3>
        <div className="header-actions">
          <button 
            className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista cuadrícula"
          >
            ⊞
          </button>
          <button 
            className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Vista lista"
          >
            ☰
          </button>
          <button 
            className="btn-add" 
            onClick={() => setShowAddModal(true)}
            title="Agregar webhook"
          >
            +
          </button>
        </div>
      </div>

      <div className="webhook-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar webhooks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="filter-row">
          <select
            className="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            className={`btn-filter-favorite ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title="Favoritos"
          >
            ⭐
          </button>
        </div>
      </div>

      <div className={`webhook-container ${viewMode}`}>
        {sortedWebhooks.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron webhooks</p>
          </div>
        ) : (
          sortedWebhooks.map((webhook) => (
            <div
              key={webhook.id}
              className={`webhook-card ${selectedId === webhook.id ? 'selected' : ''} ${
                dragOverItem === webhook.id ? 'drag-over' : ''
              } ${viewMode}`}
              draggable
              onDragStart={() => handleDragStart(webhook.id)}
              onDragEnter={() => handleDragEnter(webhook.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onClick={() => onSelect(webhook.id)}
              style={{ borderLeftColor: webhook.color || '#5865F2' }}
            >
              <button
                className={`btn-favorite ${webhook.isFavorite ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(webhook);
                }}
                title={webhook.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {webhook.isFavorite ? '⭐' : '☆'}
              </button>

              <button
                className="btn-settings"
                onClick={(e) => handleOpenContextMenu(webhook, e)}
                title="Configuración"
              >
                ⚙️
              </button>

              <div className="webhook-avatar">
                {webhook.avatarUrl ? (
                  <img src={webhook.avatarUrl} alt={webhook.name} />
                ) : (
                  <div className="avatar-placeholder">{webhook.name[0]?.toUpperCase()}</div>
                )}
              </div>

              <div className="webhook-info">
                <div className="webhook-name">{webhook.name}</div>
                {webhook.category && (
                  <div className="webhook-category">{webhook.category}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal agregar webhook */}
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

            <div className="form-group">
              <label>Categoría (opcional)</label>
              <select
                value={newWebhookCategory}
                onChange={(e) => setNewWebhookCategory(e.target.value)}
                disabled={loading}
              >
                <option value="">Sin categoría</option>
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker-grid">
                {WEBHOOK_COLORS.map(color => (
                  <button
                    key={color}
                    className={`color-option ${newWebhookColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewWebhookColor(color)}
                    disabled={loading}
                  />
                ))}
              </div>
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

      {/* Context Menu estilo juego */}
      {showContextMenu && contextMenuWebhook && (
        <WebhookContextMenu
          webhook={contextMenuWebhook}
          categories={categories}
          colors={WEBHOOK_COLORS}
          onClose={() => setShowContextMenu(false)}
          onToggleFavorite={handleToggleFavorite}
          onChangeCategory={handleChangeCategory}
          onChangeColor={handleChangeColor}
          onDelete={handleDeleteWebhook}
        />
      )}
    </div>
  );
}