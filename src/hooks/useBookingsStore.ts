import { create } from "zustand";

interface Canine {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  canineId: string;
  date: Date;
  isHalfDay: boolean;
  checkInStatus: "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT";
  canine: Canine;
  overnightStay: boolean;
  previousBookingDate: Date | null;
  sixMonthWarn: boolean;
}

interface BookingsState {
  bookings: Booking[];
  upcomingBookings: { [key: string]: Date | null };
  setBookings: (bookings: Booking[]) => void;
  setUpcomingBookings: (upcomingBookings: {
    [key: string]: Date | null;
  }) => void;
  addBooking: (newBooking: Booking) => void;
  updateBooking: (updatedBooking: Booking) => void;
  removeBooking: (bookingId: string) => void;
}

const useBookingsStore = create<BookingsState>((set) => ({
  bookings: [],
  upcomingBookings: {},
  setBookings: (bookings) => set({ bookings }),
  setUpcomingBookings: (upcomingBookings) => set({ upcomingBookings }),
  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (updatedBooking) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      ),
    })),
  removeBooking: (bookingId) =>
    set((state) => ({
      bookings: state.bookings.filter((booking) => booking.id !== bookingId),
    })),
}));

export default useBookingsStore;
