import '../css/SettingsBar.css';                            // Actualiza

interface Props {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function SettingsBar({ darkMode, onToggleDarkMode }: Props) {
  return (
    <div className="settings-bar">
      <div className="settings-left">
        <h1>Discohook Clone</h1>
      </div>
      
      <div className="settings-right">
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
