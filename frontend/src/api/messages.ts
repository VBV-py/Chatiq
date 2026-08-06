import api from "./axiosInstance";
import { Message } from "../types/message";

export const sendMessage = (chat_id: string, content: string, message_type = "text", sticker_id?: string) =>
  api.post<Message>("/messages", { chat_id, content, message_type, sticker_id }).then(r => r.data);

export const editMessage = (id: string, content: string) =>
  api.put<Message>(`/messages/${id}`, { content }).then(r => r.data);

export const deleteMessage = (id: string) =>
  api.delete(`/messages/${id}`).then(r => r.data);

export const forwardMessage = (id: string, target_chat_id: string) =>
  api.post(`/messages/${id}/forward`, { target_chat_id }).then(r => r.data);
