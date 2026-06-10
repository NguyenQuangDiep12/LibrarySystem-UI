import React from 'react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Nhóm: Tổng quan */}
      <div className="sidebar-section">
        <div className="sidebar-label">Tổng quan</div>
        <div className="nav-item active">
          <span className="nav-icon">🏠</span>
          Dashboard
        </div>
        <div className="nav-item">
          <span className="nav-icon">📊</span>
          Thống kê
        </div>
      </div>

      <div className="sidebar-divider"></div>

      {/* Nhóm: Nghiệp vụ */}
      <div className="sidebar-section" style={{ paddingTop: '8px' }}>
        <div className="sidebar-label">Nghiệp vụ</div>
        <div className="nav-item">
          <span className="nav-icon">📖</span>
          Mượn / Trả
          <span className="nav-badge warn">3</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">🔖</span>
          Đặt trước
          <span className="nav-badge green">7</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">💸</span>
          Vi phạm & Phạt
          <span className="nav-badge warn">2</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">🔔</span>
          Thông báo
        </div>
      </div>

      <div className="sidebar-divider"></div>

      {/* Nhóm: Danh mục */}
      <div className="sidebar-section" style={{ paddingTop: '8px' }}>
        <div className="sidebar-label">Danh mục</div>
        <div className="nav-item">
          <span className="nav-icon">📚</span>
          Đầu sách
        </div>
        <div className="nav-item">
          <span className="nav-icon">🗂️</span>
          Bản sao sách
        </div>
        <div className="nav-item">
          <span className="nav-icon">🏷️</span>
          Danh mục
        </div>
        <div className="nav-item">
          <span className="nav-icon">✍️</span>
          Tác giả
        </div>
        <div className="nav-item">
          <span className="nav-icon">🏢</span>
          Nhà xuất bản
        </div>
      </div>

      <div className="sidebar-divider"></div>

      {/* Nhóm: Quản trị */}
      <div className="sidebar-section" style={{ paddingTop: '8px' }}>
        <div className="sidebar-label">Quản trị</div>
        <div className="nav-item">
          <span className="nav-icon">👥</span>
          Độc giả
        </div>
        <div className="nav-item">
          <span className="nav-icon">🪪</span>
          Nhân viên
        </div>
        <div className="nav-item">
          <span className="nav-icon">🔐</span>
          Phân quyền
        </div>
      </div>

      {/* Thẻ người dùng dưới cùng */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-card-avatar">A</div>
          <div>
            <div className="user-card-name">Nguyễn Văn A</div>
            <div className="user-card-role">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}