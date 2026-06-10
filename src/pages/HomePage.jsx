import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/dashboard.css';

// ── MOCK DATA (Dễ dàng thay thế bằng API Fetch sau này) ──
const STATS_DATA = [
  { id: 1, label: 'Tổng đầu sách', value: '1,248', delta: '↑ 12 cuốn mới tháng này', variant: 'neutral' },
  { id: 2, label: 'Đang mượn', value: '324', delta: 'trên 680 bản sao', variant: 'info' },
  { id: 3, label: 'Quá hạn', value: '5', delta: '↑ 2 so với hôm qua', variant: 'warn' },
  { id: 4, label: 'Độc giả', value: '892', delta: '↑ 18 đăng ký mới', variant: 'success' }
];

const RECENT_LOANS = [
  { id: 'BR-20250610-A1F3', reader: 'Trần Thị Minh', dueDate: '15/06/2025', status: 'Đang mượn', statusClass: 'badge-green' },
  { id: 'BR-20250609-B2D7', reader: 'Lê Hồng Phúc', dueDate: '12/06/2025', status: 'Quá hạn', statusClass: 'badge-warn' },
  { id: 'BR-20250608-C3E9', reader: 'Phạm Quốc Hùng', dueDate: '18/06/2025', status: 'Đang mượn', statusClass: 'badge-green' },
  { id: 'BR-20250607-D4F2', reader: 'Nguyễn Lan Anh', dueDate: '07/06/2025', status: 'Đã trả', statusClass: 'badge-gray' },
  { id: 'BR-20250606-E5G1', reader: 'Vũ Đức Thắng', dueDate: '09/06/2025', status: 'Quá hạn', statusClass: 'badge-warn' },
  { id: 'BR-20250605-F6H8', reader: 'Hoàng Thị Bích', dueDate: '20/06/2025', status: 'Đặt trước', statusClass: 'badge-info' }
];

const QUICK_ACTIONS = [
  { id: 1, icon: '📝', label: 'Tạo phiếu mượn', sub: 'Ghi nhận mượn sách', color: 'green' },
  { id: 2, icon: '↩️', label: 'Xác nhận trả', sub: 'Thu nhận sách về', color: 'info' },
  { id: 3, icon: '💰', label: 'Thu phí phạt', sub: 'Xử lý vi phạm', color: 'warn' },
  { id: 4, icon: '👤', label: 'Thêm độc giả', sub: 'Đăng ký thẻ mới', color: 'gray' }
];

const TOP_BOOKS = [
  { rank: 1, name: 'Mắt Biếc', author: 'Nguyễn Nhật Ánh', count: 48, width: '100%', isTop: true },
  { rank: 2, name: 'Harry Potter (Tập 1)', author: 'J. K. Rowling', count: 40, width: '83%', isTop: true },
  { rank: 3, name: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', count: 31, width: '65%', isTop: true },
  { rank: 4, name: 'Chí Phèo', author: 'Nam Cao', count: 23, width: '48%', isTop: false },
  { rank: 5, name: 'The Day of the Jackal', author: 'Frederick Forsyth', count: 16, width: '33%', isTop: false }
];

const RECENT_ACTIVITIES = [
  { id: 1, color: 'var(--accent)', title: <>Phiếu mượn <strong>BR-20250610-A1F3</strong> được tạo bởi Nhân viên Trần Thảo</>, meta: '08:30 — Độc giả: Trần Thị Minh — 2 cuốn sách' },
  { id: 2, color: 'var(--info)', title: <>Trả sách thành công — phiếu <strong>BR-20250605-F6H8</strong></>, meta: '07:58 — Sách trả đúng hạn, tình trạng bình thường' },
  { id: 3, color: 'var(--warn)', title: <>Phiếu phạt mới — Lê Hồng Phúc quá hạn 3 ngày</>, meta: '07:00 — Tự động tạo bởi hệ thống — 30,000 VNĐ' },
  { id: 4, color: 'var(--accent)', title: <>Độc giả mới đăng ký — <strong>Nguyễn Lan Phương</strong></>, meta: 'Hôm qua, 16:45 — Mã thẻ: LIB-F3A901B2' },
  { id: 5, color: 'var(--ink-3)', title: <>Thêm 5 bản sao mới cho "Mắt Biếc"</>, meta: 'Hôm qua, 14:20 — Vị trí kệ: A1-Kệ 3' }
];

const HomePage = () => {
  return (
    <>
      {/* 1. Thanh điều hướng trên cùng */}
      <Navbar />

      {/* 2. Bố cục Layout chính chứa Menu bên và Nội dung */}
      <div className="layout">
        <Sidebar />

        <main className="main">
          {/* Tiêu đề trang */}
          <div className="page-header">
            <div className="page-eyebrow">Tổng quan hệ thống</div>
            <h1 className="page-title">Xin chào, Nguyễn Văn A 👋</h1>
            <p className="page-sub">Thứ Tư, 11 tháng 6 năm 2025 — Cập nhật lúc 08:42</p>
          </div>

          {/* Thanh cảnh báo quá hạn */}
          <div className="alert-bar">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">
              <strong>5 phiếu mượn quá hạn</strong> — cần xử lý trước 17:00 hôm nay.
            </div>
            <div className="alert-action">Xem ngay</div>
          </div>

          {/* Khối Thống kê */}
          <div className="stats-grid">
            {STATS_DATA.map((stat) => (
              <div key={stat.id} className={`stat-card ${stat.variant}`}>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-delta">{stat.delta}</div>
              </div>
            ))}
          </div>

          {/* Bố cục 2 cột chính */}
          <div className="two-col">
            {/* Phiếu mượn gần đây */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">Phiếu mượn gần đây</div>
                <div className="card-action">Xem tất cả →</div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã phiếu</th>
                      <th>Độc giả</th>
                      <th>Hạn trả</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_LOANS.map((loan) => (
                      <tr key={loan.id}>
                        <td><span className="td-code">{loan.id}</span></td>
                        <td>{loan.reader}</td>
                        <td>{loan.dueDate}</td>
                        <td>
                          <span className={`badge ${loan.statusClass}`}>
                            <span className="badge-dot"></span>{loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cột Phải */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Thao tác nhanh */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Thao tác nhanh</div>
                </div>
                <div className="quick-grid">
                  {QUICK_ACTIONS.map((action) => (
                    <div key={action.id} className="quick-btn">
                      <div className={`quick-icon ${action.color}`}>{action.icon}</div>
                      <div className="quick-label">{action.label}</div>
                      <div className="quick-sub">{action.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sách mượn nhiều nhất */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Sách mượn nhiều nhất</div>
                  <div className="card-action">Chi tiết →</div>
                </div>
                <div>
                  {TOP_BOOKS.map((book) => (
                    <div key={book.rank} className="book-row">
                      <div className={`book-rank ${book.isTop ? 'top' : ''}`}>{book.rank}</div>
                      <div className="book-info">
                        <div className="book-name">{book.name}</div>
                        <div className="book-author">{book.author}</div>
                      </div>
                      <div className="book-bar-wrap">
                        <div className="book-bar-bg">
                          <div className="book-bar-fill" style={{ width: book.width }}></div>
                        </div>
                        <div className="book-count">{book.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Nhật ký hoạt động */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Hoạt động gần đây</div>
              <div className="card-action">Xem nhật ký →</div>
            </div>
            <div className="activity-list">
              {RECENT_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-dot" style={{ background: activity.color }}></div>
                  <div className="activity-text">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-meta">{activity.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* 3. Chân trang cố định */}
      <Footer />
    </>
  );
};

export default HomePage;