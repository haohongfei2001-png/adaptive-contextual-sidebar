import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));

test("manifest is MV3 and narrowly scoped", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.host_permissions, ["https://chatgpt.com/*"]);
  const perms = new Set(manifest.permissions || []);
  for (const forbidden of ["cookies", "history", "debugger", "webRequest", "scripting", "nativeMessaging"]) {
    assert.equal(perms.has(forbidden), false, forbidden + " must not be requested in ACS-00");
  }
});

test("ACS-00 does not ship later-round surfaces", () => {
  const text = JSON.stringify(manifest).toLowerCase();
  assert.equal(text.includes("side_panel"), false);
});