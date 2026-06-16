import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompletedRacesAPI, reportViolationAPI, saveSimulatedRaceAPI } from '../../services/referee';

export default function LiveSimulation() {
  const navigate = useNavigate();

  // Using dummy horses for simulation since API isn't fully returning ongoing participants yet
  const initialHorses = [
    { id: 1, name: 'Lightning Bolt', progress: 0, color: 'bg-primary', flaggedPositions: [] },
    { id: 2, name: 'Desert Wind', progress: 0, color: 'bg-success', flaggedPositions: [] },
    { id: 3, name: 'Midnight Star', progress: 0, color: 'bg-danger', flaggedPositions: [] },
    { id: 4, name: 'Stormbreaker', progress: 0, color: 'bg-warning', flaggedPositions: [] },
  ];

  const [horses, setHorses] = useState(initialHorses);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);
  
  // Custom Modals State
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [finalPodium, setFinalPodium] = useState([]);
  const [simulatedRaceName, setSimulatedRaceName] = useState('');

  const [selectedHorseForFlag, setSelectedHorseForFlag] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [clickedProgress, setClickedProgress] = useState(null);

  useEffect(() => {
    let interval;
    if (isRunning && !finished) {
      interval = setInterval(() => {
        setHorses(prev => {
          let allFinished = true;
          const nextHorses = prev.map(h => {
            if (h.progress < 100) {
              // High variability: advance random amount between 0.5% and 8%
              const advance = 0.5 + Math.random() * 7.5;
              const newProgress = Math.min(100, h.progress + advance);
              if (newProgress < 100) allFinished = false;
              
              let finishedTime = h.finishedTime;
              if (newProgress === 100 && !h.finishedTime) {
                finishedTime = Date.now();
              }
              return { ...h, progress: newProgress, finishedTime };
            }
            return h;
          });
          if (allFinished) {
            setIsRunning(false);
            setFinished(true);
          }
          return nextHorses;
        });
      }, 400); // slightly faster update ticks for smoother animation
    }
    return () => clearInterval(interval);
  }, [isRunning, finished]);

  // Pre-generate initial race name on mount
  useEffect(() => {
    const newRaceId = Date.now();
    setSimulatedRaceName(`Simulated Race #${Math.floor(newRaceId / 1000) % 1000}`);
  }, []);

  // Handle saving race results to localStorage when finished
  useEffect(() => {
    if (finished && !resultsSaved) {
      // Sort horses to calculate ranks
      const sorted = [...horses].sort((a, b) => (a.finishedTime || 0) - (b.finishedTime || 0));
      const results = sorted.map((h, index) => ({
        rank: index + 1,
        horseName: h.name,
        jockeyName: 'Jockey ' + h.id,
        time: `1m ${15 + index * 2}s`
      }));
      
      const newRaceId = Date.now();
      const newRace = {
        id: newRaceId,
        raceName: simulatedRaceName,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'FINISHED'
      };
      
      saveSimulatedRaceAPI(newRace, results).then(() => {
        setResultsSaved(true);
        setFinalPodium(results);
        setShowResultsSummary(true);
      }).catch(err => {
        console.error('Failed to save simulated race', err);
      });
    }
  }, [finished, horses, resultsSaved, simulatedRaceName]);

  const handleStart = () => {
    if (finished) {
      // Reset
      setHorses(initialHorses);
      setFinished(false);
      setResultsSaved(false);
      
      const newRaceId = Date.now();
      setSimulatedRaceName(`Simulated Race #${Math.floor(newRaceId / 1000) % 1000}`);
    }
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleFlagClick = (horse) => {
    setClickedProgress(Math.round(horse.progress));
    setSelectedHorseForFlag(horse);
    setShowFlagModal(true);
  };

  const handleLaneClick = (e, horse) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = (clickX / rect.width) * 100;
    const progress = Math.max(0, Math.min(100, progressPercent));
    setClickedProgress(Math.round(progress));
    setSelectedHorseForFlag(horse);
    setShowFlagModal(true);
  };

  const submitFlag = async () => {
    if (!flagReason) return;
    try {
      const position = clickedProgress !== null ? clickedProgress : Math.round(selectedHorseForFlag.progress);
      await reportViolationAPI({
        raceName: simulatedRaceName,
        horseName: selectedHorseForFlag.name,
        jockeyName: 'Unknown',
        violationType: `${flagReason} (at ${position}%)`,
        isBlacklist: false
      });
      
      setHorses(prev => prev.map(h => {
        if (h.id === selectedHorseForFlag.id) {
          return {
            ...h,
            flaggedPositions: [...(h.flaggedPositions || []), position]
          };
        }
        return h;
      }));

      setShowFlagModal(false);
      setFlagReason('');
      setClickedProgress(null);
    } catch (err) {
      alert('Failed to flag: ' + err.message);
    }
  };

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Live Simulation</h2>
            <p className="text-secondary small">Monitor the ongoing race and issue flags in real-time.</p>
          </div>
          <div className="d-flex gap-2">
            {!isRunning ? (
              <button className="ho-btn ho-btn-gold-solid py-2 px-4" onClick={handleStart}>
                {finished ? 'Restart Simulation' : 'Start Simulation'}
              </button>
            ) : (
              <button className="ho-btn ho-btn-outline-danger py-2 px-4" onClick={handleStop}>
                Pause Simulation
              </button>
            )}
          </div>
        </div>

        <div className="glass-card mb-4 p-4">
          <h4 className="ho-font-epilogue fs-5 fw-bold text-dark mb-4">Race Track</h4>
          <div className="d-flex flex-column gap-3">
            {horses.map(horse => (
              <div key={horse.id} className="d-flex align-items-center gap-3">
                <div style={{ width: '120px' }} className="fw-bold text-dark text-truncate" title={horse.name}>
                  {horse.name}
                </div>
                <div 
                  className="flex-grow-1 position-relative overflow-hidden" 
                  style={{ 
                    height: '50px', 
                    backgroundColor: '#efebe9', 
                    border: '2px solid #d7ccc8', 
                    borderRadius: '25px',
                    padding: '0 15px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleLaneClick(e, horse)}
                >
                  {/* Dashed center lane divider */}
                  <div 
                    className="position-absolute w-100" 
                    style={{ top: '50%', borderTop: '1px dashed #b0bec5', left: 0 }}
                  ></div>

                  {/* Finish Line Checkered Pattern */}
                  <div 
                    className="position-absolute h-100" 
                    style={{ 
                      right: '50px', 
                      width: '12px', 
                      backgroundImage: 'repeating-linear-gradient(45deg, #2c2c2c, #2c2c2c 4px, #ffffff 4px, #ffffff 8px)',
                      top: 0,
                      opacity: 0.6
                    }}
                  ></div>

                  {/* Flags dropped along the track */}
                  {horse.flaggedPositions && horse.flaggedPositions.map((pos, index) => (
                    <div
                      key={index}
                      className="position-absolute"
                      style={{
                        left: `calc(${pos}% - ${pos * 0.55}px)`,
                        top: '20%',
                        fontSize: '20px',
                        zIndex: 1,
                        pointerEvents: 'none',
                        userSelect: 'none'
                      }}
                    >
                      🚩
                    </div>
                  ))}

                  {/* Animated Horse Emoji */}
                  <div 
                    className="position-absolute" 
                    style={{ 
                      left: `calc(${horse.progress}% - ${horse.progress * 0.55}px)`, 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      transition: 'left 0.5s linear', 
                      fontSize: '28px',
                      zIndex: 2,
                      userSelect: 'none'
                    }}
                  >
                    🏇
                  </div>

                  {/* Progress display */}
                  <div 
                    className="position-absolute fw-bold text-secondary"
                    style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}
                  >
                    {Math.round(horse.progress)}%
                  </div>
                </div>
                <button 
                  className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  onClick={() => handleFlagClick(horse)}
                  title="Flag this horse"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>flag</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFlagModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => { setShowFlagModal(false); setClickedProgress(null); }}>
          <div className="modal-content-custom animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="fs-5 fw-bold mb-3 text-dark">Flag Violation</h3>
            <p className="mb-2">Horse: <strong>{selectedHorseForFlag?.name}</strong></p>
            <p className="mb-3 text-secondary small">Flag Position: <strong>{clickedProgress}%</strong> along the track</p>
            <div className="mb-3">
              <label className="form-label">Reason for Flagging</label>
              <select 
                className="form-select" 
                value={flagReason} 
                onChange={(e) => setFlagReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="Illegal Blocking">Illegal Blocking</option>
                <option value="Dangerous Riding">Dangerous Riding</option>
                <option value="Whip Violation">Whip Violation</option>
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => { setShowFlagModal(false); setClickedProgress(null); }}>Cancel</button>
              <button className="btn btn-danger" onClick={submitFlag} disabled={!flagReason}>Submit Flag</button>
            </div>
          </div>
        </div>
      )}

      {showResultsSummary && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowResultsSummary(false)}>
          <div className="modal-content-custom animate-scale-up text-center p-4" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined text-warning mb-2" style={{ fontSize: '64px' }}>
              emoji_events
            </span>
            <h3 className="ho-font-epilogue fs-4 fw-bold text-dark mb-1">Race Completed!</h3>
            <p className="text-secondary small mb-4">{simulatedRaceName}</p>

            {/* Podium List */}
            <div className="d-flex flex-column gap-2 mb-4 text-start">
              {finalPodium.slice(0, 3).map((item) => (
                <div 
                  key={item.rank} 
                  className="d-flex align-items-center justify-content-between p-3 rounded"
                  style={{ 
                    backgroundColor: item.rank === 1 ? 'rgba(212, 175, 55, 0.08)' : '#f8f9fa',
                    border: item.rank === 1 ? '1px solid var(--ho-accent-gold)' : '1px solid #e9ecef'
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span style={{ fontSize: '24px' }}>
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{item.horseName}</h6>
                      <span className="text-secondary small">{item.jockeyName}</span>
                    </div>
                  </div>
                  <span className="fw-bold text-primary small">{item.time}</span>
                </div>
              ))}
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-secondary flex-grow-1" 
                onClick={() => setShowResultsSummary(false)}
              >
                Close
              </button>
              <button 
                className="ho-btn ho-btn-gold-solid flex-grow-1 py-2" 
                onClick={() => {
                  setShowResultsSummary(false);
                  navigate('/referee/confirm-results');
                }}
              >
                Confirm Results
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
