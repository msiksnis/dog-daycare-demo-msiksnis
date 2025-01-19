import {
  Canine,
  Owner,
  CheckInStatus,
  PaymentMethod,
  BookingDetails,
} from "@prisma/client";

// Custom type for booking details
export interface BookingWithDetails {
  id: string;
  ownerId: string;
  owner: Owner;
  canineId: string;
  canine: Canine;
  date: Date;
  isHalfDay: boolean;
  overnightStay?: boolean;
  previousBookingDate?: Date | null;
  sixMonthWarn?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  checkInStatus: CheckInStatus;
  bookingDetails: BookingDetails[];
}

// Custom type for fetching bookings response
export interface FetchBookingsResponse {
  bookings: BookingWithDetails[];
  upcomingBookings: { [key: string]: Date | null };
}

// Custom type for filtering bookings by canine name
export interface FilteredBookings {
  canineName: string;
  filterText: string;
}

// Custom type for booking mutations (create, update, delete)
export interface BookingMutation {
  bookingId: string;
  status?: CheckInStatus;
  canineId?: string;
  date?: Date;
}

// Custom type for mutation context in optimistic updates
export interface BookingMutationContext {
  previousBookings: BookingWithDetails[];
}
