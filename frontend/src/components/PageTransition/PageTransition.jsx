/* PageTransition.jsx */
import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';
import logo from '../../assets/logo.png';

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
      // Check if both previous and new path are within the same dashboard layout
      const isOwnerRoute = (path) => path.startsWith('/owner');
      const isJockeyRoute = (path) => path.startsWith('/jockey');
      
      if (
        (isOwnerRoute(location.pathname) && isOwnerRoute(prevPathRef.current)) ||
        (isJockeyRoute(location.pathname) && isJockeyRoute(prevPathRef.current))
      ) {
        // Skip transition animation for internal dashboard navigation
        prevPathRef.current = location.pathname;
        return;
      }

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

          {/* Logo Thương Hiệu Hologram */}
          <div className="pt-hologram-container">
            <img src={logo} alt="EquineElite Logo" className="pt-hologram-logo-img" />
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
