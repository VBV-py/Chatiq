import { useState } from "react";
import { Message } from "../../types/message";
import { useAuthStore } from "../../store/authStore";
import { useMessageStore } from "../../store/messageStore";
import { editMessage, deleteMessage } from "../../api/messages";
import { translateMessage } from "../../api/ai";
import { formatDate } from "../../utils/formatDate";
import { MessageMenu } from "./MessageMenu";
import { ReactionBar } from "./ReactionBar";
import { TranslationOverlay } from "./TranslationOverlay";
import { MediaPreview } from "./MediaPreview";
import { EmojiPicker } from "./EmojiPicker";
import { ForwardModal } from "./ForwardModal";
import { SystemMessage } from "./SystemMessage";
import { addReaction } from "../../api/reactions";

interface Props { message: Message; chatId: string; }
export function MessageItem({ message, chatId }: Props) {
  const { user } = useAuthStore();
  const { updateMessage, removeMessage } = useMessageStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(message.content || "");
  const [translation, setTranslation] = useState<string>();
  const isOwn = message.sender_id === user?.id;

  if (message.sender_type === "ai") return <SystemMessage message={message} />;
  if (message.deleted) return (
    <div className={`message-wrapper ${isOwn ? "own" : "other"}`}>
      <div className={`message-bubble ${isOwn ? "own" : "other"} message-deleted`}>Message deleted</div>
    </div>
  );

  if (message.message_type === "sticker") return (
    <div className={`message-wrapper ${isOwn ? "own" : "other"}`}>
      {!isOwn && <div className="message-sender">{message.sender_username}</div>}
      <img src={message.content || ""} alt="sticker" style={{ width: 80, height: 80 }} />
      <div className="message-time">{formatDate(message.created_at)}</div>
    </div>
  );

  const handleEdit = async () => {
    try { const m = await editMessage(message.id, editVal); updateMessage(chatId, message.id, m); setEditing(false); } catch {}
  };
  const handleDelete = async () => {
    try { await deleteMessage(message.id); removeMessage(chatId, message.id); } catch {}
  };
  const handleTranslate = async () => {
    const res = await translateMessage(message.content || "");
    setTranslation(res.translated);
  };
  const handleReact = async (emoji: string) => {
    try {
      const r = await addReaction(message.id, emoji);
      updateMessage(chatId, message.id, { reactions: [...message.reactions, { ...r, username: user?.username }] });
    } catch {}
  };

  return (
    <div className={`message-wrapper ${isOwn ? "own" : "other"}`} style={{ position: "relative" }}>
      {!isOwn && <div className="message-sender">{message.sender_username}</div>}
      <div
        className={`message-bubble ${isOwn ? "own" : "other"}`}
        onContextMenu={e => { e.preventDefault(); setShowMenu(true); }}
        style={{ cursor: "context-menu" }}
      >
        {message.forwarded_from && <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>↪ Forwarded</div>}
        {editing ? (
          <div>
            <input value={editVal} onChange={e => setEditVal(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: "inherit", width: "100%", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <button className="btn btn-sm btn-primary" onClick={handleEdit}>Save</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {message.message_type === "text" && <span>{message.content}</span>}
            <MediaPreview attachments={message.attachments} messageType={message.message_type} />
            {message.edited && <span className="message-edited"> (edited)</span>}
          </>
        )}
        <div className="message-time">{formatDate(message.created_at)}</div>
      </div>
      <TranslationOverlay translation={translation} onClear={() => setTranslation(undefined)} />
      <ReactionBar messageId={message.id} reactions={message.reactions} onUpdate={r => updateMessage(chatId, message.id, { reactions: r })} />
      {showEmoji && <EmojiPicker onSelect={handleReact} onClose={() => setShowEmoji(false)} />}
      {showMenu && (
        <MessageMenu
          isOwn={isOwn}
          onEdit={isOwn ? () => setEditing(true) : undefined}
          onDelete={isOwn ? handleDelete : undefined}
          onCopy={() => navigator.clipboard.writeText(message.content || "")}
          onForward={() => setShowForward(true)}
          onTranslate={handleTranslate}
          onReact={() => setShowEmoji(true)}
          onClose={() => setShowMenu(false)}
        />
      )}
      {showForward && <ForwardModal messageId={message.id} onClose={() => setShowForward(false)} />}
    </div>
  );
}
