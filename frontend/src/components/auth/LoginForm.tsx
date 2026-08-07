import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(email, password); } catch (err: any) { setError(err.response?.data?.detail || "Login failed"); }
    setLoading(false);
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">ChatIQ</div>
        <div className="auth-subtitle">Sign in to continue chatting</div>
        <form className="auth-form" onSubmit={submit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="auth-footer">Don't have an account? <Link to="/register" className="auth-link">Register</Link></div>
      </div>
    </div>
  );
}
