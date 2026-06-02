import axiosClient from '../api/axiosClient';

/**
 * Authentication Service connecting to Spring Boot Backend
 */

export async function loginAPI(email, password) {
  // Mock login credentials bypass for local testing
  const mockUsers = {
    'owner@racing.com': {
      id: 999,
      username: 'lamhoangkiet',
      fullName: 'Lam Hoang Kiet',
      role: 'HORSE_OWNER'
    },
    'jockey@racing.com': {
      id: 998,
      username: 'ryanmoore',
      fullName: 'Ryan Moore',
      role: 'JOCKEY'
    },
    'referee@racing.com': {
      id: 997,
      username: 'referee1',
      fullName: 'Referee Nguyen',
      role: 'RACE_REFEREE'
    },
    'admin@racing.com': {
      id: 996,
      username: 'admin',
      fullName: 'System Administrator',
      role: 'ADMIN'
    },
    'spectator@racing.com': {
      id: 995,
      username: 'spectator1',
      fullName: 'Spectator A',
      role: 'SPECTATOR'
    }
  };

  if (mockUsers[email] && password === 'Password123!') {
    return {
      accessToken: `mock-access-token-${mockUsers[email].role.toLowerCase()}`,
      refreshToken: `mock-refresh-token-${mockUsers[email].role.toLowerCase()}`,
      tokenType: 'Bearer',
      user: {
        ...mockUsers[email],
        email,
        provider: 'LOCAL',
        enabled: true,
        createdAt: '2026-06-02T12:00:00'
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
    throw new Error(errMsg);
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
    throw new Error(errMsg);
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
    throw new Error(errMsg);
  }
}

export async function getProfileAPI() {
  try {
    const response = await axiosClient.get('/auth/me');
    return response.data; // UserResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch user profile.';
    throw new Error(errMsg);
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
    throw new Error(errMsg);
  }
}
