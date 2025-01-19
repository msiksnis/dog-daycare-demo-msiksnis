"use client";

import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import CellAction from "./CellOptions";
import { CellComponent } from "./CellComponent";

export type OwnerColumn = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  mobile: string | null;
  workPhone: string | null;
  emergencyContact: string | null;
  createdAt: Date;
};

export const columns: ColumnDef<OwnerColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <CellComponent owner={row.original} label={row.original.name} />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center py-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => (
      <CellComponent
        owner={row.original}
        label={format(row.original.createdAt, "yyyy-MM-dd")}
      />
    ),
  },
  {
    id: "action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
