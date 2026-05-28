import React from 'react';
import './Home.css';

// Đảm bảo các file này tồn tại đúng trong src/assets/
import heroBg from '../../assets/background.jpg';
import tournament1 from '../../assets/background1.jpg';
import tournament2 from '../../assets/background2.jpg';
import tournament3 from '../../assets/background3.jpg';

const Home = () => {
  return (
    <div className="home-page-wrapper">
      <main className="main-content">
        
        {/* HERO BANNER */}
        <section className="hero-section">
          <div className="hero-bg-container">
            <img src={heroBg} alt="Equestrian Racing" className="hero-bg-img" />
          </div>
          <div className="hero-gradient-overlay" />
          
          <div className="hero-container-inner">
            <div className="hero-text-content">
              <h1 className="hero-title">
                Experience the <span className="text-highlight">Apex</span> of Equine Competition
              </h1>
              <p className="hero-description">
                Manage, track, and engage with the world's most exclusive horse racing tournaments in real-time. Where heritage meets high-performance technology.
              </p>
              <div className="hero-btn-group">
                <button className="btn-primary-luxury">Watch Live Races</button>
                <button className="btn-secondary-luxury">Join Tournament</button>
              </div>
            </div>

            <div className="track-preview-card">
              <div className="track-card-header">
                <span className="track-label">Track Preview: Royal Ascot</span>
                <div className="live-status">
                  <span className="pulse-dot" /> Live Rendering
                </div>
              </div>
              <div className="svg-track-container">
                <div className="countdown-box">
                  <div className="countdown-time">02:03:08</div>
                  <div className="countdown-sub">Next Match Starts In</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO STATS */}
        <section className="stats-section">
          <div className="global-container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👑</div>
                <div className="stat-label">Live Races</div>
                <h3 className="stat-number">12</h3>
                <div className="stat-trend">↗ +4 from yesterday</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💵</div>
                <div className="stat-label">Total Prize Pool</div>
                <h3 className="stat-number">$4.2M</h3>
                <div className="stat-trend">🌐 Worldwide contributions</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-label">Active Horses</div>
                <h3 className="stat-number">842</h3>
                <div className="stat-trend">✓ Elite verified stables</div>
              </div>
            </div>
          </div>
        </section>

        {/* UPCOMING TOURNAMENTS */}
        <section className="tournaments-section">
          <div className="global-container">
            <div className="section-header-row">
              <div>
                <h2 className="section-main-title">Upcoming Tournaments</h2>
                <p className="section-subtitle">The most prestigious events in the racing calendar.</p>
              </div>
              <div className="carousel-controls">
                <button className="control-btn">‹</button>
                <button className="control-btn">›</button>
              </div>
            </div>

            <div className="tournaments-grid">
              <div className="tournament-card">
                <img src={tournament1} alt="Emerald Derby" className="tournament-card-img" />
                <div className="tournament-card-overlay" />
                <div className="tournament-card-content">
                  <span className="badge-gold">Premium Event</span>
                  <h4 className="tournament-title">Emerald Derby 2024</h4>
                  <p className="tournament-location">Dubai International Track</p>
                  <div className="tournament-footer">
                    <span className="pool-amount">$1.5M Pool</span>
                    <button className="details-link-btn">Details →</button>
                  </div>
                </div>
              </div>

              <div className="tournament-card">
                <img src={tournament2} alt="Sovereign Cup" className="tournament-card-img" />
                <div className="tournament-card-overlay" />
                <div className="tournament-card-content">
                  <span className="badge-gold">Invitational</span>
                  <h4 className="tournament-title">Sovereign Cup</h4>
                  <p className="tournament-location">Kentucky Downs, USA</p>
                  <div className="tournament-footer">
                    <span className="pool-amount">$800K Pool</span>
                    <button className="details-link-btn">Details →</button>
                  </div>
                </div>
              </div>

              <div className="tournament-card">
                <img src={tournament3} alt="Midnight Sprint" className="tournament-card-img" />
                <div className="tournament-card-overlay" />
                <div className="tournament-card-content">
                  <span className="badge-gold">Night Racing</span>
                  <h4 className="tournament-title">Midnight Sprint</h4>
                  <p className="tournament-location">Tokyo City Track</p>
                  <div className="tournament-footer">
                    <span className="pool-amount">$1.2M Pool</span>
                    <button className="details-link-btn">Details →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ELITE RANKINGS */}
        <section className="leaderboards-section">
          <div className="global-container">
            <div className="leaderboards-grid">
              
              <div className="leaderboard-block">
                <div className="leaderboard-title-row">
                  <h3 className="leaderboard-heading">🏆 Elite Rankings: Horses</h3>
                </div>
                <div className="leaderboard-list">
                  <div className="leaderboard-item highlighted">
                    <div className="item-left">
                      <span className="rank-num">01</span>
                      <div className="avatar-mini-circle">🐴</div>
                      <div>
                        <div className="item-main-name">Stellar Majesty</div>
                        <div className="item-sub-name">Royal Stable #4</div>
                      </div>
                    </div>
                    <div className="item-right">
                      <div className="rating-value">98.4 Rating</div>
                      <span className="badge-status-sub">Undefeated</span>
                    </div>
                  </div>
                  {/* Item 2 & 3 tương tự mẫu gốc */}
                </div>
              </div>

              <div className="leaderboard-block">
                <div className="leaderboard-title-row">
                  <h3 className="leaderboard-heading">🏇 Elite Rankings: Jockeys</h3>
                </div>
                <div className="leaderboard-list">
                  <div className="leaderboard-item highlighted">
                    <div className="item-left">
                      <span className="rank-num">01</span>
                      <div className="avatar-mini-circle">
                        <img src={tournament3} alt="Clarissa" className="mock-avatar-img" />
                      </div>
                      <div>
                        <div className="item-main-name">Clarissa Sterling</div>
                        <div className="item-sub-name">Champion (2023)</div>
                      </div>
                    </div>
                    <div className="item-right">
                      <div className="rating-value">245 Wins</div>
                      <span className="badge-status-sub">Top Seeding</span>
                    </div>
                  </div>
                  {/* Item 2 & 3 tương tự mẫu gốc */}
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;