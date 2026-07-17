import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CareerEngine from "./pages/CareerEngine.jsx";
import LifeOS from "./pages/LifeOS.jsx";
import CloudCenter from "./pages/CloudCenter.jsx";
import AIAssistant from "./pages/AIAssistant.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, color: "var(--text-dim)" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/career" element={<Protected><CareerEngine /></Protected>} />
      <Route path="/lifeos" element={<Protected><LifeOS /></Protected>} />
      <Route path="/cloud" element={<Protected><CloudCenter /></Protected>} />
      <Route path="/assistant" element={<Protected><AIAssistant /></Protected>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
