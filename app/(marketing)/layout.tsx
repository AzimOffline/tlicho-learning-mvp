import type { PropsWithChildren } from "react";

import { Footer } from "./footer";
import { Header } from "./header";

const MarketingLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-[#f6fbff] to-[#eef8fe]">
      <Header />

      <main className="flex flex-1 flex-col items-center">{children}</main>

      <Footer />
    </div>
  );
};

export default MarketingLayout;
