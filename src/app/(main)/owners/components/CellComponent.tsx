"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { OwnerColumn } from "./Columns";

export function CellComponent({
  owner,
  label,
}: {
  owner: OwnerColumn;
  label: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="hover:bg-card-hovered w-full justify-start hover:text-foreground"
      onClick={() => router.push(`/owners/${owner.id}`)}
    >
      <div className="truncate whitespace-nowrap">{label}</div>
    </Button>
  );
}
