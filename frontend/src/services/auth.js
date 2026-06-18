import axiosClient from '../api/axiosClient';

/**
 * Authentication Service connecting to Spring Boot Backend
 */

// TODO(TEST MOCK DATA): Remove MOCK_LOGIN_ACCOUNTS and the mock-account branch in loginAPI after manual testing.
export const MOCK_LOGIN_ACCOUNTS = [
  {
    password: 'Test@123',
    accessToken: 'mock-admin-access-token-for-testing-only',
    refreshToken: 'mock-admin-refresh-token-for-testing-only',
    user: {
      id: 9001,
      username: 'admin.test',
      fullName: 'Mock Admin Tester',
      email: 'admin@test.local',
      phoneNumber: '0900000001',
      provider: 'LOCAL',
      role: 'ADMIN',
      enabled: true,
    },
  },
  {
    password: 'Test@123',
    accessToken: 'mock-spectator-access-token-for-testing-only',
    refreshToken: 'mock-spectator-refresh-token-for-testing-only',
    user: {
      id: 9002,
      username: 'spectator.test',
      fullName: 'Mock Spectator Tester',
      email: 'spectator@test.local',
      phoneNumber: '0900000002',
      provider: 'LOCAL',
      role: 'SPECTATOR',
      enabled: true,
    },
  },
  {
    password: 'Test@123',
    accessToken: 'mock-owner-access-token-for-testing-only',
    refreshToken: 'mock-owner-refresh-token-for-testing-only',
    user: {
      id: 9003,
      username: 'owner.test',
      fullName: 'Mock Horse Owner Tester',
      email: 'owner@test.local',
      phoneNumber: '0900000003',
      provider: 'LOCAL',
      role: 'HORSE_OWNER',
      enabled: true,
    },
  },
  {
    password: 'Test@123',
    accessToken: 'mock-jockey-access-token-for-testing-only',
    refreshToken: 'mock-jockey-refresh-token-for-testing-only',
    user: {
      id: 9004,
      username: 'jockey.test',
      fullName: 'Mock Jockey Tester',
      email: 'jockey@test.local',
      phoneNumber: '0900000004',
      provider: 'LOCAL',
      role: 'JOCKEY',
      enabled: true,
    },
  },
  {
    password: 'Test@123',
    accessToken: 'mock-referee-access-token-for-testing-only',
    refreshToken: 'mock-referee-refresh-token-for-testing-only',
    user: {
      id: 9005,
      username: 'referee.test',
      fullName: 'Mock Race Referee Tester',
      email: 'referee@test.local',
      phoneNumber: '0900000005',
      provider: 'LOCAL',
      role: 'RACE_REFEREE',
      enabled: true,
    },
  },
];

const findMockLoginAccount = (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  return MOCK_LOGIN_ACCOUNTS.find(
    (account) => account.user.email.toLowerCase() === normalizedEmail && account.password === password
  );
};

export async function loginAPI(email, password) {
  const mockAccount = findMockLoginAccount(email, password);

  if (mockAccount) {
    // TODO(TEST MOCK DATA): Delete this block when the temporary test accounts are no longer needed.
    return {
      accessToken: mockAccount.accessToken,
      refreshToken: mockAccount.refreshToken,
      user: { ...mockAccount.user },
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
  const savedUser = localStorage.getItem('horse_racing_user');
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;
  const isMockUser = parsedUser && MOCK_LOGIN_ACCOUNTS.some(
    (account) => account.user.email.toLowerCase() === parsedUser.email?.toLowerCase()
  );

  if (isMockUser) {
    // TODO(TEST MOCK DATA): Remove this mock-profile shortcut together with MOCK_LOGIN_ACCOUNTS.
    return parsedUser;
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
