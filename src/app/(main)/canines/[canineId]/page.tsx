import prismadb from "@/lib/prismadb";
import CanineForm from "./components/CanineForm";
import { CanineInterface } from "./canineTypes";
import Container from "@/components/Container";

export default async function CaninePage({
  params,
}: {
  params: { canineId: Promise<string> };
}) {
  const { canineId } = await params;

  const canine = await prismadb.canine.findUnique({
    where: { id: await canineId },
    include: { vaccinations: true, owner: true },
  });

  const subHeading = canine ? "Edit canine details" : "Create a new canine";

  return (
    <Container heading="Canines" subHeading={subHeading}>
      <CanineForm initialData={canine as CanineInterface | null} />
    </Container>
  );
}
