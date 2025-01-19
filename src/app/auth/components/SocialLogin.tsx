import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";

import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Button } from "@/components/ui/button";

export default function SocialLogin() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const handleClick = (provider: "google") => {
    signIn(provider, { callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT });
  };

  return (
    <div className="flex w-full items-center gap-x-2">
      <Button
        variant={"outline"}
        effect={"shineHover"}
        className="h-fit w-full text-base"
        onClick={() => handleClick("google")}
      >
        <FcGoogle className="!size-6" /> Continue with Google
      </Button>
    </div>
  );
}
