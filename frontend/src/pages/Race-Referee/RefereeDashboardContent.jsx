import React, { useState, useEffect } from 'react';
import { getRefereeDashboardStatsAPI } from '../../services/referee';

export default function RefereeDashboardContent() {
  const [stats, setStats] = useState({ upcomingRaces: 0, horsesToInspect: 0, violationsIssued: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getRefereeDashboardStatsAPI();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-4 text-secondary">Loading statistics...</div>;
  }

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <div className="mb-4">
        <span className="role-badge">RACE REFEREE ROLE</span>
        <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Race Referee Dashboard</h2>
        <p className="text-secondary small">Overview of your pending tasks and recent actions.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="glass-card text-center p-4">
            <span className="material-symbols-outlined mb-2" style={{ fontSize: '36px', color: 'var(--ho-primary-medium)' }}>
              sports_score
            </span>
            <h3 className="fs-1 fw-bold text-dark m-0">{stats.upcomingRaces}</h3>
            <div className="text-secondary small text-uppercase tracking-wider mt-1">Upcoming Races</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="glass-card text-center p-4">
            <span className="material-symbols-outlined mb-2" style={{ fontSize: '36px', color: 'var(--ho-accent-gold-text)' }}>
              fact_check
            </span>
            <h3 className="fs-1 fw-bold text-dark m-0">{stats.horsesToInspect}</h3>
            <div className="text-secondary small text-uppercase tracking-wider mt-1">Horses to Inspect</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="glass-card text-center p-4">
            <span className="material-symbols-outlined mb-2" style={{ fontSize: '36px', color: 'var(--ho-error-text)' }}>
              warning
            </span>
            <h3 className="fs-1 fw-bold text-dark m-0">{stats.violationsIssued}</h3>
            <div className="text-secondary small text-uppercase tracking-wider mt-1">Violations Issued</div>
          </div>
        </div>
      </div>
    </div>
  );
}
