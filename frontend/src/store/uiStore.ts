import { create } from "zustand";

interface UIState {
  activeModal: string | null;
  sidebarOpen: boolean;
  searchOpen: boolean;
  openModal: (name: string) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  toggleSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  sidebarOpen: true,
  searchOpen: false,
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSearch: () => set(s => ({ searchOpen: !s.searchOpen })),
}));
