import { format, parseISO, set } from "date-fns";

/**
 * Utility function to format a date as 'dd.MM.yyyy'
 * and strip the time portion.
 */
export function formatDateToDisplay(date: Date): string {
  const dateWithoutTime = set(date, {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  return format(dateWithoutTime, "MMM dd, yyyy");
}

export function safeParseDate(value: string | Date | null): Date | null {
  if (value === null) return null;
  if (typeof value === "string") return parseISO(value);
  return value;
}

export const formatDateToISO = (date: Date): string => {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0!
  const dd = date.getDate().toString().padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

export const formatDayNumber = (date: Date): string => {
  return format(date, "dd");
};

export const parseDateString = (dateString: string) => parseISO(dateString);
