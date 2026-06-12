

## I. VAI TRÒ CỦA CÁC THÀNH PHẦN PHÍA BACKEND

Trong kiến trúc của hệ thống, mỗi loại file đảm nhận một nhiệm vụ chuyên biệt như sau:

| **Controller** (`@RestController`) | • Là điểm đón tiếp nhận HTTP Request từ bên ngoài (FE/Postman).<br>• Định nghĩa các Endpoint (đường dẫn URL, HTTP Method như GET, POST).<br>• Trả về HTTP Status Code (200 OK, 201 Created, 401 Unauthorized) kèm dữ liệu phản hồi.


| **DTO** (Data Transfer Object) | • **Request DTO:** Nhận và ràng buộc dữ liệu đầu vào (ví dụ: dùng `@NotBlank`, `@Email` để tự động validate định dạng dữ liệu gửi lên).<br>• **Response DTO:** Định dạng cấu trúc dữ liệu trả về cho client. Ẩn đi các trường nhạy cảm trong cơ sở dữ liệu (ví dụ: giấu cột mật khẩu, token cũ).


| **Service** (`@Service`) | • Nơi xử lý logic nghiệp vụ chính (Business Logic).<br>• Điều phối các thao tác: kiểm tra logic, gọi mã hóa mật khẩu, tạo mã OTP, gọi dịch vụ gửi Email, thao tác giao dịch (Transaction).


| **Repository** (`JpaRepository`) | • Thực hiện các truy vấn đọc/ghi trực tiếp tới Cơ sở dữ liệu (MySQL).


| **Config / Security** | • Cấu hình phân quyền hệ thống (ví dụ: trang nào được vào tự do, trang nào cần đăng nhập).<br>• Đăng ký các Bean dùng chung (như bộ mã hóa BCrypt).<br>• **Filter:** Kiểm tra/giải mã JWT token trên mỗi request trước khi nó tới được Controller.

---

## II. CHI TIẾT CÁC LUỒNG XỬ LÝ (AUTH FLOWS)

### 1. Đăng nhập (Login)
* **Endpoint:** `POST /api/auth/login`
* **Xử lý tại BE:**
  1. Nhận DTO `LoginRequest` (email, password) từ request body.
  2. Gọi `AuthenticationManager.authenticate(...)` để xác thực thông tin đăng nhập.
  3. Tìm kiếm thông tin User trong DB bằng email.
  4. Tạo **Access Token** (JWT chứa role, userId, fullName, email) qua `JwtUtils`.
  5. Tạo **Refresh Token** (UUID ngẫu nhiên, lưu vào DB và liên kết với User) qua `RefreshTokenService`.
  6. Trả về response chứa `accessToken`, `refreshToken`, và `user` profile.
* **Nguồn dữ liệu:**
  * **Input:** `LoginRequest` (email, password).
  * **Database:** Bảng `users` (để kiểm tra thông tin tài khoản và phân quyền).
  * **Configuration:** `app.jwt.secret` và `app.jwt.access-token-expiration` từ `application.yml`.

---

## 2. Đăng xuất (Logout)
* **Endpoint:** `POST /api/auth/logout`
* **Xử lý tại BE:**
  1. Nhận DTO `LogoutRequest` chứa `refreshToken` từ request body.
  2. Truy vấn Refresh Token trong DB bằng chuỗi nhận được.
  3. Cập nhật trường `revoked = true` cho token đó trong DB để vô hiệu hóa hoàn toàn token này.
* **Nguồn dữ liệu:**
  * **Input:** `LogoutRequest` (refreshToken).
  * **Database:** Bảng `refresh_tokens`.

---

## 3. Quên mật khẩu & Đặt lại mật khẩu (Forgot & Reset Password)
* **Các Endpoint liên quan:**
  1. **Yêu cầu cấp OTP (`POST /api/auth/forgot-password`):**
     - Nhận `ForgotPasswordRequest` chứa `email`.
     - Kiểm tra email tồn tại trong DB và provider phải là `LOCAL` (không hỗ trợ reset cho TK Google).
     - Tạo mã OTP ngẫu nhiên 6 chữ số.
     - Lưu/Cập nhật OTP vào DB (bảng `password_reset_tokens`) kèm thời gian hết hạn là 10 phút.
     - Kích hoạt `EmailService` để gửi mail thông báo mã OTP cho User.
  2. **Xác thực mã OTP (`POST /api/auth/verify-reset-otp`):**
     - Nhận `VerifyOtpRequest` (email, otp).
     - Đối chiếu mã OTP trong DB. Kiểm tra xem mã có chính xác và còn hạn sử dụng hay không.
  3. **Đặt lại mật khẩu (`POST /api/auth/reset-password`):**
     - Nhận `ResetPasswordRequest` (email, otp, newPassword).
     - Kiểm tra lại mã OTP một lần nữa.
     - Mã hóa mật khẩu mới bằng `BCryptPasswordEncoder` rồi cập nhật vào bảng `users`.
     - Xóa bản ghi OTP cũ trong bảng `password_reset_tokens`.
* **Nguồn dữ liệu:**
  * **Input:** Email, OTP, và mật khẩu mới (`newPassword`).
  * **Database:**
    * Bảng `users` (cập nhật mật khẩu).
    * Bảng `password_reset_tokens` (quản lý, đối chiếu OTP).
  * **Configuration:** Cấu hình Mail Server (SMTP) trong `application.yml`.

---

## 4. Đăng nhập Google (Google Login)
* **Endpoint:** `POST /api/auth/google`
* **Xử lý tại BE:**
  1. Nhận `GoogleLoginRequest` chứa `credential` (chính là Google ID Token) từ request body.
  2. Sử dụng `GoogleIdTokenVerifier` (của thư viện Google API client) xác thực token với Google Client ID cấu hình tại BE.
  3. Giải mã token để lấy thông tin: `email`, `name`, `googleId` (Subject).
  4. Truy vấn DB theo `email`:
     * Nếu **chưa tồn tại**: Tạo mới bản ghi User (Provider: `GOOGLE`, ProviderId: `googleId`, Role mặc định: `SPECTATOR`, trạng thái `enabled = true`, mật khẩu thô sinh ngẫu nhiên và mã hóa bằng BCrypt).
     * Nếu **đã có tài khoản gốc (LOCAL) nhưng chưa liên kết**: Cập nhật `providerId = googleId` để liên kết với tài khoản Google.
  5. Tạo Access Token (JWT) và Refresh Token mới, gửi trả về trong `AuthResponse`.
* **Nguồn dữ liệu:**
  * **Input:** Google ID Token (`credential`).
  * **Thư viện Google SDK:** Xác thực chữ ký token của Google.
  * **Database:** Bảng `users` (tìm kiếm, tạo mới hoặc cập nhật tài khoản).
  * **Configuration:** `app.google.client-id` trong `application.yml`.

---

## 5. Mã hóa mật khẩu (Password Hashing)
* **Cách thức xử lý tại BE:**
  * Sử dụng bean `PasswordEncoder` kiểu **BCrypt** (`BCryptPasswordEncoder`).
  * **Mã hóa:** Gọi `passwordEncoder.encode(rawPassword)` để chuyển mật khẩu dạng text sang chuỗi hash 60 ký tự dạng BCrypt (đã có chứa salt ngẫu nhiên tích hợp trong chuỗi hash).
  * **So khớp:** Sử dụng `passwordEncoder.matches(rawPassword, hashedPassword)` để kiểm tra tính hợp lệ của mật khẩu khi đăng nhập mà không thể dịch ngược lại mật khẩu gốc.
* **Nguồn dữ liệu:**
  * **Input:** Mật khẩu thô từ request.
  * **Database:** Cột `password` của bảng `users`.

---

## 6. Token và Refresh Token
* **Cách thức vận hành tại BE:**
  * **Access Token (JWT):**
    * Được sinh trực tiếp bằng thư viện `jjwt` tại `JwtUtils.generateAccessToken(...)`.
    * Chứa Claims: `sub` (email), `role`, `userId`, `fullName`, `iat` (ngày tạo), `exp` (ngày hết hạn - ví dụ 15 phút).
    * Ký số bằng chữ ký số HMAC-SHA sử dụng Secret Key của hệ thống.
    * Khi nhận request gọi API cần bảo mật, `JwtAuthenticationFilter` giải mã token, lấy thông tin User để thiết lập ngữ cảnh bảo mật (`SecurityContextHolder`) mà không cần truy vấn DB.
  * **Refresh Token:**
    * Được sinh ngẫu nhiên dưới dạng một chuỗi UUID (`UUID.randomUUID().toString()`).
    * Được lưu trữ trực tiếp vào DB kèm thời hạn (`expiryDate` - ví dụ 7 ngày) và liên kết với User tương ứng.
    * **Xoay vòng token (Refresh Token Rotation) khi gọi `POST /api/auth/refresh`:**
      1. BE nhận `refreshToken` từ request.
      2. Xác thực xem token đó có tồn tại, bị thu hồi (`revoked == true`) hoặc hết hạn chưa.
      3. Thu hồi token cũ (`revoked = true`).
      4. Sinh Access Token mới và tạo thêm 1 Refresh Token mới lưu vào DB, trả cặp token này về.
* **Nguồn dữ liệu:**
  * **Database:** Bảng `refresh_tokens`.
  * **Configuration:** Các thuộc tính cấu hình trong `application.yml`:
    * `app.jwt.secret` (Secret Key của JWT).
    * `app.jwt.access-token-expiration` (Thời hạn Access Token).
    * `app.jwt.refresh-token-expiration` (Thời hạn Refresh Token).
