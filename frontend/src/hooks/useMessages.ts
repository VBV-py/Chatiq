import { useEffect } from "react";
import { useMessageStore } from "../store/messageStore";
import { getChatroomMessages } from "../api/chatrooms";
import { getPrivateChatMessages } from "../api/privateChats";

export function useMessages(chatId: string, chatType: "chatroom" | "private") {
  const { messages, setMessages } = useMessageStore();

  useEffect(() => {
    if (!chatId) return;
    const fetch = chatType === "chatroom" ? getChatroomMessages : getPrivateChatMessages;
    fetch(chatId).then(msgs => setMessages(chatId, msgs)).catch(() => {});
  }, [chatId]);

  return { messages: messages[chatId] || [] };
}
