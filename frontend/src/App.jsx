import { useEffect, useState } from "react";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DEMOS = [
  {
    label: "JWT rollout",
    title: "Checkout API returns 401 after deploy",
    service: "checkout-api",
    severity: "SEV-2",
    symptoms: "Every authenticated checkout request returns 401 in production after today's deployment. Staging is healthy and public endpoints still work.",
    logs: "JWT verification failed: invalid signature\nsecret version: payments-jwt-v4\ndeployment: checkout-api-7f9d8b",
  },
  {
    label: "Database pool",
    title: "Orders time out during traffic spikes",
    service: "orders-worker",
    severity: "SEV-1",
    symptoms: "Order processing latency jumps above 30 seconds whenever traffic exceeds 400 requests per minute. Restarting workers helps for about ten minutes.",
    logs: "TimeoutError: acquire connection timed out\npool active=20 idle=0 waiting=87",
  },
];

const EMPTY_FORM = {
  projectId: "payments-platform",
  title: "",
  service: "",
  environment: "production",
  severity: "SEV-2",
  symptoms: "",
  logs: "",
  memoryMode: "compare",
};

function DiagnosisCard({ title, badge, diagnosis, featured }) {
  if (!diagnosis) return null;
  return (
    <article className={`diagnosis-card ${featured ? "featured" : ""}`}>
      <div className="card-kicker"><span>{badge}</span>{title}</div>
      <div className="confidence"><i className={diagnosis.confidence} /> {diagnosis.confidence} confidence</div>
      <h3>{diagnosis.summary}</h3>
      <div className="diagnosis-block">
        <span>Likely cause</span>
        <p>{diagnosis.likelyCause}</p>
      </div>
      <div className="diagnosis-block">
        <span>Verification path</span>
        <ol>{diagnosis.checks.map((check) => <li key={check}>{check}</li>)}</ol>
      </div>
      <div className="suggested-fix"><strong>Suggested move</strong>{diagnosis.suggestedFix}</div>
      {featured && <p className="memory-impact">{diagnosis.memoryContribution}</p>}
    </article>
  );
}

function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResolution, setShowResolution] = useState(false);
  const [resolution, setResolution] = useState({ rootCause: "", fix: "", outcome: "Resolved and monitored" });
  const [learned, setLearned] = useState("");
  const [health, setHealth] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/health`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setHealth(data.memory === "configured" && data.model === "configured" ? "ready" : "needs-config"))
      .catch(() => setHealth("offline"));
    return () => controller.abort();
  }, []);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const loadDemo = (demo) => {
    setForm((current) => ({ ...current, ...demo }));
    setResult(null);
    setLearned("");
  };

  const analyze = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setLearned("");
    try {
      const response = await fetch(`${API_URL}/api/incidents/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (requestError) {
      setError(requestError.message || "Could not reach the analysis service.");
    } finally {
      setLoading(false);
    }
  };

  const confirmResolution = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/incidents/${result.incidentId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save resolution");
      setLearned(data.message);
      setShowResolution(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="BugFix home"><span>BF</span><strong>BugFix</strong></a>
        <div className={`topbar-meta ${health}`}><span className="live-dot" />{health === "ready" ? "Hindsight connected" : health === "checking" ? "Checking memory" : health === "needs-config" ? "Configuration needed" : "Backend offline"} <b>•</b> Incident intelligence</div>
        <a className="github-link" href="https://github.com/MariyaAnjum937/bugfix-memory-agent" target="_blank" rel="noreferrer">View source ↗</a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow"><span>NEW</span> Evidence-backed debugging memory</div>
          <h1>Your last outage should make<br />the next one <em>shorter.</em></h1>
          <p>BugFix recalls how your team resolved similar incidents, shows exactly what memory changed, and only learns fixes a developer confirms.</p>
          <div className="value-strip">
            <div><strong>01</strong><span>Recall verified incidents</span></div>
            <div><strong>02</strong><span>Compare with no-memory AI</span></div>
            <div><strong>03</strong><span>Confirm the real resolution</span></div>
          </div>
        </section>

        <section className="workspace">
          <div className="workspace-heading">
            <div><span className="section-number">01</span><h2>Open an investigation</h2></div>
            <p>Paste the signal you have. BugFix will search only this project&apos;s memory bank.</p>
          </div>

          <div className="demo-row"><span>Try a scenario</span>{DEMOS.map((demo) => <button type="button" key={demo.label} onClick={() => loadDemo(demo)}>{demo.label} →</button>)}</div>

          <form className="incident-form" onSubmit={analyze}>
            <div className="form-grid four">
              <label>Memory bank<input value={form.projectId} onChange={update("projectId")} placeholder="payments-platform" /></label>
              <label>Service<input value={form.service} onChange={update("service")} placeholder="checkout-api" /></label>
              <label>Environment<select value={form.environment} onChange={update("environment")}><option>production</option><option>staging</option><option>development</option></select></label>
              <label>Severity<select value={form.severity} onChange={update("severity")}><option>SEV-1</option><option>SEV-2</option><option>SEV-3</option><option>SEV-4</option></select></label>
            </div>
            <label>Incident title<input value={form.title} onChange={update("title")} placeholder="Checkout API returns 401 after deploy" /></label>
            <div className="form-grid two">
              <label>What is happening?<textarea required minLength="12" value={form.symptoms} onChange={update("symptoms")} placeholder="Describe the impact, what changed, and what is still healthy…" /></label>
              <label>Logs or error output <span>optional</span><textarea className="code-input" value={form.logs} onChange={update("logs")} placeholder="Paste the smallest useful log sample…" /></label>
            </div>
            <div className="form-footer">
              <label className="compare-toggle"><input type="checkbox" checked={form.memoryMode === "compare"} onChange={(event) => setForm((current) => ({ ...current, memoryMode: event.target.checked ? "compare" : "memory" }))} /><span /><div><strong>Before / after mode</strong><small>Generate a baseline and memory-guided diagnosis</small></div></label>
              <button className="primary-button" disabled={loading}>{loading ? <><i className="spinner" /> Investigating…</> : "Investigate incident →"}</button>
            </div>
          </form>
          {error && <div className="error-banner" role="alert">{error}</div>}
        </section>

        {result && (
          <section className="results">
            <div className="workspace-heading">
              <div><span className="section-number">02</span><h2>See memory change the answer</h2></div>
              <div className={`trace-pill ${result.trace.status}`}><span />{result.trace.recalled} memories recalled · {result.trace.bank}</div>
            </div>
            <div className={`diagnosis-grid ${result.baseline ? "" : "single"}`}>
              <DiagnosisCard title="Stateless diagnosis" badge="WITHOUT MEMORY" diagnosis={result.baseline} />
              <DiagnosisCard title="Team-aware diagnosis" badge="WITH HINDSIGHT" diagnosis={result.memoryGuided} featured />
            </div>

            <div className="memory-ledger">
              <div className="ledger-title"><div><span className="section-number">03</span><h2>Memory evidence</h2></div><p>{result.trace.policy}</p></div>
              {result.memories.length ? (
                <div className="memory-list">{result.memories.map((memory, index) => <article key={memory.id || index}><span className="memory-index">{String(index + 1).padStart(2, "0")}</span><div><div className="memory-tags"><b>{memory.type || "fact"}</b>{memory.context && <span>{memory.context}</span>}</div><p>{memory.text}</p></div></article>)}</div>
              ) : <div className="no-memory"><strong>This bank has no matching incident yet.</strong><span>Resolve this one below; the next similar outage gets the advantage.</span></div>}
            </div>

            <div className="learning-loop">
              <div><span className="section-number">04</span><div><h2>Close the learning loop</h2><p>Do not teach the system a guess. Retain the resolution only after an engineer verifies it.</p></div></div>
              {learned ? <div className="success-message"><span>✓</span>{learned}</div> : <button className="outline-button" onClick={() => setShowResolution((value) => !value)}>Confirm resolution →</button>}
            </div>

            {showResolution && <form className="resolution-form" onSubmit={confirmResolution}>
              <label>Confirmed root cause<textarea required value={resolution.rootCause} onChange={(event) => setResolution({ ...resolution, rootCause: event.target.value })} placeholder="What evidence proved the cause?" /></label>
              <label>Verified fix<textarea required value={resolution.fix} onChange={(event) => setResolution({ ...resolution, fix: event.target.value })} placeholder="What change restored the service?" /></label>
              <label>Outcome<input value={resolution.outcome} onChange={(event) => setResolution({ ...resolution, outcome: event.target.value })} /></label>
              <button className="primary-button">Retain verified resolution</button>
            </form>}
          </section>
        )}
      </main>

      <footer><span>BugFix × Hindsight</span><p>Institutional debugging knowledge that compounds.</p></footer>
    </div>
  );
}

export default App;
