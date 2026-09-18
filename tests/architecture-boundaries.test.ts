import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";

import { classifyLegacyStripeWebhookEvent } from "@/lib/stripe-events";

const readProjectFile = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("legacy authentication boundaries", () => {
  const protectedPages = [
    "app/(main)/courses/page.tsx",
    "app/(main)/learn/page.tsx",
    "app/(main)/leaderboard/page.tsx",
    "app/(main)/quests/page.tsx",
    "app/(main)/shop/page.tsx",
    "app/lesson/page.tsx",
    "app/lesson/[lessonId]/page.tsx",
    "app/admin/page.tsx",
  ];

  for (const path of protectedPages) {
    it(`keeps ${path} protected by Clerk`, () => {
      assert.match(readProjectFile(path), /await auth\.protect\(\)/);
    });
  }

  const adminApiRoutes = [
    "app/api/courses/route.ts",
    "app/api/courses/[courseId]/route.ts",
    "app/api/units/route.ts",
    "app/api/units/[unitId]/route.ts",
    "app/api/lessons/route.ts",
    "app/api/lessons/[lessonId]/route.ts",
    "app/api/challenges/route.ts",
    "app/api/challenges/[challengeId]/route.ts",
    "app/api/challengeOptions/route.ts",
    "app/api/challengeOptions/[challengeOptionId]/route.ts",
  ];

  for (const path of adminApiRoutes) {
    it(`keeps ${path} behind the admin check`, () => {
      assert.match(readProjectFile(path), /getIsAdmin/);
    });
  }
});

describe("legacy Stripe webhook boundary", () => {
  it("keeps webhook signature verification in the route", () => {
    assert.match(
      readProjectFile("app/api/webhooks/stripe/route.ts"),
      /stripe\.webhooks\.constructEvent/
    );
  });

  it("classifies only the currently supported subscription events", () => {
    assert.equal(
      classifyLegacyStripeWebhookEvent("checkout.session.completed"),
      "create-subscription"
    );
    assert.equal(
      classifyLegacyStripeWebhookEvent("invoice.payment_succeeded"),
      "renew-subscription"
    );
    assert.equal(
      classifyLegacyStripeWebhookEvent("customer.subscription.deleted"),
      "ignore"
    );
  });
});
