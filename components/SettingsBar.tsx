import '../css/SettingsBar.css';

interface Props {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBackups: () => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
}

export function SettingsBar({ darkMode, onToggleDarkMode, onOpenBackups, onOpenShare, onOpenSettings }: Props) {
  return (
    <div className="settings-bar">
      <div className="settings-left">
        <h1>Degeneracy Den</h1>
      </div>
      
      <div className="settings-right">
        <button 
          className="settings-btn" 
          onClick={onOpenBackups}
          title="Backups"
        >
          💾
        </button>
        <button 
          className="settings-btn" 
          onClick={onOpenShare}
          title="Compartir Mensaje"
        >
          🔗
        </button>
        <button 
          className="settings-btn" 
          onClick={onOpenSettings}
          title="Configuración"
        >
          ⚙️
        </button>
        <button 
          className="theme-toggle" 
          onClick={onToggleDarkMode}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}
