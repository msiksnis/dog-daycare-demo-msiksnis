"use client";

import { useSearchParams } from "next/navigation";

import MainLoader from "../../../components/MainLoader";
import CardWrapper from "../components/CardWrapper";
import { useCallback, useEffect, useState } from "react";
import { newVerificationAction } from "./actions/newVerificationAction";
import FormSuccess from "@/components/FormSuccess";
import FormError from "@/components/FormError";

export default function NewVerificationForm() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (!token) {
      setError("Token not found.");
      return;
    }

    newVerificationAction(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your email"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="pt-4">
        {!success && !error && <MainLoader />}
        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </CardWrapper>
  );
}
