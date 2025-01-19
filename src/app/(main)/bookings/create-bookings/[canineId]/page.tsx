import prismadb from "@/lib/prismadb";
import { Separator } from "@/components/ui/separator";
import CreateBookingsForm from "../components/CreateBookingsForm";
import Heading from "@/components/ui/heading";

type Props = Promise<{ canineId: string }>;

export default async function CreateMultipleBookings({
  params,
}: {
  params: Props;
}) {
  const { canineId } = await params;

  const canine = await prismadb.canine.findUnique({
    where: { id: canineId },
  });

  const canineName = canine ? canine.name : "Canine";

  return (
    <div className="flex w-full flex-col items-center space-y-4 pt-10 md:p-8">
      <div className="text-center">
        <Heading title={`Create bookings for ${canineName}`} />
      </div>
      <Separator className="hidden sm:block" />
      <div className="sm:pt-4">
        <CreateBookingsForm canine={canine} />
      </div>
    </div>
  );
}
