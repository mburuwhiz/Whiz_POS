import { create } from 'zustand';

interface AppState {
  serverUrl: string | null;
  syncKey: string | null;
  setConnectionDetails: (serverUrl: string, syncKey: string) => void;
}

export const useStore = create<AppState>((set) => ({
  serverUrl: null,
  syncKey: null,
  setConnectionDetails: (serverUrl, syncKey) => set({ serverUrl, syncKey }),
}));
