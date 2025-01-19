import Container from "@/components/Container";
import prismadb from "@/lib/prismadb";
import MultipleBookingsForm from "../components/MultipleBookingsForm";

export default async function CreateMultipleBookings({
  params,
}: {
  params: { canineId: Promise<string> };
}) {
  const { canineId } = await params;

  const canine = await prismadb.canine.findUnique({
    where: { id: await canineId },
  });

  const canineName = canine ? canine.name : "Canine";

  return (
    <Container heading={`Create bookings for ${canineName}`}>
      <MultipleBookingsForm canine={canine} />
    </Container>
  );
}
