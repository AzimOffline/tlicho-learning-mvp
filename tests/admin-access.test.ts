import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isAdminUser } from "@/lib/admin-access";

describe("legacy admin access", () => {
  const adminIds = ["user_primary", "user_backup"];

  it("permits an exact configured Clerk user ID", () => {
    assert.equal(isAdminUser("user_primary", adminIds), true);
  });

  it("denies missing and unknown users", () => {
    assert.equal(isAdminUser(null, adminIds), false);
    assert.equal(isAdminUser(undefined, adminIds), false);
    assert.equal(isAdminUser("user_other", adminIds), false);
  });
});
