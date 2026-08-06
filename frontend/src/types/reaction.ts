export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  username?: string;
  emoji: string;
  created_at?: string;
}
