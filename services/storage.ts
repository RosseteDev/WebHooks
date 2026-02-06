export class StorageService {
  // ... (mantén el resto del código igual)

  static isValidWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const isValidHostname = (
        parsed.hostname === 'discord.com' ||
        parsed.hostname === 'discordapp.com' ||
        parsed.hostname.endsWith('.discord.com')
      );
      
      const hasWebhookPath = parsed.pathname.includes('/api/webhooks/');
      const pathParts = parsed.pathname.split('/');
      const hasIdAndToken = pathParts.length >= 5;
      
      return isValidHostname && hasWebhookPath && hasIdAndToken;
    } catch {
      return false;
    }
  }

  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
