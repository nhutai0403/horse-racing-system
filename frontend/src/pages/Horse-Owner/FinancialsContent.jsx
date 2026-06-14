import { useHorseOwner } from './HorseOwnerContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function FinancialsContent() {
  const { profile = {}, transactions = [] } = useHorseOwner();

  // Format currency to VND
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Calculate dynamic stats
  const totalWinnings = transactions
    .filter(t => t.type === 'WINNINGS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalEntryFees = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netEarnings = totalWinnings + totalEntryFees;

  // Columns for Transactions DataTable
  const columns = [
    {
      key: 'date',
      label: 'Date & Time',
    },
    {
      key: 'horse',
      label: 'Horse',
      render: (item) => item.horse ? (
        <span className="fw-bold text-dark">{item.horse}</span>
      ) : (
        <span className="text-muted">-</span>
      )
    },
    {
      key: 'event',
      label: 'Event / Details',
    },
    {
      key: 'type',
      label: 'Type',
      render: (item) => (
        <StatusBadge status={item.type} />
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (item) => {
        const isPositive = item.amount >= 0;
        return (
          <span className={`fw-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? '+' : ''}{formatVND(item.amount)}
          </span>
        );
      }
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <h2 className="ho-font-epilogue fs-3 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
        Financial Overview
      </h2>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Wallet Balance
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              {formatVND(profile.walletBalance || 0)}
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Total Winnings
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0 text-success">
              +{formatVND(totalWinnings)}
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Total Entry Fees
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0 text-danger">
              {formatVND(totalEntryFees)}
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Net Winnings
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0" style={{ color: 'var(--ho-accent-gold-text)' }}>
              {formatVND(netEarnings)}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card">
        <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
          Recent Transactions
        </h3>
        <DataTable columns={columns} data={transactions} emptyMessage="No transactions recorded yet." />
      </div>
    </div>
  );
}
