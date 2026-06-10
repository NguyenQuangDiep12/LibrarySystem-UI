import React from 'react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">📚</div>
        LibraryHub
      </div>

      <div className="nav-search">
        <span className="nav-search-icon">🔍</span>
        <input type="text" placeholder="Tìm sách, độc giả, phiếu mượn..." />
      </div>

      <div className="nav-right">
        <button className="nav-btn nav-notif">
          🔔
          <span className="notif-dot"></span>
        </button>
        <button className="nav-btn">⚙️</button>
        <div className="nav-avatar" title="Nguyễn Văn A — Admin">A</div>
      </div>
    </nav>
  );
}