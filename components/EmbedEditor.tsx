import { useState } from 'react';
import { Embed, EmbedField } from '../types/types';         // Actualiza
import '../css/EmbedEditor.css';                            // Actualiza

interface Props {
  embed: Embed;
  index: number;
  onChange: (embed: Embed) => void;
  onDelete: () => void;
}

export function EmbedEditor({ embed, index, onChange, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [colorInput, setColorInput] = useState(
    embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#5865F2'
  );

  const handleColorChange = (hex: string) => {
    setColorInput(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onChange({ ...embed, color: parseInt(hex.slice(1), 16) });
    }
  };

  const handleAddField = () => {
    const fields = embed.fields || [];
    if (fields.length >= 25) {
      alert('Máximo 25 fields por embed');
      return;
    }
    
    onChange({
      ...embed,
      fields: [...fields, { name: '', value: '', inline: false }]
    });
  };

  const handleUpdateField = (fieldIndex: number, field: EmbedField) => {
    const fields = [...(embed.fields || [])];
    fields[fieldIndex] = field;
    onChange({ ...embed, fields });
  };

  const handleDeleteField = (fieldIndex: number) => {
    onChange({
      ...embed,
      fields: (embed.fields || []).filter((_, i) => i !== fieldIndex)
    });
  };

  const getTotalLength = () => {
    let total = 0;
    total += embed.title?.length || 0;
    total += embed.description?.length || 0;
    total += embed.footer?.text?.length || 0;
    total += embed.author?.name?.length || 0;
    (embed.fields || []).forEach(f => {
      total += f.name.length + f.value.length;
    });
    return total;
  };

  const totalLength = getTotalLength();
  const isOverLimit = totalLength > 6000;

  return (
    <div className="embed-editor">
      <div className="embed-header">
        <button 
          className="collapse-btn" 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="embed-title">Embed #{index + 1}</span>
        <span className={`char-count ${isOverLimit ? 'over-limit' : ''}`}>
          {totalLength}/6000
        </span>
        <button className="btn-delete-embed" onClick={onDelete}>
          Delete
        </button>
      </div>

      {!collapsed && (
        <div className="embed-content">
          <div className="form-row">
            <label>Author Name</label>
            <input
              type="text"
              value={embed.author?.name || ''}
              onChange={(e) => onChange({
                ...embed,
                author: { ...embed.author, name: e.target.value }
              })}
              maxLength={256}
            />
          </div>

          <div className="form-row">
            <label>Author URL</label>
            <input
              type="url"
              value={embed.author?.url || ''}
              onChange={(e) => onChange({
                ...embed,
                author: { ...embed.author, url: e.target.value }
              })}
            />
          </div>

          <div className="form-row">
            <label>Author Icon URL</label>
            <input
              type="url"
              value={embed.author?.iconUrl || ''}
              onChange={(e) => onChange({
                ...embed,
                author: { ...embed.author, iconUrl: e.target.value }
              })}
            />
          </div>

          <div className="form-row">
            <label>Title</label>
            <input
              type="text"
              value={embed.title || ''}
              onChange={(e) => onChange({ ...embed, title: e.target.value })}
              maxLength={256}
            />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea
              value={embed.description || ''}
              onChange={(e) => onChange({ ...embed, description: e.target.value })}
              rows={4}
              maxLength={4096}
            />
          </div>

          <div className="form-row">
            <label>URL</label>
            <input
              type="url"
              value={embed.url || ''}
              onChange={(e) => onChange({ ...embed, url: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label>Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={colorInput}
                onChange={(e) => handleColorChange(e.target.value)}
              />
              <input
                type="text"
                value={colorInput}
                onChange={(e) => handleColorChange(e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div className="form-row">
            <label>Thumbnail URL</label>
            <input
              type="url"
              value={embed.thumbnail?.url || ''}
              onChange={(e) => onChange({
                ...embed,
                thumbnail: { url: e.target.value }
              })}
            />
          </div>

          <div className="form-row">
            <label>Image URL</label>
            <input
              type="url"
              value={embed.image?.url || ''}
              onChange={(e) => onChange({
                ...embed,
                image: { url: e.target.value }
              })}
            />
          </div>

          <div className="form-row">
            <label>Footer Text</label>
            <input
              type="text"
              value={embed.footer?.text || ''}
              onChange={(e) => onChange({
                ...embed,
                footer: { ...embed.footer, text: e.target.value }
              })}
              maxLength={2048}
            />
          </div>

          <div className="form-row">
            <label>Footer Icon URL</label>
            <input
              type="url"
              value={embed.footer?.iconUrl || ''}
              onChange={(e) => onChange({
                ...embed,
                footer: { ...embed.footer, iconUrl: e.target.value }
              })}
            />
          </div>

          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={!!embed.timestamp}
                onChange={(e) => onChange({
                  ...embed,
                  timestamp: e.target.checked ? new Date().toISOString() : undefined
                })}
              />
              Include Timestamp
            </label>
          </div>

          <div className="fields-section">
            <div className="section-header">
              <label>Fields ({(embed.fields || []).length}/25)</label>
              <button className="btn-small" onClick={handleAddField}>
                Add Field
              </button>
            </div>

            {(embed.fields || []).map((field, fieldIndex) => (
              <div key={fieldIndex} className="field-editor">
                <div className="field-header">
                  <span>Field #{fieldIndex + 1}</span>
                  <button 
                    className="btn-delete-field" 
                    onClick={() => handleDeleteField(fieldIndex)}
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Name"
                  value={field.name}
                  onChange={(e) => handleUpdateField(fieldIndex, {
                    ...field,
                    name: e.target.value
                  })}
                  maxLength={256}
                />
                <textarea
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => handleUpdateField(fieldIndex, {
                    ...field,
                    value: e.target.value
                  })}
                  rows={2}
                  maxLength={1024}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={field.inline || false}
                    onChange={(e) => handleUpdateField(fieldIndex, {
                      ...field,
                      inline: e.target.checked
                    })}
                  />
                  Inline
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
