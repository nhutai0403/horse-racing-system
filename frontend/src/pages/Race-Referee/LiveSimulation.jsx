import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedRacesAPI, getRacePreCheckAPI, getCompletedRacesAPI, reportViolationAPI, saveSimulatedRaceAPI, startRaceAPI } from '../../services/referee';
import RaphaelHUD from './RaphaelHUD';
import './LiveSimulation.css';
import { audioManager } from './audioHelper';

const darkenColor = (hex, percent) => {
  let num = parseInt(hex.replace("#",""), 16),
      amt = Math.round(2.55 * percent * 100),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R<0?0:R>255?255:R)*0x10000 + (G<0?0:G>255?255:G)*0x100 + (B<0?0:B>255?255:B)).toString(16).slice(1);
};

export default function LiveSimulation() {
  const navigate = useNavigate();

  const [horses, setHorses] = useState([]);
  const numLanes = Math.max(1, horses.length);
  const [racePhase, setRacePhase] = useState('IDLE'); // IDLE, RAPHAEL, PRE_RACE, RUNNING, FINISHED
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [resultsSaved, setResultsSaved] = useState(false);

  // Sound settings state
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [volume, setVolume] = useState(0.45);

  // Custom Modals State
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [finalPodium, setFinalPodium] = useState([]);
  const [simulatedRaceName, setSimulatedRaceName] = useState('Simulated Race');
  const [actualRaceId, setActualRaceId] = useState(null);

  const [selectedHorseForFlag, setSelectedHorseForFlag] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [clickedProgress, setClickedProgress] = useState(null);
  const [environment, setEnvironment] = useState('sunset');
  const [povHorse, setPovHorse] = useState(null);

  const canvasRef = useRef(null);
  const horsesRef = useRef(horses);
  const povHorseRef = useRef(null);
  const visualHorses = useRef([]);
  const confettiParticles = useRef([]);
  const shakeIntensity = useRef(0);
  const lightningIntensity = useRef(0);
  const lastCommentaryChange = useRef(0);
  const commentaryText = useRef("Hệ thống đang chuẩn bị cuộc đua...");
  const fireworks = useRef([]);
  const crowdBubbles = useRef([]);

  const triggerConfetti = () => {
    const colors = ['#fbbf24', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#ec4899', '#8b5cf6'];
    const newParticles = [];
    for (let i = 0; i < 80; i++) {
      newParticles.push({
        x: 440 + (Math.random() - 0.5) * 300,
        y: 495,
        vx: (Math.random() - 0.5) * 10,
        vy: -15 - Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 6,
        alpha: 1.0,
        gravity: 0.35,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }
    confettiParticles.current.push(...newParticles);
  };

  const updateLiveCommentary = (currentHorses) => {
    const now = Date.now();
    if (now - lastCommentaryChange.current < 2500) return;

    const activeRunners = currentHorses.filter(h => !h.isDisqualified);
    if (activeRunners.length === 0) return;

    const sorted = [...activeRunners].sort((a, b) => b.progress - a.progress);
    const leader = sorted[0];
    const second = sorted[1];

    // Near finish
    const nearFinish = sorted.filter(h => h.progress > 80 && h.progress < 100);
    if (nearFinish.length > 0) {
      const finishLeader = nearFinish[0];
      const finishedCount = currentHorses.filter(h => h.progress >= 100).length;
      if (finishedCount === 0) {
        const finishComments = [
          `Chiến mã ${finishLeader.name} (Số ${finishLeader.id}) đang tiến rất sát vạch đích!`,
          `Giai đoạn nước rút cực kỳ căng thẳng! ${finishLeader.name} đang dẫn đầu!`,
          `Cơ hội chiến thắng đang chia đều, các chiến mã đang bung hết sức mình!`,
          `Ai sẽ là nhà vô địch? Tất cả đang dồn mắt về vạch đích!`
        ];
        commentaryText.current = finishComments[Math.floor(Math.random() * finishComments.length)];
        lastCommentaryChange.current = now;
        return;
      }
    }

    const leadDiff = second ? (leader.progress - second.progress) : 100;
    const comments = [];

    if (leadDiff > 12) {
      comments.push(
        `Chiến mã ${leader.name} (Số ${leader.id}) đang bứt tốc ngoạn mục, tạo khoảng cách lớn!`,
        `Khoảng cách dẫn đầu của ${leader.name} vẫn đang được duy trì rất tốt!`,
        `${leader.name} đang một mình băng băng dẫn đầu đoàn đua!`
      );
    } else if (second && leadDiff <= 3) {
      comments.push(
        `Cuộc rượt đuổi nghẹt thở! ${leader.name} và ${second.name} đang kèn cựa cực kỳ gay cấn!`,
        `Cạnh tranh khốc liệt! ${second.name} đang bám đuổi quyết liệt phía sau ${leader.name}!`,
        `Hai vị trí dẫn đầu liên tục so kè nhau từng mét đường đua!`
      );
    } else {
      comments.push(
        `Chiến mã ${leader.name} (Số ${leader.id}) đang tạm dẫn đầu đoàn đua với tốc độ ${leader.speed || 60} km/h!`,
        `Đoàn đua đang bám đuổi sát sao phía sau vị trí của ${leader.name}!`,
        `${leader.name} đang làm chủ tốc độ ở chặng giữa đường đua!`
      );
    }

    comments.push(
      `Tốc độ cuộc đua đang được đẩy lên rất cao!`,
      `Khán giả trên khán đài đang hò reo cổ vũ vô cùng náo nhiệt!`,
      `Các chiến mã đang dồn hết thể lực cho những mét đua quyết định!`,
      `Trọng tài đang theo dõi sát sao từng chuyển động trên sa bàn!`
    );

    commentaryText.current = comments[Math.floor(Math.random() * comments.length)];
    lastCommentaryChange.current = now;
  };

  // Sync state to ref for rendering frame rate decoupling
  useEffect(() => {
    horsesRef.current = horses;
  }, [horses]);

  useEffect(() => {
    povHorseRef.current = povHorse;
  }, [povHorse]);

  // Handle simulation timer
  useEffect(() => {
    let interval;
    if (racePhase === 'RUNNING') {
      interval = setInterval(() => {
        setHorses(prev => {
          let allFinished = true;
          const nextHorses = prev.map(h => {
            if (h.isDisqualified) return { ...h, speed: 0 };
            if (h.progress < 100) {
              // Adjust advance to make the race last ~30s (average 1.25% per 400ms)
              const advance = 0.5 + Math.random() * 1.5;
              const newProgress = Math.min(100, h.progress + advance);
              if (newProgress < 100) allFinished = false;

              let finishedTime = h.finishedTime;
              if (newProgress === 100 && !h.finishedTime) {
                const penalty = (h.flaggedPositions?.length || 0) * 4000;
                finishedTime = Date.now() + penalty;
                triggerConfetti();
                
                // Play finish bell (commented out as requested to remove the 'ting ting ting' sound during victory)
                // audioManager.playFinishBell();
                
                // Trigger screen shake when a horse crosses the finish line
                shakeIntensity.current = 12;

                // If it is the first horse to finish, swell the crowd immediately
                const alreadyFinished = prev.some(other => other.progress >= 100 && other.id !== h.id);
                if (!alreadyFinished) {
                  audioManager.setSfxVolume('crowd', 0.95);
                  commentaryText.current = `🏆 CHIẾN THẮNG! Chiến mã số ${h.id} (${h.name}) đã xuất sắc cán đích đầu tiên!`;
                  lastCommentaryChange.current = Date.now() + 8000;
                }
              }
              const currentSpeed = newProgress >= 100 ? 0 : Math.round(55 + Math.random() * 20);
              return { ...h, progress: newProgress, finishedTime, speed: currentSpeed };
            }
            return { ...h, speed: 0 };
          });

          allFinished = nextHorses.length > 0 && nextHorses.every(h => h.progress >= 100 || h.isDisqualified);
          if (allFinished) {
            setRacePhase('FINISHED');
            const sorted = [...nextHorses].sort((a, b) => {
              if (a.isDisqualified && b.isDisqualified) return 0;
              if (a.isDisqualified) return 1;
              if (b.isDisqualified) return -1;
              return (a.finishedTime || 0) - (b.finishedTime || 0);
            });
            const winner = sorted.find(h => !h.isDisqualified);
            if (winner) {
              commentaryText.current = `🏁 CUỘC ĐUA KẾT THÚC! Chiến thắng chung cuộc thuộc về ${winner.name} (Số ${winner.id})!`;
            } else {
              commentaryText.current = `🏁 CUỘC ĐUA KẾT THÚC! Tất cả chiến mã đều phạm quy và bị truất quyền thi đấu!`;
            }
            lastCommentaryChange.current = Date.now() + 999999;
          } else {
            updateLiveCommentary(nextHorses);
          }
          return nextHorses;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [racePhase]);

  // Pre-Race Sequence
  useEffect(() => {
    if (racePhase === 'PRE_RACE') {
      let isCancelled = false;
      const runPreRace = async () => {
        // Start rain loop early if it is raining
        if (environment === 'rain') {
          audioManager.playSfx('rain', true);
        }

        for (let i = 1; i <= numLanes; i++) {
          await new Promise(r => setTimeout(r, 600));
          if (isCancelled) return;
          setSpawnedCount(i);
          audioManager.playIntroChime(); // Play spawn chime
          
          const currentHorseName = horsesRef.current[i - 1]?.name || `Chiến mã ${i}`;
          commentaryText.current = `Đang dắt chiến mã số ${i} (${currentHorseName}) vào cổng xuất phát...`;
        }
        await new Promise(r => setTimeout(r, 600));
        for (let i = 5; i > 0; i--) {
          if (isCancelled) return;
          setCountdown(i.toString());
          audioManager.playCountdownBeep(false); // Play tick beep
          commentaryText.current = `Chuẩn bị xuất phát... T-minus ${i} giây!`;
          await new Promise(r => setTimeout(r, 1000));
        }
        if (isCancelled) return;
        setCountdown('GO!');
        audioManager.playCountdownBeep(true); // Play GO beep
        commentaryText.current = "CỔNG MỞ! CUỘC ĐUA CHÍNH THỨC BẮT ĐẦU!";
        await new Promise(r => setTimeout(r, 600));
        if (isCancelled) return;
        setCountdown(null);
        setRacePhase('RUNNING');
      };
      runPreRace();
      return () => { isCancelled = true; };
    }
  }, [racePhase, numLanes, environment]);

  // Fetch real upcoming race and participants
  useEffect(() => {
    const loadMockHorses = () => {
      const mockNames = ['Thần Phong', 'Xích Thố', 'Bạch Long', 'Hắc Báo', 'Tia Chớp'];
      const jockeys = ['Nguyễn Văn Đạt', 'Lê Hoàng Minh', 'Trần Văn Nam', 'Phạm Quốc Bảo', 'Huỳnh Gia Huy'];
      const mockHorses = mockNames.map((name, idx) => ({
        id: idx + 1,
        horseId: 200 + idx,
        name: name,
        jockeyName: jockeys[idx],
        ownerName: 'Tập đoàn ' + ['Alpha', 'Vanguard', 'Omega', 'Titan', 'Apex'][idx % 5],
        weight: (450 + Math.random() * 50).toFixed(1),
        progress: 0,
        color: ['#00f2fe', '#10b981', '#ef4444', '#d4af37', '#9333ea'][idx % 5],
        flaggedPositions: []
      }));
      setHorses(mockHorses);
      visualHorses.current = mockHorses.map(h => ({ ...h, visualProgress: 0, trail: [] }));
      setSimulatedRaceName('Đua Mô Phỏng Thử Nghiệm (Demo Mode)');
      setActualRaceId(999);
    };

    const fetchUpcomingRace = async () => {
      try {
        let races = await getAssignedRacesAPI('upcoming');
        if (!races || races.length === 0) {
          races = await getAssignedRacesAPI('running');
        }
        if (races && races.length > 0) {
          const race = races[0];
          const rId = race.raceId || race.id;
          setActualRaceId(rId);
          setSimulatedRaceName(race.raceName);

          const preCheck = await getRacePreCheckAPI(rId);
          if (preCheck && preCheck.participants && preCheck.participants.length > 0) {
            const fetchedHorses = preCheck.participants.map((p, idx) => ({
              id: p.participantId,
              horseId: p.horseId,
              name: p.horseName,
              jockeyName: p.jockeyName,
              ownerName: p.ownerName || 'Tập đoàn ' + ['Alpha', 'Vanguard', 'Omega', 'Titan', 'Apex'][idx % 5],
              weight: p.actualWeight || (450 + Math.random() * 50).toFixed(1),
              progress: 0,
              color: ['#00f2fe', '#10b981', '#ef4444', '#d4af37', '#9333ea'][idx % 5],
              flaggedPositions: []
            }));
            setHorses(fetchedHorses);
            visualHorses.current = fetchedHorses.map(h => ({ ...h, visualProgress: 0, trail: [] }));
          } else {
            loadMockHorses();
          }
        } else {
          loadMockHorses();
        }
      } catch (err) {
        console.error("Failed to fetch real race data, using mock data", err);
        loadMockHorses();
      }
    };
    fetchUpcomingRace();
  }, []);

  // Handle saving race results to localStorage when finished
  useEffect(() => {
    if (racePhase === 'FINISHED' && !resultsSaved) {
      // Sort horses to calculate ranks
      const sorted = [...horses].sort((a, b) => {
        if (a.isDisqualified && b.isDisqualified) return 0;
        if (a.isDisqualified) return 1;
        if (b.isDisqualified) return -1;
        return (a.finishedTime || 0) - (b.finishedTime || 0);
      });
      const results = sorted.map((h, index) => {
        const flagPenalties = h.flaggedPositions?.length || 0;
        return {
          rank: h.isDisqualified ? 'DSQ' : index + 1,
          horseName: h.name,
          jockeyName: h.jockeyName || ('Jockey ' + h.id),
          time: h.isDisqualified ? 'Disqualified' : `1m ${15 + index * 2 + flagPenalties * 4}s`
        };
      });

      const newRaceId = actualRaceId || Date.now();
      const newRace = {
        id: newRaceId,
        raceName: simulatedRaceName,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'FINISHED'
      };

      if (actualRaceId && actualRaceId !== 999) {
        saveSimulatedRaceAPI(newRace, results).then(() => {
          setResultsSaved(true);
          setFinalPodium(results);
          setShowResultsSummary(true);
        }).catch(err => {
          console.error('Failed to save simulated race', err);
        });
      } else {
        // Fallback for Demo Mode
        console.log("Mock saved simulated race", newRace, results);
        setResultsSaved(true);
        setFinalPodium(results);
        setShowResultsSummary(true);
      }
    }
  }, [racePhase, horses, resultsSaved, simulatedRaceName, actualRaceId]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let speedOffset = 0;



    // Pre-generate clouds for a realistic sky
    const clouds = [
      { x: canvas.width * 0.1, y: canvas.height * 0.08, w: 90, h: 25, speed: 0.1 },
      { x: canvas.width * 0.45, y: canvas.height * 0.05, w: 140, h: 35, speed: 0.07 },
      { x: canvas.width * 0.75, y: canvas.height * 0.12, w: 100, h: 28, speed: 0.12 }
    ];

    // Pre-generate snowflakes for snow environment
    const snowFlakes = [];
    for (let i = 0; i < 60; i++) {
      snowFlakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: Math.random() * 0.5 - 0.25
      });
    }

    // Pre-generate rain drops
    const rainDrops = [];
    for (let i = 0; i < 150; i++) {
      rainDrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        l: Math.random() * 15 + 10,
        speedY: Math.random() * 6 + 10,
        speedX: Math.random() * 1.5 + 0.5
      });
    }

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const horizonY = H * 0.32; // horizon at 32% of canvas height
      const startX = W * 0.06;
      const endX = W * 0.94;
      const Vx = W / 2;

      // Clear the canvas
      ctx.clearRect(0, 0, W, H);

      const activePov = povHorseRef.current;
      const followedVisualHorse = activePov ? visualHorses.current.find(h => h.id === activePov.id) : null;
      const povProgress = followedVisualHorse ? followedVisualHorse.visualProgress : (activePov ? activePov.progress : 0);

      const targetLaneIndex = activePov ? activePov.id - 1 : 0;
      const laneHorizonCenterX = Vx - 18 + (targetLaneIndex + 0.5) * 36 / numLanes;
      const laneBottomCenterX = startX + (targetLaneIndex + 0.5) * (endX - startX) / numLanes;

      const getShiftX = (t) => {
        if (!activePov) return 0;
        const laneCenterX = laneHorizonCenterX + (laneBottomCenterX - laneHorizonCenterX) * t;
        return Vx - laneCenterX;
      };

      const tx = (x, t) => {
        return x + getShiftX(t);
      };

      const getPovT = (pObj) => {
        if (!activePov) {
          return pObj / 100;
        }
        const D = pObj - povProgress;
        if (D < 0) return -1;
        return 8.8 / (D + 10.4);
      };

      // Save context for Screen Shake (Feature 10)
      ctx.save();
      if (shakeIntensity.current > 0) {
        const dx = (Math.random() - 0.5) * shakeIntensity.current;
        const dy = (Math.random() - 0.5) * shakeIntensity.current;
        ctx.translate(dx, dy);
        shakeIntensity.current *= 0.88; // decay shake
        if (shakeIntensity.current < 0.2) shakeIntensity.current = 0;
      }

      const drawStands = (isLeft) => {
        ctx.save();
        ctx.fillStyle = environment === 'cyber' ? '#111827' : '#334155';
        ctx.strokeStyle = environment === 'cyber' ? '#00f2fe' : '#475569';
        ctx.lineWidth = 2;

        let topX1, topY1_val, topX2, topY2_val, bottomX2, bottomY2, bottomX1, bottomY1;
        if (isLeft) {
          topX1 = 0;
          topY1_val = horizonY - 40;
          topX2 = Vx - 55;
          topY2_val = horizonY - 20;
          bottomX2 = startX - 80;
          bottomY2 = H;
          bottomX1 = 0;
          bottomY1 = H;
        } else {
          topX1 = Vx + 55;
          topY1_val = horizonY - 20;
          topX2 = W;
          topY2_val = horizonY - 40;
          bottomX2 = W;
          bottomY2 = H;
          bottomX1 = endX + 80;
          bottomY1 = H;
        }

        // Draw main concrete stand structure
        ctx.beginPath();
        ctx.moveTo(tx(topX1, 0), topY1_val);
        ctx.lineTo(tx(topX2, 0), topY2_val);
        ctx.lineTo(tx(bottomX2, 1), bottomY2);
        ctx.lineTo(tx(bottomX1, 1), bottomY1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw stand roof (canopy)
        ctx.fillStyle = environment === 'cyber' ? '#0f172a' : '#1e293b';
        ctx.beginPath();
        if (isLeft) {
          ctx.moveTo(tx(0, 0), topY1_val - 25);
          ctx.lineTo(tx(Vx - 65, 0), topY2_val - 15);
          ctx.lineTo(tx(Vx - 55, 0), topY2_val);
          ctx.lineTo(tx(0, 0), topY1_val);
        } else {
          ctx.moveTo(tx(Vx + 55, 0), topY1_val);
          ctx.lineTo(tx(W, 0), topY2_val);
          ctx.lineTo(tx(W, 0), topY2_val - 25);
          ctx.lineTo(tx(Vx + 65, 0), topY1_val - 15);
        }
        ctx.closePath();
        ctx.fill();

        // Canopy trim/neon light
        ctx.strokeStyle = environment === 'cyber' ? '#00f2fe' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (isLeft) {
          ctx.moveTo(tx(0, 0), topY1_val);
          ctx.lineTo(tx(Vx - 55, 0), topY2_val);
        } else {
          ctx.moveTo(tx(Vx + 55, 0), topY1_val);
          ctx.lineTo(tx(W, 0), topY2_val);
        }
        ctx.stroke();

        // Draw Tiers
        const numTiers = 8;
        ctx.strokeStyle = environment === 'cyber' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        for (let t = 1; t < numTiers; t++) {
          const ratio = t / numTiers;
          ctx.beginPath();
          if (isLeft) {
            const startX_tier = 0;
            const startY_tier = topY1_val + (H - topY1_val) * ratio;
            const endX_tier = (Vx - 55) + ((startX - 80) - (Vx - 55)) * ratio;
            const endY_tier = topY2_val + (H - topY2_val) * ratio;
            ctx.moveTo(tx(startX_tier, ratio), startY_tier);
            ctx.lineTo(tx(endX_tier, ratio), endY_tier);
          } else {
            const startX_tier = (Vx + 55) + ((endX + 80) - (Vx + 55)) * ratio;
            const startY_tier = topY1_val + (H - topY1_val) * ratio;
            const endX_tier = W;
            const endY_tier = topY2_val + (H - topY2_val) * ratio;
            ctx.moveTo(tx(startX_tier, ratio), startY_tier);
            ctx.lineTo(tx(endX_tier, ratio), endY_tier);
          }
          ctx.stroke();
        }

        const timeSec = Date.now() * 0.005;
        const crowdColors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#e2e8f0', '#a78bfa'];

        // Draw Spectators
        for (let tier = 0; tier < numTiers; tier++) {
          const ratio = (tier + 0.5) / numTiers;
          
          let startX_tier, startY_tier, endX_tier, endY_tier;
          if (isLeft) {
            startX_tier = 0;
            startY_tier = topY1_val + (H - topY1_val) * ratio;
            endX_tier = (Vx - 55) + ((startX - 80) - (Vx - 55)) * ratio;
            endY_tier = topY2_val + (H - topY2_val) * ratio;
          } else {
            startX_tier = (Vx + 55) + ((endX + 80) - (Vx + 55)) * ratio;
            startY_tier = topY1_val + (H - topY1_val) * ratio;
            endX_tier = W;
            endY_tier = topY2_val + (H - topY2_val) * ratio;
          }

          const size = 2.2 + 8.5 * ratio;
          const count = Math.floor(25 + 65 * ratio); // Dense crowd
          
          for (let i = 0; i < count; i++) {
            const xRatio = i / (count - 1 || 1);
            const x = startX_tier + (endX_tier - startX_tier) * xRatio;
            const y = startY_tier + (endY_tier - startY_tier) * xRatio;
            
            const seed = (tier * 100 + i) * 2.3;
            const bob = (racePhase === 'RUNNING') ? Math.sin(timeSec * 3 + seed) * (1.2 + 3.8 * ratio) : 0;

            const shiftedX = tx(x, ratio);

            // Optional cheering arms (drawn behind/next to body)
            if (racePhase === 'RUNNING' && (i + tier) % 3 === 0) {
              ctx.strokeStyle = '#fca5a5';
              ctx.lineWidth = Math.max(1, size * 0.22);
              ctx.beginPath();
              // Left arm
              ctx.moveTo(shiftedX - size * 0.22, y - size * 0.8 + bob);
              ctx.lineTo(shiftedX - size * 0.55, y - size * 1.5 + bob + Math.cos(timeSec * 6 + seed) * (size * 0.4));
              // Right arm
              ctx.moveTo(shiftedX + size * 0.22, y - size * 0.8 + bob);
              ctx.lineTo(shiftedX + size * 0.55, y - size * 1.5 + bob + Math.sin(timeSec * 6 + seed) * (size * 0.4));
              ctx.stroke();
            }

            // Body
            ctx.fillStyle = crowdColors[(tier + i) % crowdColors.length];
            ctx.beginPath();
            ctx.arc(shiftedX, y - size * 0.8 + bob, size * 0.45, 0, Math.PI * 2);
            ctx.fill();
            
            // Head
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath();
            ctx.arc(shiftedX, y - size * 1.25 + bob, size * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Cap/Hair
            ctx.fillStyle = crowdColors[(tier + i + 3) % crowdColors.length];
            ctx.beginPath();
            ctx.arc(shiftedX, y - size * 1.4 + bob, size * 0.28, Math.PI, 0);
            ctx.fill();

            // Phone camera flashes (Feature 11)
            if (racePhase === 'RUNNING' && Math.random() < 0.015) {
              ctx.save();
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#ffffff';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(shiftedX + (Math.random() - 0.5) * 3, y - size * 1.1 + bob, 1.0 + Math.random() * 1.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

            // Waving flags
            if ((i + tier * 3) % 12 === 0) {
              const flagColor = crowdColors[(tier + i + 1) % crowdColors.length];
              const flagHeight = size * 1.6;
              const flagWaving = Math.sin(timeSec * 5 + seed) * (size * 0.35);
              
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = Math.max(1, size * 0.15);
              ctx.beginPath();
              ctx.moveTo(shiftedX, y - size * 0.8 + bob);
              ctx.lineTo(shiftedX + size * 0.3, y - size * 0.8 - flagHeight + bob);
              ctx.stroke();
              
              ctx.fillStyle = flagColor;
              ctx.beginPath();
              ctx.moveTo(shiftedX + size * 0.3, y - size * 0.8 - flagHeight + bob);
              ctx.lineTo(shiftedX + size * 0.3 + size * 1.0, y - size * 0.8 - flagHeight + flagWaving + bob);
              ctx.lineTo(shiftedX + size * 0.3, y - size * 0.8 - flagHeight + size * 0.65 + bob);
              ctx.closePath();
              ctx.fill();
            }
          }
        }

        ctx.restore();
      };

      // Theme-specific configurations
      const themeConfigs = {
        sunset: {
          skyColors: ['#10375c', '#1a5f7a', '#f9d976'],
          sunColor: 'rgba(253, 186, 116, 0.8)',
          sunRadius: 45,
          grassColor: '#194d33',
          trackColor: '#654321',
          fenceColor: '#ffffff',
          laneLineColor: 'rgba(255, 255, 255, 0.4)',
          gridColor: 'rgba(0, 0, 0, 0.18)',
          dustColor: 'rgba(180, 150, 110, 0.35)',
          postColor: '#f8fafc'
        },
        cyber: {
          skyColors: ['#020408', '#050a12', '#0a192f'],
          sunColor: 'rgba(0, 242, 254, 0.15)',
          sunRadius: 70,
          grassColor: '#030d1a',
          trackColor: '#0a0f1d',
          fenceColor: '#00f2fe',
          laneLineColor: 'rgba(0, 242, 254, 0.25)',
          gridColor: 'rgba(0, 242, 254, 0.08)',
          dustColor: 'rgba(0, 242, 254, 0.15)',
          postColor: '#00f2fe'
        },
        sunny: {
          skyColors: ['#38bdf8', '#7dd3fc', '#bae6fd'],
          sunColor: 'rgba(253, 224, 71, 0.95)',
          sunRadius: 35,
          grassColor: '#16a34a',
          trackColor: '#15803d',
          fenceColor: '#ffffff',
          laneLineColor: 'rgba(255, 255, 255, 0.55)',
          gridColor: 'rgba(255, 255, 255, 0.15)',
          dustColor: 'rgba(255, 255, 255, 0.25)',
          postColor: '#ffffff'
        },
        snow: {
          skyColors: ['#475569', '#64748b', '#94a3b8'],
          sunColor: 'rgba(255, 255, 255, 0.4)',
          sunRadius: 50,
          grassColor: '#cbd5e1',
          trackColor: '#f1f5f9',
          fenceColor: '#78350f',
          laneLineColor: 'rgba(71, 85, 105, 0.25)',
          gridColor: 'rgba(71, 85, 105, 0.08)',
          dustColor: 'rgba(255, 255, 255, 0.5)',
          postColor: '#78350f'
        },
        rain: {
          skyColors: ['#2b323a', '#44515c', '#606c76'],
          sunColor: 'rgba(255, 255, 255, 0)',
          sunRadius: 0,
          grassColor: '#123524',
          trackColor: '#3d2b1f',
          fenceColor: '#a0aec0',
          laneLineColor: 'rgba(255, 255, 255, 0.3)',
          gridColor: 'rgba(0, 0, 0, 0.25)',
          dustColor: 'rgba(60, 40, 30, 0.4)',
          postColor: '#e2e8f0'
        }
      };

      const config = themeConfigs[environment] || themeConfigs.sunset;

      // 1. Draw Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, config.skyColors[0]);
      skyGrad.addColorStop(0.6, config.skyColors[1]);
      skyGrad.addColorStop(1, config.skyColors[2]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY);

      // Draw Pulsing Sun (Feature 3)
      let sunR = config.sunRadius;
      if (environment === 'sunny') {
        sunR = config.sunRadius + Math.sin(Date.now() * 0.003) * 6; // Sunny theme sun pulses
      }
      if (sunR > 0) {
        const sunGrad = ctx.createRadialGradient(Vx, horizonY, 0, Vx, horizonY, sunR);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.3, config.sunColor);
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(Vx, horizonY, sunR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lens Flare reflection for sunny theme (Feature 3)
      if (environment === 'sunny') {
        ctx.save();
        const timeSec = Date.now() * 0.001;
        const flares = [
          { dist: 0.20, r: 8, color: 'rgba(253, 224, 71, 0.12)' },
          { dist: 0.45, r: 20, color: 'rgba(147, 51, 234, 0.06)' },
          { dist: 0.65, r: 14, color: 'rgba(59, 130, 246, 0.08)' }
        ];
        flares.forEach(f => {
          const fx = Vx + (W / 2 - Vx) * f.dist + Math.sin(timeSec) * 2;
          const fy = horizonY + (H / 2 - horizonY) * f.dist + Math.cos(timeSec) * 2;
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // Clouds (Sunset and Sunny themes)
      if (environment !== 'cyber') {
        ctx.fillStyle = environment === 'snow' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.22)';
        clouds.forEach(c => {
          if (racePhase === 'RUNNING') {
            c.x += c.speed;
            if (c.x > W) c.x = -c.w;
          }
          ctx.beginPath();
          ctx.ellipse(c.x, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(c.x + c.w * 0.2, c.y + c.h * 0.1, c.w * 0.4, c.h * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Cyber Spotlights
      if (environment === 'cyber') {
        const timeSec = Date.now() * 0.001;
        const drawSpotlight = (x, y, angleOffset, color) => {
          ctx.save();
          const angle = Math.sin(timeSec + angleOffset) * 0.15 - Math.PI / 2;
          const beamLength = H * 0.75;

          const grad = ctx.createRadialGradient(x, y, 0, x, y, beamLength);
          grad.addColorStop(0, color);
          grad.addColorStop(0.4, 'rgba(0, 242, 254, 0.03)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle - 0.15) * beamLength, y + Math.sin(angle - 0.15) * beamLength);
          ctx.lineTo(x + Math.cos(angle + 0.15) * beamLength, y + Math.sin(angle + 0.15) * beamLength);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };
        drawSpotlight(W * 0.12, horizonY, 0, 'rgba(0, 242, 254, 0.12)');
        drawSpotlight(W * 0.38, horizonY, 1.5, 'rgba(16, 185, 129, 0.08)');
        drawSpotlight(W * 0.62, horizonY, 3.0, 'rgba(16, 185, 129, 0.08)');
        drawSpotlight(W * 0.88, horizonY, 4.5, 'rgba(0, 242, 254, 0.12)');
      }

      // 2. Draw Grass Fields on the sides
      ctx.fillStyle = config.grassColor;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // Draw Distant Hills silhouette
      ctx.fillStyle = environment === 'cyber' ? '#02060f' : environment === 'snow' ? '#475569' : '#0f3224';
      ctx.beginPath();
      ctx.moveTo(tx(0, 0), horizonY);
      ctx.quadraticCurveTo(tx(W * 0.15, 0), horizonY - 12, tx(W * 0.35, 0), horizonY - 4);
      ctx.quadraticCurveTo(tx(W * 0.55, 0), horizonY - 18, tx(W * 0.7, 0), horizonY - 6);
      ctx.quadraticCurveTo(tx(W * 0.88, 0), horizonY - 8, tx(W, 0), horizonY);
      ctx.lineTo(tx(W, 1), H);
      ctx.lineTo(tx(0, 1), H);
      ctx.closePath();
      ctx.fill();

      // Redraw grass overlay
      ctx.fillStyle = config.grassColor;
      ctx.beginPath();
      ctx.moveTo(tx(0, 0), horizonY);
      ctx.lineTo(tx(W, 0), horizonY);
      ctx.lineTo(tx(W, 1), H);
      ctx.lineTo(tx(0, 1), H);
      ctx.closePath();
      ctx.fill();

      // Draw Spectator Stands (left and right)
      drawStands(true);
      drawStands(false);

      // 3. Draw Track Surface
      const trackGrad = ctx.createLinearGradient(Vx, horizonY, Vx, H);
      if (environment === 'cyber') {
        trackGrad.addColorStop(0, '#0a0f1d');
        trackGrad.addColorStop(0.5, '#111827');
        trackGrad.addColorStop(1, '#1f2937');
      } else if (environment === 'sunset') {
        trackGrad.addColorStop(0, '#4a2c11');
        trackGrad.addColorStop(0.5, '#5c3a21');
        trackGrad.addColorStop(1, '#6e473b');
      } else if (environment === 'sunny') {
        trackGrad.addColorStop(0, '#1c5e3b');
        trackGrad.addColorStop(0.5, '#227c4e');
        trackGrad.addColorStop(1, '#289760');
      } else if (environment === 'snow') {
        trackGrad.addColorStop(0, '#cbd5e1');
        trackGrad.addColorStop(0.5, '#e2e8f0');
        trackGrad.addColorStop(1, '#f1f5f9');
      } else { // rain
        trackGrad.addColorStop(0, '#2d221c');
        trackGrad.addColorStop(0.5, '#382a22');
        trackGrad.addColorStop(1, '#48352b');
      }
      ctx.fillStyle = trackGrad;
      
      ctx.beginPath();
      ctx.moveTo(tx(Vx - 18, 0), horizonY);
      ctx.lineTo(tx(Vx + 18, 0), horizonY);
      ctx.lineTo(tx(endX, 1), H);
      ctx.lineTo(tx(startX, 1), H);
      ctx.closePath();
      ctx.fill();

      // 3a. Draw Alternating 3D Track Panels (for depth effect)
      const segments = 24;
      for (let s = 0; s < segments; s++) {
        const tStart = s / segments;
        const tEnd = (s + 1) / segments;
        
        const yStart = horizonY + (H - horizonY) * (tStart * tStart);
        const yEnd = horizonY + (H - horizonY) * (tEnd * tEnd);
        
        const xStartLeft = Vx - 18 + (startX - (Vx - 18)) * tStart;
        const xStartRight = Vx + 18 + (endX - (Vx + 18)) * tStart;
        
        const xEndLeft = Vx - 18 + (startX - (Vx - 18)) * tEnd;
        const xEndRight = Vx + 18 + (endX - (Vx + 18)) * tEnd;
        
        ctx.beginPath();
        ctx.moveTo(tx(xStartLeft, tStart), yStart);
        ctx.lineTo(tx(xStartRight, tStart), yStart);
        ctx.lineTo(tx(xEndRight, tEnd), yEnd);
        ctx.lineTo(tx(xEndLeft, tEnd), yEnd);
        ctx.closePath();
        
        if (s % 2 === 0) {
          ctx.fillStyle = environment === 'cyber' ? 'rgba(0, 242, 254, 0.02)' : 'rgba(255, 255, 255, 0.03)';
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        }
        ctx.fill();
      }

      // 3b. Draw Rumble Strips (Kerbs) on the track shoulders (moving in sync with speed)
      const numKerbs = 24;
      const runningOffset = racePhase === 'RUNNING' ? speedOffset * numKerbs : 0;
      
      for (let s = 0; s < numKerbs; s++) {
        const tValStart = ((s + runningOffset) % numKerbs) / numKerbs;
        const tValEnd = (((s + 1 + runningOffset) % numKerbs) / numKerbs);
        
        if (tValStart > tValEnd) continue;
        
        const yStart = horizonY + (H - horizonY) * (tValStart * tValStart);
        const yEnd = horizonY + (H - horizonY) * (tValEnd * tValEnd);
        
        // Left Kerb
        const lxStart = Vx - 18 + (startX - (Vx - 18)) * tValStart;
        const lxEnd = Vx - 18 + (startX - (Vx - 18)) * tValEnd;
        const l_oxStart = lxStart - 8 * tValStart;
        const l_oxEnd = lxEnd - 8 * tValEnd;
        
        // Right Kerb
        const rxStart = Vx + 18 + (endX - (Vx + 18)) * tValStart;
        const rxEnd = Vx + 18 + (endX - (Vx + 18)) * tValEnd;
        const r_oxStart = rxStart + 8 * tValStart;
        const r_oxEnd = rxEnd + 8 * tValEnd;
        
        let primaryColor, secondaryColor;
        if (environment === 'cyber') {
          primaryColor = '#ec4899'; // neon pink
          secondaryColor = '#00f2fe'; // neon cyan
        } else if (environment === 'snow') {
          primaryColor = '#94a3b8'; // gray slate
          secondaryColor = '#ffffff'; // white
        } else {
          primaryColor = '#ef4444'; // red
          secondaryColor = '#ffffff'; // white
        }
        
        const colorVal = Math.floor(s + runningOffset);
        const isEven = Math.abs(colorVal) % 2 === 0;
        const fillColor = isEven ? primaryColor : secondaryColor;
        
        ctx.fillStyle = fillColor;
        
        // Left
        ctx.beginPath();
        ctx.moveTo(tx(lxStart, tValStart), yStart);
        ctx.lineTo(tx(lxEnd, tValEnd), yEnd);
        ctx.lineTo(tx(l_oxEnd, tValEnd), yEnd);
        ctx.lineTo(tx(l_oxStart, tValStart), yStart);
        ctx.closePath();
        ctx.fill();
        
        // Right
        ctx.beginPath();
        ctx.moveTo(tx(rxStart, tValStart), yStart);
        ctx.lineTo(tx(rxEnd, tValEnd), yEnd);
        ctx.lineTo(tx(r_oxEnd, tValEnd), yEnd);
        ctx.lineTo(tx(r_oxStart, tValStart), yStart);
        ctx.closePath();
        ctx.fill();
      }

      // 3c. Cyber laser borders
      if (environment === 'cyber') {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00f2fe';
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(tx(Vx - 18, 0), horizonY);
        ctx.lineTo(tx(startX, 1), H);
        ctx.moveTo(tx(Vx + 18, 0), horizonY);
        ctx.lineTo(tx(endX, 1), H);
        ctx.stroke();
        ctx.restore();
      }

      // 3d. Draw Sponsor Billboards on the grass sides
      const drawBillboards = () => {
        const boards = [
          { side: 'left', t: 0.22, text: '🏆 SWP391', color: '#1e3a8a', neon: '#00f2fe' },
          { side: 'right', t: 0.35, text: '⚡ OMEGA', color: '#064e3b', neon: '#10b981' },
          { side: 'left', t: 0.52, text: '⭐ RAPHAEL', color: '#78350f', neon: '#d4af37' },
          { side: 'right', t: 0.68, text: '🔥 TITAN', color: '#7f1d1d', neon: '#ef4444' }
        ];

        boards.forEach(b => {
          const t1_val = getPovT(b.t * 100);
          const t2_val = getPovT((b.t + 0.12) * 100);
          if (t1_val < 0 || t2_val < 0) return;
          
          const y1 = horizonY + (H - horizonY) * (t1_val * t1_val);
          const y2 = horizonY + (H - horizonY) * (t2_val * t2_val);
          
          let x1, x2;
          if (b.side === 'left') {
            x1 = Vx - 18 + (startX - (Vx - 18)) * t1_val;
            x2 = Vx - 18 + (startX - (Vx - 18)) * t2_val;
          } else {
            x1 = Vx + 18 + (endX - (Vx + 18)) * t1_val;
            x2 = Vx + 18 + (endX - (Vx + 18)) * t2_val;
          }
          
          const offsetMultiplier = b.side === 'left' ? -1 : 1;
          const bx1 = x1 + offsetMultiplier * 15 * t1_val;
          const bx2 = x2 + offsetMultiplier * 15 * t2_val;
          
          const h1 = 28 * t1_val;
          const h2 = 28 * t2_val;
          
          const ty1 = y1 - h1;
          const ty2 = y2 - h2;
          
          const bx1_shifted = tx(bx1, t1_val);
          const bx2_shifted = tx(bx2, t2_val);

          // Draw legs
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = Math.max(1, 2 * t1_val);
          ctx.beginPath();
          ctx.moveTo(bx1_shifted, y1);
          ctx.lineTo(bx1_shifted, y1 - h1 * 0.4);
          ctx.moveTo(bx2_shifted, y2);
          ctx.lineTo(bx2_shifted, y2 - h2 * 0.4);
          ctx.stroke();

          // Draw board body
          ctx.save();
          if (environment === 'cyber') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = b.neon;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = b.neon;
          } else {
            ctx.fillStyle = b.color;
            ctx.strokeStyle = '#ffffff';
          }
          ctx.lineWidth = Math.max(1, 2 * t1_val);
          
          ctx.beginPath();
          ctx.moveTo(bx1_shifted, y1 - h1 * 0.3);
          ctx.lineTo(bx2_shifted, y2 - h2 * 0.3);
          ctx.lineTo(bx2_shifted, ty2);
          ctx.lineTo(bx1_shifted, ty1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Sponsor Text
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(6, Math.floor(11 * t1_val))}px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const cx = (bx1_shifted + bx2_shifted) / 2;
          const cy = ((y1 - h1 * 0.3) + ty1 + (y2 - h2 * 0.3) + ty2) / 4;
          const angle = Math.atan2((y2 - h2 * 0.3) - (y1 - h1 * 0.3), bx2_shifted - bx1_shifted);
          
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.fillText(b.text, 0, 0);
          ctx.restore();
        });
      };
      drawBillboards();

      // 4. Draw lane dividing chalk lines
      ctx.strokeStyle = config.laneLineColor;
      ctx.lineWidth = environment === 'cyber' ? 2 : 1.5;
      ctx.save();
      if (environment === 'cyber') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 242, 254, 0.3)';
      }
      for (let i = 1; i < numLanes; i++) {
        const bottomDividerX = startX + i * (endX - startX) / numLanes;
        const topDividerX = Vx - 18 + i * 36 / numLanes;
        ctx.beginPath();
        ctx.moveTo(tx(topDividerX, 0), horizonY);
        ctx.lineTo(tx(bottomDividerX, 1), H);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Draw 3D Fences/Rails (Double Rail design)
      ctx.strokeStyle = config.fenceColor;
      ctx.lineWidth = 2.5;
      ctx.save();
      if (environment === 'cyber') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = config.fenceColor;
      }

      // Left Fences (Top & Middle rails)
      ctx.beginPath();
      ctx.moveTo(tx(Vx - 18, 0), horizonY);
      ctx.lineTo(tx(startX, 1), H - 40);
      ctx.moveTo(tx(Vx - 18, 0), horizonY);
      ctx.lineTo(tx(startX, 1), H - 20);
      ctx.stroke();

      // Right Fences (Top & Middle rails)
      ctx.beginPath();
      ctx.moveTo(tx(Vx + 18, 0), horizonY);
      ctx.lineTo(tx(endX, 1), H - 40);
      ctx.moveTo(tx(Vx + 18, 0), horizonY);
      ctx.lineTo(tx(endX, 1), H - 20);
      ctx.stroke();
      ctx.restore();

      // Vertical posts with gradients for cylindrical look
      const numPosts = 12;
      for (let k = 0; k <= numPosts; k++) {
        const val = getPovT((k / numPosts) * 100);
        if (val < 0) continue;
        const t = val * val;
        const y = horizonY + (H - horizonY) * t;
        const postH = 40 * t;
        const postW = Math.max(1, 4 * t);

        // Left post
        const lx = Vx - 18 + (startX - (Vx - 18)) * t;
        const leftGrad = ctx.createLinearGradient(lx - postW/2, y, lx + postW/2, y);
        leftGrad.addColorStop(0, config.postColor);
        leftGrad.addColorStop(0.5, '#ffffff');
        leftGrad.addColorStop(1, config.postColor);
        ctx.fillStyle = environment === 'cyber' ? config.postColor : leftGrad;
        ctx.fillRect(tx(lx, val) - postW/2, y - postH, postW, postH);

        // Right post
        const rx = Vx + 18 + (endX - (Vx + 18)) * t;
        const rightGrad = ctx.createLinearGradient(rx - postW/2, y, rx + postW/2, y);
        rightGrad.addColorStop(0, config.postColor);
        rightGrad.addColorStop(0.5, '#ffffff');
        rightGrad.addColorStop(1, config.postColor);
        ctx.fillStyle = environment === 'cyber' ? config.postColor : rightGrad;
        ctx.fillRect(tx(rx, val) - postW/2, y - postH, postW, postH);
      }

      // 6. Draw Horizontal dirt speed texture
      if (racePhase === 'RUNNING') {
        speedOffset += 0.05;
        if (speedOffset > 1) speedOffset -= 1;
      }
      ctx.strokeStyle = config.gridColor;
      ctx.lineWidth = 2;
      for (let k = 0; k < 15; k++) {
        const val = (k + speedOffset) / 15;
        const t = val * val;
        const lineY = horizonY + (H - horizonY) * t;
        const leftLimitX = Vx - 18 + (startX - (Vx - 18)) * t;
        const rightLimitX = Vx + 18 + (endX - (Vx + 18)) * t;

        ctx.beginPath();
        ctx.moveTo(tx(leftLimitX, val), lineY);
        ctx.lineTo(tx(rightLimitX, val), lineY);
        ctx.stroke();
      }

      // 7. Draw Checkered Finish Line Banner & Posts at t = 0.92
      const finishVal = getPovT(92);
      if (finishVal >= 0) {
        const finishT = finishVal;
        const finishT_sq = finishVal * finishVal;
        const finishY = horizonY + (H - horizonY) * finishT_sq;
        const finishLeftX = Vx - 18 + (startX - (Vx - 18)) * finishT_sq;
        const finishRightX = Vx + 18 + (endX - (Vx + 18)) * finishT_sq;
        const finishLeftX_shifted = tx(finishLeftX, finishVal);
        const finishRightX_shifted = tx(finishRightX, finishVal);

        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, 8 * finishVal);
        ctx.beginPath();
        ctx.moveTo(finishLeftX_shifted, finishY);
        ctx.lineTo(finishRightX_shifted, finishY);
        ctx.stroke();

        ctx.strokeStyle = '#000000';
        ctx.setLineDash([Math.max(2, 8 * finishVal), Math.max(2, 8 * finishVal)]);
        ctx.lineWidth = Math.max(1.5, 6 * finishVal);
        ctx.beginPath();
        ctx.moveTo(finishLeftX_shifted, finishY);
        ctx.lineTo(finishRightX_shifted, finishY);
        ctx.stroke();
        ctx.restore();

        // Draw Finish Posts
        const finishPostH = 65 * finishVal;
        ctx.fillStyle = '#b91c1c';

        ctx.fillRect(finishLeftX_shifted - 4 * finishVal, finishY - finishPostH, 8 * finishVal, finishPostH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(finishLeftX_shifted - 4 * finishVal, finishY - finishPostH + 15 * finishVal, 8 * finishVal, 12 * finishVal);
        ctx.fillRect(finishLeftX_shifted - 4 * finishVal, finishY - finishPostH + 40 * finishVal, 8 * finishVal, 12 * finishVal);

        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(finishRightX_shifted - 4 * finishVal, finishY - finishPostH, 8 * finishVal, finishPostH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(finishRightX_shifted - 4 * finishVal, finishY - finishPostH + 15 * finishVal, 8 * finishVal, 12 * finishVal);
        ctx.fillRect(finishRightX_shifted - 4 * finishVal, finishY - finishPostH + 40 * finishVal, 8 * finishVal, 12 * finishVal);

        // overhead banner
        ctx.fillStyle = '#0f3224';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = Math.max(1, 2 * finishVal);
        const bannerW = finishRightX_shifted - finishLeftX_shifted - 40 * finishVal;
        const bannerH = 18 * finishVal;
        const bannerX = finishLeftX_shifted + 20 * finishVal;
        const bannerY = finishY - finishPostH + 5 * finishVal;

        if (bannerW > 0 && bannerH > 0) {
          ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
          ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

          ctx.fillStyle = '#d4af37';
          ctx.font = `bold ${Math.max(5, 9 * finishVal)}px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText("FINISH", (finishLeftX_shifted + finishRightX_shifted) / 2, bannerY + 12 * finishVal);
        }
      }

      // Starting Gates (Feature 4)
      const gateVal = getPovT(0);
      if (gateVal >= 0) {
        const gateT_sq = gateVal * gateVal;
        const y_gate = horizonY + (H - horizonY) * gateT_sq;
        
        // Horizontal structure
        const gateLeftX = Vx - 18 + (startX - (Vx - 18)) * gateT_sq;
        const gateRightX = Vx + 18 + (endX - (Vx + 18)) * gateT_sq;
        const gateLeftX_shifted = tx(gateLeftX, gateVal);
        const gateRightX_shifted = tx(gateRightX, gateVal);
        
        ctx.strokeStyle = environment === 'cyber' ? '#00f2fe' : '#78350f';
        ctx.lineWidth = Math.max(1, 2.5 * gateVal);
        ctx.beginPath();
        ctx.moveTo(gateLeftX_shifted, y_gate - 12 * gateVal);
        ctx.lineTo(gateRightX_shifted, y_gate - 12 * gateVal);
        ctx.stroke();

        horsesRef.current.forEach((horse, laneIndex) => {
          const laneStartX_left = startX + laneIndex * (endX - startX) / numLanes;
          const laneStartX_right = startX + (laneIndex + 1) * (endX - startX) / numLanes;
          const xL = Vx + (laneStartX_left - Vx) * gateT_sq;
          const xR = Vx + (laneStartX_right - Vx) * gateT_sq;
          const xL_shifted = tx(xL, gateVal);
          const xR_shifted = tx(xR, gateVal);
          const gateWidth = xR_shifted - xL_shifted;

          // Vertical gate post
          ctx.fillStyle = environment === 'cyber' ? '#00f2fe' : '#a1a1aa';
          ctx.fillRect(xL_shifted - 1, y_gate - 12 * gateVal, 2, 12 * gateVal);
          if (laneIndex === numLanes - 1) {
            ctx.fillRect(xR_shifted - 1, y_gate - 12 * gateVal, 2, 12 * gateVal);
          }

          // Gate Barrier Door
          const openPct = racePhase === 'RUNNING' ? Math.min(1, horse.progress / 5) : 0;
          ctx.save();
          ctx.strokeStyle = horse.color;
          ctx.lineWidth = Math.max(1, 1.5 * gateVal);
          ctx.translate(xL_shifted, y_gate - 3 * gateVal);

          if (openPct < 1) {
            const angle = -openPct * (Math.PI / 2);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(gateWidth, 0);
            ctx.stroke();
            // diagonal cross on barrier
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = Math.max(0.5, 0.8 * gateVal);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(gateWidth, -3 * gateVal);
            ctx.moveTo(0, -3 * gateVal);
            ctx.lineTo(gateWidth, 0);
            ctx.stroke();
          } else {
            // fully open: drawn up vertically
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -9 * gateVal);
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      // 8. Draw Violation Flags
      horsesRef.current.forEach((horse, laneIndex) => {
        if (horse.flaggedPositions && horse.flaggedPositions.length > 0) {
          horse.flaggedPositions.forEach(pos => {
            const val = getPovT(pos);
            if (val < 0) return;
            const t = val * val;
            const y = horizonY + (H - horizonY) * t;
            const laneStartX = startX + (laneIndex + 0.5) * (endX - startX) / numLanes;
            const x = Vx + (laneStartX - Vx) * t;
            const x_shifted = tx(x, val);

            const flagScale = val;
            const flagHeight = 40 * flagScale;

            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ef4444';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3 * flagScale;

            ctx.beginPath();
            ctx.moveTo(x_shifted, y);
            ctx.lineTo(x_shifted, y - flagHeight);
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(x_shifted, y - flagHeight);
            ctx.lineTo(x_shifted + 12 * flagScale, y - flagHeight + 4 * flagScale);
            ctx.lineTo(x_shifted, y - flagHeight + 8 * flagScale);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          });
        }
      });

      // Pre-Race Overlay
      if (racePhase === 'PRE_RACE') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, W, H);
      }

      // 9. Draw Horses
      if (racePhase === 'PRE_RACE' || racePhase === 'RUNNING' || racePhase === 'FINISHED') {
        visualHorses.current.forEach((vHorse, laneIndex) => {
          if (racePhase === 'PRE_RACE' && laneIndex >= spawnedCount) return;
          const stateHorse = horsesRef.current.find(h => h.id === vHorse.id);
          const targetProgress = stateHorse ? stateHorse.progress : 0;
          const speedVal = stateHorse ? stateHorse.speed || 0 : 0;

          vHorse.visualProgress += (targetProgress - vHorse.visualProgress) * 0.08;
          if (Math.abs(targetProgress - vHorse.visualProgress) < 0.01) {
            vHorse.visualProgress = targetProgress;
          }

          if (activePov && vHorse.id === activePov.id) {
            // This is the active POV horse. Do not draw it on the track.
            return;
          }

          const val = getPovT(vHorse.visualProgress);
          if (val < 0) return; // behind us
          
          const t = val;
          const laneStartX = startX + (laneIndex + 0.5) * (endX - startX) / numLanes;
          const horseX = Vx + (laneStartX - Vx) * t;
          const baseHorseY = horizonY + (H - horizonY) * (t * t);

          const gallopFreq = 0.02 + 0.03 * (laneIndex % 3);
          const bobY = (racePhase === 'RUNNING') && vHorse.visualProgress < 100
            ? Math.sin(Date.now() * gallopFreq) * 5 * t
            : 0;
          const horseY = baseHorseY + bobY;
          const size = 16 + 42 * t;

          const horseColor = vHorse.color || '#00f2fe';
          const horseX_shifted = tx(horseX, t);

          if (!vHorse.trail) vHorse.trail = [];
          if (racePhase === 'RUNNING' && vHorse.visualProgress < 100) {
            vHorse.trail.push({ x: horseX_shifted, y: horseY, size, alpha: 0.5 });
            if (vHorse.trail.length > 10) vHorse.trail.shift();
          } else {
            if (vHorse.trail.length > 0) vHorse.trail.shift();
          }

          // Elliptical ground shadow
          ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * t})`;
          ctx.beginPath();
          ctx.ellipse(horseX_shifted, baseHorseY + 2 * t, size * 0.45, size * 0.16, 0, 0, Math.PI * 2);
          ctx.fill();

          // Speed Trails & Wind Streaks (Feature 8)
          if (racePhase === 'RUNNING' && vHorse.visualProgress < 100 && speedVal > 0) {
            ctx.save();
            ctx.strokeStyle = environment === 'cyber' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.2 * t;
            // Draw wind streak lines extending backwards
            ctx.beginPath();
            ctx.moveTo(horseX_shifted, horseY - size * 0.1);
            ctx.lineTo(horseX_shifted - size * 1.5, horseY - size * 0.1);
            ctx.moveTo(horseX_shifted - size * 0.2, horseY + size * 0.15);
            ctx.lineTo(horseX_shifted - size * 1.8, horseY + size * 0.15);
            ctx.stroke();

            // Cyber spark particles
            if (environment === 'cyber') {
              ctx.fillStyle = horseColor;
              for (let p = 0; p < 2; p++) {
                ctx.fillRect(
                  horseX_shifted - (size * 0.45) - Math.random() * 25 * t,
                  horseY + (Math.random() - 0.5) * 12 * t,
                  2, 2
                );
              }
            }
            ctx.restore();
          }

          // Trail ribbon
          vHorse.trail.forEach((p, idx) => {
            const alpha = (idx / vHorse.trail.length) * p.alpha;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 5;
            ctx.shadowColor = horseColor;
            ctx.fillStyle = horseColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Dust clouds
          if (racePhase === 'RUNNING' && vHorse.visualProgress > 0 && vHorse.visualProgress < 100) {
            ctx.fillStyle = config.dustColor;
            for (let p = 0; p < 2; p++) {
              ctx.beginPath();
              ctx.arc(
                horseX_shifted - (size * 0.45) + (Math.random() - 0.5) * 8,
                baseHorseY + 2 * t + (Math.random() - 0.5) * 4,
                (1.5 + Math.random() * 3.5) * t,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }

          // Holographic Ring
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = horseColor;
          ctx.strokeStyle = horseColor;
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.arc(horseX_shifted, horseY, size * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Inner fill
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(horseX_shifted, horseY, size * 0.48, 0, Math.PI * 2);
          ctx.fill();

          // Emoji
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.round(size * 0.55)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏇', horseX_shifted, horseY);

          // Nametag with Speedometer (Feature 5)
          if (size > 22) {
            ctx.save();
            ctx.fillStyle = 'rgba(15, 30, 24, 0.85)';
            ctx.strokeStyle = horseColor;
            ctx.lineWidth = 1;
            const labelW = size * 1.6;
            const labelH = size * 0.4;
            const lx = horseX_shifted - labelW * 0.5;
            const ly = horseY - size * 0.65 - labelH;

            ctx.fillRect(lx, ly, labelW, labelH);
            ctx.strokeRect(lx, ly, labelW, labelH);

            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(9, Math.round(size * 0.22))}px 'Inter', sans-serif`;
            const speedText = racePhase === 'RUNNING' && speedVal > 0 ? ` (${speedVal}km/h)` : '';
            ctx.fillText(`H${vHorse.id}: ${vHorse.name.split(' ')[0]}${speedText}`, horseX_shifted, ly + labelH * 0.55);
            ctx.restore();
          }

          // Jockey Speech Bubble (Feature 9)
          if (racePhase === 'RUNNING') {
            if (vHorse.bubbleTimer === undefined) {
              vHorse.bubbleTimer = 0;
              vHorse.bubbleText = "";
            }
            
            if (vHorse.bubbleTimer > 0) {
              vHorse.bubbleTimer--;
            } else if (Math.random() < 0.003) {
              const phrases = ["Vượt lên!", "Nhanh hơn!", "Chặn đường kìa!", "Bứt phá nào!", "Sắp tới rồi!", "Cố lên!", "Đừng đầu hàng!", "Phóng thôi!"];
              vHorse.bubbleText = phrases[Math.floor(Math.random() * phrases.length)];
              vHorse.bubbleTimer = 80; // frames to show (~1.3s)
            }

            if (vHorse.bubbleTimer > 0 && vHorse.bubbleText) {
              ctx.save();
              ctx.font = "bold 9px sans-serif";
              const textWidth = ctx.measureText(vHorse.bubbleText).width;
              const bubbleW = textWidth + 10;
              const bubbleH = 15;
              const bx = horseX_shifted - bubbleW / 2;
              const by = horseY - size * 0.65 - bubbleH - 22; // positioned higher than nametag

              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.strokeStyle = horseColor;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.rect(bx, by, bubbleW, bubbleH);
              ctx.fill();
              ctx.stroke();

              // downward pointer
              ctx.beginPath();
              ctx.moveTo(horseX_shifted - 3, by + bubbleH);
              ctx.lineTo(horseX_shifted + 3, by + bubbleH);
              ctx.lineTo(horseX_shifted, by + bubbleH + 3.5);
              ctx.closePath();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.fill();
              ctx.stroke();

              // text
              ctx.fillStyle = '#0f172a';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(vHorse.bubbleText, horseX_shifted, by + bubbleH / 2);
              ctx.restore();
            }
          }

          // Draw Flags
          if (stateHorse && stateHorse.flaggedPositions && stateHorse.flaggedPositions.length > 0) {
            stateHorse.flaggedPositions.forEach(flagProg => {
              const ft = getPovT(flagProg);
              if (ft < 0) return;
              const flagX = Vx + (laneStartX - Vx) * ft;
              const flagX_shifted = tx(flagX, ft);
              const flagY = horizonY + (H - horizonY) * (ft * ft);

              ctx.save();
              ctx.fillStyle = '#ef4444';
              ctx.font = `${Math.max(14, Math.round(35 * ft))}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.shadowColor = '#000';
              ctx.shadowBlur = 4;
              ctx.fillText('🚩', flagX_shifted, flagY - 5);
              ctx.restore();
            });
          }
        });
      }

      // Falling Snow Particles (Snow Theme)
      if (environment === 'snow') {
        ctx.fillStyle = '#ffffff';
        snowFlakes.forEach(flake => {
          if (racePhase === 'RUNNING' || racePhase === 'PRE_RACE') {
            flake.y += flake.speedY;
            flake.x += flake.speedX;
            if (flake.y > H) {
              flake.y = 0;
              flake.x = Math.random() * W;
            }
          }
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Falling Rain Particles with Lightning Strikes (Feature 3 & 10)
      if (environment === 'rain') {
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
        ctx.lineWidth = 1.5;
        rainDrops.forEach(drop => {
          if (racePhase === 'RUNNING' || racePhase === 'PRE_RACE') {
            drop.y += drop.speedY;
            drop.x -= drop.speedX;
            if (drop.y > H) {
              drop.y = -drop.l;
              drop.x = Math.random() * W + 100;
            }
          }
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.speedX, drop.y + drop.l);
          ctx.stroke();
        });

        // Lightning flash and strike trigger
        if (racePhase === 'RUNNING' && Math.random() < 0.003) {
          lightningIntensity.current = 1.0;
          shakeIntensity.current = 16; // screenshake on thunder
        }
      }

      // Render Lightning strike overlay
      if (lightningIntensity.current > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(224, 242, 254, ${lightningIntensity.current * 0.7})`;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f2fe';
        ctx.beginPath();
        let lx = W * 0.15 + Math.random() * W * 0.7;
        let ly = 0;
        ctx.moveTo(lx, ly);
        while (ly < horizonY + 30) {
          lx += (Math.random() - 0.5) * 35;
          ly += 18 + Math.random() * 18;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.restore();

        lightningIntensity.current -= 0.07;
        if (lightningIntensity.current < 0) lightningIntensity.current = 0;
      }

      // Draw Countdown Text
      if (countdown) {
        ctx.save();
        ctx.fillStyle = countdown === 'GO!' ? '#10b981' : '#ff8800';
        ctx.font = `bold 120px 'Arial Black', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.05;
        ctx.translate(W / 2, H / 2);
        ctx.scale(pulse, pulse);
        ctx.fillText(countdown, 0, 0);
        ctx.restore();
      }



      // Restore screen shake context (Feature 10)
      ctx.restore();

      // --- HUD Overlays (Not affected by screen shake) ---

      // 1. Mini-map / Distance Track (Feature 7)
      if (racePhase === 'PRE_RACE' || racePhase === 'RUNNING' || racePhase === 'FINISHED') {
        ctx.save();
        const mx_start = 120;
        const mx_end = W - 120;
        const my = 28;
        const m_w = mx_end - mx_start;

        // map track bar backdrop
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(mx_start - 12, my - 6, m_w + 24, 12, 6);
        ctx.fill();
        ctx.stroke();

        // start/finish text labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '900 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', mx_start - 6, my);
        ctx.fillText('F', mx_end + 6, my);

        // draw each horse indicator dot
        horsesRef.current.forEach(horse => {
          const progress = horse.progress || 0;
          const hx = mx_start + (progress / 100) * m_w;
          
          ctx.fillStyle = horse.isDisqualified ? '#64748b' : horse.color;
          ctx.beginPath();
          ctx.arc(hx, my, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 7px sans-serif';
          ctx.fillText(horse.id.toString(), hx, my);
        });
        ctx.restore();
      }

      // 2. F1 Starting Lights (Feature 6)
      let activeRedLights = 0;
      let showGreenLights = false;
      if (countdown === "5") activeRedLights = 1;
      else if (countdown === "4") activeRedLights = 2;
      else if (countdown === "3") activeRedLights = 3;
      else if (countdown === "2") activeRedLights = 4;
      else if (countdown === "1") activeRedLights = 5;
      else if (countdown === "GO!") showGreenLights = true;

      // Keep green lights flashing during early race running
      if (racePhase === 'RUNNING' && horsesRef.current.some(h => h.progress > 0 && h.progress < 5)) {
        showGreenLights = true;
      }

      if (racePhase === 'PRE_RACE' || showGreenLights) {
        ctx.save();
        const l_center_x = W / 2;
        const l_y = 15;
        const l_spacing = 16;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(l_center_x - 52, l_y - 8, 104, 16, 8);
        ctx.fill();
        ctx.stroke();

        for (let l = 0; l < 5; l++) {
          const lx = l_center_x - 32 + l * l_spacing;
          ctx.beginPath();
          ctx.arc(lx, l_y, 5, 0, Math.PI * 2);

          if (showGreenLights) {
            const isFlashOn = Math.sin(Date.now() * 0.015) > 0;
            ctx.fillStyle = isFlashOn ? '#10b981' : '#047857';
            ctx.shadowBlur = isFlashOn ? 8 : 0;
            ctx.shadowColor = '#10b981';
          } else {
            const isOn = l < activeRedLights;
            ctx.fillStyle = isOn ? '#ef4444' : '#7f1d1d';
            ctx.shadowBlur = isOn ? 8 : 0;
            ctx.shadowColor = '#ef4444';
          }
          ctx.fill();
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }



      // 4. Draw Photo Finish (Feature 12)
      if (racePhase === 'FINISHED') {
        const sorted = [...horsesRef.current].sort((a, b) => {
          if (a.isDisqualified && b.isDisqualified) return 0;
          if (a.isDisqualified) return 1;
          if (b.isDisqualified) return -1;
          return (a.finishedTime || 0) - (b.finishedTime || 0);
        });

        if (sorted.length > 0) {
          ctx.save();
          const f_w = 340;
          const f_h = 160;
          const f_x = W / 2 - f_w / 2;
          const f_y = H / 2 - f_h / 2 - 30;

          // Metal border window popup
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.strokeStyle = '#fbbf24'; // Gold border
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
          ctx.beginPath();
          ctx.roundRect(f_x, f_y, f_w, f_h, 8);
          ctx.fill();
          ctx.stroke();

          // Title
          ctx.fillStyle = '#fbbf24';
          ctx.font = "900 12px 'Inter', sans-serif";
          ctx.textAlign = 'center';
          ctx.fillText("★ PHOTO FINISH OFFICIAL ★", W / 2, f_y + 18);

          // Subtext
          ctx.fillStyle = '#94a3b8';
          ctx.font = "bold 8px sans-serif";
          ctx.fillText("BĂNG GHI HÌNH CÁN ĐÍCH TRỌNG TÀI", W / 2, f_y + 28);

          // Sweep camera line-scan box
          const b_x = f_x + 15;
          const b_y = f_y + 36;
          const b_w = f_w - 30;
          const b_h = 110;
          
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.fillRect(b_x, b_y, b_w, b_h);
          ctx.strokeRect(b_x, b_y, b_w, b_h);

          // Grid scan lines
          ctx.save();
          ctx.beginPath();
          ctx.rect(b_x, b_y, b_w, b_h);
          ctx.clip();

          // Vertical lines (camera scanlines)
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
          ctx.lineWidth = 1;
          for (let gx = b_x; gx < b_x + b_w; gx += 8) {
            ctx.beginPath();
            ctx.moveTo(gx, b_y);
            ctx.lineTo(gx, b_y + b_h);
            ctx.stroke();
          }

          // Draw vertical red finish line marker in center
          const finishLineX = b_x + b_w / 2 + 30;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(finishLineX, b_y);
          ctx.lineTo(finishLineX, b_y + b_h);
          ctx.stroke();

          // Draw the top 3 horses positioned relative to the finish line
          const top3 = sorted.filter(h => !h.isDisqualified).slice(0, 3);
          top3.forEach((h, index) => {
            const timeDiff = index === 0 ? 0.00 : (h.finishedTime - top3[0].finishedTime) / 1000;
            // First horse touches finish line. Backwards spacing based on time difference
            const hx = finishLineX - (timeDiff * 140);
            const hy = b_y + 22 + index * 26;

            // Draw standard horse emoji inside a glowing holographic ring matching the horse's color
            ctx.save();
            ctx.strokeStyle = h.color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 8;
            ctx.shadowColor = h.color;
            ctx.beginPath();
            ctx.arc(hx, hy, 12, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(hx, hy, 11, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = "12px Arial";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🏇', hx, hy);
            ctx.restore();

            // Label text for rankings
            ctx.fillStyle = '#ffffff';
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = 'left';
            ctx.fillText(`${index + 1}st`, b_x + 10, hy + 3);
            ctx.fillStyle = h.color;
            ctx.fillText(h.name.substring(0, 7), b_x + 35, hy + 3);
            
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(index === 0 ? `Winner` : `+${timeDiff.toFixed(2)}s`, b_x + 95, hy + 3);
          });

          ctx.restore();
          ctx.restore();
        }
      }

      // 5. Draw Confetti & Fireworks
      if (confettiParticles.current.length > 0) {
        confettiParticles.current.forEach((p, idx) => {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });
      }

      if (fireworks.current.length > 0) {
        fireworks.current.forEach((p) => {
          if (p.type === 'spark') {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (p.type === 'rocket') {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }

      // 6. Draw Live Commentary Ticker
      if (racePhase === 'PRE_RACE' || racePhase === 'RUNNING' || racePhase === 'FINISHED') {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.fillRect(0, H - 24, W, 24);
        ctx.strokeRect(0, H - 24, W, 24);

        const dotOn = Math.sin(Date.now() * 0.012) > 0;
        ctx.fillStyle = dotOn ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(16, H - 12, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.font = "bold 8.5px 'Inter', sans-serif";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText("LIVE FEED:", 26, H - 12);

        ctx.fillStyle = '#fef08a';
        ctx.font = "bold 10px 'Inter', sans-serif";
        ctx.fillText(commentaryText.current, 95, H - 12);
        ctx.restore();
      }

      // 7. Render Spectator Cheering Bubbles & Cheering flashpoints (Feature 11)
      if (racePhase === 'RUNNING' && Math.random() < 0.035) {
        crowdBubbles.current.push({
          x: Math.random() < 0.5 ? Math.random() * 150 : W - Math.random() * 150,
          y: horizonY - 10 + Math.random() * 80,
          vy: -0.4 - Math.random() * 0.6,
          text: ['🙌', '📣', '🎉', '🔥', '🏆', '🏇'][Math.floor(Math.random() * 6)],
          alpha: 1.0,
          size: 10 + Math.random() * 7
        });
      }

      if (crowdBubbles.current.length > 0) {
        crowdBubbles.current.forEach((b, idx) => {
          b.y += b.vy;
          b.alpha -= 0.014; // fade out
          if (b.alpha <= 0) {
            crowdBubbles.current.splice(idx, 1);
            return;
          }
          ctx.save();
          ctx.globalAlpha = b.alpha;
          ctx.font = `bold ${b.size}px Arial`;
          ctx.fillText(b.text, b.x, b.y);
          ctx.restore();
        });
      }

      // 10. Draw Jockey POV Cockpit Overlay (Horse Head, Neck, Ears, Reins & Gloves)
      if (activePov) {
        ctx.save();
        
        // Dynamic gallop bobbing effect based on the horse's speed/stride
        const targetLaneIndex = activePov.id - 1;
        const povGallopFreq = 0.02 + 0.03 * (targetLaneIndex % 3);
        const bobY = (racePhase === 'RUNNING') && povProgress < 100
          ? Math.sin(Date.now() * povGallopFreq) * 8
          : 0;
        const bobX = (racePhase === 'RUNNING') && povProgress < 100
          ? Math.cos(Date.now() * povGallopFreq) * 2.5
          : 0;

        const cx = W / 2 + bobX;
        const cy = H + bobY;

        const mainColor = activePov.color || '#654321';

        // Shadow under the horse neck for depth
        const ambientGrad = ctx.createRadialGradient(cx, cy - 50, 20, cx, cy - 50, 150);
        ambientGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
        ambientGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = ambientGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 120, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Neck
        const neckGrad = ctx.createLinearGradient(cx, cy, cx, cy - 110);
        neckGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
        neckGrad.addColorStop(0.3, mainColor);
        neckGrad.addColorStop(1, mainColor);

        ctx.fillStyle = neckGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 45, cy + 10);
        ctx.quadraticCurveTo(cx - 30, cy - 60, cx - 18, cy - 110);
        ctx.lineTo(cx + 18, cy - 110);
        ctx.quadraticCurveTo(cx + 30, cy - 60, cx + 45, cy + 10);
        ctx.closePath();
        ctx.fill();

        // Draw Mane (Bờm ngựa) blowing in the wind
        ctx.fillStyle = '#1e293b'; // dark mane
        const windShift = (racePhase === 'RUNNING') ? Math.sin(Date.now() * 0.05) * 4 : 0;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - 110);
        for (let i = 0; i < 6; i++) {
          const my = cy - 100 + i * 16;
          const mx = cx + (i % 2 === 0 ? -4 : 4) + windShift;
          ctx.lineTo(mx, my);
          ctx.lineTo(cx - 2, my + 8);
        }
        ctx.lineTo(cx - 15, cy);
        ctx.closePath();
        ctx.fill();

        // Draw Head (Back of Head / Snout)
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 110, 22, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Darker snout overlay at the top (extends down/forward)
        const snoutGrad = ctx.createLinearGradient(cx, cy - 110, cx, cy - 85);
        snoutGrad.addColorStop(0, mainColor);
        snoutGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
        ctx.fillStyle = snoutGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 98, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears twitching effect for a more lifelike feel
        const leftEarTwitch = Math.sin(Date.now() * 0.003) * 0.08;
        const rightEarTwitch = Math.cos(Date.now() * 0.004) * 0.08;

        // Left Ear
        ctx.save();
        ctx.translate(cx - 13, cy - 128);
        ctx.rotate(leftEarTwitch);
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(-7, 10);
        ctx.quadraticCurveTo(-11, -12, 0, -25);
        ctx.quadraticCurveTo(8, -12, 5, 10);
        ctx.closePath();
        ctx.fill();
        // Inner Left Ear (Pinkish details)
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.moveTo(-3, 6);
        ctx.quadraticCurveTo(-6, -6, 0, -18);
        ctx.quadraticCurveTo(4, -6, 2, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Right Ear
        ctx.save();
        ctx.translate(cx + 13, cy - 128);
        ctx.rotate(rightEarTwitch);
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(-5, 10);
        ctx.quadraticCurveTo(-8, -12, 0, -25);
        ctx.quadraticCurveTo(11, -12, 7, 10);
        ctx.closePath();
        ctx.fill();
        // Inner Right Ear (Pinkish details)
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.moveTo(-2, 6);
        ctx.quadraticCurveTo(-4, -6, 0, -18);
        ctx.quadraticCurveTo(6, -6, 3, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Reins (Dây cương)
        ctx.strokeStyle = '#2d1e10'; // Leather brown
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // Left Rein
        ctx.beginPath();
        ctx.moveTo(cx - 15, cy - 98);
        ctx.bezierCurveTo(cx - 60, cy - 70, cx - 180, cy - 20, cx - 160, cy);
        ctx.stroke();

        // Right Rein
        ctx.beginPath();
        ctx.moveTo(cx + 15, cy - 98);
        ctx.bezierCurveTo(cx + 60, cy - 70, cx + 180, cy - 20, cx + 160, cy);
        ctx.stroke();

        // Hands / Gloves holding reins at the bottom corners
        const drawGlove = (gx, gy, isLeft) => {
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          
          // Glove body (colored cyber/slate depending on the theme)
          ctx.fillStyle = environment === 'cyber' ? '#00f2fe' : '#475569';
          ctx.beginPath();
          ctx.arc(gx, gy, 14, 0, Math.PI * 2);
          ctx.fill();
          
          // Sleeve cuff
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(gx - 16, gy, 32, 12);
          
          // Gold knuckle guards/protectors
          ctx.fillStyle = '#d4af37';
          ctx.beginPath();
          ctx.arc(gx + (isLeft ? 4 : -4), gy - 4, 6, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        };

        if (racePhase === 'RUNNING' || racePhase === 'FINISHED' || racePhase === 'PRE_RACE') {
          drawGlove(cx - 110, H - 15, true);
          drawGlove(cx + 110, H - 15, false);
        }

        ctx.restore();
      }

      // Restore screen shake context (Feature 10)
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [racePhase, environment, countdown, spawnedCount]);

  // Manage looping ambient sounds, rain, music, and victory fanfares
  useEffect(() => {
    if (racePhase === 'RAPHAEL') {
      audioManager.playSfx('horse_intro', true);
      audioManager.setSfxVolume('horse_intro', 0.45); // low volume for intro
      if (environment === 'rain') {
        audioManager.playSfx('rain', true);
      } else {
        audioManager.stopSfx('rain');
      }
    } else if (racePhase === 'PRE_RACE') {
      audioManager.playSfx('music', true);
      audioManager.playSfx('crowd', true);
      audioManager.setSfxVolume('music', 0.45); // low volume for countdown
      audioManager.setSfxVolume('crowd', 0.2);  // low crowd ambient
      if (environment === 'rain') {
        audioManager.playSfx('rain', true);
      } else {
        audioManager.stopSfx('rain');
      }
    } else if (racePhase === 'RUNNING') {
      audioManager.playSfx('gallop', true);
      audioManager.playSfx('crowd', true);
      audioManager.playSfx('music', true);
      audioManager.setSfxVolume('music', 0.60); // background music level
      audioManager.setSfxVolume('crowd', 0.70); // crowd cheering level (louder than music)
      if (environment === 'rain') {
        audioManager.playSfx('rain', true);
      } else {
        audioManager.stopSfx('rain');
      }
    } else if (racePhase === 'FINISHED') {
      audioManager.stopSfx('gallop');
      audioManager.stopSfx('music');
      audioManager.stopSfx('horse_intro'); // just in case
      audioManager.setSfxVolume('crowd', 1.0); // swell volume of crowd
      audioManager.playSfx('victory', false);  // play trumpet fanfare
      
      const timer = setTimeout(() => {
        audioManager.stopSfx('crowd');
        audioManager.stopSfx('victory');
        audioManager.stopSfx('rain');
      }, 7000);
      return () => clearTimeout(timer);
    } else {
      audioManager.stopAllSfx();
    }
  }, [racePhase, environment]);

  // Sound controllers
  const toggleSfx = () => {
    const nextVal = !isSfxMuted;
    setIsSfxMuted(nextVal);
    audioManager.setSfxMuted(nextVal);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value) / 100;
    setVolume(vol);
    audioManager.setVolume(vol);
  };

  const handleStart = async () => {
    audioManager.unlockAudio();
    // Reset visual refs
    shakeIntensity.current = 0;
    lightningIntensity.current = 0;
    lastCommentaryChange.current = 0;
    commentaryText.current = "Hệ thống đang chuẩn bị cuộc đua...";
    fireworks.current = [];
    crowdBubbles.current = [];
    setPovHorse(null);

    if (racePhase === 'FINISHED') {
      // Refresh real data if any
      if (actualRaceId && actualRaceId !== 999) {
        try {
          const preCheck = await getRacePreCheckAPI(actualRaceId);
          if (preCheck && preCheck.participants && preCheck.participants.length > 0) {
            const fetchedHorses = preCheck.participants.map((p, idx) => ({
              id: p.participantId,
              horseId: p.horseId,
              name: p.horseName,
              jockeyName: p.jockeyName,
              ownerName: p.ownerName || 'Tập đoàn ' + ['Alpha', 'Vanguard', 'Omega', 'Titan', 'Apex'][idx % 5],
              weight: p.actualWeight || (450 + Math.random() * 50).toFixed(1),
              progress: 0,
              color: ['#00f2fe', '#10b981', '#ef4444', '#d4af37', '#9333ea'][idx % 5],
              flaggedPositions: [],
              speed: 0
            }));
            setHorses(fetchedHorses);
            visualHorses.current = fetchedHorses.map(h => ({ ...h, visualProgress: 0, trail: [], bubbleText: '', bubbleTimer: 0 }));
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        // Fallback for Demo Mode
        const mockNames = ['Thần Phong', 'Xích Thố', 'Bạch Long', 'Hắc Báo', 'Tia Chớp'];
        const jockeys = ['Nguyễn Văn Đạt', 'Lê Hoàng Minh', 'Trần Văn Nam', 'Phạm Quốc Bảo', 'Huỳnh Gia Huy'];
        const mockHorses = mockNames.map((name, idx) => ({
          id: idx + 1,
          horseId: 200 + idx,
          name: name,
          jockeyName: jockeys[idx],
          ownerName: 'Tập đoàn ' + ['Alpha', 'Vanguard', 'Omega', 'Titan', 'Apex'][idx % 5],
          weight: (450 + Math.random() * 50).toFixed(1),
          progress: 0,
          color: ['#00f2fe', '#10b981', '#ef4444', '#d4af37', '#9333ea'][idx % 5],
          flaggedPositions: [],
          speed: 0
        }));
        setHorses(mockHorses);
        visualHorses.current = mockHorses.map(h => ({ ...h, visualProgress: 0, trail: [], bubbleText: '', bubbleTimer: 0 }));
      }
      setResultsSaved(false);
      setSpawnedCount(0);
      setCountdown(null);
    }

    // Call start API if real race
    if (actualRaceId && actualRaceId !== 999 && racePhase !== 'FINISHED') {
      try {
        await startRaceAPI(actualRaceId);
      } catch (err) {
        console.error("Could not start race API", err);
      }
    }
    setRacePhase('RAPHAEL');
  };

  const handleRaphaelComplete = () => {
    setRacePhase('PRE_RACE');
  };

  const handleStop = () => {
    if (racePhase === 'RUNNING') setRacePhase('IDLE');
    setPovHorse(null);
  };

  const handleFlagClick = (horse) => {
    setClickedProgress(Math.round(horse.progress));
    setSelectedHorseForFlag(horse);
    setShowFlagModal(true);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (povHorse) return; // Disable direct canvas clicks in POV mode to avoid coordinate mapping skew bugs

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const H = canvas.height;
    const W = canvas.width;
    const horizonY = H * 0.32;
    const startX = W * 0.06;
    const endX = W * 0.94;
    const Vx = W / 2;

    if (clickY > horizonY) {
      const t = Math.sqrt((clickY - horizonY) / (H - horizonY));
      const progressPercent = t * 100;
      let clickedLane = -1;

      for (let i = 0; i < numLanes; i++) {
        const leftTopX = Vx - 18 + i * 36 / numLanes;
        const leftBottomX = startX + i * (endX - startX) / numLanes;
        const rightTopX = Vx - 18 + (i + 1) * 36 / numLanes;
        const rightBottomX = startX + (i + 1) * (endX - startX) / numLanes;

        const leftX = leftTopX + (leftBottomX - leftTopX) * t;
        const rightX = rightTopX + (rightBottomX - rightTopX) * t;

        if (clickX >= leftX && clickX <= rightX) {
          clickedLane = i;
          break;
        }
      }

      if (clickedLane !== -1) {
        const horse = horses.find(h => h.id === clickedLane + 1);
        if (horse) {
          setClickedProgress(Math.round(progressPercent));
          setSelectedHorseForFlag(horse);
          setShowFlagModal(true);
        }
      }
    }
  };

  const submitFlag = async () => {
    if (!flagReason) return;
    try {
      const position = clickedProgress !== null ? clickedProgress : Math.round(selectedHorseForFlag.progress);

      const newFlags = [...(selectedHorseForFlag.flaggedPositions || []), position];
      const isBlacklisted = newFlags.length >= 3;

      // Play referee whistle
      audioManager.playWhistle();
      shakeIntensity.current = 14;

      if (actualRaceId && actualRaceId !== 999) {
        await reportViolationAPI(actualRaceId, {
          horseId: selectedHorseForFlag.horseId,
          violationType: `${flagReason} (at ${position}%)`,
          description: `Flagged at ${position}%`
        });
      } else {
        console.log("Mock reported violation:", selectedHorseForFlag.name, flagReason);
      }

      setHorses(prev => prev.map(h => {
        if (h.id === selectedHorseForFlag.id) {
          return {
            ...h,
            flaggedPositions: newFlags,
            isDisqualified: isBlacklisted,
            finishedTime: isBlacklisted ? null : h.finishedTime
          };
        }
        return h;
      }));

      if (isBlacklisted && povHorse?.id === selectedHorseForFlag.id) {
        setPovHorse(null);
      }

      // Update commentary immediately for flag/violation
      if (isBlacklisted) {
        commentaryText.current = `🚩 TRUẤT QUYỀN THI ĐẤU! Chiến mã số ${selectedHorseForFlag.id} (${selectedHorseForFlag.name}) phạm quy lần 3 và bị loại (DSQ)!`;
      } else {
        commentaryText.current = `🚩 VI PHẠM! Trọng tài phạt cờ Chiến mã số ${selectedHorseForFlag.id} (${selectedHorseForFlag.name}) vì lỗi ${flagReason}!`;
      }
      lastCommentaryChange.current = Date.now() + 3500; // keep it on screen for 3.5s

      setShowFlagModal(false);
      setFlagReason('');
      setClickedProgress(null);
    } catch (err) {
      alert('Failed to flag: ' + err.message);
    }
  };

  // Sort horses in real-time based on progress/results for HUD leaderboard
  const sortedLeaderboard = [...horses].sort((a, b) => {
    if (a.finishedTime && b.finishedTime) {
      return a.finishedTime - b.finishedTime;
    }
    if (a.finishedTime) return -1;
    if (b.finishedTime) return 1;
    return b.progress - a.progress;
  });

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="ho-font-epilogue fs-3 fw-bold text-dark m-0">Live Simulation</h2>
                <span className="live-status-badge">
                  <span className="pulse-dot"></span> LIVE
                </span>
              </div>
              <p className="text-secondary small m-0">Virtual high-tech perspective tracking and incident flagging tool.</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            {racePhase === 'IDLE' || racePhase === 'FINISHED' ? (
              <button className="ho-btn ho-btn-gold-solid py-2 px-4" onClick={handleStart}>
                {racePhase === 'FINISHED' ? 'Restart Simulation' : 'Start Simulation'}
              </button>
            ) : racePhase === 'RUNNING' ? (
              <button className="ho-btn ho-btn-outline-danger py-2 px-4" onClick={handleStop}>
                Pause Simulation
              </button>
            ) : (
              <button className="ho-btn ho-btn-outline-secondary py-2 px-4" disabled>
                System Active...
              </button>
            )}
          </div>
        </div>

        <div className="sim-container">
          {/* Racetrack Visual Container */}
          <div className="glass-sim-card">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>analytics</span>
                {simulatedRaceName}
                {actualRaceId === 999 && (
                  <span className="badge bg-warning text-dark border border-warning-subtle py-1 px-2" style={{ fontSize: '10px' }}>DEMO MODE</span>
                )}
              </span>
              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Audio Controls */}
                <div className="d-flex align-items-center gap-2 px-2 py-1 rounded bg-light border" style={{ fontSize: '11px' }}>
                  <button
                    className="btn btn-sm p-1 d-flex align-items-center justify-content-center border-0 bg-transparent"
                    style={{ color: isSfxMuted ? '#dc3545' : '#198754' }}
                    onClick={toggleSfx}
                    title={isSfxMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {isSfxMuted ? 'volume_off' : 'volume_up'}
                    </span>
                  </button>

                  <div className="d-flex align-items-center gap-1">
                    <span className="text-secondary" style={{ fontSize: '10px' }}>Vol:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(volume * 100)}
                      onChange={handleVolumeChange}
                      className="form-range"
                      style={{ width: '50px', height: '4px', padding: 0 }}
                    />
                    <span className="text-dark fw-bold" style={{ width: '22px', textAlign: 'right', fontSize: '9px' }}>{Math.round(volume * 100)}%</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1 small text-secondary me-2">
                  <span>Theme:</span>
                  <select
                    className="form-select form-select-sm bg-white border-secondary text-dark"
                    style={{ fontSize: '11px', borderRadius: '20px', padding: '2px 24px 2px 8px', width: 'auto', minWidth: '120px' }}
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                  >
                    <option value="sunset">🌇 Sunset Twilight</option>
                    <option value="cyber">🛸 Cyber Neon</option>
                    <option value="sunny">☀️ Sunny Turf</option>
                    <option value="snow">❄️ Snowy Winter</option>
                    <option value="rain">🌧️ Rainy Storm</option>
                  </select>
                </div>
                <span className="stat-pill">Dist: <strong>2300m</strong></span>
                <span className="stat-pill">Track: <strong className="text-success">{environment === 'snow' ? 'SNOW' : environment === 'rain' ? 'MUD' : 'TURF'}</strong></span>
                <span className="stat-pill">Weather: <strong className={environment === 'snow' ? 'text-info' : environment === 'rain' ? 'text-primary' : environment === 'sunny' ? 'text-warning' : 'text-success'}>
                  {environment === 'snow' ? 'SNOWING' : environment === 'rain' ? 'RAINING' : environment === 'sunny' ? 'SUNNY' : 'CLEAR'}
                </strong></span>
                <span className="stat-pill">Temp: <strong>{environment === 'snow' ? '-2°C' : environment === 'rain' ? '18°C' : environment === 'sunny' ? '28°C' : '24°C'}</strong></span>
              </div>
            </div>

            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={880}
                height={495}
                onClick={handleCanvasClick}
                style={{ cursor: 'crosshair' }}
              />
              {povHorse && (
                <div className="pov-exit-hud">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-warning animate-pulse">videocam</span>
                    <span>Jockey POV: <strong>{povHorse.name}</strong> (Lane {povHorse.id})</span>
                  </div>
                  <button className="pov-exit-btn" onClick={() => setPovHorse(null)}>
                    Exit POV
                  </button>
                </div>
              )}
            </div>
            <div className="text-center mt-3 text-secondary small">
              💡 <span className="text-info">Tip:</span> Click directly on a track lane inside the simulator to quickly flag a violation at that specific progress position.
            </div>
          </div>

          {/* Right Floating Leaders Panel */}
          <div className="glass-hud-panel">
            <h4 className="fw-bold text-dark fs-5 mb-3 pb-2 d-flex align-items-center gap-2" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <span className="material-symbols-outlined text-warning">emoji_events</span>
              Leaderboard
            </h4>

            <div className="leaderboard-list">
              {sortedLeaderboard.map((horse, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={horse.id}
                    className={`leaderboard-item rank-${rank}`}
                    style={{ borderLeftColor: horse.color }}
                  >
                    <div className="leaderboard-rank">
                      {rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`}
                    </div>

                    <div className="leaderboard-horse-info">
                      <div className="leaderboard-horse-name d-flex align-items-center gap-2">
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: horse.color }}></span>
                        {horse.name}
                      </div>
                      <div className="leaderboard-jockey-name">{horse.jockeyName}</div>
                    </div>

                    <div className="leaderboard-metrics">
                      {racePhase === 'RUNNING' && horse.speed > 0 && (
                        <span className="badge bg-dark text-warning border border-warning-subtle me-2" style={{ fontSize: '9px', borderRadius: '4px', padding: '2px 5px' }}>
                          ⚡ {horse.speed} km/h
                        </span>
                      )}
                      <div className="leaderboard-progress">{Math.round(horse.progress)}%</div>
                      {racePhase === 'RUNNING' && !horse.isDisqualified && (
                        <button
                          className={`btn-pov-action me-1 ${povHorse?.id === horse.id ? 'active' : ''}`}
                          onClick={() => {
                            if (povHorse?.id === horse.id) {
                              setPovHorse(null);
                            } else {
                              setPovHorse(horse);
                            }
                          }}
                          title={povHorse?.id === horse.id ? "Exit POV" : "Jockey POV"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            {povHorse?.id === horse.id ? 'videocam_off' : 'videocam'}
                          </span>
                        </button>
                      )}
                      <button
                        className="btn-flag-action"
                        onClick={() => handleFlagClick(horse)}
                        title="Flag violation"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>flag</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showFlagModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => { setShowFlagModal(false); setClickedProgress(null); }}>
          <div className="modal-content-custom animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="fs-5 fw-bold mb-3 text-dark d-flex align-items-center gap-2">
              <span className="material-symbols-outlined text-danger">report</span>
              Flag Violation
            </h3>
            <p className="mb-2 text-secondary">Horse: <strong className="text-dark">{selectedHorseForFlag?.name}</strong></p>
            <p className="mb-3 text-secondary small">Flag Position: <strong className="text-primary-medium">{clickedProgress}%</strong> along the track</p>
            <div className="mb-4">
              <label className="ho-input-label mb-2">Reason for Flagging</label>
              <select
                className="ho-form-input"
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
              <button className="ho-btn ho-btn-outline-secondary" onClick={() => { setShowFlagModal(false); setClickedProgress(null); }}>Cancel</button>
              <button className="ho-btn ho-btn-outline-danger" onClick={submitFlag} disabled={!flagReason}>Submit Flag</button>
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
                className="ho-btn ho-btn-gold-solid flex-grow-1 py-2"
                onClick={() => setShowResultsSummary(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {racePhase === 'RAPHAEL' && (
        <RaphaelHUD
          horses={horses}
          environment={environment}
          onComplete={handleRaphaelComplete}
        />
      )}
    </>
  );
}
