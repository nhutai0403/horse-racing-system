# Hướng dẫn test luồng tính năng Frontend

Tất cả các dữ liệu dưới đây đã được khởi tạo sẵn trong Database (`HorseRacingDB.sql`). Chỉ cần khởi động lại DB (chạy init script) là có thể dùng ngay.

## 1. Danh sách tài khoản Test

> **Lưu ý:**
> - Tài khoản **Admin** mặc định được tạo từ source code Backend chứ không nằm trong file SQL (chỉ có 1 tài khoản).
> - Mật khẩu chung cho tất cả các tài khoản là: **`123456`** (riêng Admin là `Admin@12345`).

### 🔑 ADMIN
- `admin@gmail.com` -- `Admin@12345`

### 🔑 SPECTATOR
- `spectator1@test.com` -- `123456`
- `spectator2@test.com` -- `123456`
- `spectator3@test.com` -- `123456`
- `spectator4@test.com` -- `123456`
- `spectator5@test.com` -- `123456`
- `spectator6@test.com` -- `123456`
- `spectator7@test.com` -- `123456`
- `spectator8@test.com` -- `123456`
- `spectator9@test.com` -- `123456`
- `spectator10@test.com` -- `123456`

### 🔑 HORSE OWNER
- `owner1@test.com` -- `123456`
- `owner2@test.com` -- `123456`
- `owner3@test.com` -- `123456`
- `owner4@test.com` -- `123456`
- `owner5@test.com` -- `123456`
- `owner6@test.com` -- `123456`
- `owner7@test.com` -- `123456`
- `owner8@test.com` -- `123456`
- `owner9@test.com` -- `123456`
- `owner10@test.com` -- `123456`

### 🔑 JOCKEY
- `jockey1@test.com` -- `123456`
- `jockey2@test.com` -- `123456`
- `jockey3@test.com` -- `123456`
- `jockey4@test.com` -- `123456`
- `jockey5@test.com` -- `123456`
- `jockey6@test.com` -- `123456`
- `jockey7@test.com` -- `123456`
- `jockey8@test.com` -- `123456`
- `jockey9@test.com` -- `123456`
- `jockey10@test.com` -- `123456`

### 🔑 RACE REFEREE
- `referee1@test.com` -- `123456`
- `referee2@test.com` -- `123456`
- `referee3@test.com` -- `123456`
- `referee4@test.com` -- `123456`
- `referee5@test.com` -- `123456`
- `referee6@test.com` -- `123456`
- `referee7@test.com` -- `123456`
- `referee8@test.com` -- `123456`
- `referee9@test.com` -- `123456`
- `referee10@test.com` -- `123456`

---

## 2. Dữ liệu đính kèm sẵn

- **10 Owner** đã được duyệt Profile (`APPROVED`), mỗi Owner sở hữu sẵn **1 con ngựa** (ví dụ `owner1` sở hữu `Horse 1`, `owner10` sở hữu `Horse 10`). Tổng có 10 con ngựa.
- **10 Jockey** đã được duyệt Profile (`APPROVED`), có sẵn các chỉ số win rate, kinh nghiệm khác nhau.
- **Bạn bè:** `owner1` và `jockey1` đã kết bạn thành công với nhau.

---

## 3. Thông tin Giải đấu (Tournaments)

Hệ thống có sẵn **4 Giải đấu** đại diện cho 4 trạng thái:
1. `Spring Championship 2026` - **Open Registration** (Có sẵn 1 vòng đua *Qualifier Round 1*)
2. `Summer Cup 2026` - **Registration Closed**
3. `Winter Classic 2025` - **Ongoing**
4. `End of Year Event 2026` - **Completed**

---

## 4. Gợi ý Test API (Dành cho FE)

### A. Quản lý ngựa (Bởi Owner)
Đăng nhập tài khoản `owner1`, vào quản lý ngựa (Stable):
- **Danh sách ngựa:** `GET /api/owner/horses` (Sẽ thấy `Horse 1`).
- **Thêm ngựa mới:** `POST /api/owner/horses`
- **Sửa ngựa:** `PUT /api/owner/horses/{id}`
- **Xóa ngựa:** `DELETE /api/owner/horses/{id}`

### B. Quản lý Profile (Bởi Owner)
- **Xem Profile:** `GET /api/owner/profile`
- **Cập nhật Profile:** `PUT /api/owner/profile`

### C. Quản lý kết nối / Bạn bè
- **Danh sách bạn bè:** `GET /api/connections/friends` (Sẽ thấy `jockey1` nếu dùng `owner1`).
- **Danh bạ hệ thống:** `GET /api/connections/directory?role=JOCKEY`
- **Kết bạn mới:** `POST /api/connections/request`

### D. Đăng ký đua (Race Registration)
- **Đăng ký đua:** `POST /api/owner/race-registrations`
  - Chọn giải *Spring Championship 2026* (Open Registration) -> Vòng *Qualifier Round 1*.
  - Chọn ngựa *Horse 1*.
  - Chọn *jockey1* làm người cưỡi.
  - Điền tỷ lệ ăn chia (VD: Owner 90%, Jockey 10%).
