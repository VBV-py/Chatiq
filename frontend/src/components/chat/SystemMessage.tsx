import { Message } from "../../types/message";
import { formatDate } from "../../utils/formatDate";
interface Props { message: Message; onDelete?: () => void; onKeep?: () => void; }
export function SystemMessage({ message, onDelete, onKeep }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
      <div className="message-bubble ai">
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13 }}>{message.content}</pre>
        {message.message_type === "ai_summary_interactive" && (
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "center" }}>
            <button className="btn btn-sm btn-primary" onClick={onKeep}>Keep Summary</button>
            <button className="btn btn-sm btn-secondary" onClick={onDelete}>Delete</button>
          </div>
        )}
        <div className="message-time" style={{ marginTop: 6 }}>{formatDate(message.created_at)}</div>
      </div>
    </div>
  );
}
