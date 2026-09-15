import { MessageSquare } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="dashboard-main" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="dashboard-empty">
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><MessageSquare size={64} className="text-muted" /></div>
        <h2>Select a chat to start messaging</h2>
        <p>Choose a chatroom or private chat from the sidebar</p>
      </div>
    </div>
  );
}
