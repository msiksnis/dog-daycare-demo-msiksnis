"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import CardWrapper from "@/app/auth/components/CardWrapper";
import { resetPasswordAction } from "./actions/resetPasswordAction";
import { ResetPasswordInput, resetPasswordSchema } from "./resetPasswordSchema";
import { FloatingInput, FloatingLabel } from "@/components/FloatingInput";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

export default function ResetPasswordForm() {
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const onSubmit = (data: ResetPasswordInput) => {
    startTransition(() => {
      resetPasswordAction(data).then((data) => {
        if (data?.success) {
          setSuccess(data?.success);
          reset();
        }
        setError(data?.error);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Forgot your password?"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <FloatingInput
                        {...field}
                        disabled={isPending}
                        type="email"
                      />
                      <FloatingLabel htmlFor="email">Email</FloatingLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormSuccess message={success} />
          <FormError message={error} />
          <Button
            disabled={isPending}
            effect={"shineHover"}
            type="submit"
            className="w-full"
          >
            {isPending ? <Spinner className="text-white" /> : "Send reset link"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
