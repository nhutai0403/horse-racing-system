import React, { useState } from 'react';

export default function StableContent({ horses = [], setHorses }) {
  const [selectedHorseId, setSelectedHorseId] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newHorseData, setNewHorseData] = useState({
    name: '',
    age: '',
    gender: 'Gelding',
    sire: '',
    dam: '',
    status: 'Race Ready',
    speed: 50,
    stamina: 50,
    gatePerformance: 50,
  });

  const activeHorseId = selectedHorseId || horses[0]?.id;
  const selectedHorse = horses.find((h) => h.id === activeHorseId) || horses[0];

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newHorseData.name.trim()) {
      alert('Please enter a horse name.');
      return;
    }
    const ageNum = parseInt(newHorseData.age);
    if (isNaN(ageNum) || ageNum <= 0) {
      alert('Please enter a valid age.');
      return;
    }

    const newId = `H${String(horses.length + 1).padStart(3, '0')}`;
    const newHorse = {
      id: newId,
      name: newHorseData.name.trim(),
      age: ageNum,
      gender: newHorseData.gender,
      sire: newHorseData.sire.trim() || 'Unknown',
      dam: newHorseData.dam.trim() || 'Unknown',
      status: newHorseData.status,
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&auto=format&fit=crop&q=60',
      metrics: {
        speed: parseInt(newHorseData.speed) || 50,
        stamina: parseInt(newHorseData.stamina) || 50,
        gatePerformance: parseInt(newHorseData.gatePerformance) || 50,
      },
      medicalLogs: [
        {
          id: 1,
          desc: 'Initial Stable Registration',
          date: new Date().toISOString().split('T')[0],
          status: 'Cleared'
        }
      ]
    };

    setHorses((prev) => [...prev, newHorse]);
    setSelectedHorseId(newId);

    // Reset and close
    setNewHorseData({
      name: '',
      age: '',
      gender: 'Gelding',
      sire: '',
      dam: '',
      status: 'Race Ready',
      speed: 50,
      stamina: 50,
      gatePerformance: 50,
    });
    setShowRegisterModal(false);
  };

  const horseImg = selectedHorse?.image || selectedHorse?.img || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&auto=format&fit=crop&q=60';
  const detailsText = selectedHorse
    ? `${selectedHorse.age}yo ${selectedHorse.gender} • Sire: ${selectedHorse.sire || 'Unknown'} • Dam: ${selectedHorse.dam || 'Unknown'}`
    : '';

  const horseMetrics = selectedHorse
    ? [
        { label: 'Speed', val: selectedHorse.metrics?.speed || 0, color: 'var(--ho-primary-dark)' },
        { label: 'Stamina', val: selectedHorse.metrics?.stamina || 0, color: 'var(--ho-accent-gold-text)' },
        { label: 'Gate Performance', val: selectedHorse.metrics?.gatePerformance || 0, color: 'var(--ho-primary-medium)' }
      ]
    : [];

  const logs = selectedHorse?.medicalLogs || selectedHorse?.medical || [];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <div className="row g-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* Left Roster list */}
        <div className="col-12 col-md-5 d-flex flex-column">
          <div className="glass-card d-flex flex-column h-100 overflow-y-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="ho-font-epilogue fs-4 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                Stable Roster
              </h2>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="ho-btn ho-btn-gold-solid py-1.5 px-3 d-flex align-items-center gap-1"
                style={{ fontSize: '11px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                Add Horse
              </button>
            </div>
            
            <div className="d-flex flex-column gap-2 flex-grow-1">
              {horses.map((horse) => {
                const isSelected = horse.id === activeHorseId;
                const imgUrl = horse.image || horse.img || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&auto=format&fit=crop&q=60';
                return (
                  <div
                    key={horse.id}
                    onClick={() => setSelectedHorseId(horse.id)}
                    className="d-flex align-items-center p-3 rounded border cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected ? 'rgba(0, 56, 32, 0.08)' : 'transparent',
                      borderColor: isSelected ? 'var(--ho-primary-dark)' : 'transparent',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease'
                    }}
                  >
                    <div className="rounded-circle overflow-hidden me-3 border" style={{ width: '48px', height: '48px', borderColor: '#c0c9c0', flexShrink: 0 }}>
                      <img
                        src={imgUrl}
                        alt={horse.name}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="fw-bold m-0" style={{ color: 'var(--ho-primary-dark)', fontSize: '14px' }}>{horse.name}</h4>
                      <span className={`badge-custom mt-1 ${
                        horse.status === 'Race Ready' ? 'badge-ready' : horse.status === 'In Training' ? 'badge-training' : 'badge-recovery'
                      }`}>
                        {horse.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Details panel */}
        <div className="col-12 col-md-7">
          {selectedHorse ? (
            <div className="glass-card h-100 overflow-y-auto">
              {/* Header */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 border-bottom pb-4 mb-4" style={{ borderColor: 'var(--ho-border-muted)' }}>
                <div>
                  <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
                    {selectedHorse.name}
                  </h2>
                  <p className="text-secondary ho-font-grotesk fw-bold text-uppercase m-0" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                    {detailsText}
                  </p>
                </div>
                <button
                  onClick={() => alert(`Assigning Jockey to ${selectedHorse.name}`)}
                  className="ho-btn ho-btn-gold-outline d-flex align-items-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                  Assign Jockey
                </button>
              </div>

              {/* Metrics & Logs */}
              <div className="d-flex flex-column gap-4">
                {/* Performance Gauges */}
                <div>
                  <h3 className="ho-font-epilogue fs-6 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>
                    Performance Metrics
                  </h3>
                  <div className="d-flex flex-column gap-3">
                    {horseMetrics.map((metric, i) => (
                      <div key={i}>
                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span>{metric.label}</span>
                          <span>{metric.val}/100</span>
                        </div>
                        <div className="progress" style={{ height: '8px', backgroundColor: '#f0eded' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${metric.val}%`,
                              backgroundColor: metric.color
                            }}
                            aria-valuenow={metric.val}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Logs */}
                <div>
                  <h3 className="ho-font-epilogue fs-6 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>
                    Medical Logs
                  </h3>
                  <div className="border rounded p-3 d-flex flex-column gap-2" style={{ backgroundColor: 'var(--ho-bg-cream)', borderColor: 'var(--ho-border-muted)' }}>
                    {logs.length > 0 ? (
                      logs.map((log, i) => (
                        <div
                          key={log.id || i}
                          className="d-flex justify-content-between align-items-center small pb-2 border-bottom"
                          style={{ borderColor: 'rgba(0,0,0,0.05)' }}
                        >
                          <span className="text-dark fw-bold">{log.desc}</span>
                          <span className="text-secondary fw-semibold">
                            {log.date}{log.status ? ` - ${log.status}` : ''}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-secondary small italic py-2 text-center">No medical records available.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card h-100 d-flex align-items-center justify-content-center text-secondary italic">
              Select a horse to view details.
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal Dialog */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom animate-scale-up" style={{ maxWidth: '550px' }}>
            <h3 className="ho-font-epilogue fs-4 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Add New Horse
            </h3>
            
            <form onSubmit={handleRegisterSubmit}>
              <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
                {/* Horse Name */}
                <div>
                  <label className="ho-input-label ho-font-grotesk">Horse Name</label>
                  <input
                    type="text"
                    required
                    value={newHorseData.name}
                    onChange={(e) => setNewHorseData({ ...newHorseData, name: e.target.value })}
                    className="ho-form-input text-dark"
                    placeholder="e.g. Pegasus Gold"
                  />
                </div>

                {/* Age & Gender */}
                <div className="row g-3">
                  <div className="col-6">
                    <label className="ho-input-label ho-font-grotesk">Age (Years)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="30"
                      value={newHorseData.age}
                      onChange={(e) => setNewHorseData({ ...newHorseData, age: e.target.value })}
                      className="ho-form-input text-dark"
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div className="col-6">
                    <label className="ho-input-label ho-font-grotesk">Gender</label>
                    <select
                      value={newHorseData.gender}
                      onChange={(e) => setNewHorseData({ ...newHorseData, gender: e.target.value })}
                      className="ho-form-input text-dark fw-bold"
                    >
                      <option value="Gelding">Gelding</option>
                      <option value="Colt">Colt</option>
                      <option value="Stallion">Stallion</option>
                      <option value="Mare">Mare</option>
                    </select>
                  </div>
                </div>

                {/* Sire & Dam */}
                <div className="row g-3">
                  <div className="col-6">
                    <label className="ho-input-label ho-font-grotesk">Sire (Father)</label>
                    <input
                      type="text"
                      value={newHorseData.sire}
                      onChange={(e) => setNewHorseData({ ...newHorseData, sire: e.target.value })}
                      className="ho-form-input text-dark"
                      placeholder="e.g. Northern Dancer"
                    />
                  </div>
                  <div className="col-6">
                    <label className="ho-input-label ho-font-grotesk">Dam (Mother)</label>
                    <input
                      type="text"
                      value={newHorseData.dam}
                      onChange={(e) => setNewHorseData({ ...newHorseData, dam: e.target.value })}
                      className="ho-form-input text-dark"
                      placeholder="e.g. Wind Runner"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="ho-input-label ho-font-grotesk">Status</label>
                  <select
                    value={newHorseData.status}
                    onChange={(e) => setNewHorseData({ ...newHorseData, status: e.target.value })}
                    className="ho-form-input text-dark fw-bold"
                  >
                    <option value="Race Ready">Race Ready</option>
                    <option value="In Training">In Training</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>

                {/* Performance Metrics */}
                <div className="border-top pt-3 mt-2">
                  <h4 className="ho-font-epilogue fs-6 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>
                    Initial Performance Ratings
                  </h4>
                  
                  <div className="d-flex flex-column gap-3">
                    {/* Speed */}
                    <div>
                      <div className="d-flex justify-content-between small fw-bold mb-1">
                        <span>Speed</span>
                        <span>{newHorseData.speed}/100</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={newHorseData.speed}
                        onChange={(e) => setNewHorseData({ ...newHorseData, speed: e.target.value })}
                        className="form-range"
                        style={{ accentColor: 'var(--ho-primary-dark)' }}
                      />
                    </div>

                    {/* Stamina */}
                    <div>
                      <div className="d-flex justify-content-between small fw-bold mb-1">
                        <span>Stamina</span>
                        <span>{newHorseData.stamina}/100</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={newHorseData.stamina}
                        onChange={(e) => setNewHorseData({ ...newHorseData, stamina: e.target.value })}
                        className="form-range"
                        style={{ accentColor: 'var(--ho-accent-gold-text)' }}
                      />
                    </div>

                    {/* Gate Performance */}
                    <div>
                      <div className="d-flex justify-content-between small fw-bold mb-1">
                        <span>Gate Performance</span>
                        <span>{newHorseData.gatePerformance}/100</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={newHorseData.gatePerformance}
                        onChange={(e) => setNewHorseData({ ...newHorseData, gatePerformance: e.target.value })}
                        className="form-range"
                        style={{ accentColor: 'var(--ho-primary-medium)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex justify-content-end gap-3 align-items-center border-top pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="ho-btn-link text-uppercase tracking-wider small"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ho-btn ho-btn-gold-solid py-2 px-4"
                >
                  Add Horse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
