import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, BookOpen, LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { notificationApi } from '../../apis/apis'
import { getPaginatedItems } from '../../utils/helpers'

const navItems = [
  { to: '/reader/profile', label: 'Hồ sơ', icon: User },
  { to: '/reader/borrow-history', label: 'Lịch sử mượn', icon: BookOpen },
  { to: '/reader/notifications', label: 'Thông báo', icon: Bell },
]

export default function ReaderLayout() {
  const { userInfo, logout } = useAuth()
  const navigate = useNavigate()

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.getAll({ page: 1, pageSize: 50 }),
    refetchInterval: 30000,
  })

  const { items: notifications } = getPaginatedItems(notifData)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <span className="text-2xl">📚</span>
            Thư Viện
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/reader/notifications" className="relative rounded-lg p-2 hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                {userInfo?.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">{userInfo?.fullName}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="space-y-1 rounded-xl border bg-white p-3 shadow-sm">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
                {to.includes('notifications') && unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unreadCount}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
