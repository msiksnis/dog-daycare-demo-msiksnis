"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Container from "@/components/Container";
import { FloatingInput, FloatingLabel } from "@/components/FloatingInput";
import AlertModal from "@/components/modals/AlertModal";
import { Spinner } from "@/components/Spinner";
import { FloatingLabelTextarea } from "@/components/Textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn, formatPriceToDollars } from "@/lib/utils";
import { ShopItem } from "@prisma/client";
import { useShopItemMutation } from "../../mutations/useShopItemMutation";
import { ShopItemInput, shopItemSchema } from "../../shopItemSchema";

interface CreateShopItemProps {
  initialData?: ShopItem | null;
}

export default function ShopItemForm({ initialData }: CreateShopItemProps) {
  const [openWarning, setOpenWarning] = useState(false);

  const router = useRouter();

  const form = useForm<ShopItemInput>({
    resolver: zodResolver(shopItemSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      stock: initialData?.stock ?? null,
      price: initialData
        ? formatPriceToDollars(initialData.price).toString()
        : "",
    },
  });

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["shop-items"];

  const mutation = useShopItemMutation();

  async function onSubmit(values: ShopItemInput) {
    try {
      const priceInCents = Math.round(Number(values.price) * 100);

      if (isNaN(priceInCents)) {
        throw new Error("Invalid price format");
      }

      mutation.mutate({
        ...values,
        price: priceInCents,
        isUpdate: !!initialData,
        itemId: initialData?.id,
      });
    } catch (error) {
      console.error("Invalid price format", error);
    }
  }

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
      router.push(`/shop-items`);
    },
  });

  return (
    <Container
      heading={initialData ? "Update Product" : "Create Product"}
      subHeading={
        initialData ? "Update product details" : "Create a new product"
      }
    >
      <AlertModal
        isOpen={openWarning}
        name={initialData?.title}
        onClose={() => setOpenWarning(false)}
        onConfirm={() => {
          setOpenWarning(false);
          if (initialData) {
            mutate(initialData.id);
          }
        }}
        loading={isPending}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-lg pt-10"
        >
          <div className="pb-6 text-2xl md:text-3xl">Create a new item</div>
          <div className="space-y-4">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <div>
                      <FloatingInput
                        disabled={isPending}
                        {...field}
                        value={field.value || ""}
                        className={cn({
                          "ring-1 !ring-destructive focus:ring-destructive":
                            form.formState.errors.title,
                        })}
                      />
                      <FloatingLabel
                        className={cn({
                          "peer-focus:border-destructive":
                            form.formState.errors.title,
                        })}
                      >
                        Item title
                      </FloatingLabel>
                    </div>
                  </FormControl>
                  {/* <FormMessage className="!mt-1 text-left text-xs font-normal" /> */}
                </FormItem>
              )}
            />

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div>
                      <FloatingLabelTextarea
                        disabled={isPending}
                        {...field}
                        className={cn(
                          "!mt-1 border border-border bg-card py-2 ring-0",
                          {
                            "border !border-destructive focus:ring-destructive":
                              form.formState.errors.description,
                          },
                        )}
                        label="Description"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="!mt-1 text-left text-xs font-normal" />
                </FormItem>
              )}
            />

            <FormField
              name="stock"
              control={form.control}
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <div>
                      <FloatingInput
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (/^\d*$/.test(inputValue)) {
                            field.onChange(
                              inputValue === ""
                                ? null
                                : parseInt(inputValue, 10),
                            );
                          }
                        }}
                        className={cn({
                          "ring-1 !ring-destructive focus:ring-destructive":
                            form.formState.errors.stock,
                        })}
                      />
                      <FloatingLabel
                        className={cn({
                          "peer-focus:border-destructive":
                            form.formState.errors.stock,
                        })}
                      >
                        Stock (optional, leave blank for unlimited)
                      </FloatingLabel>
                    </div>
                  </FormControl>
                  {/* <FormMessage className="!mt-1 text-left text-xs font-normal" /> */}
                </FormItem>
              )}
            />

            <FormField
              name="price"
              control={form.control}
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <div>
                      <FloatingInput
                        disabled={isPending}
                        {...field}
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (
                            inputValue === "" ||
                            /^\d*\.?\d*$/.test(inputValue)
                          ) {
                            field.onChange(inputValue);
                          }
                        }}
                        className={cn({
                          "ring-1 !ring-destructive focus:ring-destructive":
                            form.formState.errors.price,
                        })}
                      />
                      <FloatingLabel
                        className={cn({
                          "peer-focus:border-destructive":
                            form.formState.errors.price,
                        })}
                      >
                        Price
                      </FloatingLabel>
                    </div>
                  </FormControl>
                  {/* <FormMessage className="!mt-1 text-left text-xs font-normal" /> */}
                </FormItem>
              )}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-4 py-10">
            {initialData && (
              <Button
                type="button"
                disabled={mutation.isPending}
                variant={"destructive"}
                animation="scaleOnTap"
                onClick={() => setOpenWarning(true)}
                className="w-40 md:w-80"
              >
                <div className="flex items-center">
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete Item
                </div>
              </Button>
            )}
            <Button
              type="submit"
              disabled={mutation.isPending}
              effect={"shineHover"}
              animation="scaleOnTap"
              className="w-40 md:w-80"
            >
              {mutation.isPending ? (
                <Spinner />
              ) : initialData ? (
                "Update Item"
              ) : (
                "Create Item"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Container>
  );
}
