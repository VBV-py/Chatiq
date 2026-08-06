import { Reaction } from "./reaction";

export interface Message {
  id: string;
  chat_id: string;
  sender_id?: string;
  sender_type: "user" | "ai";
  sender_username?: string;
  content?: string;
  message_type: "text" | "image" | "video" | "audio" | "file" | "sticker";
  sticker_id?: string;
  edited: boolean;
  deleted: boolean;
  forwarded_from?: string;
  created_at?: string;
  reactions: Reaction[];
  attachments: Attachment[];
  translation?: string;
}

export interface Attachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
}
