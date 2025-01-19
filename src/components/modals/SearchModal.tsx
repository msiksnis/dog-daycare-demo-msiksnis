"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { DogIcon, Plus, Search, UserIcon, X } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

import { Owner, Canine, Booking } from "@/types/search";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { SearchModalBones } from "./SearchModalBones";
import { Input } from "../ui/input";
import useDebounce from "@/hooks/useDebounce";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function SearchModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    owners: Owner[];
    canines: Canine[];
    bookings: Booking[];
  }>({ owners: [], canines: [], bookings: [] });
  const [selectedCanine, setSelectedCanine] = useState<Canine | null>(null);

  const debouncedQuery = useDebounce(query, 200);

  // Ref for the input field
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to fetch data when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      axios
        .get(`/api/search?query=${debouncedQuery}`)
        .then((response) => {
          const data = response.data;
          setResults(data);
          if (data.canines.length === 1) {
            setSelectedCanine(data.canines[0]);
          } else {
            setSelectedCanine(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
        });
    } else {
      setResults({ owners: [], canines: [], bookings: [] });
      setSelectedCanine(null);
    }
  }, [debouncedQuery]);

  // Handler for input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  // Handler to clear results and reset state
  const handleClearResults = () => {
    setQuery("");
    setResults({ owners: [], canines: [], bookings: [] });
    setSelectedCanine(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handler to select a canine
  const handleCanineClick = (canine: Canine) => {
    setSelectedCanine(canine);
  };

  // Handler for link click that clears results and closes the modal
  const handleLinkClick = () => {
    handleClearResults();
    onClose();
  };

  // Handler for modal close to clear results and reset state
  const handleModalClose = () => {
    handleClearResults();
    onClose();
  };

  // Filter owners based on selected canine
  const filteredOwners = selectedCanine
    ? results.owners.filter((owner) => owner.id === selectedCanine.ownerId)
    : results.owners;

  // Filter bookings based on selected canine
  const filteredBookings = selectedCanine
    ? results.bookings.filter(
        (booking) => booking.canineId === selectedCanine.id,
      )
    : [];

  return (
    <SearchModalBones
      title=""
      description=""
      isOpen={isOpen}
      onClose={handleModalClose}
      optionalClassName="no-scrollbar !top-0 !translate-y-2 max-h-[95vh] !pb-2 !max-w-3xl gap-0 overflow-scroll bg-white p-0"
    >
      <div className="relative mt-2 p-0">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          className="border-none pl-10 !text-lg capitalize shadow-none ring-0 focus:ring-0"
        />
        <Search className="absolute left-2 top-3.5 size-5" />
        <Button
          variant="ghost"
          size="icon"
          disabled={!results}
          className={cn("absolute right-2 top-3 size-6 disabled:opacity-0", {
            hidden: !query,
          })}
          onClick={handleClearResults}
        >
          <X className="size-[1.125rem]" />
        </Button>
      </div>

      {selectedCanine ? (
        <div className="pt-4">
          {/* Display filtered owners */}
          <div className="w-full">
            {filteredOwners.length > 0 && (
              <>
                <div className="border-t pb-2" />
                <div className="px-3 text-gray-600">Client</div>
              </>
            )}
            {filteredOwners.map((owner) => (
              <Link
                key={owner.id}
                href={`/owners/${owner.id}`}
                onClick={handleLinkClick}
                className=""
              >
                <div className="mx-1 flex items-center justify-between rounded-sm px-2 py-1 transition-all hover:bg-blue-chill-100">
                  <div>{owner.name}</div>
                  <div className="text-sm text-gray-500">Jump to</div>
                </div>
              </Link>
            ))}
          </div>
          <Separator className="my-2" />
          {/* Display selected canine */}
          <div className="w-full">
            <div className="px-3 text-gray-600">Canine</div>
            <Link
              href={`/canines/${selectedCanine.id}`}
              onClick={handleLinkClick}
              className=""
            >
              <div className="mx-1 flex items-center justify-between rounded-sm px-2 py-1 transition-all hover:bg-blue-chill-100">
                <div>{selectedCanine.name}</div>
                <div className="text-sm text-gray-500">Jump to</div>
              </div>
            </Link>
          </div>
          <Separator className="my-2" />
          {/* Display upcoming bookings for selected canine */}
          <div className="w-full">
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center px-3 pb-2 pt-1">
                <div className="text-gray-600">
                  Upcoming bookings for {selectedCanine.name}
                </div>
                {/* Conditionally render the button based on the number of canines */}
                {results.canines.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 size-6 text-gray-600 hover:text-black"
                    onClick={() => setSelectedCanine(null)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <Link
                href={`/bookings/multiple-bookings/${selectedCanine.id}`}
                className="flex items-center px-3 text-sm text-gray-500 underline-offset-2 transition-all hover:text-black hover:underline"
                onClick={handleLinkClick}
              >
                <Plus className="mr-1 size-4" />
                Add Bookings
              </Link>
            </div>
            {filteredBookings.length > 0 ? (
              <>
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="mx-1 mb-2 flex items-center justify-between rounded-full border pl-4 shadow-sm"
                  >
                    <div>
                      {formatInTimeZone(
                        new Date(booking.date),
                        "UTC",
                        "yyyy-MM-dd",
                      )}
                    </div>
                    <Badge
                      className={cn(
                        "text-text flex items-center justify-center whitespace-nowrap rounded-full px-10 py-1 text-sm font-normal",
                        booking.isHalfDay
                          ? "bg-lime-300 hover:bg-lime-300"
                          : "bg-purple-300 hover:bg-purple-300",
                      )}
                    >
                      {booking.isHalfDay ? "Half Day" : "Full Day"}
                    </Badge>
                  </div>
                ))}
              </>
            ) : (
              <div className="mb-2 px-3">No upcoming bookings</div>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-4">
          {/* Display search results for owners */}
          <div className="w-full">
            {results.owners.length > 0 && (
              <>
                <div className="border-t pb-2" />
                <div className="px-3 pb-2 text-gray-500">Client</div>
              </>
            )}
            {results.owners.map((owner) => (
              <Link
                key={owner.id}
                href={`/owners/${owner.id}`}
                onClick={handleLinkClick}
              >
                <div className="mx-1 flex items-center justify-between rounded-sm px-2 py-1 transition-all hover:bg-blue-chill-100">
                  <div className="flex items-center">
                    <UserIcon className="mr-1.5 size-5" />
                    <div>{owner.name}</div>
                  </div>
                  <div className="text-sm text-gray-500">Jump to</div>
                </div>
              </Link>
            ))}
          </div>
          {results.canines.length > 0 && <Separator className="my-2" />}
          {/* Display search results for canines */}
          <div className="w-full">
            {results.canines.length > 0 && (
              <div className="px-3 pb-2 text-gray-600">Canine</div>
            )}
            {results.canines.map((canine) => (
              <div
                key={canine.id}
                onClick={() => handleCanineClick(canine)}
                className="mx-1 flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 pb-2 transition-all last:mb-2 hover:bg-blue-chill-100"
              >
                <div className="flex items-center">
                  <DogIcon className="mr-1.5 size-[1.2rem]" />
                  <div>{canine.name}</div>
                </div>
                <div className="text-sm text-gray-500">Select</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SearchModalBones>
  );
}
