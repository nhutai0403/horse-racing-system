import axiosClient from '../api/axiosClient';

/**
 * Authentication Service connecting to Spring Boot Backend
 */

const isMockMode = () => {
  return true; // Force mock mode for offline testing
};

export async function loginAPI(email, password) {
  if (isMockMode()) {
    // Determine role from email
    let role = 'SPECTATOR';
    let fullName = 'Test Spectator';
    let username = 'spectator1';

    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail.includes('referee')) {
      role = 'RACE_REFEREE';
      fullName = 'Test Race Referee';
      username = 'referee1';
    } else if (normalizedEmail.includes('owner')) {
      role = 'HORSE_OWNER';
      fullName = 'Test Horse Owner';
      username = 'owner1';
    } else if (normalizedEmail.includes('jockey')) {
      role = 'JOCKEY';
      fullName = 'Test Jockey';
      username = 'jockey1';
    } else if (normalizedEmail.includes('admin')) {
      role = 'ADMIN';
      fullName = 'Test Admin';
      username = 'admin1';
    }

    // Mock response matching the real backend AuthResponse
    return {
      accessToken: 'mock-access-token-jwt-placeholder',
      refreshToken: 'mock-refresh-token-uuid-placeholder',
      user: {
        id: 999,
        username,
        fullName,
        email,
        phoneNumber: '0123456789',
        provider: 'LOCAL',
        role,
        enabled: true
      }
    };
  }

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

export async function verifyAccountAPI(token) {
  try {
    const response = await axiosClient.get(`/auth/verify?token=${token}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Verification failed. Invalid or expired token.';
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
  if (isMockMode()) {
    const savedUser = localStorage.getItem('horse_racing_user');
    if (savedUser) return JSON.parse(savedUser);
    return {
      id: 999,
      username: 'spectator1',
      fullName: 'Test Spectator',
      email: 'spectator1@test.com',
      phoneNumber: '0123456789',
      provider: 'LOCAL',
      role: 'SPECTATOR',
      enabled: true
    };
  }

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

export async function completeGoogleProfileAPI(username, fullName) {
  try {
    const response = await axiosClient.post('/auth/google/complete-profile', {
      username,
      fullName,
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to complete profile.';
    throw new Error(errMsg, { cause: error });
  }
}
