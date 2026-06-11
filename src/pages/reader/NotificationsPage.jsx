import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../../apis/apis'
import { getPaginatedItems, formatRelativeTime } from '../../utils/helpers'
import { toast } from '../../stores/toastStore'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import { TableSkeleton } from '../../components/ui/Skeleton'

const typeIcons = {
  EXTENSIONAPPROVED: '✅',
  EXTENSIONREJECTED: '❌',
  SYSTEMANNOUNCEMENT: '🔔',
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationApi.getAll({ page, pageSize: 10 }),
  })

  const readAll = useMutation({
    mutationFn: () => notificationApi.readAll(),
    onSuccess: () => {
      toast.success('Đã đánh dấu tất cả đã đọc')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const readOne = useMutation({
    mutationFn: (id) => notificationApi.readOne(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
        <Button variant="secondary" size="sm" loading={readAll.isPending} onClick={() => readAll.mutate()}>
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <TableSkeleton rows={5} cols={1} />}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && items.length === 0 && <EmptyState title="Không có thông báo" />}
        {items.map((n) => (
          <div
            key={n.notificationId ?? n.id}
            onClick={() => !n.isRead && readOne.mutate(n.notificationId ?? n.id)}
            className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
              !n.isRead ? 'border-l-4 border-l-primary' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{typeIcons[n.type] || '📌'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm ${!n.isRead ? 'font-bold' : 'font-medium'} text-slate-900`}>
                    {n.title}
                  </h3>
                  {!n.isRead && <Badge className="bg-blue-100 text-blue-700">Chưa đọc</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{n.content ?? n.message}</p>
                <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
