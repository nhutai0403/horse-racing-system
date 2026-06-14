import axiosClient from '../api/axiosClient';

/**
 * Authentication Service connecting to Spring Boot Backend
 */

export async function loginAPI(email, password) {
  try {
    const response = await axiosClient.post('/auth/login', {
      email,
      password,
    });
    return response.data; // { accessToken, refreshToken, user: { ... } }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Invalid email or password. Please try again.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function signupAPI({ username, fullName, email, password, role = 'SPECTATOR' }) {
  try {
    const response = await axiosClient.post('/auth/register', {
      username,
      fullName,
      email,
      password,
      role,
    });
    return response.data; // { accessToken, refreshToken, user: { ... } }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Registration failed. Please check your details.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function logoutAPI(refreshToken) {
  try {
    const response = await axiosClient.post('/auth/logout', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Logout failed.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getProfileAPI() {
  try {
    const response = await axiosClient.get('/auth/me');
    return response.data; // UserResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch user profile.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function googleLoginAPI(credential) {
  try {
    const response = await axiosClient.post('/auth/google', {
      credential,
    });
    return response.data; // { accessToken, refreshToken, user: { ... } }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Google Login failed.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function forgotPasswordAPI(email) {
  try {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to send OTP code. Please try again.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function resetPasswordAPI({ email, otp, newPassword }) {
  try {
    const response = await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to reset password. Please try again.';
    throw new Error(errMsg, { cause: error });
  }
}

// ==========================================
// MOCK APIS cho Luồng OTP Google (Frontend only)
// ==========================================

export async function sendGoogleOtpAPI(email) {
  // Giả lập call API mất 1 giây
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`[MOCK] OTP sent to ${email}`);
  return { success: true, message: 'OTP sent successfully' };
}

export async function verifyGoogleOtpAPI(email, otp) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (otp === '123456') {
    return { success: true };
  }
  throw new Error('Invalid OTP code. Please enter 123456 to pass.');
}
