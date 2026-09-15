import { create } from "zustand";
import { Chat } from "../types/chat";

interface ChatState {
  chatrooms: Chat[];
  groups: Chat[];
  privateChats: Chat[];
  setChatrooms: (c: Chat[]) => void;
  setGroups: (c: Chat[]) => void;
  setPrivateChats: (c: Chat[]) => void;
  addChatroom: (c: Chat) => void;
  addGroup: (c: Chat) => void;
  addPrivateChat: (c: Chat) => void;
  removeChatroom: (id: string) => void;
  removeGroup: (id: string) => void;
  removePrivateChat: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatrooms: [],
  groups: [],
  privateChats: [],
  setChatrooms: (c) => set({ chatrooms: c }),
  setGroups: (c) => set({ groups: c }),
  setPrivateChats: (c) => set({ privateChats: c }),
  addChatroom: (c) => set(s => ({ chatrooms: [...s.chatrooms, c] })),
  addGroup: (c) => set(s => ({ groups: [...s.groups, c] })),
  addPrivateChat: (c) => set(s => ({ privateChats: [...s.privateChats, c] })),
  removeChatroom: (id) => set(s => ({ chatrooms: s.chatrooms.filter(x => x.id !== id) })),
  removeGroup: (id) => set(s => ({ groups: s.groups.filter(x => x.id !== id) })),
  removePrivateChat: (id) => set(s => ({ privateChats: s.privateChats.filter(x => x.id !== id) })),
}));
