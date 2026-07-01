/**
 * Reusable StatusBadge component
 * @param {string} status - Status text (e.g., 'READY', 'SICK', 'TRAINING', 'COMPLETED')
 * @param {string} customClass - Optional custom classes
 * @param {boolean} iconOnly - Whether to render only the icon in a neat circle
 */
export default function StatusBadge({ status, customClass = '', iconOnly = false }) {
  const normalizedStatus = status ? status.toUpperCase() : 'UNKNOWN';

  let bgColor = 'rgba(0,0,0,0.1)';
  let color = '#333';
  let icon = 'info';

  if (normalizedStatus.includes('READY') || normalizedStatus === 'COMPLETED' || normalizedStatus === 'SUCCESS' || normalizedStatus === 'PRIZE' || normalizedStatus === 'WINNINGS') {
    bgColor = 'rgba(16, 185, 129, 0.15)'; // Green
    color = '#047857';
    icon = 'check_circle';
  } else if (normalizedStatus.includes('SICK') || normalizedStatus.includes('FAILED') || normalizedStatus === 'CLOSED' || normalizedStatus === 'CANCELLED') {
    bgColor = 'rgba(239, 68, 68, 0.15)'; // Red
    color = '#b91c1c';
    icon = 'error';
  } else if (normalizedStatus.includes('TRAINING') || normalizedStatus.includes('PENDING')) {
    bgColor = 'rgba(245, 158, 11, 0.15)'; // Orange
    color = '#b45309';
    icon = 'sync';
  } else if (normalizedStatus.includes('RECOVERY') || normalizedStatus === 'DEPOSIT' || normalizedStatus === 'REFUND') {
    bgColor = 'rgba(59, 130, 246, 0.15)'; // Blue
    color = '#1d4ed8';
    icon = normalizedStatus === 'DEPOSIT' ? 'payments' : (normalizedStatus === 'REFUND' ? 'settings_backup_restore' : 'healing');
  } else if (normalizedStatus === 'WITHDRAW' || normalizedStatus === 'ENTRY_FEE') {
    bgColor = 'rgba(249, 115, 22, 0.15)'; // Deep Orange
    color = '#ea580c';
    icon = normalizedStatus === 'WITHDRAW' ? 'account_balance_wallet' : 'local_activity';
  } else if (normalizedStatus === 'FRIEND' || normalizedStatus === 'OPEN_FOR_REGISTER') {
    bgColor = 'rgba(139, 92, 246, 0.15)'; // Purple
    color = '#6d28d9';
    icon = 'group';
  }

  if (iconOnly) {
    return (
      <span
        className={`d-inline-flex align-items-center justify-content-center rounded-circle ${customClass}`}
        style={{
          backgroundColor: bgColor,
          color: color,
          width: '26px',
          height: '26px',
          border: `1px solid ${color}40`, // 40 is hex for 25% opacity
          flexShrink: 0
        }}
        title={status}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
          {icon}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-bold ${customClass}`}
      style={{
        backgroundColor: bgColor,
        color: color,
        fontSize: '11px',
        letterSpacing: '0.02em',
        border: `1px solid ${color}40`, // 40 is hex for 25% opacity
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
        {icon}
      </span>
      {status}
    </span>
  );
}
