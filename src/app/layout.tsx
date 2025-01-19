import { auth } from "@/auth";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Nunito_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";

import ProgressBarProviders from "@/components/ProgressBarProvider";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
});

export const metadata: Metadata = {
  title: "Creche Demo App",
  description:
    "A demo dashboard app for a dog daycare center developed by Developer Marty devmarty.com",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={`${nunitoSans.className} antialiased`}>
          <ProgressBarProviders>
            <ReactQueryProvider>
              <Toaster position="top-right" reverseOrder={false} />
              {children}
            </ReactQueryProvider>
          </ProgressBarProviders>
        </body>
      </html>
    </SessionProvider>
  );
}
