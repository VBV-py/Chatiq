export default function DashboardPage() {
  return (
    <div className="dashboard-main" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="dashboard-empty">
        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
        <h2>Select a chat to start messaging</h2>
        <p>Choose a chatroom or private chat from the sidebar</p>
      </div>
    </div>
  );
}
