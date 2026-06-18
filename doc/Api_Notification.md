# Tài liệu API - Hệ thống Thông báo và Đẩy dữ liệu thời gian thực (Api_Notification)

Tài liệu này tổng hợp toàn bộ các API Backend phục vụ hệ thống thông báo cho người dùng, bao gồm các API truy vấn danh sách thông báo, đánh dấu đã đọc, đếm số thông báo chưa đọc, gửi thông báo thủ công (phục vụ kiểm thử/quản trị), và kết nối Server-Sent Events (SSE) để nhận thông báo thời gian thực phía Frontend.

> [!NOTE]
> Tất cả các API yêu cầu xác thực người dùng qua mã Token JWT ở Header dưới dạng `Authorization: Bearer <TOKEN>`.

---

## BẢNG TỔNG HỢP API THÔNG BÁO

| Stt | Vai trò | API Endpoint | Phương thức | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **User** | `/api/notifications` | `GET` | Lấy toàn bộ danh sách thông báo của tôi (xếp mới nhất lên đầu) |
| 2 | **User** | `/api/notifications/unread-count` | `GET` | Lấy số lượng thông báo chưa đọc |
| 3 | **User** | `/api/notifications/{id}/read` | `PUT` | Đánh dấu một thông báo là đã đọc |
| 4 | **User** | `/api/notifications/read-all` | `PUT` | Đánh dấu tất cả thông báo của tôi là đã đọc |
| 5 | **User** | `/api/notifications/subscribe` | `GET` | Đăng ký nhận thông báo thời gian thực qua Server-Sent Events (SSE) |
| 6 | **Admin/System** | `/api/notifications` | `POST` | Gửi thông báo thủ công tới người dùng (phục vụ test & quản trị) |

---

## CHI TIẾT CÁC API VÀ ĐỊNH DẠNG DỮ LIỆU

### 1. Đăng ký luồng sự kiện thời gian thực (`GET /api/notifications/subscribe`)
Sử dụng để tạo kết nối lâu dài (SSE Connection) từ trình duyệt Frontend tới Backend. Khi có thông báo mới, Backend sẽ đẩy sự kiện trực tiếp xuống Frontend qua kết nối này.

* **Headers**: 
  - `Authorization: Bearer <TOKEN>`
  - `Accept: text/event-stream`
* **Response (Event Stream)**: Kết nối thành công giữ ở trạng thái Open.
* **Các sự kiện gửi từ Server**:
  * **Sự kiện `CONNECT`**: Gửi ngay khi kết nối thành công để xác nhận kết nối ổn định.
    ```
    event: CONNECT
    data: Connected successfully
    ```
  * **Sự kiện `NOTIFICATION`**: Gửi khi có thông báo mới phát sinh cho tài khoản của bạn.
    ```
    event: NOTIFICATION
    data: {
      "id": 12,
      "title": "Lời mời kết nối mới",
      "content": "Bạn nhận được lời mời kết nối mới từ Nguyễn Văn A (Vai trò: JOCKEY).",
      "type": "CONNECTION",
      "isRead": false,
      "createdAt": "2026-06-19T00:15:00",
      "readAt": null
    }
    ```

---

### 2. Lấy số lượng thông báo chưa đọc (`GET /api/notifications/unread-count`)
API phục vụ việc hiển thị badge (chấm đỏ/số lượng) ở Icon thông báo trên Header.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "unreadCount": 3
  }
  ```

---

### 3. Lấy toàn bộ danh sách thông báo (`GET /api/notifications`)
Lấy danh sách lịch sử thông báo của tài khoản đăng nhập hiện tại, sắp xếp theo thời gian mới nhất lên đầu.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 12,
      "title": "Lời mời kết nối mới",
      "content": "Bạn nhận được lời mời kết nối mới từ Nguyễn Văn A (Vai trò: JOCKEY).",
      "type": "CONNECTION",
      "isRead": false,
      "createdAt": "2026-06-19T00:15:00",
      "readAt": null
    },
    {
      "id": 10,
      "title": "Nâng cấp tài khoản thành công",
      "content": "Yêu cầu nâng cấp tài khoản của bạn lên HORSE_OWNER đã được duyệt thành công.",
      "type": "ROLE_UPGRADE",
      "isRead": true,
      "createdAt": "2026-06-18T15:30:00",
      "readAt": "2026-06-18T15:35:00"
    }
  ]
  ```

---

### 4. Đánh dấu một thông báo đã đọc (`PUT /api/notifications/{id}/read`)
Được gọi khi người dùng click vào một thông báo cụ thể.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response (200 OK)**: Trả về chi tiết thông báo sau khi đã cập nhật trạng thái đã đọc.
  ```json
  {
    "id": 12,
    "title": "Lời mời kết nối mới",
    "content": "Bạn nhận được lời mời kết nối mới từ Nguyễn Văn A (Vai trò: JOCKEY).",
    "type": "CONNECTION",
    "isRead": true,
    "createdAt": "2026-06-19T00:15:00",
    "readAt": "2026-06-19T00:17:23"
  }
  ```

---

### 5. Đánh dấu tất cả thông báo là đã đọc (`PUT /api/notifications/read-all`)
Được gọi khi người dùng bấm nút "Đọc tất cả" trên giao diện danh sách thông báo.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "message": "All notifications marked as read successfully"
  }
  ```

---

### 6. Gửi thông báo thủ công (`POST /api/notifications`)
API dùng cho quản trị hoặc kiểm thử để tạo và gửi thông báo trực tiếp tới một User cụ thể bằng ID.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request Body** (`application/json`):
  ```json
  {
    "recipientId": 2,
    "title": "Thông báo bảo trì hệ thống",
    "content": "Hệ thống sẽ bảo trì định kỳ vào lúc 02:00 sáng mai.",
    "type": "GENERAL"
  }
  ```
  *(Các loại `type` hợp lệ: `GENERAL`, `CONNECTION`, `ROLE_UPGRADE`, `REGISTRATION`, `RACE_STATUS`, `WALLET`, `SYSTEM_ALERT`)*
* **Response (200 OK)**: Trả về thông tin chi tiết của thông báo được gửi thành công.
  ```json
  {
    "id": 13,
    "title": "Thông báo bảo trì hệ thống",
    "content": "Hệ thống sẽ bảo trì định kỳ vào lúc 02:00 sáng mai.",
    "type": "GENERAL",
    "isRead": false,
    "createdAt": "2026-06-19T00:18:45",
    "readAt": null
  }
  ```
