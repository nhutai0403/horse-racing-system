import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import { useLogin } from '../../../hooks/useLogin';
import { forgotPasswordAPI, resetPasswordAPI } from '../../../services/auth';

export default function LoginForm() {
  const {
    identifier,
    password,
    loading,
    error,
    isCompletingGoogleProfile,
    googleDefaultName,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleFailure,
    handleCompleteGoogleProfile,
    cancelGoogleAuth,
  } = useLogin();

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter otp and new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);

  // States for Google Login custom flow
  const [googleUsernameInput, setGoogleUsernameInput] = useState('');
  const [googleFullNameInput, setGoogleFullNameInput] = useState('');

  // Initialize profile inputs when transitioning to profile completion step
  if (isCompletingGoogleProfile && !googleUsernameInput && !googleFullNameInput && googleDefaultName) {
    setGoogleUsernameInput(googleDefaultName.replace(/\s+/g, '').toLowerCase());
    setGoogleFullNameInput(googleDefaultName);
  }

  const resetForgotForm = () => {
    setForgotStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotLoading(false);
    setForgotError(null);
    setForgotSuccess(null);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (forgotStep === 1) {
      if (!email.trim()) {
        setForgotError('Please enter your email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setForgotError('Please enter a valid email address.');
        return;
      }

      setForgotLoading(true);
      try {
        await forgotPasswordAPI(email.trim());
        setForgotSuccess('OTP reset code has been sent to your email.');
        setForgotStep(2);
      } catch (err) {
        setForgotError(err.message || 'Failed to send OTP code. Please try again.');
      } finally {
        setForgotLoading(false);
      }
    } else {
      if (!otp.trim()) {
        setForgotError('Please enter the 6-digit OTP code.');
        return;
      }
      if (!newPassword) {
        setForgotError('Please enter your new password.');
        return;
      }
      if (newPassword.length < 6) {
        setForgotError('Password must be at least 6 characters long.');
        return;
      }
      const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~`|]).*$/;
      if (!passwordPattern.test(newPassword)) {
        setForgotError('Password must contain at least one uppercase letter and one special character.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setForgotError('Passwords do not match.');
        return;
      }

      setForgotLoading(true);
      try {
        await resetPasswordAPI({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        });
        setForgotSuccess('Your password has been reset successfully! Returning to login...');
        setTimeout(() => {
          setIsForgotPassword(false);
          resetForgotForm();
        }, 2500);
      } catch (err) {
        setForgotError(err.message || 'Failed to reset password. Please try again.');
      } finally {
        setForgotLoading(false);
      }
    }
  };

  if (isForgotPassword) {
    return (
      <div className="auth-form-card">
        <h2 className="login-card-title">
          {forgotStep === 1 ? 'Forgot Password' : 'Reset Password'}
        </h2>

        {forgotError && <div className="error-alert">{forgotError}</div>}
        {forgotSuccess && (
          <div
            className="success-alert"
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              fontSize: '0.875rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              marginBottom: '1.5rem',
              fontWeight: 500,
              textAlign: 'left',
            }}
          >
            {forgotSuccess}
          </div>
        )}

        <form onSubmit={handleForgotSubmit}>
          {forgotStep === 1 ? (
            <>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '1.25rem',
                  textAlign: 'left',
                  lineHeight: '1.5',
                }}
              >
                Enter your email address and we will send you a 6-digit OTP code to reset your password.
              </p>
              <Input
                type="email"
                placeholder="Please enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={forgotLoading}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.94 6.94a1.5 1.5 0 011.06-.44h12a1.5 1.5 0 011.06.44l-6.36 6.36a1.5 1.5 0 01-2.12 0L2.94 6.94z" />
                    <path d="M2 9.5a1.5 1.5 0 01.44-1.06l6.36 6.36a2.5 2.5 0 003.54 0l6.36-6.36A1.5 1.5 0 0118.5 9.5v5A1.5 1.5 0 0117 16H3a1.5 1.5 0 01-1.5-1.5v-5z" />
                  </svg>
                }
              />
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="6-Digit OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={forgotLoading}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                }
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={forgotLoading}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                }
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={forgotLoading}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                }
              />
            </>
          )}

          <div className="submit-container" style={{ marginTop: '1.5rem' }}>
            <Button type="submit" disabled={forgotLoading}>
              {forgotLoading ? 'Processing...' : forgotStep === 1 ? 'Send Reset Code' : 'Reset Password'}
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              resetForgotForm();
              setIsForgotPassword(false);
            }}
            style={{
              color: 'var(--color-primary)',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  if (isCompletingGoogleProfile) {
    return (
      <div className="auth-form-card">
        <h2 className="login-card-title">Complete Profile</h2>
        {error && <div className="error-alert">{error}</div>}
        
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          marginBottom: '1.25rem',
          textAlign: 'left',
          lineHeight: '1.5',
        }}>
          Please confirm your details before completing the Google login.
        </p>

        <Input
          type="text"
          placeholder="Username"
          value={googleUsernameInput}
          onChange={(e) => setGoogleUsernameInput(e.target.value)}
          disabled={loading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          }
        />

        <Input
          type="text"
          placeholder="Full Name"
          value={googleFullNameInput}
          onChange={(e) => setGoogleFullNameInput(e.target.value)}
          disabled={loading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
        />

        <div className="submit-container" style={{ marginTop: '1.5rem' }}>
          <Button onClick={() => handleCompleteGoogleProfile(googleUsernameInput, googleFullNameInput)} disabled={loading}>
            {loading ? 'Processing...' : 'Complete Login'}
          </Button>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setGoogleUsernameInput('');
              setGoogleFullNameInput('');
              cancelGoogleAuth();
            }}
            style={{
              color: 'var(--color-primary)',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            Cancel & Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-card">
      <h2 className="login-card-title">Login</h2>
      
      {error && <div className="error-alert">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Please enter your Email"
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

        <div
          className="forgot-password-link-container"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '-0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsForgotPassword(true);
            }}
            style={{
              color: 'var(--color-gold)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.15s ease-out',
            }}
            onMouseOver={(e) => (e.target.style.color = '#e2b740')}
            onMouseOut={(e) => (e.target.style.color = 'var(--color-gold)')}
          >
            Forgot password?
          </a>
        </div>

        <div className="submit-container">
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>

      <div className="divider">OR</div>

      <div className="google-btn-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
          theme="outline"
          size="large"
          width="374"
        />
      </div>

      <div className="login-signup-link-container">
        <span>Don't have an account? </span>
        <Link to="/signup" className="signup-link">
          Sign up
        </Link>
      </div>
    </div>
  );
}
