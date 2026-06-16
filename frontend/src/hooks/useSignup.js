import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { signupAPI, googleLoginAPI } from '../services/auth';

export function useSignup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SPECTATOR');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError(null);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) setError(null);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    if (error) setError(null);
  };

  const handleAgreeTermsChange = (e) => {
    setAgreeTerms(e.target.checked);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
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
    // BE password pattern validation: at least 1 uppercase and 1 special char
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~`|]).*$/;
    if (!passwordPattern.test(password)) {
      setError('Password must contain at least one uppercase letter and one special character (e.g. @, #, $, !).');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    // Check if email was already used for Google Login
    const registeredEmailsStr = localStorage.getItem('google_registered_emails');
    const registeredEmails = registeredEmailsStr ? JSON.parse(registeredEmailsStr) : [];
    if (registeredEmails.includes(email.trim())) {
      setError('This email is already associated with a Google Login account. Please use Google Login instead.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signupAPI({
        username: username.trim(),
        fullName: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      
      alert('Đăng ký thành công! Vui lòng kiểm tra email của bạn để lấy mã OTP và kích hoạt tài khoản.');
      navigate(`/verify-account?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.message || 'An error occurred during sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);

    try {
      const authData = await googleLoginAPI(credentialResponse.credential);
      login(authData);
      navigate('/spectator'); // Default role is SPECTATOR
    } catch (err) {
      setError(err.message || 'Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError('Google Sign-In was unsuccessful. Try again later.');
  };

  return {
    username,
    name,
    email,
    password,
    role,
    agreeTerms,
    loading,
    error,
    handleUsernameChange,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleRoleChange,
    handleAgreeTermsChange,
    handleSubmit,
    handleGoogleSuccess,
    handleGoogleFailure,
  };
}
