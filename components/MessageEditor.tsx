import { useState } from 'react';
import { Message, Embed } from '../types/types';            // Actualiza
import { EmbedEditor } from './EmbedEditor';                // Mantiene igual
import '../css/MessageEditor.css';                          // Actualiza

interface Props {
  message: Message;
  onChange: (message: Message) => void;
  onClear: () => void;
  onLoadMessage: (url: string) => void;
  onExportJSON: () => void;
}

export function MessageEditor({ message, onChange, onClear, onLoadMessage, onExportJSON }: Props) {
  const [loadUrl, setLoadUrl] = useState('');
  const [editMode, setEditMode] = useState<'json' | 'visual'>('visual');

  const handleContentChange = (content: string) => {
    if (content.length <= 2000) {
      onChange({ ...message, content });
    }
  };

  const handleAddEmbed = () => {
    if (message.embeds.length >= 10) {
      alert('Máximo 10 embeds por mensaje');
      return;
    }
    
    onChange({
      ...message,
      embeds: [...message.embeds, {}]
    });
  };

  const handleUpdateEmbed = (index: number, embed: Embed) => {
    const newEmbeds = [...message.embeds];
    newEmbeds[index] = embed;
    onChange({ ...message, embeds: newEmbeds });
  };

  const handleDeleteEmbed = (index: number) => {
    onChange({
      ...message,
      embeds: message.embeds.filter((_, i) => i !== index)
    });
  };

  const handleLoad = () => {
    if (!loadUrl.trim()) return;
    onLoadMessage(loadUrl.trim());
    setLoadUrl('');
  };

  return (
    <div className="message-editor">
      <div className="editor-header">
        <button className="btn-clear" onClick={onClear}>
          Clear
        </button>
        <div className="mode-toggle">
          <button 
            className={editMode === 'visual' ? 'active' : ''} 
            onClick={() => setEditMode('visual')}
          >
            Visual
          </button>
          <button 
            className={editMode === 'json' ? 'active' : ''} 
            onClick={() => setEditMode('json')}
          >
            JSON
          </button>
        </div>
      </div>

      {editMode === 'visual' ? (
        <>
          <div className="section">
            <label>
              Content <span className="char-count">{message.content.length}/2000</span>
            </label>
            <textarea
              value={message.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Contenido del mensaje (fuera del embed)"
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="section">
            <label>Profile</label>
            <input
              type="text"
              placeholder="Username (opcional)"
              value={message.username || ''}
              onChange={(e) => onChange({ ...message, username: e.target.value })}
              maxLength={80}
            />
            <input
              type="url"
              placeholder="Avatar URL (opcional)"
              value={message.avatarUrl || ''}
              onChange={(e) => onChange({ ...message, avatarUrl: e.target.value })}
            />
          </div>

          <div className="section">
            <label>Files</label>
            <div className="file-info">
              Archivos no soportados en modo cliente. Usar Discord directamente.
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <label>Message Link</label>
              <button className="btn-small" onClick={handleLoad}>
                Load
              </button>
            </div>
            <input
              type="url"
              placeholder="URL del mensaje JSON"
              value={loadUrl}
              onChange={(e) => setLoadUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLoad()}
            />
          </div>

          <div className="section">
            <div className="section-header">
              <label>Embeds ({message.embeds.length}/10)</label>
              <button className="btn-primary" onClick={handleAddEmbed}>
                Add Embed
              </button>
            </div>
            
            {message.embeds.map((embed, index) => (
              <EmbedEditor
                key={index}
                embed={embed}
                index={index}
                onChange={(e) => handleUpdateEmbed(index, e)}
                onDelete={() => handleDeleteEmbed(index)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="json-editor">
          <textarea
            value={JSON.stringify(message, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                // Invalid JSON, don't update
              }
            }}
            rows={20}
            spellCheck={false}
          />
          <button className="btn-export" onClick={onExportJSON}>
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
}
