import { useState, useEffect } from 'react';
import { Webhook } from '../types/types';
import '../css/WebhookSelector.css';

interface Props {
  webhooks: Webhook[];
  currentWebhook?: Webhook;
  onSelect: (webhook: Webhook) => void;
  onClose: () => void;
  onOpenContextMenu?: (webhook: Webhook) => void;
}

export function WebhookSelector({ webhooks, currentWebhook, onSelect, onClose, onOpenContextMenu }: Props) {
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(currentWebhook || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredWebhook, setHoveredWebhook] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Categorías únicas de los webhooks
  const categories = ['all', ...Array.from(new Set(webhooks.map(w => w.category).filter(Boolean)))];

  // Filtrado optimizado O(n)
  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesCategory = filterCategory === 'all' || webhook.category === filterCategory;
    const matchesSearch = webhook.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || webhook.isFavorite;
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  // Ordenar: favoritos primero, luego por fecha de creación
  const sortedWebhooks = [...filteredWebhooks].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.createdAt - a.createdAt;
  });

  // Mapa para búsqueda O(1)
  const webhookMap = new Map(webhooks.map(w => [w.id, w]));

  const handleSelect = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
  };

  const handleConfirm = () => {
    if (selectedWebhook) {
      onSelect(selectedWebhook);
      onClose();
    }
  };

  const handleOpenSettings = (webhook: Webhook, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenContextMenu) {
      onOpenContextMenu(webhook);
      onClose();
    }
  };

  useEffect(() => {
    // Animación de entrada con stagger
    const cards = document.querySelectorAll('.webhook-selector-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.animationDelay = `${index * 0.03}s`;
    });
  }, [filteredWebhooks]);

  const getWebhookInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="webhook-selector-overlay" onClick={onClose}>
      <div className="webhook-selector-container" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="webhook-header">
          <div className="header-glow"></div>
          <div className="header-content">
            <div className="header-left">
              <h1 className="selector-title">WEBHOOK SELECTION</h1>
              <div className="selector-subtitle">Choose your Webhook</div>
            </div>
            <button className="btn-close-selector" onClick={onClose}>
              <span className="close-icon">✕</span>
            </button>
          </div>
          
          {/* Mode Selection */}
          <div className="mode-selector">
            <button className="mode-btn active">
              <span className="mode-icon">🔗</span>
              <span className="mode-label">ALL WEBHOOKS</span>
              <span className="mode-count">{webhooks.length}</span>
            </button>
            <button 
              className={`mode-btn ${showFavoritesOnly ? 'active' : ''}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <span className="mode-icon">⭐</span>
              <span className="mode-label">FAVORITES</span>
              <span className="mode-count">{webhooks.filter(w => w.isFavorite).length}</span>
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="webhook-filters">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search webhooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${filterCategory === category ? 'active' : ''}`}
                onClick={() => setFilterCategory(category)}
              >
                <span className="category-icon">
                  {category === 'all' ? '🌐' : 
                   category === 'Personal' ? '👤' :
                   category === 'Work' ? '💼' :
                   category === 'Projects' ? '📁' :
                   category === 'Testing' ? '🧪' : '📌'}
                </span>
                <span className="category-name">{category === 'all' ? 'ALL' : category.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* WEBHOOK GRID */}
        <div className="webhook-grid-wrapper">
          <div className="webhook-grid">
            {sortedWebhooks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-text">No webhooks found</div>
                <div className="empty-hint">Try adjusting your filters</div>
              </div>
            ) : (
              sortedWebhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={`webhook-selector-card ${selectedWebhook?.id === webhook.id ? 'selected' : ''} ${hoveredWebhook === webhook.id ? 'hovered' : ''}`}
                  onClick={() => handleSelect(webhook)}
                  onMouseEnter={() => setHoveredWebhook(webhook.id)}
                  onMouseLeave={() => setHoveredWebhook(null)}
                >
                  {/* Border con color del webhook */}
                  <div 
                    className="card-border"
                    style={{ 
                      borderColor: webhook.color || '#5865F2',
                      boxShadow: selectedWebhook?.id === webhook.id 
                        ? `0 0 30px ${webhook.color || '#5865F2'}` 
                        : 'none'
                    }}
                  ></div>

                  {/* Avatar */}
                  <div className="card-avatar-container">
                    <div 
                      className="card-avatar-glow"
                      style={{ backgroundColor: webhook.color || '#5865F2' }}
                    ></div>
                    <div className="card-avatar">
                      {webhook.avatarUrl ? (
                        <img src={webhook.avatarUrl} alt={webhook.name} />
                      ) : (
                        <div 
                          className="avatar-placeholder"
                          style={{ background: `linear-gradient(135deg, ${webhook.color || '#5865F2'}, ${webhook.color || '#7289DA'})` }}
                        >
                          {getWebhookInitials(webhook.name)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="card-info">
                    <div className="card-name">{webhook.name}</div>
                    {webhook.category && (
                      <div className="card-category">
                        <span className="category-badge">
                          {webhook.category === 'Personal' ? '👤' :
                           webhook.category === 'Work' ? '💼' :
                           webhook.category === 'Projects' ? '📁' :
                           webhook.category === 'Testing' ? '🧪' : '📌'}
                          {' '}{webhook.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Favorite Star */}
                  {webhook.isFavorite && (
                    <div className="card-favorite-badge">
                      <span className="favorite-star">⭐</span>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {selectedWebhook?.id === webhook.id && (
                    <div className="selection-indicator">
                      <div className="checkmark">✓</div>
                    </div>
                  )}

                  {/* Settings Button */}
                  {onOpenContextMenu && (
                    <button 
                      className="card-settings-btn"
                      onClick={(e) => handleOpenSettings(webhook, e)}
                      title="Settings"
                    >
                      ⚙️
                    </button>
                  )}

                  {/* Hover Glow */}
                  <div className="card-hover-glow"></div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PREVIEW PANEL */}
        {selectedWebhook && (
          <div className="preview-panel">
            <div className="preview-glow" style={{ backgroundColor: selectedWebhook.color || '#5865F2' }}></div>
            
            <div className="preview-content">
              <div className="preview-avatar-section">
                <div className="preview-avatar-container">
                  <div 
                    className="preview-avatar-glow-ring"
                    style={{ borderColor: selectedWebhook.color || '#5865F2' }}
                  ></div>
                  <div className="preview-avatar">
                    {selectedWebhook.avatarUrl ? (
                      <img src={selectedWebhook.avatarUrl} alt={selectedWebhook.name} />
                    ) : (
                      <div 
                        className="preview-avatar-placeholder"
                        style={{ background: `linear-gradient(135deg, ${selectedWebhook.color || '#5865F2'}, ${selectedWebhook.color || '#7289DA'})` }}
                      >
                        {getWebhookInitials(selectedWebhook.name)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="preview-info-section">
                <div className="preview-title">{selectedWebhook.name}</div>
                {selectedWebhook.category && (
                  <div className="preview-category" style={{ color: selectedWebhook.color || '#5865F2' }}>
                    {selectedWebhook.category.toUpperCase()}
                  </div>
                )}
                
                <div className="preview-stats">
                  <div className="stat-item">
                    <span className="stat-label">Created</span>
                    <span className="stat-value">
                      {new Date(selectedWebhook.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Category</span>
                    <span className="stat-value">{selectedWebhook.category || 'None'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Favorite</span>
                    <span className="stat-value">{selectedWebhook.isFavorite ? 'Yes ⭐' : 'No'}</span>
                  </div>
                </div>

                {selectedWebhook.url && (
                  <div className="preview-url">
                    <div className="url-label">Webhook URL</div>
                    <div className="url-value">{selectedWebhook.url.substring(0, 50)}...</div>
                  </div>
                )}
              </div>
            </div>

            <div className="preview-actions">
              <button className="btn-confirm-selection" onClick={handleConfirm}>
                <span className="btn-confirm-glow"></span>
                <span className="btn-confirm-text">SELECT WEBHOOK</span>
              </button>
              
              {onOpenContextMenu && (
                <button 
                  className="btn-secondary-action" 
                  onClick={(e) => handleOpenSettings(selectedWebhook, e)}
                >
                  <span className="btn-icon">⚙️</span>
                  <span className="btn-text">SETTINGS</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* FOOTER DECORATION */}
        <div className="selector-footer">
          <div className="footer-pattern"></div>
          <div className="footer-info">
            <span className="footer-text">
              {sortedWebhooks.length} {sortedWebhooks.length === 1 ? 'Webhook' : 'Webhooks'} Available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
