import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-brand">
          <div className="footer-brand-dot">📚</div>
          LibraryHub
        </div>
        <div className="footer-divider"></div>
        <div className="footer-copy">© 2025 — Hệ thống quản lý thư viện v1.0</div>
      </div>

      <div className="footer-links">
        <div className="footer-link">Tài liệu</div>
        <div className="footer-link">Hỗ trợ</div>
        <div className="footer-link">Điều khoản</div>
        <div className="footer-link">Bảo mật</div>
      </div>

      <div className="footer-status">
        <div className="status-dot"></div>
        Hệ thống hoạt động bình thường
      </div>
    </footer>
  );
}