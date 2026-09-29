const { askAI } = require("./llm");

async function extractBugMemory(bug, diagnosis) {
    const prompt = `
Extract useful long-term debugging knowledge from this incident.

Bug:
${bug}

AI diagnosis:
${diagnosis}

Return ONLY valid JSON in exactly this format:

{
  "bug": "short description of the bug",
  "rootCause": "likely root cause",
  "fix": "suggested fix",
  "technologies": ["technology1", "technology2"]
}

Rules:
- Keep each value concise.
- technologies should contain only technologies explicitly mentioned.
- Do not include markdown.
- Do not add any extra text.
`;

    const result = await askAI(prompt);

    try {
        return JSON.parse(result);
    } catch (error) {
        console.error("Could not parse bug memory:", result);
        return null;
    }
}

module.exports = {
    extractBugMemory
};