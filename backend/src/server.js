require("dotenv").config();

const crypto = require("node:crypto");
const express = require("express");
const cors = require("cors");
const { askAI } = require("./services/llm");
const { recallMemories, storeResolution, bankId } = require("./services/hindsight");
const { diagnosisPrompt } = require("./utils/prompts");
const { normalizeIncident, normalizeResolution } = require("./utils/validation");

const app = express();
const pendingIncidents = new Map();
const MAX_PENDING = 200;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: "32kb" }));

function parseDiagnosis(raw) {
    try {
        const parsed = JSON.parse(raw);
        return {
            summary: parsed.summary || "Diagnosis generated",
            likelyCause: parsed.likelyCause || "More evidence is needed.",
            checks: Array.isArray(parsed.checks) ? parsed.checks.slice(0, 5) : [],
            suggestedFix: parsed.suggestedFix || "Collect more diagnostics before changing production.",
            confidence: ["low", "medium", "high"].includes(parsed.confidence) ? parsed.confidence : "low",
            memoryContribution: parsed.memoryContribution || "No memory contribution reported.",
        };
    } catch {
        throw new Error("The model returned an invalid structured diagnosis.");
    }
}

async function diagnose(incident, memories) {
    return parseDiagnosis(await askAI(diagnosisPrompt(incident, memories)));
}

app.get("/", (req, res) => res.json({ message: "BugFix Memory Agent is running" }));

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        memory: process.env.HINDSIGHT_BASE_URL ? "configured" : "missing_configuration",
        model: process.env.GROQ_API_KEY ? "configured" : "missing_configuration",
    });
});

async function analyzeIncident(req, res, next) {
    try {
        const incident = normalizeIncident(req.body);
        const id = crypto.randomUUID();
        let memories = [];
        let memoryStatus = "recalled";

        try {
            memories = await recallMemories(incident.projectId, incident);
        } catch (error) {
            memoryStatus = "unavailable";
            console.warn("Hindsight recall unavailable:", error.message);
        }

        const [baseline, memoryGuided] = await Promise.all([
            incident.memoryMode === "compare" ? diagnose(incident, []) : Promise.resolve(null),
            diagnose(incident, memories),
        ]);

        const saved = { ...incident, id, createdAt: new Date().toISOString() };
        if (pendingIncidents.size >= MAX_PENDING) {
            pendingIncidents.delete(pendingIncidents.keys().next().value);
        }
        pendingIncidents.set(id, saved);

        res.json({
            incidentId: id,
            baseline,
            memoryGuided,
            memories,
            trace: {
                bank: bankId(incident.projectId),
                recalled: memories.length,
                status: memoryStatus,
                policy: "Only developer-confirmed resolutions are retained",
            },
        });
    } catch (error) {
        next(error);
    }
}

app.post("/api/incidents/analyze", analyzeIncident);

// Backwards-compatible endpoint for the original client.
app.post("/api/bugs", (req, res, next) => {
    req.body = { ...req.body, symptoms: req.body.bug, memoryMode: "memory" };
    return analyzeIncident(req, res, next);
});

app.post("/api/incidents/:incidentId/resolve", async (req, res, next) => {
    try {
        const incident = pendingIncidents.get(req.params.incidentId);
        if (!incident) {
            const error = new Error("This incident expired or does not exist. Analyze it again first.");
            error.statusCode = 404;
            throw error;
        }

        const resolution = normalizeResolution(req.body);
        await storeResolution(incident.projectId, incident, resolution);
        pendingIncidents.delete(incident.id);

        res.status(201).json({
            learned: true,
            bank: bankId(incident.projectId),
            message: "Verified resolution retained in Hindsight for future incidents.",
        });
    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.statusCode || 500).json({
        error: error.statusCode ? error.message : "Incident analysis failed. Check the server configuration and try again.",
    });
});

const port = Number(process.env.PORT) || 3000;
if (require.main === module) {
    app.listen(port, () => console.log(`BugFix Memory Agent running on http://localhost:${port}`));
}

module.exports = { app, parseDiagnosis };
