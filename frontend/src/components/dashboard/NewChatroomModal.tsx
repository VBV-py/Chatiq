import { useState } from "react";
import { Modal } from "../shared/Modal";
import { createChatroom } from "../../api/chatrooms";
import { useChatStore } from "../../store/chatStore";
interface Props { onClose: () => void; }
export function NewChatroomModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { addChatroom } = useChatStore();
  const create = async () => {
    if (!name.trim()) return;
    try { const c = await createChatroom(name.trim()); addChatroom(c); onClose(); }
    catch (e: any) { setError(e.response?.data?.detail || "Failed to create"); }
  };
  return (
    <Modal title="New Chatroom" onClose={onClose} footer={
      <><button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={create}>Create</button></>
    }>
      {error && <div className="error-msg">{error}</div>}
      <div className="input-group">
        <label className="input-label">Room Name</label>
        <input className="input" placeholder="e.g. Study Group" value={name} onChange={e => { setName(e.target.value); setError(""); }} />
      </div>
    </Modal>
  );
}
