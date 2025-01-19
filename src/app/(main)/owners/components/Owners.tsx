"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  AtSignIcon,
  MoreHorizontal,
  PhoneIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { Booking, Canine } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import BookingInfo from "@/components/BookingInfo";
import CellAction from "./CellOptions";
import MainLoader from "@/components/MainLoader";
import Container from "@/components/Container";
import { Input } from "@/components/ui/input";
import UpcomingBookingsForOwnerModal from "@/components/modals/UpcomingBookingsForOwnerModal";
import FormError from "@/components/FormError";

export interface OwnerWithRelationsProps {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  workPhone: string | null;
  address: string | null;
  emergencyContact: string | null;
  canines: Canine[];
  bookings: Booking[];
  createdAt: Date;
  updatedAt: Date;
}

export default function Owners() {
  const [
    isUpcomingBookingsForOwnerModalOpen,
    setIsUpcomingBookingsForOwnerModalOpen,
  ] = useState(false);
  const [selectedOwner, setSelectedOwner] =
    useState<OwnerWithRelationsProps | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<
    { date: Date; isHalfDay: boolean; canineName: string }[]
  >([]);
  const [filterText, setFilterText] = useState("");

  const router = useRouter();
  const today = new Date();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["owners"],
    queryFn: () =>
      kyInstance.get("/api/owners").json<OwnerWithRelationsProps[]>(),
    staleTime: 1000 * 60,
  });

  const owners = data || [];

  const handleOpenModal = (owner: OwnerWithRelationsProps) => {
    const upcomingBookings = owner.bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        return (
          bookingDate > today ||
          (bookingDate.toDateString() === today.toDateString() &&
            booking.checkInStatus === "NOT_CHECKED_IN")
        );
      })
      .map((booking) => ({
        ...booking,
        canineName:
          owner.canines.find((canine) => canine.id === booking.canineId)
            ?.name || "Unknown Canine",
      }));

    setSelectedOwner(owner);
    setUpcomingBookings(upcomingBookings);
    setIsUpcomingBookingsForOwnerModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpcomingBookingsForOwnerModalOpen(false);
    setSelectedOwner(null);
    setUpcomingBookings([]);
  };

  const filteredOwners = useMemo(() => {
    return owners.filter((owner) =>
      owner.name.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [owners, filterText]);
  const handleClearFilter = () => {
    setFilterText("");
  };

  const processedOwners = filteredOwners.map((owner) => {
    const upcomingBookings = (owner.bookings || [])
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        return (
          bookingDate > today ||
          (bookingDate.toDateString() === today.toDateString() &&
            booking.checkInStatus === "NOT_CHECKED_IN")
        );
      })
      .map((booking) => ({
        ...booking,
        canineName:
          owner.canines.find((canine) => canine.id === booking.canineId)
            ?.name || "Unknown Canine",
      }));

    const firstUpcomingBooking = upcomingBookings[0];
    const moreBookings = upcomingBookings.length > 1;

    return {
      ...owner,
      firstUpcomingBooking,
      moreBookings,
    };
  });

  return (
    <Container
      heading={`Owners (${owners.length})`}
      subHeading="Manage canine owners"
    >
      <div className="flex items-center justify-between">
        <div className="relative max-w-60 md:min-w-60">
          <Input
            placeholder="Filter by name"
            className={cn({ capitalize: filterText })}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            disabled={!filterText}
            className="absolute right-1 top-2 size-6 disabled:opacity-0"
            onClick={handleClearFilter}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
        <Button
          onClick={() => router.push("/owners/new")}
          effect={"shineHover"}
          animation="scaleOnTap"
          className="px-6"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add New
        </Button>
      </div>

      {isError ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center space-y-4">
          <FormError message="Failed to fetch owners." />
          <Button size="lg" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : isFetching ? (
        <MainLoader className="mt-24" />
      ) : (
        <div className="py-6">
          {processedOwners.map((owner) => (
            <div
              key={owner.id}
              className={cn(
                "border border-b-0 border-slate-300 bg-white py-1 pl-4 transition-colors duration-200 first:rounded-t-md last:rounded-b-md last:border-b even:bg-slate-50 hover:bg-muted",
                { "rounded-md": filteredOwners.length === 1 },
              )}
            >
              <div className="flex h-12 divide-x md:h-14">
                {/* Owner details */}
                <div className="no-scrollbar flex w-[90%] flex-col justify-center overflow-y-scroll py-0.5 pr-4 md:w-4/12 md:space-y-1.5">
                  <Link
                    href={`/owners/${owner.id}`}
                    className="whitespace-nowrap"
                  >
                    <Button
                      variant={"link"}
                      effect={"hoverUnderline"}
                      className="h-fit p-0 after:bottom-0.5 after:w-full"
                    >
                      {owner.name}
                    </Button>
                  </Link>
                  <div className="flex space-x-2">
                    <div className="flex items-center whitespace-nowrap text-sm font-normal text-secondary-foreground">
                      <PhoneIcon className="mr-1.5 size-4" />
                      {owner.mobile || "No phone number"}
                    </div>
                    <Separator orientation="vertical" className="bg-gray-400" />
                    <div className="flex items-center whitespace-nowrap pr-4 text-sm font-normal text-secondary-foreground">
                      <AtSignIcon className="mr-1.5 size-4" />
                      {owner.email || "No email"}
                    </div>
                  </div>
                </div>

                {/* Canine details */}
                <div className="hidden w-4/12 md:block">
                  {owner.canines?.length > 0 ? (
                    <div className="no-scrollbar flex h-full flex-wrap items-center gap-x-2 gap-y-1 overflow-scroll px-4 py-0.5">
                      {owner.canines.map((canine) => (
                        <HoverCard key={canine.id}>
                          <HoverCardTrigger className="group cursor-pointer rounded-full">
                            <div className="size-fit max-w-[285px] truncate rounded-full border border-slate-300 px-2 text-sm font-normal shadow-sm transition-all hover:bg-gray-100">
                              {canine.name}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent side="top">
                            <Link
                              href={`/bookings/multiple-bookings/${canine.id}`}
                              className="flex items-center rounded-sm from-blue-chill-200 to-blue-chill-300 px-2 py-1 text-sm transition-colors duration-200 hover:bg-gradient-to-br"
                            >
                              Add Booking
                            </Link>
                            <Link
                              href={`/canines/${canine.id}`}
                              className="flex items-center rounded-sm from-blue-chill-200 to-blue-chill-300 px-2 py-1 text-sm transition-colors duration-200 hover:bg-gradient-to-br"
                            >
                              View/Edit Canine
                            </Link>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-secondary-foreground">
                      Has no canines yet
                    </div>
                  )}
                </div>

                {/* Upcoming bookings */}
                <div className="hidden w-3/12 md:block">
                  {owner.firstUpcomingBooking ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-1 overflow-y-scroll px-4">
                      <BookingInfo
                        date={owner.firstUpcomingBooking.date}
                        isHalfDay={owner.firstUpcomingBooking.isHalfDay}
                        label="Next"
                      />
                      {owner.moreBookings && (
                        <button
                          className="group size-fit h-[22px] max-w-[285px] rounded-full px-4 text-xs font-normal transition-all hover:bg-gray-100"
                          onClick={() => handleOpenModal(owner)}
                        >
                          <MoreHorizontal className="size-5 opacity-70 group-hover:opacity-100" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-secondary-foreground">
                      No upcoming bookings
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex w-[10%] items-center justify-center md:w-1/12">
                  <CellAction data={owner} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOwner && (
        <UpcomingBookingsForOwnerModal
          isOpen={isUpcomingBookingsForOwnerModalOpen}
          onClose={handleCloseModal}
          ownerId={selectedOwner.id}
          ownerName={selectedOwner.name}
          bookings={upcomingBookings}
        />
      )}
    </Container>
  );
}
