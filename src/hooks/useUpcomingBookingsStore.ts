import { create } from "zustand";

interface UpcomingBookingsState {
  upcomingBookingDates: { [key: string]: Date | null };
  setUpcomingBookingDates: (canineId: string, date: Date | null) => void;
  setMultipleUpcomingBookingDates: (newUpcomingBookingDates: {
    [key: string]: Date | null;
  }) => void;
}

const useUpcomingBookingsStore = create<UpcomingBookingsState>((set) => ({
  upcomingBookingDates: {},
  setUpcomingBookingDates: (canineId, date) =>
    set((state) => ({
      upcomingBookingDates: {
        ...state.upcomingBookingDates,
        [canineId]: date,
      },
    })),
  setMultipleUpcomingBookingDates: (newUpcomingBookingDates) =>
    set(() => ({
      upcomingBookingDates: newUpcomingBookingDates,
    })),
}));

export default useUpcomingBookingsStore;
