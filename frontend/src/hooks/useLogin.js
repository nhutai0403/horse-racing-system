import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { loginAPI, loginWithGoogleAPI } from '../services/auth';

export function useLogin() {
  const { login } = useContext(AuthContext);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if (!identifier.trim()) {
      setError('Please enter your phone number or email address.');
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
      const user = await loginAPI(identifier, password);
      login(user);
      alert(`Login success! Welcome, ${user.name}`);
    } catch (err) {
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await loginWithGoogleAPI();
      login(user);
      alert(`Login success with Google! Welcome, ${user.name}`);
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    identifier,
    password,
    loading,
    error,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleLogin,
  };
}
