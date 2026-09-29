import { useState } from "react";
import "./index.css";

function App() {
  const [bug, setBug] = useState("");
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bug.trim()) return;

    const userBug = bug;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userBug,
      },
    ]);

    setBug("");

    try {
      const response = await fetch("http://localhost:3000/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bug: userBug,
        }),
      });

      const data = await response.json();
      setMemories(data.memories || []);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: data.reply,
        },
      ]);

    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: data.reply,
          usedMemory: data.memories && data.memories.length > 0,
        },
      ]);
    }
  };

  return (
    <div className="app">

      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">🐛</span>
          <div>
            <h1>BugFix AI</h1>
            <p>Memory-powered debugging assistant</p>
          </div>
        </div>

        <div className="memory-status">
          <span className="status-dot"></span>
          Memory Active
        </div>
      </header>


      <main className="dashboard">

        {/* Chat Section */}
        <section className="chat-section">

          <div className="section-header">
            <h2>Bug Investigation</h2>
            <p>Describe your bug and let the agent investigate.</p>
          </div>


          <div className="messages">

            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔎</div>

                <h3>What are you debugging?</h3>

                <p>
                  Describe an error, unexpected behaviour,
                  or technical issue.
                </p>

                <div className="example-bug">
                  “My Node.js API is returning 401 after deployment.”
                </div>
              </div>
            )}


            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.type}`}
              >
                <div className="avatar">
                  {message.type === "user" ? "👤" : "🤖"}
                </div>

                <div className="message-content">
                  <span className="message-name">
                    {message.type === "user" ? "You" : "BugFix AI"}
                  </span>

                  <div className="message-bubble">
                    {message.text}
                  </div>

                  {message.type === "assistant" && message.usedMemory && (
                    <div className="memory-used-badge">
                      🧠 Hindsight memory used
                    </div>
                  )}
                </div>
              </div>
            ))}

          </div>


          <form className="bug-input" onSubmit={handleSubmit}>

            <textarea
              value={bug}
              onChange={(e) => setBug(e.target.value)}
              placeholder="Describe your bug..."
              rows="3"
            />

            <button type="submit">
              Investigate →
            </button>

          </form>

        </section>


        {/* Memory Section */}
        <aside className="memory-panel">

          {memories.length === 0 ? (
            <div className="memory-empty">
              <div className="memory-empty-icon">🧠</div>
              <p>No relevant memories found yet.</p>
              <span>Hindsight will remember useful debugging knowledge.</span>
            </div>
          ) : (
            memories.slice(0, 1).map((memory, index) => (
              <div className="memory-card" key={index}>
                <div className="memory-card-header">
                  <span className="memory-icon">🧠</span>

                  <div>
                    <strong>Relevant Memory Found</strong>
                    <span>Hindsight</span>
                  </div>
                </div>

                <p>{memory}</p>

                <div className="memory-source">
                  <span>●</span> Recalled from previous debugging session
                </div>
              </div>
            ))
          )}

        </aside>

      </main>

    </div>
  );
}

export default App;