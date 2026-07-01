import React from 'react';
import heroBg from '../../../assets/background.jpg';

export default function HeroSection() {
  return (
    <section className="hero-section" aria-label="Equine competition hero">
      <img src={heroBg} alt="Equestrian Racing" className="hero-bg-img" />
      <div className="hero-gradient-overlay" />
      <div className="hero-racing-lines" />

      <div className="hero-container-inner">
        <div className="hero-text-content">
          <p className="hero-eyebrow">Hệ thống Bảng điều khiển Giải đấu và Đường đua Quốc gia</p>
          <h1 className="hero-title">
            Trải nghiệm <span>Đỉnh Cao</span> Đua Ngựa Chuyên Nghiệp
          </h1>
          <p className="hero-description">
            Quản lý, theo dõi và tham gia các giải đua ngựa độc quyền nhất thế giới theo thời gian thực. Nơi di sản giao thoa cùng công nghệ tối tân.
          </p>
          <div className="hero-btn-group">
            <button className="btn-primary-luxury" type="button">Xem Đua Trực Tiếp</button>
            <button className="btn-secondary-luxury" type="button">Tham Gia Giải Đấu</button>
          </div>
        </div>

        <div className="track-preview-card" aria-label="Track preview countdown">
          <div className="track-card-header">
            <span className="track-label">Đường Đua Sắp Tới: Royal Ascot</span>
            <span className="live-status"><span className="pulse-dot" /> Mô phỏng 3D</span>
          </div>
          <div className="svg-track-container">
            <span className="track-ring ring-one" />
            <span className="track-ring ring-two" />
            <span className="track-ring ring-three" />
            <div className="countdown-box">
              <div className="countdown-time">02:03:08</div>
              <div className="countdown-sub">Giải Tiếp Theo Bắt Đầu Sau</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
