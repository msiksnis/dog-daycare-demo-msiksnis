import { create } from "zustand";

interface StoreModalStore {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const useStoreModal = create<StoreModalStore>((set) => ({
  isOpen: false,
  onClose: () => set({ isOpen: false }),
  onOpen: () => set({ isOpen: true }),
}));
