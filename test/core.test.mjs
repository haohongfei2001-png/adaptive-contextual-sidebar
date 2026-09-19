import test from "node:test";
import assert from "node:assert/strict";
await import("../src/core.js");
const { parseRoute, chooseOrdinaryCandidate, createTabRegistry, reconcileRegistration, redactPath } = globalThis.ACSCore;

test("identity comes from route, not title", () => {
  assert.equal(parseRoute("/c/abc-123").conversationId, "abc-123");
  assert.equal(parseRoute("/").conversationId, null);
  assert.equal(parseRoute("/project/p1/c/c2").kind, "project-conversation");
});

test("ordinary slot rejects protected/project surfaces", () => {
  const good = { id: "history", chatCount: 9, projectCount: 0, protectedCount: 0, inNavigation: true, depth: 8 };
  const project = { id: "project", chatCount: 12, projectCount: 1, protectedCount: 0, inNavigation: true, depth: 7 };
  const mixed = { id: "mixed", chatCount: 20, projectCount: 0, protectedCount: 1, inNavigation: true, depth: 6 };
  assert.equal(chooseOrdinaryCandidate([project, mixed, good]).id, "history");
  assert.equal(chooseOrdinaryCandidate([project, mixed]), null);
});

test("three tabs keep independent epochs and stale events are rejected", () => {
  const r = createTabRegistry();
  const a = r.register(1, "/c/a");
  const b = r.register(2, "/c/b");
  const c = r.register(3, "/c/c");
  assert.equal(a.epoch, 1); assert.equal(b.epoch, 1); assert.equal(c.epoch, 1);
  const a2 = r.update(1, "/c/a2");
  assert.equal(r.get(2).route, "/c/b");
  assert.equal(r.accept(1, a.epoch, "/c/a"), false);
  assert.equal(r.accept(1, a2.epoch, "/c/a2"), true);
});

test("diagnostic paths redact durable identifiers", () => {
  assert.equal(redactPath("/c/secret-id"), "/c/REDACTED");
});


test("service-worker restart handshake safely resets the local epoch on the same route", () => {
  const beforeRestart = createTabRegistry();
  beforeRestart.register(7, "/c/a");
  beforeRestart.update(7, "/c/b");
  const afterRestart = createTabRegistry();
  const reply = afterRestart.register(7, "/c/b");
  const reconciled = reconcileRegistration("/c/b", reply);
  assert.deepEqual(reconciled, { safe: true, epoch: 1 });
  assert.equal(reconcileRegistration("/c/other", reply).safe, false);
});