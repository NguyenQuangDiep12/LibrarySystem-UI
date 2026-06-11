import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reservationApi } from '../../apis/apis'
import { getPaginatedItems, formatDate } from '../../utils/helpers'
import { reservationStatusColors } from '../../constants/statusColors'
import { toast } from '../../stores/toastStore'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

export default function ReservationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reservations', page],
    queryFn: () => reservationApi.getAll({ page, pageSize: 10 }),
  })

  const completeMutation = useMutation({
    mutationFn: (id) => reservationApi.complete(id),
    onSuccess: () => {
      toast.success('Chuyển thành phiếu mượn thành công')
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => reservationApi.cancel(id),
    onSuccess: () => {
      toast.success('Đã hủy đặt trước')
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Đặt trước' }]} />
      <h1 className="text-2xl font-bold">Quản lý đặt trước</h1>

      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading && <div className="p-6"><TableSkeleton cols={6} /></div>}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && items.length === 0 && <EmptyState />}
        {!isLoading && !isError && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Bạn đọc</th>
                  <th className="px-4 py-3">Sách</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((r) => (
                  <tr key={r.reservationId ?? r.id}>
                    <td className="px-4 py-3">{r.reservationId ?? r.id}</td>
                    <td className="px-4 py-3">{r.readerName}</td>
                    <td className="px-4 py-3">{r.bookTitle}</td>
                    <td className="px-4 py-3"><Badge className={reservationStatusColors[r.status]}>{r.status}</Badge></td>
                    <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      {r.status === 'WAITING' && (
                        <div className="flex gap-2">
                          <Button size="sm" loading={completeMutation.isPending} onClick={() => completeMutation.mutate(r.reservationId ?? r.id)}>
                            Chuyển mượn
                          </Button>
                          <Button size="sm" variant="danger" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate(r.reservationId ?? r.id)}>
                            Hủy
                          </Button>
                        </div>
                      )}
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
