"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";

import CardWrapper from "../components/CardWrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FloatingInput, FloatingLabel } from "@/components/FloatingInput";
import FormSuccess from "@/components/FormSuccess";
import FormError from "@/components/FormError";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { NewPasswordInput, newPasswordSchema } from "./newPasswordSchema";
import { newPasswordAction } from "./actions/newPasswordAction";

export default function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const togglePasswordVisibility = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const onSubmit = (data: NewPasswordInput) => {
    startTransition(() => {
      newPasswordAction(data, token).then((data) => {
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
      headerLabel="Enter new password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <FloatingInput
                      {...field}
                      disabled={isPending}
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0.5 right-0.5 flex items-center rounded-e-md bg-card px-3 text-sm text-gray-500"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                    <FloatingLabel htmlFor="password">Password</FloatingLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSuccess message={success} />
          <FormError message={error} />
          <Button
            disabled={isPending}
            effect={"shineHover"}
            type="submit"
            className="w-full"
          >
            {isPending ? <Spinner className="text-white" /> : "Reset password"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
