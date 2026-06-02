import React from 'react';

export default function AnalyticsContent() {
  const leaderboard = [
    { pos: 1, name: 'Midnight Runner', pts: '2,450', trend: 'up' },
    { pos: 2, name: 'Golden Arrow', pts: '2,100', trend: 'down' },
    { pos: 3, name: 'Storm Weaver', pts: '1,850', trend: 'up' },
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
              Total Races
            </h3>
            <p className="ho-font-epilogue fs-1 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              142
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="glass-card text-center">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Overall Win Rate
            </h3>
            <p className="ho-font-epilogue fs-1 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              68%
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="glass-card text-center">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Podium Finishes
            </h3>
            <p className="ho-font-epilogue fs-1 fw-extrabold m-0" style={{ color: 'var(--ho-accent-gold-text)' }}>
              115
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Trend Line and Leaderboard */}
      <div className="row g-4">
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
              Season Leaderboard
            </h3>
            <div className="d-flex flex-column gap-3">
              {leaderboard.map((item) => (
                <div
                  key={item.pos}
                  className="d-flex align-items-center justify-content-between p-3 border rounded"
                  style={{ backgroundColor: 'var(--ho-bg-cream)', borderColor: 'var(--ho-border-muted)' }}
                >
                  <div className="d-flex align-items-center">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 text-xs ho-font-grotesk"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: item.pos === 1 ? 'var(--ho-accent-gold-hover)' : '#e5e2e1',
                        color: item.pos === 1 ? 'var(--ho-accent-gold-text)' : 'var(--ho-text-muted)'
                      }}
                    >
                      {item.pos}
                    </span>
                    <span className="fw-bold fs-7" style={{ color: 'var(--ho-primary-dark)' }}>
                      {item.name}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="fw-bold text-dark fs-7 me-2">
                      {item.pts} pts
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
    </div>
  );
}
