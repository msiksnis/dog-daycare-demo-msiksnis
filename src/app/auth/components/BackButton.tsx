"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href: string;
  label: string;
}

export default function BackButton({ href, label }: BackButtonProps) {
  return (
    <div className="flex w-full justify-center">
      <Button
        variant={"link"}
        effect={"hoverUnderline"}
        className="px-0 after:w-full"
        asChild
      >
        <Link href={href} className="">
          {label}
        </Link>
      </Button>
    </div>
  );
}
