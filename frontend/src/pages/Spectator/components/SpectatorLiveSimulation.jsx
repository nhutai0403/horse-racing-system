import React, { useState, useEffect, useRef } from 'react';
import { getRaceParticipantsAPI } from '../../../services/races';
import { getMyBetsAPI } from '../../../services/bets';
import RaphaelHUD from '../../Race-Referee/RaphaelHUD';
import { audioManager } from '../../Race-Referee/audioHelper';
import '../../Race-Referee/LiveSimulation.css';

const darkenColor = (hex, percent) => {
  let num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent * 100),
    R = (num >> 16) - amt,
    G = (num >> 8 & 0x00FF) - amt,
    B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 + (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 + (B < 0 ? 0 : B > 255 ? 255 : B)).toString(16).slice(1);
};

export default function SpectatorLiveSimulation({ race, onClose }) {
  const [horses, setHorses] = useState([]);
  const numLanes = Math.max(1, horses.length);
  const [racePhase, setRacePhase] = useState('IDLE'); // IDLE, RAPHAEL, PRE_RACE, RUNNING, FINISHED
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [finalPodium, setFinalPodium] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);

  // Sound settings state
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [environment, setEnvironment] = useState('sunset');
  const [povHorse, setPovHorse] = useState(null);

  const canvasRef = useRef(null);
  const horsesRef = useRef(horses);
  const povHorseRef = useRef(null);
  const visualHorses = useRef([]);
  const confettiParticles = useRef([]);
  const shakeIntensity = useRef(0);
  const lastCommentaryChange = useRef(0);
  const commentaryText = useRef("Chào mừng quý khách đến với trường đua trực tiếp!");
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
      `Các chiến mã đang dồn hết thể lực cho những mét đua quyết định!`
    );

    commentaryText.current = comments[Math.floor(Math.random() * comments.length)];
    lastCommentaryChange.current = now;
  };

  useEffect(() => {
    horsesRef.current = horses;
  }, [horses]);

  useEffect(() => {
    povHorseRef.current = povHorse;
  }, [povHorse]);

  // Load participants and spectator bets on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingBets(true);
        // Load participants
        const participants = await getRaceParticipantsAPI(race.id);
        const mappedHorses = (participants || []).map((p, idx) => ({
          id: p.gateNumber || (idx + 1),
          participantId: p.id,
          horseId: p.horseId,
          name: p.horseName,
          jockeyName: p.jockeyName,
          ownerName: 'Chủ ngựa liên kết',
          weight: (450 + Math.random() * 50).toFixed(1),
          progress: 0,
          color: ['#00f2fe', '#10b981', '#ef4444', '#d4af37', '#9333ea', '#f472b6', '#3b82f6'][idx % 7],
          flaggedPositions: [],
          isDisqualified: p.status === 'DISQUALIFIED'
        }));
        setHorses(mappedHorses);
        visualHorses.current = mappedHorses.map(h => ({ ...h, visualProgress: 0, trail: [], bubbleText: '', bubbleTimer: 0 }));

        // Load spectator bets for this race
        const bets = await getMyBetsAPI();
        const raceBets = (bets || []).filter(b => b.raceId === race.id || b.raceId === parseInt(race.id));
        setMyBets(raceBets);

        // Auto start sequence
        setRacePhase('RAPHAEL');
      } catch (err) {
        console.error("Failed to load spectator simulation data", err);
      } finally {
        setLoadingBets(false);
      }
    };
    loadData();

    // Clean up sounds when leaving
    return () => {
      audioManager.stopSfx('crowd');
      audioManager.stopSfx('rain');
      audioManager.stopSfx('bg_music');
    };
  }, [race.id]);

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
              const advance = 0.5 + Math.random() * 1.5;
              const newProgress = Math.min(100, h.progress + advance);
              if (newProgress < 100) allFinished = false;

              let finishedTime = h.finishedTime;
              if (newProgress === 100 && !h.finishedTime) {
                finishedTime = Date.now();
                triggerConfetti();
                shakeIntensity.current = 12;

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
            const results = sorted.map((h, index) => ({
              rank: h.isDisqualified ? 'DSQ' : index + 1,
              horseName: h.name,
              jockeyName: h.jockeyName,
              time: h.isDisqualified ? 'Disqualified' : `1m ${15 + index * 2}s`
            }));
            setFinalPodium(results);
            setShowResultsSummary(true);

            const winner = sorted.find(h => !h.isDisqualified);
            if (winner) {
              commentaryText.current = `🏁 CUỘC ĐUA KẾT THÚC! Chiến thắng thuộc về ${winner.name} (Số ${winner.id})!`;
            } else {
              commentaryText.current = `🏁 CUỘC ĐUA KẾT THÚC! Tất cả chiến mã đều phạm quy!`;
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
        if (environment === 'rain') {
          audioManager.playSfx('rain', true);
        }

        for (let i = 1; i <= numLanes; i++) {
          await new Promise(r => setTimeout(r, 600));
          if (isCancelled) return;
          setSpawnedCount(i);
          audioManager.playIntroChime();
          const currentHorseName = horsesRef.current[i - 1]?.name || `Chiến mã ${i}`;
          commentaryText.current = `Đang dắt chiến mã số ${i} (${currentHorseName}) vào cổng xuất phát...`;
        }
        await new Promise(r => setTimeout(r, 600));
        for (let i = 5; i > 0; i--) {
          if (isCancelled) return;
          setCountdown(i.toString());
          audioManager.playCountdownBeep(false);
          commentaryText.current = `Chuẩn bị xuất phát... T-minus ${i} giây!`;
          await new Promise(r => setTimeout(r, 1000));
        }
        if (isCancelled) return;
        setCountdown('GO!');
        audioManager.playCountdownBeep(true);
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

  const handleRaphaelComplete = () => {
    setRacePhase('PRE_RACE');
  };

  const toggleSfx = () => {
    const nextMute = !isSfxMuted;
    setIsSfxMuted(nextMute);
    audioManager.muteAll(nextMute);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value) / 100;
    setVolume(val);
    audioManager.setMasterVolume(val);
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let speedOffset = 0;

    const clouds = [
      { x: canvas.width * 0.1, y: canvas.height * 0.08, w: 90, h: 25, speed: 0.1 },
      { x: canvas.width * 0.45, y: canvas.height * 0.05, w: 140, h: 35, speed: 0.07 },
      { x: canvas.width * 0.75, y: canvas.height * 0.12, w: 100, h: 28, speed: 0.12 }
    ];

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
      const horizonY = H * 0.32;
      const startX = W * 0.06;
      const endX = W * 0.94;
      const Vx = W / 2;

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

      ctx.save();
      if (shakeIntensity.current > 0) {
        const dx = (Math.random() - 0.5) * shakeIntensity.current;
        const dy = (Math.random() - 0.5) * shakeIntensity.current;
        ctx.translate(dx, dy);
        shakeIntensity.current *= 0.88;
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

        ctx.beginPath();
        ctx.moveTo(tx(topX1, 0), topY1_val);
        ctx.lineTo(tx(topX2, 0), topY2_val);
        ctx.lineTo(tx(bottomX2, 1), bottomY2);
        ctx.lineTo(tx(bottomX1, 1), bottomY1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

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
          const count = Math.floor(25 + 65 * ratio);

          for (let i = 0; i < count; i++) {
            const xRatio = i / (count - 1 || 1);
            const x = startX_tier + (endX_tier - startX_tier) * xRatio;
            const y = startY_tier + (endY_tier - startY_tier) * xRatio;
            const seed = (tier * 100 + i) * 2.3;
            const bob = (racePhase === 'RUNNING') ? Math.sin(timeSec * 3 + seed) * (1.2 + 3.8 * ratio) : 0;
            const shiftedX = tx(x, ratio);

            if (racePhase === 'RUNNING' && (i + tier) % 3 === 0) {
              ctx.strokeStyle = '#fca5a5';
              ctx.lineWidth = Math.max(1, size * 0.22);
              ctx.beginPath();
              ctx.moveTo(shiftedX - size * 0.22, y - size * 0.8 + bob);
              ctx.lineTo(shiftedX - size * 0.55, y - size * 1.5 + bob + Math.cos(timeSec * 6 + seed) * (size * 0.4));
              ctx.moveTo(shiftedX + size * 0.22, y - size * 0.8 + bob);
              ctx.lineTo(shiftedX + size * 0.55, y - size * 1.5 + bob + Math.sin(timeSec * 6 + seed) * (size * 0.4));
              ctx.stroke();
            }

            ctx.fillStyle = crowdColors[(tier + i) % crowdColors.length];
            ctx.beginPath();
            ctx.arc(shiftedX, y - size * 0.8 + bob, size * 0.45, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fca5a5';
            ctx.beginPath();
            ctx.arc(shiftedX, y - size * 1.25 + bob, size * 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = crowdColors[(tier + i + 3) % crowdColors.length];
            ctx.beginPath();
            ctx.arc(shiftedX, y - size * 1.4 + bob, size * 0.28, Math.PI, 0);
            ctx.fill();

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

      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, config.skyColors[0]);
      skyGrad.addColorStop(0.6, config.skyColors[1]);
      skyGrad.addColorStop(1, config.skyColors[2]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY);

      let sunR = config.sunRadius;
      if (environment === 'sunny') {
        sunR = config.sunRadius + Math.sin(Date.now() * 0.003) * 6;
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

      ctx.fillStyle = config.grassColor;
      ctx.fillRect(0, horizonY, W, H - horizonY);

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

      ctx.fillStyle = config.grassColor;
      ctx.beginPath();
      ctx.moveTo(tx(0, 0), horizonY);
      ctx.lineTo(tx(W, 0), horizonY);
      ctx.lineTo(tx(W, 1), H);
      ctx.lineTo(tx(0, 1), H);
      ctx.closePath();
      ctx.fill();

      drawStands(true);
      drawStands(false);

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
      } else {
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

      const numKerbs = 24;
      const runningOffset = racePhase === 'RUNNING' ? speedOffset * numKerbs : 0;

      for (let s = 0; s < numKerbs; s++) {
        const tValStart = ((s + runningOffset) % numKerbs) / numKerbs;
        const tValEnd = (((s + 1 + runningOffset) % numKerbs) / numKerbs);
        if (tValStart > tValEnd) continue;

        const yStart = horizonY + (H - horizonY) * (tValStart * tValStart);
        const yEnd = horizonY + (H - horizonY) * (tValEnd * tValEnd);

        const lxStart = Vx - 18 + (startX - (Vx - 18)) * tValStart;
        const lxEnd = Vx - 18 + (startX - (Vx - 18)) * tValEnd;
        const l_oxStart = lxStart - 8 * tValStart;
        const l_oxEnd = lxEnd - 8 * tValEnd;

        const rxStart = Vx + 18 + (endX - (Vx + 18)) * tValStart;
        const rxEnd = Vx + 18 + (endX - (Vx + 18)) * tValEnd;
        const r_oxStart = rxStart + 8 * tValStart;
        const r_oxEnd = rxEnd + 8 * tValEnd;

        let primaryColor, secondaryColor;
        if (environment === 'cyber') {
          primaryColor = '#ec4899';
          secondaryColor = '#00f2fe';
        } else if (environment === 'snow') {
          primaryColor = '#94a3b8';
          secondaryColor = '#ffffff';
        } else {
          primaryColor = '#ef4444';
          secondaryColor = '#ffffff';
        }

        const colorVal = Math.floor(s + runningOffset);
        const isEven = Math.abs(colorVal) % 2 === 0;
        const fillColor = isEven ? primaryColor : secondaryColor;

        ctx.fillStyle = fillColor;

        ctx.beginPath();
        ctx.moveTo(tx(lxStart, tValStart), yStart);
        ctx.lineTo(tx(lxEnd, tValEnd), yEnd);
        ctx.lineTo(tx(l_oxEnd, tValEnd), yEnd);
        ctx.lineTo(tx(l_oxStart, tValStart), yStart);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(tx(rxStart, tValStart), yStart);
        ctx.lineTo(tx(rxEnd, tValEnd), yEnd);
        ctx.lineTo(tx(r_oxEnd, tValEnd), yEnd);
        ctx.lineTo(tx(r_oxStart, tValStart), yStart);
        ctx.closePath();
        ctx.fill();
      }

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

          ctx.strokeStyle = '#475569';
          ctx.lineWidth = Math.max(1, 2 * t1_val);
          ctx.beginPath();
          ctx.moveTo(bx1_shifted, y1);
          ctx.lineTo(bx1_shifted, y1 - h1 * 0.4);
          ctx.moveTo(bx2_shifted, y2);
          ctx.lineTo(bx2_shifted, y2 - h2 * 0.4);
          ctx.stroke();

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

      ctx.strokeStyle = config.fenceColor;
      ctx.lineWidth = 2.5;
      ctx.save();
      if (environment === 'cyber') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = config.fenceColor;
      }

      ctx.beginPath();
      ctx.moveTo(tx(Vx - 18, 0), horizonY);
      ctx.lineTo(tx(startX, 1), H - 40);
      ctx.moveTo(tx(Vx - 18, 0), horizonY);
      ctx.lineTo(tx(startX, 1), H - 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tx(Vx + 18, 0), horizonY);
      ctx.lineTo(tx(endX, 1), H - 40);
      ctx.moveTo(tx(Vx + 18, 0), horizonY);
      ctx.lineTo(tx(endX, 1), H - 20);
      ctx.stroke();
      ctx.restore();

      const numPosts = 12;
      for (let k = 0; k <= numPosts; k++) {
        const val = getPovT((k / numPosts) * 100);
        if (val < 0) continue;
        const t = val * val;
        const y = horizonY + (H - horizonY) * t;
        const postH = 40 * t;
        const postW = Math.max(1, 4 * t);

        const lx = Vx - 18 + (startX - (Vx - 18)) * t;
        const leftGrad = ctx.createLinearGradient(lx - postW / 2, y, lx + postW / 2, y);
        leftGrad.addColorStop(0, config.postColor);
        leftGrad.addColorStop(0.5, '#ffffff');
        leftGrad.addColorStop(1, config.postColor);
        ctx.fillStyle = environment === 'cyber' ? config.postColor : leftGrad;
        ctx.fillRect(tx(lx, val) - postW / 2, y - postH, postW, postH);

        const rx = Vx + 18 + (endX - (Vx + 18)) * t;
        const rightGrad = ctx.createLinearGradient(rx - postW / 2, y, rx + postW / 2, y);
        rightGrad.addColorStop(0, config.postColor);
        rightGrad.addColorStop(0.5, '#ffffff');
        rightGrad.addColorStop(1, config.postColor);
        ctx.fillStyle = environment === 'cyber' ? config.postColor : rightGrad;
        ctx.fillRect(tx(rx, val) - postW / 2, y - postH, postW, postH);
      }

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

      const gateVal = getPovT(0);
      if (gateVal >= 0) {
        const gateT_sq = gateVal * gateVal;
        const y_gate = horizonY + (H - horizonY) * gateT_sq;
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

          ctx.fillStyle = environment === 'cyber' ? '#00f2fe' : '#a1a1aa';
          ctx.fillRect(xL_shifted - 1, y_gate - 12 * gateVal, 2, 12 * gateVal);
          if (laneIndex === numLanes - 1) {
            ctx.fillRect(xR_shifted - 1, y_gate - 12 * gateVal, 2, 12 * gateVal);
          }

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
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = Math.max(0.5, 0.8 * gateVal);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(gateWidth, -3 * gateVal);
            ctx.moveTo(0, -3 * gateVal);
            ctx.lineTo(gateWidth, 0);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -9 * gateVal);
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      // Draw flags (Spectator only displays them)
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

      if (racePhase === 'PRE_RACE') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, W, H);
      }

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

          if (activePov && vHorse.id === activePov.id) return;

          const val = getPovT(vHorse.visualProgress);
          if (val < 0) return;

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

          ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * t})`;
          ctx.beginPath();
          ctx.ellipse(horseX_shifted, baseHorseY + 2 * t, size * 0.45, size * 0.16, 0, 0, Math.PI * 2);
          ctx.fill();

          if (racePhase === 'RUNNING' && vHorse.visualProgress < 100 && speedVal > 0) {
            ctx.save();
            ctx.strokeStyle = environment === 'cyber' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.2 * t;
            ctx.beginPath();
            ctx.moveTo(horseX_shifted, horseY - size * 0.1);
            ctx.lineTo(horseX_shifted - size * 1.5, horseY - size * 0.1);
            ctx.moveTo(horseX_shifted - size * 0.2, horseY + size * 0.15);
            ctx.lineTo(horseX_shifted - size * 1.8, horseY + size * 0.15);
            ctx.stroke();

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

          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = horseColor;
          ctx.strokeStyle = horseColor;
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.ellipse(horseX_shifted, horseY - size * 0.4, size * 0.38, size * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(horseX_shifted, horseY - size * 0.4, size * 0.36, size * 0.36, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(5, Math.floor(10 * t))}px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText("🏇", horseX_shifted, horseY - size * 0.4);

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(6, Math.floor(10 * t))}px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(vHorse.id.toString(), horseX_shifted, horseY - size * 0.85);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = `${Math.max(5, Math.floor(8 * t))}px 'Inter', sans-serif`;
          ctx.fillText(vHorse.name, horseX_shifted, horseY + size * 0.3);
        });
      }

      if (environment === 'snow') {
        ctx.fillStyle = '#ffffff';
        snowFlakes.forEach(f => {
          f.y += f.speedY;
          f.x += f.speedX;
          if (f.y > H) f.y = 0;
          if (f.x > W) f.x = 0;
          if (f.x < 0) f.x = W;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (environment === 'rain') {
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.4)';
        ctx.lineWidth = 1.2;
        rainDrops.forEach(r => {
          r.y += r.speedY;
          r.x += r.speedX;
          if (r.y > H) {
            r.y = 0;
            r.x = Math.random() * W;
          }
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + r.speedX * 0.6, r.y + r.l);
          ctx.stroke();
        });

        if (Math.random() < 0.008) {
          lightningIntensity.current = 1.0;
          shakeIntensity.current = 8;
          audioManager.playThunder();
        }
        if (lightningIntensity.current > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${lightningIntensity.current * 0.85})`;
          ctx.fillRect(0, 0, W, H);
          lightningIntensity.current *= 0.82;
          if (lightningIntensity.current < 0.05) lightningIntensity.current = 0;
        }
      }

      if (racePhase === 'FINISHED') {
        fireworks.current.forEach((fw, idx) => {
          if (Math.random() < 0.15 && fw.particles.length === 0) {
            const targetX = W * 0.2 + Math.random() * W * 0.6;
            const targetY = H * 0.15 + Math.random() * H * 0.25;
            const colors = ['#ff2a5f', '#00f2fe', '#d4af37', '#10b981', '#a78bfa'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            for (let i = 0; i < 40; i++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 1.5 + Math.random() * 3.5;
              fw.particles.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                alpha: 1.0,
                color
              });
            }
          }
          fw.particles.forEach((p, pIdx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.alpha -= 0.025;
            if (p.alpha <= 0) {
              fw.particles.splice(pIdx, 1);
            } else {
              ctx.save();
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = p.color;
              ctx.shadowBlur = 6;
              ctx.shadowColor = p.color;
              ctx.fillRect(p.x, p.y, 3, 3);
              ctx.restore();
            }
          });
        });
      }

      if (racePhase === 'RUNNING' || racePhase === 'FINISHED') {
        confettiParticles.current.forEach((p, index) => {
          p.vy += p.gravity;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.alpha -= 0.01;

          if (p.alpha <= 0 || p.y > H) {
            confettiParticles.current.splice(index, 1);
          } else {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
          }
        });
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(15, H - 42, W - 30, 28);
      ctx.fillStyle = '#10b981';
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = 'left';
      ctx.fillText("📢 COMMENTARY:", 25, H - 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillText(commentaryText.current, 125, H - 24);

      if (countdown !== null) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = countdown === 'GO!' ? '#10b981' : '#ef4444';
        ctx.fillStyle = countdown === 'GO!' ? '#10b981' : '#ef4444';
        ctx.font = "bold 96px 'Outfit', 'Inter', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdown, W / 2, H / 2 - 20);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    // Initialize fireworks slots
    fireworks.current = Array.from({ length: 3 }, () => ({ particles: [] }));

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [racePhase, environment, numLanes]);

  const lightningIntensity = useRef(0);

  // Play gallop sound and ambient noise during running phase
  useEffect(() => {
    if (racePhase === 'RUNNING') {
      audioManager.playSfx('gallop', true);
      audioManager.playSfx('crowd', true);
      audioManager.setSfxVolume('crowd', 0.3); // low ambient crowd
    } else {
      audioManager.stopSfx('gallop');
      if (racePhase !== 'FINISHED') {
        audioManager.stopSfx('crowd');
      }
    }
  }, [racePhase]);

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
        {/* Top bar with back button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button className="ho-btn ho-btn-outline-secondary py-2 px-3 d-flex align-items-center gap-1" onClick={onClose}>
              <span className="material-symbols-outlined">arrow_back</span> Quay lại
            </button>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="ho-font-epilogue fs-4 fw-bold text-dark m-0">Đua Giả Lập Trực Tiếp</h2>
                <span className="live-status-badge">
                  <span className="pulse-dot"></span> LIVE VIEW
                </span>
              </div>
              <p className="text-secondary small m-0">Màn hình giám sát sa bàn đua trực quan của người xem.</p>
            </div>
          </div>
          <div className="stat-pill">
            Trạng thái trận: <strong className="text-success text-uppercase">{racePhase === 'FINISHED' ? 'Đã kết thúc' : racePhase === 'RUNNING' ? 'Đang chạy' : 'Chuẩn bị'}</strong>
          </div>
        </div>

        <div className="sim-container">
          {/* Visual Canvas Panel */}
          <div className="glass-sim-card">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>emoji_events</span>
                {race.raceName}
              </span>
              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Audio controls */}
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
                      style={{ width: '55px', height: '4px', padding: 0 }}
                    />
                    <span className="text-dark fw-bold" style={{ width: '22px', textAlign: 'right', fontSize: '9px' }}>{Math.round(volume * 100)}%</span>
                  </div>
                </div>

                {/* Weather select */}
                <div className="d-flex align-items-center gap-1 small text-secondary me-2">
                  <span>Môi trường:</span>
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
                <span className="stat-pill">Cự ly: <strong>{race.distance}m</strong></span>
                <span className="stat-pill">Đường đua: <strong className="text-success">{environment === 'snow' ? 'SNOW' : environment === 'rain' ? 'MUD' : 'TURF'}</strong></span>
              </div>
            </div>

            {/* Canvas track */}
            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={880}
                height={495}
              />
              {povHorse && (
                <div className="pov-exit-hud">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-warning animate-pulse">videocam</span>
                    <span>Theo dõi POV: <strong>{povHorse.name}</strong> (Làn {povHorse.id})</span>
                  </div>
                  <button className="pov-exit-btn" onClick={() => setPovHorse(null)}>
                    Thoát POV
                  </button>
                </div>
              )}
            </div>
            <div className="text-center mt-3 text-secondary small">
              💡 Màn hình giả lập chỉ xem để theo dõi thứ hạng trực quan thời gian thực.
            </div>
          </div>

          {/* Right Floating Leaderboard & Bets Panel */}
          <div className="d-flex flex-column gap-3">
            {/* Leaderboard */}
            <div className="glass-hud-panel" style={{ minHeight: '340px' }}>
              <h4 className="fw-bold text-dark fs-6 mb-3 pb-2 d-flex align-items-center gap-2" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <span className="material-symbols-outlined text-warning">emoji_events</span>
                Bảng xếp hạng
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
                            title={povHorse?.id === horse.id ? "Thoát POV" : "Theo dõi nài ngựa"}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                              {povHorse?.id === horse.id ? 'videocam_off' : 'videocam'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spectator Bets for this Race */}
            <div className="glass-card p-3">
              <h4 className="fw-bold text-dark fs-6 mb-3 pb-2 d-flex align-items-center gap-2" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <span className="material-symbols-outlined text-success">local_atm</span>
                Cược của tôi trong trận này
              </h4>

              {loadingBets ? (
                <div className="text-center py-3 text-secondary small">Đang tải vé cược...</div>
              ) : myBets.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  Bạn không đặt cược vé nào cho cuộc đua này.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {myBets.map(bet => (
                    <div key={bet.id} className="p-2 rounded border bg-light d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="text-dark small block">{bet.horseName}</strong>
                        <span className="text-secondary block" style={{ fontSize: '10px' }}>
                          Cửa: <strong className="text-success">{bet.betType}</strong> | Tiền: {bet.amount?.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${
                          bet.status === 'WON' ? 'bg-success' :
                          bet.status === 'LOST' ? 'bg-danger' :
                          bet.status === 'REFUNDED' ? 'bg-secondary' :
                          'bg-warning text-dark'
                        } text-uppercase mb-1`} style={{ fontSize: '8px', display: 'block' }}>
                          {bet.status === 'WON' ? 'Thắng cược' : bet.status === 'LOST' ? 'Thua cược' : bet.status === 'REFUNDED' ? 'Hoàn tiền' : 'Đang cược'}
                        </span>
                        {bet.status === 'WON' && (
                          <span className="text-success fw-bold block" style={{ fontSize: '10px' }}>
                            +{bet.payoutAmount?.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results overlay */}
      {showResultsSummary && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowResultsSummary(false)}>
          <div className="modal-content-custom animate-scale-up text-center p-4" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined text-warning mb-2" style={{ fontSize: '64px' }}>
              emoji_events
            </span>
            <h3 className="ho-font-epilogue fs-4 fw-bold text-dark mb-1">Cuộc đua hoàn tất!</h3>
            <p className="text-secondary small mb-4">{race.raceName}</p>

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
                Đóng
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
