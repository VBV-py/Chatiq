import { Chat } from "../../types/chat";
import { useNavigate } from "react-router-dom";
import { Hash } from "lucide-react";

interface Props { chat: Chat; active?: boolean; onClick?: () => void; }

export function ChatroomCard({ chat, active, onClick }: Props) {
  return (
    <div className={`chat-card ${active ? "active" : ""}`} onClick={onClick}>
      <div className="chat-card-avatar"><Hash size={24} /></div>
      <div className="chat-card-info">
        <div className="chat-card-name">{chat.name || "Chatroom"}</div>
        <div className="chat-card-meta">Group room</div>
      </div>
    </div>
  );
}
