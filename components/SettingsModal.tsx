import { useState } from 'react';
import '../css/SettingsModal.css';

interface Settings {
  compactMode: boolean;
  autoSave: boolean;
  confirmBeforeSend: boolean;
  showCharCount: boolean;
  defaultEmbedColor: string;
}

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem('discohook_settings');
      return stored ? JSON.parse(stored) : getDefaultSettings();
    } catch {
      return getDefaultSettings();
    }
  });

  function getDefaultSettings(): Settings {
    return {
      compactMode: false,
      autoSave: true,
      confirmBeforeSend: true,
      showCharCount: true,
      defaultEmbedColor: '#5865F2'
    };
  }

  const handleChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('discohook_settings', JSON.stringify(newSettings));
  };

  const handleReset = () => {
    if (window.confirm('¿Restablecer todas las configuraciones?')) {
      const defaults = getDefaultSettings();
      setSettings(defaults);
      localStorage.setItem('discohook_settings', JSON.stringify(defaults));
    }
  };

  const handleClearData = () => {
    if (window.confirm('⚠️ Esto eliminará TODOS los datos guardados (webhooks, backups, configuraciones). ¿Continuar?')) {
      if (window.confirm('¿Estás SEGURO? Esta acción NO se puede deshacer.')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const getStorageUsage = () => {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      // Aproximado en KB
      return (total / 1024).toFixed(2);
    } catch {
      return '0';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configuración</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>Apariencia</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Modo Compacto</label>
                <p>Reduce el espaciado entre elementos</p>
              </div>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleChange('compactMode', e.target.checked)}
              />
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Mostrar Contador de Caracteres</label>
                <p>Muestra el contador en todos los campos de texto</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showCharCount}
                onChange={(e) => handleChange('showCharCount', e.target.checked)}
              />
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Color por Defecto de Embeds</label>
                <p>Color inicial para nuevos embeds</p>
              </div>
              <div className="color-picker">
                <input
                  type="color"
                  value={settings.defaultEmbedColor}
                  onChange={(e) => handleChange('defaultEmbedColor', e.target.value)}
                />
                <input
                  type="text"
                  value={settings.defaultEmbedColor}
                  onChange={(e) => handleChange('defaultEmbedColor', e.target.value)}
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h3>Comportamiento</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Auto-Guardar</label>
                <p>Guarda automáticamente los cambios</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
              />
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Confirmar Antes de Enviar</label>
                <p>Pide confirmación antes de enviar mensajes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.confirmBeforeSend}
                onChange={(e) => handleChange('confirmBeforeSend', e.target.checked)}
              />
            </div>
          </section>

          <section className="settings-section">
            <h3>Almacenamiento</h3>
            
            <div className="storage-info">
              <div className="storage-stat">
                <span>Uso de Almacenamiento:</span>
                <strong>{getStorageUsage()} KB</strong>
              </div>
              <div className="storage-stat">
                <span>Límite del Navegador:</span>
                <strong>~5-10 MB</strong>
              </div>
            </div>

            <div className="storage-actions">
              <button className="btn-danger" onClick={handleClearData}>
                Borrar Todos los Datos
              </button>
              <p className="warning-small">
                Esta acción eliminará webhooks, backups y configuraciones
              </p>
            </div>
          </section>

          <section className="settings-section">
            <h3>Acerca de</h3>
            
            <div className="about-info">
              <p><strong>Degeneracy Den</strong></p>
              <p>Clon de Discohook para Discord webhooks</p>
              <p className="version">Versión 1.0.0</p>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={handleReset}>
            Restablecer Configuración
          </button>
          <button className="btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
