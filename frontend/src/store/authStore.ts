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
    try { return JSON.parse(localStorage.getItem("nexus_user") || "null"); } catch { return null; }
  })(),
  token: localStorage.getItem("nexus_token"),
  setAuth: (user, token) => {
    localStorage.setItem("nexus_token", token);
    localStorage.setItem("nexus_user", JSON.stringify(user));
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    set({ user: null, token: null });
  },
}));
