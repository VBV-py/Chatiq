import { create } from "zustand";
import { Chat } from "../types/chat";

interface ChatState {
  chatrooms: Chat[];
  privateChats: Chat[];
  setChatrooms: (chats: Chat[]) => void;
  setPrivateChats: (chats: Chat[]) => void;
  removeChatroom: (id: string) => void;
  removePrivateChat: (id: string) => void;
  addChatroom: (chat: Chat) => void;
  addPrivateChat: (chat: Chat) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatrooms: [],
  privateChats: [],
  setChatrooms: (chatrooms) => set({ chatrooms }),
  setPrivateChats: (privateChats) => set({ privateChats }),
  removeChatroom: (id) => set(s => ({ chatrooms: s.chatrooms.filter(c => c.id !== id) })),
  removePrivateChat: (id) => set(s => ({ privateChats: s.privateChats.filter(c => c.id !== id) })),
  addChatroom: (chat) => set(s => ({ chatrooms: [chat, ...s.chatrooms] })),
  addPrivateChat: (chat) => set(s => ({ privateChats: [chat, ...s.privateChats] })),
}));
