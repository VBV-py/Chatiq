export interface User {
  id: string;
  username: string;
  email: string;
  preferred_language: string;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
