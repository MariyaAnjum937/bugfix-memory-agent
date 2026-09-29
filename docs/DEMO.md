# 90-second demo: the outage that teaches the next outage

## Setup

1. Seed one confirmed JWT incident by analyzing and resolving it once.
2. Start a new investigation using the **JWT rollout** scenario.
3. Keep **Before / after mode** enabled.

## Story

**0:00–0:15 — The cost of forgetting**

“A production incident is already expensive. Re-solving the same incident six weeks later is worse. Most AI debuggers know the internet; they do not know what fixed *your* system.”

**0:15–0:35 — Open the incident**

Click **JWT rollout**. Point out the project-scoped memory bank, service, environment, symptoms, and real-looking logs. Click **Investigate incident**.

**0:35–1:00 — Make memory visible**

Compare the two diagnosis cards. The left side is a stateless baseline. The right side is grounded in Hindsight recall. Show the memory contribution and the exact recalled evidence underneath. Emphasize that recalled text is treated as evidence, never as executable instruction.

**1:00–1:20 — Close the loop**

Click **Confirm resolution**. Enter the root cause proved by the team and the fix that restored service. Retain it. Explain that BugFix does not learn the model's first guess—it learns the developer-verified outcome.

**1:20–1:30 — Takeaway**

“Every resolved incident becomes institutional knowledge. The next on-call engineer starts with the team's experience instead of a blank chat.”

## Strong before/after seed

- Root cause: Production pods still referenced `payments-jwt-v3` while the issuer rotated to `payments-jwt-v4`.
- Verified fix: Updated the Kubernetes secret reference and rolled the checkout deployment; 401 rate returned to baseline.
- Outcome: Resolved in 11 minutes and monitored for 30 minutes.
