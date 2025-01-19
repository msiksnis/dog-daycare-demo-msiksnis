import { create } from "zustand";

interface LoadingState {
  loadingStates: { [key: string]: boolean };
  setLoading: (bookingId: string, isLoading: boolean) => void;
}

const useLoadingStore = create<LoadingState>((set) => ({
  loadingStates: {},
  setLoading: (bookingId, isLoading) =>
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [bookingId]: isLoading,
      },
    })),
}));

export default useLoadingStore;
