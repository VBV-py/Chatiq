import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../store/chatStore";
import { createPrivateChat } from "../../api/privateChats";
import { MessageSquarePlus, MessageSquare, Settings, LogOut, Hash } from "lucide-react";
import { ChatroomCard } from "../dashboard/ChatroomCard";
import { PrivateChatCard } from "../dashboard/PrivateChatCard";
import { NewChatroomModal } from "../dashboard/NewChatroomModal";
import { Modal } from "../shared/Modal";

export function AppLayout() {
  const { user, logout } = useAuth();
  const { chatrooms, groups, privateChats } = useChat();
  const { addPrivateChat } = useChatStore();
  const navigate = useNavigate();

  const [showNewRoom, setShowNewRoom] = useState<"chatroom" | "group" | null>(null);
  const [showNewPrivate, setShowNewPrivate] = useState(false);
  const [activeTab, setActiveTab] = useState<"private" | "groups" | "chatrooms">("private");
  const [targetUser, setTargetUser] = useState("");
  const [err, setErr] = useState("");

  const startPrivate = async () => {
    try { const c = await createPrivateChat(targetUser); addPrivateChat(c); setShowNewPrivate(false); setTargetUser(""); }
    catch (e: any) { setErr(e.response?.data?.detail || "User not found"); }
  };

  return (
    <div className="app-container">
      <nav className="nav-sliding">
        <div className="nav-items">
          <button className="nav-btn" onClick={() => navigate("/dashboard")} title="Dashboard">
            <span className="nav-icon"><MessageSquare size={20} /></span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button className="nav-btn" onClick={() => navigate("/settings")} title="Settings">
            <span className="nav-icon"><Settings size={20} /></span>
            <span className="nav-label">Settings</span>
          </button>
          <div style={{ marginTop: "auto" }}>
             <button className="nav-btn" onClick={logout} title="Logout" style={{ color: "var(--danger)" }}>
               <span className="nav-icon"><LogOut size={20} /></span>
               <span className="nav-label">Logout</span>
             </button>
          </div>
        </div>
      </nav>

      <aside className="chat-sidebar">
        <div className="sidebar-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
          <span className="sidebar-logo">ChatIQ</span>
        </div>
        
        <div className="sidebar-tabs" style={{ marginTop: '16px' }}>
          <div className={`sidebar-tab ${activeTab === 'private' ? 'active' : ''}`} onClick={() => setActiveTab('private')}>Chats</div>
          <div className={`sidebar-tab ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>Groups</div>
          <div className={`sidebar-tab ${activeTab === 'chatrooms' ? 'active' : ''}`} onClick={() => setActiveTab('chatrooms')}>Rooms</div>
        </div>

        <div style={{ padding: "12px 8px 0", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          
          {activeTab === 'private' && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 8px" }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Private Chats</span>
                <button className="btn-icon" onClick={() => setShowNewPrivate(true)} title="New Chat"><MessageSquarePlus size={18} /></button>
              </div>
              <div className="sidebar-list">
                {privateChats.length === 0 && <div className="text-muted" style={{ padding: "8px 12px", fontSize: 13 }}>No private chats yet</div>}
                {privateChats.map(c => <PrivateChatCard key={c.id} chat={c} />)}
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 8px" }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Permanent Groups</span>
                <button className="btn-icon" onClick={() => setShowNewRoom("group")} title="New Group"><Hash size={18} /></button>
              </div>
              <div className="sidebar-list">
                {groups.length === 0 && <div className="text-muted" style={{ padding: "8px 12px", fontSize: 13 }}>No groups yet</div>}
                {groups.map(c => <ChatroomCard key={c.id} chat={c} />)}
              </div>
            </div>
          )}

          {activeTab === 'chatrooms' && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 8px" }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Temporary Rooms</span>
                <button className="btn-icon" onClick={() => setShowNewRoom("chatroom")} title="New Room"><Hash size={18} /></button>
              </div>
              <div className="sidebar-list">
                {chatrooms.length === 0 && <div className="text-muted" style={{ padding: "8px 12px", fontSize: 13 }}>No chatrooms yet</div>}
                {chatrooms.map(c => <ChatroomCard key={c.id} chat={c} />)}
              </div>
            </div>
          )}

        </div>
        
        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", padding: "16px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
             <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: 14 }}>
               {user?.username?.charAt(0).toUpperCase()}
             </div>
             <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{user?.username}</span>
           </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      {showNewRoom && <NewChatroomModal chatType={showNewRoom} onClose={() => setShowNewRoom(null)} />}
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
