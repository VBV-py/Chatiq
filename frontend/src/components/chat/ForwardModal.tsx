import { Modal } from "../shared/Modal";
import { useChatStore } from "../../store/chatStore";
import { forwardMessage } from "../../api/messages";
import { Hash, MessageCircle } from "lucide-react";

interface Props { messageId: string; onClose: () => void; }
export function ForwardModal({ messageId, onClose }: Props) {
  const { chatrooms, privateChats } = useChatStore();
  const all = [...chatrooms, ...privateChats];
  const forward = async (targetChatId: string) => {
    try { await forwardMessage(messageId, targetChatId); onClose(); } catch {}
  };
  return (
    <Modal title="Forward to…" onClose={onClose}>
        <div className="sidebar-list" style={{ flex: 1, overflowY: "auto", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          {all.map(c => (
            <div key={c.id} className="member-item chat-card" onClick={() => forward(c.id)} style={{ cursor: "pointer", gap: 12 }}>
              <div className="chat-card-avatar" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.type === "chatroom" ? <Hash size={18} /> : <MessageCircle size={18} />}
              </div>
              <div className="chat-card-name">{c.name || c.members?.find(m => true)?.username || "Chat"}</div>
            </div>
          ))}
        </div>
    </Modal>
  );
}
