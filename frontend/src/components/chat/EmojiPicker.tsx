import { ALLOWED_EMOJIS } from "../../utils/constants";
interface Props { onSelect: (emoji: string) => void; onClose: () => void; }
export function EmojiPicker({ onSelect, onClose }: Props) {
  return (
    <div className="emoji-picker" onClick={e => e.stopPropagation()}>
      {ALLOWED_EMOJIS.map(e => (
        <button key={e} className="emoji-btn" onClick={() => { onSelect(e); onClose(); }}>{e}</button>
      ))}
    </div>
  );
}
