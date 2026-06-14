import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { loginAPI, googleLoginAPI, sendGoogleOtpAPI, verifyGoogleOtpAPI } from '../services/auth';
import { jwtDecode } from 'jwt-decode';

export function useLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New states for Google Login flow
  const [isWaitingForGoogleOtp, setIsWaitingForGoogleOtp] = useState(false);
  const [isCompletingGoogleProfile, setIsCompletingGoogleProfile] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleDefaultName, setGoogleDefaultName] = useState('');

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const redirectByRole = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'HORSE_OWNER') navigate('/owner');
    else if (role === 'JOCKEY') navigate('/jockey');
    else if (role === 'RACE_REFEREE') navigate('/referee');
    else navigate('/spectator');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if (!identifier.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Connect to the real backend login API
      const authData = await loginAPI(identifier.trim(), password);
      login(authData);
      redirectByRole(authData.user.role);
    } catch (err) {
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);

    try {
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);
      const email = decoded.email;
      const name = decoded.name || email.split('@')[0];

      // Trigger sending OTP
      await sendGoogleOtpAPI(email);

      // Save states and move to OTP step
      setGoogleCredential(token);
      setGoogleEmail(email);
      setGoogleDefaultName(name);
      setIsWaitingForGoogleOtp(true);
    } catch (err) {
      setError(err.message || 'Failed to initiate Google login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGoogleOtp = async (otpCode) => {
    setLoading(true);
    setError(null);
    try {
      await verifyGoogleOtpAPI(googleEmail, otpCode);
      // Move to Profile Completion step
      setIsWaitingForGoogleOtp(false);
      setIsCompletingGoogleProfile(true);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleProfile = async (username, fullName) => {
    setLoading(true);
    setError(null);
    try {
      // Call actual googleLoginAPI to authenticate with backend
      const authData = await googleLoginAPI(googleCredential);
      
      // Override backend default username/fullname with user input
      if (authData && authData.user) {
        authData.user.username = username;
        authData.user.fullName = fullName;
      }

      // Save Google email to localStorage to prevent local signup with this email
      const registeredEmailsStr = localStorage.getItem('google_registered_emails');
      const registeredEmails = registeredEmailsStr ? JSON.parse(registeredEmailsStr) : [];
      if (!registeredEmails.includes(googleEmail)) {
        registeredEmails.push(googleEmail);
        localStorage.setItem('google_registered_emails', JSON.stringify(registeredEmails));
      }

      login(authData);
      redirectByRole(authData.user.role);
    } catch (err) {
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelGoogleAuth = () => {
    setIsWaitingForGoogleOtp(false);
    setIsCompletingGoogleProfile(false);
    setGoogleCredential(null);
    setGoogleEmail('');
    setGoogleDefaultName('');
    setError(null);
  };

  const handleGoogleFailure = () => {
    setError('Google Sign-In was unsuccessful. Try again later.');
  };

  return {
    identifier,
    password,
    loading,
    error,
    isWaitingForGoogleOtp,
    isCompletingGoogleProfile,
    googleEmail,
    googleDefaultName,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleFailure,
    handleVerifyGoogleOtp,
    handleCompleteGoogleProfile,
    cancelGoogleAuth,
    redirectByRole,
  };
}
