import { useAuthStore } from "../store/authStore";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../api/auth";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setAuth(res.user, res.access_token);
    navigate("/dashboard");
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await apiRegister(username, email, password);
    setAuth(res.user, res.access_token);
    navigate("/dashboard");
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    clearAuth();
    navigate("/login");
  };

  return { user, token, login, register, logout, isAuthenticated: !!token };
}
