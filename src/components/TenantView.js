import { useEffect, useState, useCallback } from "react";
import { superAdminApi } from "../api";
import { Icon } from "../utils/icons";

export default function TenantView({ tenant: initialTenant, goBack }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(initialTenant);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getTenantSurveys(tenant.id);
      setSurveys(data);
    } catch (e) {
      alert("Failed to load surveys: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [tenant.id]);

  useEffect(() => { fetchSurveys(); }, [fetchSurveys]);

  const handleDeleteSurvey = async (survey) => {
    if (!window.confirm(`Permanently delete "${survey.title}"? This cannot be undone.`)) return;
    try {
      await superAdminApi.deleteTenantSurvey(tenant.id, survey.id);
      setSurveys(prev => prev.filter(s => s.id !== survey.id));
    } catch(e) { alert(e.message); }
  };

  const handleToggleSurvey = async (survey) => {
    try {
      const res = await superAdminApi.toggleTenantSurvey(tenant.id, survey.id);
      setSurveys(prev => prev.map(s => s.id === survey.id ? { ...s, is_active: res.is_active } : s));
    } catch(e) { alert(e.message); }
  };

  const handleToggleTenant = async () => {
    try {
      const res = await superAdminApi.toggleTenant(tenant.id);
      setTenant(prev => ({ ...prev, is_active: res.is_active }));
    } catch(e) { alert(e.message); }
  };

  const statCards = [
    { label: "Users", value: tenant.user_count, color: "--blue", icon: <Icon.Users /> },
    { label: "Surveys", value: tenant.total_surveys, color: "--accent", icon: <Icon.FileText /> },
    { label: "Responses", value: tenant.total_responses, color: "--green", icon: <Icon.Activity /> },
    { label: "Today", value: tenant.responses_today, color: "--amber", icon: <Icon.Zap /> },
  ];

  return (
    <div className="sa-page-enter">
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="sa-btn sa-btn-outline" onClick={goBack}>
          <Icon.ArrowLeft /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="sa-page-title">{tenant.name}</h1>
            <span className={`sa-badge ${tenant.is_active ? 'green' : 'red'}`}>
              {tenant.is_active ? '● Active' : '○ Suspended'}
            </span>
          </div>
          <p className="sa-page-subtitle">@{tenant.slug} · Managing all surveys and users</p>
        </div>
        <button
          className={`sa-btn ${tenant.is_active ? 'sa-btn-danger' : 'sa-btn-outline'}`}
          onClick={handleToggleTenant}
        >
          <Icon.Toggle /> {tenant.is_active ? 'Suspend Business' : 'Reactivate Business'}
        </button>
        <button className="sa-btn sa-btn-outline" onClick={fetchSurveys}>
          <Icon.RefreshCw /> Refresh
        </button>
      </div>

      {/* Stat Row */}
      <div className="sa-stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {statCards.map(c => (
          <div key={c.label} className="sa-stat-card" style={{ '--card-accent': `var(${c.color})` }}>
            <div className="sa-stat-top">
              <span className="sa-stat-label">{c.label}</span>
              <span className="sa-stat-icon" style={{ background: `var(${c.color}-soft, var(--accent-soft))`, color: `var(${c.color})` }}>{c.icon}</span>
            </div>
            <div className="sa-stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Surveys Table */}
      <div className="sa-card">
        <div className="sa-card-header">
          <div>
            <div className="sa-card-title">Surveys ({surveys.length})</div>
            <div className="sa-card-subtitle">All surveys created under this business. Click "View Form" to preview.</div>
          </div>
        </div>

        <table className="sa-table">
          <thead>
            <tr>
              <th>Survey Title</th>
              <th>Status</th>
              <th>Published</th>
              <th>Responses</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Loading surveys...</td></tr>
            ) : surveys.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="sa-empty">
                    <div className="sa-empty-icon">📋</div>
                    <div className="sa-empty-title">No surveys yet</div>
                    <div className="sa-empty-desc">This business hasn't created any surveys.</div>
                  </div>
                </td>
              </tr>
            ) : surveys.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.title}</div>
                  <a
                    href={`http://localhost:3000/s/${s.public_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="sa-badge purple"
                    style={{ marginTop: 4, display: 'inline-flex', cursor: 'pointer' }}
                  >
                    <Icon.ExternalLink /> View Form
                  </a>
                </td>
                <td>
                  <span className={`sa-badge ${s.is_active ? 'green' : 'amber'}`}>
                    {s.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <span className={`sa-badge ${s.is_published ? 'blue' : 'amber'}`}>
                    {s.is_published ? 'Live' : 'Draft'}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.response_count}</td>
                <td style={{ color: 'var(--text-2)' }}>{s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB') : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      className="sa-btn sa-btn-outline sa-btn-sm"
                      onClick={() => handleToggleSurvey(s)}
                    >
                      {s.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className="sa-btn sa-btn-danger sa-btn-sm"
                      onClick={() => handleDeleteSurvey(s)}
                    >
                      <Icon.Trash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
