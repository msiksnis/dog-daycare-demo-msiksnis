"use client";

import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FloatingInput, FloatingLabel } from "@/components/FloatingInput";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { ExtendedUser } from "../../../../../next-auth";
import { profileAction } from "./actions/profileAction";
import { ProfileInput, profileSchema } from "./profileSchema";
import RoleChange from "./requestRole/RoleChange";

export default function UpdateProfileForm({ user }: { user: ExtendedUser }) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { update } = useSession();
  const [isPending, setTransition] = useTransition();

  const isDemoUser = user?.role === Role.DEMO;

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      password: undefined,
      newPassword: undefined,
      role: user?.role || Role.USER,
      isTwoFactorEnabled: user?.isTwoFactorEnabled,
    },
  });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleNewPasswordVisibility = () => setShowNewPassword((prev) => !prev);

  const onSubmit = async (data: ProfileInput) => {
    setError(undefined);
    setSuccess(undefined);

    setTransition(() => {
      profileAction(data).then((data) => {
        if (data.success) {
          update();
          setSuccess(data.success);
        }
        if (data.error) {
          setError(data.error);
        }
      });
    });
  };

  return (
    <Card className="w-full min-w-96 max-w-[600px]">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">
          Update user profile
        </p>
        {isDemoUser && (
          <p className="text-center text-muted-foreground">
            Not available in demo mode
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="updateProfileForm" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <FloatingInput
                          {...field}
                          type="text"
                          disabled={isPending}
                          className="w-full rounded-md border p-2"
                        />
                        <FloatingLabel htmlFor="name">Name</FloatingLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user?.isOAuth === false && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <FloatingInput
                              {...field}
                              type="email"
                              disabled={isPending}
                              className="w-full rounded-md border p-2"
                            />
                            <FloatingLabel htmlFor="email">Email</FloatingLabel>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <FloatingInput
                              {...field}
                              type={showPassword ? "text" : "password"}
                              value={field.value || ""}
                              disabled={isPending}
                              placeholder=" "
                              className="peer w-full rounded-md border p-2"
                            />
                            <FloatingLabel htmlFor="password">
                              Password
                            </FloatingLabel>
                            <button
                              type="button"
                              className="absolute inset-y-0.5 right-0.5 flex items-center rounded-e-md bg-card px-3 text-sm text-gray-500"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <FloatingInput
                              {...field}
                              type={showNewPassword ? "text" : "password"}
                              placeholder=" "
                              value={field.value || ""}
                              disabled={isPending}
                              className="peer w-full rounded-md border p-2"
                            />
                            <FloatingLabel htmlFor="newPassword">
                              New Password
                            </FloatingLabel>
                            <button
                              type="button"
                              className="absolute inset-y-0.5 right-0.5 flex items-center rounded-e-md bg-card px-3 text-sm text-gray-500"
                              onClick={toggleNewPasswordVisibility}
                            >
                              {showNewPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {user?.isOAuth === false && (
                <FormField
                  control={form.control}
                  name="isTwoFactorEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start space-y-2 overflow-hidden rounded-lg border shadow-sm">
                      <div className="p-2">
                        <FormLabel className="text-base">
                          Two Factor Authentication
                        </FormLabel>
                      </div>
                      <div className="flex w-full justify-between border-t bg-[#FBFAFB] px-2 py-4">
                        <FormDescription className="text-sm">
                          Enable two factor authentication
                        </FormDescription>
                        <FormControl>
                          <Switch
                            disabled={isPending}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </form>
        </Form>
        <div className="mt-4 space-y-6">
          <RoleChange user={user} />
          <FormError message={error} />
          <FormSuccess message={success} />
          <div className="pt-4">
            <Button
              form="updateProfileForm"
              effect={"shineHover"}
              type="submit"
              disabled={isPending || isDemoUser}
              className="w-full"
            >
              {isPending ? <Spinner /> : "Update"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
