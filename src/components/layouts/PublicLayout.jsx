import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { isStaffOrAdmin } from '../../constants/roles'
import Footer from '../Footer'

export default function PublicLayout() {
  const { isAuthenticated, userInfo, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <span className="text-2xl">📚</span>
            Thư Viện
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  Xin chào, {userInfo?.fullName}
                </span>
                {isStaffOrAdmin(userInfo?.role) ? (
                  <Link
                    to="/admin/dashboard"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Quản trị
                  </Link>
                ) : (
                  <Link
                    to="/reader/profile"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Tài khoản
                  </Link>
                )}
                <button
                  onClick={() => { logout(); navigate('/') }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                  Đăng nhập
                </Link>
                <Link to="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
