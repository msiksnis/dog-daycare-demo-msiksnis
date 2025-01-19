// types.ts
import { CheckInStatus } from "@prisma/client";

export interface Owner {
  id: string;
  name: string;
}

export interface Canine {
  id: string;
  name: string;
  owner: Owner;
}

export interface Booking {
  id: string;
  canineId: string;
  date: Date;
  canine: Canine;
  isHalfDay: boolean;
  overnightStay: boolean;
  previousBookingDate: Date;
  sixMonthWarn: boolean;
  checkInStatus: CheckInStatus;
}
