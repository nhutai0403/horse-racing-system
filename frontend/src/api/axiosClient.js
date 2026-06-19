import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Access Token to Header
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('horse_racing_accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auto refresh token on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh API fails, or request was already retried
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('horse_racing_refreshToken');
      if (!refreshToken) {
        handleLogoutRedirect();
        return Promise.reject(error);
      }

      try {
        // Call refresh token API
        const res = await axios.post('http://localhost:8080/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

        // Save new tokens
        localStorage.setItem('horse_racing_accessToken', newAccessToken);
        localStorage.setItem('horse_racing_refreshToken', newRefreshToken);

        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogoutRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function handleLogoutRedirect() {
  localStorage.removeItem('horse_racing_accessToken');
  localStorage.removeItem('horse_racing_refreshToken');
  localStorage.removeItem('horse_racing_user');
  // Dispatch a custom event to notify components/Context about logout
  window.dispatchEvent(new Event('auth_logout'));
  window.location.href = '/login';
}

// Tự động kiểm tra trạng thái hoạt động của Backend
(async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // Timeout 1.5 giây
    await fetch('http://localhost:8080/api/tournaments', { 
      signal: controller.signal,
      mode: 'cors'
    });
    clearTimeout(timeoutId);
    localStorage.setItem('backend_online', 'true');
  } catch (e) {
    localStorage.setItem('backend_online', 'false');
  }
})();

export default axiosClient;
