"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import CardWrapper from "../components/CardWrapper";
import { loginAction } from "./actions/loginAction";
import { LoginInput, loginSchema } from "./loginSchema";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Please login with your email and password."
      : "";

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const togglePasswordVisibility = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const onSubmit = (data: LoginInput) => {
    startTransition(() => {
      loginAction(data, callbackUrl).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
        if (data?.success) {
          setSuccess(data?.success);
          reset();
        }
        if (data?.twoFactor) {
          setShowTwoFactor(true);
        }
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Welcome back!"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocialLogin={true}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {showTwoFactor ? (
            <FormField
              control={control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Enter the 6-digit code sent to your email
                  </FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field} disabled={isPending}>
                      <InputOTPGroup className="mx-auto flex w-full items-center justify-center">
                        <InputOTPSlot className="flex-1" index={0} />
                        <InputOTPSlot className="flex-1" index={1} />
                        <InputOTPSlot className="flex-1" index={2} />
                        <InputOTPSlot className="flex-1" index={3} />
                        <InputOTPSlot className="flex-1" index={4} />
                        <InputOTPSlot className="flex-1" index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
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
                        <FloatingLabel htmlFor="password">
                          Password
                        </FloatingLabel>
                      </div>
                    </FormControl>
                    <Button
                      asChild
                      variant={"link"}
                      effect={"hoverUnderline"}
                      className="!-mt-1 ml-1 p-0 text-sm text-muted-foreground after:w-full"
                    >
                      <Link href={"/auth/reset-password"}>
                        Forgot password?
                      </Link>
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <FormSuccess message={success} />
          <FormError message={error || urlError} />
          <Button
            disabled={isPending}
            effect={"shineHover"}
            type="submit"
            className="w-full"
          >
            {isPending ? (
              <Spinner className="text-white" />
            ) : showTwoFactor ? (
              "Confirm"
            ) : (
              "Login"
            )}
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
