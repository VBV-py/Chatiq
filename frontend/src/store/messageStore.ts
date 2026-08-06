import { create } from "zustand";
import { Message } from "../types/message";

interface MessageState {
  messages: Record<string, Message[]>;
  setMessages: (chatId: string, msgs: Message[]) => void;
  addMessage: (chatId: string, msg: Message) => void;
  updateMessage: (chatId: string, msgId: string, updates: Partial<Message>) => void;
  removeMessage: (chatId: string, msgId: string) => void;
  clearMessages: (chatId: string) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: {},
  setMessages: (chatId, msgs) => set(s => ({ messages: { ...s.messages, [chatId]: msgs } })),
  addMessage: (chatId, msg) => set(s => ({
    messages: { ...s.messages, [chatId]: [...(s.messages[chatId] || []), msg] }
  })),
  updateMessage: (chatId, msgId, updates) => set(s => ({
    messages: {
      ...s.messages,
      [chatId]: (s.messages[chatId] || []).map(m => m.id === msgId ? { ...m, ...updates } : m)
    }
  })),
  removeMessage: (chatId, msgId) => set(s => ({
    messages: {
      ...s.messages,
      [chatId]: (s.messages[chatId] || []).map(m => m.id === msgId ? { ...m, deleted: true, content: undefined } : m)
    }
  })),
  clearMessages: (chatId) => set(s => ({ messages: { ...s.messages, [chatId]: [] } })),
}));
