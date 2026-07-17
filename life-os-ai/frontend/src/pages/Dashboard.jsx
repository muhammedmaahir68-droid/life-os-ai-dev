import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ career: 0, lifeos: 0, cloud: 0, done: 0 });

  useEffect(() => {
    async function loadAll() {
      const [career, lifeos, cloud] = await Promise.all([
        api.getEntries("career"),
        api.getEntries("lifeos"),
        api.getEntries("cloud"),
      ]);
      const all = [...career.entries, ...lifeos.entries, ...cloud.entries];
      setCounts({
        career: career.entries.length,
        lifeos: lifeos.entries.length,
        cloud: cloud.entries.length,
        done: all.filter((e) => e.status === "done").length,
      });
    }
    loadAll();
  }, []);

  return (
    <div className="main">
      <p className="page-eyebrow">Overview</p>
      <h1 className="page-title">Welcome back, {user?.displayName}.</h1>

      <div className="stat-grid" style={{ marginTop: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{counts.career}</div>
          <div className="stat-label">Career items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{counts.lifeos}</div>
          <div className="stat-label">Life OS items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{counts.cloud}</div>
          <div className="stat-label">Cloud items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{counts.done}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="panel">
        <p style={{ margin: 0, color: "var(--text-dim)" }}>
          Everything here is stored in your own database — nothing lives in browser storage.
          Head to the AI Assistant tab and ask it about anything you've added; it reads your
          real saved data before answering.
        </p>
      </div>
    </div>
  );
}
