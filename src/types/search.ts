import { CheckInStatus as PrismaCheckInStatus } from "@prisma/client";

export interface Owner {
  id: string;
  name: string;
  email: string;
  address: string;
  mobile: string;
  workPhone?: string;
  emergencyContact: string;
  canines: Canine[];
  bookings: Booking[];
  createdAt: string;
  updatedAt: string;
}

export interface Canine {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  dateOfBirth: string;
  gender: Gender;
  color: string;
  microChipNumber: string;
  spayed: boolean;
  notes?: string;
  vetName?: string;
  vetPhone?: string;
  vetAddress?: string;
  socialSkills: any;
  behaviour: any;
  health: any;
  bookings: Booking[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  ownerId: string;
  canineId: string;
  date: Date;
  isHalfDay: boolean;
  overnightStay: boolean;
  previousBookingDate?: Date | null;
  sixMonthWarn: boolean;
  checkInStatus: PrismaCheckInStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}
