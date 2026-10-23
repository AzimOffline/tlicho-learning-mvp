import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({});

// Use Webpack for the Worker bundle; keep Turbopack for local development.
config.buildCommand = "pnpm exec next build --webpack";

export default config;
