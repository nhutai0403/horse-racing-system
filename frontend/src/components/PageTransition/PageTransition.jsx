/* PageTransition.jsx */
import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

// Hằng số định nghĩa danh sách các đỉnh của ngựa hologram (Low-poly)
const HORSE_NODES = {
  nose: [80, 20],
  headTop: [73, 15],
  jaw: [77, 26],
  neckCrest: [60, 24],
  neckBottom: [68, 38],
  withers: [50, 40],
  shoulder: [57, 50],
  chest: [68, 53],
  frontKneeL: [83, 53],
  frontHoofL: [93, 44],
  frontKneeR: [75, 62],
  frontHoofR: [83, 76],
  midBack: [38, 48],
  hips: [23, 62],
  flank: [35, 68],
  belly: [48, 65],
  rearThighL: [18, 77],
  rearHockL: [15, 87],
  rearHoofL: [22, 95],
  rearThighR: [28, 74],
  rearHockR: [30, 87],
  rearHoofR: [37, 93],
  tailTop: [15, 60],
  tailMid: [8, 75],
  tailTip: [11, 88]
};

// Định nghĩa các đa giác kết nối các đỉnh của ngựa
const HORSE_POLYGONS = [
  // Head
  ['headTop', 'nose', 'jaw'],
  ['headTop', 'jaw', 'neckCrest'],
  // Neck
  ['neckCrest', 'jaw', 'neckBottom'],
  ['neckCrest', 'neckBottom', 'withers'],
  ['withers', 'neckBottom', 'shoulder'],
  ['shoulder', 'neckBottom', 'chest'],
  // Shoulder to Front Leg Left
  ['shoulder', 'chest', 'frontKneeL'],
  ['frontKneeL', 'frontHoofL', 'chest'],
  // Shoulder to Front Leg Right
  ['shoulder', 'frontKneeR', 'frontHoofR'],
  ['shoulder', 'frontHoofR', 'flank'],
  // Torso
  ['withers', 'midBack', 'shoulder'],
  ['shoulder', 'midBack', 'belly'],
  ['midBack', 'hips', 'belly'],
  ['hips', 'flank', 'belly'],
  // Rear Leg Left
  ['hips', 'rearThighL', 'flank'],
  ['rearThighL', 'rearHockL', 'rearHoofL'],
  ['rearThighL', 'rearHoofL', 'flank'],
  // Rear Leg Right
  ['flank', 'rearThighR', 'belly'],
  ['rearThighR', 'rearHockR', 'rearHoofR'],
  ['rearThighR', 'rearHoofR', 'flank'],
  // Tail
  ['hips', 'tailTop', 'tailMid'],
  ['tailTop', 'tailMid', 'tailTip']
];

const PageTransition = ({ children, initialLoading = false }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  
  // Trạng thái chuyển động: 'idle' | 'closing' | 'loading' | 'opening'
  const [transitionState, setTransitionState] = useState(initialLoading ? 'loading' : 'opening');
  const prevPathRef = useRef(location.pathname);

  // Sinh các hạt không trọng lực ngẫu nhiên
  const particles = useMemo(() => {
    const list = [];
    // 25 hạt bụi vàng
    for (let i = 0; i < 25; i++) {
      list.push({
        id: `gold-${i}`,
        type: 'gold',
        x: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2.5}s`,
        duration: `${2 + Math.random() * 3}s`,
        wobble: `${-20 + Math.random() * 40}px`
      });
    }
    // 15 tia sáng neon xanh dương
    for (let i = 0; i < 15; i++) {
      list.push({
        id: `blue-${i}`,
        type: 'blue',
        x: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2.5}s`,
        duration: `${1.5 + Math.random() * 2}s`
      });
    }
    return list;
  }, []);

  // Lắng nghe sự thay đổi của Route để kích hoạt hiệu ứng sập rào chắn
  useEffect(() => {
    if (initialLoading) return;

    if (location.pathname !== prevPathRef.current) {
      setTransitionState('closing');
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname, initialLoading]);

  // Quản lý luồng trạng thái chuyển đổi
  useEffect(() => {
    let timer;

    if (transitionState === 'closing') {
      // Đợi rào chắn đóng sập lại (350ms tương ứng thời gian animation CSS)
      timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionState('loading');
      }, 350);
    } else if (transitionState === 'loading') {
      // Nếu là chế độ tải trang ban đầu, đợi tín hiệu kết thúc từ bên ngoài,
      // ngược lại đối với chuyển trang thông thường, hiển thị hiệu ứng loading 400ms để tạo nhịp nhanh gọn.
      if (!initialLoading) {
        timer = setTimeout(() => {
          setTransitionState('opening');
        }, 400);
      }
    } else if (transitionState === 'opening') {
      // Đợi rào chắn mở hoàn toàn để kết thúc
      timer = setTimeout(() => {
        setTransitionState('idle');
      }, 350);
    }

    return () => clearTimeout(timer);
  }, [transitionState, children, initialLoading]);

  // Cho phép bên ngoài kết thúc trạng thái loading ban đầu
  useEffect(() => {
    if (initialLoading && transitionState === 'loading') {
      // Khi component cha báo đã load xong (children thay đổi hoặc sẵn sàng), chuyển sang mở rào chắn
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionState('opening');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialLoading, children]);

  // Render các đỉnh và đường vẽ của ngựa hologram
  const renderHologramHorse = () => {
    return (
      <svg className="pt-hologram-horse-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hologram-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Các đa giác mặt cắt công nghệ */}
        {HORSE_POLYGONS.map((poly, idx) => {
          const pointsStr = poly.map(nodeKey => HORSE_NODES[nodeKey].join(',')).join(' ');
          return (
            <polygon
              key={`poly-${idx}`}
              points={pointsStr}
              fill="url(#hologram-grad)"
              stroke="#00f0ff"
              strokeWidth="0.4"
              strokeOpacity="0.4"
            />
          );
        })}

        {/* Các đường kết nối chính nổi bật */}
        {HORSE_POLYGONS.map((poly, idx) => {
          const p1 = HORSE_NODES[poly[0]];
          const p2 = HORSE_NODES[poly[1]];
          const p3 = HORSE_NODES[poly[2]];
          return (
            <g key={`lines-${idx}`}>
              <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="#00f0ff" strokeWidth="0.8" strokeOpacity="0.8" />
              <line x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} stroke="#00f0ff" strokeWidth="0.8" strokeOpacity="0.8" />
              <line x1={p3[0]} y1={p3[1]} x2={p1[0]} y2={p1[1]} stroke="#00f0ff" strokeWidth="0.8" strokeOpacity="0.8" />
            </g>
          );
        })}

        {/* Các điểm nút (Vertices) phát sáng dạng hạt tròn */}
        {Object.entries(HORSE_NODES).map(([key, coords]) => (
          <circle
            key={`node-${key}`}
            cx={coords[0]}
            cy={coords[1]}
            r="1.2"
            fill="#ffffff"
            filter="drop-shadow(0 0 3px #00f0ff)"
          />
        ))}
      </svg>
    );
  };

  return (
    <>
      {/* Nội dung trang hiện tại được hiển thị dưới lớp phủ */}
      {displayChildren}

      {/* Lớp phủ rào chắn và loading */}
      <div className={`page-transition-overlay state-${transitionState}`}>
        {/* Rào chắn bên trái */}
        <div className="pt-gate pt-gate-left">
          <div className="pt-gate-edge-glow" />
          <div className="pt-gate-warning-lines" />
        </div>

        {/* Rào chắn bên phải */}
        <div className="pt-gate pt-gate-right">
          <div className="pt-gate-edge-glow" />
          <div className="pt-gate-warning-lines" />
        </div>

        {/* Khu vực loading hologram trung tâm */}
        <div className="pt-center-hub">
          {/* Vòng tròn xoay Loading */}
          <div className="pt-loading-circle-glow" />
          <div className="pt-loading-circle-outer" />
          <div className="pt-loading-circle-inner" />

          {/* Ngựa đua Hologram */}
          <div className="pt-hologram-container">
            {renderHologramHorse()}
            <div className="pt-hologram-scanline-overlay" />
            <div className="pt-laser-sweep" />
          </div>

          {/* Dòng trạng thái hệ thống */}
          <div className="pt-system-loading-text">
            SYSTEM CONNECTING...
          </div>
        </div>

        {/* Hệ thống hạt không trọng lực */}
        <div className="pt-particles-container">
          {particles.map((p) => (
            <div
              key={p.id}
              className={p.type === 'gold' ? 'pt-particle-gold' : 'pt-particle-blue'}
              style={{
                '--x': p.x,
                '--delay': p.delay,
                '--d': p.duration,
                ...(p.wobble ? { '--wobble': p.wobble } : {})
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default PageTransition;
