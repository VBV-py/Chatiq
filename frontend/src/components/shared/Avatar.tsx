interface Props { name: string; size?: number; }
export function Avatar({ name, size = 40 }: Props) {
  const letter = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.4, color: "#fff", flexShrink: 0 }}>
      {letter}
    </div>
  );
}
