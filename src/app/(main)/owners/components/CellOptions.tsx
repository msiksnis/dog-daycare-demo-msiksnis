"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2Icon, MoreVertical, Trash2Icon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/modals/AlertModal";
import { cn } from "@/lib/utils";
import { useDeleteOwner } from "../mutations/useDeleteOwnerMutation";
import { OwnerColumn } from "./Columns";

interface CellActionProps {
  data: OwnerColumn;
}

export default function CellOptions({ data }: CellActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const { mutate: deleteOwner } = useDeleteOwner();

  const router = useRouter();

  const handleDelete = () => {
    if (!data.id) return;

    deleteOwner(data.id, {
      onSuccess: () => {
        router.push("/owners");
        router.refresh();
      },
    });
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
        <DropdownMenuContent align="end" className="">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/owners/${data.id}`)}
          >
            <Edit2Icon className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            destructive
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertModal
        isOpen={open}
        name={data.name}
        onClose={() => setOpen(false)}
        loading={isLoading}
        onConfirm={handleDelete}
      />
    </>
  );
}
