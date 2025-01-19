"use client";

import { useState } from "react";
import { Edit2Icon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/modals/AlertModal";
import { cn } from "@/lib/utils";

interface ShopItemActionsProps {
  itemId: string;
  title: string;
  onDelete: (itemId: string) => void;
  isLoading: boolean;
}

export default function ShopItemOptions({
  itemId,
  title,
  onDelete,
  isLoading,
}: ShopItemActionsProps) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const router = useRouter();

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="outline-none hover:bg-transparent"
          >
            <span className="sr-only">Open menu</span>
            <div className="flex items-center justify-center">
              <MoreVerticalIcon
                className={cn(
                  "size-6 cursor-pointer transition-all duration-200 md:rotate-90",
                  dropdownOpen && "scale-150",
                )}
              />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/shop-items/${itemId}`)}
          >
            <Edit2Icon className="mr-2 h-4 w-4" />
            Update Item
          </DropdownMenuItem>
          <DropdownMenuItem
            destructive
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertModal
        isOpen={open}
        name={`${title}`}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          if (itemId) {
            onDelete(itemId);
          }
          setOpen(false);
        }}
        loading={isLoading}
      />
    </>
  );
}
