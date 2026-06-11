import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { borrowApi } from '../../apis/apis'
import { getApiData, formatDate, formatDateTime } from '../../utils/helpers'
import { borrowStatusColors, extensionStatusColors } from '../../constants/statusColors'
import { toast } from '../../stores/toastStore'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'

export default function BorrowRecordDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['borrow-record', id],
    queryFn: () => borrowApi.getById(id),
  })

  const requestExtension = useMutation({
    mutationFn: () => borrowApi.requestExtension(id),
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu gia hạn')
      queryClient.invalidateQueries({ queryKey: ['borrow-record', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  // BorrowRecordDetailResponse: { borrowId, borrowCode, readerId, readerName,
  //   approverId, approverName, borrowDate, dueDate, returnedDate, borrowType,
  //   status, extensionCount, borrowDetails: BorrowDetailResponse[] }
  const record = getApiData(data)

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (isError || !record) return <ErrorState onRetry={refetch} />

  const canRequestExtension =
    record.status === 'BORROWING' &&
    record.extensionRequestStatus !== 'PENDING' &&
    (record.extensionCount ?? 0) < 2

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Lịch sử mượn', to: '/reader/borrow-history' },
          { label: record.borrowCode },
        ]}
      />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{record.borrowCode}</h1>
            <p className="mt-1 text-slate-500">Bạn đọc: {record.readerName}</p>
            {record.approverName && (
              <p className="text-slate-500">Người duyệt: {record.approverName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge className={borrowStatusColors[record.status]}>{record.status}</Badge>
            {record.extensionRequestStatus && record.extensionRequestStatus !== 'NONE' && (
              <Badge className={extensionStatusColors[record.extensionRequestStatus]}>
                Gia hạn: {record.extensionRequestStatus}
              </Badge>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-slate-500">Ngày mượn</dt>
            <dd className="font-medium">{formatDate(record.borrowDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Hạn trả</dt>
            <dd className="font-medium">{formatDate(record.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Ngày trả</dt>
            <dd className="font-medium">{formatDate(record.returnedDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Loại mượn</dt>
            <dd className="font-medium">{record.borrowType === 'IN_LIBRARY' ? 'Đọc tại chỗ' : 'Mang về'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Số lần gia hạn</dt>
            <dd className="font-medium">{record.extensionCount ?? 0}</dd>
          </div>
        </dl>

        {canRequestExtension && (
          <Button className="mt-4" loading={requestExtension.isPending} onClick={() => requestExtension.mutate()}>
            Gửi yêu cầu gia hạn
          </Button>
        )}

        <h2 className="mt-8 mb-4 text-lg font-semibold">Chi tiết sách</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-2">Barcode</th>
                <th className="px-4 py-2">Tên sách</th>
                <th className="px-4 py-2">Ngày trả</th>
                <th className="px-4 py-2">Tình trạng</th>
                <th className="px-4 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* BorrowDetailResponse: { borrowDetailId, copyId, barcode, bookTitle,
                  returnedAt, itemCondition, status } */}
              {(record.borrowDetails ?? []).map((d) => (
                <tr key={d.borrowDetailId}>
                  <td className="px-4 py-2">{d.barcode}</td>
                  <td className="px-4 py-2">{d.bookTitle}</td>
                  <td className="px-4 py-2">{formatDateTime(d.returnedAt)}</td>
                  <td className="px-4 py-2">{d.itemCondition ?? '—'}</td>
                  <td className="px-4 py-2">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}