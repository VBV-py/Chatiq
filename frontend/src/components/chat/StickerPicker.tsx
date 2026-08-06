import { useEffect, useState } from "react";
import { getStickers } from "../../api/stickers";
import { Sticker } from "../../types/sticker";
import { Spinner } from "../shared/Spinner";
interface Props { onSelect: (sticker: Sticker) => void; onClose: () => void; }
export function StickerPicker({ onSelect, onClose }: Props) {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getStickers().then(setStickers).finally(() => setLoading(false)); }, []);
  return (
    <div className="sticker-picker" onClick={e => e.stopPropagation()}>
      {loading ? <Spinner small /> : stickers.map(s => (
        <div key={s.id} className="sticker-item" onClick={() => { onSelect(s); onClose(); }}>
          <img src={s.image_url} alt={s.pack_name} loading="lazy" />
        </div>
      ))}
    </div>
  );
}
