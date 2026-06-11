import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fineApi } from '../../apis/apis'
import { getPaginatedItems, formatDate, formatCurrency } from '../../utils/helpers'
import { fineTypeColors, paymentStatusColors } from '../../constants/statusColors'
import { toast } from '../../stores/toastStore'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

export default function FinesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['fines', page],
    queryFn: () => fineApi.getAll({ page, pageSize: 10 }),
  })

  const payMutation = useMutation({
    mutationFn: (id) => fineApi.pay(id),
    onSuccess: () => {
      toast.success('Xác nhận thanh toán thành công')
      queryClient.invalidateQueries({ queryKey: ['fines'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Phiếu phạt' }]} />
      <h1 className="text-2xl font-bold">Quản lý phiếu phạt</h1>

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
                  <th className="px-4 py-3">Mã phiếu</th>
                  <th className="px-4 py-3">Bạn đọc</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((f) => (
                  <tr key={f.fineId ?? f.id}>
                    <td className="px-4 py-3">{f.fineId ?? f.id}</td>
                    <td className="px-4 py-3">{f.borrowCode}</td>
                    <td className="px-4 py-3">{f.readerName}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(f.amount)}</td>
                    <td className="px-4 py-3"><Badge className={fineTypeColors[f.violationType ?? f.type]}>{f.violationType ?? f.type}</Badge></td>
                    <td className="px-4 py-3"><Badge className={paymentStatusColors[f.paymentStatus]}>{f.paymentStatus}</Badge></td>
                    <td className="px-4 py-3">{formatDate(f.createdAt)}</td>
                    <td className="px-4 py-3">
                      {f.paymentStatus === 'PENDING' && (
                        <Button size="sm" loading={payMutation.isPending} onClick={() => payMutation.mutate(f.fineId ?? f.id)}>
                          Xác nhận TT
                        </Button>
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
