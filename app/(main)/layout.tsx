import type { PropsWithChildren } from "react";

import { MobileHeader } from "@/components/mobile-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <MobileHeader />
      <MobileBottomNav />
      <Sidebar className="hidden lg:flex" />
      <main className="h-full pb-20 pt-16 sm:pb-24 sm:pt-20 lg:pb-0 lg:pl-[256px] lg:pt-0">
        <div className="mx-auto h-full max-w-[1056px] pt-3 sm:pt-6">
          {children}
        </div>
      </main>
    </>
  );
};

export default MainLayout;
