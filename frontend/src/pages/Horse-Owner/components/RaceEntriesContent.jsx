import React, { useState } from 'react';

export default function RaceEntriesContent() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [formData, setFormData] = useState({
    horse: 'Midnight Runner',
    jockey: 'L. Dettori',
  });

  const races = [
    {
      name: 'Dubai World Cup',
      track: 'Dirt • Fast',
      prize: '$12,000,000',
      date: 'Mar 30, 2026',
    },
    {
      name: 'Royal Ascot',
      track: 'Turf • Good',
      prize: '£8,000,000',
      date: 'Jun 18, 2026',
    },
    {
      name: 'Kentucky Derby',
      track: 'Dirt • Fast',
      prize: '$3,000,000',
      date: 'May 04, 2026',
    },
  ];

  const handleRegisterClick = (race) => {
    setSelectedRace(race);
    setShowModal(true);
  };

  const handleConfirm = () => {
    alert(`Successfully registered ${formData.horse} with Jockey ${formData.jockey} for the ${selectedRace.name}!`);
    setShowModal(false);
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Upcoming Tournaments
          </h2>
          <p className="text-secondary small m-0">
            Register your horses for upcoming elite races.
          </p>
        </div>
      </div>

      {/* Grid of Races */}
      <div className="row g-4 mb-4">
        {races.map((race, i) => (
          <div key={i} className="col-12 col-md-4">
            <div className="glass-card glass-card-interactive d-flex flex-column h-100">
              <div className="mb-3">
                <h3 className="ho-font-epilogue fs-5 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
                  {race.name}
                </h3>
                <p className="ho-font-grotesk fw-bold text-uppercase m-0" style={{ color: 'var(--ho-accent-gold-text)', fontSize: '11px', letterSpacing: '0.05em' }}>
                  {race.date}
                </p>
              </div>
              <div className="d-flex flex-column gap-2 mb-4 flex-grow-1 text-secondary small">
                <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <span className="fw-bold text-dark">Track:</span>
                  <span>{race.track}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <span className="fw-bold text-dark">Prize Pool:</span>
                  <span className="fw-bold" style={{ color: 'var(--ho-primary-medium)' }}>{race.prize}</span>
                </div>
              </div>
              <button
                onClick={() => handleRegisterClick(race)}
                className="ho-btn ho-btn-gold-solid w-100 py-3"
              >
                Register for Race
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom animate-scale-up">
            <h3 className="ho-font-epilogue fs-4 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Register for {selectedRace?.name}
            </h3>
            
            <div className="d-flex flex-column gap-3 mb-4">
              {/* Select Horse */}
              <div>
                <label className="ho-input-label ho-font-grotesk">
                  Select Horse
                </label>
                <select
                  value={formData.horse}
                  onChange={(e) => setFormData({ ...formData, horse: e.target.value })}
                  className="ho-form-input fw-semibold"
                >
                  <option>Midnight Runner</option>
                  <option>Silver Cloud</option>
                </select>
              </div>

              {/* Select Jockey */}
              <div>
                <label className="ho-input-label ho-font-grotesk">
                  Select Jockey
                </label>
                <select
                  value={formData.jockey}
                  onChange={(e) => setFormData({ ...formData, jockey: e.target.value })}
                  className="ho-form-input fw-semibold"
                >
                  <option>L. Dettori</option>
                  <option>R. Moore</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex justify-content-end gap-3 align-items-center">
              <button
                onClick={() => setShowModal(false)}
                className="ho-btn-link text-uppercase tracking-wider small"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="ho-btn ho-btn-gold-solid py-2 px-4"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
