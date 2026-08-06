interface Props { translation: string | undefined; onClear: () => void; }
export function TranslationOverlay({ translation, onClear }: Props) {
  if (!translation) return null;
  return (
    <div className="translation-box">
      <div className="translation-label">Translation</div>
      <span>{translation}</span>
      <button className="btn-ghost btn-sm" onClick={onClear} style={{ marginLeft: 8, fontSize: 11 }}>✕</button>
    </div>
  );
}
