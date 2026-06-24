# Tài liệu API Chức năng Đặt cược của Spectator (Người xem)

Tài liệu này mô tả chi tiết các API được phát triển cho chức năng đặt cược dành cho Spectator (Người xem) sử dụng mô hình chia quỹ **Pari-Mutuel (Option 1: Split-Pools)**.

---

## 1. Đặt cược mới (Place Bet)

Đặt cược cho một chú ngựa trong một cuộc đua cụ thể.

* **Endpoint**: `POST /api/bets`
* **Định dạng dữ liệu**: `application/json`
* **Xác thực quyền**: Yêu cầu Bearer Token (JWT). **Chỉ cho phép vai trò `SPECTATOR`**.

### Yêu cầu Header (Headers)
| Key | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <access_token>` | JWT token nhận từ API Đăng nhập. |
| `Content-Type` | `application/json` | Định dạng body gửi lên. |

### Dữ liệu gửi lên (Request Body)
```json
{
  "raceId": 1,
  "participantId": 1,
  "amount": 50000.00,
  "betType": "WIN"
}
```

* **Chi tiết các trường**:
  * `raceId` (Integer, Bắt buộc): ID của cuộc đua.
  * `participantId` (Integer, Bắt buộc): ID của chú ngựa đăng ký tham gia trong cuộc đua này (`RaceParticipant`).
  * `amount` (BigDecimal, Bắt buộc): Số tiền đặt cược (phải lớn hơn hoặc bằng `minBetAmount` của giải đấu).
  * `betType` (String, Bắt buộc): Loại đặt cược, chỉ chấp nhận một trong ba giá trị:
    * `WIN`: Đặt cược chú ngựa về **Hạng 1** (Winner).
    * `PLACE`: Đặt cược chú ngựa về **Hạng 1 hoặc Hạng 2**.
    * `SHOW`: Đặt cược chú ngựa về **Hạng 1, Hạng 2 hoặc Hạng 3**.

### Phản hồi thành công (Response - 200 OK)
```json
{
  "id": 1,
  "userId": 17,
  "raceId": 1,
  "participantId": 1,
  "horseName": "Lightning Bolt",
  "amount": 50000.00,
  "odds": 1.00,
  "status": "PENDING",
  "betType": "WIN",
  "payoutAmount": 0.00,
  "createdAt": "2026-06-23T15:26:10.82"
}
```

* **Chi tiết các trường phản hồi**:
  * `id`: ID của vé cược vừa tạo.
  * `userId`: ID người dùng (Spectator) đã đặt cược.
  * `odds`: Tỷ lệ cược (odds mặc định ban đầu là `1.00`, tỷ lệ odds thực tế sẽ được cập nhật động khi Trọng tài kết thúc trận và chạy chia quỹ Pari-Mutuel).
  * `status`: Trạng thái vé cược (`PENDING`, `WON`, `LOST`, `REFUNDED`).

### Mã lỗi trả về (Error Responses)
* **403 Forbidden**: Người dùng không có vai trò `SPECTATOR`.
  ```json
  {
    "status": 403,
    "message": "Chỉ người xem (SPECTATOR) mới được phép đặt cược."
  }
  ```
* **404 Not Found**: Không tìm thấy cuộc đua hoặc không tìm thấy ngựa.
  ```json
  {
    "status": 404,
    "message": "Không tìm thấy cuộc đua."
  }
  ```
* **400 Bad Request**: Cuộc đua đã bắt đầu, số dư ví không đủ, hoặc số tiền cược dưới mức tối thiểu.
  ```json
  {
    "status": 400,
    "message": "Số dư ví không đủ để thực hiện đặt cược."
  }
  ```

---

## 2. Lấy lịch sử vé cược của tôi (Get My Bets)

Truy xuất danh sách tất cả các vé cược của spectator đang đăng nhập.

* **Endpoint**: `GET /api/bets/my-bets`
* **Xác thực quyền**: Yêu cầu Bearer Token (JWT) của Spectator.

### Yêu cầu Header (Headers)
| Key | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <access_token>` | JWT token nhận từ API Đăng nhập. |

### Phản hồi thành công (Response - 200 OK)
```json
[
  {
    "id": 1,
    "userId": 17,
    "raceId": 1,
    "participantId": 1,
    "horseName": "Lightning Bolt",
    "amount": 50000.00,
    "odds": 3.60,
    "status": "WON",
    "betType": "WIN",
    "payoutAmount": 180000.00,
    "createdAt": "2026-06-23T15:26:10.82"
  },
  {
    "id": 2,
    "userId": 17,
    "raceId": 1,
    "participantId": 2,
    "horseName": "Desert Wind",
    "amount": 150000.00,
    "odds": 1.00,
    "status": "LOST",
    "betType": "WIN",
    "payoutAmount": 0.00,
    "createdAt": "2026-06-23T15:28:15.11"
  }
]
```

---

## 3. Xác nhận kết quả & Chia thưởng (Confirm Results - Trọng tài)

API này do Trọng tài (`RACE_REFEREE`) gọi sau khi cuộc đua hoàn tất, kích hoạt hệ thống chia thưởng tự động cho các vé cược dựa trên kết quả thứ hạng thực tế.

* **Endpoint**: `POST /api/referee/races/{raceId}/confirm-results`
* **Xác thực quyền**: Yêu cầu Bearer Token (JWT). **Chỉ cho phép vai trò `RACE_REFEREE`**.

### Yêu cầu Header (Headers)
| Key | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <referee_token>` | JWT token của Trọng tài được phân công. |

### Phản hồi thành công (Response - 200 OK)
```json
{
  "message": "Results confirmed. Prize distribution and bet payouts completed successfully."
}
```

* **Logic xử lý của hệ thống**:
  1. Gom toàn bộ cược hợp lệ thành 3 quỹ: cửa `WIN`, cửa `PLACE`, cửa `SHOW`.
  2. Khấu trừ 10% phí nhà cái (House Edge), Net Pool còn 90%.
  3. Tính toán tỷ lệ cược odds thắng cuộc động cho từng ngựa đạt thứ hạng trong Top 3 (Áp dụng mức odds sàn tối thiểu là `1.05`).
  4. Trả thưởng tự động: 
     - Chuyển vé cược đoán trúng thành `WON`, điền odds và tính `payoutAmount = amount * odds`, cộng tiền trực tiếp vào ví của spectator thắng cược.
     - Chuyển các vé cược đoán sai thành `LOST` (`payoutAmount = 0.00`).
