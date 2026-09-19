import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getClerkEnvironment,
  getDatabaseEnvironment,
  getPublicAppEnvironment,
  getStripeEnvironment,
  parseAdminIds,
} from "@/lib/env";
import { resolveDemoMode } from "@/lib/demo-mode";

describe("runtime environment validation", () => {
  it("enables the local demo when Clerk is absent or demo mode is forced", () => {
    assert.equal(resolveDemoMode(undefined, undefined), true);
    assert.equal(resolveDemoMode("true", "pk_test_configured"), true);
    assert.equal(resolveDemoMode("false", "pk_test_configured"), false);
  });

  it("normalizes the public app URL", () => {
    assert.deepEqual(
      getPublicAppEnvironment({
        NEXT_PUBLIC_APP_URL: "https://nexthop.example/",
      }),
      { appUrl: "https://nexthop.example" }
    );
  });

  it("accepts PostgreSQL connection URLs", () => {
    assert.match(
      getDatabaseEnvironment({
        DATABASE_URL: "postgresql://user:password@example.com/nexthop",
      }).databaseUrl,
      /example\.com\/nexthop/
    );
  });

  it("rejects missing values without exposing other configuration", () => {
    assert.throws(
      () => getDatabaseEnvironment({}),
      /Missing required environment variable: DATABASE_URL/
    );
  });

  it("rejects unexpected credential prefixes", () => {
    assert.throws(
      () =>
        getStripeEnvironment({
          STRIPE_API_SECRET_KEY: "not-a-secret",
          STRIPE_WEBHOOK_SECRET: "whsec_test",
        }),
      /STRIPE_API_SECRET_KEY does not have an expected prefix/
    );

    assert.throws(
      () =>
        getClerkEnvironment({
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "invalid",
          CLERK_SECRET_KEY: "sk_test",
        }),
      /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY does not have an expected prefix/
    );
  });

  it("parses a normalized admin allowlist", () => {
    assert.deepEqual(parseAdminIds(" user_one, user_two ,,user_three "), [
      "user_one",
      "user_two",
      "user_three",
    ]);
    assert.deepEqual(parseAdminIds(undefined), []);
  });
});
