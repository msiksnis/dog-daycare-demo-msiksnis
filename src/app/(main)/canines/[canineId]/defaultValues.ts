import { CanineInterface } from "./canineTypes";

export const getDefaultValues = (initialData: CanineInterface | null) => {
  return initialData
    ? {
        ...initialData,
        gender: initialData.gender as "MALE" | "FEMALE",
        microChipNumber: initialData.microChipNumber || undefined,
        notes: initialData.notes || undefined,
        vetName: initialData.vetName || undefined,
        vetPhone: initialData.vetPhone || undefined,
        vetAddress: initialData.vetAddress || undefined,
        DHPP: initialData.vaccinations[0].DHPP || new Date(),
        LEPTO: initialData.vaccinations[0].LEPTO || new Date(),
        KC: initialData.vaccinations[0].KC || new Date(),
        fleaed: initialData.vaccinations[0].fleaed || false,
        dateOfBirth: new Date(initialData.dateOfBirth),
      }
    : {
        ownerId: "",
        name: "",
        breed: "",
        dateOfBirth: new Date(),
        gender: "MALE" as "MALE" | "FEMALE",
        color: "",
        microChipNumber: "",
        spayed: true,
        notes: "",
        vetName: "",
        vetPhone: "",
        vetAddress: "",
        vaccinations: {
          DHPP: "new Date()",
          LEPTO: new Date(),
          KC: new Date(),
          fleaed: false,
        },
        socialSkills: {
          otherPets: false,
          otherPetsDetails: "",
          getsAlongWithDogs: false,
          walksWithOtherDogs: false,
          allowedOffLeash: false,
          hasRecall: false,
          runsFreelyWithDogs: false,
          recognizedCommands: "",
        },
        behaviour: {
          allowedTreats: false,
          aggressiveOverToys: false,
          // sharesToys: false,
          allowsRemovingObjectsFromMouth: false,
          aggressiveOverFood: false,
          gameTypes: "",
          anxiousOrFrightened: false,
          actsDifferentlyOnOrOffLead: false,
          hasAttacked: false,
          hasGrowledOrSnarled: false,
          hasJumpedOverFence: false,
          fenceHeight: "",
        },
        health: {
          hasHealthCondition: false,
          healthConditionDetails: "",
          beenIllInLast30Days: false,
          hasAllergies: false,
          allergyDetails: "",
          onMedication: false,
          medicationDetails: "",
          administerMedicationAtCreche: false,
          feedAtCreche: false,
          doYouRequireUsToFeedYourDogWhilstAtCreche: false,
          hasYourDogHadAnyInternationalTravel: false,
          whichCountries: "",
          otherSpecialNeeds: "",
        },
      };
};
