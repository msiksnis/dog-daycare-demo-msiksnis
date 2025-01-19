"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  ArrowBigLeftIcon,
  ArrowBigRightIcon,
  Edit2Icon,
  MoreVertical,
  PlusCircleIcon,
  Trash2Icon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/modals/AlertModal";
import { cn } from "@/lib/utils";

type CanineWithSelectedFields = {
  id: string;
  name: string;
  owner: {
    name: string;
    mobile: string | null;
    email: string | null;
  };
  upcomingBookings: Array<{
    date: Date;
    isHalfDay: boolean;
  }>;
  previousBookings: Array<{
    date: Date;
    isHalfDay: boolean;
  }>;
};

type CellActionProps = {
  canine: CanineWithSelectedFields;
  onOpenModal: (
    canineId: string,
    bookings: { date: Date; isHalfDay: boolean }[],
    title: string,
  ) => void;
};

export default function CellAction({ canine, onOpenModal }: CellActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const router = useRouter();

  const onDelete = () => {
    const deleteCanine = async () => {
      const response = await axios.delete(`/api/canines/${canine.id}`);

      return response.data;
    };

    toast.promise(deleteCanine(), {
      loading: "Deleting canine...",
      success: () => {
        router.refresh();
        return "Canine deleted successfully!";
      },
      error: "Something went wrong. Please try again.",
    });
    setOpenAlertModal(false);
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical
              className={cn(
                "size-5 transition-all duration-200 md:rotate-90",
                dropdownOpen && "scale-150",
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/canines/${canine.id}`)}
          >
            <Edit2Icon className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
              router.push(`/bookings/multiple-bookings/${canine.id}`)
            }
          >
            <div className="flex items-center">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Multiple Bookings
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              onOpenModal(
                canine.id,
                canine.upcomingBookings,
                "Upcoming Bookings",
              );
            }}
          >
            <div className="flex">
              <ArrowBigRightIcon className="-ml-0.5 mr-2 size-5" />
              Upcoming Bookings
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              onOpenModal(
                canine.id,
                canine.previousBookings,
                "Previous Bookings",
              );
            }}
          >
            <div className="flex">
              <ArrowBigLeftIcon className="-ml-0.5 mr-2 size-5" />
              Previous Bookings
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            destructive
            className="cursor-pointer"
            onClick={() => setOpenAlertModal(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertModal
        isOpen={openAlertModal}
        name={canine.name}
        onClose={() => setOpenAlertModal(false)}
        loading={isLoading}
        onConfirm={onDelete}
      />
    </>
  );
}
