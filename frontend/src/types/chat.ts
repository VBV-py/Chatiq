export interface Chat {
  id: string;
  type: "chatroom" | "private" | "group";
  name?: string;
  admin_id?: string;
  auto_reset_enabled?: boolean;
  auto_reset_accepted_by?: string[];
  created_at?: string;
  members?: Member[];
}

export interface Member {
  user_id: string;
  username: string;
  is_online: boolean;
  joined_at?: string;
}
