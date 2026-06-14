import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds ppp

  const checkSessionValid = () => {
    const loginTimestamp = localStorage.getItem('horse_racing_login_timestamp');
    if (!loginTimestamp) return false;

    if (Date.now() - parseInt(loginTimestamp, 10) > SESSION_DURATION_MS) {
      // Session expired
      localStorage.removeItem('horse_racing_user');
      localStorage.removeItem('horse_racing_accessToken');
      localStorage.removeItem('horse_racing_refreshToken');
      localStorage.removeItem('horse_racing_login_timestamp');
      return false;
    }
    return true;
  };

  const [user, setUser] = useState(() => {
    if (!checkSessionValid()) return null;
    const savedUser = localStorage.getItem('horse_racing_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    if (!checkSessionValid()) return null;
    return localStorage.getItem('horse_racing_accessToken') || null;
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    if (!checkSessionValid()) return null;
    return localStorage.getItem('horse_racing_refreshToken') || null;
  });

  // Auto logout timer
  useEffect(() => {
    let timeoutId;
    if (user) {
      const loginTimestamp = localStorage.getItem('horse_racing_login_timestamp');
      if (loginTimestamp) {
        const elapsedTime = Date.now() - parseInt(loginTimestamp, 10);
        const remainingTime = SESSION_DURATION_MS - elapsedTime;

        if (remainingTime <= 0) {
          logout();
        } else {
          timeoutId = setTimeout(() => {
            logout();
          }, remainingTime);
        }
      }
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user]);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
    };
  }, []);

  const login = (authData) => {
    const { accessToken: token, refreshToken: rToken, user: userData } = authData;

    setUser(userData);
    setAccessToken(token);
    setRefreshToken(rToken);

    localStorage.setItem('horse_racing_user', JSON.stringify(userData));
    localStorage.setItem('horse_racing_accessToken', token);
    localStorage.setItem('horse_racing_refreshToken', rToken);
    localStorage.setItem('horse_racing_login_timestamp', Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem('horse_racing_user');
    localStorage.removeItem('horse_racing_accessToken');
    localStorage.removeItem('horse_racing_refreshToken');
    localStorage.removeItem('horse_racing_login_timestamp');
  };

  const updateTokens = (newAccessToken, newRefreshToken) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('horse_racing_accessToken', newAccessToken);
    localStorage.setItem('horse_racing_refreshToken', newRefreshToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        updateTokens,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
