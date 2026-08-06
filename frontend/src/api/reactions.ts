import api from "./axiosInstance";

export const addReaction = (messageId: string, emoji: string) =>
  api.post(`/messages/${messageId}/reactions`, { emoji }).then(r => r.data);

export const removeReaction = (messageId: string, emoji: string) =>
  api.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`).then(r => r.data);
