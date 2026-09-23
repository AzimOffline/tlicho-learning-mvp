import type { NextConfig } from "next";

const mobileConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  typescript: { tsconfigPath: "../tsconfig.json" },
};

export default mobileConfig;
