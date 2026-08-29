import assert from "node:assert/strict";
import test from "node:test";

import { READING_LEVEL_ORDER, sortReadingLevels } from "./catalog.ts";

test("Reading levels preserve AA, A-Z, Z1, Z2 order", () => {
  assert.equal(READING_LEVEL_ORDER.length, 29);
  assert.deepEqual(sortReadingLevels(["z2", "b", "aa", "z1", "a", "z"]), ["aa", "a", "b", "z", "z1", "z2"]);
});
