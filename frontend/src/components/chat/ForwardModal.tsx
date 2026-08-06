import { Modal } from "../shared/Modal";
import { useChatStore } from "../../store/chatStore";
import { forwardMessage } from "../../api/messages";
interface Props { messageId: string; onClose: () => void; }
export function ForwardModal({ messageId, onClose }: Props) {
  const { chatrooms, privateChats } = useChatStore();
  const all = [...chatrooms, ...privateChats];
  const forward = async (targetChatId: string) => {
    try { await forwardMessage(messageId, targetChatId); onClose(); } catch {}
  };
  return (
    <Modal title="Forward to…" onClose={onClose}>
      <div className="forward-list">
        {all.map(c => (
          <div key={c.id} className="forward-item" onClick={() => forward(c.id)}>
            <span style={{ fontSize: 20 }}>{c.type === "chatroom" ? "🏠" : "💬"}</span>
            <span>{c.name || c.members?.find(m => true)?.username || "Chat"}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
