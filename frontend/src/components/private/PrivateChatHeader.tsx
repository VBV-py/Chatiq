import { useState } from "react";
import { Chat } from "../../types/chat";
import { useAuthStore } from "../../store/authStore";
import { deletePrivateChat, clearPrivateChatMessages } from "../../api/privateChats";
import { useChatStore } from "../../store/chatStore";
import { useNavigate } from "react-router-dom";
import { AutoResetSettings } from "./AutoResetSettings";
import { Modal } from "../shared/Modal";
import { ArrowLeft, MessageCircle, MoreVertical } from "lucide-react";

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
  const handleClear = async () => {
    if (!confirm("Clear all messages in this chat? This cannot be undone.")) return;
    try { await clearPrivateChatMessages(chat.id); window.location.reload(); } catch {}
  };

  return (
    <>
      <div className="chat-header">
        <button className="btn-icon" onClick={() => navigate("/dashboard")}><ArrowLeft size={20} /></button>
        <div className="chat-header-info">
          <div className="chat-header-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MessageCircle size={18} /> {partner?.username || "Chat"}</div>
          <div className="chat-header-sub">{partner?.is_online ? "● Online" : "○ Offline"}</div>
        </div>
        <div className="chat-header-actions dropdown-container">
          <button className="btn-icon" title="Options" onClick={() => setShowMenu(!showMenu)}><MoreVertical size={20} /></button>
          {showMenu && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { onToggleSearch(); setShowMenu(false); }}>Search</button>
              <button className="dropdown-item" onClick={() => { setShowSettings(true); setShowMenu(false); }}>Auto-Reset Settings</button>
              <button className="dropdown-item danger" onClick={() => { handleClear(); setShowMenu(false); }}>Clear Chat</button>
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
