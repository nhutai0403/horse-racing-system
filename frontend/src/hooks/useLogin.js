import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { loginAPI, googleLoginAPI } from '../services/auth';
import { jwtDecode } from 'jwt-decode';

export function useLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New states for Google Login flow
  const [isCompletingGoogleProfile, setIsCompletingGoogleProfile] = useState(false);
  const [googleDefaultName, setGoogleDefaultName] = useState('');
  const [tempAuthData, setTempAuthData] = useState(null);

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
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
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

      // Call actual googleLoginAPI to authenticate with backend immediately
      const authData = await googleLoginAPI(token);
      
      if (authData.newUser) {
        // First time Google Login -> show profile completion form
        setTempAuthData(authData);
        setGoogleDefaultName(name);
        setIsCompletingGoogleProfile(true);
      } else {
        login(authData);
        redirectByRole(authData.user.role);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate Google login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleProfile = async (username, fullName) => {
    setLoading(true);
    setError(null);
    try {
      // Temporarily set the token in Axios manually or pass it in headers. 
      // Actually, completeGoogleProfileAPI doesn't have token in params right now, 
      // but wait: we can just login with authData to save token in localStorage, 
      // then make the call, and then redirect.
      login(tempAuthData);
      
      // Now that we're logged in, the Axios interceptor will attach the token
      import('../services/auth').then(async ({ completeGoogleProfileAPI }) => {
          try {
              const updatedUser = await completeGoogleProfileAPI(username, fullName);
              // Update user context with new username and fullname
              const newAuthData = { ...tempAuthData, user: updatedUser };
              login(newAuthData); // update context
              setIsCompletingGoogleProfile(false);
              redirectByRole(newAuthData.user.role);
          } catch(err) {
              setError(err.message || 'Failed to complete profile. Please try again.');
              setLoading(false);
          }
      });
      return; // Return here, let the promise chain finish the loading state
    } catch (err) {
      setError(err.message || 'Failed to complete profile. Please try again.');
      setLoading(false);
    }
  };

  const cancelGoogleAuth = () => {
    setIsCompletingGoogleProfile(false);
    setGoogleDefaultName('');
    setTempAuthData(null);
    setError(null);
    // Logout since we temporarily logged them in
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const handleGoogleFailure = () => {
    setError('Google Sign-In was unsuccessful. Try again later.');
  };

  return {
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
    redirectByRole,
  };
}
