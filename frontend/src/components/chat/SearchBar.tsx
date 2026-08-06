import { useState } from "react";
interface Props { onSearch: (q: string) => void; onClose: () => void; }
export function SearchBar({ onSearch, onClose }: Props) {
  const [q, setQ] = useState("");
  return (
    <div className="search-bar">
      <span>🔍</span>
      <input className="search-input" placeholder="Search messages…" value={q}
        onChange={e => { setQ(e.target.value); onSearch(e.target.value); }}
        autoFocus
      />
      <button className="btn-icon" onClick={() => { setQ(""); onSearch(""); onClose(); }}>✕</button>
    </div>
  );
}
