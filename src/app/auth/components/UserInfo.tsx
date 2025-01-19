import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExtendedUser } from "../../../../next-auth";

interface UserInfoProps {
  user?: ExtendedUser;
  label?: string;
}

export default function UserInfo({ user, label }: UserInfoProps) {
  return (
    <Card className="w-full min-w-96 max-w-[600px]">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">{label}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-2 shadow-sm">
          <p className="font-medium">ID</p>
          <p className="max-w-44 truncate rounded-md bg-slate-100 px-2 py-1 font-mono text-sm">
            {user?.id}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-2 shadow-sm">
          <p className="font-medium">Name</p>
          <p className="max-w-44 truncate rounded-md bg-slate-100 px-2 py-1 font-mono text-sm">
            {user?.name}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-2 shadow-sm">
          <p className="font-medium">Email</p>
          <p className="max-w-44 truncate rounded-md bg-slate-100 px-2 py-1 font-mono text-sm">
            {user?.email}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-2 shadow-sm">
          <p className="font-medium">Role</p>
          <p className="max-w-44 truncate rounded-md bg-slate-100 px-2 py-1 font-mono text-sm">
            {user?.role}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-2 shadow-sm">
          <p className="font-medium">Two Factor Authentication</p>
          <p className="max-w-44 truncate rounded-md bg-slate-100 px-2 py-1 font-mono text-sm">
            {user?.isTwoFactorEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
