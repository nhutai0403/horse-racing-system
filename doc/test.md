# Hướng dẫn test luồng tính năng của Owner và Jockey

Sau khi Frontend đã tích hợp gọi API xong, bạn có thể sử dụng các tài khoản test đã được tạo sẵn trong cơ sở dữ liệu (`HorseRacingDB.sql`) để kiểm tra các luồng nghiệp vụ thay vì phải tạo mới từ đầu.

## 1. Thông tin tài khoản Test

> **Lưu ý về Mật khẩu:** 
> - Mật khẩu chung cho các tài khoản test bên dưới là: `123456`.
> - Mặc dù Backend có validate mật khẩu phải chứa chữ hoa và ký tự đặc biệt (ví dụ: `Password@123`), nhưng API **Login** không check lại rule này (chỉ check khi **Register**). Do các tài khoản này được insert trực tiếp vào DB nên bạn hoàn toàn có thể dùng `123456` để đăng nhập bình thường.
> - Nếu bạn tạo mới một tài khoản từ trang Đăng ký (Register), bạn **bắt buộc** phải nhập mật khẩu đúng chuẩn (VD: `Password@123`).

| Role | Username | Email | Mật khẩu | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **HORSE_OWNER** | `owner1` | `owner1@test.com` | `123456` | Đã có sẵn 2 con ngựa, đã kết bạn với `jockey1` |
| **JOCKEY** | `jockey1` | `jockey1@test.com` | `123456` | Jockey có nhiều kinh nghiệm, bạn bè với `owner1` |
| **JOCKEY** | `jockey2` | `jockey2@test.com` | `123456` | Jockey mới, chưa kết bạn với `owner1` |

## 2. Các luồng (Flows) cần test

### A. Luồng quản lý ngựa (Stable / Horses)
1. Đăng nhập bằng tài khoản `owner1` / `123456`.
2. Truy cập trang **Stable / Danh sách ngựa** (Route FE tương ứng).
3. **Mong đợi:** FE sẽ gọi API `GET /api/owner/horses` và hiển thị ra 2 con ngựa có sẵn: "Lightning Bolt" (Thoroughbred) và "Desert Wind" (Arabian).
4. Thực hiện thêm mới ngựa qua form (FE gọi API `POST /api/owner/horses` với `breedId` từ 1-4). Kiểm tra xem ngựa mới có hiện ra trong danh sách không.

### B. Luồng quản lý hồ sơ (Profile)
1. Đăng nhập bằng `owner1`.
2. Truy cập trang **Profile**.
3. **Mong đợi:** FE gọi API `GET /api/owner/profile`. Thông tin `stableName` sẽ là "Lucky Stable", trạng thái "APPROVED".
4. Thử cập nhật các thông tin khác bằng API `PUT /api/owner/profile`.

### C. Luồng kết nối Bạn bè (Connections)
1. Đăng nhập bằng `owner1`.
2. Truy cập trang **Connections / Friends**.
3. **Mong đợi:**
   - Khi gọi API `GET /api/connections/friends`, danh sách bạn bè sẽ hiện ra `jockey1` (vì đã kết nối trong DB).
   - Khi gọi API `GET /api/connections/directory?role=JOCKEY`, bạn sẽ thấy cả `jockey2`.
4. Gửi lời mời kết bạn tới `jockey2` (API `POST /api/connections/request`).
5. Thoát tài khoản `owner1`, đăng nhập vào tài khoản `jockey2`.
6. Tại tài khoản `jockey2`, kiểm tra danh sách lời mời và **Accept** lời mời từ `owner1` (API `PUT /api/connections/request/{id}/respond?action=ACCEPT`).

### D. Luồng đăng ký đua (Race Registrations)
1. Đăng nhập bằng `owner1`.
2. Truy cập trang **Race Entries / Đăng ký thi đấu**.
3. Hệ thống sẽ có sẵn giải đấu "Spring Championship 2026" và vòng đua "Qualifier Round 1".
4. Chọn đăng ký tham gia vòng đua này:
   - Chọn ngựa "Lightning Bolt".
   - Chọn Jockey cưỡi là `jockey1` (nằm trong danh sách bạn bè).
   - Nhập tỷ lệ ăn chia (Share percent) cho Jockey (ví dụ: 10%) và Owner (90%).
5. **Mong đợi:** FE gọi API `POST /api/owner/race-registrations` thành công, lưu đăng ký vào trạng thái 'Registered'.

---
*Lưu ý: Nếu bạn xóa và tạo lại Database, các dữ liệu test này sẽ tự động được Insert lại thông qua file `HorseRacingDB.sql`.*
