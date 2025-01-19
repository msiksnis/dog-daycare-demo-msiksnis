import RoleChangeModal from "@/components/modals/RoleChangeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";
import { useState } from "react";
import { ExtendedUser } from "../../../../../../next-auth";

interface RoleChangeProps {
  user: ExtendedUser;
}

export default function RoleChange({ user }: RoleChangeProps) {
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const handleClick = () => {
    setRoleModalOpen(true);
  };

  const handleConfirm = () => {
    setRoleModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col items-start space-y-2 overflow-hidden rounded-lg border shadow-sm">
        <div className="flex w-full items-center justify-between p-2">
          <span className="text-base">Current role:</span>
          <Badge className="rounded-lg border-blue-chill-500 bg-blue-chill-100 px-2 text-primary hover:bg-blue-chill-100">
            {user.role}
          </Badge>
        </div>
        <div className="flex w-full justify-end border-t bg-[#FBFAFB] px-2 py-4">
          <Button
            type="button"
            variant={"outline"}
            onClick={handleClick}
            className="h-8 border border-blue-chill-500 bg-gradient-to-br from-blue-chill-100 to-blue-chill-100/80 text-sm transition-all duration-300 hover:bg-blue-chill-300"
          >
            Request role change
          </Button>
        </div>
      </div>
      <RoleChangeModal
        user={user}
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onConfirm={handleConfirm}
        currentRole={user.role}
        loading={false}
      />
    </>
  );
}
