import { Link } from 'react-router-dom'
import { ClipboardList, BookOpen, Bookmark, CreditCard } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

const quickLinks = [
  { to: '/admin/books', label: 'Quản lý sách', icon: BookOpen, color: 'bg-blue-50 text-blue-700' },
  { to: '/admin/borrow-records', label: 'Phiếu mượn', icon: ClipboardList, color: 'bg-amber-50 text-amber-700' },
  { to: '/admin/reservations', label: 'Đặt trước', icon: Bookmark, color: 'bg-purple-50 text-purple-700' },
  { to: '/admin/fines', label: 'Phiếu phạt', icon: CreditCard, color: 'bg-red-50 text-red-700' },
]

export default function DashboardPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: 'Tổng quan' }]} />
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-slate-500">Chào mừng đến hệ thống quản lý thư viện</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ to, label, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`rounded-lg p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-900">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
