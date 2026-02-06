// EJEMPLO DE INTEGRACIÓN COMPLETA
// Este archivo muestra cómo integrar el Character Selector con el Context Menu

import { useState } from 'react';
import { CharacterSelector } from './CharacterSelector';
import { WebhookContextMenu } from './WebhookContextMenu';
import { Webhook } from '../types/types';

interface Character {
  id: string;
  name: string;
  avatar: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  element?: string;
}

export function IntegrationExample() {
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [temporaryWebhook, setTemporaryWebhook] = useState<Webhook | null>(null);

  // FLUJO COMPLETO: Character Selector → Context Menu
  const handleCharacterSelect = (character: Character) => {
    console.log('✅ Character selected:', character);
    
    // 1. Guardar personaje seleccionado
    setSelectedCharacter(character);
    
    // 2. Crear webhook temporal basado en el personaje
    const webhook: Webhook = {
      id: `temp_${character.id}`,
      name: character.name,
      url: 'https://discord.com/api/webhooks/TEMP/TOKEN', // Placeholder
      avatarUrl: character.avatar,
      createdAt: Date.now(),
      category: character.element || 'Character',
      color: getRarityColor(character.rarity),
      isFavorite: false
    };
    
    setTemporaryWebhook(webhook);
    
    // 3. Cerrar selector
    setShowCharacterSelector(false);
    
    // 4. Esperar un frame para transición suave
    requestAnimationFrame(() => {
      // 5. Abrir context menu
      setShowContextMenu(true);
    });
  };

  const getRarityColor = (rarity: Character['rarity']): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      case 'common': return '#95A5A6';
    }
  };

  const handleContextMenuAction = (action: string) => {
    console.log(`🎮 Action from context menu: ${action}`);
    
    if (selectedCharacter && temporaryWebhook) {
      // Aquí puedes implementar acciones específicas:
      // - Crear webhook real con el personaje
      // - Actualizar webhook existente
      // - Guardar configuración del personaje
    }
    
    setShowContextMenu(false);
  };

  return (
    <div className="integration-example">
      <h2>Character Selector Integration</h2>
      
      {/* Botón de apertura */}
      <button 
        className="btn-character-selector"
        onClick={() => setShowCharacterSelector(true)}
      >
        👥 Select Character
      </button>

      {/* Character Selector */}
      {showCharacterSelector && (
        <CharacterSelector
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}

      {/* Context Menu (se abre después de seleccionar personaje) */}
      {showContextMenu && temporaryWebhook && (
        <WebhookContextMenu
          webhook={temporaryWebhook}
          categories={['Personal', 'Work', 'Projects']}
          colors={['#5865F2', '#57F287', '#FEE75C', '#ED4245']}
          onClose={() => setShowContextMenu(false)}
          onToggleFavorite={() => handleContextMenuAction('toggle_favorite')}
          onChangeCategory={(w, cat) => handleContextMenuAction(`change_category:${cat}`)}
          onChangeColor={(w, color) => handleContextMenuAction(`change_color:${color}`)}
          onDelete={() => handleContextMenuAction('delete')}
        />
      )}

      {/* Preview del personaje seleccionado */}
      {selectedCharacter && (
        <div className="selected-character-preview">
          <h3>Selected Character</h3>
          <div className="preview-content">
            <img src={selectedCharacter.avatar} alt={selectedCharacter.name} />
            <div className="preview-info">
              <div className="character-name">{selectedCharacter.name}</div>
              <div className="character-rarity" style={{ color: getRarityColor(selectedCharacter.rarity) }}>
                {selectedCharacter.rarity.toUpperCase()}
              </div>
              <div className="character-element">{selectedCharacter.element}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 2: Integración con Webhook Existente
// ============================================

export function UpdateWebhookWithCharacter() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [targetWebhookId, setTargetWebhookId] = useState<string | null>(null);

  const handleSelectCharacterForWebhook = (webhookId: string) => {
    setTargetWebhookId(webhookId);
    setShowCharacterSelector(true);
  };

  const handleCharacterSelect = (character: Character) => {
    if (!targetWebhookId) return;

    // Actualizar webhook con datos del personaje
    setWebhooks(prev => prev.map(webhook => {
      if (webhook.id === targetWebhookId) {
        return {
          ...webhook,
          name: character.name,
          avatarUrl: character.avatar,
          color: getRarityColor(character.rarity),
          category: character.element || webhook.category
        };
      }
      return webhook;
    }));

    setShowCharacterSelector(false);
    setTargetWebhookId(null);
  };

  const getRarityColor = (rarity: Character['rarity']): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      case 'common': return '#95A5A6';
    }
  };

  return (
    <div>
      <h2>Update Webhook with Character</h2>
      
      {webhooks.map(webhook => (
        <div key={webhook.id} className="webhook-item">
          <div>{webhook.name}</div>
          <button onClick={() => handleSelectCharacterForWebhook(webhook.id)}>
            Change Character
          </button>
        </div>
      ))}

      {showCharacterSelector && (
        <CharacterSelector
          onSelect={handleCharacterSelect}
          onClose={() => {
            setShowCharacterSelector(false);
            setTargetWebhookId(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 3: Crear Webhook desde Personaje
// ============================================

export function CreateWebhookFromCharacter() {
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showWebhookUrlModal, setShowWebhookUrlModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setShowCharacterSelector(false);
    // Pedir URL del webhook
    setShowWebhookUrlModal(true);
  };

  const handleCreateWebhook = async () => {
    if (!selectedCharacter || !webhookUrl) return;

    const newWebhook: Webhook = {
      id: `char_${selectedCharacter.id}_${Date.now()}`,
      name: selectedCharacter.name,
      url: webhookUrl,
      avatarUrl: selectedCharacter.avatar,
      createdAt: Date.now(),
      category: selectedCharacter.element || 'Character',
      color: getRarityColor(selectedCharacter.rarity),
      isFavorite: false
    };

    // Guardar webhook (implementar según tu storage)
    console.log('💾 Webhook created:', newWebhook);

    // Limpiar estado
    setSelectedCharacter(null);
    setWebhookUrl('');
    setShowWebhookUrlModal(false);
  };

  const getRarityColor = (rarity: Character['rarity']): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      case 'common': return '#95A5A6';
    }
  };

  return (
    <div>
      <h2>Create Webhook from Character</h2>
      
      <button onClick={() => setShowCharacterSelector(true)}>
        🎮 Choose Character First
      </button>

      {showCharacterSelector && (
        <CharacterSelector
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}

      {showWebhookUrlModal && selectedCharacter && (
        <div className="modal-overlay" onClick={() => setShowWebhookUrlModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enter Webhook URL for {selectedCharacter.name}</h3>
            
            <div className="character-preview-small">
              <img src={selectedCharacter.avatar} alt={selectedCharacter.name} />
              <div>{selectedCharacter.name}</div>
            </div>

            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
            />

            <div className="modal-actions">
              <button onClick={() => setShowWebhookUrlModal(false)}>
                Cancel
              </button>
              <button onClick={handleCreateWebhook} className="btn-primary">
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
