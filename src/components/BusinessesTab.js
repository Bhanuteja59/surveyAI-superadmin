import { useState } from "react";
import { superAdminApi } from "../api";
import { Icon } from "../utils/icons";

export default function BusinessesPage({ tenants, onSelectTenant, onRefresh }) {
  const [newTenant, setNewTenant] = useState({ name: "", slug: "" });
  const [msg, setMsg] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const maxResp = Math.max(1, ...tenants.map(t => t.total_responses || 0));

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await superAdminApi.createTenant(newTenant);
      setMsg({ ok: true, text: `"${newTenant.name}" created successfully.` });
      setNewTenant({ name: "", slug: "" });
      setShowForm(false);
      onRefresh?.();
    } catch(e) { setMsg({ ok: false, text: e.message }); }
    finally { setCreating(false); }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete "${t.name}"? This will remove all their data permanently.`)) return;
    try {
      await superAdminApi.deleteTenant(t.id);
      onRefresh?.();
    } catch(e) { alert(e.message); }
  };

  const handleToggle = async (t) => {
    try {
      await superAdminApi.toggleTenant(t.id);
      onRefresh?.();
    } catch(e) { alert(e.message); }
  };

  return (
    <div className="sa-page-enter">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-page-title">Businesses</h1>
          <p className="sa-page-subtitle">{tenants.length} registered business{tenants.length !== 1 ? 'es' : ''}. Click a row to inspect its surveys.</p>
        </div>
        <button className="sa-btn sa-btn-primary" onClick={() => setShowForm(v => !v)}>
          <Icon.Plus /> {showForm ? 'Cancel' : 'Add Business'}
        </button>
      </div>

      {showForm && (
        <div className="sa-card sa-page-enter" style={{ marginBottom: 20, maxWidth: 520 }}>
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">Register New Business</div>
              <div className="sa-card-subtitle">Create a new tenant on the platform.</div>
            </div>
          </div>
          <form onSubmit={handleCreate} className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="sa-form-group">
              <label className="sa-label">Business Name</label>
              <input className="sa-input" type="text" required placeholder="e.g. Acme Corp" value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })} />
            </div>
            <div className="sa-form-group">
              <label className="sa-label">URL Slug <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(unique short name)</span></label>
              <input className="sa-input" type="text" required placeholder="e.g. acme" value={newTenant.slug} onChange={e => setNewTenant({ ...newTenant, slug: e.target.value })} />
            </div>
            <button className="sa-btn sa-btn-primary sa-btn-full" type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create Business'}
            </button>
            {msg && <div className={`sa-alert ${msg.ok ? 'success' : 'error'}`}>{msg.text}</div>}
          </form>
        </div>
      )}

      <div className="sa-card">
        {tenants.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">🏢</div>
            <div className="sa-empty-title">No businesses yet</div>
            <div className="sa-empty-desc">Click "Add Business" to register your first tenant on the platform.</div>
          </div>
        ) : tenants.map(t => (
          <div key={t.id} className="sa-tenant-row">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.is_active ? 'var(--green)' : 'var(--text-3)', flexShrink: 0 }} />
            
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectTenant(t)}>
              <div className="sa-tenant-name">{t.name}</div>
              <div className="sa-tenant-slug">@{t.slug}</div>
              <div style={{ marginTop: 8 }}>
                <div className="sa-progress" style={{ width: 240 }}>
                  <div className="sa-progress-fill" style={{ width: `${Math.max(2, (t.total_responses / maxResp) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="sa-tenant-stats">
              <div className="sa-tenant-stat">
                <div className="sa-tenant-stat-val">{t.user_count}</div>
                <div className="sa-tenant-stat-key">Users</div>
              </div>
              <div className="sa-tenant-stat">
                <div className="sa-tenant-stat-val">{t.total_surveys}</div>
                <div className="sa-tenant-stat-key">Surveys</div>
              </div>
              <div className="sa-tenant-stat" style={{ color: 'var(--accent)' }}>
                <div className="sa-tenant-stat-val" style={{ color: 'var(--accent)' }}>{t.total_responses}</div>
                <div className="sa-tenant-stat-key">Responses</div>
              </div>
              <div className="sa-tenant-stat">
                <div className="sa-tenant-stat-val" style={{ color: 'var(--amber)' }}>{t.responses_today}</div>
                <div className="sa-tenant-stat-key">Today</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <span className={`sa-badge ${t.is_active ? 'green' : 'red'}`}>{t.is_active ? 'Active' : 'Suspended'}</span>
              <button className="sa-btn sa-btn-outline sa-btn-sm" onClick={(e) => { e.stopPropagation(); handleToggle(t); }}>
                {t.is_active ? 'Suspend' : 'Reactivate'}
              </button>
              <button className="sa-btn sa-btn-danger sa-btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(t); }}>
                <Icon.Trash />
              </button>
            </div>

            <div className="sa-tenant-arrow" onClick={() => onSelectTenant(t)}><Icon.ChevronRight /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
