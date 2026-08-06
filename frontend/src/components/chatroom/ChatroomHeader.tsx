import { useState } from "react";
import { Chat, Member } from "../../types/chat";
import { useAuthStore } from "../../store/authStore";
import { deleteChatroom, summarizeChatroom, getChatroomMembers, removeMember } from "../../api/chatrooms";
import { InviteMemberModal } from "./InviteMemberModal";
import { MemberList } from "./MemberList";
import { Modal } from "../shared/Modal";
import { useChatStore } from "../../store/chatStore";
import { useNavigate } from "react-router-dom";
interface Props { chat: Chat; onToggleSearch: () => void; }
export function ChatroomHeader({ chat, onToggleSearch }: Props) {
  const { user } = useAuthStore();
  const { removeChatroom } = useChatStore();
  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
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

  return (
    <>
      <div className="chat-header">
        <button className="btn-icon" onClick={() => navigate("/dashboard")}>←</button>
        <div className="chat-header-info">
          <div className="chat-header-name">🏠 {chat.name}</div>
          <div className="chat-header-sub">Chatroom</div>
        </div>
        <div className="chat-header-actions">
          <button className="btn-icon" title="Search" onClick={onToggleSearch}>🔍</button>
          <button className="btn-icon" title="Members" onClick={loadMembers}>👥</button>
          <button className="btn-icon" title="Invite" onClick={() => setShowInvite(true)}>➕</button>
          <button className="btn-icon" title="AI Summary" onClick={handleSummarize}>🤖</button>
          {isAdmin && <button className="btn-icon" title="Delete Room" onClick={handleDelete} style={{ color: "var(--danger)" }}>🗑️</button>}
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
