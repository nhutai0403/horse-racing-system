import React from 'react';

/**
 * Reusable DataCard component for displaying items in a grid
 * @param {string} title - Main title
 * @param {string} subtitle - Subtitle (e.g. date, category)
 * @param {ReactNode} actions - Optional action buttons/elements
 * @param {ReactNode} children - Main content body
 * @param {boolean} interactive - Whether the card has hover effects
 */
export default function DataCard({ title, subtitle, actions, children, interactive = false }) {
  return (
    <div className={`glass-card h-100 d-flex flex-column ${interactive ? 'glass-card-interactive cursor-pointer' : ''}`}>
      {/* Header */}
      <div className="mb-3 d-flex justify-content-between align-items-start gap-2">
        <div>
          <h3 className="ho-font-epilogue fs-5 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="ho-font-grotesk fw-bold text-uppercase m-0" style={{ color: 'var(--ho-accent-gold-text)', fontSize: '11px', letterSpacing: '0.05em' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="d-flex gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Body */}
      <div className="flex-grow-1 d-flex flex-column gap-2 text-secondary small">
        {children}
      </div>
    </div>
  );
}
