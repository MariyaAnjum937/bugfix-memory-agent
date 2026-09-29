
# 🐛 BugFix AI

### Memory-Powered Debugging Assistant

BugFix AI is a debugging assistant that uses **Hindsight persistent memory** to remember previous bugs, their root causes, fixes, and technologies involved.

Instead of treating every bug as a completely new problem, BugFix AI can recall similar debugging incidents from the past and use that experience when investigating a new issue.

---

## 💡 Problem

Developers often encounter the same or similar bugs multiple times.

For example:

- A Node.js API returns `401 Unauthorized`
- The developer discovers a JWT configuration issue
- Weeks later, a similar deployment issue happens again
- The developer has to investigate the same problem from scratch

Most AI assistants can help solve the current bug, but they don't naturally build a persistent history of the developer's debugging experiences.

---

## 🚀 Solution

BugFix AI creates a persistent memory of debugging incidents.

For every bug investigation, the system:

1. Receives the developer's bug description.
2. Searches Hindsight for similar previous incidents.
3. Provides those memories to the AI.
4. Generates debugging guidance using the retrieved experience.
5. Extracts useful knowledge from the investigation.
6. Stores the new bug knowledge back into Hindsight.

This creates a continuous learning loop:

```text
Bug Report
    ↓
Recall Previous Bugs
    ↓
AI Diagnosis
    ↓
Extract Useful Knowledge
    ↓
Store in Hindsight
    ↓
Future Similar Bug
    ↓
Recall Previous Experience
````

---

## 🧠 Why Hindsight?

Hindsight provides the persistent memory layer for BugFix AI.

The application uses Hindsight to:

* Recall similar debugging incidents
* Remember root causes
* Remember suggested fixes
* Associate bugs with technologies
* Reuse previous debugging knowledge in future investigations

The key difference is that the assistant's knowledge can grow across separate debugging sessions.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │  Bug Investigation  │
                    │  Memory Panel       │
                    └──────────┬──────────┘
                               │
                               │ HTTP
                               ↓
                    ┌─────────────────────┐
                    │  Node.js / Express  │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ↓                             ↓
       ┌─────────────────┐          ┌─────────────────┐
       │    Hindsight    │          │      Groq       │
       │     Memory      │          │       LLM       │
       │                 │          │                 │
       │ Recall + Store  │          │ Diagnosis +     │
       │ Bug Knowledge   │          │ Memory Extract  │
       └─────────────────┘          └─────────────────┘
```

---

## 🔄 Example

### First investigation

Developer:

> My Node.js API is returning 401 after deployment. I'm using JWT authentication.

Hindsight:

```text
No relevant previous memory found.
```

BugFix AI investigates the issue and extracts knowledge such as:

```text
Bug:
API returns 401 after deployment

Root Cause:
JWT secret mismatch or missing Authorization header

Fix:
Verify production JWT configuration and Authorization header

Technologies:
Node.js, JWT
```

This knowledge is stored in Hindsight.

### Later investigation

Developer:

> After deploying my Node.js backend, I'm getting 401 Unauthorized with JWT authentication.

Hindsight recalls the previous incident.

BugFix AI can then respond using that previous debugging experience instead of starting from zero.

The UI also displays the recalled memory:

```text
🧠 Relevant Memory Found

Hindsight

API returns 401 error after deployment due to
JWT secret mismatch or missing Authorization header.

● Recalled from previous debugging session
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* CSS

### Backend

* Node.js
* Express.js
* CORS
* dotenv

### AI

* Groq
* `openai/gpt-oss-20b`

### Memory

* Hindsight
* `@vectorize-io/hindsight-client`

---

## 📁 Project Structure

```text
bugfix-memory-agent/
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── hindsight.js
│   │   │   ├── llm.js
│   │   │   └── bugAnalyzer.js
│   │   └── utils/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd bugfix-memory-agent
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create:

```text
backend/.env
```

Add:

```env
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
GROQ_API_KEY=your_groq_api_key
```

Never commit your `.env` file.

### 4. Start the backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open the Vite URL shown in the terminal.

---

## 🧪 Demo Flow

To demonstrate persistent memory:

### Test 1 — New bug

Submit:

```text
My Node.js API is returning 401 after deployment.
I'm using JWT authentication.
```

The system should have no relevant previous memory.

### Test 2 — Similar bug

Submit:

```text
After deploying my Node.js backend,
I'm getting 401 Unauthorized when using JWT authentication.
```

Hindsight should recall the previous debugging incident.

The UI will display the relevant memory and BugFix AI will use it while investigating the new bug.

---

## 🔐 Security

API keys are stored in environment variables and should never be committed to GitHub.

The repository ignores:

```text
.env
backend/.env
node_modules
frontend/node_modules
frontend/dist
```

---

## 🎯 Hackathon Focus

BugFix AI demonstrates how persistent agent memory can transform a debugging assistant from a stateless question-answering tool into an assistant that can build knowledge from previous debugging experiences.

The core idea is simple:

> **Don't solve every bug from scratch. Remember what you've already learned.**

---

## 👩‍💻 Built For

Hindsight Hackathon 2026

Built with:

* React
* Node.js
* Groq
* Hindsight

```
```
