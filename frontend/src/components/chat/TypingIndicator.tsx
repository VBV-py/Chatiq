interface Props { users: string[]; }
export function TypingIndicator({ users }: Props) {
  if (!users.length) return null;
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
      </div>
      <span>{users.join(", ")} {users.length === 1 ? "is" : "are"} typing…</span>
    </div>
  );
}
