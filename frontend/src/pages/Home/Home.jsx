import './Home.css';

import heroBg from '../../assets/background.jpg';
import tournament1 from '../../assets/background1.jpg';
import tournament2 from '../../assets/background2.jpg';
import tournament3 from '../../assets/background3.jpg';

const stats = [
  {
    icon: '♔',
    label: 'Live Races',
    value: '12',
    note: '+4 from yesterday',
  },
  {
    icon: '▣',
    label: 'Total Prize Pool',
    value: '$4.2M',
    note: 'Worldwide contributions',
  },
  {
    icon: '□',
    label: 'Active Horses',
    value: '842',
    note: 'Elite verified stables',
  },
];

const tournaments = [
  {
    image: tournament1,
    tag: 'Premium Event',
    title: 'Emerald Derby 2024',
    location: 'Dubai International Track',
    pool: '$1.5M Pool',
  },
  {
    image: tournament2,
    tag: 'Invitational',
    title: 'Sovereign Cup',
    location: 'Kentucky Downs, USA',
    pool: '$800K Pool',
  },
  {
    image: tournament3,
    tag: 'Night Racing',
    title: 'Midnight Sprint',
    location: 'Tokyo City Track',
    pool: '$1.2M Pool',
  },
];

const horseRankings = [
  {
    rank: '01',
    avatar: '♞',
    name: 'Stellar Majesty',
    detail: 'Royal Stable #4',
    metric: '98.4 Rating',
    status: 'Undefeated',
    featured: true,
  },
  {
    rank: '02',
    avatar: '♞',
    name: 'Golden Phantom',
    detail: 'Crescent Farms',
    metric: '95.8 Rating',
    status: 'Rising',
  },
  {
    rank: '03',
    avatar: '♞',
    name: 'Emerald Baron',
    detail: 'Highland Fields',
    metric: '94.6 Rating',
    status: 'In Form',
  },
];

const jockeyRankings = [
  {
    rank: '01',
    avatar: 'CS',
    name: 'Clarissa Sterling',
    detail: 'Monaco Club',
    metric: '245 Wins',
    status: 'Top Seeding',
    featured: true,
  },
  {
    rank: '02',
    avatar: 'MR',
    name: 'Marcus Rhone',
    detail: 'Silver Spur Team',
    metric: '231 Wins',
    status: 'Elite',
  },
  {
    rank: '03',
    avatar: 'ER',
    name: 'Elena Rodriguez',
    detail: 'Valencia Range',
    metric: '219 Wins',
    status: 'Contender',
  },
];

const Home = () => {
  return (
    <div className="home-page-wrapper">
      <main className="home-canvas">
        <section className="hero-section" aria-label="Equine competition hero">
          <img src={heroBg} alt="Equestrian Racing" className="hero-bg-img" />
          <div className="hero-gradient-overlay" />
          <div className="hero-racing-lines" />

          <div className="hero-container-inner">
            <div className="hero-text-content">
              <p className="hero-eyebrow">National track and league live dashboard</p>
              <h1 className="hero-title">
                Experience the <span>Apex</span> of Equine Competition
              </h1>
              <p className="hero-description">
                Manage, track, and engage with the world's most exclusive horse racing tournaments in real-time. Where heritage meets high-performance technology.
              </p>
              <div className="hero-btn-group">
                <button className="btn-primary-luxury" type="button">Watch Live Races</button>
                <button className="btn-secondary-luxury" type="button">Join Tournament</button>
              </div>
            </div>

            <div className="track-preview-card" aria-label="Track preview countdown">
              <div className="track-card-header">
                <span className="track-label">Track Preview: Royal Ascot</span>
                <span className="live-status"><span className="pulse-dot" /> Live Rendering</span>
              </div>
              <div className="svg-track-container">
                <span className="track-ring ring-one" />
                <span className="track-ring ring-two" />
                <span className="track-ring ring-three" />
                <div className="countdown-box">
                  <div className="countdown-time">02:03:08</div>
                  <div className="countdown-sub">Next Match Starts In</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section" aria-label="Race statistics">
          <div className="stats-grid">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <span className="stat-icon" aria-hidden="true">{stat.icon}</span>
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-number">{stat.value}</h3>
                <p className="stat-trend">{stat.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tournaments-section" aria-label="Upcoming tournaments">
          <div className="section-header-row">
            <div>
              <h2 className="section-main-title">Upcoming Tournaments</h2>
              <p className="section-subtitle">The most prestigious events in the racing calendar.</p>
            </div>
            <div className="carousel-controls" aria-hidden="true">
              <button className="control-btn" type="button">‹</button>
              <button className="control-btn" type="button">›</button>
            </div>
          </div>

          <div className="tournaments-grid">
            {tournaments.map((tournament) => (
              <article className="tournament-card" key={tournament.title}>
                <img src={tournament.image} alt={tournament.title} className="tournament-card-img" />
                <div className="tournament-card-overlay" />
                <div className="tournament-card-content">
                  <span className="badge-gold">{tournament.tag}</span>
                  <h3 className="tournament-title">{tournament.title}</h3>
                  <p className="tournament-location">{tournament.location}</p>
                  <div className="tournament-footer">
                    <span className="pool-amount">{tournament.pool}</span>
                    <button className="details-link-btn" type="button">Details →</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="leaderboards-section" aria-label="Elite rankings">
          <div className="leaderboards-grid">
            <RankingBoard title="Elite Rankings: Horses" icon="♞" items={horseRankings} />
            <RankingBoard title="Elite Rankings: Jockeys" icon="♘" items={jockeyRankings} initials />
          </div>
        </section>
      </main>
    </div>
  );
};

const RankingBoard = ({ title, icon, items, initials = false }) => (
  <article className="leaderboard-block">
    <div className="leaderboard-title-row">
      <span className="leaderboard-icon" aria-hidden="true">{icon}</span>
      <h3 className="leaderboard-heading">{title}</h3>
    </div>
    <div className="leaderboard-list">
      {items.map((item) => (
        <div className={`leaderboard-item${item.featured ? ' highlighted' : ''}`} key={item.name}>
          <div className="item-left">
            <span className="rank-num">{item.rank}</span>
            <span className={`avatar-mini-circle${initials ? ' initials-avatar' : ''}`}>{item.avatar}</span>
            <span>
              <span className="item-main-name">{item.name}</span>
              <span className="item-sub-name">{item.detail}</span>
            </span>
          </div>
          <div className="item-right">
            <span className="rating-value">{item.metric}</span>
            <span className="badge-status-sub">{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  </article>
);

export default Home;
