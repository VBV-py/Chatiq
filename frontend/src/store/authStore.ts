import { create } from "zustand";
import { User } from "../types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem("chatiq_user") || "null"); } catch { return null; }
  })(),
  token: localStorage.getItem("chatiq_token"),
  setAuth: (user, token) => {
    localStorage.setItem("chatiq_token", token);
    localStorage.setItem("chatiq_user", JSON.stringify(user));
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem("chatiq_token");
    localStorage.removeItem("chatiq_user");
    set({ user: null, token: null });
  },
}));
