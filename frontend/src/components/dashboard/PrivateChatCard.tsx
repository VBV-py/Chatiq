import { Chat } from "../../types/chat";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
interface Props { chat: Chat; active?: boolean; }
export function PrivateChatCard({ chat, active }: Props) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const partner = chat.members?.find(m => m.user_id !== user?.id);
  return (
    <div className={`chat-card ${active ? "active" : ""}`} onClick={() => navigate(`/private/${chat.id}`)}>
      <div className="chat-card-avatar">{partner?.username?.charAt(0)?.toUpperCase() || "?"}</div>
      <div className="chat-card-info">
        <div className="chat-card-name">{partner?.username || "Private Chat"}</div>
        <div className="chat-card-meta" style={{ color: partner?.is_online ? "var(--success)" : undefined }}>
          {partner?.is_online ? "● Online" : "○ Offline"}
        </div>
      </div>
    </div>
  );
}
