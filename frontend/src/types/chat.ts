export interface Chat {
  id: string;
  type: "chatroom" | "private";
  name?: string;
  admin_id?: string;
  auto_reset_enabled?: boolean;
  created_at?: string;
  members?: Member[];
}

export interface Member {
  user_id: string;
  username: string;
  is_online: boolean;
  joined_at?: string;
}
