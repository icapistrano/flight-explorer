import { create } from "zustand";

interface GlobeState {
  radius: number;
}

export const useGlobeStore = create<GlobeState>(() => ({
  radius: 12,
}));
