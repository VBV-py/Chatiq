import { useState } from "react";
import { searchChatroomMessages } from "../api/chatrooms";
import { searchPrivateChatMessages } from "../api/privateChats";
import { Message } from "../types/message";

export function useSearch(chatId: string, chatType: "chatroom" | "private") {
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const fn = chatType === "chatroom" ? searchChatroomMessages : searchPrivateChatMessages;
      const data = await fn(chatId, q);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setResults([]);
  return { results, loading, search, clear };
}
