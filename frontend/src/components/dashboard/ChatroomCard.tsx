import { Chat } from "../../types/chat";
import { useNavigate } from "react-router-dom";
interface Props { chat: Chat; active?: boolean; }
export function ChatroomCard({ chat, active }: Props) {
  const navigate = useNavigate();
  return (
    <div className={`chat-card ${active ? "active" : ""}`} onClick={() => navigate(`/chatroom/${chat.id}`)}>
      <div className="chat-card-avatar">🏠</div>
      <div className="chat-card-info">
        <div className="chat-card-name">{chat.name || "Chatroom"}</div>
        <div className="chat-card-meta">Group room</div>
      </div>
    </div>
  );
}
