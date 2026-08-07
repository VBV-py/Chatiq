import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { updateLanguage } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" }, { code: "es", label: "Spanish" }, { code: "fr", label: "French" },
  { code: "de", label: "German" }, { code: "ja", label: "Japanese" }, { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" }, { code: "hi", label: "Hindi" }, { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" }, { code: "ru", label: "Russian" }, { code: "ur", label: "Urdu" },
];
export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore();
  const navigate = useNavigate();
  const [lang, setLang] = useState(user?.preferred_language || "en");
  const [saved, setSaved] = useState(false);
  const save = async () => {
    try { const u = await updateLanguage(lang); if (token && user) setAuth({ ...user, preferred_language: lang }, token); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch {}
  };
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>
      </div>
      <div className="settings-section">
        <h3><User size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> Profile</h3>
        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          <div><strong>Username:</strong> {user?.username}</div>
          <div><strong>Email:</strong> {user?.email}</div>
        </div>
      </div>
      <div className="settings-section">
        <h3>🌍 Translation Language</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>Messages you translate will appear in this language by default.</p>
        <div className="input-group">
          <label className="input-label">Preferred Language</label>
          <select className="input" value={lang} onChange={e => setLang(e.target.value)} style={{ cursor: "pointer" }}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={save}>
          {saved ? "✅ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
