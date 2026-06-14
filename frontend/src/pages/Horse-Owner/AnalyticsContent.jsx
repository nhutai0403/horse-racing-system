import { useHorseOwner } from './HorseOwnerContext';
import DataTable from '../../components/DataTable';

export default function AnalyticsContent() {
  const { horses = [], raceHistory = [] } = useHorseOwner();

  // Calculate dynamic stats
  const totalRaces = horses.reduce((sum, h) => sum + (h.matchesPlayed || 0), 0);
  const avgWinRate = horses.length 
    ? Math.round(horses.reduce((sum, h) => sum + (h.winRate || 0), 0) / horses.length) 
    : 0;
  const totalWins = horses.reduce((sum, h) => sum + Math.round((h.matchesPlayed || 0) * (h.winRate || 0) / 100), 0);

  // Create dynamic leaderboard by sorting horses by calculated points
  const sortedLeaderboard = [...horses]
    .map(h => ({
      name: h.name,
      pts: (h.matchesPlayed || 0) * (h.winRate || 0) * 1.5 + 100, // custom point formula
      trend: h.winRate >= 50 ? 'up' : 'down',
      status: h.status
    }))
    .sort((a, b) => b.pts - a.pts);

  // Format currency to VND
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Columns for Race History DataTable
  const columns = [
    {
      key: 'date',
      label: 'Date',
    },
    {
      key: 'tournament',
      label: 'Tournament & Round',
      render: (item) => (
        <div>
          <div className="fw-bold text-dark">{item.tournament}</div>
          <div className="text-secondary small">{item.raceRound}</div>
        </div>
      )
    },
    {
      key: 'horseName',
      label: 'Horse',
      render: (item) => <span className="fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>{item.horseName}</span>
    },
    {
      key: 'jockeyName',
      label: 'Jockey',
    },
    {
      key: 'placement',
      label: 'Placement',
      align: 'center',
      render: (item) => {
        const placementColors = {
          1: { bg: 'rgba(212, 175, 55, 0.15)', text: '#d4af37', label: '1st Place' },
          2: { bg: 'rgba(192, 192, 192, 0.15)', text: '#8a8a8a', label: '2nd Place' },
          3: { bg: 'rgba(205, 127, 50, 0.15)', text: '#cd7f32', label: '3rd Place' }
        };
        const placementInfo = placementColors[item.placement] || { bg: 'rgba(108, 117, 125, 0.15)', text: '#6c757d', label: `${item.placement}th` };
        
        return (
          <span 
            className="px-2 py-1 rounded-pill fw-bold text-xs" 
            style={{ backgroundColor: placementInfo.bg, color: placementInfo.text, fontSize: '11px' }}
          >
            {placementInfo.label}
          </span>
        );
      }
    },
    {
      key: 'prizeMoney',
      label: 'Prize Money',
      align: 'right',
      render: (item) => (
        <span className="fw-bold text-success">
          +{formatVND(item.prizeMoney)}
        </span>
      )
    },
    {
      key: 'revenueShare',
      label: 'Revenue Share',
      render: (item) => <span className="small text-secondary">{item.revenueShare}</span>
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <h2 className="ho-font-epilogue fs-3 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
        Performance Analytics
      </h2>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="glass-card text-center">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Total Races (Stable)
            </h3>
            <p className="ho-font-epilogue fs-1 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              {totalRaces}
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="glass-card text-center">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Average Win Rate
            </h3>
            <p className="ho-font-epilogue fs-1 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              {avgWinRate}%
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="glass-card text-center">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Estimated Win Count
            </h3>
            <p className="ho-font-epilogue fs-1 fw-extrabold m-0" style={{ color: 'var(--ho-accent-gold-text)' }}>
              {totalWins}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Trend Line and Leaderboard */}
      <div className="row g-4 mb-4">
        {/* Win Rate YTD Trend (SVG Chart) */}
        <div className="col-12 col-lg-6">
          <div className="glass-card h-100">
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Win Rate Trend (YTD)
            </h3>
            <div className="d-flex align-items-end justify-content-center" style={{ height: '256px' }}>
              <svg viewBox="0 0 400 200" className="w-100 h-100" style={{ overflow: 'visible' }}>
                {/* Grid Lines */}
                <line x1="0" y1="180" x2="400" y2="180" stroke="#e5e2e1" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="130" x2="400" y2="130" stroke="#e5e2e1" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#e5e2e1" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="30" x2="400" y2="30" stroke="#e5e2e1" strokeWidth="1" strokeDasharray="4" />

                {/* Trend Line */}
                <polyline
                  fill="none"
                  stroke="var(--ho-accent-gold)"
                  strokeWidth="4"
                  points="0,180 50,150 100,160 150,120 200,100 250,130 300,80 350,90 400,40"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data End Dot */}
                <circle
                  cx="400"
                  cy="40"
                  r="6"
                  fill="var(--ho-primary-dark)"
                  stroke="var(--ho-accent-gold)"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Season Leaderboard */}
        <div className="col-12 col-lg-6">
          <div className="glass-card h-100">
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Stable Leaderboard
            </h3>
            <div className="d-flex flex-column gap-3">
              {sortedLeaderboard.map((item, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center justify-content-between p-3 border rounded"
                  style={{ backgroundColor: 'var(--ho-bg-cream)', borderColor: 'var(--ho-border-muted)' }}
                >
                  <div className="d-flex align-items-center">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 text-xs ho-font-grotesk"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: index === 0 ? 'var(--ho-accent-gold-hover)' : '#e5e2e1',
                        color: index === 0 ? 'var(--ho-accent-gold-text)' : 'var(--ho-text-muted)'
                      }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <span className="fw-bold fs-7 d-block" style={{ color: 'var(--ho-primary-dark)' }}>
                        {item.name}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '10px' }}>
                        Status: <span className="fw-bold">{item.status}</span>
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="fw-bold text-dark fs-7 me-2">
                      {Math.round(item.pts)} pts
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '18px',
                        color: item.trend === 'up' ? 'var(--ho-primary-medium)' : 'var(--ho-error-text)'
                      }}
                    >
                      {item.trend === 'up' ? 'trending_up' : 'trending_down'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Race History Table (using DataTable component) */}
      <div className="glass-card">
        <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
          Recent Race Results
        </h3>
        <DataTable columns={columns} data={raceHistory} emptyMessage="No race results available for this stable yet." />
      </div>
    </div>
  );
}
