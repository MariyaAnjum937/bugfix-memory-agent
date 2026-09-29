const test = require("node:test");
const assert = require("node:assert/strict");
process.env.GROQ_API_KEY ||= "test-key";
process.env.HINDSIGHT_BASE_URL ||= "http://localhost:8888";
const { normalizeIncident, normalizeResolution, slug } = require("../src/utils/validation");
const { parseDiagnosis } = require("../src/server");

test("normalizes an incident and isolates its project bank", () => {
  const incident = normalizeIncident({
    projectId: "Payments Team / Prod",
    bug: "Checkout returns 502 after the latest deployment",
    severity: "SEV-1",
  });

  assert.equal(incident.projectId, "payments-team-prod");
  assert.equal(incident.severity, "SEV-1");
  assert.equal(incident.service, "Unknown service");
});

test("rejects vague incidents", () => {
  assert.throws(() => normalizeIncident({ bug: "broken" }), /at least 12 characters/);
});

test("requires a developer-confirmed root cause and fix", () => {
  assert.throws(() => normalizeResolution({ resolution: { rootCause: "bad config" } }), /root cause and fix/);
});

test("parses a bounded diagnosis contract", () => {
  const result = parseDiagnosis(JSON.stringify({
    summary: "A stale secret is likely",
    likelyCause: "Pods still use the old secret",
    checks: ["Compare secret versions", "Restart one pod"],
    suggestedFix: "Roll the deployment",
    confidence: "high",
    memoryContribution: "A prior incident identified the same rollout pattern",
  }));

  assert.equal(result.confidence, "high");
  assert.equal(result.checks.length, 2);
  assert.equal(slug("Hello, World!"), "hello-world");
});
