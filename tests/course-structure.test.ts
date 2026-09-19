import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildBalancedLessonGroups,
  classifyTlichoUnit,
} from "@/lib/tlicho-course-structure";

describe("Tłı̨chǫ course structure", () => {
  it("balances lesson sizes instead of leaving one-activity lessons", () => {
    for (const entryCount of [11, 31, 14, 13, 11, 20]) {
      const entries = Array.from({ length: entryCount }, (_, index) => index);
      const groups = buildBalancedLessonGroups(entries, []);
      const sizes = groups.map((group) => group.items.length);

      assert.equal(
        sizes.reduce((total, size) => total + size, 0),
        entryCount
      );
      assert.ok(sizes.every((size) => size >= 4 && size <= 6));
    }
  });

  it("keeps topic-based unit classification", () => {
    assert.equal(classifyTlichoUnit("Family - People"), 0);
    assert.equal(classifyTlichoUnit("Food and Eating"), 1);
    assert.equal(classifyTlichoUnit("Sky and Weather"), 4);
    assert.equal(classifyTlichoUnit(null), 5);
  });
});
