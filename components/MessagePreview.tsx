import { Message, Webhook } from '../types/types';
import { useState } from 'react';
import '../css/MessagePreview.css';

interface Props {
  message: Message;
  webhook: Webhook | undefined;
}

export function MessagePreview({ message, webhook }: Props) {
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const handleSend = async () => {
    if (!webhook) {
      alert('Selecciona un webhook primero');
      return;
    }

    if (!message.content && message.embeds.length === 0) {
      alert('El mensaje debe tener contenido o al menos un embed');
      return;
    }

    setSending(true);

    try {
      const payload = {
        content: message.content || undefined,
        username: message.username || undefined,
        avatar_url: message.avatarUrl || undefined,
        embeds: message.embeds.length > 0 ? message.embeds : undefined,
        tts: message.tts || undefined
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      setLastSent(new Date());
      alert('✅ Mensaje enviado exitosamente');
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

      {webhook && (
        <div className="webhook-info">
          <div className="webhook-info-line">
            <span className="label">Webhook:</span>
            <span className="value">{webhook.name}</span>
            {webhook.avatarUrl && (
              <img src={webhook.avatarUrl} alt={webhook.name} className="webhook-avatar-small" />
            )}
          </div>
          {lastSent && (
            <div className="webhook-info-line">
              <span className="label">Último envío:</span>
              <span className="value">{lastSent.toLocaleTimeString()}</span>
            </div>
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
