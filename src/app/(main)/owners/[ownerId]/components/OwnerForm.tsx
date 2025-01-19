"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import Container from "@/components/Container";
import { FloatingInput, FloatingLabel } from "@/components/FloatingInput";
import AlertModal from "@/components/modals/AlertModal";
import { Spinner } from "@/components/Spinner";
import { FloatingLabelTextarea } from "@/components/Textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Owner } from "@prisma/client";
import { useDeleteOwner } from "../../mutations/useDeleteOwnerMutation";
import { useOwnerMutation } from "../../mutations/useOwnerMutation";
import { ownerSchema } from "../../ownerSchema";
import FormWarning from "@/components/FormWarning";

interface OwnerFormProps {
  initialData: Owner | null;
}

type OwnerFormData = z.infer<typeof ownerSchema>;

export default function OwnerForm({ initialData }: OwnerFormProps) {
  const [openAlert, setOpenAlert] = useState(false);
  const [warning, setWarning] = useState<string | undefined>("");

  const params = useParams();
  const router = useRouter();

  const { mutate: mutateOwner, isPending } = useOwnerMutation();
  const { mutate: deleteOwner, isPending: isDeleting } = useDeleteOwner();

  const form = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      mobile: initialData?.mobile || "",
      workPhone: initialData?.workPhone || "",
      address: initialData?.address || "",
      emergencyContact: initialData?.emergencyContact || "",
    },
  });

  const onSubmit = (data: OwnerFormData) => {
    const cleanedData = {
      ...data,
      email: data.email || undefined,
      mobile: data.mobile || undefined,
      workPhone: data.workPhone || undefined,
      address: data.address || undefined,
      emergencyContact: data.emergencyContact || undefined,
    };

    mutateOwner({
      isUpdate: !!initialData,
      ownerId: initialData?.id,
      ...cleanedData,
    });
  };

  const title = initialData ? "Owners" : "Owners";
  const subtitle = initialData ? "Edit owner details" : "Create a new owner";
  const action = initialData ? (
    isPending ? (
      <Spinner />
    ) : (
      "Save Changes"
    )
  ) : isPending ? (
    <Spinner />
  ) : (
    "Create"
  );

  const handleDelete = () => {
    const ownerId = Array.isArray(params.ownerId)
      ? params.ownerId[0]
      : params.ownerId;

    if (!ownerId) return;

    deleteOwner(ownerId, {
      onSuccess: () => {
        router.push("/owners");
        router.refresh();
      },
    });
  };

  return (
    <Container heading={title} subHeading={subtitle}>
      <AlertModal
        isOpen={openAlert}
        name={initialData?.name}
        onClose={() => setOpenAlert(false)}
        onConfirm={handleDelete}
        loading={isPending}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-xl space-y-4 pb-20"
        >
          <div className="pb-4 text-2xl">
            {initialData ? (
              <div className="">{initialData.name}&apos;s details</div>
            ) : (
              <div className="text-3xl">Create a new owner</div>
            )}
          </div>
          <FormField
            control={form.control}
            name="name"
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
                          form.formState.errors.name,
                      })}
                    />
                    <FloatingLabel
                      className={cn({
                        "peer-focus:border-destructive":
                          form.formState.errors.name,
                      })}
                    >
                      Name
                    </FloatingLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <div>
                    <FloatingInput
                      disabled={isPending}
                      {...field}
                      className={cn({
                        "ring-1 !ring-destructive focus:ring-destructive":
                          form.formState.errors.email,
                      })}
                    />
                    <FloatingLabel>Email</FloatingLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <div>
                    <FloatingInput
                      disabled={isPending}
                      {...field}
                      className={cn({
                        "ring-1 !ring-destructive focus:ring-destructive":
                          form.formState.errors.mobile,
                      })}
                    />
                    <FloatingLabel>Mobile</FloatingLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="workPhone"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <div>
                    <FloatingInput
                      disabled={isPending}
                      {...field}
                      className={cn({
                        "ring-1 !ring-destructive focus:ring-destructive":
                          form.formState.errors.workPhone,
                      })}
                    />
                    <FloatingLabel>Work phone (optional)</FloatingLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <div>
                    <FloatingLabelTextarea
                      disabled={isPending}
                      {...field}
                      className={cn({
                        "ring-1 !ring-destructive focus:ring-destructive":
                          form.formState.errors.address,
                      })}
                      label="Address"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <div>
                    <FloatingInput
                      disabled={isPending}
                      className={cn({
                        "ring-1 !ring-destructive focus:ring-destructive":
                          form.formState.errors.emergencyContact,
                      })}
                      {...field}
                    />
                    <FloatingLabel>Emergency contact</FloatingLabel>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex w-full flex-col items-center gap-4 py-10">
            {warning && <FormWarning message={warning} />}
            <Button
              disabled={isPending}
              type="submit"
              effect={"shineHover"}
              animation="scaleOnTap"
              className="w-40 md:w-80"
            >
              {action}
            </Button>
            {initialData && (
              <>
                <Button
                  disabled={isPending}
                  variant="secondary"
                  type="button"
                  animation="scaleOnTap"
                  onClick={() =>
                    router.push(`/canines/new?owner-id=${initialData.id}`)
                  }
                  className="w-40 border border-primary bg-white md:w-80"
                >
                  Add Canine
                </Button>
                <Button
                  disabled={isPending}
                  type="button"
                  variant={"destructive"}
                  animation="scaleOnTap"
                  onClick={() => setOpenAlert(true)}
                  className="w-40 md:w-80"
                >
                  <div className="flex items-center">
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete owner
                  </div>
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </Container>
  );
}
