import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
export function RegisterForm() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(username, email, password); } catch (err: any) { setError(err.response?.data?.detail || "Registration failed"); }
    setLoading(false);
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">NexusChat</div>
        <div className="auth-subtitle">Create your account</div>
        <form className="auth-form" onSubmit={submit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="input-group">
            <label className="input-label">Username</label>
            <input className="input" placeholder="cooluser42" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>{loading ? "Creating account…" : "Create Account"}</button>
        </form>
        <div className="auth-footer">Already have an account? <Link to="/login" className="auth-link">Sign in</Link></div>
      </div>
    </div>
  );
}
