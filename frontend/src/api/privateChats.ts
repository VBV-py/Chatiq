import api from "./axiosInstance";
import { Chat } from "../types/chat";
import { Message } from "../types/message";

export const createPrivateChat = (target_username: string) =>
  api.post<Chat>("/private-chats", null, { params: { target_username } }).then(r => r.data);

export const getPrivateChats = () =>
  api.get<Chat[]>("/private-chats").then(r => r.data);

export const getPrivateChatMessages = (chatId: string, limit = 100000, offset = 0) =>
  api.get<Message[]>(`/private-chats/${chatId}/messages`, { params: { limit, offset } }).then(r => r.data);

export const searchPrivateChatMessages = (chatId: string, q: string) =>
  api.get<Message[]>(`/private-chats/${chatId}/search`, { params: { q } }).then(r => r.data);

export const deletePrivateChat = (chatId: string) =>
  api.delete(`/private-chats/${chatId}`).then(r => r.data);

export const proposeAutoReset = (chatId: string) =>
  api.post(`/private-chats/${chatId}/auto-reset/propose`).then(r => r.data);

export const acceptAutoReset = (chatId: string) =>
  api.post(`/private-chats/${chatId}/auto-reset/accept`).then(r => r.data);

export const disableAutoReset = (chatId: string) =>
  api.post(`/private-chats/${chatId}/auto-reset/disable`).then(r => r.data);
