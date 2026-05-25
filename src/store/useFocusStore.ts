import { create } from 'zustand';

interface FocusState {
  isFocusModeActive: boolean;
  setIsFocusModeActive: (active: boolean) => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  isFocusModeActive: false,
  setIsFocusModeActive: (active) => set({ isFocusModeActive: active }),
}));
