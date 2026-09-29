const LIMITS = {
  title: 180,
  service: 80,
  environment: 40,
  symptoms: 4000,
  logs: 8000,
  resolution: 2000,
};

const SEVERITIES = new Set(["SEV-1", "SEV-2", "SEV-3", "SEV-4"]);

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function slug(value) {
  return clean(value, 60)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "demo-workspace";
}

function normalizeIncident(body = {}) {
  const symptoms = clean(body.symptoms || body.bug, LIMITS.symptoms);
  if (symptoms.length < 12) {
    const error = new Error("Describe the incident in at least 12 characters.");
    error.statusCode = 400;
    throw error;
  }

  return {
    projectId: slug(body.projectId),
    title: clean(body.title, LIMITS.title) || symptoms.split("\n")[0].slice(0, LIMITS.title),
    service: clean(body.service, LIMITS.service) || "Unknown service",
    environment: clean(body.environment, LIMITS.environment) || "production",
    severity: SEVERITIES.has(body.severity) ? body.severity : "SEV-3",
    symptoms,
    logs: clean(body.logs, LIMITS.logs),
    memoryMode: body.memoryMode === "memory" ? "memory" : "compare",
  };
}

function normalizeResolution(body = {}) {
  const resolution = body.resolution || {};
  const rootCause = clean(resolution.rootCause, LIMITS.resolution);
  const fix = clean(resolution.fix, LIMITS.resolution);

  if (!rootCause || !fix) {
    const error = new Error("A confirmed root cause and fix are required before learning.");
    error.statusCode = 400;
    throw error;
  }

  return {
    rootCause,
    fix,
    outcome: clean(resolution.outcome, LIMITS.resolution) || "Resolved",
    technologies: Array.isArray(resolution.technologies)
      ? resolution.technologies.map((item) => clean(item, 40)).filter(Boolean).slice(0, 10)
      : [],
  };
}

module.exports = { normalizeIncident, normalizeResolution, slug };
