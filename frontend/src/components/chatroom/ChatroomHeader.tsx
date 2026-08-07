import { useState } from "react";
import { Chat, Member } from "../../types/chat";
import { useAuthStore } from "../../store/authStore";
import { deleteChatroom, summarizeChatroom, getChatroomMembers, removeMember, clearChatroomMessages } from "../../api/chatrooms";
import { InviteMemberModal } from "./InviteMemberModal";
import { MemberList } from "./MemberList";
import { Modal } from "../shared/Modal";
import { useChatStore } from "../../store/chatStore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, MoreVertical } from "lucide-react";

interface Props { chat: Chat; onToggleSearch: () => void; }
export function ChatroomHeader({ chat, onToggleSearch }: Props) {
  const { user } = useAuthStore();
  const { removeChatroom } = useChatStore();
  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const isAdmin = user?.id === chat.admin_id;

  const loadMembers = async () => {
    const m = await getChatroomMembers(chat.id);
    setMembers(m);
    setShowMembers(true);
  };
  const handleDelete = async () => {
    if (!confirm("Delete this room?")) return;
    try { await deleteChatroom(chat.id); removeChatroom(chat.id); navigate("/dashboard"); } catch {}
  };
  const handleSummarize = async () => {
    try { await summarizeChatroom(chat.id); } catch {}
  };
  const handleRemoveMember = async (userId: string) => {
    try { await removeMember(chat.id, userId); setMembers(m => m.filter(x => x.user_id !== userId)); } catch {}
  };
  const handleClear = async () => {
    if (!confirm("Clear all messages in this chat? This cannot be undone.")) return;
    try { await clearChatroomMessages(chat.id); window.location.reload(); } catch {}
  };

  return (
    <>
      <div className="chat-header">
        <button className="btn-icon" onClick={() => navigate("/dashboard")}><ArrowLeft size={20} /></button>
        <div className="chat-header-info">
          <div className="chat-header-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Hash size={18} /> {chat.name}</div>
          <div className="chat-header-sub">Chatroom</div>
        </div>
        <div className="chat-header-actions dropdown-container">
          <button className="btn-icon" title="Options" onClick={() => setShowMenu(!showMenu)}><MoreVertical size={20} /></button>
          {showMenu && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { onToggleSearch(); setShowMenu(false); }}>Search</button>
              <button className="dropdown-item" onClick={() => { loadMembers(); setShowMenu(false); }}>Members</button>
              <button className="dropdown-item" onClick={() => { setShowInvite(true); setShowMenu(false); }}>Invite</button>
              <button className="dropdown-item" onClick={() => { handleSummarize(); setShowMenu(false); }}>AI Summary</button>
              <button className="dropdown-item danger" onClick={() => { handleClear(); setShowMenu(false); }}>Clear Chat</button>
              {isAdmin && <button className="dropdown-item danger" onClick={() => { handleDelete(); setShowMenu(false); }}>Delete Room</button>}
            </div>
          )}
        </div>
      </div>
      {showInvite && <InviteMemberModal chatId={chat.id} onClose={() => setShowInvite(false)} />}
      {showMembers && (
        <Modal title="Members" onClose={() => setShowMembers(false)}>
          <MemberList members={members} adminId={chat.admin_id} onRemove={isAdmin ? handleRemoveMember : undefined} />
        </Modal>
      )}
    </>
  );
}
