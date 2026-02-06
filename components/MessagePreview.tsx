import { Message, Webhook } from '../types/types';
import { useState } from 'react';
import { StorageService } from '../services/storage';
import '../css/MessagePreview.css';

interface Props {
  message: Message;
  webhook: Webhook | undefined;
}

export function MessagePreview({ message, webhook }: Props) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!webhook) {
      alert('Selecciona un webhook primero');
      return;
    }

    if (!message.content && message.embeds.length === 0 && (!message.files || message.files.length === 0)) {
      alert('El mensaje debe tener contenido, un embed o al menos un archivo');
      return;
    }

    // Validar suppress embeds con embeds
    if (message.flags?.suppressEmbeds && message.embeds.length > 0) {
      alert('No puedes usar "Suppress Embeds" con embeds ricos. Elimina los embeds o desactiva esta opción.');
      return;
    }

    setSending(true);

    try {
      const formData = new FormData();

      // Preparar payload
      const payload: any = {};
      
      if (message.content) payload.content = message.content;
      if (message.username) payload.username = message.username;
      if (message.avatarUrl) payload.avatar_url = message.avatarUrl;
      if (message.embeds.length > 0) payload.embeds = message.embeds;
      if (message.tts) payload.tts = message.tts;
      if (message.threadName) payload.thread_name = message.threadName;

      // Convertir flags a número
      const flagsNumber = StorageService.flagsToNumber(message.flags);
      if (flagsNumber > 0) payload.flags = flagsNumber;

      // Agregar payload JSON
      formData.append('payload_json', JSON.stringify(payload));

      // Agregar archivos
      if (message.files && message.files.length > 0) {
        message.files.forEach((fileData, index) => {
          formData.append(`files[${index}]`, fileData.file, fileData.name);
        });
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Send error:', error);
      alert(`❌ Error al enviar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  // Usar el avatar del webhook si no hay avatar específico en el mensaje
  const displayAvatarUrl = message.avatarUrl || webhook?.avatarUrl;
  const displayUsername = message.username || webhook?.name || 'Webhook';

  return (
    <div className="message-preview">
      <div className="preview-header">
        <h3>Vista Previa</h3>
        <button 
          className="btn-send" 
          onClick={handleSend}
          disabled={sending || !webhook}
        >
          {sending ? 'Enviando...' : 'Enviar Mensaje'}
        </button>
      </div>

      {message.threadName && (
        <div className="thread-info">
          <span className="thread-icon">🧵</span>
          <span className="thread-name">Thread: {message.threadName}</span>
        </div>
      )}

      {(message.flags?.suppressEmbeds || message.flags?.suppressNotifications) && (
        <div className="flags-info">
          {message.flags.suppressEmbeds && (
            <span className="flag-badge">🚫 Suppress Embeds</span>
          )}
          {message.flags.suppressNotifications && (
            <span className="flag-badge">🔕 Suppress Notifications</span>
          )}
        </div>
      )}

      <div className="discord-preview">
        <div className="discord-message">
          <div className="message-avatar">
            {displayAvatarUrl ? (
              <img src={displayAvatarUrl} alt={displayUsername} className="avatar-image" />
            ) : (
              <div className="avatar-default">{displayUsername[0]?.toUpperCase()}</div>
            )}
          </div>
          
          <div className="message-content-wrapper">
            <div className="message-header">
              <span className="username">{displayUsername}</span>
              <span className="bot-tag">BOT</span>
              <span className="timestamp">{new Date().toLocaleTimeString()}</span>
            </div>

            {message.content && (
              <div className="message-text">{message.content}</div>
            )}

            {message.files && message.files.length > 0 && (
              <div className="message-files">
                {message.files.map((file) => (
                  <div key={file.id} className="file-preview">
                    {file.file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(file.file)} 
                        alt={file.name}
                        className="file-preview-image"
                      />
                    ) : (
                      <div className="file-preview-generic">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                          <div className="file-preview-name">{file.name}</div>
                          <div className="file-preview-size">
                            {(file.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {message.embeds.map((embed, index) => (
              <div 
                key={index} 
                className="embed"
                style={{ borderLeftColor: embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#5865F2' }}
              >
                {embed.author && embed.author.name && (
                  <div className="embed-author">
                    {embed.author.iconUrl && (
                      <img src={embed.author.iconUrl} alt="" className="embed-author-icon" />
                    )}
                    {embed.author.url ? (
                      <a href={embed.author.url} target="_blank" rel="noopener noreferrer">
                        {embed.author.name}
                      </a>
                    ) : (
                      <span>{embed.author.name}</span>
                    )}
                  </div>
                )}

                {embed.title && (
                  <div className="embed-title">
                    {embed.url ? (
                      <a href={embed.url} target="_blank" rel="noopener noreferrer">
                        {embed.title}
                      </a>
                    ) : (
                      embed.title
                    )}
                  </div>
                )}

                {embed.description && (
                  <div className="embed-description">{embed.description}</div>
                )}

                {embed.fields && embed.fields.length > 0 && (
                  <div className="embed-fields">
                    {embed.fields.map((field, fieldIndex) => (
                      <div 
                        key={fieldIndex} 
                        className={`embed-field ${field.inline ? 'inline' : ''}`}
                      >
                        <div className="field-name">{field.name}</div>
                        <div className="field-value">{field.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {embed.image?.url && (
                  <img src={embed.image.url} alt="" className="embed-image" />
                )}

                {embed.thumbnail?.url && (
                  <img src={embed.thumbnail.url} alt="" className="embed-thumbnail" />
                )}

                {(embed.footer?.text || embed.timestamp) && (
                  <div className="embed-footer">
                    {embed.footer?.iconUrl && (
                      <img src={embed.footer.iconUrl} alt="" className="embed-footer-icon" />
                    )}
                    <span>
                      {embed.footer?.text}
                      {embed.footer?.text && embed.timestamp && ' • '}
                      {embed.timestamp && new Date(embed.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}