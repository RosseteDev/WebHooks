import { Webhook, Message, Embed } from '../types/types';

export class StorageService {
  private static readonly WEBHOOKS_KEY = 'discohook_webhooks';

  /**
   * Valida que una URL sea un webhook válido de Discord
   * @complexity O(1) - Validación constante con regex
   */
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

  /**
   * Genera ID único usando timestamp + random
   * @complexity O(1)
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Carga webhooks desde localStorage con manejo de errores
   * @complexity O(n) donde n = número de webhooks
   */
  static loadWebhooks(): Webhook[] {
    try {
      const stored = localStorage.getItem(this.WEBHOOKS_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading webhooks:', error);
      return [];
    }
  }

  /**
   * Guarda webhooks en localStorage con validación
   * @complexity O(n) - Serialización JSON
   */
  static saveWebhooks(webhooks: Webhook[]): void {
    try {
      if (!Array.isArray(webhooks)) {
        throw new Error('Invalid webhooks array');
      }
      localStorage.setItem(this.WEBHOOKS_KEY, JSON.stringify(webhooks));
    } catch (error) {
      console.error('Error saving webhooks:', error);
      throw error;
    }
  }

  /**
   * Retorna un mensaje por defecto vacío
   * @complexity O(1)
   */
  static getDefaultMessage(): Message {
    return {
      content: '',
      embeds: []
    };
  }

  /**
   * Parsea JSON de mensaje con validación robusta
   * @complexity O(1) - Asignación de propiedades
   */
  static parseMessageJSON(data: any): Message {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid message data');
    }

    return {
      content: typeof data.content === 'string' ? data.content : '',
      username: typeof data.username === 'string' ? data.username : undefined,
      avatarUrl: typeof data.avatar_url === 'string' ? data.avatar_url : undefined,
      embeds: Array.isArray(data.embeds) ? data.embeds.map(this.parseEmbed) : [],
      tts: typeof data.tts === 'boolean' ? data.tts : undefined
    };
  }

  /**
   * Parsea un embed individual con validación de tipos
   * @complexity O(m) donde m = número de fields
   */
  private static parseEmbed(embed: any): Embed {
    if (typeof embed !== 'object' || embed === null) {
      return {};
    }

    return {
      title: typeof embed.title === 'string' ? embed.title : undefined,
      description: typeof embed.description === 'string' ? embed.description : undefined,
      url: typeof embed.url === 'string' ? embed.url : undefined,
      color: typeof embed.color === 'number' ? embed.color : undefined,
      timestamp: typeof embed.timestamp === 'string' ? embed.timestamp : undefined,
      author: this.parseEmbedAuthor(embed.author),
      footer: this.parseEmbedFooter(embed.footer),
      thumbnail: embed.thumbnail?.url ? { url: embed.thumbnail.url } : undefined,
      image: embed.image?.url ? { url: embed.image.url } : undefined,
      fields: Array.isArray(embed.fields) ? embed.fields.map(this.parseField) : undefined
    };
  }

  /**
   * Parsea autor del embed
   */
  private static parseEmbedAuthor(author: any) {
    if (typeof author !== 'object' || author === null) return undefined;
    return {
      name: typeof author.name === 'string' ? author.name : undefined,
      url: typeof author.url === 'string' ? author.url : undefined,
      iconUrl: typeof author.icon_url === 'string' ? author.icon_url : undefined
    };
  }

  /**
   * Parsea footer del embed
   */
  private static parseEmbedFooter(footer: any) {
    if (typeof footer !== 'object' || footer === null) return undefined;
    return {
      text: typeof footer.text === 'string' ? footer.text : undefined,
      iconUrl: typeof footer.icon_url === 'string' ? footer.icon_url : undefined
    };
  }

  /**
   * Parsea field individual
   */
  private static parseField(field: any) {
    if (typeof field !== 'object' || field === null) {
      return { name: '', value: '', inline: false };
    }
    return {
      name: typeof field.name === 'string' ? field.name : '',
      value: typeof field.value === 'string' ? field.value : '',
      inline: typeof field.inline === 'boolean' ? field.inline : false
    };
  }

  /**
   * Limpia localStorage (útil para debugging)
   */
  static clearAll(): void {
    localStorage.removeItem(this.WEBHOOKS_KEY);
  }
}