"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { DeleteIcon, LoaderCircle, Trash2Icon } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FieldError, FieldErrors, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

import AlertModal from "@/components/modals/AlertModal";
import { Spinner } from "@/components/Spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { safeParseDate } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { canineSchema } from "../../canineSchema";
import { CanineInterface } from "../canineTypes";
import { getDefaultValues } from "../defaultValues";
import { DateField } from "./DateField";

/**
 * Type inferred from the Canine schema using Zod.
 */
type CanineFormValues = z.infer<typeof canineSchema>;

/**
 * Props for the CanineForm component.
 */
interface CanineFormProps {
  /** The initial data for the canine, if editing an existing canine. */
  initialData: CanineInterface | null;
}

/**
 * Represents an owner with an ID and name.
 */
interface Owner {
  id: string;
  name: string;
}

/**
 * The CanineForm component is used to create or edit a canine's details.
 *
 * @param {CanineFormProps} props - The props for the component.
 */
export default function CanineForm({ initialData }: CanineFormProps) {
  // State variables
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [activeFields, setActiveFields] = useState<Record<string, boolean>>({});
  const [selectedOwnerName, setSelectedOwnerName] = useState<string | null>(
    null,
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const resultsRefs = useRef<HTMLDivElement[]>([]);

  // Router and params
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  // UI text variables
  const toastMessage = initialData
    ? "Canine updated successfully!"
    : "Canine created successfully!";
  const action = initialData ? (
    isLoading ? (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    ) : (
      "Save changes"
    )
  ) : isLoading ? (
    <div className="flex items-center justify-center">
      <Spinner />
    </div>
  ) : (
    "Create"
  );

  /**
   * Initialize the form using react-hook-form, setting up validation with Zod.
   */
  const form = useForm<CanineFormValues>({
    resolver: zodResolver(canineSchema),
    defaultValues: getDefaultValues(initialData),
  });

  // Watch specific form fields for changes.
  const watchOtherPets = form.watch("socialSkills.otherPets");
  const watchHasJumpedOverFence = form.watch("behaviour.hasJumpedOverFence");
  const watchHasAllergies = form.watch("health.hasAllergies");
  const watchOnMedication = form.watch("health.onMedication");
  const watchHasYourDogHadAnyInternationalTravel = form.watch(
    "health.hasYourDogHadAnyInternationalTravel",
  );
  const watchHasHealthCondition = form.watch("health.hasHealthCondition");

  /**
   * Handles changes to the socialSkills fields in the form.
   *
   * @param {keyof CanineFormValues["socialSkills"]} field - The field being updated.
   * @param {boolean | string | undefined} value - The new value for the field.
   */
  const handleSocialSkillsChange = (
    field: keyof CanineFormValues["socialSkills"],
    value: boolean | string | undefined,
  ) => {
    const updatedSocialSkills = {
      ...form.getValues("socialSkills"),
      [field]: value,
    };
    form.setValue("socialSkills", updatedSocialSkills);
  };

  /**
   * Handles changes to the behaviour fields in the form.
   *
   * @param {keyof CanineFormValues["behaviour"]} field - The field being updated.
   * @param {boolean | string | undefined} value - The new value for the field.
   */
  const handleBehaviourChange = (
    field: keyof CanineFormValues["behaviour"],
    value: boolean | string | undefined,
  ) => {
    const updatedBehaviour = {
      ...form.getValues("behaviour"),
      [field]: value,
    };
    form.setValue("behaviour", updatedBehaviour);
  };

  /**
   * Handles changes to the health fields in the form.
   *
   * @param {keyof CanineFormValues["health"]} field - The field being updated.
   * @param {boolean | string | undefined} value - The new value for the field.
   */
  const handleHealthChange = (
    field: keyof CanineFormValues["health"],
    value: boolean | string | undefined,
  ) => {
    const updatedHealth = {
      ...form.getValues("health"),
      [field]: value,
    };
    form.setValue("health", updatedHealth);
  };

  /**
   * Fetches the list of owners from the API.
   */
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get("/api/owners");
        setOwners(response.data);
      } catch (error) {
        console.error("Error fetching owners:", error);
        toast.error("Failed to fetch owners. Please try again.");
      }
    };
    fetchOwners();
  }, []);

  /**
   * Filters owners based on the search query.
   */
  useEffect(() => {
    if (searchQuery) {
      const results = owners.filter((owner: Owner) =>
        owner.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredOwners(results);
    } else {
      setFilteredOwners([]);
    }
  }, [searchQuery, owners]);

  /**
   * Retrieves the ownerId from the query string if present and sets the selected owner.
   */
  useEffect(() => {
    const ownerIdFromUrl = searchParams.get("owner-id");
    if (ownerIdFromUrl) {
      const owner = owners.find((owner) => owner.id === ownerIdFromUrl);
      if (owner) {
        setSelectedOwnerId(owner.id);
        setSelectedOwnerName(owner.name);
        form.setValue("ownerId", owner.id);
      }
    }
  }, [searchParams, owners]);

  /**
   * Handles the selection of an owner from the search results.
   *
   * @param {Owner} owner - The owner selected.
   */
  const handleSelectOwner = (owner: Owner) => {
    form.setValue("ownerId", owner.id);
    form.trigger("ownerId");
    setSelectedOwnerId(owner.id);
    setSelectedOwnerName(owner.name);

    // Update the URL with the new ownerId without reloading the page
    const newUrl = `/canines/new?owner-id=${owner.id}`;
    router.push(newUrl);

    setSearchQuery("");
    setFilteredOwners([]);
  };

  /**
   * Clears the selected owner from the form and URL.
   */
  const clearSelectedOwner = () => {
    setSelectedOwnerId(null);
    setSelectedOwnerName(null);
    form.setValue("ownerId", "");

    // Update the URL to remove the owner-id parameter
    const newUrl = `/canines/new`;
    router.push(newUrl);

    form.trigger("ownerId");
  };

  // Find the owner of the canine if editing existing data.
  const canineOwner = owners.find((owner) => owner.id === initialData?.ownerId);

  /**
   * Handles changes to the form fields and triggers validation.
   *
   * @param {keyof CanineFormValues} field - The field being updated.
   * @param {any} value - The new value for the field.
   */
  const handleFormChange = (field: keyof CanineFormValues, value: any) => {
    form.setValue(field, value);
    form.trigger(field);
  };

  /**
   * Handles form submission, either creating a new canine or updating an existing one.
   *
   * @param {CanineFormValues} data - The data submitted from the form.
   */
  const onSubmit = async (data: CanineFormValues) => {
    if (!data.ownerId) {
      toast.error("Please select an owner before proceeding");
      return;
    }

    const submitForm = async () => {
      setIsLoading(true);
      try {
        if (initialData) {
          console.log("Updating canine", data);
          const response = await axios.patch(
            `/api/canines/${params!.canineId}`,
            data,
          );
          return response.data;
        } else {
          const response = await axios.post(`/api/canines`, data);
          return response.data;
        }
      } catch (error) {
        console.error("Error in form submission", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    toast.promise(submitForm(), {
      loading: "Saving...",
      success: () => {
        router.push(`/canines`);
        router.refresh();
        return toastMessage;
      },
      error: "Something went wrong. Please try again.",
    });
  };

  /**
   * Handles the deletion of a canine.
   */
  const onDelete = () => {
    const deleteCanine = async () => {
      const response = await axios.delete(`/api/canines/${params!.canineId}`);
      return response.data;
    };

    toast.promise(deleteCanine(), {
      loading: "Deleting canine...",
      success: () => {
        router.push(`/canines`);
        router.refresh();
        return "Canine deleted successfully!";
      },
      error: "Something went wrong. Please try again.",
    });
  };

  /**
   * Handles keyboard navigation in the owner search results.
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} event - The keyboard event.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredOwners.length - 1),
      );
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      event.preventDefault();
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      const selectedOwner = filteredOwners[highlightedIndex];
      handleSelectOwner(selectedOwner);
    }
  };

  /**
   * Scrolls the highlighted owner into view when navigating with keyboard.
   */
  useEffect(() => {
    if (highlightedIndex >= 0 && highlightedIndex < filteredOwners.length) {
      resultsRefs.current[highlightedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  /**
   * Handles form validation errors by focusing on the first error field.
   *
   * @param {FieldErrors<CanineFormValues>} errors - The errors from form validation.
   */
  const onError = (errors: FieldErrors<CanineFormValues>) => {
    const firstErrorField = getFirstErrorFieldName(errors);
    if (firstErrorField) {
      form.setFocus(firstErrorField as any); // Casting to 'any' to satisfy TypeScript
      // Optional: Scroll into view if focus doesn't scroll automatically
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  /**
   * Recursively retrieves the name of the first field with a validation error.
   *
   * @param {FieldErrors<any>} errors - The errors object from form validation.
   * @returns {string | null} The name of the first error field, or null if none found.
   */
  function getFirstErrorFieldName(errors: FieldErrors<any>): string | null {
    for (const fieldName in errors) {
      if (errors.hasOwnProperty(fieldName)) {
        const error = errors[fieldName];
        if (error && (error as FieldError).type) {
          return fieldName;
        } else if (error && typeof error === "object") {
          const nestedField = getFirstErrorFieldName(error as FieldErrors<any>);
          if (nestedField) {
            return `${fieldName}.${nestedField}`;
          }
        }
      }
    }
    return null;
  }

  return (
    <div className="mx-auto w-fit">
      <AlertModal
        isOpen={openAlertModal}
        name={initialData?.name}
        onClose={() => setOpenAlertModal(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-4 pb-20"
        >
          {!selectedOwnerId && !initialData && !selectedOwnerName ? (
            <div className="mt-10 pb-4">
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="text-base">Select owner</FormLabel>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Search owner by name"
                        value={searchQuery}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn("flex w-64 flex-col", {
                          capitalize: searchQuery,
                        })}
                      />
                      {searchQuery && filteredOwners.length > 0 && (
                        <div className="absolute left-0 top-16 z-50 w-64 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                          {filteredOwners.map((owner, index) => (
                            <div
                              ref={(el) => {
                                if (el) {
                                  resultsRefs.current[index] = el;
                                }
                              }}
                              className={`flex cursor-pointer select-none items-center rounded-sm px-2 pb-1 pt-1.5 text-sm outline-none transition-colors hover:bg-stone-100 ${
                                highlightedIndex === index
                                  ? "bg-gradient-to-br from-blue-chill-100 to-blue-chill-100/70 font-semibold"
                                  : ""
                              }`}
                              key={owner.id}
                              onClick={() => handleSelectOwner(owner)}
                            >
                              {owner.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage className="ml-0.5 text-xs" />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className="mt-10">
              {initialData && (
                <div className="flex items-center">
                  <span className="mr-2 text-xl font-light">
                    {initialData.name}&apos;s owner:
                  </span>
                  <span className="text-xl">{canineOwner?.name}</span>
                </div>
              )}
            </div>
          )}

          {selectedOwnerName && (
            <div className="flex items-center">
              <span className="mr-2 text-xl font-light">Selected owner:</span>
              <span className="text-xl">{selectedOwnerName}</span>
              <div
                onClick={clearSelectedOwner}
                className="ml-6 bg-transparent transition-all duration-200 ease-in-out hover:-translate-x-0.5"
              >
                <DeleteIcon className="cursor-pointer text-red-500 opacity-100" />
              </div>
            </div>
          )}

          {/* Canine details */}
          <Accordion
            defaultValue={
              initialData
                ? ["item-1"]
                : ["item-1", "item-2", "item-3", "item-4", "item-5", "item-6"]
            }
            type="multiple"
          >
            <AccordionItem value="item-1" className="pt-4">
              <div className="flex items-center">
                <AccordionTrigger>Canine Details</AccordionTrigger>
                <Separator className="flex-1" />
              </div>
              <AccordionContent className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="nameInput"
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.name
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          {form.formState.errors.name ? (
                            <FormMessage />
                          ) : (
                            "Name"
                          )}
                        </label>
                        <FormControl>
                          <input
                            id="nameInput"
                            disabled={isLoading}
                            placeholder=""
                            {...field}
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                name: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                name: false,
                              }))
                            }
                            className="flex w-2/3 items-center rounded-l-none rounded-r-md border bg-card px-4 py-1.5 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="breedInput"
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.breed
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          {form.formState.errors.breed ? (
                            <FormMessage />
                          ) : (
                            "Breed"
                          )}
                        </label>
                        <FormControl>
                          <input
                            id="breedInput"
                            disabled={isLoading}
                            placeholder=""
                            {...field}
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                breed: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                breed: false,
                              }))
                            }
                            className="flex w-2/3 items-center rounded-l-none rounded-r-md border bg-card px-4 py-1.5 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <DateField
                        name="dateOfBirth"
                        id="dateOfBirthInput"
                        label="Date of Birth"
                        value={safeParseDate(field.value)}
                        onChange={(date) => {
                          field.onChange(date);
                          handleFormChange("dateOfBirth", date);
                        }}
                        ref={field.ref}
                        disableFutureDates={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.gender
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          {form.formState.errors.gender ? (
                            <FormMessage />
                          ) : (
                            "Gender"
                          )}
                        </label>
                        <div className="flex w-2/3 rounded-l-none rounded-r-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange("MALE");
                              handleFormChange("gender", "MALE");
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === "MALE"
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Male
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange("FEMALE");
                              handleFormChange("gender", "FEMALE");
                            }}
                            className={`flex-1 rounded-l-none rounded-r-md text-center focus:outline-none ${
                              field.value === "FEMALE"
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Female
                          </button>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="colorInput"
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.color
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          {form.formState.errors.color ? (
                            <FormMessage />
                          ) : (
                            "Color"
                          )}
                        </label>
                        <FormControl>
                          <input
                            id="colorInput"
                            disabled={isLoading}
                            placeholder=""
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleFormChange("color", e.target.value);
                            }}
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                color: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                color: false,
                              }))
                            }
                            className="flex w-2/3 items-center rounded-l-none rounded-r-md border bg-card px-4 py-1.5 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="microChipNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="microChipNumberInput"
                          className={`flex min-h-[36px] w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-2 text-right md:h-10 ${
                            activeFields.microChipNumber
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          {form.formState.errors.microChipNumber ? (
                            <FormMessage />
                          ) : (
                            "Microchip Number"
                          )}
                        </label>
                        <FormControl>
                          <input
                            id="microChipNumberInput"
                            disabled={isLoading}
                            placeholder=""
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleFormChange(
                                "microChipNumber",
                                e.target.value,
                              );
                            }}
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                microChipNumber: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                microChipNumber: false,
                              }))
                            }
                            className="flex min-h-[36px] w-2/3 items-center rounded-l-none rounded-r-md border bg-card px-4 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spayed"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.spayed
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          {form.formState.errors.spayed ? (
                            <FormMessage />
                          ) : (
                            "Spayed?"
                          )}
                        </label>
                        <div className="flex w-2/3 rounded-l-none rounded-r-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleFormChange("spayed", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleFormChange("spayed", false);
                            }}
                            className={`flex-1 rounded-l-none rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <FormControl>
                          <textarea
                            id="notesInput"
                            disabled={isLoading}
                            placeholder="Notes (optional)"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleFormChange("notes", e.target.value);
                            }}
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                notes: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                notes: false,
                              }))
                            }
                            className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Vaccination Details */}
            <AccordionItem value="item-2">
              <div className="flex items-center">
                <AccordionTrigger>Vaccination Details</AccordionTrigger>
                <Separator className="flex-1" />
              </div>
              <AccordionContent className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="DHPP"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <DateField
                        id="DHPPInput"
                        name="DHPP"
                        label={
                          form.formState.errors.DHPP ? <FormMessage /> : "DHPP"
                        }
                        value={safeParseDate(field.value)}
                        onChange={(date) => {
                          field.onChange(date);
                          handleFormChange("DHPP", date);
                        }}
                        ref={field.ref}
                        disableFutureDates={true}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="LEPTO"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <DateField
                        id="LEPTOInput"
                        name="LEPTO"
                        label={
                          form.formState.errors.LEPTO ? (
                            <FormMessage />
                          ) : (
                            "LEPTO"
                          )
                        }
                        value={safeParseDate(field.value)}
                        onChange={(date) => {
                          field.onChange(date);
                          handleFormChange("LEPTO", date);
                        }}
                        ref={field.ref}
                        disableFutureDates={true}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="KC"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <DateField
                        id="KCInput"
                        name="KC"
                        label={
                          form.formState.errors.KC ? <FormMessage /> : "KC"
                        }
                        value={safeParseDate(field.value)}
                        onChange={(date) => {
                          field.onChange(date);
                          handleFormChange("KC", date);
                        }}
                        ref={field.ref}
                        disableFutureDates={true}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fleaed"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <div className="flex text-sm md:w-[700px]">
                        <input
                          type="text"
                          name={field.name}
                          ref={field.ref}
                          value={field.value ? "Yes" : "No"}
                          readOnly
                          className="pointer-events-none absolute w-10 opacity-0"
                        />
                        <label
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.fleaed
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          {form.formState.errors.fleaed ? (
                            <FormMessage />
                          ) : (
                            "Fleaed?"
                          )}
                        </label>
                        <div className="flex w-2/3 rounded-l-none rounded-r-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleFormChange("fleaed", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleFormChange("fleaed", false);
                            }}
                            className={`flex-1 rounded-l-none rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Vet details */}
            <AccordionItem value="item-3">
              <div className="flex items-center">
                <AccordionTrigger>Vet Details</AccordionTrigger>
                <Separator className="flex-1" />
              </div>
              <AccordionContent className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="vetName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="vetNameInput"
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.vetName
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Vet Name
                        </label>
                        <FormControl>
                          <input
                            id="vetNameInput"
                            disabled={isLoading}
                            placeholder=""
                            {...field}
                            onChange={(e) =>
                              handleFormChange("vetName", e.target.value)
                            }
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                vetName: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                vetName: false,
                              }))
                            }
                            className="flex w-2/3 items-center rounded-l-none rounded-r-md border bg-card px-4 py-1.5 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vetPhone"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="vetPhoneInput"
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.vetPhone
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Vet Phone
                        </label>
                        <FormControl>
                          <input
                            id="vetPhoneInput"
                            disabled={isLoading}
                            placeholder=""
                            {...field}
                            onChange={(e) =>
                              handleFormChange("vetPhone", e.target.value)
                            }
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                vetPhone: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                vetPhone: false,
                              }))
                            }
                            className="flex w-2/3 items-center rounded-l-none rounded-r-md border bg-card px-4 py-1.5 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="vetAddressInput"
                          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.vetAddress
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Vet Address
                        </label>
                        <FormControl>
                          <input
                            id="vetAddressInput"
                            disabled={isLoading}
                            placeholder=""
                            {...field}
                            onChange={(e) =>
                              handleFormChange("vetAddress", e.target.value)
                            }
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                vetAddress: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                vetAddress: false,
                              }))
                            }
                            className="flex w-2/3 items-center rounded-l-none rounded-r-md border bg-card px-4 py-1.5 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Social skills */}
            <AccordionItem value="item-4">
              <div className="flex items-center">
                <AccordionTrigger>Social Skills</AccordionTrigger>
                <Separator className="flex-1" />
              </div>
              <AccordionContent className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="socialSkills.otherPets"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="otherPetsInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.otherPets
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Do you have any other pets?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleSocialSkillsChange("otherPets", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleSocialSkillsChange("otherPets", false);
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchOtherPets === true && (
                  <FormField
                    control={form.control}
                    name="socialSkills.otherPetsDetails"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex text-sm md:w-[700px]">
                          <FormControl>
                            <textarea
                              id="otherPetsDetailsInput"
                              disabled={isLoading}
                              rows={1}
                              placeholder="Your other pets"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleSocialSkillsChange(
                                  "otherPetsDetails",
                                  e.target.value,
                                );
                              }}
                              onFocus={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  otherPetsDetails: true,
                                }))
                              }
                              onBlur={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  otherPetsDetails: false,
                                }))
                              }
                              className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="socialSkills.walksWithOtherDogs"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="walksWithOtherDogsInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.walksWithOtherDogs
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Do you walk your dog with other dogs currently?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleSocialSkillsChange(
                                "walksWithOtherDogs",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleSocialSkillsChange(
                                "walksWithOtherDogs",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialSkills.allowedOffLeash"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="allowedOffLeashInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.allowedOffLeash
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Do you allow your dog off lead away from home?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleSocialSkillsChange("allowedOffLeash", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleSocialSkillsChange(
                                "allowedOffLeash",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialSkills.hasRecall"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="hasRecallInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.hasRecall
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Does your dog recall to name?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleSocialSkillsChange("hasRecall", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleSocialSkillsChange("hasRecall", false);
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialSkills.getsAlongWithDogs"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="getsAlongWithDogsInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.getsAlongWithDogs
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Does your dog get along with other dogs?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleSocialSkillsChange(
                                "getsAlongWithDogs",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleSocialSkillsChange(
                                "getsAlongWithDogs",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialSkills.runsFreelyWithDogs"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="runsFreelyWithDogsInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.runsFreelyWithDogs
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Does your dog run freely (off lead) with other dogs?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleSocialSkillsChange(
                                "runsFreelyWithDogs",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleSocialSkillsChange(
                                "runsFreelyWithDogs",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialSkills.recognizedCommands"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <FormControl>
                          <textarea
                            id="recognizedCommandsInput"
                            disabled={isLoading}
                            rows={1}
                            placeholder="What commands does your dog recognize?"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleSocialSkillsChange(
                                "recognizedCommands",
                                e.target.value,
                              );
                            }}
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                recognizedCommands: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                recognizedCommands: false,
                              }))
                            }
                            className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Behaviour */}
            <AccordionItem value="item-5">
              <div className="flex items-center">
                <AccordionTrigger>Behaviour</AccordionTrigger>
                <Separator className="flex-1" />
              </div>
              <AccordionContent className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="behaviour.aggressiveOverToys"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="aggressiveOverToysInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.aggressiveOverToys
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Is you dog aggressive/possessive over toys?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange("aggressiveOverToys", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange(
                                "aggressiveOverToys",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behaviour.allowsRemovingObjectsFromMouth"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="allowsRemovingObjectsFromMouthInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.allowsRemovingObjectsFromMouth
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Will your dog allow objects to be removed from its
                          mouth?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange(
                                "allowsRemovingObjectsFromMouth",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange(
                                "allowsRemovingObjectsFromMouth",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behaviour.aggressiveOverFood"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="aggressiveOverFoodInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.aggressiveOverFood
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Is you dog aggressive/possessive over food?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange("aggressiveOverFood", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange(
                                "aggressiveOverFood",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="behaviour.gameTypes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <FormControl>
                          <textarea
                            id="gameTypesInput"
                            disabled={isLoading}
                            rows={1}
                            placeholder="What types of games does your dog enjoy?"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleBehaviourChange(
                                "gameTypes",
                                e.target.value,
                              );
                            }}
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                gameTypes: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                gameTypes: false,
                              }))
                            }
                            className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behaviour.anxiousOrFrightened"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="anxiousOrFrightenedInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.anxiousOrFrightened
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Is your dog anxious or frightened by anything?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange(
                                "anxiousOrFrightened",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange(
                                "anxiousOrFrightened",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behaviour.actsDifferentlyOnOrOffLead"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="actsDifferentlyOnOrOffLeadInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.actsDifferentlyOnOrOffLead
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Does your dog act differently on or off lead?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange(
                                "actsDifferentlyOnOrOffLead",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange(
                                "actsDifferentlyOnOrOffLead",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behaviour.hasAttacked"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="hasAttackedInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.hasAttacked
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Has your dog ever attacked anyone or any other dog?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange("hasAttacked", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange("hasAttacked", false);
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behaviour.hasGrowledOrSnarled"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="hasGrowledOrSnarledInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.hasGrowledOrSnarled
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Has your dog ever growled or snarled at anyone?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange(
                                "hasGrowledOrSnarled",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange(
                                "hasGrowledOrSnarled",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behaviour.hasJumpedOverFence"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="hasJumpedOverFenceInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.hasJumpedOverFence
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Has your dog ever climbed or jumped over a fence?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange("hasJumpedOverFence", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange(
                                "hasJumpedOverFence",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchHasJumpedOverFence === true && (
                  <FormField
                    control={form.control}
                    name="behaviour.fenceHeight"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex text-sm md:w-[700px]">
                          <FormControl>
                            <textarea
                              id="fenceHeightInput"
                              disabled={isLoading}
                              rows={1}
                              placeholder="Height of Fence (feet)"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleBehaviourChange(
                                  "fenceHeight",
                                  e.target.value,
                                );
                              }}
                              onFocus={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  fenceHeight: true,
                                }))
                              }
                              onBlur={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  fenceHeight: false,
                                }))
                              }
                              className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Health */}
            <AccordionItem value="item-6">
              <div className="flex items-center">
                <AccordionTrigger>Health</AccordionTrigger>
                <Separator className="flex-1" />
              </div>
              <AccordionContent className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="health.hasHealthCondition"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="hasHealthConditionInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.hasHealthCondition
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Does your dog have any health condition?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleHealthChange("hasHealthCondition", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleHealthChange("hasHealthCondition", false);
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchHasHealthCondition === true && (
                  <FormField
                    control={form.control}
                    name="health.healthConditionDetails"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex text-sm md:w-[700px]">
                          <FormControl>
                            <textarea
                              id="healthConditionDetailsInput"
                              disabled={isLoading}
                              rows={1}
                              placeholder="Details of dog's health condition"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleHealthChange(
                                  "healthConditionDetails",
                                  e.target.value,
                                );
                              }}
                              onFocus={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  healthConditionDetails: true,
                                }))
                              }
                              onBlur={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  healthConditionDetails: false,
                                }))
                              }
                              className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="health.beenIllInLast30Days"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="beenIllInLast30DaysInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.beenIllInLast30Days
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Has your dog been ill in the last 30 days?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleHealthChange("beenIllInLast30Days", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleHealthChange("beenIllInLast30Days", false);
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="health.hasAllergies"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="hasAllergiesInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.hasAllergies
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Has your dog got any allergies?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleHealthChange("hasAllergies", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleHealthChange("hasAllergies", false);
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchHasAllergies === true && (
                  <FormField
                    control={form.control}
                    name="health.allergyDetails"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex text-sm md:w-[700px]">
                          <FormControl>
                            <textarea
                              id="allergyDetailsInput"
                              disabled={isLoading}
                              rows={1}
                              placeholder="What allergies does your dog have?"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleHealthChange(
                                  "allergyDetails",
                                  e.target.value,
                                );
                              }}
                              onFocus={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  allergyDetails: true,
                                }))
                              }
                              onBlur={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  allergyDetails: false,
                                }))
                              }
                              className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="health.onMedication"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="onMedicationInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.onMedication
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Is your dog on medication?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleHealthChange("onMedication", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleHealthChange("onMedication", false);
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchOnMedication === true && (
                  <FormField
                    control={form.control}
                    name="health.medicationDetails"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex text-sm md:w-[700px]">
                          <FormControl>
                            <textarea
                              id="medicationDetailsInput"
                              disabled={isLoading}
                              rows={1}
                              placeholder="What medication is your dog currently on?"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleHealthChange(
                                  "medicationDetails",
                                  e.target.value,
                                );
                              }}
                              onFocus={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  medicationDetails: true,
                                }))
                              }
                              onBlur={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  medicationDetails: false,
                                }))
                              }
                              className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {watchOnMedication === true && (
                  <FormField
                    control={form.control}
                    name="health.administerMedicationAtCreche"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex text-sm md:w-[700px]">
                          <label
                            htmlFor="administerMedicationAtCrecheInput"
                            className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 ${
                              activeFields.administerMedicationAtCreche
                                ? "border-[1.5px] border-ring"
                                : ""
                            }`}
                          >
                            Do you require us to administer this medication
                            while at the creche?
                          </label>
                          <div className="flex w-1/3 rounded-e-md border">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                field.onChange(true);
                                handleHealthChange(
                                  "administerMedicationAtCreche",
                                  true,
                                );
                              }}
                              className={`flex-1 text-center focus:outline-none ${
                                field.value === true
                                  ? "bg-card"
                                  : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                              }`}
                            >
                              Yes
                            </button>
                            <div className="border-l"></div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                field.onChange(false);
                                handleHealthChange(
                                  "administerMedicationAtCreche",
                                  false,
                                );
                              }}
                              className={`flex-1 rounded-r-md text-center focus:outline-none ${
                                field.value === false
                                  ? "bg-card"
                                  : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="health.doYouRequireUsToFeedYourDogWhilstAtCreche"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="doYouRequireUsToFeedYourDogWhilstAtCrecheInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.doYouRequireUsToFeedYourDogWhilstAtCreche
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Do you require us to feed your dog whilst at Creche?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleHealthChange(
                                "doYouRequireUsToFeedYourDogWhilstAtCreche",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleHealthChange(
                                "doYouRequireUsToFeedYourDogWhilstAtCreche",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="behaviour.allowedTreats"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="allowedTreatsInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.allowedTreats
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Is your dog allowed treats?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleBehaviourChange("allowedTreats", true);
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleBehaviourChange("allowedTreats", false);
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="health.hasYourDogHadAnyInternationalTravel"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <label
                          htmlFor="hasYourDogHadAnyInternationalTravelInput"
                          className={`flex w-2/3 items-center justify-end rounded-s-md border bg-card px-4 py-1.5 md:h-10 ${
                            activeFields.hasYourDogHadAnyInternationalTravel
                              ? "border-[1.5px] border-ring"
                              : ""
                          }`}
                        >
                          Has your dog had any international travel?
                        </label>
                        <div className="flex w-1/3 rounded-e-md border">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(true);
                              handleHealthChange(
                                "hasYourDogHadAnyInternationalTravel",
                                true,
                              );
                            }}
                            className={`flex-1 text-center focus:outline-none ${
                              field.value === true
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <div className="border-l"></div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(false);
                              handleHealthChange(
                                "hasYourDogHadAnyInternationalTravel",
                                false,
                              );
                            }}
                            className={`flex-1 rounded-r-md text-center focus:outline-none ${
                              field.value === false
                                ? "bg-card"
                                : "cursor-pointer bg-background text-slate-300 dark:text-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchHasYourDogHadAnyInternationalTravel === true && (
                  <FormField
                    control={form.control}
                    name="health.whichCountries"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex text-sm md:w-[700px]">
                          <FormControl>
                            <textarea
                              id="whichCountriesInput"
                              disabled={isLoading}
                              rows={1}
                              placeholder="If yes, which Countries?"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleHealthChange(
                                  "whichCountries",
                                  e.target.value,
                                );
                              }}
                              onFocus={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  whichCountries: true,
                                }))
                              }
                              onBlur={() =>
                                setActiveFields((prev) => ({
                                  ...prev,
                                  whichCountries: false,
                                }))
                              }
                              className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="health.otherSpecialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex text-sm md:w-[700px]">
                        <FormControl>
                          <textarea
                            id="otherSpecialNeedsInput"
                            disabled={isLoading}
                            rows={2}
                            placeholder="Any other special needs or additional information?"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleHealthChange(
                                "otherSpecialNeeds",
                                e.target.value,
                              );
                            }}
                            onFocus={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                otherSpecialNeeds: true,
                              }))
                            }
                            onBlur={() =>
                              setActiveFields((prev) => ({
                                ...prev,
                                otherSpecialNeeds: false,
                              }))
                            }
                            className="flex w-full items-center rounded-md border bg-card px-4 py-2 placeholder:text-gray-500 focus-visible:border-[1.5px] focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[40px]"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex flex-col items-center justify-start space-y-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              effect={"shineHover"}
              className="w-40 md:w-80"
            >
              {action}
            </Button>
            {initialData && (
              <Button
                disabled={isLoading}
                type="button"
                onClick={() => setOpenAlertModal(true)}
                className="w-40 border border-destructive bg-destructive/15 text-primary hover:bg-destructive/30 md:w-80"
              >
                <div className="flex items-center">
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete canine
                </div>
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
