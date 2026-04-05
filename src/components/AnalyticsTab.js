import { useMemo } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const baseOpts = (isDark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index', intersect: false,
      backgroundColor: isDark ? '#1a2236' : '#fff',
      titleColor: isDark ? '#f1f5f9' : '#0d1117',
      bodyColor: isDark ? '#94a3b8' : '#4b5563',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e4e8ee',
      borderWidth: 1, padding: 10, cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: isDark ? '#475569' : '#9ca3af', font: { size: 11 } },
      border: { display: false }
    },
    y: {
      grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
      ticks: { color: isDark ? '#475569' : '#9ca3af', font: { size: 11 } },
      border: { display: false }
    }
  },
  animation: { duration: 600, easing: 'easeOutQuart' }
});

export default function AnalyticsPage({ data, chartData, activity, tenants, isDark }) {
  const statCards = [
    { label: 'Total Businesses', value: data?.total_tenants ?? 0, accent: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: '🏢', trend: null },
    { label: 'Total Surveys', value: data?.total_surveys ?? 0, accent: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: '📋', trend: null },
    { label: 'Total Responses', value: data?.total_responses ?? 0, accent: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '⚡', trend: `+${data?.responses_this_week ?? 0} this week` },
    { label: 'Responses Today', value: data?.responses_today ?? 0, accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '📊', trend: null },
  ];

  const lineData = useMemo(() => ({
    labels: chartData.map(d => d.date),
    datasets: [{
      fill: true,
      label: 'Responses',
      data: chartData.map(d => d.count),
      borderColor: '#6366f1',
      backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
      tension: 0.4, pointRadius: 3, pointHoverRadius: 5,
      pointBackgroundColor: '#6366f1',
      borderWidth: 2,
    }]
  }), [chartData, isDark]);

  const barData = useMemo(() => ({
    labels: tenants.slice(0, 6).map(t => t.name.length > 12 ? t.name.slice(0, 12) + '…' : t.name),
    datasets: [{
      label: 'Total Responses',
      data: tenants.slice(0, 6).map(t => t.total_responses),
      backgroundColor: isDark ? 'rgba(99,102,241,0.7)' : 'rgba(99,102,241,0.65)',
      borderRadius: 5,
      hoverBackgroundColor: '#6366f1',
    }]
  }), [tenants, isDark]);

  const surveyBarData = useMemo(() => ({
    labels: tenants.slice(0, 6).map(t => t.name.length > 12 ? t.name.slice(0, 12) + '…' : t.name),
    datasets: [{
      label: 'Surveys',
      data: tenants.slice(0, 6).map(t => t.total_surveys),
      backgroundColor: isDark ? 'rgba(16,185,129,0.7)' : 'rgba(16,185,129,0.65)',
      borderRadius: 5,
      hoverBackgroundColor: '#10b981',
    }]
  }), [tenants, isDark]);

  const chartOpts = baseOpts(isDark);

  return (
    <div className="sa-page-enter">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-page-title">Platform Overview</h1>
          <p className="sa-page-subtitle">Real-time analytics across all businesses on this platform.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="sa-stat-grid">
        {statCards.map(c => (
          <div className="sa-stat-card" key={c.label} style={{ '--card-accent': c.accent }}>
            <div className="sa-stat-top">
              <span className="sa-stat-label">{c.label}</span>
              <span className="sa-stat-icon" style={{ background: c.bg, fontSize: 18 }}>{c.icon}</span>
            </div>
            <div className="sa-stat-value">{c.value.toLocaleString()}</div>
            {c.trend && <div className="sa-stat-trend up">↑ {c.trend}</div>}
          </div>
        ))}
      </div>

      {/* Traffic Chart + Activity Feed */}
      <div className="sa-chart-grid">
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">Platform Traffic — Last 7 Days</div>
              <div className="sa-card-subtitle">Total survey responses across all businesses</div>
            </div>
          </div>
          <div className="sa-card-body">
            <div className="sa-chart-placeholder">
              <Line data={lineData} options={chartOpts} />
            </div>
          </div>
        </div>

        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">Live Activity Feed</div>
              <div className="sa-card-subtitle">New responses as they come in</div>
            </div>
          </div>
          <div className="sa-card-body" style={{ padding: '0 20px', maxHeight: 280, overflowY: 'auto' }}>
            {activity.length === 0 ? (
              <div className="sa-empty" style={{ padding: '30px 0' }}>
                <div className="sa-empty-icon">📭</div>
                <div className="sa-empty-title">No recent activity</div>
              </div>
            ) : activity.map((act, i) => (
              <div key={i} className="sa-feed-item">
                <div className="sa-feed-dot" />
                <div>
                  <div><strong>{act.tenant_name}</strong> received a response on <em>"{act.survey_title}"</em></div>
                  <div className="sa-feed-time">{act.time ? new Date(act.time).toLocaleTimeString() : '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dual Bar Charts */}
      <div className="sa-chart-grid">
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">Responses by Business</div>
              <div className="sa-card-subtitle">Top businesses ranked by total responses</div>
            </div>
          </div>
          <div className="sa-card-body">
            <div className="sa-chart-placeholder">
              <Bar data={barData} options={chartOpts} />
            </div>
          </div>
        </div>

        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">Surveys by Business</div>
              <div className="sa-card-subtitle">How many surveys each business has made</div>
            </div>
          </div>
          <div className="sa-card-body">
            <div className="sa-chart-placeholder">
              <Bar data={surveyBarData} options={chartOpts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
