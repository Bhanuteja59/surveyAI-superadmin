// Auto-switch between Production and Local
const isProd = typeof window !== "undefined" && 
  !window.location.hostname.includes("localhost") && 
  !window.location.hostname.includes("127.0.0.1");

const PROD_URL = "https://survey-ai-backend-ocjomqzge-bhanutejas-projects-585122ca.vercel.app/api/v1";
const LOCAL_URL = "http://localhost:8000/api/v1";

const BASE = process.env.REACT_APP_API_URL || (isProd ? PROD_URL : LOCAL_URL);

// ── Auth helpers ──────────────────────────────────────────────────────────
export function saveAuth(token, user) {
  localStorage.setItem("sa_token", token);
  localStorage.setItem("sa_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("sa_token");
  localStorage.removeItem("sa_user");
}

export function getToken() {
  return localStorage.getItem("sa_token");
}

export function getUser() {
  try {
    const raw = localStorage.getItem("sa_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isSuperAdmin() {
  const u = getUser();
  return u?.role === "super_admin";
}

// ── Base request ──────────────────────────────────────────────────────────
async function req(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    cache: "no-store",
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail
      ? typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)
      : `Request failed: ${res.status}`;
    throw new Error(detail);
  }
  return data;
}

// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  me: () => req("/auth/me"),
};

export const superAdminApi = {
  stats: () => req("/superadmin/stats"),

  tenants: () => req("/superadmin/tenants"),

  tenantStats: (tenantId) => req(`/superadmin/tenants/${tenantId}/stats`),

  createTenant: (data) =>
    req("/superadmin/tenants", { method: "POST", body: JSON.stringify(data) }),

  deleteTenant: (tenantId) =>
    req(`/superadmin/tenants/${tenantId}`, { method: "DELETE" }),

  toggleTenant: (tenantId) =>
    req(`/superadmin/tenants/${tenantId}/toggle`, { method: "PATCH" }),

  promote: (email) =>
    req("/superadmin/promote", { method: "POST", body: JSON.stringify({ email }) }),

  getTenantSurveys: (tenantId) => req(`/superadmin/tenants/${tenantId}/surveys`),

  deleteTenantSurvey: (tenantId, surveyId) =>
    req(`/superadmin/tenants/${tenantId}/surveys/${surveyId}`, { method: "DELETE" }),

  toggleTenantSurvey: (tenantId, surveyId) =>
    req(`/superadmin/tenants/${tenantId}/surveys/${surveyId}/toggle`, { method: "PATCH" }),
};

// ── SSE stream (returns AbortController so caller can cancel) ─────────────
export function openStream(onData, onError) {
  const ctrl = new AbortController();
  const token = getToken();

  fetch(`${BASE}/superadmin/stream`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (!res.ok) { onError(new Error("Not authorized")); return; }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6).trim();
            if (raw && raw !== "{}") {
              try { onData(JSON.parse(raw)); } catch {}
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") onError(err);
    });

  return ctrl;
}
