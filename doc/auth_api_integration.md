# HƯỚNG DẪN TÍCH HỢP API XÁC THỰC & PHÂN QUYỀN (FRONTEND)
*Tài liệu hướng dẫn kết nối API Đăng nhập, Đăng ký, Đăng nhập Google, Refresh Token và Phân quyền sử dụng React (Vite) + Axios + React Router Dom v7*

---

## 1. Đánh giá tính sẵn sàng của Backend (BE)

Hiện tại, mã nguồn Backend đã **ĐẦY ĐỦ** các thành phần và sẵn sàng để Frontend (FE) tích hợp các tính năng sau:
- **Đăng ký (Register):** Hỗ trợ đăng ký tài khoản cục bộ, cho phép chọn vai trò (Role). Nếu không chọn, mặc định sẽ là `SPECTATOR`.
- **Đăng nhập (Login):** Xác thực qua Email + Password. Trả về JWT Access Token (hạn 15 phút), Refresh Token (hạn 7 ngày) và thông tin User.
- **Đăng nhập Google (Google OAuth2):** Nhận Google ID Token từ FE, xác thực và tự động tạo mới tài khoản nếu chưa tồn tại (mặc định role `SPECTATOR`).
- **Xoay vòng Token (Refresh Token Rotation):** Tự động cấp mới Access Token và Refresh Token khi Access Token hết hạn, ngăn chặn tấn công replay.
- **Đăng xuất (Logout):** Thu hồi (revoke) Refresh Token trong cơ sở dữ liệu để bảo mật.
- **Phân quyền (Role-based Authorization):** JWT chứa claim `role` (`SPECTATOR`, `HORSE_OWNER`, `JOCKEY`, `RACE_REFEREE`, `ADMIN`). BE sử dụng Spring Security cấu hình bảo vệ các API bằng `@PreAuthorize("hasRole('ROLE_NAME')")`.

---

## 2. Thông tin kết nối chung
* **Base URL:** `http://localhost:8080` (Mặc định cấu hình trong `application.yml`).
- **CORS Config:** BE đã cấu hình cho phép các Domain sau truy cập (gồm Credentials):
  - `http://localhost:5173` (Vite dev server)
  - `http://localhost:3000` (Next.js / CRA dev server)
- **Định dạng dữ liệu:** `application/json`

---

## 3. Danh sách chi tiết các API Xác thực

### 3.1. Đăng ký tài khoản (Register)
* **Endpoint:** `/api/auth/register`
* **Method:** `POST`
* **Body Request:**
  ```json
  {
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "password": "securepassword123",
    "role": "SPECTATOR"
  }
  ```
  *(Các giá trị `role` hợp lệ: `SPECTATOR`, `HORSE_OWNER`, `JOCKEY`, `RACE_REFEREE`, `ADMIN`)*
* **Response thành công (`201 Created`):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "70d04fca-2fa5-455b-b99b-449e7b233a1e",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "johndoe@example.com",
      "fullName": "John Doe",
      "role": "SPECTATOR",
      "provider": "LOCAL",
      "enabled": true,
      "createdAt": "2026-05-28T22:00:00"
    }
  }
  ```
* **Response thất bại (`400 Bad Request`):**
  ```json
  {
    "status": 400,
    "message": "Email is already registered"
  }
  ```

---

### 3.2. Đăng nhập cục bộ (Login)
* **Endpoint:** `/api/auth/login`
* **Method:** `POST`
* **Body Request:**
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```
* **Response thành công (`200 OK`):** *(Trả về cấu trúc tương tự API Register)*
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "70d04fca-2fa5-455b-b99b-449e7b233a1e",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "johndoe@example.com",
      "fullName": "John Doe",
      "role": "SPECTATOR",
      "provider": "LOCAL",
      "enabled": true,
      "createdAt": "2026-05-28T22:00:00"
    }
  }
  ```
* **Response thất bại (`401 Unauthorized`):**
  ```json
  {
    "status": 401,
    "message": "Invalid email or password"
  }
  ```

---

### 3.3. Đăng nhập qua Google (Google Login)
* **Endpoint:** `/api/auth/google`
* **Method:** `POST`
* **Google Client ID (BE cấu hình):** `917477468277-m8iv94j65i74e33qqgu402m7cjeht9oa.apps.googleusercontent.com`
* **Body Request:**
  ```json
  {
    "credential": "GOOGLE_ID_TOKEN_RECEIVED_FROM_FRONTEND"
  }
  ```
* **Response thành công (`200 OK`):** *(Trả về token và user tương tự Login thường)*

---

### 3.4. Làm mới Access Token (Refresh Token)
*Khi Access Token hết hạn (FE nhận mã lỗi HTTP 401), FE sẽ tự động gửi Refresh Token lên để lấy cặp token mới.*
* **Endpoint:** `/api/auth/refresh`
* **Method:** `POST`
* **Body Request:**
  ```json
  {
    "refreshToken": "70d04fca-2fa5-455b-b99b-449e7b233a1e"
  }
  ```
* **Response thành công (`200 OK`):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn..._NEW",
    "refreshToken": "89e15fca-1fa5-345b-c99b-559e7b233b2f",
    "tokenType": "Bearer"
  }
  ```
  *(Chú ý: Refresh Token được xoay vòng, cần lưu lại Refresh Token mới thay thế cái cũ)*

---

### 3.5. Đăng xuất (Logout)
* **Endpoint:** `/api/auth/logout`
* **Method:** `POST`
* **Body Request:**
  ```json
  {
    "refreshToken": "CURRENT_REFRESH_TOKEN"
  }
  ```
* **Response thành công (`200 OK`):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

### 3.6. Lấy thông tin tài khoản hiện tại (Get Profile /me)
*Để khôi phục trạng thái đăng nhập hoặc cập nhật thông tin user hiện tại.*
* **Endpoint:** `/api/auth/me`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response thành công (`200 OK`):**
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "fullName": "John Doe",
    "role": "SPECTATOR",
    "provider": "LOCAL",
    "enabled": true,
    "createdAt": "2026-05-28T22:00:00"
  }
  ```

---

## 4. Hướng dẫn tích hợp Code phía Frontend (React)

FE đã cài sẵn các thư viện cần thiết trong `package.json`: `axios`, `jwt-decode`, `react-router-dom`, `@react-oauth/google`. Hãy sử dụng cấu trúc code sau để tích hợp nhanh chóng:

### 4.1. Thiết lập Axios API Client với Tự động Refresh Token (Interceptors)
Tạo file `src/api/axiosClient.js` để tự động đính kèm Token vào Header và tự động call API `/refresh` khi Access Token hết hạn (401).

```javascript
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Hỗ trợ gửi cookie/credentials nếu cần
});

// Request Interceptor: Tự động đính kèm Access Token vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý tự động refresh token khi gặp lỗi 401
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

    // Tránh vòng lặp vô hạn khi chính API refresh bị 401 hoặc đã thử refresh rồi
    if (error.response?.status === 401 && !originalRequest._retry) {
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

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Không có refresh token -> chuyển về trang login
        handleLogoutRedirect();
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const res = await axios.post('http://localhost:8080/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

        // Lưu token mới
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh token cũng hết hạn/không hợp lệ -> Đăng xuất
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
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export default axiosClient;
```

---

### 4.2. Code tích hợp Google Login trong React
Sử dụng thư viện `@react-oauth/google` đã được cài đặt sẵn. Cấu hình bọc `GoogleOAuthProvider` tại `main.jsx` hoặc `App.jsx`.

**Tại `src/main.jsx`:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID =
    client-id: YOUR_GOOGLE_CLIENT_ID
    client-secret: YOUR_GOOGLE_CLIENT_SECRET


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

**Tại màn hình Login (`src/pages/Login.jsx`):**
```javascript
import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axiosClient from '../api/axiosClient';

const LoginPage = () => {
  const handleGoogleSuccess = async (tokenResponse) => {
    // Lưu ý: thư viện useGoogleLogin trả về Implicit Grant hoặc Authorization Code.
    // Nếu sử dụng nút <GoogleLogin> mặc định của thư viện, nó sẽ trả về credential (ID Token):
  };

  // Hoặc dùng component nút Google chuẩn của thư viện:
  const onGoogleSignInSuccess = async (credentialResponse) => {
    try {
      const response = await axiosClient.post('/auth/google', {
        credential: credentialResponse.credential, // Đây là Google ID Token
      });

      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Chuyển hướng theo Role của User
      redirectByUserRole(user.role);
    } catch (error) {
      console.error('Đăng nhập Google thất bại:', error);
      alert('Đăng nhập Google thất bại, vui lòng thử lại!');
    }
  };

  const redirectByUserRole = (role) => {
    if (role === 'ADMIN') window.location.href = '/admin';
    else if (role === 'HORSE_OWNER') window.location.href = '/owner';
    else if (role === 'JOCKEY') window.location.href = '/jockey';
    else if (role === 'RACE_REFEREE') window.location.href = '/referee';
    else window.location.href = '/dashboard';
  };

  return (
    <div>
      {/* Nút đăng nhập Google */}
      <div style={{ marginTop: '20px' }}>
        <GoogleLogin
          onSuccess={onGoogleSignInSuccess}
          onError={() => console.log('Login Failed')}
        />
      </div>
    </div>
  );
};
```

---

### 4.3. Phân quyền trên Route (Route Guards) trong React Router Dom v7
Tạo Route bảo vệ kiểm tra quyền truy cập dựa trên Role lưu trữ trong localStorage hoặc giải mã từ JWT Access Token.

Tạo file `src/components/ProtectedRoute.jsx`:
```javascript
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles }) => {
  const accessToken = localStorage.getItem('accessToken');
  const userJson = localStorage.getItem('user');

  if (!accessToken || !userJson) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);
    const userRole = user.role;

    // Kiểm tra xem vai trò của user có nằm trong danh sách được phép không
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
  } catch (error) {
    // Nếu token bị lỗi giải mã
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
```

**Cấu hình Router tại `src/App.jsx`:**
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import SpectatorDashboard from './pages/SpectatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes công khai */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Routes chỉ dành cho SPECTATOR */}
        <Route element={<ProtectedRoute allowedRoles={['SPECTATOR']} />}>
          <Route path="/dashboard" element={<SpectatorDashboard />} />
        </Route>

        {/* Routes chỉ dành cho ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Routes chỉ dành cho HORSE_OWNER */}
        <Route element={<ProtectedRoute allowedRoles={['HORSE_OWNER']} />}>
          <Route path="/owner" element={<OwnerDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 5. Hướng dẫn Lấy API Specs tự động
Để Frontend dev luôn có thông tin API cập nhật nhất mà không cần cập nhật tài liệu thủ công:
1. **Qua Postman:** Bạn có thể tham khảo thư mục `.postman` hoặc `postman` ở thư mục gốc của dự án (nếu đã có file export bộ sưu tập).
2. **Khuyến nghị tích hợp Swagger OpenAPI:**
   Nếu muốn FE lấy tài liệu API tự động từ server (giao diện tương tác trực quan), BE có thể bổ sung thư viện `springdoc-openapi-starter-webmvc-ui` vào `pom.xml`. Khi đó FE chỉ cần truy cập:
   `http://localhost:8080/swagger-ui.html`
