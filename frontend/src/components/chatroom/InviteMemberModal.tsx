import { useState } from "react";
import { Modal } from "../shared/Modal";
import { inviteMember } from "../../api/chatrooms";
interface Props { chatId: string; onClose: () => void; }
export function InviteMemberModal({ chatId, onClose }: Props) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const invite = async () => {
    try {
      await inviteMember(chatId, username);
      setSuccess(true); setUsername("");
    } catch (e: any) { setError(e.response?.data?.detail || "Failed to invite"); }
  };
  return (
    <Modal title="Invite Member" onClose={onClose} footer={
      <><button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={invite}>Invite</button></>
    }>
      {error && <div className="error-msg">{error}</div>}
      {success && <div style={{ color: "var(--success)", fontSize: 13 }}>Invited successfully!</div>}
      <div className="input-group">
        <label className="input-label">Username</label>
        <input className="input" placeholder="Enter username" value={username} onChange={e => { setUsername(e.target.value); setError(""); }} />
      </div>
    </Modal>
  );
}
