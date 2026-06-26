import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTournamentsAPI } from '../../../services/races';
import { getUpgradeRequestsAPI, getRaceRegistrationsAPI, getRefereesAPI, getAdminDashboardStatsAPI } from '../../../services/admin';
import DataTable from '../../../components/DataTable';

export default function AdminDashboardContent() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usersCount: 0,
    tournamentsCount: 0,
    racesCount: 0,
    pendingUpgradesCount: 0,
    pendingWithdrawalsCount: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart hover states
  const [revHovered, setRevHovered] = useState(null);
  const [roleHovered, setRoleHovered] = useState(null);
  const [betHovered, setBetHovered] = useState(null);

  // Chart datasets from DB
  const [revenueData, setRevenueData] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState({});
  const [betVolumeData, setBetVolumeData] = useState([]);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // 1. Fetch DB stats
        const dbStats = await getAdminDashboardStatsAPI();
        
        // 2. Format revenue data points
        const maxRev = Math.max(...dbStats.revenueData.map(d => d.val), 0) || 100000;
        const formattedRev = dbStats.revenueData.map((d, idx) => {
          const N = dbStats.revenueData.length;
          const x = 30 + idx * (440.0 / (N - 1 || 1));
          const y = 170 - (d.val / maxRev) * 130;
          return {
            month: d.month,
            val: d.val,
            x: x,
            y: y
          };
        });
        setRevenueData(formattedRev);

        // 3. Set raw role distribution
        setRoleDistribution(dbStats.roleDistribution || {});

        // 4. Format bet volumes
        const maxBets = Math.max(...dbStats.betVolumeData.map(d => d.bets), 0) || 10;
        const formattedBets = dbStats.betVolumeData.map((d, idx) => {
          const N = dbStats.betVolumeData.length;
          const barWidth = 14;
          const spacing = N > 1 ? (190.0 / (N - 1)) : 190.0;
          const x = 35 + idx * spacing;
          const barHeight = (d.bets / maxBets) * 120;
          const y = 170 - barHeight;
          return {
            tournament: d.tournament,
            bets: d.bets,
            x: x,
            y: y,
            height: barHeight
          };
        });
        setBetVolumeData(formattedBets);

        // 5. Fetch recent requests list (using existing API)
        const upgrades = await getUpgradeRequestsAPI().catch(() => []);
        setRecentRequests(upgrades.slice(0, 5));

        // 6. Set stats counts
        setStats({
          usersCount: dbStats.usersCount,
          tournamentsCount: dbStats.tournamentsCount,
          racesCount: dbStats.racesCount,
          pendingUpgradesCount: dbStats.pendingUpgradesCount,
          pendingWithdrawalsCount: dbStats.pendingWithdrawalsCount
        });

      } catch (e) {
        console.error('Error fetching dashboard stats', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const requestColumns = [
    {
      key: 'fullName',
      label: 'Full Name',
      render: (item) => <span className="fw-semibold text-dark">{item.fullName}</span>
    },
    {
      key: 'requestedRole',
      label: 'Requested Role',
      render: (item) => (
        <span className="badge bg-light text-dark fw-bold" style={{ fontSize: '11px' }}>
          {item.requestedRole}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className={`badge ${item.status === 'APPROVED' ? 'bg-success' : item.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
          {item.status}
        </span>
      )
    },
    {
      key: 'submittedAt',
      label: 'Date Submitted',
      render: (item) => <span className="text-secondary small">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="mb-4">
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
          Admin Administration System
        </h2>
        <p className="text-secondary small m-0">
          Overview of tournament statistics, user account management, and withdrawal transactions.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#a0aec0' }}>
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="fw-bold">Loading system metrics...</div>
        </div>
      ) : (
        <>
          {/* Stats Cards Row */}
          <div className="row g-4 mb-4">
            
            {/* Total Users */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/usermanagement')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>group</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Total Users
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {stats.usersCount}
                </p>
                <div className="mt-2 small text-secondary">
                  Manage & search
                </div>
              </div>
            </div>

            {/* Total Tournaments */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tournamentmanagement')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>emoji_events</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Active Tournaments
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {stats.tournamentsCount}
                </p>
                <div className="mt-2 small text-secondary">
                  Create & update
                </div>
              </div>
            </div>

            {/* Total Races */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/racemanagement')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>flag</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Entry Registrations
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {stats.racesCount}
                </p>
                <div className="mt-2 small text-secondary">
                  Approve registrations
                </div>
              </div>
            </div>

            {/* Pending Upgrades */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/upgradeuserrole')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>manage_accounts</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Upgrade Requests
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {stats.pendingUpgradesCount}
                </p>
                <div className="mt-2 small text-warning fw-semibold">
                  Pending approval
                </div>
              </div>
            </div>

            {/* Pending Withdrawals */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/withdrawals')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>account_balance_wallet</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Withdrawal Transactions
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {stats.pendingWithdrawalsCount}
                </p>
                <div className="mt-2 small text-warning fw-semibold">
                  Pending wallet approval
                </div>
              </div>
            </div>

          </div>

          {/* Charts Section */}
          <div className="row g-4 mb-4">
            {/* Revenue Trend Area Chart */}
            <div className="col-12 col-xl-6">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="ho-font-epilogue fs-5 fw-bold m-0 text-dark">Platform Revenue Growth</h3>
                    <p className="text-secondary small m-0">Monthly commission fees (10% of bet volumes)</p>
                  </div>
                  <span className="badge bg-success-subtle text-success fw-bold px-2 py-1" style={{ fontSize: '11px' }}>
                    Live DB Sync
                  </span>
                </div>
                
                <div className="position-relative" style={{ height: '220px' }}>
                  {revenueData.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No data available</div>
                  ) : (
                    <svg viewBox="0 0 500 200" width="100%" height="100%" className="overflow-visible">
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--ho-primary-dark, #0f5132)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--ho-primary-dark, #0f5132)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Gridlines */}
                      <line x1="30" y1="40" x2="470" y2="40" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="30" y1="80" x2="470" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="30" y1="120" x2="470" y2="120" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="30" y1="160" x2="470" y2="160" stroke="#e2e8f0" strokeDasharray="3 3" />
                      
                      {/* Y-Axis Labels */}
                      {(() => {
                        const maxVal = Math.max(...revenueData.map(d => d.val), 0) || 100000;
                        const formatMillion = (val) => {
                          if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                          if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
                          return val.toString();
                        };
                        return (
                          <>
                            <text x="24" y="44" textAnchor="end" fill="#718096" fontSize="10" className="ho-font-grotesk">{formatMillion(maxVal)}</text>
                            <text x="24" y="84" textAnchor="end" fill="#718096" fontSize="10" className="ho-font-grotesk">{formatMillion(maxVal * 0.65)}</text>
                            <text x="24" y="124" textAnchor="end" fill="#718096" fontSize="10" className="ho-font-grotesk">{formatMillion(maxVal * 0.35)}</text>
                            <text x="24" y="164" textAnchor="end" fill="#718096" fontSize="10" className="ho-font-grotesk">{formatMillion(maxVal * 0.1)}</text>
                          </>
                        );
                      })()}

                      {/* Area fill */}
                      <polygon 
                        points={`30,170 ${revenueData.map(d => `${d.x},${d.y}`).join(' ')} 470,170`} 
                        fill="url(#revenueGrad)" 
                      />
                      
                      {/* Stroke line */}
                      <path 
                        d={revenueData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.y}`).join(' ')} 
                        fill="none" 
                        stroke="var(--ho-primary-dark, #0f5132)" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Hover vertical line */}
                      {revHovered !== null && revenueData[revHovered] && (
                        <line 
                          x1={revenueData[revHovered].x} 
                          y1="30" 
                          x2={revenueData[revHovered].x} 
                          y2="170" 
                          stroke="#D4AF37" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                        />
                      )}

                      {/* X-Axis Baseline */}
                      <line x1="30" y1="170" x2="470" y2="170" stroke="#cbd5e0" strokeWidth="1" />

                      {/* Interactive dots */}
                      {revenueData.map((d, idx) => (
                        <g key={idx}>
                          {/* Invisible large catch-area for hover */}
                          <circle 
                            cx={d.x} 
                            cy={d.y} 
                            r="15" 
                            fill="transparent" 
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setRevHovered(idx)}
                            onMouseLeave={() => setRevHovered(null)}
                          />
                          {/* Visual circle */}
                          <circle 
                            cx={d.x} 
                            cy={d.y} 
                            r={revHovered === idx ? 7 : 5} 
                            fill={revHovered === idx ? "var(--ho-accent-gold, #D4AF37)" : "#ffffff"} 
                            stroke="var(--ho-primary-dark, #0f5132)" 
                            strokeWidth={revHovered === idx ? 3 : 2} 
                            style={{ transition: 'all 0.2s ease', pointerEvents: 'none' }}
                          />
                          {/* Month labels */}
                          <text 
                            x={d.x} 
                            y="188" 
                            textAnchor="middle" 
                            fill="#4a5568" 
                            fontSize="10" 
                            className="ho-font-grotesk fw-bold"
                          >
                            {d.month}
                          </text>
                        </g>
                      ))}
                    </svg>
                  )}
                  
                  {/* Tooltip */}
                  {revHovered !== null && revenueData[revHovered] && (
                    <div 
                      className="position-absolute bg-dark text-white p-2 rounded shadow text-start" 
                      style={{ 
                        left: `${Math.min(380, revenueData[revHovered].x + 10)}px`, 
                        top: `${revenueData[revHovered].y - 45}px`,
                        pointerEvents: 'none',
                        zIndex: 10,
                        fontSize: '11px',
                        minWidth: '100px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="fw-bold text-warning">{revenueData[revHovered].month}</div>
                      <div className="small text-white-50">Revenue:</div>
                      <div className="fw-bold text-white">{formatVND(revenueData[revHovered].val)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active User Distribution Donut Chart */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div>
                  <h3 className="ho-font-epilogue fs-5 fw-bold m-0 text-dark">User Breakdown</h3>
                  <p className="text-secondary small mb-3">System user accounts distribution</p>
                </div>

                <div className="d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                  {/* Donut SVG */}
                  <div className="position-relative" style={{ width: '130px', height: '130px' }}>
                    <svg viewBox="0 0 200 200" width="100%" height="100%">
                      <circle cx="100" cy="100" r="50" fill="transparent" stroke="#f0eedf" strokeWidth="18" />
                      
                      {/* Slices */}
                      {(() => {
                        let accumulatedCircumference = 0;
                        const totalUsers = Object.values(roleDistribution || {}).reduce((a, b) => a + b, 0) || 1;
                        const roleColors = {
                          Spectators: '#95d4ac',
                          Owners: '#D4AF37',
                          Jockeys: '#0f5132',
                          Referees: '#745c00',
                          Admins: '#ef4444'
                        };
                        return Object.entries(roleDistribution || {}).map(([role, count], idx) => {
                          const percentage = count / totalUsers;
                          const strokeLength = percentage * 314.16;
                          const strokeOffset = 314.16 - accumulatedCircumference;
                          accumulatedCircumference += strokeLength;
                          
                          return (
                            <circle 
                              key={idx}
                              cx="100" 
                              cy="100" 
                              r="50" 
                              fill="transparent" 
                              stroke={roleColors[role] || '#718096'} 
                              strokeWidth="18" 
                              strokeDasharray={`${strokeLength} 314.16`}
                              strokeDashoffset={strokeOffset} 
                              transform="rotate(-90 100 100)"
                              style={{ 
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={() => setRoleHovered(idx)}
                              onMouseLeave={() => setRoleHovered(null)}
                            />
                          );
                        });
                      })()}

                      {/* Total Users Label */}
                      <text x="100" y="98" textAnchor="middle" className="ho-font-epilogue fw-extrabold" fontSize="16" fill="var(--ho-primary-dark)">
                        {Object.values(roleDistribution || {}).reduce((a, b) => a + b, 0)}
                      </text>
                      <text x="100" y="112" textAnchor="middle" className="ho-font-grotesk text-secondary" fontSize="8" letterSpacing="0.05em">
                        TOTAL USERS
                      </text>
                    </svg>

                    {/* Tooltip inside */}
                    {roleHovered !== null && (() => {
                      const totalUsers = Object.values(roleDistribution || {}).reduce((a, b) => a + b, 0) || 1;
                      const entries = Object.entries(roleDistribution || {});
                      const [role, count] = entries[roleHovered];
                      const pct = ((count / totalUsers) * 100).toFixed(0);
                      return (
                        <div 
                          className="position-absolute bg-dark text-white p-2 rounded shadow text-start" 
                          style={{ 
                            left: '50%', 
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            zIndex: 10,
                            fontSize: '9px',
                            minWidth: '95px',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            opacity: 0.95
                          }}
                        >
                          <div className="fw-bold">{role}</div>
                          <div className="text-warning fw-extrabold">{count} ({pct}%)</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-1" style={{ fontSize: '9.5px' }}>
                  {Object.entries(roleDistribution || {}).map(([role, count]) => {
                    const roleColors = {
                      Spectators: '#95d4ac',
                      Owners: '#D4AF37',
                      Jockeys: '#0f5132',
                      Referees: '#745c00',
                      Admins: '#ef4444'
                    };
                    return (
                      <div key={role} className="d-flex align-items-center gap-1">
                        <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: roleColors[role] }} />
                        <span className="text-secondary">{role.substring(0, 4)}: <strong>{count}</strong></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Betting Activity Volume Column Chart */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div>
                  <h3 className="ho-font-epilogue fs-5 fw-bold m-0 text-dark">Betting Volume</h3>
                  <p className="text-secondary small mb-3">Total placed bets per tournament</p>
                </div>

                <div className="position-relative" style={{ height: '220px' }}>
                  {betVolumeData.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small">No data available</div>
                  ) : (
                    <svg viewBox="0 0 250 200" width="100%" height="100%" className="overflow-visible">
                      {/* Gridlines */}
                      <line x1="30" y1="50" x2="230" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="30" y1="100" x2="230" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="30" y1="150" x2="230" y2="150" stroke="#e2e8f0" strokeDasharray="3 3" />

                      {/* Y-Axis Labels */}
                      {(() => {
                        const maxB = Math.max(...betVolumeData.map(d => d.bets), 0) || 10;
                        return (
                          <>
                            <text x="24" y="54" textAnchor="end" fill="#718096" fontSize="9" className="ho-font-grotesk">{maxB}</text>
                            <text x="24" y="104" textAnchor="end" fill="#718096" fontSize="9" className="ho-font-grotesk">{Math.round(maxB * 0.6)}</text>
                            <text x="24" y="154" textAnchor="end" fill="#718096" fontSize="9" className="ho-font-grotesk">{Math.round(maxB * 0.2)}</text>
                          </>
                        );
                      })()}

                      {/* Baseline */}
                      <line x1="30" y1="170" x2="230" y2="170" stroke="#cbd5e0" strokeWidth="1" />

                      {/* Columns */}
                      {betVolumeData.map((d, idx) => {
                        const barWidth = 16;
                        return (
                          <g key={idx}>
                            <rect 
                              x={d.x - barWidth/2} 
                              y={d.y} 
                              width={barWidth} 
                              height={d.height} 
                              fill={betHovered === idx ? "var(--ho-accent-gold-hover, #fed65b)" : "var(--ho-primary-dark, #003820)"}
                              rx="3"
                              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                              onMouseEnter={() => setBetHovered(idx)}
                              onMouseLeave={() => setBetHovered(null)}
                            />
                            {/* X-axis Label abbreviation */}
                            <text 
                              x={d.x} 
                              y="185" 
                              textAnchor="middle" 
                              fill="#4a5568" 
                              fontSize="8" 
                              className="ho-font-grotesk fw-bold"
                            >
                              {d.tournament.length > 5 ? d.tournament.substring(0, 4) + '..' : d.tournament}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}

                  {/* Tooltip */}
                  {betHovered !== null && betVolumeData[betHovered] && (
                    <div 
                      className="position-absolute bg-dark text-white p-2 rounded shadow text-start" 
                      style={{ 
                        left: `${Math.min(130, betVolumeData[betHovered].x)}px`, 
                        top: `${betVolumeData[betHovered].y - 30}px`,
                        pointerEvents: 'none',
                        zIndex: 10,
                        fontSize: '11px',
                        minWidth: '120px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="fw-bold text-warning">{betVolumeData[betHovered].tournament}</div>
                      <div className="small text-white-50">Volume:</div>
                      <div className="fw-bold text-white">{betVolumeData[betHovered].bets} bets</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Lists Grid */}
          <div className="row g-4">
            
            {/* Recent Upgrade Requests */}
            <div className="col-12 col-lg-6">
              <div className="glass-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="ho-font-epilogue fs-5 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                    Recent Role Upgrade Requests
                  </h3>
                  <button
                    onClick={() => navigate('/admin/upgradeuserrole')}
                    className="ho-btn-link text-uppercase tracking-wider small d-flex align-items-center"
                    style={{ fontSize: '12px' }}
                  >
                    View All
                    <span className="material-symbols-outlined ms-1" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </button>
                </div>
                <DataTable columns={requestColumns} data={recentRequests} emptyMessage="No recent upgrade requests." />
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="col-12 col-lg-6">
              <div className="glass-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <h3 className="ho-font-epilogue fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>
                    Admin Quick Actions
                  </h3>
                  <p className="text-secondary small mb-4">
                    Administrators have privileges to manage tournaments, financials, and system permissions.
                  </p>
                  
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div>
                        <span className="fw-bold d-block text-dark small">Create New Horse Tournament</span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>Configure prize pool, match date, deadline, and assign referee</span>
                      </div>
                      <button onClick={() => navigate('/admin/tournamentmanagement')} className="btn btn-outline-success btn-sm fw-bold">Go to</button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div>
                        <span className="fw-bold d-block text-dark small">Manage Rounds & Approve Registrations</span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>Manage match heats, participant rosters, and sign-ups</span>
                      </div>
                      <button onClick={() => navigate('/admin/racemanagement')} className="btn btn-outline-success btn-sm fw-bold">Go to</button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div>
                        <span className="fw-bold d-block text-dark small">Approve Wallet Withdrawals</span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>Process withdrawals for jockeys/owners, and refund rejected requests</span>
                      </div>
                      <button onClick={() => navigate('/admin/withdrawals')} className="btn btn-outline-success btn-sm fw-bold">Go to</button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded bg-light border text-center text-secondary small">
                  Current system account is operating in local development mode (**LOCAL_DEV**).
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
