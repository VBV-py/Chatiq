import { useRef, useEffect } from "react";
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
      <div className="msg-menu-item" onClick={() => { onReact(); onClose(); }}>😄 React</div>
      <div className="msg-menu-item" onClick={() => { onTranslate(); onClose(); }}>🌍 Translate</div>
      <div className="msg-menu-item" onClick={() => { onCopy(); onClose(); }}>📋 Copy</div>
      <div className="msg-menu-item" onClick={() => { onForward(); onClose(); }}>↪️ Forward</div>
      {isOwn && onEdit && <div className="msg-menu-item" onClick={() => { onEdit(); onClose(); }}>✏️ Edit</div>}
      {isOwn && onDelete && <div className="msg-menu-item danger" onClick={() => { onDelete(); onClose(); }}>🗑️ Delete</div>}
    </div>
  );
}
