import { Gender, PrepaidPackagePrice } from "@prisma/client";

export interface CanineWithPrepaidPackage {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  dateOfBirth: Date;
  gender: Gender;
  color: string;
  microChipNumber: string | null;
  spayed: boolean;
  notes: string | null;
  vetName: string | null;
  vetPhone: string | null;
  vetAddress: string | null;
  socialSkills: any;
  behaviour: any;
  health: any;
  numberOfPrepaidDays: number | null;
  createdAt: Date;
  updatedAt: Date;
  prepaidPackagePrice?: PrepaidPackagePrice | null;
}
