import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/content.js", import.meta.url), "utf8");

function numericConst(name) {
  const match = source.match(new RegExp(`const ${name} = (\\d+);`));
  assert.ok(match, `${name} must be declared as a numeric constant`);
  return Number(match[1]);
}

test("conceal lease fails open within the frozen two-second bound", () => {
  const ttl = numericConst("LEASE_TTL_MS");
  const renew = numericConst("LEASE_RENEW_MS");
  const workerProbe = numericConst("WORKER_PROBE_MS");

  assert.ok(ttl > 0 && ttl <= 2000, "conceal lease must expire within two seconds");
  assert.ok(renew > 0 && renew < ttl, "lease must renew before expiry");
  assert.ok(workerProbe > 0 && workerProbe <= 2000, "worker communication failure must be detected within two seconds");

  assert.match(source, /@keyframes acs00NativeLeaseA/);
  assert.match(source, /@keyframes acs00ProjectionLeaseA/);
  assert.match(source, /conceal-lease-expired/);
  assert.doesNotMatch(source, /nativeList\.style\.display\s*=\s*["']none["']/);
});

test("normal restore preserves the native list's prior inline style exactly", () => {
  assert.match(source, /priorStyleAttr = list\.getAttribute\("style"\)/);
  assert.match(source, /state\.nativeList\.setAttribute\("style", state\.priorStyleAttr\)/);
});


test("startup projection retry is bounded and route-epoch guarded", () => {
  const retryMs = numericConst("STARTUP_RETRY_MS");
  const retryLimit = numericConst("STARTUP_RETRY_LIMIT");

  assert.ok(retryMs >= 100 && retryMs <= 500, "startup retry interval must stay short but bounded");
  assert.ok(retryLimit > 0 && retryLimit <= 12, "startup retry count must stay bounded");
  assert.ok(retryMs * retryLimit <= 3000, "startup retry window must remain bounded");

  assert.match(source, /attempt >= STARTUP_RETRY_LIMIT/);
  assert.match(source, /expectedRoute !== location\.pathname \|\| expectedEpoch !== state\.epoch/);
  assert.match(source, /tryProject\(reason, attempt \+ 1, expectedRoute, expectedEpoch\)/);
});
