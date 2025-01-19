import { ShopItem } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import ShopItemForm from "./components/ShopItemForm";

interface ShopItemPageProps {
  params: Promise<{ itemId: string }>;
}

export default async function ShopItemPage({ params }: ShopItemPageProps) {
  const { itemId } = await params;

  const shopItem: ShopItem | null = await prismadb.shopItem.findUnique({
    where: {
      id: itemId,
    },
  });

  return <ShopItemForm initialData={shopItem} />;
}
