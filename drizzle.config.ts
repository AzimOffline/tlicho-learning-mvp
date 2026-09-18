import "dotenv/config";
import type { Config } from "drizzle-kit";

import { getDatabaseEnvironment } from "./lib/env";

const { databaseUrl } = getDatabaseEnvironment();

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
