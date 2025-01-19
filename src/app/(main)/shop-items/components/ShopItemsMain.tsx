"use client";

import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { PlusIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import MainLoader from "@/components/MainLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatPriceToDollars } from "@/lib/utils";
import { ShopItem } from "@prisma/client";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import ShopItemOptions from "./ShopItemOptions";
import Container from "@/components/Container";
import FormError from "@/components/FormError";

async function fetchShopItems() {
  const response = await axios.get("/api/shop-items");
  return response.data;
}

export default function ShopItemsMain() {
  const [filterText, setFilterText] = useState("");

  const router = useRouter();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["shop-items"];

  const {
    data: items,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKey,
    queryFn: fetchShopItems,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (itemId: string) => {
      await axios.delete(`/api/shop-items/${itemId}`);
    },
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey });

      const previousItems = queryClient.getQueryData<ShopItem>(queryKey);

      queryClient.setQueryData<ShopItem[]>(queryKey, (old) => {
        return old?.filter((item: ShopItem) => item.id !== itemId);
      });

      return { previousItems };
    },
    onError: (error, itemId, context) => {
      queryClient.setQueryData(queryKey, context?.previousItems);
      toast.error("Failed to delete item.");
      console.error(error);
    },
    onSuccess: () => {
      toast.success("Item deleted successfully.");
    },
  });

  const filteredItems = useMemo(() => {
    if (!filterText) return items;
    return items.filter((item: any) =>
      item.title.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [filterText, items]);

  const handleClearFilter = () => {
    setFilterText("");
  };

  return (
    <Container heading="Shop Items">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="relative max-w-60 md:min-w-60">
            <Input
              placeholder="Filter by items name"
              className={cn({ capitalize: filterText })}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              disabled={!filterText}
              className="absolute right-1 top-3 size-6 disabled:opacity-0"
              onClick={handleClearFilter}
            >
              <X className="size-4" />
            </Button>
          </div>
          <Button
            onClick={() => router.push("/shop-items/new")}
            effect={"shineHover"}
            animation="scaleOnTap"
            className="px-6"
          >
            <PlusIcon className="mr-1.5 h-4 w-4" />
            Add New
          </Button>
        </div>

        {isError ? (
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center space-y-4">
            <FormError message="Failed to fetch owners." />
            <Button size="lg" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isFetching ? (
          <MainLoader className="mt-24" />
        ) : (
          <div className="py-10">
            <span className="hidden items-center rounded-t-md border border-b-0 border-slate-300 bg-gray-200 py-1 text-lg font-semibold text-gray-700 md:flex">
              <div className="border-r border-slate-300 px-4 py-2 md:w-[30%]">
                Product
              </div>
              <div className="border-r border-slate-300 px-4 py-2 md:w-[30%]">
                Price
              </div>
              <div className="border-r border-slate-300 px-4 py-2 md:w-[30%]">
                Stock
              </div>
              <div className="px-4 py-2 text-center md:w-[10%]">Actions</div>
            </span>
            {filteredItems.length === 0 && (
              <span className="hidden items-center justify-center rounded-b-md border border-slate-300 bg-card py-4 text-center text-gray-600 md:flex">
                No items found
              </span>
            )}
            {filteredItems.map((item: any) => (
              <div
                key={item.id}
                className={cn(
                  "border border-b-0 border-slate-300 bg-white py-1 transition-colors duration-200 last:rounded-b-md last:border-b even:bg-slate-50 first-of-type:rounded-t-md hover:bg-muted first-of-type:md:rounded-none",
                  {
                    "rounded-b-md": items.length === 1,
                  },
                )}
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/shop-items/${item.id}`}
                    className="w-[45%] whitespace-nowrap border-r border-slate-200 p-4 font-medium underline-offset-2 hover:underline md:w-[30%]"
                  >
                    {item.title}
                  </Link>
                  <div className="flex w-[45%] flex-col border-r border-slate-200 md:w-[60%] md:flex-row">
                    <div className="flex w-full items-center border-slate-200 px-4 md:border-r md:py-4">
                      <p className="mr-2 md:hidden">Price:</p>
                      <p>£{formatPriceToDollars(item.price)}</p>
                    </div>
                    <div className="flex w-full items-center border-slate-200 px-4 md:border-r md:py-4">
                      <p className="mr-2 md:hidden">Stock:</p>
                      <p>{item.stock ? `${item.stock} pcs` : "Unlimited"}</p>
                    </div>
                  </div>
                  <div className="flex w-[10%] justify-center">
                    <ShopItemOptions
                      title={item.title}
                      itemId={item.id}
                      isLoading={isPending}
                      onDelete={(itemId: string) => mutate(itemId)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
