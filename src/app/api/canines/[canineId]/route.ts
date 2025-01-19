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
  DHPP: z.string({
    required_error: "A date is required",
  }),
  LEPTO: z.string({
    required_error: "A date is required",
  }),
  KC: z.string({
    required_error: "A date is required",
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

type Params = Promise<{ canineId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { canineId } = await params;

  try {
    const canine = await prismadb.canine.findUnique({
      where: {
        id: canineId,
      },
      include: {
        vaccinations: true,
      },
    });

    return NextResponse.json(canine);
  } catch (error) {
    console.log(["CANINE_GET"], error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const { canineId } = await params;

  try {
    const body = await req.json();
    const validatedInput = inputSchema.parse(body);

    // Separate canine data and vaccination data
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

    const updatedCanine = await prismadb.canine.update({
      where: { id: await canineId },
      data: dbCanineData,
    });

    const vaccinationUpdateData: any = {
      DHPP: DHPP ? new Date(DHPP).toISOString() : null,
      LEPTO: LEPTO ? new Date(LEPTO).toISOString() : null,
      KC: KC ? new Date(KC).toISOString() : null,
      fleaed: fleaed,
    };

    const existingVaccination = await prismadb.vaccination.findFirst({
      where: { canineId: updatedCanine.id },
    });

    if (existingVaccination) {
      await prismadb.vaccination.update({
        where: { id: existingVaccination.id },
        data: vaccinationUpdateData,
      });
    }

    return NextResponse.json(updatedCanine);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[CANINES_PATCH_VALIDATION_ERROR]", error.errors);
      return new NextResponse("Validation Error", { status: 400 });
    }

    console.error("[CANINES_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { canineId } = await params;

  try {
    if (!canineId) {
      return new NextResponse("Canine ID is required", { status: 400 });
    }

    const canine = await prismadb.canine.deleteMany({
      where: {
        id: canineId,
      },
    });

    return NextResponse.json(canine);
  } catch (error) {
    console.log(["CANINE_DELETE"], error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
