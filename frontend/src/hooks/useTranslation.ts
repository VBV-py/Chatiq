import { useState } from "react";
import { translateMessage } from "../api/ai";

export function useTranslation() {
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const translate = async (messageId: string, content: string) => {
    setLoading(true);
    try {
      const res = await translateMessage(content);
      setTranslations(prev => ({ ...prev, [messageId]: res.translated }));
    } catch {}
    setLoading(false);
  };

  const clear = (messageId: string) => {
    setTranslations(prev => { const n = { ...prev }; delete n[messageId]; return n; });
  };

  return { translations, loading, translate, clear };
}
