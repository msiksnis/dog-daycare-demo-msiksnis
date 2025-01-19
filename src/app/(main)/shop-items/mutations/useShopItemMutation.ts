import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { createShopItemAction } from "../actions/createShopItemAction";
import { updateShopItemAction } from "../actions/updateShopItemAction";
import { ShopItem } from "@prisma/client";
import { useRouter } from "next/navigation";

export function useShopItemMutation() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["shop-items"];

  const mutation = useMutation({
    mutationFn: async ({
      isUpdate,
      ...itemData
    }: {
      isUpdate: boolean;
      itemId?: string;
      title: string;
      description?: string;
      price: number;
      stock?: number | null;
    }) => {
      const formattedPrice = Math.round(itemData.price);

      if (isUpdate && itemData.itemId) {
        return updateShopItemAction(itemData.itemId, {
          ...itemData,
          price: formattedPrice.toString(),
        });
      } else {
        return createShopItemAction({
          ...itemData,
          price: formattedPrice.toString(),
        });
      }
    },
    onMutate: async (newItemData) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      const previousItems = queryClient.getQueryData([queryKey]);

      // Optimistically updates the cache
      queryClient.setQueryData<ShopItem[]>(queryKey, (old) => {
        if (!old) return [];

        // If the item is being updated, finds the item in the cache and updates it
        if (newItemData.isUpdate) {
          return old.map((item) =>
            item.id === newItemData.itemId
              ? { ...item, ...newItemData, isUpdate: undefined }
              : item,
          );
        } else {
          // Adds the newly created item to the cache
          const newItem: ShopItem = {
            id: uuidv4(), // Generates a temporary ID for the new item
            title: newItemData.title,
            description: newItemData.description || null,
            stock: newItemData.stock || null,
            price: newItemData.price,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [...old, newItem];
        }
      });

      return { previousItems };
    },
    onSuccess: async (newItem, variables) => {
      if (!variables.isUpdate) {
        queryClient.setQueryData([queryKey], (oldItems: ShopItem[] = []) => {
          return oldItems.map((item) =>
            item.id === variables.itemId ? { ...item, id: newItem.id } : item,
          );
        });
      }

      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(
        `Item ${variables.isUpdate ? "updated" : "created"} successfully`,
      );
      router.push(`/shop-items`);
    },
    onError: (error, newItemData, context) => {
      queryClient.setQueryData([queryKey], context?.previousItems);
      toast.error(
        `Failed to ${newItemData.isUpdate ? "update" : "create"} item. Please try again.`,
      );
    },
  });

  return mutation;
}
