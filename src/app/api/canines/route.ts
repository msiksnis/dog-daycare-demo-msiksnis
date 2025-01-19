import { NextResponse } from "next/server";
import * as z from "zod";

import prismadb from "@/lib/prismadb";

const optionalString = z
  .union([z.string().length(0), z.string().min(2)])
  .optional()
  .transform((e) => (e === "" ? undefined : e));

const inputSchema = z.object({
  ownerId: z.string(),
  name: z.string().refine((val) => val !== "", "Name is required"),
  breed: z.string().refine((val) => val !== "", "Breed is required"),
  dateOfBirth: z
    .string({
      required_error: "A date of birth is required.",
    })
    .refine((data) => !isNaN(Date.parse(data)), {
      message: "dateOfBirth must be a valid date string",
      path: ["dateOfBirth"],
    }),
  gender: z.enum(["MALE", "FEMALE"]),
  color: z.string().refine((val) => val !== "", "Color is required"),
  microChipNumber: z.string().optional(),
  spayed: z.boolean(),
  notes: optionalString,
  vetName: optionalString,
  vetPhone: optionalString,
  vetAddress: optionalString,
  DHPP: z
    .string({
      required_error: "A date is required.",
    })
    .refine((data) => !isNaN(Date.parse(data)), {
      message: "DHPP must be a valid date string",
      path: ["DHPP"],
    }),
  LEPTO: z
    .string({
      required_error: "A date is required.",
    })
    .refine((data) => !isNaN(Date.parse(data)), {
      message: "LEPTO must be a valid date string",
      path: ["LEPTO"],
    }),
  KC: z
    .string({
      required_error: "A date is required.",
    })
    .refine((data) => !isNaN(Date.parse(data)), {
      message: "KC must be a valid date string",
      path: ["KC"],
    }),
  fleaed: z.boolean(),
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedInput = inputSchema.parse(body);

    const { ownerId, DHPP, LEPTO, KC, fleaed, ...canineData } = validatedInput;
    const owner = await prismadb.owner.findUnique({ where: { id: ownerId } });

    if (!owner) {
      console.error("Owner not found for ownerId:", ownerId);
      return new NextResponse("Owner Not Found", { status: 404 });
    }

    const dbCanineData = {
      ...canineData,
      dateOfBirth: new Date(canineData.dateOfBirth).toISOString(),
      ownerId: ownerId,
    };

    const newCanine = await prismadb.canine.create({
      data: dbCanineData,
    });

    const vaccinationData: any = {
      canineId: newCanine.id,
      DHPP: DHPP ? new Date(DHPP).toISOString() : null,
      LEPTO: LEPTO ? new Date(LEPTO).toISOString() : null,
      KC: KC ? new Date(KC).toISOString() : null,
      fleaed: fleaed,
    };

    await prismadb.vaccination.create({
      data: vaccinationData,
    });

    return NextResponse.json(newCanine);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[CANINES_POST_VALIDATION_ERROR]", error.errors);
      return new NextResponse("Validation Error", { status: 400 });
    }

    console.error("[CANINES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const canines = await prismadb.canine.findMany({
      include: {
        vaccinations: true,
        bookings: true,
        owner: true,
      },
    });

    return NextResponse.json(canines);
  } catch (error) {
    console.error("[CANINES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
