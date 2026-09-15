import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getChatroom } from "../api/chatrooms";
import { Chat } from "../types/chat";
import { MessageList } from "../components/chat/MessageList";
import { MessageInput } from "../components/chat/MessageInput";
import { ChatroomHeader } from "../components/chatroom/ChatroomHeader";
import { SearchBar } from "../components/chat/SearchBar";
import { SearchResults } from "../components/chat/SearchResults";
import { TypingIndicator } from "../components/chat/TypingIndicator";
import { useMessages } from "../hooks/useMessages";
import { useSocket } from "../hooks/useSocket";
import { useSearch } from "../hooks/useSearch";
import { useAuthStore } from "../store/authStore";
import { Sticker } from "../types/sticker";
import { Spinner } from "../components/shared/Spinner";

export default function ChatroomPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuthStore();

  const id = chatId || "";
  const { messages, loadMore, loadingMore, hasMore } = useMessages(id, "chatroom");
  const { send, onEvent } = useSocket(id, "chatroom");
  const { results, search, clear } = useSearch(id, "chatroom");

  useEffect(() => {
    if (!id) return;
    getChatroom(id).then(setChat).catch(() => {});
  }, [id]);

  useEffect(() => {
    const unsub1 = onEvent("typing", (d: any) => {
      if (d.user_id !== user?.id) setTypingUsers(u => u.includes(d.username) ? u : [...u, d.username]);
    });
    const unsub2 = onEvent("stop_typing", (d: any) => {
      setTypingUsers(u => u.filter(x => x !== d.username));
    });
    const unsub3 = onEvent("room_expired", () => {
      alert("This room has expired and been deleted.");
      window.location.href = "/dashboard";
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const sendText = (text: string) => send("send_message", { content: text, message_type: "text" });
  const sendSticker = (s: Sticker) => send("send_sticker", { sticker_id: s.id, content: s.image_url });
  const sendMedia = (fileUrl: string, fileName: string, mimeType: string, size: number) => {
    const mtype = mimeType.startsWith("image/") ? "image" : mimeType.startsWith("video/") ? "video" : mimeType.startsWith("audio/") ? "audio" : "file";
    send("send_message", {
      content: fileName,
      message_type: mtype,
      attachments: [{ file_url: fileUrl, file_name: fileName, file_size: size, mime_type: mimeType }],
    });
  };

  if (!chat) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}><Spinner /></div>;

  return (
    <div className="chat-container">
      <ChatroomHeader chat={chat} onToggleSearch={() => { setSearchOpen(s => !s); clear(); }} />
      {searchOpen && (
        <div>
          <SearchBar onSearch={search} onClose={() => { setSearchOpen(false); clear(); }} />
          {results.length > 0 && <SearchResults results={results} />}
        </div>
      )}
      <MessageList messages={messages} chatId={id} loadMore={loadMore} hasMore={hasMore} loadingMore={loadingMore} />
      <TypingIndicator users={typingUsers} />
      <MessageInput
        onSendText={sendText}
        onSendSticker={sendSticker}
        onSendMedia={sendMedia}
        onTyping={() => send("typing", {})}
        onStopTyping={() => send("stop_typing", {})}
      />
    </div>
  );
}
