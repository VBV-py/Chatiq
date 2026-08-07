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
          <span className="sidebar-logo">ChatIQ</span>
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
        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", padding: "16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px" }}>Account</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: 14 }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{user?.username}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "16px" }}>
            <a href="/settings" className="btn btn-ghost" style={{ justifyContent: "flex-start", padding: "8px 12px" }}>Settings</a>
            <button className="btn btn-ghost" onClick={logout} style={{ justifyContent: "flex-start", padding: "8px 12px", color: "var(--danger)" }}>Logout</button>
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
