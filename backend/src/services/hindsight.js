const { HindsightClient } = require("@vectorize-io/hindsight-client");

const hindsight = new HindsightClient({
    baseUrl: process.env.HINDSIGHT_BASE_URL,
    apiKey: process.env.HINDSIGHT_API_KEY,
});

const BANK_PREFIX = process.env.HINDSIGHT_BANK_PREFIX || "bugfix";

function bankId(projectId) {
    return `${BANK_PREFIX}-${projectId}`;
}

async function ensureBank(projectId) {
    await hindsight.createBank(bankId(projectId));
}

async function storeResolution(projectId, incident, resolution) {
    await ensureBank(projectId);

    const content = [
        `Confirmed incident: ${incident.title}`,
        `Service: ${incident.service}`,
        `Environment: ${incident.environment}`,
        `Severity: ${incident.severity}`,
        `Symptoms: ${incident.symptoms}`,
        `Root cause: ${resolution.rootCause}`,
        `Verified fix: ${resolution.fix}`,
        `Outcome: ${resolution.outcome}`,
        resolution.technologies.length
            ? `Technologies: ${resolution.technologies.join(", ")}`
            : "",
    ].filter(Boolean).join("\n");

    await hindsight.retain(bankId(projectId), content, {
        context: `confirmed incident resolution for ${incident.service}`,
        documentId: `incident-${incident.id}`,
        tags: [
            "confirmed-resolution",
            `service:${incident.service.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
        ],
        timestamp: new Date().toISOString(),
    });
}

async function recallMemories(projectId, incident) {
    await ensureBank(projectId);

    const query = [
        incident.title,
        incident.service,
        incident.environment,
        incident.symptoms,
        incident.logs
    ]
        .filter(Boolean)
        .join("\n");

    const result = await hindsight.recall(bankId(projectId), query, {
        budget: "high",
        maxTokens: 1400,
        types: ["world", "experience", "observation"],
    });

    return (result.results || []).slice(0, 6).map((memory) => ({
        id: memory.id,
        text: memory.text,
        type: memory.type,
        context: memory.context,
        occurredAt: memory.occurred_start || memory.mentioned_at,
        entities: memory.entities || [],
        tags: memory.tags || [],
    }));
}

module.exports = {
    storeResolution,
    recallMemories,
    bankId
};
