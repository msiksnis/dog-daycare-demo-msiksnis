import { create } from "zustand";

interface DynamicHeaderState {
  heading: string;
  subHeading: string;
  customHeading: string;
  setHeading: (heading: string) => void;
  setSubHeading: (subHeading: string) => void;
  setCustomHeading: (customHeading: string) => void;
  reset: () => void;
}

export const useDynamicHeaderStore = create<DynamicHeaderState>((set) => ({
  // Initial state
  heading: "",
  subHeading: "",
  customHeading: "",

  // Actions
  setHeading: (heading) => set({ heading }),
  setSubHeading: (subHeading) => set({ subHeading }),
  setCustomHeading: (customHeading) => set({ customHeading }),

  // Reset the state
  reset: () => set({ heading: "", subHeading: "", customHeading: "" }),
}));
