import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ChatroomPage from "./pages/ChatroomPage";
import PrivateChatPage from "./pages/PrivateChatPage";
import SettingsPage from "./pages/SettingsPage";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/chatroom/:chatId" element={<ProtectedRoute><ChatroomPage /></ProtectedRoute>} />
          <Route path="/private/:chatId" element={<ProtectedRoute><PrivateChatPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
