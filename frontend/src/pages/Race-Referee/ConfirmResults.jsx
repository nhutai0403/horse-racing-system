import React, { useState, useEffect } from 'react';
import { getCompletedRacesAPI, getRaceResultsAPI, confirmRaceResultsAPI } from '../../services/referee';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function ConfirmResults() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    setLoading(true);
    try {
      const data = await getCompletedRacesAPI();
      setRaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (race) => {
    setSelectedRace(race);
    setLoadingResults(true);
    try {
      const data = await getRaceResultsAPI(race.id);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedRace) return;
    try {
      await confirmRaceResultsAPI(selectedRace.id);
      setNotification({
        type: 'success',
        message: `Results for "${selectedRace.raceName}" have been successfully confirmed and authorized. Prize money is being distributed.`
      });
      setRaces(prev => prev.filter(r => r.id !== selectedRace.id));
      setSelectedRace(null);
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to confirm results: ${err.message}`
      });
    }
  };

  const raceColumns = [
    { key: 'raceName', label: 'Race Name', render: (item) => <span className="fw-bold">{item.raceName}</span> },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
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
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleViewResults(item)}
        >
          View Results
        </button>
      )
    }
  ];

  const resultColumns = [
    { key: 'rank', label: 'Rank', align: 'center', render: (item) => <span className={`fw-bold ${item.rank === 1 ? 'text-warning' : ''}`}>#{item.rank}</span> },
    { key: 'horseName', label: 'Horse Name', render: (item) => <span className="fw-bold">{item.horseName}</span> },
    { key: 'jockeyName', label: 'Jockey Name' },
    { key: 'time', label: 'Finish Time', align: 'center' }
  ];

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="mb-4">
          <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Confirm Results</h2>
          <p className="text-secondary small">Review race outcomes and authorize prize distribution.</p>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="glass-card">
              <h4 className="ho-font-epilogue fs-5 fw-bold text-dark mb-3">Completed Races</h4>
              {loading ? (
                <div className="text-secondary">Loading...</div>
              ) : (
                <DataTable columns={raceColumns} data={races} emptyMessage="No completed races pending confirmation." />
              )}
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="glass-card h-100">
              <h4 className="ho-font-epilogue fs-5 fw-bold text-dark mb-3">Race Results</h4>
              {!selectedRace ? (
                <div className="text-secondary fst-italic text-center py-5 border rounded bg-light">
                  Select a race from the left to view its results.
                </div>
              ) : loadingResults ? (
                <div className="text-secondary">Loading results...</div>
              ) : (
                <div>
                  <h5 className="text-primary mb-3">{selectedRace.raceName}</h5>
                  <DataTable columns={resultColumns} data={results} emptyMessage="No results available." />
                  <div className="mt-4 text-end">
                    <button className="ho-btn ho-btn-gold-solid py-2 px-4" onClick={handleConfirm}>
                      Confirm & Distribute Prizes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
              {notification.type === 'success' ? 'Confirmation Success' : 'Action Failed'}
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
