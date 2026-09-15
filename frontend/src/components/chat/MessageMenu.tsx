import { useRef, useEffect } from "react";
import { Forward, Edit2, Trash2, Smile, Languages, Copy, CornerUpRight } from "lucide-react";

interface Props {
  isOwn: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy: () => void;
  onForward: () => void;
  onTranslate: () => void;
  onReact: () => void;
  onClose: () => void;
}
export function MessageMenu({ isOwn, onEdit, onDelete, onCopy, onForward, onTranslate, onReact, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div className="msg-menu" ref={ref}>
      <div className="msg-menu-item" onClick={() => { onReact(); onClose(); }}><Smile size={16} /> React</div>
      <div className="msg-menu-item" onClick={() => { onTranslate(); onClose(); }}><Languages size={16} /> Translate</div>
      <div className="msg-menu-item" onClick={() => { onCopy(); onClose(); }}><Copy size={16} /> Copy</div>
      <div className="msg-menu-item" onClick={() => { onForward(); onClose(); }}><Forward size={16} /> Forward</div>
      {isOwn && onEdit && <div className="msg-menu-item" onClick={() => { onEdit(); onClose(); }}><Edit2 size={16} /> Edit</div>}
      {isOwn && onDelete && <div className="msg-menu-item danger" onClick={() => { onDelete(); onClose(); }}><Trash2 size={16} /> Delete</div>}
    </div>
  );
}
