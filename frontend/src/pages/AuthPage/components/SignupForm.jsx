import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import { useSignup } from '../../../hooks/useSignup';

export default function SignupForm() {
  const {
    username,
    name,
    email,
    password,
    agreeTerms,
    loading,
    error,
    handleUsernameChange,
    handleNameChange,
    handleEmailChange,
    role,
    handleRoleChange,
    handlePasswordChange,
    handleAgreeTermsChange,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleFailure,
  } = useSignup();

  return (
    <div className="auth-form-card">
      <h2 className="login-card-title">Sign Up</h2>
      
      {error && <div className="error-alert">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
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
          value={name}
          onChange={handleNameChange}
          disabled={loading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          }
        />

        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={handleEmailChange}
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
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          disabled={loading}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />

        <label className="checkbox-row">
          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={handleAgreeTermsChange}
              disabled={loading}
              className="checkbox-input"
            />
            <div className="checkbox-custom">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="checkbox-label">
              I agree to the <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>.
            </span>
          </div>
        </label>

        <div className="submit-container">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
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

      <div className="signup-login-link-container">
        <span>Already have an account? </span>
        <Link to="/login" className="signup-link">Login</Link>
      </div>
    </div>
  );
}
