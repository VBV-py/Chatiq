import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPrivateChats } from "../api/privateChats";
import { Chat } from "../types/chat";
import { MessageList } from "../components/chat/MessageList";
import { MessageInput } from "../components/chat/MessageInput";
import { PrivateChatHeader } from "../components/private/PrivateChatHeader";
import { SearchBar } from "../components/chat/SearchBar";
import { SearchResults } from "../components/chat/SearchResults";
import { TypingIndicator } from "../components/chat/TypingIndicator";
import { useMessages } from "../hooks/useMessages";
import { useSocket } from "../hooks/useSocket";
import { useSearch } from "../hooks/useSearch";
import { useAuthStore } from "../store/authStore";
import { Sticker } from "../types/sticker";
import { Spinner } from "../components/shared/Spinner";

export default function PrivateChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuthStore();

  const id = chatId || "";
  const { messages } = useMessages(id, "private");
  const { send, onEvent } = useSocket(id, "private");
  const { results, search, clear } = useSearch(id, "private");

  useEffect(() => {
    if (!id) return;
    getPrivateChats().then(chats => { const c = chats.find(x => x.id === id); if (c) setChat(c); }).catch(() => {});
  }, [id]);

  useEffect(() => {
    const u1 = onEvent("typing", (d: any) => {
      if (d.user_id !== user?.id) setTypingUsers(u => u.includes(d.username) ? u : [...u, d.username]);
    });
    const u2 = onEvent("stop_typing", (d: any) => setTypingUsers(u => u.filter(x => x !== d.username)));
    const u3 = onEvent("chat_reset", () => alert("This chat was auto-reset."));
    const u4 = onEvent("user_online", (d: any) => setChat(c => c ? { ...c, members: c.members?.map(m => m.user_id === d.user_id ? { ...m, is_online: true } : m) } : c));
    const u5 = onEvent("user_offline", (d: any) => setChat(c => c ? { ...c, members: c.members?.map(m => m.user_id === d.user_id ? { ...m, is_online: false } : m) } : c));
    return () => { u1(); u2(); u3(); u4(); u5(); };
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
    <div className="app-layout" style={{ flexDirection: "column", height: "100vh" }}>
      <PrivateChatHeader chat={chat} onToggleSearch={() => { setSearchOpen(s => !s); clear(); }} onUpdate={setChat} />
      {searchOpen && (
        <div>
          <SearchBar onSearch={search} onClose={() => { setSearchOpen(false); clear(); }} />
          {results.length > 0 && <SearchResults results={results} />}
        </div>
      )}
      <MessageList messages={messages} chatId={id} />
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
