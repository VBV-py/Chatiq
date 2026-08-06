import api from "./axiosInstance";
import { Sticker } from "../types/sticker";

export const getStickers = () =>
  api.get<Sticker[]>("/stickers").then(r => r.data);
