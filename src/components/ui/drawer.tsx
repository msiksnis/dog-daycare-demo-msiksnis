"use client";

import { useMediaQuery } from "react-responsive";

import useDrawerStore from "@/hooks/useDrawerStore";
import { Drawer } from "vaul";

export default function VaulDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDrawerOpen, closeDrawer } = useDrawerStore();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <Drawer.Root
      open={isDrawerOpen}
      onOpenChange={closeDrawer}
      direction={isMobile ? "bottom" : "right"}
    >
      {isMobile ? (
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70" />
          <Drawer.Title className="sr-only">Drawer</Drawer.Title>
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex h-fit flex-col rounded-t-[10px] bg-card pb-10 outline-none">
            <div className="flex-1 rounded-t-[10px] bg-white p-4">
              <div className="mx-auto max-w-md">{children}</div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      ) : (
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/70" />
          <Drawer.Title className="sr-only">Drawer</Drawer.Title>
          <Drawer.Content className="fixed bottom-0 right-0 top-0 z-50 flex outline-none">
            <div className="mb-2 mr-0 mt-2 flex w-[450px] grow flex-col rounded-s-2xl bg-zinc-50 p-5">
              <div className="mx-auto max-w-md">{children}</div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      )}
    </Drawer.Root>
  );
}
