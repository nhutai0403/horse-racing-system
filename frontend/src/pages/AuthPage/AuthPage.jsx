import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import horseImage from '../../assets/horse_racing_statue.png';
import horseSignupImage from '../../assets/horse_racing_action.png';
import './AuthPage.css';

export default function AuthPage({ view }) {
  const isLogin = view === 'login';
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'HORSE_OWNER') navigate('/owner');
      else if (user.role === 'JOCKEY') navigate('/jockey');
      else if (user.role === 'RACE_REFEREE') navigate('/referee');
      else navigate('/spectator');
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`auth-container ${isLogin ? 'mode-login' : 'mode-signup'}`}>

      {/* Background Forms Container - Forms stay statically in their halves */}
      <div className="auth-forms-container">
        {/* Left Side Form Column - Login */}
        <div className="auth-form-column login-column">
          <div className="auth-form-wrapper">
            <div className="auth-header-content">
              <h1 className="auth-title-brand">Hourse Racing</h1>
              <p className="auth-subtitle">The pinnacle of tournament excellence.</p>
            </div>
            <LoginForm />
          </div>
        </div>

        {/* Right Side Form Column - Signup */}
        <div className="auth-form-column signup-column">
          <div className="auth-form-wrapper">
            <div className="auth-header-content">
              <h1 className="auth-title-brand">Join the Elite</h1>
              <p className="auth-subtitle">Start your legacy in equine management.</p>
            </div>
            <SignupForm />
          </div>
        </div>
      </div>

      {/* Sliding Image Overlay Panel - Moves back and forth to reveal/cover */}
      <div className="auth-overlay-panel">
        <div className="auth-overlay-content-wrapper">
          {/* Background Image for Login */}
          <img
            src={horseImage}
            alt="Premium Horse Statue"
            className={`auth-bg-image login-bg ${isLogin ? 'active' : ''}`}
          />
          {/* Background Image for Signup */}
          <img
            src={horseSignupImage}
            alt="Dynamic Horse Racing"
            className={`auth-bg-image signup-bg ${!isLogin ? 'active' : ''}`}
          />

          <div className="auth-gradient-overlay"></div>
          <div className="auth-image-content">
            <div className="badge-live">
              <span className="badge-dot"></span>
              ROYAL ASCOT 2026 SEASON LIVE
            </div>
            <h2 className="auth-image-title">
              Heritage Meets <br /> Performance.
            </h2>
            <p className="auth-image-desc">
              Manage your stables, track race entries, and analyze real-time financial standings with the world's most sophisticated equine management platform.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
