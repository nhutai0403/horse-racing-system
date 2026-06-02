import React from 'react';

export default function FinancialsContent() {
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
              Total Revenue
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              $1.24M
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Entry Fees
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0 text-danger">
              -$85K
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Net Profit
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0 text-success">
              $1.15M
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Pending Payouts
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0" style={{ color: 'var(--ho-accent-gold-text)' }}>
              $42K
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card">
        <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
          Recent Transactions
        </h3>
        <div className="table-responsive">
          <table className="table ho-table align-middle m-0">
            <thead>
              <tr>
                <th scope="col" className="ps-2">Date</th>
                <th scope="col">Horse</th>
                <th scope="col">Event</th>
                <th scope="col">Placement</th>
                <th scope="col" className="text-end pe-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ps-2 text-secondary fw-semibold">Oct 14, 2025</td>
                <td className="fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>Midnight Runner</td>
                <td>Belmont Stakes</td>
                <td>
                  <span className="fw-bold" style={{ color: 'var(--ho-accent-gold-text)' }}>1st</span>
                </td>
                <td className="text-end pe-2 fw-bold text-success">+$450,000</td>
              </tr>
              <tr>
                <td className="ps-2 text-secondary fw-semibold">Sep 02, 2025</td>
                <td className="fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>Silver Cloud</td>
                <td>Travers Stakes Entry</td>
                <td className="text-secondary">-</td>
                <td className="text-end pe-2 fw-bold text-danger">-$15,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
