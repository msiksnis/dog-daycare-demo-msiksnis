import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

interface ApiErrorResponse {
  error: string;
}

export function handleApiError(
  error: unknown,
  message: string,
): NextResponse<ApiErrorResponse> {
  console.error(message, error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

// Converts price from a string (dollars) to an integer (cents)
export function formatPriceToCents(price: string | number): number {
  const parsedPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(parsedPrice)) {
    throw new Error("Invalid price input");
  }
  return Math.round(parsedPrice); // Convert to cents
}

// Converts price from cents (integer) to a string with two decimal places (dollars)
export function formatPriceToDollars(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2); // Convert to dollars and format to two decimal places
}

export function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as T;
}
