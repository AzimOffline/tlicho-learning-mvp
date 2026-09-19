import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { isDemoMode } from "@/lib/demo-mode";
import { getDatabaseEnvironment } from "@/lib/env";

// Drizzle's client is created while Next.js discovers routes during a build.
// Demo mode never calls the database-backed routes, so use an intentionally
// unreachable URL to let those modules load without pretending a DB exists.
const databaseUrl = isDemoMode()
  ? process.env.DATABASE_URL?.trim() ||
    "postgresql://demo:demo@127.0.0.1:1/demo"
  : getDatabaseEnvironment().databaseUrl;
const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

export default db;
