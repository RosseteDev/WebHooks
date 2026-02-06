import { useState, useRef } from 'react';
import { Message, Embed, MessageFile } from '../types/types';
import { EmbedEditor } from './EmbedEditor';
import '../css/MessageEditor.css';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (content: string) => {
    if (content.length <= 2000) {
      onChange({ ...message, content });
    }
  }

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

  // Files handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: MessageFile[] = [];
    const currentSize = message.files?.reduce((acc, f) => acc + f.size, 0) || 0;
    let totalSize = currentSize;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (totalSize + file.size > 25 * 1024 * 1024) {
        alert('El tamaño total de archivos no puede exceder 25 MB');
        break;
      }

      newFiles.push({
        id: `file_${Date.now()}_${i}`,
        file: file,
        name: file.name,
        size: file.size
      });

      totalSize += file.size;
    }

    onChange({
      ...message,
      files: [...(message.files || []), ...newFiles]
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    onChange({
      ...message,
      files: (message.files || []).filter(f => f.id !== id)
    });
  };

  const handleClearFiles = () => {
    onChange({ ...message, files: [] });
  };

  const handlePasteFiles = async () => {
    try {
      const items = await navigator.clipboard.read();
      const files: File[] = [];

      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], `clipboard-${Date.now()}.png`, { type });
            files.push(file);
          }
        }
      }

      if (files.length === 0) {
        alert('No se encontraron imágenes en el portapapeles');
        return;
      }

      const newFiles: MessageFile[] = files.map((file, i) => ({
        id: `file_${Date.now()}_${i}`,
        file: file,
        name: file.name,
        size: file.size
      }));

      const currentSize = message.files?.reduce((acc, f) => acc + f.size, 0) || 0;
      const totalSize = currentSize + newFiles.reduce((acc, f) => acc + f.size, 0);

      if (totalSize > 25 * 1024 * 1024) {
        alert('El tamaño total de archivos excedería 25 MB');
        return;
      }

      onChange({
        ...message,
        files: [...(message.files || []), ...newFiles]
      });
    } catch (error) {
      console.error('Error pasting files:', error);
      alert('Error al pegar desde el portapapeles. Asegúrate de tener permisos.');
    }
  };

  // Flags handling
  const handleToggleSuppressEmbeds = () => {
    onChange({
      ...message,
      flags: {
        ...message.flags,
        suppressEmbeds: !message.flags?.suppressEmbeds
      }
    });
  };

  const handleToggleSuppressNotifications = () => {
    onChange({
      ...message,
      flags: {
        ...message.flags,
        suppressNotifications: !message.flags?.suppressNotifications
      }
    });
  };

  const getTotalFileSize = () => {
    return message.files?.reduce((acc, f) => acc + f.size, 0) || 0;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
            <label>Thread</label>
            <input
              type="text"
              placeholder="Forum Thread Name (opcional, 0/100)"
              value={message.threadName || ''}
              onChange={(e) => onChange({ ...message, threadName: e.target.value.slice(0, 100) })}
              maxLength={100}
            />
            <div className="hint">
              {message.threadName ? `${message.threadName.length}/100` : '0/100'}
            </div>
          </div>

          <div className="section">
            <label>Flags</label>
            <div className="flags-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={message.flags?.suppressEmbeds || false}
                  onChange={handleToggleSuppressEmbeds}
                />
                <span>Suppress Embeds</span>
              </label>
              <div className="hint">
                Hides link embeds. This cannot be used in conjunction with rich embeds (created with "Add Embed").
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={message.flags?.suppressNotifications || false}
                  onChange={handleToggleSuppressNotifications}
                />
                <span>Suppress Notifications</span>
              </label>
              <div className="hint">
                If the message contains mentions in its "Content" field, this prevents Discord from sending out notifications when it is sent.
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <label>
                Files <span className="file-size">{formatFileSize(getTotalFileSize())} / 25 MB</span>
              </label>
              <div className="file-actions">
                <button 
                  className="btn-small" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse
                </button>
                <button 
                  className="btn-small" 
                  onClick={handlePasteFiles}
                >
                  Clipboard
                </button>
                {(message.files || []).length > 0 && (
                  <button 
                    className="btn-small btn-clear-files" 
                    onClick={handleClearFiles}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {(message.files || []).length > 0 && (
              <div className="files-list">
                {message.files?.map(file => (
                  <div key={file.id} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <button
                      className="btn-remove-file"
                      onClick={() => handleRemoveFile(file.id)}
                      title="Eliminar archivo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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