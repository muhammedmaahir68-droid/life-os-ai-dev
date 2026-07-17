import { api } from "../api/client.js";

export default function Login() {
  return (
    <div className="login-screen">
      <div className="brand" style={{ fontSize: 15 }}>LifeOS <span>/ AI</span></div>
      <h1>Your personal control panel.</h1>
      <p>
        Career, life tasks, and cloud resources in one place — with an AI agent that
        actually knows what you've saved. Sign in with GitHub, no password required.
      </p>
      <a href={api.loginUrl} className="btn btn-primary" style={{ padding: "12px 26px", fontSize: 15 }}>
        Sign in with GitHub
      </a>
    </div>
  );
}
