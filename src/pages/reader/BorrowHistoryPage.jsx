import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { borrowApi } from '../../apis/apis'
import { useAuth } from '../../contexts/AuthContext'
import { getPaginatedItems, formatDate } from '../../utils/helpers'
import { borrowStatusColors, extensionStatusColors } from '../../constants/statusColors'
import { toast } from '../../stores/toastStore'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

export default function BorrowHistoryPage() {
  const { userInfo } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['borrow-records', 'user', userInfo?.userId, page],
    queryFn: () => borrowApi.getByUser(userInfo.userId, { page, pageSize: 10 }),
    enabled: !!userInfo?.userId,
  })

  const requestExtension = useMutation({
    mutationFn: (id) => borrowApi.requestExtension(id),
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu gia hạn')
      queryClient.invalidateQueries({ queryKey: ['borrow-records'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  // BorrowRecordSummaryResponse: { borrowId, borrowCode, readerId, readerName,
  //   borrowDate, dueDate, returnedDate, extensionCount, borrowType, status,
  //   extensionRequestStatus, totalBooks }
  const canRequestExtension = (record) =>
    record.status === 'BORROWING' &&
    record.extensionRequestStatus !== 'PENDING' &&
    (record.extensionCount ?? 0) < 2

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Lịch sử mượn sách</h1>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading && <div className="p-6"><TableSkeleton cols={8} /></div>}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && items.length === 0 && (
          <EmptyState title="Chưa có phiếu mượn nào" />
        )}
        {!isLoading && !isError && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Mã phiếu</th>
                  <th className="px-4 py-3 font-medium">Ngày mượn</th>
                  <th className="px-4 py-3 font-medium">Hạn trả</th>
                  <th className="px-4 py-3 font-medium">Số sách</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Gia hạn</th>
                  <th className="px-4 py-3 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((r) => (
                  <tr key={r.borrowId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.borrowCode}</td>
                    <td className="px-4 py-3">{formatDate(r.borrowDate)}</td>
                    <td className="px-4 py-3">{formatDate(r.dueDate)}</td>
                    <td className="px-4 py-3">{r.totalBooks ?? '—'}</td>
                    <td className="px-4 py-3">{r.borrowType === 'IN_LIBRARY' ? 'Đọc tại chỗ' : 'Mang về'}</td>
                    <td className="px-4 py-3">
                      <Badge className={borrowStatusColors[r.status]}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {r.extensionRequestStatus && r.extensionRequestStatus !== 'NONE' && (
                        <Badge className={extensionStatusColors[r.extensionRequestStatus]}>
                          {r.extensionRequestStatus}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/reader/borrow-records/${r.borrowId}`}>
                          <Button size="sm" variant="secondary">Xem</Button>
                        </Link>
                        {canRequestExtension(r) && (
                          <Button
                            size="sm"
                            loading={requestExtension.isPending}
                            onClick={() => requestExtension.mutate(r.borrowId)}
                          >
                            Gia hạn
                          </Button>
                        )}
                      </div>
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