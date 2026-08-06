import { useState } from "react";
import { Chat } from "../../types/chat";
import { useAuthStore } from "../../store/authStore";
import { deletePrivateChat } from "../../api/privateChats";
import { useChatStore } from "../../store/chatStore";
import { useNavigate } from "react-router-dom";
import { AutoResetSettings } from "./AutoResetSettings";
import { Modal } from "../shared/Modal";
interface Props { chat: Chat; onToggleSearch: () => void; onUpdate: (c: Chat) => void; }
export function PrivateChatHeader({ chat, onToggleSearch, onUpdate }: Props) {
  const { user } = useAuthStore();
  const { removePrivateChat } = useChatStore();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const partner = chat.members?.find(m => m.user_id !== user?.id);

  const handleDelete = async () => {
    if (!confirm("Delete this chat?")) return;
    try { await deletePrivateChat(chat.id); removePrivateChat(chat.id); navigate("/dashboard"); } catch {}
  };

  return (
    <>
      <div className="chat-header">
        <button className="btn-icon" onClick={() => navigate("/dashboard")}>←</button>
        <div className="chat-header-info">
          <div className="chat-header-name">💬 {partner?.username || "Chat"}</div>
          <div className="chat-header-sub">{partner?.is_online ? "● Online" : "○ Offline"}</div>
        </div>
        <div className="chat-header-actions">
          <button className="btn-icon" title="Search" onClick={onToggleSearch}>🔍</button>
          <button className="btn-icon" title="Auto-Reset Settings" onClick={() => setShowSettings(true)}>⏰</button>
          <button className="btn-icon" title="Delete Chat" onClick={handleDelete} style={{ color: "var(--danger)" }}>🗑️</button>
        </div>
      </div>
      {showSettings && (
        <Modal title="Auto-Reset Settings" onClose={() => setShowSettings(false)}>
          <AutoResetSettings chat={chat} currentUserId={user?.id || ""} onUpdate={c => { onUpdate(c); setShowSettings(false); }} />
        </Modal>
      )}
    </>
  );
}
