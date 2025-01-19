import { Owner } from "@prisma/client";

export interface SocialSkills {
  otherPets: boolean;
  otherPetsDetails?: string;
  getsAlongWithDogs: boolean;
  walksWithOtherDogs: boolean;
  allowedOffLeash: boolean;
  hasRecall?: boolean;
  runsFreelyWithDogs: boolean;
  recognizedCommands?: string;
}

export interface Behaviour {
  allowedTreats: boolean;
  aggressiveOverToys: boolean;
  // sharesToys: boolean;
  allowsRemovingObjectsFromMouth: boolean;
  aggressiveOverFood: boolean;
  gameTypes?: string;
  anxiousOrFrightened: boolean;
  actsDifferentlyOnOrOffLead: boolean;
  hasAttacked: boolean;
  hasGrowledOrSnarled: boolean;
  hasJumpedOverFence: boolean;
  fenceHeight?: string;
}

export interface Health {
  hasHealthCondition: boolean;
  healthConditionDetails?: string;
  beenIllInLast30Days: boolean;
  hasAllergies: boolean;
  allergyDetails?: string;
  onMedication: boolean;
  medicationDetails?: string;
  administerMedicationAtCreche?: boolean;
  feedAtCreche?: boolean;
  doYouRequireUsToFeedYourDogWhilstAtCreche: boolean;
  hasYourDogHadAnyInternationalTravel: boolean;
  whichCountries?: string;
  otherSpecialNeeds?: string;
}

export interface CanineInterface {
  id: string;
  ownerId: string;
  owner: Owner;
  name: string;
  breed: string;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE";
  color: string;
  microChipNumber?: string;
  spayed: boolean;
  notes?: string | null;
  vetName?: string | null;
  vetPhone?: string | null;
  vetAddress?: string | null;
  vaccinations: any;
  socialSkills: SocialSkills;
  behaviour: Behaviour;
  health: Health;
}
