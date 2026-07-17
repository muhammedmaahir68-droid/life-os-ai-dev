import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/career", label: "Career Engine" },
  { to: "/lifeos", label: "Life OS" },
  { to: "/cloud", label: "Cloud Center" },
  { to: "/assistant", label: "AI Assistant" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">LifeOS <span>/ AI</span></div>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <span className="nav-dot" />
          {l.label}
        </NavLink>
      ))}
      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        {user && (
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>
            {user.displayName}
          </div>
        )}
        <button className="btn" onClick={logout} style={{ width: "100%" }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
