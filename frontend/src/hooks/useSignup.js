import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { signupAPI, loginWithGoogleAPI } from '../services/auth';

export function useSignup() {
  const { login } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(() => val);
    if (error) setError(() => null);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(() => val);
    if (error) setError(() => null);
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(() => val);
    if (error) setError(() => null);
  };

  const handleAgreeTermsChange = (e) => {
    const checked = e.target.checked;
    setAgreeTerms(() => checked);
    if (error) setError(() => null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if (!name.trim()) {
      setError(() => 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError(() => 'Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(() => 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError(() => 'Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError(() => 'Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setError(() => 'You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(() => true);
    setError(() => null);

    try {
      const user = await signupAPI(name.trim(), email.trim(), password);
      login(user);
      alert(`Account created successfully! Welcome, ${user.name}`);
    } catch (err) {
      setError(() => err.message || 'An error occurred during sign up. Please try again.');
    } finally {
      setLoading(() => false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(() => true);
    setError(() => null);

    try {
      const user = await loginWithGoogleAPI();
      login(user);
      alert(`Sign up success with Google! Welcome, ${user.name}`);
    } catch (err) {
      setError(() => err.message || 'Google sign up failed. Please try again.');
    } finally {
      setLoading(() => false);
    }
  };

  return {
    name,
    email,
    password,
    agreeTerms,
    loading,
    error,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleAgreeTermsChange,
    handleSubmit,
    handleGoogleSignup,
  };
}
