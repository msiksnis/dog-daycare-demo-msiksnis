"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function ProgressBarProviders({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <ProgressBar
        height="2px"
        color="#5faab1"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
