require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { askAI } = require("./services/llm");
const {
    storeMemory,
    recallMemories
} = require("./services/hindsight");

const { extractBugMemory } = require("./services/bugAnalyzer");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "BugFix AI backend is running"
    });
});

app.post("/api/bugs", async (req, res) => {
    try {
        const { bug } = req.body;

        if (!bug) {
            return res.status(400).json({
                error: "Bug description is required"
            });
        }

        // 1. Find similar bugs from memory
        const memories = await recallMemories(
            `Find previous bugs similar to this problem: ${bug}`
        );

        console.log("\nRelevant memories:");
        console.log(memories);

        // 2. Ask AI to investigate using those memories
        const prompt = `
            You are BugFix AI, a debugging assistant for software developers.

            The developer reported:

            ${bug}

            Previous bug memories:

            ${memories.length > 0
                ? memories.map((memory) => `- ${memory}`).join("\n")
                : "No previous related bugs were found."
            }

            Your job is to investigate the current bug using the previous bug memories.

            IMPORTANT:
            - If a previous memory is relevant, clearly mention that a similar issue was found.
            - Do not pretend a previous memory exists if there is none.
            - Do not give a generic textbook explanation.
            - Give practical debugging advice.
            - Keep the response short.
            - Do not use markdown headings.
            - Do not use numbered sections.
            - Do not write a long report.

            Format your response naturally like this:

            If relevant memory exists:

            "I found a similar issue from a previous bug. [Briefly explain what happened before and what fixed it.]

            For this bug, I'd check [most relevant things].

            [One short explanation of why.]"

            If there is no relevant memory:

            "I don't have a similar previous bug in memory yet.

            I'd start by checking [most likely causes].

            [Short explanation.]"
            `;

                const diagnosis = await askAI(prompt);

                // 3. Store this investigation in memory
                const bugMemory = await extractBugMemory(
                    bug,
                    diagnosis
                );

                console.log("\nNew bug memory:");
                console.log(bugMemory);

                if (bugMemory) {
                    await storeMemory(
                        JSON.stringify(bugMemory)
                    );
                }

                // 4. Send result back to React
                res.json({
                    reply: diagnosis,
                    memories: memories.slice(0, 5)
                });

            } catch (error) {
                console.error("Bug analysis error:", error);

                res.status(500).json({
                    error: "Bug analysis failed"
                });
            }
});

app.listen(3000, () => {
    console.log("BugFix AI backend running on http://localhost:3000");
});