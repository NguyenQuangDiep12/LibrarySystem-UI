// src/pages/LoginPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../apis/authApi';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- STATE CHO ĐĂNG NHẬP ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ type: '', text: '' }); // type: 'error' | 'success'

  // --- STATE CHO POPUP QUÊN MẬT KHẨU ---
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(1); // 1: Nhập Email | 2: Nhập OTP
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']); // Mảng 6 phần tử cho 6 ô
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState('');
  
  // Refs để xử lý tự động nhảy ô nhập OTP
  const inputRefs = useRef([]);

  // ================= 1. LUỒNG ĐĂNG NHẬP =================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginMessage({ type: '', text: '' });

    try {
      const result = await authApi.login({ email, password });
      if (result.success) {
        login(result.data); // Lưu token & user vào localStorage (qua AuthContext)
        navigate('/'); // Chuyển về trang chủ sau khi đăng nhập thành công
      }
    } catch (error) {
      setLoginMessage({ type: 'error', text: error.message || "Đăng nhập thất bại!" });
    } finally {
      setIsLoading(false);
    }
  };

  // ================= 2. LUỒNG QUÊN MẬT KHẨU =================
  
  // Bước 1: Gửi Email lấy OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPopupLoading(true);
    setPopupError('');
    try {
      await authApi.forgotPassword({ email: forgotEmail });
      setPopupStep(2); // Thành công -> Chuyển sang bước nhập OTP
    } catch (error) {
      setPopupError(error.message || "Email không hợp lệ!");
    } finally {
      setPopupLoading(false);
    }
  };

  // Xử lý logic 6 ô nhập OTP
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return; // Chỉ cho phép nhập số
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1); // Chỉ lấy 1 ký tự cuối
    setOtpValues(newOtpValues);

    // Tự động focus sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Nếu bấm Backspace ở ô trống, lùi focus về ô trước
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Bước 2: Gửi OTP xác thực
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otpValues.join('');
    if (otpString.length < 6) {
      setPopupError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setPopupLoading(true);
    setPopupError('');
    try {
      await authApi.verifyOtp({ email: forgotEmail, otp: otpString });
      
      // XÁC THỰC THÀNH CÔNG -> Đóng popup, báo thành công ở màn hình Login
      setShowPopup(false);
      resetPopupState();
      setLoginMessage({ type: 'success', text: "Mật khẩu mới đã được gửi tới email của bạn!" });
    } catch (error) {
      // XỬ LÝ LỖI OTP:
      // Backend của bạn trả về: "OTP khong dung!" hoặc "OTP da het han!"
      const errText = error.message?.toLowerCase() || "";
      if (errText.includes("het han") || errText.includes("expired")) {
        setPopupError("expired otp");
      } else {
        setPopupError(error.message || "OTP không đúng...");
      }
    } finally {
      setPopupLoading(false);
    }
  };

  const resetPopupState = () => {
    setPopupStep(1);
    setForgotEmail('');
    setOtpValues(['', '', '', '', '', '']);
    setPopupError('');
  };

  const closePopup = () => {
    setShowPopup(false);
    resetPopupState();
  };

  return (
    <div style={styles.container}>
      {/* ================= FORM LOGIN CHÍNH ================= */}
      <form onSubmit={handleLoginSubmit} style={styles.form}>
        <h2 style={styles.header}>ĐĂNG NHẬP</h2>

        {loginMessage.text && (
          <div style={loginMessage.type === 'success' ? styles.successBox : styles.errorBox}>
            {loginMessage.text}
          </div>
        )}

        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </button>

        {/* THẺ A (LINKS) ĐIỀU HƯỚNG */}
        <div style={styles.linkContainer}>
          <Link to="/register" style={styles.link}>Bạn chưa có tài khoản? Đăng ký tài khoản</Link>
          {/* Nút bấm mở Popup */}
          <span onClick={() => setShowPopup(true)} style={{...styles.link, cursor: 'pointer', marginTop: '10px'}}>
            Quên mật khẩu?
          </span>
        </div>
      </form>

      {/* ================= POPUP QUÊN MẬT KHẨU ================= */}
      {showPopup && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <button onClick={closePopup} style={styles.closeBtn}>×</button>
            
            {popupStep === 1 ? (
              // BƯỚC 1: NHẬP EMAIL
              <form onSubmit={handleSendOtp}>
                <h3 style={styles.popupHeader}>Khôi phục mật khẩu</h3>
                <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>Nhập email đã đăng ký để nhận mã OTP</p>
                {popupError && <div style={styles.errorBox}>{popupError}</div>}
                
                <input style={styles.input} type="email" placeholder="Nhập Email của bạn" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                <button type="submit" disabled={popupLoading} style={styles.button}>
                  {popupLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>
              </form>
            ) : (
              // BƯỚC 2: NHẬP OTP 6 Ô
              <form onSubmit={handleVerifyOtp}>
                <h3 style={styles.popupHeader}>Xác thực OTP</h3>
                <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>Nhập mã 6 số vừa được gửi đến email <b>{forgotEmail}</b></p>
                
                {popupError && <div style={styles.errorBox}>{popupError}</div>}
                
                {/* Khu vực 6 ô nhập OTP */}
                <div style={styles.otpContainer}>
                  {otpValues.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={data}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={styles.otpInput}
                    />
                  ))}
                </div>

                <button type="submit" disabled={popupLoading} style={styles.button}>
                  {popupLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
                </button>
                <div style={{textAlign:'center', marginTop: '15px'}}>
                   <span onClick={() => setPopupStep(1)} style={styles.link}>Quay lại nhập Email</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES (CSS IN JS) =================
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
  form: { padding: '40px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '380px' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#333' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  errorBox: { padding: '10px', background: '#fce8e6', color: '#d93025', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' },
  successBox: { padding: '10px', background: '#e6f4ea', color: '#137333', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' },
  linkContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' },
  link: { color: '#1a73e8', textDecoration: 'none', fontSize: '14px' },
  
  // STYLES POPUP OVERLAY
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  popup: { background: '#fff', padding: '30px', borderRadius: '8px', width: '350px', position: 'relative' },
  closeBtn: { position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' },
  popupHeader: { marginTop: 0, color: '#333' },
  
  // STYLES 6 Ô OTP
  otpContainer: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  otpInput: { width: '40px', height: '50px', fontSize: '24px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }
};