import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>📚</span>
          <span>Hệ thống quản lý thư viện v1.0</span>
        </div>
        <p className="text-sm text-slate-400">© 2025 — Library Management System</p>
      </div>
    </footer>
  )
}
