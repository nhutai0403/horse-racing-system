import React from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import { useLogin } from '../../../hooks/useLogin';

export default function LoginForm() {
  const {
    identifier,
    password,
    loading,
    error,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleLogin,
  } = useLogin();

  return (
    <div className="auth-form-card">
      <h2 className="login-card-title">Login</h2>
      
      {error && <div className="error-alert">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Please enter your Phone or Email"
          value={identifier}
          onChange={handleIdentifierChange}
          disabled={loading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.94 6.94a1.5 1.5 0 011.06-.44h12a1.5 1.5 0 011.06.44l-6.36 6.36a1.5 1.5 0 01-2.12 0L2.94 6.94z" />
              <path d="M2 9.5a1.5 1.5 0 01.44-1.06l6.36 6.36a2.5 2.5 0 003.54 0l6.36-6.36A1.5 1.5 0 0118.5 9.5v5A1.5 1.5 0 0117 16H3a1.5 1.5 0 01-1.5-1.5v-5z" />
            </svg>
          }
        />

        <div className="form-row-forgot">
          <a href="#" className="forgot-link">Forgot?</a>
        </div>
        <Input
          type="password"
          placeholder="Please enter your Password"
          value={password}
          onChange={handlePasswordChange}
          disabled={loading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />

        <div className="submit-container">
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>

      <div className="divider">OR</div>

      <button 
        type="button" 
        className="google-btn" 
        onClick={handleGoogleLogin} 
        disabled={loading}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="login-signup-link-container">
        <span>Don't have an account? </span>
        <Link to="/signup" className="signup-link">Sign up</Link>
      </div>
    </div>
  );
}
