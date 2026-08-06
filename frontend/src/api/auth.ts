import api from "./axiosInstance";
import { TokenResponse } from "../types/user";

export const register = (username: string, email: string, password: string) =>
  api.post<TokenResponse>("/register", { username, email, password }).then(r => r.data);

export const login = (email: string, password: string) =>
  api.post<TokenResponse>("/login", { email, password }).then(r => r.data);

export const logout = () => api.post("/logout");

export const getMe = () => api.get("/me").then(r => r.data);

export const updateLanguage = (preferred_language: string) =>
  api.patch("/me/language", { preferred_language }).then(r => r.data);
