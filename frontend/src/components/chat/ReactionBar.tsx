import { useState } from "react";
import { Reaction } from "../../types/reaction";
import { addReaction, removeReaction } from "../../api/reactions";
import { useAuthStore } from "../../store/authStore";
interface Props { messageId: string; reactions: Reaction[]; onUpdate: (reactions: Reaction[]) => void; }
export function ReactionBar({ messageId, reactions, onUpdate }: Props) {
  const { user } = useAuthStore();
  const grouped: Record<string, { emoji: string; count: number; hasOwn: boolean; users: string[] }> = {};
  for (const r of reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, hasOwn: false, users: [] };
    grouped[r.emoji].count++;
    grouped[r.emoji].users.push(r.username || r.user_id);
    if (r.user_id === user?.id) grouped[r.emoji].hasOwn = true;
  }
  const toggle = async (emoji: string, hasOwn: boolean) => {
    try {
      if (hasOwn) {
        await removeReaction(messageId, emoji);
        onUpdate(reactions.filter(r => !(r.emoji === emoji && r.user_id === user?.id)));
      } else {
        const r = await addReaction(messageId, emoji);
        onUpdate([...reactions, { ...r, username: user?.username }]);
      }
    } catch {}
  };
  if (!Object.keys(grouped).length) return null;
  return (
    <div className="reaction-bar">
      {Object.values(grouped).map(g => (
        <div key={g.emoji} className={`reaction-pill ${g.hasOwn ? "own" : ""}`} onClick={() => toggle(g.emoji, g.hasOwn)} title={g.users.join(", ")}>
          <span>{g.emoji}</span><span className="reaction-count">{g.count}</span>
        </div>
      ))}
    </div>
  );
}
