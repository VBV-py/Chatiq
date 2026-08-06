import api from "./axiosInstance";

export const translateMessage = (
  content: string,
  target_language?: string,
  model?: string,
) =>
  api.post<{ original: string; translated: string; language: string; model?: string }>(
    "/ai/translate", { content, target_language, model }
  ).then(r => r.data);
