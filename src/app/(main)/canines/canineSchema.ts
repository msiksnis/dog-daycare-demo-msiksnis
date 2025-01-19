import * as z from "zod";

const optionalString = z
  .union([z.string().length(0), z.string().min(2)])
  .optional()
  .transform((e) => (e === "" ? undefined : e));

export const canineSchema = z.object({
  ownerId: z.string(),
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  dateOfBirth: z.date().refine((val) => val < new Date(), {
    message: "Date of birth must be in the past",
  }),
  gender: z.enum(["MALE", "FEMALE"]),
  color: z.string().min(1, "Color is required"),
  microChipNumber: z.string().optional(),
  spayed: z.boolean(),
  notes: optionalString,
  vetName: optionalString,
  vetPhone: optionalString,
  vetAddress: optionalString,
  DHPP: z.date({ message: "DHPP date required" }),
  LEPTO: z.date({ message: "LEPTO date required" }),
  KC: z.date({ message: "KC date required" }),
  fleaed: z.boolean({ message: "Flea status required" }),
  socialSkills: z.object({
    otherPets: z.boolean(),
    otherPetsDetails: z.string().optional(),
    getsAlongWithDogs: z.boolean(),
    walksWithOtherDogs: z.boolean(),
    allowedOffLeash: z.boolean(),
    hasRecall: z.boolean().optional(),
    runsFreelyWithDogs: z.boolean(),
    recognizedCommands: z.string().optional(),
  }),
  behaviour: z.object({
    allowedTreats: z.boolean(),
    aggressiveOverToys: z.boolean(),
    // sharesToys: z.boolean(),
    allowsRemovingObjectsFromMouth: z.boolean(),
    aggressiveOverFood: z.boolean(),
    gameTypes: z.string().optional(),
    anxiousOrFrightened: z.boolean(),
    actsDifferentlyOnOrOffLead: z.boolean(),
    hasAttacked: z.boolean(),
    hasGrowledOrSnarled: z.boolean(),
    hasJumpedOverFence: z.boolean(),
    fenceHeight: z.string().optional(),
  }),
  health: z.object({
    hasHealthCondition: z.boolean(),
    healthConditionDetails: z.string().optional(),
    beenIllInLast30Days: z.boolean(),
    hasAllergies: z.boolean(),
    allergyDetails: z.string().optional(),
    onMedication: z.boolean(),
    medicationDetails: z.string().optional(),
    administerMedicationAtCreche: z.boolean().optional(),
    feedAtCreche: z.boolean(),
    doYouRequireUsToFeedYourDogWhilstAtCreche: z.boolean(),
    hasYourDogHadAnyInternationalTravel: z.boolean(),
    whichCountries: z.string().optional(),
    otherSpecialNeeds: z.string().optional(),
  }),
});
