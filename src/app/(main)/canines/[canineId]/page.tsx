import prismadb from "@/lib/prismadb";
import CanineForm from "./components/CanineForm";
import { CanineInterface } from "./canineTypes";
import Container from "@/components/Container";

type Params = Promise<{ canineId: string }>;

export default async function CaninePage({ params }: { params: Params }) {
  const { canineId } = await params;

  const canine = await prismadb.canine.findUnique({
    where: { id: canineId },
    include: { vaccinations: true, owner: true },
  });

  const subHeading = canine ? "Edit canine details" : "Create a new canine";

  return (
    <Container heading="Canines" subHeading={subHeading}>
      <CanineForm initialData={canine as CanineInterface | null} />
    </Container>
  );
}
