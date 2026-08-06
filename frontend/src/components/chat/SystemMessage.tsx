import { Message } from "../../types/message";
import { formatDate } from "../../utils/formatDate";
interface Props { message: Message; }
export function SystemMessage({ message }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
      <div className="message-bubble ai">
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13 }}>{message.content}</pre>
        <div className="message-time" style={{ marginTop: 6 }}>{formatDate(message.created_at)}</div>
      </div>
    </div>
  );
}
