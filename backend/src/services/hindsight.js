const { HindsightClient } = require("@vectorize-io/hindsight-client");

const hindsight = new HindsightClient({
    baseUrl: process.env.HINDSIGHT_BASE_URL,
    apiKey: process.env.HINDSIGHT_API_KEY
});

const BANK_ID = "bugfix_agent";

async function storeMemory(memory) {
    await hindsight.retain(BANK_ID, memory);
}

async function recallMemories(query) {
    const result = await hindsight.recall(BANK_ID, query);

    return result.results.map((memory) => memory.text);
}

module.exports = {
    storeMemory,
    recallMemories
};