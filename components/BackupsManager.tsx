import { useState } from 'react';
import { Message } from '../types/types';
import { BackupService } from '../services/backup';
import '../css/BackupsManager.css';

interface Backup {
  id: string;
  name: string;
  message: Message;
  timestamp: number;
}

interface Props {
  currentMessage: Message;
  onLoad: (message: Message) => void;
  onClose: () => void;
}

export function BackupsManager({ currentMessage, onLoad, onClose }: Props) {
  const [backups, setBackups] = useState<Backup[]>(BackupService.loadBackups());
  const [newBackupName, setNewBackupName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSave = () => {
    const name = newBackupName.trim() || `Backup ${new Date().toLocaleString()}`;
    
    const backup: Backup = {
      id: BackupService.generateId(),
      name,
      message: currentMessage,
      timestamp: Date.now()
    };

    BackupService.saveBackup(backup);
    setBackups(BackupService.loadBackups());
    setNewBackupName('');
  };

  const handleLoad = (backup: Backup) => {
    if (window.confirm(`¿Cargar backup "${backup.name}"?`)) {
      onLoad(backup.message);
      onClose();
    }
  };

  const handleDelete = (id: string) => {
    const backup = backups.find(b => b.id === id);
    if (backup && window.confirm(`¿Eliminar "${backup.name}"?`)) {
      BackupService.deleteBackup(id);
      setBackups(BackupService.loadBackups());
    }
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    
    BackupService.renameBackup(id, editName.trim());
    setBackups(BackupService.loadBackups());
    setEditingId(null);
    setEditName('');
  };

  const handleExport = (backup: Backup) => {
    const json = JSON.stringify(backup.message, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backup.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        const backup: Backup = {
          id: BackupService.generateId(),
          name: file.name.replace('.json', ''),
          message: data,
          timestamp: Date.now()
        };

        BackupService.saveBackup(backup);
        setBackups(BackupService.loadBackups());
      } catch (error) {
        alert('Error importando backup: archivo JSON inválido');
        console.error('Import error:', error);
      }
    };
    input.click();
  };

  const sortedBackups = [...backups].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal backups-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Backups</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="backups-content">
          <div className="save-section">
            <h3>Guardar Actual</h3>
            <div className="save-group">
              <input
                type="text"
                placeholder="Nombre del backup (opcional)"
                value={newBackupName}
                onChange={(e) => setNewBackupName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
              <button className="btn-primary" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </div>

          <div className="backups-list-section">
            <div className="section-header">
              <h3>Backups Guardados ({backups.length})</h3>
              <button className="btn-small" onClick={handleImport}>
                Importar JSON
              </button>
            </div>

            {sortedBackups.length === 0 ? (
              <div className="empty-state">
                <p>No hay backups guardados</p>
              </div>
            ) : (
              <div className="backups-list">
                {sortedBackups.map((backup) => (
                  <div key={backup.id} className="backup-item">
                    <div className="backup-info">
                      {editingId === backup.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleRename(backup.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onBlur={() => handleRename(backup.id)}
                          autoFocus
                        />
                      ) : (
                        <>
                          <div className="backup-name">{backup.name}</div>
                          <div className="backup-date">
                            {new Date(backup.timestamp).toLocaleString()}
                          </div>
                          <div className="backup-stats">
                            {backup.message.embeds.length} embed(s) • 
                            {backup.message.content.length} caracteres
                          </div>
                        </>
                      )}
                    </div>

                    <div className="backup-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleLoad(backup)}
                        title="Cargar"
                      >
                        📂
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => {
                          setEditingId(backup.id);
                          setEditName(backup.name);
                        }}
                        title="Renombrar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleExport(backup)}
                        title="Exportar"
                      >
                        💾
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(backup.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
