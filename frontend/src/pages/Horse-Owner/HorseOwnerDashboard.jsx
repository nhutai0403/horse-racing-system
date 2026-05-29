import Header from '../../components/Header/Header';

export default function HorseOwnerDashboard() {
  return (
    <div className="horseowner-dashboard-page" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header />
      <main className="container py-5">
        <h1>Horse Owner Dashboard</h1>
      </main>
    </div>
  );
}