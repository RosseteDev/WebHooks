export interface Webhook {
  id: string;
  name: string;
  url: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedAuthor {
  name?: string;
  url?: string;
  iconUrl?: string;
}

export interface EmbedFooter {
  text?: string;
  iconUrl?: string;
}

export interface Embed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  author?: EmbedAuthor;
  footer?: EmbedFooter;
  thumbnail?: { url?: string };
  image?: { url?: string };
  fields?: EmbedField[];
}

export interface Message {
  content: string;
  username?: string;
  avatarUrl?: string;
  embeds: Embed[];
  tts?: boolean;
}

export interface WebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: Embed[];
  tts?: boolean;
}