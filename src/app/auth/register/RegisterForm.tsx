"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";

import { RegisterInput, registerSchema } from "./registerSchema";
import { registerAction } from "./actions/registerAction";
import CardWrapper from "../components/CardWrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FloatingInput, FloatingLabel } from "@/components/FloatingInput";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { Separator } from "@/components/ui/separator";

export default function RegisterForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const togglePasswordVisibility = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const onSubmit = (data: RegisterInput) => {
    startTransition(() => {
      registerAction(data).then((data) => {
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
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
      showSocialLogin={true}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <FloatingInput
                        {...field}
                        disabled={isPending}
                        type="name"
                      />
                      <FloatingLabel htmlFor="name">Name</FloatingLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            effect={"shineHover"}
            type="submit"
            className="w-full"
          >
            {isPending ? <Spinner className="text-white" /> : "Register"}
          </Button>
          <div className="pb- flex flex-1 items-center gap-x-2">
            <Separator className="flex-1" />
            <span className="">or</span>
            <Separator className="flex-1" />
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
}
