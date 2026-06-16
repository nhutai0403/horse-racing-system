import React, { useState, useEffect } from 'react';
import { getViolationsAPI, reportViolationAPI, getCompletedRacesAPI } from '../../services/referee';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilterRace, setSelectedFilterRace] = useState('All');
  
  const [formData, setFormData] = useState({
    raceName: '',
    horseName: '',
    jockeyName: '',
    violationType: 'Illegal Blocking',
    isBlacklist: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }

  useEffect(() => {
    fetchViolations();
    fetchRaces();
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const data = await getViolationsAPI();
      setViolations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRaces = async () => {
    try {
      const data = await getCompletedRacesAPI();
      setRaces(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.raceName || !formData.horseName || !formData.jockeyName) {
      setNotification({
        type: 'error',
        message: 'Please fill out all required fields, including the Race Name.'
      });
      return;
    }
    setSubmitting(true);
    try {
      const newViolation = await reportViolationAPI(formData);
      setViolations(prev => [newViolation, ...prev]);
      setFormData({
        raceName: '',
        horseName: '',
        jockeyName: '',
        violationType: 'Illegal Blocking',
        isBlacklist: false
      });
      setNotification({
        type: 'success',
        message: `Violation for "${newViolation.horseName}" in "${newViolation.raceName}" has been successfully logged.`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to report violation: ${err.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'raceName', label: 'Race', render: (item) => <span className="fw-semibold text-secondary small">{item.raceName || 'N/A'}</span> },
    { key: 'horseName', label: 'Horse Name', render: (item) => <span className="fw-bold">{item.horseName}</span> },
    { key: 'jockeyName', label: 'Jockey Name' },
    { key: 'violationType', label: 'Violation Type' },
    { 
      key: 'status', 
      label: 'Status', 
      align: 'center',
      render: (item) => <StatusBadge status={item.status} /> 
    }
  ];

  // Filter violations based on selected dropdown filter
  const filteredViolations = selectedFilterRace === 'All'
    ? violations
    : violations.filter(v => v.raceName === selectedFilterRace);

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Violations & Flags</h2>
            <p className="text-secondary small m-0">Report and manage race infractions.</p>
          </div>
          <div className="d-flex align-items-center gap-2" style={{ minWidth: '280px' }}>
            <label className="text-secondary small mb-0 fw-bold" style={{ whiteSpace: 'nowrap' }}>Filter by Race:</label>
            <select 
              className="form-select text-dark fw-bold border"
              value={selectedFilterRace}
              onChange={(e) => setSelectedFilterRace(e.target.value)}
              style={{ backgroundColor: '#ffffff' }}
            >
              <option value="All">All Races</option>
              {races.map(r => (
                <option key={r.id} value={r.raceName}>{r.raceName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row g-4">
          {/* Report Form */}
          <div className="col-12 col-md-4">
            <div className="glass-card">
              <h4 className="ho-font-epilogue fs-5 fw-bold text-dark mb-4">Report Infraction</h4>
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="ho-input-label ho-font-grotesk">Race Name</label>
                  <select 
                    name="raceName" 
                    value={formData.raceName} 
                    onChange={handleInputChange} 
                    className="ho-form-input text-dark fw-bold"
                    required
                  >
                    <option value="">Select a race...</option>
                    {races.map(r => (
                      <option key={r.id} value={r.raceName}>{r.raceName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ho-input-label ho-font-grotesk">Horse Name</label>
                  <input 
                    type="text" 
                    name="horseName" 
                    value={formData.horseName} 
                    onChange={handleInputChange} 
                    className="ho-form-input text-dark" 
                    placeholder="e.g. Desert Wind" 
                    required 
                  />
                </div>
                <div>
                  <label className="ho-input-label ho-font-grotesk">Jockey Name</label>
                  <input 
                    type="text" 
                    name="jockeyName" 
                    value={formData.jockeyName} 
                    onChange={handleInputChange} 
                    className="ho-form-input text-dark" 
                    placeholder="e.g. John Doe" 
                    required 
                  />
                </div>
                <div>
                  <label className="ho-input-label ho-font-grotesk">Violation Type</label>
                  <select 
                    name="violationType" 
                    value={formData.violationType} 
                    onChange={handleInputChange} 
                    className="ho-form-input text-dark fw-bold"
                  >
                    <option value="Illegal Blocking">Illegal Blocking</option>
                    <option value="Dangerous Riding">Dangerous Riding</option>
                    <option value="Whip Violation">Whip Violation</option>
                    <option value="Weight Tampering">Weight Tampering</option>
                  </select>
                </div>
                <div className="form-check mt-2">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    name="isBlacklist" 
                    id="isBlacklist" 
                    checked={formData.isBlacklist} 
                    onChange={handleInputChange} 
                  />
                  <label className="form-check-label fw-bold text-danger" htmlFor="isBlacklist">
                    Recommend Permanent Ban (Blacklist)
                  </label>
                </div>
                <div className="mt-2 text-end">
                  <button type="submit" className="ho-btn ho-btn-gold-solid w-100 py-2 fw-bold" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* History Table */}
          <div className="col-12 col-md-8">
            <div className="glass-card h-100">
              <h4 className="ho-font-epilogue fs-5 fw-bold text-dark mb-4">Violation History</h4>
              {loading ? (
                <div className="text-secondary">Loading history...</div>
              ) : (
                <DataTable columns={columns} data={filteredViolations} emptyMessage="No violations recorded for this race." />
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
