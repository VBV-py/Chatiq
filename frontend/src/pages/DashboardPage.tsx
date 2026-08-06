import { useState } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { ChatroomCard } from "../components/dashboard/ChatroomCard";
import { PrivateChatCard } from "../components/dashboard/PrivateChatCard";
import { NewChatroomModal } from "../components/dashboard/NewChatroomModal";
import { createPrivateChat } from "../api/privateChats";
import { useChatStore } from "../store/chatStore";
import { Modal } from "../components/shared/Modal";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { chatrooms, privateChats } = useChat();
  const { addPrivateChat } = useChatStore();
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [showNewPrivate, setShowNewPrivate] = useState(false);
  const [targetUser, setTargetUser] = useState("");
  const [err, setErr] = useState("");

  const startPrivate = async () => {
    try { const c = await createPrivateChat(targetUser); addPrivateChat(c); setShowNewPrivate(false); setTargetUser(""); }
    catch (e: any) { setErr(e.response?.data?.detail || "User not found"); }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">💬 NexusChat</span>
          <div style={{ display: "flex", gap: 4 }}>
            <a href="/settings" className="btn-icon" title="Settings">⚙️</a>
            <button className="btn-icon" onClick={logout} title="Logout">🚪</button>
          </div>
        </div>
        <div style={{ padding: "8px 8px 0" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 8px" }}>👤 {user?.username}</div>
        </div>

        <div style={{ padding: "12px 8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 8px" }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Chatrooms</span>
            <button className="btn-icon" onClick={() => setShowNewRoom(true)} title="New Room">➕</button>
          </div>
          <div className="sidebar-list" style={{ maxHeight: "35vh" }}>
            {chatrooms.length === 0 && <div className="text-muted" style={{ padding: "8px 12px", fontSize: 13 }}>No chatrooms yet</div>}
            {chatrooms.map(c => <ChatroomCard key={c.id} chat={c} />)}
          </div>
        </div>

        <div style={{ padding: "12px 8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 8px" }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Private Chats</span>
            <button className="btn-icon" onClick={() => setShowNewPrivate(true)} title="New Chat">✉️</button>
          </div>
          <div className="sidebar-list" style={{ maxHeight: "35vh" }}>
            {privateChats.length === 0 && <div className="text-muted" style={{ padding: "8px 12px", fontSize: 13 }}>No private chats yet</div>}
            {privateChats.map(c => <PrivateChatCard key={c.id} chat={c} />)}
          </div>
        </div>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-empty">
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <h2>Select a chat to start messaging</h2>
          <p>Choose a chatroom or private chat from the sidebar</p>
        </div>
      </div>
      {showNewRoom && <NewChatroomModal onClose={() => setShowNewRoom(false)} />}
      {showNewPrivate && (
        <Modal title="New Private Chat" onClose={() => setShowNewPrivate(false)} footer={
          <><button className="btn btn-secondary btn-sm" onClick={() => setShowNewPrivate(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={startPrivate}>Start Chat</button></>
        }>
          {err && <div className="error-msg">{err}</div>}
          <div className="input-group">
            <label className="input-label">Username to chat with</label>
            <input className="input" placeholder="Enter username" value={targetUser} onChange={e => { setTargetUser(e.target.value); setErr(""); }} />
          </div>
        </Modal>
      )}
    </div>
  );
}
