import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '../../apis/apis'
import useDebounce from '../../hooks/useDebounce'
import { getPaginatedItems } from '../../utils/helpers'
import { accountStatusColors, cardStatusColors } from '../../constants/statusColors'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

export default function UsersPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const debouncedName = useDebounce(fullName)
  const debouncedEmail = useDebounce(email)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', debouncedName, debouncedEmail, status, page],
    queryFn: () =>
      userApi.getAll({
        fullName: debouncedName || undefined,
        email: debouncedEmail || undefined,
        status: status || undefined,
        page,
        pageSize: 10,
      }),
  })

  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Người dùng' }]} />
      <h1 className="text-2xl font-bold">Quản lý người dùng</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input placeholder="Họ tên..." value={fullName} onChange={(e) => { setFullName(e.target.value); setPage(1) }} className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary" />
        <input placeholder="Email..." value={email} onChange={(e) => { setEmail(e.target.value); setPage(1) }} className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary" />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="LOCKED">LOCKED</option>
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading && <div className="p-6"><TableSkeleton cols={8} /></div>}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && items.length === 0 && <EmptyState />}
        {!isLoading && !isError && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">TK</th>
                  <th className="px-4 py-3">Thẻ</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((u) => (
                  <tr key={u.userId ?? u.id}>
                    <td className="px-4 py-3">{u.userId ?? u.id}</td>
                    <td className="px-4 py-3 font-medium">{u.fullName}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.phone}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3"><Badge className={accountStatusColors[u.status]}>{u.status}</Badge></td>
                    <td className="px-4 py-3"><Badge className={cardStatusColors[u.cardStatus]}>{u.cardStatus}</Badge></td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/users/${u.userId ?? u.id}`}>
                        <Button size="sm" variant="secondary">Chi tiết</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4">
              <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
