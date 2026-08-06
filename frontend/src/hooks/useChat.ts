import { useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { getChatrooms } from "../api/chatrooms";
import { getPrivateChats } from "../api/privateChats";

export function useChat() {
  const { chatrooms, privateChats, setChatrooms, setPrivateChats } = useChatStore();

  const refresh = async () => {
    try {
      const [rooms, privates] = await Promise.all([getChatrooms(), getPrivateChats()]);
      setChatrooms(rooms);
      setPrivateChats(privates);
    } catch {}
  };

  useEffect(() => { refresh(); }, []);

  return { chatrooms, privateChats, refresh };
}
