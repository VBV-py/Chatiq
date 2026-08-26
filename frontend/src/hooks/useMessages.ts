import { useEffect, useState } from "react";
import { useMessageStore } from "../store/messageStore";
import { getChatroomMessages } from "../api/chatrooms";
import { getPrivateChatMessages } from "../api/privateChats";

export function useMessages(chatId: string, chatType: "chatroom" | "private" | "group") {
  const { messages, setMessages, prependMessages } = useMessageStore();
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!chatId) return;
    const fetch = chatType === "private" ? getPrivateChatMessages : getChatroomMessages;
    setHasMore(true);
    fetch(chatId, 50, 0).then(msgs => {
      setMessages(chatId, msgs);
      if (msgs.length < 50) setHasMore(false);
    }).catch(() => {});
  }, [chatId, chatType, setMessages]);

  const loadMore = async () => {
    if (!chatId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const fetch = chatType === "private" ? getPrivateChatMessages : getChatroomMessages;
      const currentMsgs = messages[chatId] || [];
      const offset = currentMsgs.length;
      const msgs = await fetch(chatId, 50, offset);
      if (msgs.length < 50) setHasMore(false);
      if (msgs.length > 0) prependMessages(chatId, msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  return { messages: messages[chatId] || [], loadMore, loadingMore, hasMore };
}
