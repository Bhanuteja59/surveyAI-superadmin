import { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";
import { openStream, clearAuth, authApi, FE_BASE } from "./api";
import { Icon } from "./utils/icons";
import TenantView from "./components/TenantView";
import AnalyticsPage from "./components/AnalyticsTab";
import BusinessesPage from "./components/BusinessesTab";
import SettingsPage from "./components/SettingsTab";

const NAV = [
  { id: "analytics", label: "Dashboard",   Icon: Icon.Grid },
  { id: "tenants",   label: "Businesses",  Icon: Icon.Building },
  { id: "settings",  label: "Settings",    Icon: Icon.Settings },
];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("sa_token"));
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem("sa_user")); } catch { return null; } });
  const [loginEmail, setLoginEmail] = useState("bunny@gmail.com");
  const [loginPassword, setLoginPassword] = useState("11111111");
  const [loginErr, setLoginErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr("");
    try {
      const data = await authApi.login(loginEmail, loginPassword);
      if (data.user?.role !== "super_admin") throw new Error("Access denied. Super admin account required.");
      localStorage.setItem("sa_token", data.access_token);
      localStorage.setItem("sa_user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (e) { setLoginErr(e.message); }
  };

  const handleLogout = () => {
    localStorage.removeItem("sa_token");
    localStorage.removeItem("sa_user");
    setToken(null); setUser(null);
  };

  if (!token || !user) return <LoginPage email={loginEmail} setEmail={setLoginEmail} password={loginPassword} setPassword={setLoginPassword} onSubmit={handleLogin} error={loginErr} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}

function LoginPage({ email, setEmail, password, setPassword, onSubmit, error }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 14, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛡️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>Super Admin</h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Sign in to manage the platform</p>
        </div>
        <div className="sa-card">
          <form onSubmit={onSubmit} className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="sa-form-group">
              <label className="sa-label">Email</label>
              <input className="sa-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="sa-form-group">
              <label className="sa-label">Password</label>
              <input className="sa-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="sa-alert error">{error}</div>}
            <button className="sa-btn sa-btn-primary sa-btn-full" type="submit" style={{ padding: '11px', fontSize: 14, marginTop: 4 }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [isDark, setIsDark] = useState(false);
  const [page, setPage] = useState("analytics");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [clock, setClock] = useState("");
  const ctrlRef = useRef(null);

  // Apply dark/light theme via attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // SSE connection
  const connect = useCallback(() => {
    if (ctrlRef.current) ctrlRef.current.abort();
    setConnected(false);
    ctrlRef.current = openStream(
      (parsed) => {
        setData(parsed);
        setConnected(true);
        // Keep selectedTenant in sync with live data
        setSelectedTenant(prev => {
          if (!prev) return prev;
          const updated = parsed.tenants?.find(t => t.id === prev.id);
          return updated ?? prev;
        });
      },
      () => { setConnected(false); setTimeout(connect, 5000); }
    );
  }, []);

  useEffect(() => {
    connect();
    return () => ctrlRef.current?.abort();
  }, [connect]);

  const navigate = (id) => { setPage(id); setSelectedTenant(null); };

  const tenants = data?.tenants ?? [];
  const chartData = data?.chart_data ?? [];
  const activity = data?.recent_activity ?? [];

  const breadcrumb = selectedTenant
    ? ["Businesses", selectedTenant.name]
    : [NAV.find(n => n.id === page)?.label ?? "Dashboard"];

  return (
    <div className="sa-shell">
      {/* ── Sidebar ── */}
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <div className="sa-logo-icon">🛡️</div>
          <span className="sa-logo-text">SurveyAI</span>
          <span className="sa-logo-badge">ADMIN</span>
        </div>

        <nav className="sa-nav">
          <div className="sa-nav-section-label">Main</div>
          {NAV.map(n => (
            <div
              key={n.id}
              className={`sa-nav-item ${page === n.id && !selectedTenant ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              <span className="sa-nav-icon"><n.Icon /></span>
              {n.label}
              {n.id === "tenants" && tenants.length > 0 && (
                <span className="sa-nav-badge">{tenants.length}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          <div className="sa-user-card">
            <div className="sa-avatar">{user.email[0].toUpperCase()}</div>
            <div className="sa-user-info">
              <div className="sa-user-email">{user.email}</div>
              <div className="sa-user-role">Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Top Bar ── */}
      <header className="sa-topbar">
        <div className="sa-breadcrumb">
          <span className="sa-breadcrumb-root">SurveyAI</span>
          {breadcrumb.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sa-breadcrumb-sep"><Icon.ChevronRight /></span>
              <span className={i === breadcrumb.length - 1 ? "sa-breadcrumb-current" : "sa-breadcrumb-root"}>{crumb}</span>
            </span>
          ))}
        </div>

        <div className="sa-topbar-right">
          <span className="sa-clock">{clock}</span>
          <div className={`sa-live-badge ${connected ? "" : "offline"}`}>
            <div className={`sa-live-dot ${connected ? "connected" : ""}`} />
            {connected ? "Live" : "Offline"}
          </div>
          <button className="sa-icon-btn" onClick={() => setIsDark(d => !d)} title="Toggle theme">
            {isDark ? <Icon.Sun /> : <Icon.Moon />}
          </button>
          <button className="sa-logout-btn" onClick={() => { ctrlRef.current?.abort(); clearAuth(); onLogout(); }}>
            Log Out
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="sa-main">
        {selectedTenant ? (
          <TenantView tenant={selectedTenant} goBack={() => setSelectedTenant(null)} />
        ) : page === "analytics" ? (
          <AnalyticsPage data={data} chartData={chartData} activity={activity} tenants={tenants} isDark={isDark} />
        ) : page === "tenants" ? (
          <BusinessesPage tenants={tenants} onSelectTenant={setSelectedTenant} onRefresh={connect} />
        ) : (
          <SettingsPage />
        )}
      </main>
    </div>
  );
}
