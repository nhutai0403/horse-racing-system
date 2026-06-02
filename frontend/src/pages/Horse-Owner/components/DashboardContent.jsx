import React from 'react';

export default function DashboardContent({ setActiveTab }) {
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
        <div className="d-flex gap-2 w-100 w-sm-auto">
          <button
            onClick={() => alert("Report exported successfully!")}
            className="ho-btn ho-btn-gold-outline flex-grow-1 flex-sm-grow-0"
          >
            Export Report
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className="ho-btn ho-btn-gold-solid flex-grow-1 flex-sm-grow-0 d-flex align-items-center justify-content-center gap-2"
          >
            <span className="material-symbols-outlined text-dark" style={{ fontSize: '18px' }}>add</span>
            Enter Race
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-4 mb-4">
        {/* Earnings Card */}
        <div className="col-12 col-md-4">
          <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100">
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '60px', color: 'var(--ho-accent-gold-text)' }}>trending_up</span>
            </div>
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Total Earnings (YTD)
            </h3>
            <p className="ho-font-epilogue fs-2 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              $1.24M
            </p>
            <div className="mt-3 d-flex align-items-center small fw-semibold text-success">
              <span className="material-symbols-outlined me-1" style={{ fontSize: '16px' }}>arrow_upward</span>
              <span>+12.5% vs last month</span>
            </div>
          </div>
        </div>

        {/* Active Roster Card */}
        <div className="col-12 col-md-4">
          <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100">
            <div className="position-absolute end-0 top-0 p-3 opacity-25">
              <span className="material-symbols-outlined" style={{ fontSize: '60px', color: 'var(--ho-accent-gold-text)' }}>pets</span>
            </div>
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              Active Roster
            </h3>
            <p className="ho-font-epilogue fs-2 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              14
            </p>
            <div className="mt-3 small text-secondary fw-semibold">
              3 in training, 11 race-ready
            </div>
          </div>
        </div>

        {/* Action Required Card */}
        <div className="col-12 col-md-4">
          <div className="glass-card h-100" style={{ backgroundColor: 'rgba(254, 214, 91, 0.12)', borderColor: 'var(--ho-accent-gold-hover)' }}>
            <h3 className="ho-font-grotesk text-uppercase fw-bold mb-3 d-flex align-items-center" style={{ fontSize: '11px', color: 'var(--ho-accent-gold-text)', letterSpacing: '0.05em' }}>
              <span className="material-symbols-outlined me-2 fs-5">warning</span>
              Action Required
            </h3>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2">
              <li className="d-flex justify-content-between align-items-center small">
                <span className="text-dark fw-semibold">Vet Approval: "Thunderbolt"</span>
                <button
                  onClick={() => alert("Redirecting to Vet approval logs")}
                  className="ho-btn-link small"
                >
                  Review
                </button>
              </li>
              <li className="d-flex justify-content-between align-items-center small">
                <span className="text-dark fw-semibold">Fee Due: Dubai Cup</span>
                <button
                  onClick={() => alert("Processing payment for Dubai Cup")}
                  className="ho-btn-link small"
                >
                  Pay Now
                </button>
              </li>
            </ul>
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
                onClick={() => setActiveTab('stable')}
                className="ho-btn-link text-uppercase tracking-wider small d-flex align-items-center"
              >
                View All
                <span className="material-symbols-outlined ms-1" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
            <div className="table-responsive">
              <table className="table ho-table align-middle m-0">
                <thead>
                  <tr>
                    <th scope="col" className="ps-2">Horse</th>
                    <th scope="col">Status</th>
                    <th scope="col">Next Race</th>
                    <th scope="col" className="text-end pe-2">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="ps-2">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle overflow-hidden me-3 border" style={{ width: '40px', height: '40px', borderColor: '#c0c9c0' }}>
                          <img
                            alt="Midnight Runner"
                            className="w-100 h-100 object-fit-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX7HoMSdMb6JPWb7leEl52QM6KQJGuBPP2NbEP9D9Bm4nVtpQ9885-X0rie7N4lV-iVulVS_70IR-XGLFP9MIq_B9-3wDKM0PWmwkIA6APdv6fDmjXjxEHJsDWZGJecnubUw1EMiBzjR-HluVcLBxG6ruPF607Aq9b8MLfl1M-hZUusD0pS8k11SHJ4CMcq5cI3E94TXxU2t2rOL5O2gFSIpz3EXAhVDMtlDOe08Nm0OXnOaYJ-zDKsGm7JWLXRL1bPqRrwXED"
                          />
                        </div>
                        <span className="fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>
                          Midnight Runner
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-custom badge-ready">
                        Race Ready
                      </span>
                    </td>
                    <td className="text-secondary fw-semibold">Ascot (May 14)</td>
                    <td className="text-end pe-2 fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>68%</td>
                  </tr>
                  <tr>
                    <td className="ps-2">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle overflow-hidden me-3 border" style={{ width: '40px', height: '40px', borderColor: '#c0c9c0' }}>
                          <img
                            alt="Silver Cloud"
                            className="w-100 h-100 object-fit-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyody69QQzixiJLWEKdQV0aaleOZAo4jb7ZhUVMIgEffv8-1JgwF6MbombNSSs-mAdSxs2agxSBNO4fTs3h3aFrBlRvjCIF6JbsJOLPxXVkUyVk4vxm6NUtz12AdgrpPM9s4FGYYpl3GkaLj9CXk0muXz_HwaijuAVr44O59NfquTTDLNpSYRY5e29u-eO1OztHyQkquE8yHRDwnvSzHgdMgmzqpk_4C9r1O5srY_eEJaIJFKSxt2B2fq1ocs_4rrpXVIzZALZ"
                          />
                        </div>
                        <span className="fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>
                          Silver Cloud
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-custom badge-training">
                        In Training
                      </span>
                    </td>
                    <td className="text-secondary fw-semibold">TBD</td>
                    <td className="text-end pe-2 fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>45%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Events Column */}
        <div className="col-12 col-lg-4">
          <div className="glass-card h-100">
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Upcoming Events
            </h3>
            <div className="ho-timeline">
              {/* Event 1 */}
              <div className="ho-timeline-item">
                <div className="ho-timeline-badge" />
                <h4 className="fw-bold fs-7 mb-1">Dubai World Cup</h4>
                <p className="text-secondary small m-0">Registration Closes</p>
                <p className="ho-font-grotesk fw-bold tracking-wide uppercase m-0 mt-1" style={{ color: 'var(--ho-accent-gold-text)', fontSize: '10px' }}>
                  Today, 17:00
                </p>
              </div>
              {/* Event 2 */}
              <div className="ho-timeline-item">
                <div className="ho-timeline-badge ho-timeline-badge-dark" />
                <h4 className="fw-bold fs-7 mb-1">Vet Inspection</h4>
                <p className="text-secondary small m-0">Dr. Harrison for "Midnight Runner"</p>
                <p className="ho-font-grotesk fw-bold tracking-wide uppercase m-0 mt-1" style={{ color: 'var(--ho-primary-dark)', fontSize: '10px' }}>
                  Tomorrow, 09:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
