import api from "./axiosInstance";
import { Chat, Member } from "../types/chat";
import { Message } from "../types/message";

export const createChatroom = (name: string) =>
  api.post<Chat>("/chatrooms", { name }).then(r => r.data);

export const getChatrooms = () =>
  api.get<Chat[]>("/chatrooms").then(r => r.data);

export const getChatroom = (id: string) =>
  api.get<Chat>(`/chatrooms/${id}`).then(r => r.data);

export const inviteMember = (chatId: string, username: string) =>
  api.post(`/chatrooms/${chatId}/invite`, { username }).then(r => r.data);

export const joinChatroom = (chatId: string) =>
  api.post(`/chatrooms/${chatId}/join`).then(r => r.data);

export const removeMember = (chatId: string, userId: string) =>
  api.delete(`/chatrooms/${chatId}/members/${userId}`).then(r => r.data);

export const deleteChatroom = (chatId: string) =>
  api.delete(`/chatrooms/${chatId}`).then(r => r.data);

export const summarizeChatroom = (chatId: string) =>
  api.post(`/chatrooms/${chatId}/summarize`).then(r => r.data);

export const getChatroomMessages = (chatId: string, limit = 100000, offset = 0) =>
  api.get<Message[]>(`/chatrooms/${chatId}/messages`, { params: { limit, offset } }).then(r => r.data);

export const getChatroomMembers = (chatId: string) =>
  api.get<Member[]>(`/chatrooms/${chatId}/members`).then(r => r.data);

export const searchChatroomMessages = (chatId: string, q: string) =>
  api.get<Message[]>(`/chatrooms/${chatId}/search`, { params: { q } }).then(r => r.data);
