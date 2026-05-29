import Header from '../../components/Header/Header';

export default function JockeyDashboard() {
  return (
    <div className="jockey-dashboard-page" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header />
      <main className="container py-5">
        <h1>Jockey Dashboard</h1>
      </main>
    </div>
  );
}