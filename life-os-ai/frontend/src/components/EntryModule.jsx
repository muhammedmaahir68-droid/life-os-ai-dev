import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function EntryModule({ moduleKey, eyebrow, title, placeholder }) {
  const [entries, setEntries] = useState([]);
  const [titleInput, setTitleInput] = useState("");
  const [detailsInput, setDetailsInput] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api.getEntries(moduleKey);
    setEntries(res.entries);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [moduleKey]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!titleInput.trim()) return;
    await api.createEntry({ module: moduleKey, title: titleInput, details: detailsInput });
    setTitleInput("");
    setDetailsInput("");
    load();
  }

  async function cycleStatus(entry) {
    const next = { todo: "in_progress", in_progress: "done", done: "todo" }[entry.status];
    await api.updateEntry(entry._id, { status: next });
    load();
  }

  async function remove(id) {
    await api.deleteEntry(id);
    load();
  }

  return (
    <div className="main">
      <p className="page-eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>

      <form className="entry-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder={placeholder}
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
        />
        <input
          type="text"
          placeholder="Details (optional)"
          value={detailsInput}
          onChange={(e) => setDetailsInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Add</button>
      </form>

      <div className="panel">
        {loading && <p style={{ color: "var(--text-dim)" }}>Loading...</p>}
        {!loading && entries.length === 0 && (
          <p style={{ color: "var(--text-dim)" }}>Nothing here yet — add your first item above.</p>
        )}
        <div className="entry-list">
          {entries.map((entry) => (
            <div className="entry-row" key={entry._id}>
              <div>
                <div className="entry-row-title">{entry.title}</div>
                {entry.details && <div className="entry-row-details">{entry.details}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className={`status-pill status-${entry.status}`}
                  style={{ border: "none" }}
                  onClick={() => cycleStatus(entry)}
                >
                  {entry.status.replace("_", " ")}
                </button>
                <button className="icon-btn" onClick={() => remove(entry._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
