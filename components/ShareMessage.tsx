import { useState } from 'react';
import { Message } from '../types/types';
import '../css/ShareMessage.css';

interface Props {
  message: Message;
  onClose: () => void;
}

export function ShareMessage({ message, onClose }: Props) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateShareUrl = () => {
    setGenerating(true);
    
    try {
      // Codificar mensaje en base64 URL-safe
      const json = JSON.stringify(message);
      const base64 = btoa(encodeURIComponent(json)
        .replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
      
      const urlSafe = base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      const url = `${window.location.origin}${window.location.pathname}?share=${urlSafe}`;
      
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share URL:', error);
      alert('Error al generar URL de compartir');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      
      // Fallback para navegadores sin clipboard API
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMessageStats = () => {
    const stats = {
      hasContent: !!message.content,
      embedCount: message.embeds.length,
      totalChars: message.content.length,
      hasCustomProfile: !!(message.username || message.avatarUrl)
    };
    
    return stats;
  };

  const stats = getMessageStats();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Compartir Mensaje</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="share-content">
          <div className="share-info">
            <p>Genera un enlace para compartir la configuración actual del mensaje.</p>
            <p className="warning">
              ⚠️ El enlace contiene toda la configuración del mensaje. 
              Cualquiera con el enlace podrá ver y copiar tu configuración.
            </p>
          </div>

          <div className="message-stats">
            <h3>Resumen del Mensaje</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Contenido:</span>
                <span className="stat-value">
                  {stats.hasContent ? `${stats.totalChars} caracteres` : 'Sin contenido'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Embeds:</span>
                <span className="stat-value">{stats.embedCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Perfil personalizado:</span>
                <span className="stat-value">{stats.hasCustomProfile ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>

          {!shareUrl ? (
            <button
              className="btn-primary btn-generate"
              onClick={generateShareUrl}
              disabled={generating}
            >
              {generating ? 'Generando...' : 'Generar Enlace'}
            </button>
          ) : (
            <div className="url-section">
              <div className="url-display">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  className={`btn-copy ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              
              <div className="url-info">
                <p>Longitud: {shareUrl.length} caracteres</p>
                {shareUrl.length > 2000 && (
                  <p className="warning-text">
                    ⚠️ URL muy larga. Algunos servicios pueden tener problemas.
                  </p>
                )}
              </div>

              <div className="share-actions">
                <button
                  className="btn-small"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this Discord message:')}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  Compartir en Twitter
                </button>
                <button
                  className="btn-small"
                  onClick={() => window.open(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Discord Message')}`, '_blank')}
                >
                  Compartir en Reddit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
