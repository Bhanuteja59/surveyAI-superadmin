export const ICONS = {
  dash: "📈", building: "🏢", file: "📋", msg: "💬", gear: "⚙️", today: "⚡", 
  user: "👥", live: "🟢", shield: "🛡️", trash: "🗑️", plus: "➕", moon: "🌙", 
  sun: "☀️", back: "←", link: "🔗"
};

export const getTheme = (isDark) => {
  return isDark ? {
     bg: "#020617", sidebar: "#0f172a", textPrimary: "#f8fafc", textSecondary: "#94a3b8",
     glassBg: "rgba(255,255,255,0.03)", glassStroke: "rgba(255,255,255,0.05)",
     cardShadow: "0 10px 30px -10px rgba(0,0,0,0.5)", inputBg: "rgba(0,0,0,0.2)",
     iconBoxBg: "rgba(255,255,255,0.05)", rowExpandBg: "rgba(0,0,0,0.2)",
     activeItem: "rgba(99, 102, 241, 0.1)", activeIcon: "#818cf8", chartGrid: "rgba(255,255,255,0.05)"
  } : {
     bg: "#f8fafc", sidebar: "#ffffff", textPrimary: "#0f172a", textSecondary: "#475569",
     glassBg: "#ffffff", glassStroke: "#e2e8f0",
     cardShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", inputBg: "#f1f5f9",
     iconBoxBg: "#f8fafc", rowExpandBg: "#f1f5f9",
     activeItem: "rgba(99, 102, 241, 0.05)", activeIcon: "#4f46e5", chartGrid: "rgba(0,0,0,0.05)"
  };
};

export const getStyles = (theme, connected, isDark, activePage, selectedTenant) => ({
  layout: { display: "flex", minHeight: "100vh", background: theme.bg, color: theme.textPrimary, fontFamily: "'Inter', sans-serif" },
  sidebar: { width: 260, background: theme.sidebar, borderRight: `1px solid ${theme.glassStroke}`, display: "flex", flexDirection: "column", transition: '0.3s' },
  logoArea: { height: 72, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: `1px solid ${theme.glassStroke}`, gap: 12 },
  brand: { fontSize: 18, fontWeight: 900, background: "linear-gradient(90deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  navItems: { flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, cursor: "pointer", background: active ? theme.activeItem : "transparent", color: active ? theme.activeIcon : theme.textSecondary, fontWeight: active ? 700 : 500, transition: "0.2s ease-in-out" }),
  userInfo: { padding: 24, borderTop: `1px solid ${theme.glassStroke}`, display: "flex", alignItems: "center", gap: 12 },
  mainArea: { flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" },
  topbar: { height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: `1px solid ${theme.glassStroke}` },
  contentArea: { flex: 1, padding: 32, overflowY: "auto", scrollBehavior: 'smooth' },
  liveBadge: { display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: connected ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: connected ? "#10b981" : "#ef4444", fontSize: 13, fontWeight: 700 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 },
  glassCard: { background: theme.glassBg, border: `1px solid ${theme.glassStroke}`, borderRadius: 16, padding: 24, boxShadow: theme.cardShadow, transition: '0.3s' },
  input: { width: "100%", padding: "12px 16px", background: theme.inputBg, border: `1px solid ${theme.glassStroke}`, borderRadius: 8, outline: "none", color: theme.textPrimary, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: "100%", padding: "12px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: '0.2s', transform: 'scale(1)' }
});
