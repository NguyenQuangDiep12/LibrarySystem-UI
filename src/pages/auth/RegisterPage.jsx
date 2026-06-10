import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../apis/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authApi.register(formData);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login'); // Chuyển về trang đăng nhập
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.header}>TẠO TÀI KHOẢN MỚI</h2>
        {error && <div style={styles.errorBox}>{error}</div>}

        <input style={styles.input} name="fullName" placeholder="Họ và tên" onChange={handleChange} required />
        <input style={styles.input} type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input style={styles.input} type="tel" name="phone" placeholder="Số điện thoại" onChange={handleChange} required />
        <input style={styles.input} type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
        </button>

        <div style={styles.linkContainer}>
          <Link to="/login" style={styles.link}>Đã có tài khoản? Đăng nhập ngay</Link>
        </div>
      </form>
    </div>
  );
}

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