import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-slate-300">403</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Không có quyền truy cập</h1>
      <p className="mt-2 text-slate-500">Bạn không có quyền xem trang này.</p>
      <Link to="/" className="mt-6">
        <Button>Về trang chủ</Button>
      </Link>
    </div>
  )
}
