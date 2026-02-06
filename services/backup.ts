import { Message } from '../types/types';

interface Backup {
  id: string;
  name: string;
  message: Message;
  timestamp: number;
}

export class BackupService {
  private static readonly BACKUPS_KEY = 'discohook_backups';
  private static readonly MAX_BACKUPS = 50;

  static generateId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static loadBackups(): Backup[] {
    try {
      const stored = localStorage.getItem(this.BACKUPS_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading backups:', error);
      return [];
    }
  }

  static saveBackup(backup: Backup): void {
    try {
      const backups = this.loadBackups();
      
      // Agregar nuevo backup
      backups.push(backup);
      
      // Limitar cantidad (FIFO)
      if (backups.length > this.MAX_BACKUPS) {
        backups.sort((a, b) => b.timestamp - a.timestamp);
        backups.splice(this.MAX_BACKUPS);
      }
      
      localStorage.setItem(this.BACKUPS_KEY, JSON.stringify(backups));
    } catch (error) {
      console.error('Error saving backup:', error);
      throw new Error('No se pudo guardar el backup');
    }
  }

  static deleteBackup(id: string): void {
    try {
      const backups = this.loadBackups().filter(b => b.id !== id);
      localStorage.setItem(this.BACKUPS_KEY, JSON.stringify(backups));
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw new Error('No se pudo eliminar el backup');
    }
  }

  static renameBackup(id: string, newName: string): void {
    try {
      const backups = this.loadBackups();
      const backup = backups.find(b => b.id === id);
      
      if (backup) {
        backup.name = newName;
        localStorage.setItem(this.BACKUPS_KEY, JSON.stringify(backups));
      }
    } catch (error) {
      console.error('Error renaming backup:', error);
      throw new Error('No se pudo renombrar el backup');
    }
  }

  static clearAll(): void {
    localStorage.removeItem(this.BACKUPS_KEY);
  }
}
