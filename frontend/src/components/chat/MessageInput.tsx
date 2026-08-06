import { useState, useRef, KeyboardEvent } from "react";
import { Sticker } from "../../types/sticker";
import { StickerPicker } from "./StickerPicker";
import { uploadFile } from "../../api/media";

interface Props {
  onSendText: (text: string) => void;
  onSendSticker: (sticker: Sticker) => void;
  onSendMedia: (fileUrl: string, fileName: string, mimeType: string, size: number) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}
export function MessageInput({ onSendText, onSendSticker, onSendMedia, onTyping, onStopTyping }: Props) {
  const [text, setText] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText("");
    onStopTyping();
  };

  const handleChange = (v: string) => {
    setText(v);
    onTyping();
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(onStopTyping, 1500);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file);
      onSendMedia(res.file_url, res.file_name, res.mime_type, res.file_size);
    } catch {}
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="message-input-area">
      {showStickers && <div style={{ marginBottom: 8 }}><StickerPicker onSelect={s => { onSendSticker(s); setShowStickers(false); }} onClose={() => setShowStickers(false)} /></div>}
      <div className="message-input-row">
        <button className="btn-icon" onClick={() => setShowStickers(s => !s)} title="Stickers">😊</button>
        <button className="btn-icon" onClick={() => fileRef.current?.click()} title="Attach" disabled={uploading}>📎</button>
        <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" />
        <div className="message-input-wrap">
          <textarea className="message-textarea" placeholder="Type a message… (Enter to send)" rows={1}
            value={text} onChange={e => handleChange(e.target.value)} onKeyDown={handleKey}
          />
        </div>
        <button className="send-btn" onClick={handleSend} disabled={!text.trim()}>➤</button>
      </div>
    </div>
  );
}
