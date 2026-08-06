import { Member } from "../../types/chat";
import { useAuthStore } from "../../store/authStore";
interface Props { members: Member[]; adminId?: string; onRemove?: (userId: string) => void; }
export function MemberList({ members, adminId, onRemove }: Props) {
  const { user } = useAuthStore();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {members.map(m => (
        <div key={m.user_id} className="member-item">
          <div className="member-avatar">{m.username.charAt(0).toUpperCase()}</div>
          <span className="member-name">{m.username}</span>
          {m.user_id === adminId && <span style={{ fontSize: 11, color: "var(--accent)", marginLeft: 4 }}>Admin</span>}
          <div className={m.is_online ? "online-dot" : "offline-dot"} />
          {onRemove && user?.id === adminId && m.user_id !== adminId && (
            <button className="btn-ghost btn-sm" onClick={() => onRemove(m.user_id)} style={{ marginLeft: 4 }}>✕</button>
          )}
        </div>
      ))}
    </div>
  );
}
