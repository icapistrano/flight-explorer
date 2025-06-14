import { create } from "zustand";

export interface KeysState {
  keys: {
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
  };
  setKey: (key: keyof KeysState["keys"], value: boolean) => void;
}

export const useKeysStore = create<KeysState>((set) => ({
  keys: {
    w: false,
    s: false,
    a: false,
    d: false,
  },
  setKey: (key, value) =>
    set((state) => ({
      keys: {
        ...state.keys,
        [key]: value,
      },
    })),
}));
