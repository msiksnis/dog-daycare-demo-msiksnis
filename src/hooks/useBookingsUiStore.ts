import { create } from "zustand";

// Define the state structure for Zustand UI state
interface BookingsUIState {
  filterText: string;
  createBookingModalOpen: boolean;
  upcomingBookingsModalOpen: boolean;
  selectedCanineId: string;
  selectedCanineName: string;
  setFilterText: (text: string) => void;
  setCreateBookingModalOpen: (isOpen: boolean) => void;
  setUpcomingBookingsModalOpen: (isOpen: boolean) => void;
  setSelectedCanineId: (id: string) => void;
  setSelectedCanineName: (name: string) => void;
}

const useBookingsUIStore = create<BookingsUIState>((set) => ({
  filterText: "",
  createBookingModalOpen: false,
  upcomingBookingsModalOpen: false,
  selectedCanineId: "",
  selectedCanineName: "",
  setFilterText: (text) => set({ filterText: text }),
  setCreateBookingModalOpen: (isOpen) =>
    set({ createBookingModalOpen: isOpen }),
  setUpcomingBookingsModalOpen: (isOpen) =>
    set({ upcomingBookingsModalOpen: isOpen }),
  setSelectedCanineId: (id) => set({ selectedCanineId: id }),
  setSelectedCanineName: (name) => set({ selectedCanineName: name }),
}));

export default useBookingsUIStore;
