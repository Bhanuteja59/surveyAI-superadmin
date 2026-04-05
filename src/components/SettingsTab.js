import { useState } from "react";
import { superAdminApi } from "../api";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePromote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await superAdminApi.promote(email);
      setMsg({ ok: true, text: `${email} is now a Super Admin.` });
      setEmail("");
    } catch(e) { setMsg({ ok: false, text: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="sa-page-enter">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-page-title">Settings</h1>
          <p className="sa-page-subtitle">Platform-wide administration controls.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Promote User */}
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">Give Super Admin Access</div>
              <div className="sa-card-subtitle">The user must already have an account. They will be able to do everything you can in this dashboard.</div>
            </div>
          </div>
          <form onSubmit={handlePromote} className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="sa-form-group">
              <label className="sa-label">User Email Address</label>
              <input
                className="sa-input"
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button className="sa-btn sa-btn-primary sa-btn-full" type="submit" disabled={loading}>
              {loading ? 'Processing…' : 'Make Super Admin'}
            </button>
            {msg && <div className={`sa-alert ${msg.ok ? 'success' : 'error'}`}>{msg.text}</div>}
          </form>
        </div>

        {/* System Info */}
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">System Information</div>
              <div className="sa-card-subtitle">Current platform configuration and environment details.</div>
            </div>
          </div>
          <div className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Platform', value: 'SurveyAI' },
              { label: 'Environment', value: 'Development' },
              { label: 'Backend', value: 'http://localhost:8000' },
              { label: 'Frontend', value: 'http://localhost:3000' },
              { label: 'Admin Panel', value: 'http://localhost:3001' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-1)', fontFamily: 'monospace' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
