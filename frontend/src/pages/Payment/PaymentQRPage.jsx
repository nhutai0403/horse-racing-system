import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { depositAPI } from '../../services/wallet';

export default function PaymentQRPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, returnUrl } = location.state || { amount: 0, returnUrl: '/' };

  const userStr = localStorage.getItem('horse_racing_user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Lỗi parse user:', e);
    }
  }

  const roleName = user?.role === 'HORSE_OWNER' ? 'Chủ Chuồng Ngựa' : 'Kỵ Sĩ';
  const accountHolder = `VÍ MOCK ${roleName.toUpperCase()} - ${user?.fullName?.toUpperCase() || 'KHÁCH HÀNG'}`;
  const bankName = 'Vietcombank (Giả lập)';
  const accountNumber = user?.role === 'HORSE_OWNER' ? '999988887777' : '888877776666';

  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // Gọi API nạp tiền (khi dùng API thực tế, hàm này sẽ cộng tiền vào DB)
      await depositAPI(amount);
      alert(`Đã nạp thành công ${amount.toLocaleString()} VND vào ví!`);
      navigate(returnUrl, { replace: true });
    } catch (error) {
      alert('Có lỗi xảy ra khi nạp tiền: ' + error.message);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate(returnUrl, { replace: true });
  };

  const paymentData = `Nạp tiền: ${amount} VND. Chuyển khoản đến ${accountHolder}. Ngân hàng: ${bankName}. Số tài khoản: ${accountNumber}`;

  return (
    <div
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: '#02140b' }}
    >
      <div
        className="card p-5 shadow-lg text-center"
        style={{ maxWidth: '500px', width: '100%', borderRadius: '15px', backgroundColor: '#fff' }}
      >
        <h2 className="mb-4 text-dark fw-bold">Nạp Tiền Vào Ví {roleName}</h2>

        <div className="d-flex justify-content-center mb-4 p-3 border rounded bg-white">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(paymentData)}`}
            alt="Payment QR Code"
          />
        </div>

        <div className="text-start mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <p className="mb-2 text-dark">
            <strong>Ngân hàng:</strong> {bankName}
          </p>
          <p className="mb-2 text-dark">
            <strong>Ví thụ hưởng:</strong> {accountHolder}
          </p>
          <p className="mb-2 text-dark">
            <strong>Số tài khoản ví:</strong> {accountNumber}
          </p>
          <p className="mb-2 text-dark">
            <strong>Số tiền cần nạp:</strong>{' '}
            <span className="text-success fw-bold">{amount.toLocaleString()} VND</span>
          </p>
          <p className="mb-0 text-dark">
            <strong>Nội dung:</strong> NAPTIEN {user?.username?.toUpperCase() || 'MOCK'}
          </p>
        </div>

        <div className="d-flex gap-3 mt-4">
          <button
            className="btn w-50 fw-bold"
            style={{ backgroundColor: '#e2e8f0', color: '#475569' }}
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Hủy Giao Dịch
          </button>
          <button
            className="btn w-50 fw-bold"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
            onClick={handleConfirmPayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Đang Xử Lý...' : 'Đã Thanh Toán'}
          </button>
        </div>
      </div>
    </div>
  );
}
