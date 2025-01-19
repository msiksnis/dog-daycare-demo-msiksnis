import { LogOut, Settings, UserIcon } from "lucide-react";
import Link from "next/link";

import LogoutButton from "@/app/auth/logout/LogoutButton";
import { ExtendedUser } from "../../next-auth";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface UserButtonProps {
  user: ExtendedUser;
}

export default function UserButton({ user }: UserButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"outline"}
          size="icon"
          className="flex-none rounded-full p-0"
        >
          {user?.image ? (
            <img
              src={user.image}
              alt="User profile picture"
              className="aspect-square rounded-full bg-background object-cover"
            />
          ) : (
            <UserIcon className="size-9" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-4 min-w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          {user?.name || "User"}
          <Badge className="rounded-lg border-blue-chill-500 bg-blue-chill-100 px-2 text-primary hover:bg-blue-chill-100">
            {user?.role}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings/profile">
              <UserIcon className="mr-2 size-5" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 size-5" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <LogoutButton>
              <button
                type="submit"
                className="flex w-full items-center rounded px-2 py-1 hover:bg-blue-chill-100"
              >
                <LogOut className="mr-2 size-5" />
                <span className="">Sign Out</span>
              </button>
            </LogoutButton>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
