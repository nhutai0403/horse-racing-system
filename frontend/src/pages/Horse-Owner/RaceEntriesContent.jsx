import { useState } from 'react';
import { createPortal } from 'react-dom';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import { useHorseOwner } from './HorseOwnerContext';

export default function RaceEntriesContent() {
  const { horses = [], systemUsers = [], tournaments = [], setTournaments } = useHorseOwner();
  const [showModal, setShowModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [formData, setFormData] = useState({
    horse: '',
    jockey: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filter only READY horses
  const readyHorses = horses.filter(h => h.status === 'READY');
  // Filter only jockeys who are friends
  const friendJockeys = systemUsers.filter(u => u.role === 'JOCKEY' && u.friendStatus === 'FRIEND');

  const handleRegisterClick = (race) => {
    setSelectedRace(race);
    setFormData({
      horse: readyHorses.length > 0 ? readyHorses[0].name : '',
      jockey: friendJockeys.length > 0 ? friendJockeys[0].fullName : '',
    });
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (!formData.horse || !formData.jockey) {
      alert("Please select both a horse and a jockey.");
      return;
    }
    
    // Add horse to the registered list for this tournament
    setTournaments(prevTournaments => 
      prevTournaments.map(t => 
        t.id === selectedRace.id 
          ? { ...t, registeredHorses: [...(t.registeredHorses || []), formData.horse] }
          : t
      )
    );

    setSuccessMsg(`Successfully registered ${formData.horse} with Jockey ${formData.jockey} for the ${selectedRace.tournamentName}!`);
    setShowModal(false);
    setShowSuccessModal(true);
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
        {tournaments.map((race, i) => {
          const userRegisteredHorses = horses.filter(h => race.registeredHorses?.includes(h.name));
          const isRegistered = userRegisteredHorses.length > 0;
          return (
            <div key={race.id || i} className="col-12 col-md-4">
              <DataCard 
                title={race.tournamentName} 
                subtitle={`${race.date} at ${race.time}`}
                interactive={true}
              >
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Location:</span>
                    <span className="text-end text-truncate ms-2" style={{ maxWidth: '150px' }}>{race.location}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Track:</span>
                    <span>{race.trackType}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Prize Pool:</span>
                    <span className="fw-bold" style={{ color: 'var(--ho-primary-medium)' }}>{race.prizePool}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 align-items-center">
                    <span className="fw-bold text-dark">Status:</span>
                    <StatusBadge status={isRegistered ? 'READY' : race.status} />
                  </div>
                </div>

                <button
                  onClick={() => handleRegisterClick(race)}
                  className={`ho-btn ${isRegistered ? 'ho-btn-dark-green' : 'ho-btn-gold-solid'} w-100 py-2 fw-bold`}
                  disabled={isRegistered || race.status !== 'OPEN_FOR_REGISTER'}
                >
                  {isRegistered 
                    ? `Registered: ${userRegisteredHorses.map(h => h.name).join(', ')}` 
                    : race.status === 'OPEN_FOR_REGISTER' 
                      ? 'Register for Race' 
                      : 'Registration Closed'}
                </button>
              </DataCard>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {showModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1050 }} onClick={() => setShowModal(false)}>
          <div className="modal-content-custom animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="ho-font-epilogue fs-4 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Register for {selectedRace?.tournamentName}
            </h3>
            
            <div className="d-flex flex-column gap-4 mb-4">
              {/* Select Horse */}
              <div>
                <label className="ho-input-label ho-font-grotesk">
                  Select Horse <span className="text-secondary small fw-normal">(Only READY horses)</span>
                </label>
                <select
                  value={formData.horse}
                  onChange={(e) => setFormData({ ...formData, horse: e.target.value })}
                  className="ho-form-input fw-semibold text-dark"
                >
                  {readyHorses.length === 0 && <option value="">No ready horses available</option>}
                  {readyHorses.map(h => (
                    <option key={h.id} value={h.name}>{h.name} ({h.breed})</option>
                  ))}
                </select>
              </div>

              {/* Select Jockey */}
              <div>
                <label className="ho-input-label ho-font-grotesk">
                  Select Jockey <span className="text-secondary small fw-normal">(Only Friend Jockeys)</span>
                </label>
                <select
                  value={formData.jockey}
                  onChange={(e) => setFormData({ ...formData, jockey: e.target.value })}
                  className="ho-form-input fw-semibold text-dark"
                >
                  {friendJockeys.length === 0 && <option value="">No friend jockeys available</option>}
                  {friendJockeys.map(j => (
                    <option key={j.id} value={j.fullName}>{j.fullName} (Win Rate: {j.winRate}%)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex justify-content-end gap-3 align-items-center">
              <button
                onClick={() => setShowModal(false)}
                className="ho-btn-link text-uppercase tracking-wider small fw-bold"
                style={{ textDecoration: 'none' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="ho-btn ho-btn-gold-solid py-2 px-4 fw-bold"
                disabled={readyHorses.length === 0 || friendJockeys.length === 0}
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Registration Success Modal Dialog */}
      {showSuccessModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1050 }} onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content-custom animate-scale-up text-center" style={{ maxWidth: '450px', padding: '2.5rem 2rem' }} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined text-success mb-3" style={{ fontSize: '48px' }}>
              check_circle
            </span>
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-2" style={{ color: 'var(--ho-primary-dark)' }}>
              Registration Successful
            </h3>
            <p className="text-secondary small fw-medium mb-4" style={{ lineHeight: '1.5' }}>
              {successMsg}
            </p>
            
            <div className="d-flex justify-content-center pt-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="ho-btn ho-btn-gold-solid py-2 px-5 fw-bold text-uppercase"
                style={{ fontSize: '12px', letterSpacing: '0.5px' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
