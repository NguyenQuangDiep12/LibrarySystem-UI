import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookCopyApi } from '../../apis/apis'
import { getApiData, formatDateTime } from '../../utils/helpers'
import { bookCopyStatusColors } from '../../constants/statusColors'
import { toast } from '../../stores/toastStore'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'

export default function BookCopyDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [shelfLocation, setShelfLocation] = useState('')
  const [physicalCondition, setPhysicalCondition] = useState('Normal')
  const [status, setStatus] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['book-copy', id],
    queryFn: () => bookCopyApi.getById(id),
  })

  const copy = getApiData(data)

  const updateCopy = useMutation({
    mutationFn: () => bookCopyApi.update(id, { shelfLocation, physicalCondition }),
    onSuccess: () => {
      toast.success('Cập nhật thành công')
      queryClient.invalidateQueries({ queryKey: ['book-copy', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  const updateStatus = useMutation({
    mutationFn: (newStatus) => bookCopyApi.updateStatus(id, newStatus),
    onSuccess: () => {
      toast.success('Đổi trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['book-copy', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (isError || !copy) return <ErrorState onRetry={refetch} />

  return (
    <div>
      <Breadcrumb items={[{ label: 'Bản sao sách', to: '/admin/book-copies' }, { label: copy.barcode }]} />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-mono">{copy.barcode}</h1>
          <Badge className={bookCopyStatusColors[copy.status]}>{copy.status}</Badge>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">Tên sách</dt><dd className="font-medium">{copy.bookTitle ?? copy.book?.title}</dd></div>
          <div><dt className="text-sm text-slate-500">ISBN</dt><dd>{copy.isbn ?? copy.book?.isbn}</dd></div>
          <div><dt className="text-sm text-slate-500">Vị trí kệ</dt><dd>{copy.shelfLocation || '—'}</dd></div>
          <div><dt className="text-sm text-slate-500">Tình trạng</dt><dd>{copy.physicalCondition ?? 'Normal'}</dd></div>
          <div><dt className="text-sm text-slate-500">Ngày tạo</dt><dd>{formatDateTime(copy.createdAt)}</dd></div>
        </dl>

        <div className="mt-8 grid gap-6 border-t pt-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-semibold">Cập nhật thông tin</h2>
            <Input label="Vị trí kệ" defaultValue={copy.shelfLocation} onChange={(e) => setShelfLocation(e.target.value)} />
            <Select label="Tình trạng vật lý" defaultValue={copy.physicalCondition ?? 'Normal'} onChange={(e) => setPhysicalCondition(e.target.value)}>
              <option value="Normal">Normal</option>
              <option value="Torn">Torn</option>
              <option value="Damaged">Damaged</option>
            </Select>
            <Button loading={updateCopy.isPending} onClick={() => updateCopy.mutate()}>Lưu</Button>
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold">Đổi trạng thái</h2>
            <Select value={status || copy.status} onChange={(e) => setStatus(e.target.value)}>
              {Object.keys(bookCopyStatusColors).map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Button loading={updateStatus.isPending} onClick={() => updateStatus.mutate(status || copy.status)}>
              Cập nhật trạng thái
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
