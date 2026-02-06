import { useState, useEffect } from 'react';
import { Webhook } from '../types/types';
import '../css/CharacterSelector.css';

interface Character {
  id: string;
  name: string;
  avatar: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  element?: string;
}

interface Props {
  onSelect: (character: Character) => void;
  onClose: () => void;
  currentWebhook?: Webhook;
}

// Personajes predefinidos (puedes expandir esto)
const CHARACTERS: Character[] = [
  { id: 'wise', name: 'Wise', avatar: '/avatars/wise.png', rarity: 'legendary', element: 'electric' },
  { id: 'belle', name: 'Belle', avatar: '/avatars/belle.png', rarity: 'epic', element: 'fire' },
  { id: 'pulchra', name: 'Pulchra', avatar: '/avatars/pulchra.png', rarity: 'rare', element: 'light' },
  { id: 'harumasa', name: 'Harumasa', avatar: '/avatars/harumasa.png', rarity: 'epic', element: 'ice' },
  { id: 'burnice', name: 'Burnice', avatar: '/avatars/burnice.png', rarity: 'rare', element: 'fire' },
  { id: 'ellen', name: 'Ellen', avatar: '/avatars/ellen.png', rarity: 'legendary', element: 'ice' },
  { id: 'seth', name: 'Seth', avatar: '/avatars/seth.png', rarity: 'rare', element: 'electric' },
  { id: 'rina', name: 'Rina', avatar: '/avatars/rina.png', rarity: 'epic', element: 'electric' },
  { id: 'grace', name: 'Grace', avatar: '/avatars/grace.png', rarity: 'rare', element: 'electric' },
  { id: 'piper', name: 'Piper', avatar: '/avatars/piper.png', rarity: 'common', element: 'physical' },
  { id: 'lucy', name: 'Lucy', avatar: '/avatars/lucy.png', rarity: 'epic', element: 'fire' },
  { id: 'soukaku', name: 'Soukaku', avatar: '/avatars/soukaku.png', rarity: 'rare', element: 'ice' },
  { id: 'ben', name: 'Ben', avatar: '/avatars/ben.png', rarity: 'common', element: 'physical' },
  { id: 'anton', name: 'Anton', avatar: '/avatars/anton.png', rarity: 'rare', element: 'electric' },
];

export function CharacterSelector({ onSelect, onClose, currentWebhook }: Props) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [filterElement, setFilterElement] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);

  // Elementos únicos disponibles
  const elements = ['all', ...Array.from(new Set(CHARACTERS.map(c => c.element).filter(Boolean)))];

  // Filtrado optimizado O(n)
  const filteredCharacters = CHARACTERS.filter(char => {
    const matchesElement = filterElement === 'all' || char.element === filterElement;
    const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesElement && matchesSearch;
  });

  // Mapa para búsqueda O(1)
  const characterMap = new Map(CHARACTERS.map(c => [c.id, c]));

  const handleSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      onSelect(selectedCharacter);
      onClose();
    }
  };

  const getRarityColor = (rarity: Character['rarity']): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      case 'common': return '#95A5A6';
    }
  };

  const getElementIcon = (element?: string): string => {
    switch (element) {
      case 'fire': return '🔥';
      case 'ice': return '❄️';
      case 'electric': return '⚡';
      case 'light': return '✨';
      case 'physical': return '💪';
      default: return '⭐';
    }
  };

  useEffect(() => {
    // Animación de entrada con stagger
    const cards = document.querySelectorAll('.character-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.animationDelay = `${index * 0.03}s`;
    });
  }, [filteredCharacters]);

  return (
    <div className="character-selector-overlay" onClick={onClose}>
      <div className="character-selector-container" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="character-header">
          <div className="header-glow"></div>
          <div className="header-content">
            <div className="header-left">
              <h1 className="selector-title">CHARACTER SELECTION</h1>
              <div className="selector-subtitle">Choose your Agent</div>
            </div>
            <button className="btn-close-selector" onClick={onClose}>
              <span className="close-icon">✕</span>
            </button>
          </div>
          
          {/* Mode Selection */}
          <div className="mode-selector">
            <button className="mode-btn active">
              <span className="mode-icon">👥</span>
              <span className="mode-label">ALL AGENTS</span>
            </button>
            <button className="mode-btn">
              <span className="mode-icon">⭐</span>
              <span className="mode-label">FAVORITES</span>
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="character-filters">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="element-filters">
            {elements.map(element => (
              <button
                key={element}
                className={`element-btn ${filterElement === element ? 'active' : ''}`}
                onClick={() => setFilterElement(element)}
              >
                <span className="element-icon">
                  {element === 'all' ? '🌐' : getElementIcon(element)}
                </span>
                <span className="element-name">{element.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CHARACTER GRID */}
        <div className="character-grid-wrapper">
          <div className="character-grid">
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                className={`character-card ${selectedCharacter?.id === character.id ? 'selected' : ''} ${hoveredCharacter === character.id ? 'hovered' : ''}`}
                onClick={() => handleSelect(character)}
                onMouseEnter={() => setHoveredCharacter(character.id)}
                onMouseLeave={() => setHoveredCharacter(null)}
              >
                {/* Rarity Border */}
                <div 
                  className="card-border"
                  style={{ 
                    borderColor: getRarityColor(character.rarity),
                    boxShadow: selectedCharacter?.id === character.id 
                      ? `0 0 30px ${getRarityColor(character.rarity)}` 
                      : 'none'
                  }}
                ></div>

                {/* Avatar */}
                <div className="card-avatar-container">
                  <div 
                    className="card-avatar-glow"
                    style={{ backgroundColor: getRarityColor(character.rarity) }}
                  ></div>
                  <div className="card-avatar">
                    {character.avatar ? (
                      <img src={character.avatar} alt={character.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {character.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="card-info">
                  <div className="card-name">{character.name}</div>
                  <div className="card-element">
                    <span className="element-badge">
                      {getElementIcon(character.element)} {character.element}
                    </span>
                  </div>
                </div>

                {/* Rarity Stars */}
                <div className="card-rarity">
                  {Array.from({ length: character.rarity === 'legendary' ? 5 : character.rarity === 'epic' ? 4 : character.rarity === 'rare' ? 3 : 2 }).map((_, i) => (
                    <span key={i} className="rarity-star" style={{ color: getRarityColor(character.rarity) }}>
                      ★
                    </span>
                  ))}
                </div>

                {/* Selection Indicator */}
                {selectedCharacter?.id === character.id && (
                  <div className="selection-indicator">
                    <div className="checkmark">✓</div>
                  </div>
                )}

                {/* Hover Glow */}
                <div className="card-hover-glow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* PREVIEW PANEL */}
        {selectedCharacter && (
          <div className="preview-panel">
            <div className="preview-glow" style={{ backgroundColor: getRarityColor(selectedCharacter.rarity) }}></div>
            
            <div className="preview-content">
              <div className="preview-avatar-section">
                <div className="preview-avatar-container">
                  <div 
                    className="preview-avatar-glow-ring"
                    style={{ borderColor: getRarityColor(selectedCharacter.rarity) }}
                  ></div>
                  <div className="preview-avatar">
                    {selectedCharacter.avatar ? (
                      <img src={selectedCharacter.avatar} alt={selectedCharacter.name} />
                    ) : (
                      <div className="preview-avatar-placeholder">
                        {selectedCharacter.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="preview-info-section">
                <div className="preview-title">{selectedCharacter.name}</div>
                <div className="preview-rarity" style={{ color: getRarityColor(selectedCharacter.rarity) }}>
                  {selectedCharacter.rarity.toUpperCase()}
                </div>
                <div className="preview-element">
                  {getElementIcon(selectedCharacter.element)} {selectedCharacter.element?.toUpperCase()}
                </div>
                
                <div className="preview-stats">
                  <div className="stat-item">
                    <span className="stat-label">Type</span>
                    <span className="stat-value">Agent</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Element</span>
                    <span className="stat-value">{selectedCharacter.element}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Rarity</span>
                    <span className="stat-value">{selectedCharacter.rarity}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn-confirm-selection" onClick={handleConfirm}>
              <span className="btn-confirm-glow"></span>
              <span className="btn-confirm-text">CONFIRM SELECTION</span>
            </button>
          </div>
        )}

        {/* FOOTER DECORATION */}
        <div className="selector-footer">
          <div className="footer-pattern"></div>
          <div className="footer-info">
            <span className="footer-text">{filteredCharacters.length} Agents Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
