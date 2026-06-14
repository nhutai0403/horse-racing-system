import { useNavigate } from 'react-router-dom';
import { useHorseOwner } from './HorseOwnerContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function DashboardContent() {
  const navigate = useNavigate();
  const { horses = [], transactions = [], tournaments = [] } = useHorseOwner();

  // Format currency to VND
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Calculate dynamic stats
  const totalEarnings = transactions
    .filter(t => t.type === 'WINNINGS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const activeRosterCount = horses.length;
  const readyCount = horses.filter(h => h.status === 'READY').length;
  const trainingCount = horses.filter(h => h.status === 'TRAINING').length;
  const sickCount = horses.filter(h => h.status === 'SICK').length;

  // Sort horses by winRate for Top Performers
  const topPerformers = [...horses].sort((a, b) => (b.winRate || 0) - (a.winRate || 0));

  // Columns for Top Performers DataTable
  const columns = [
    {
      key: 'name',
      label: 'Horse',
      render: (item) => {
        const imgUrl = item.image || item.img || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&auto=format&fit=crop&q=60';
        return (
          <div className="d-flex align-items-center">
            <div className="rounded-circle overflow-hidden me-3 border" style={{ width: '40px', height: '40px', borderColor: '#c0c9c0', flexShrink: 0 }}>
              <img
                alt={item.name}
                className="w-100 h-100 object-fit-cover"
                src={imgUrl}
              />
            </div>
            <span className="fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>
              {item.name}
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      key: 'breed',
      label: 'Breed',
      render: (item) => <span className="text-secondary small">{item.breed}</span>
    },
    {
      key: 'winRate',
      label: 'Win Rate',
      align: 'right',
      render: (item) => (
        <span className="fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>
          {item.winRate}%
        </span>
      )
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title & Actions */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-end gap-3 mb-4">
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Stable Dashboard
          </h2>
          <p className="text-secondary small m-0">
            Overview of your elite assets and upcoming events.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-4 mb-4">
        {/* Earnings Card */}
        <div className="col-12 col-md-4">
          <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100" onClick={() => navigate('/owner/financials')}>
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '60px', color: 'var(--ho-accent-gold-text)' }}>trending_up</span>
            </div>
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Total Earnings (YTD)
            </h3>
            <p className="ho-font-epilogue fs-2 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              {formatVND(totalEarnings)}
            </p>
            <div className="mt-3 d-flex align-items-center small fw-semibold text-success">
              <span className="material-symbols-outlined me-1" style={{ fontSize: '16px' }}>arrow_upward</span>
              <span>Active Revenue Streams</span>
            </div>
          </div>
        </div>

        {/* Active Roster Card */}
        <div className="col-12 col-md-4">
          <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100" onClick={() => navigate('/owner/stable')}>
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '60px', color: 'var(--ho-accent-gold-text)' }}>pets</span>
            </div>
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Active Roster
            </h3>
            <p className="ho-font-epilogue fs-2 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              {activeRosterCount}
            </p>
            <div className="mt-3 small text-secondary fw-semibold">
              {readyCount} ready • {trainingCount} in training • {sickCount} sick
            </div>
          </div>
        </div>

        {/* Tournament Registration Redirect Card */}
        <div className="col-12 col-md-4">
          <div className="glass-card glass-card-interactive h-100 d-flex flex-column justify-content-between position-relative overflow-hidden" 
               style={{ cursor: 'pointer', border: '1px solid rgba(212, 175, 55, 0.4)' }}
               onClick={() => navigate('/owner/entries')}>
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '60px', color: 'var(--ho-accent-gold-text)' }}>emoji_events</span>
            </div>
            <div>
              <h3 className="ho-font-grotesk text-uppercase fw-bold mb-2 d-flex align-items-center" style={{ fontSize: '11px', color: 'var(--ho-accent-gold-text)', letterSpacing: '0.05em' }}>
                <span className="material-symbols-outlined me-2 fs-5">emoji_events</span>
                Race Registration
              </h3>
              <p className="text-dark fw-bold mb-2" style={{ fontSize: '14px' }}>
                Đăng ký giải đấu mới
              </p>
              <p className="text-secondary small mb-3" style={{ lineHeight: '1.4' }}>
                Các giải đấu lớn đang mở cổng đăng ký thi đấu. Nhấp vào đây để điều hướng nhanh đến bảng đăng ký giải đấu dành cho các chiến mã của bạn.
              </p>
            </div>
            <button
              className="ho-btn ho-btn-gold-solid w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 mt-auto"
              style={{ fontSize: '12.5px' }}
            >
              <span className="material-symbols-outlined text-dark" style={{ fontSize: '16px' }}>sports_score</span>
              Đến Bảng Đăng Ký
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Performers and Events */}
      <div className="row g-4">
        {/* Top Performers Table */}
        <div className="col-12 col-lg-8">
          <div className="glass-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="ho-font-epilogue fs-5 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                Top Performers
              </h3>
              <button
                onClick={() => navigate('/owner/stable')}
                className="ho-btn-link text-uppercase tracking-wider small d-flex align-items-center"
              >
                View All
                <span className="material-symbols-outlined ms-1" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
            <DataTable columns={columns} data={topPerformers.slice(0, 3)} emptyMessage="No horses registered in stable yet." />
          </div>
        </div>

        {/* Upcoming Events Column */}
        <div className="col-12 col-lg-4">
          <div className="glass-card h-100">
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Upcoming Events
            </h3>
            <div className="ho-timeline">
              {tournaments.slice(0, 3).map((t, idx) => (
                <div key={t.id || idx} className="ho-timeline-item">
                  <div className={`ho-timeline-badge ${idx > 0 ? 'ho-timeline-badge-dark' : ''}`} />
                  <h4 className="fw-bold fs-7 mb-1">{t.tournamentName}</h4>
                  <p className="text-secondary small m-0">{t.location}</p>
                  <p className="ho-font-grotesk fw-bold tracking-wide uppercase m-0 mt-1" style={{ color: 'var(--ho-accent-gold-text)', fontSize: '10px' }}>
                    {t.date} at {t.time}
                  </p>
                </div>
              ))}
              {tournaments.length === 0 && (
                <div className="text-secondary small italic text-center py-4">No upcoming events scheduled.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
