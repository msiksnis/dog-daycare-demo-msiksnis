"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FloatingLabelTextarea } from "@/components/Textarea";
import { cn } from "@/lib/utils";

import { ExtendedUser } from "../../../../../../next-auth";
import { roleChangeSchema, RoleChangeInput } from "./validationSchemas";
import { useRequestRoleChangeMutation } from "./mutations/useRequestRoleChangeMutation";
import { Spinner } from "@/components/Spinner";
import { Badge } from "@/components/ui/badge";

interface RoleChangeFormProps {
  onConfirm: () => void;
  loading: boolean;
  user: ExtendedUser;
}

export default function RoleChangeForm({
  onConfirm,
  loading,
  user,
}: RoleChangeFormProps) {
  const form = useForm<RoleChangeInput>({
    resolver: zodResolver(roleChangeSchema),
    defaultValues: {
      requestedRole: user?.role || Role.USER,
      reason: "",
    },
  });

  const { mutate, isPending } = useRequestRoleChangeMutation(["roleRequests"]);

  const onSubmit = (data: RoleChangeInput) => {
    mutate(data, {
      onSuccess: () => {
        onConfirm();
      },
      onError: (err) => {
        console.error("Failed to request role change:", err);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="border-t">
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium">Your current role is:</p>
            <Badge className="rounded-lg border-blue-chill-500 bg-blue-chill-100 px-2 text-primary hover:bg-blue-chill-100">
              {user.role}
            </Badge>
          </div>
          <FormField
            control={form.control}
            name="requestedRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">
                  Choose the role you would like to request:
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(val) => field.onChange(val as Role)}
                    className="flex flex-col space-y-2 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Role.USER} id="user" />
                      <Label htmlFor="user">User</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Role.ADMIN} id="admin" />
                      <Label htmlFor="admin">Admin</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Role.DEMO} id="demo" />
                      <Label htmlFor="demo">Demo</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem className="relative pt-2">
                <FormControl>
                  <FloatingLabelTextarea
                    {...field}
                    className={cn({
                      "ring-1 !ring-destructive focus:ring-destructive":
                        !!form.formState.errors.reason,
                    })}
                    labelClassName={cn({
                      "peer-focus:border-destructive":
                        !!form.formState.errors.reason,
                    })}
                    label="Explain why you need this role change?"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 border-t p-4 md:bg-muted">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            effect="shineHover"
            disabled={loading || isPending}
            className="min-w-40"
          >
            {isPending ? <Spinner /> : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
