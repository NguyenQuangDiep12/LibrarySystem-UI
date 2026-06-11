import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3, Copy, BookOpen, Bookmark, Building2, ClipboardList,
  CreditCard, LayoutDashboard, LogOut, Menu, Tag, Users, UserCog, X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../constants/roles'

const allNavItems = [
  { to: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/statistics', label: 'Thống kê', icon: BarChart3, roles: [ROLES.ADMIN] },
  { to: '/admin/books', label: 'Sách', icon: BookOpen, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/book-copies', label: 'Bản sao sách', icon: Copy, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/authors', label: 'Tác giả', icon: Users, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/categories', label: 'Danh mục', icon: Tag, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/publishers', label: 'Nhà xuất bản', icon: Building2, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/borrow-records', label: 'Phiếu mượn', icon: ClipboardList, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/reservations', label: 'Đặt trước', icon: Bookmark, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/fines', label: 'Phiếu phạt', icon: CreditCard, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/users', label: 'Người dùng', icon: Users, roles: [ROLES.STAFF, ROLES.ADMIN] },
  { to: '/admin/staffs', label: 'Nhân viên', icon: UserCog, roles: [ROLES.ADMIN] },
]

export default function AdminLayout() {
  const { userInfo, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = allNavItems.filter((item) => item.roles.includes(userInfo?.role))

  const roleLabel = { READER: 'Bạn đọc', STAFF: 'Nhân viên', ADMIN: 'Quản trị viên' }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold">
            <span className="text-xl">📚</span>
            Admin Panel
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <p className="truncate text-sm font-medium">{userInfo?.fullName}</p>
          <p className="text-xs text-slate-400">{roleLabel[userInfo?.role]}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="text-sm text-slate-500 hover:text-primary">
            ← Về trang chủ
          </Link>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
