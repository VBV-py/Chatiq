import { useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { getChatrooms } from "../api/chatrooms";
import { getPrivateChats } from "../api/privateChats";

export function useChat() {
  const { chatrooms, groups, privateChats, setChatrooms, setGroups, setPrivateChats } = useChatStore();

  const refresh = async () => {
    try {
      const [rooms, privates] = await Promise.all([getChatrooms(), getPrivateChats()]);
      const onlyChatrooms = rooms.filter(r => r.type === "chatroom");
      const onlyGroups = rooms.filter(r => r.type === "group");
      setChatrooms(onlyChatrooms);
      setGroups(onlyGroups);
      setPrivateChats(privates);
    } catch {}
  };

  useEffect(() => { refresh(); }, []);

  return { chatrooms, groups, privateChats, refresh };
}
