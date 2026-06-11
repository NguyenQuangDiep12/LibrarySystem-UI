import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userApi, borrowApi, fineApi } from '../../apis/apis'
import { getApiData, getPaginatedItems, formatDate, formatCurrency } from '../../utils/helpers'
import { accountStatusColors, cardStatusColors, borrowStatusColors, paymentStatusColors, fineTypeColors } from '../../constants/statusColors'
import { toast } from '../../stores/toastStore'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../constants/roles'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'

export default function UserDetailPage() {
  const { id } = useParams()
  const { role } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('info')

  // UserProfileResponse: { userId, fullName, email, phone, address, avatarUrl, role,
  //   status, libraryCardCode, cardStatus, createdAt }
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getById(id),
  })

  // BorrowRecordSummaryResponse list
  const { data: borrowData } = useQuery({
    queryKey: ['user-borrows', id],
    queryFn: () => borrowApi.getByUser(id, { pageSize: 20 }),
    enabled: tab === 'borrows',
  })

  // FineResponse list
  const { data: finesData } = useQuery({
    queryKey: ['user-fines', id],
    queryFn: () => fineApi.getByUser(id, { pageSize: 20 }),
    enabled: tab === 'fines',
  })

  const user = getApiData(data)
  const borrows = getPaginatedItems(borrowData).items
  const fines = getPaginatedItems(finesData).items

  const toggleAccount = useMutation({
    mutationFn: (newStatus) => userApi.updateStatus(id, newStatus),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái tài khoản')
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  const toggleCard = useMutation({
    mutationFn: (newStatus) => userApi.updateCardStatus(id, newStatus),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thẻ')
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (isError || !user) return <ErrorState onRetry={refetch} />

  const tabs = [
    { key: 'info', label: 'Thông tin' },
    { key: 'borrows', label: 'Lịch sử mượn' },
    { key: 'fines', label: 'Vi phạm' },
  ]

  return (
    <div>
      <Breadcrumb items={[{ label: 'Người dùng', to: '/admin/users' }, { label: user.fullName }]} />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {user.fullName?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.fullName}</h1>
            <p className="text-slate-500">{user.email} · {user.phone}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-700">{user.role}</Badge>
              <Badge className={accountStatusColors[user.status]}>{user.status}</Badge>
              <Badge className={cardStatusColors[user.cardStatus]}>Thẻ: {user.cardStatus}</Badge>
            </div>
          </div>
          {isAdmin(role) && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={user.status === 'ACTIVE' ? 'danger' : 'success'}
                onClick={() => toggleAccount.mutate(user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE')}
              >
                {user.status === 'ACTIVE' ? 'Khóa TK' : 'Mở TK'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => toggleCard.mutate(user.cardStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED')}
              >
                {user.cardStatus === 'BLOCKED' ? 'Mở thẻ' : 'Khóa thẻ'}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2 border-b">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* UserProfileResponse fields */}
            <div><dt className="text-sm text-slate-500">Địa chỉ</dt><dd>{user.address || '—'}</dd></div>
            <div><dt className="text-sm text-slate-500">Mã thẻ</dt><dd>{user.libraryCardCode || '—'}</dd></div>
            <div><dt className="text-sm text-slate-500">Ngày tạo</dt><dd>{formatDate(user.createdAt)}</dd></div>
          </dl>
        )}

        {tab === 'borrows' && (
          <table className="mt-6 w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2">Mã phiếu</th>
                <th className="py-2">Ngày mượn</th>
                <th className="py-2">Hạn trả</th>
                <th className="py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* BorrowRecordSummaryResponse: { borrowId, borrowCode, borrowDate, dueDate, status } */}
              {borrows.map((r) => (
                <tr key={r.borrowId}>
                  <td className="py-2">{r.borrowCode}</td>
                  <td className="py-2">{formatDate(r.borrowDate)}</td>
                  <td className="py-2">{formatDate(r.dueDate)}</td>
                  <td className="py-2">
                    <Badge className={borrowStatusColors[r.status]}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'fines' && (
          <table className="mt-6 w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Số tiền</th>
                <th className="py-2">Loại</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* FineResponse: { fineId, amount, fineType, paymentStatus, createdAt } */}
              {fines.map((f) => (
                <tr key={f.fineId}>
                  <td className="py-2">{f.fineId}</td>
                  <td className="py-2">{formatCurrency(f.amount)}</td>
                  <td className="py-2">
                    <Badge className={fineTypeColors[f.fineType]}>{f.fineType}</Badge>
                  </td>
                  <td className="py-2">
                    <Badge className={paymentStatusColors[f.paymentStatus]}>{f.paymentStatus}</Badge>
                  </td>
                  <td className="py-2">{formatDate(f.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}