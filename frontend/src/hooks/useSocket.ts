import { useEffect, useRef } from "react";
import { socketClient } from "../socket/socketClient";
import { useAuthStore } from "../store/authStore";
import { useMessageStore } from "../store/messageStore";
import { Message } from "../types/message";

export function useSocket(chatId: string, chatType: "chatroom" | "private") {
  const { token } = useAuthStore();
  const { addMessage, updateMessage, removeMessage, clearMessages } = useMessageStore();
  const connected = useRef(false);

  useEffect(() => {
    if (!chatId || !token) return;
    if (connected.current) return;
    connected.current = true;

    socketClient.connect(chatId, token, chatType);

    const unsubs = [
      socketClient.on("receive_message", (data) => addMessage(chatId, data as Message)),
      socketClient.on("message_edited", (data: any) => updateMessage(chatId, data.id, { content: data.content, edited: true })),
      socketClient.on("message_deleted", (data: any) => removeMessage(chatId, data.message_id)),
      socketClient.on("reaction_added", (data: any) => {
        useMessageStore.getState().updateMessage(chatId, data.message_id, {
          reactions: [...(useMessageStore.getState().messages[chatId]?.find(m => m.id === data.message_id)?.reactions || []), data]
        });
      }),
      socketClient.on("reaction_removed", (data: any) => {
        const msgs = useMessageStore.getState().messages[chatId] || [];
        const msg = msgs.find(m => m.id === data.message_id);
        if (msg) {
          updateMessage(chatId, data.message_id, {
            reactions: msg.reactions.filter(r => !(r.user_id === data.user_id && r.emoji === data.emoji))
          });
        }
      }),
      socketClient.on("chat_reset", () => clearMessages(chatId)),
      socketClient.on("error", (data: any) => {
        const text = typeof data === "string" ? data : (data?.detail || "Message action failed");
        console.error("[WS ERROR]", text);
        alert(text);
      }),
    ];

    return () => {
      unsubs.forEach(u => u());
      socketClient.disconnect();
      connected.current = false;
    };
  }, [chatId, token]);

  const send = (event: string, data: unknown) => socketClient.send(event, data);
  const onEvent = (event: string, handler: (data: unknown) => void) => socketClient.on(event, handler);

  return { send, onEvent };
}
