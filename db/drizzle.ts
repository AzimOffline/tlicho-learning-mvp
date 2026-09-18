import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { getDatabaseEnvironment } from "@/lib/env";

const { databaseUrl } = getDatabaseEnvironment();
const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

export default db;
