import { useState } from 'react';
import { Webhook } from '../types/types';
import '../css/WebhookContextMenu.css';

interface Props {
  webhook: Webhook;
  categories: string[];
  colors: string[];
  onClose: () => void;
  onToggleFavorite: (webhook: Webhook) => void;
  onChangeCategory: (webhook: Webhook, category: string) => void;
  onChangeColor: (webhook: Webhook, color: string) => void;
  onDelete: (webhook: Webhook) => void;
}

type Tab = 'info' | 'category' | 'color' | 'danger';

export function WebhookContextMenu({ 
  webhook, 
  categories, 
  colors, 
  onClose, 
  onToggleFavorite,
  onChangeCategory,
  onChangeColor,
  onDelete 
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [selectedCategory, setSelectedCategory] = useState(webhook.category || '');
  const [selectedColor, setSelectedColor] = useState(webhook.color || colors[0]);

  const handleApplyCategory = () => {
    onChangeCategory(webhook, selectedCategory);
    onClose();
  };

  const handleApplyColor = () => {
    onChangeColor(webhook, selectedColor);
    onClose();
  };

  return (
    <div className="context-menu-overlay" onClick={onClose}>
      <div className="context-menu-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header con fondo degradado */}
        <div className="context-menu-header">
          <div className="header-gradient"></div>
          <div className="header-content">
            <h2 className="menu-title">WEBHOOK SETTINGS</h2>
            <button className="btn-close-menu" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="menu-tabs">
          <button 
            className={`menu-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <span className="tab-icon">ℹ️</span>
            <span className="tab-label">Info</span>
          </button>
          <button 
            className={`menu-tab ${activeTab === 'category' ? 'active' : ''}`}
            onClick={() => setActiveTab('category')}
          >
            <span className="tab-icon">🏷️</span>
            <span className="tab-label">Categoría</span>
          </button>
          <button 
            className={`menu-tab ${activeTab === 'color' ? 'active' : ''}`}
            onClick={() => setActiveTab('color')}
          >
            <span className="tab-icon">🎨</span>
            <span className="tab-label">Color</span>
          </button>
          <button 
            className={`menu-tab ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
            <span className="tab-icon">⚠️</span>
            <span className="tab-label">Peligro</span>
          </button>
        </div>

        {/* Contenido del menú */}
        <div className="menu-content">
          
          {/* Tab: Info */}
          {activeTab === 'info' && (
            <div className="content-section fade-in">
              <div className="webhook-showcase">
                <div className="showcase-avatar-container">
                  <div className="avatar-glow" style={{ backgroundColor: webhook.color }}></div>
                  <div className="showcase-avatar">
                    {webhook.avatarUrl ? (
                      <img src={webhook.avatarUrl} alt={webhook.name} />
                    ) : (
                      <div className="avatar-placeholder-large">
                        {webhook.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="showcase-info">
                  <h3 className="showcase-name">{webhook.name}</h3>
                  {webhook.category && (
                    <div className="showcase-category">{webhook.category}</div>
                  )}
                  <div className="showcase-meta">
                    <span>ID: {webhook.id.slice(0, 8)}...</span>
                    <span>•</span>
                    <span>Creado: {new Date(webhook.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className={`action-btn ${webhook.isFavorite ? 'favorite-active' : ''}`}
                  onClick={() => {
                    onToggleFavorite(webhook);
                    onClose();
                  }}
                >
                  <span className="btn-icon">{webhook.isFavorite ? '⭐' : '☆'}</span>
                  <span className="btn-text">
                    {webhook.isFavorite ? 'Remover de Favoritos' : 'Agregar a Favoritos'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Tab: Categoría */}
          {activeTab === 'category' && (
            <div className="content-section fade-in">
              <div className="section-header-menu">
                <h4>SELECCIONAR CATEGORÍA</h4>
                <p>Organiza tus webhooks en categorías</p>
              </div>
              
              <div className="category-grid">
                <button
                  className={`category-card ${selectedCategory === '' ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  <div className="category-icon">✨</div>
                  <div className="category-name">Sin Categoría</div>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-card ${selectedCategory === category ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="category-icon">
                      {category === 'Personal' && '👤'}
                      {category === 'Work' && '💼'}
                      {category === 'Projects' && '📁'}
                      {category === 'Testing' && '🧪'}
                      {!['Personal', 'Work', 'Projects', 'Testing'].includes(category) && '📌'}
                    </div>
                    <div className="category-name">{category}</div>
                  </button>
                ))}
              </div>

              <div className="action-buttons">
                <button className="action-btn primary" onClick={handleApplyCategory}>
                  <span className="btn-icon">✓</span>
                  <span className="btn-text">Aplicar Categoría</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab: Color */}
          {activeTab === 'color' && (
            <div className="content-section fade-in">
              <div className="section-header-menu">
                <h4>SELECCIONAR COLOR</h4>
                <p>Personaliza el color de tu webhook</p>
              </div>
              
              <div className="color-palette">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    <div className="color-check">✓</div>
                  </button>
                ))}
              </div>

              <div className="color-preview">
                <div className="preview-label">Vista Previa:</div>
                <div 
                  className="preview-card"
                  style={{ borderLeftColor: selectedColor }}
                >
                  <div className="preview-avatar-small">
                    {webhook.avatarUrl ? (
                      <img src={webhook.avatarUrl} alt={webhook.name} />
                    ) : (
                      <div className="avatar-placeholder-small">
                        {webhook.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="preview-name">{webhook.name}</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="action-btn primary" onClick={handleApplyColor}>
                  <span className="btn-icon">✓</span>
                  <span className="btn-text">Aplicar Color</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab: Danger Zone */}
          {activeTab === 'danger' && (
            <div className="content-section fade-in">
              <div className="section-header-menu danger">
                <h4>⚠️ ZONA DE PELIGRO</h4>
                <p>Acciones irreversibles</p>
              </div>
              
              <div className="danger-zone">
                <div className="danger-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-text">
                    <strong>¡Atención!</strong>
                    <p>Esta acción no se puede deshacer. El webhook será eliminado permanentemente.</p>
                  </div>
                </div>

                <button 
                  className="action-btn danger" 
                  onClick={() => onDelete(webhook)}
                >
                  <span className="btn-icon">🗑️</span>
                  <span className="btn-text">Eliminar Webhook</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer decorativo */}
        <div className="menu-footer">
          <div className="footer-pattern"></div>
        </div>
      </div>
    </div>
  );
}
