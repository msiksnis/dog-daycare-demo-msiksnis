import prismadb from "@/lib/prismadb";

import OwnerForm from "./components/OwnerForm";

type Params = Promise<{ ownerId: string }>;

export default async function OwnerPage(props: { params: Params }) {
  const { ownerId } = await props.params;

  const owner = await prismadb.owner.findUnique({
    where: { id: ownerId },
  });

  return <OwnerForm initialData={owner} />;
}
