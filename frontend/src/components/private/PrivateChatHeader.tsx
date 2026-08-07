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
  const [showMenu, setShowMenu] = useState(false);
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
        <div className="chat-header-actions dropdown-container">
          <button className="btn-icon" title="Options" onClick={() => setShowMenu(!showMenu)}>⋮</button>
          {showMenu && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { onToggleSearch(); setShowMenu(false); }}>Search</button>
              <button className="dropdown-item" onClick={() => { setShowSettings(true); setShowMenu(false); }}>Auto-Reset Settings</button>
              <button className="dropdown-item danger" onClick={() => { handleDelete(); setShowMenu(false); }}>Delete Chat</button>
            </div>
          )}
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
