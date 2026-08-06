import { Chat } from "../../types/chat";
import { proposeAutoReset, acceptAutoReset, disableAutoReset } from "../../api/privateChats";
interface Props { chat: Chat; currentUserId: string; onUpdate: (c: Chat) => void; }
export function AutoResetSettings({ chat, currentUserId, onUpdate }: Props) {
  const accepted = chat.auto_reset_accepted_by || ([] as string[]);
  const hasMine = accepted.includes(currentUserId);
  const propose = async () => { try { const c = await proposeAutoReset(chat.id); onUpdate(c); } catch {} };
  const accept = async () => { try { const c = await acceptAutoReset(chat.id); onUpdate(c); } catch {} };
  const disable = async () => { try { const c = await disableAutoReset(chat.id); onUpdate(c); } catch {} };
  return (
    <div className="auto-reset-panel">
      <div className="auto-reset-title">⏰ 24-Hour Auto-Reset</div>
      <div className="auto-reset-status">
        {chat.auto_reset_enabled ? "✅ Active — chat clears every 24 hours" : hasMine ? "⏳ Waiting for other user to accept" : "Off"}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {!chat.auto_reset_enabled && !hasMine && <button className="btn btn-secondary btn-sm" onClick={propose}>Propose</button>}
        {!chat.auto_reset_enabled && hasMine && <button className="btn btn-primary btn-sm" onClick={accept}>Accept</button>}
        {(chat.auto_reset_enabled || hasMine) && <button className="btn btn-danger btn-sm" onClick={disable}>Disable</button>}
      </div>
    </div>
  );
}
