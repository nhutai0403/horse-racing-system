import React, { useState, useEffect } from 'react';
import { getHorsesToInspectAPI, updateHorseInspectionStatusAPI } from '../../services/referee';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function PreRaceCheck() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }

  useEffect(() => {
    fetchHorses();
  }, []);

  const fetchHorses = async () => {
    setLoading(true);
    try {
      const data = await getHorsesToInspectAPI();
      setHorses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      await updateHorseInspectionStatusAPI(id, newStatus);
      setHorses(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
      
      const targetHorse = horses.find(h => h.id === id);
      setNotification({
        type: 'success',
        message: `Inspection status for "${targetHorse ? targetHorse.horseName : 'Horse'}" updated to ${newStatus}.`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to update status: ${err.message}`
      });
    }
  };

  const columns = [
    { key: 'horseName', label: 'Horse Name', render: (item) => <span className="fw-bold">{item.horseName}</span> },
    { key: 'breed', label: 'Breed' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'weight', label: 'Weight', render: (item) => `${item.weight} kg`, align: 'center' },
    { key: 'raceName', label: 'Race' },
    { 
      key: 'status', 
      label: 'Status', 
      align: 'center',
      render: (item) => <StatusBadge status={item.status} /> 
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (item) => (
        <div className="d-flex justify-content-center gap-2">
          <button 
            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
            disabled={item.status !== 'PENDING_INSPECTION'}
            onClick={() => handleAction(item.id, 'approve')}
            title="Approve"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
          </button>
          <button 
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            disabled={item.status !== 'PENDING_INSPECTION'}
            onClick={() => handleAction(item.id, 'reject')}
            title="Reject"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="mb-4">
          <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Pre-Race Check</h2>
          <p className="text-secondary small">Verify horses and jockeys conditions before allowing them into the race.</p>
        </div>

        <div className="glass-card">
          {loading ? (
            <div className="p-4 text-secondary">Loading...</div>
          ) : (
            <DataTable columns={columns} data={horses} emptyMessage="No horses pending inspection." />
          )}
        </div>
      </div>

      {notification && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setNotification(null)}>
          <div className="modal-content-custom animate-scale-up text-center p-4" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <span 
              className="material-symbols-outlined mb-2" 
              style={{ 
                fontSize: '56px', 
                color: notification.type === 'success' ? 'var(--ho-primary-medium)' : 'var(--ho-error-text)' 
              }}
            >
              {notification.type === 'success' ? 'verified' : 'error'}
            </span>
            <h3 className="ho-font-epilogue fs-5 fw-bold text-dark mb-2">
              {notification.type === 'success' ? 'Success' : 'Action Failed'}
            </h3>
            <p className="text-secondary small mb-4">{notification.message}</p>
            <button 
              className={`ho-btn ${notification.type === 'success' ? 'ho-btn-gold-solid' : 'ho-btn-outline-danger'} w-100 py-2`} 
              onClick={() => setNotification(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
