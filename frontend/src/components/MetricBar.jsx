import React from 'react';

/**
 * Reusable MetricBar component for displaying a progress bar with a value
 * @param {string} label - Label of the metric
 * @param {number} value - Value out of max (default 100)
 * @param {number} max - Maximum value (default 100)
 * @param {string} color - Hex or variable color string
 * @param {boolean} showValue - Whether to show the value string next to the label
 * @param {string} suffix - Suffix to show after the value (e.g. '%' or '/100')
 */
export default function MetricBar({ 
  label, 
  value = 0, 
  max = 100, 
  color = 'var(--ho-primary-dark)', 
  showValue = true,
  suffix = '/100'
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="mb-2 w-100">
      <div className="d-flex justify-content-between small fw-bold mb-1">
        <span className="text-dark">{label}</span>
        {showValue && <span className="text-secondary">{value}{suffix}</span>}
      </div>
      <div className="progress" style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: '4px'
          }}
          aria-valuenow={value}
          aria-valuemin="0"
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
