import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { borrowApi } from '../../apis/apis'
import { getApiData, formatDate } from '../../utils/helpers'
import { borrowStatusColors, extensionStatusColors } from '../../constants/statusColors'
import { toast } from '../../stores/toastStore'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'

export default function AdminBorrowRecordDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [returnDetails, setReturnDetails] = useState([])
  const [isApproved, setIsApproved] = useState(true)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['borrow-record', id],
    queryFn: () => borrowApi.getById(id),
  })

  // BorrowRecordDetailResponse: { borrowId, borrowCode, readerId, readerName,
  //   approverId, approverName, borrowDate, dueDate, returnedDate, borrowType,
  //   status, extensionCount, borrowDetails: BorrowDetailResponse[] }
  const record = getApiData(data)

  const confirmReturn = useMutation({
    // ConfirmReturnRequest: { returnItems: ReturnItemCondition[] }
    // ReturnItemCondition: { copyId, condition (BookCondition), copyStatus (BookCopyStatus), fineAmount, fineReason }
    mutationFn: (payload) => borrowApi.confirmReturn(id, payload),
    onSuccess: () => {
      toast.success('Xác nhận trả sách thành công')
      setShowReturnModal(false)
      queryClient.invalidateQueries({ queryKey: ['borrow-record', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  const cancelRecord = useMutation({
    mutationFn: () => borrowApi.cancel(id),
    onSuccess: () => {
      toast.success('Đã hủy phiếu')
      setShowCancelConfirm(false)
      queryClient.invalidateQueries({ queryKey: ['borrow-record', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  const extendRecord = useMutation({
    // ProcessExtensionRequest: { isApproved, reason }
    mutationFn: () => borrowApi.extend(id, {
      isApproved,
      reason: isApproved ? undefined : rejectReason,
    }),
    onSuccess: () => {
      toast.success('Xử lý gia hạn thành công')
      setShowExtendModal(false)
      queryClient.invalidateQueries({ queryKey: ['borrow-record', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  const openReturnModal = () => {
    // BorrowDetailResponse: { borrowDetailId, copyId, barcode, bookTitle, returnedAt, itemCondition, status }
    setReturnDetails(
      (record?.borrowDetails ?? []).map((d) => ({
        copyId: d.copyId,
        condition: 'NORMAL',
        copyStatus: 'AVAILABLE',
        fineAmount: 0,
        fineReason: '',
      })),
    )
    setShowReturnModal(true)
  }

  const updateReturnDetail = (index, field, value) => {
    const updated = [...returnDetails]
    updated[index] = { ...updated[index], [field]: value }
    setReturnDetails(updated)
  }

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (isError || !record) return <ErrorState onRetry={refetch} />

  const canReturn = ['BORROWING', 'OVERDUE'].includes(record.status)
  const canCancel = !['RETURNED', 'CANCELLED'].includes(record.status)
  const canExtend = record.extensionRequestStatus === 'PENDING'

  return (
    <div>
      <Breadcrumb items={[{ label: 'Phiếu mượn', to: '/admin/borrow-records' }, { label: record.borrowCode }]} />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{record.borrowCode}</h1>
            <p className="text-slate-500">Bạn đọc: {record.readerName}</p>
            {record.approverName && <p className="text-slate-500">Người duyệt: {record.approverName}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={borrowStatusColors[record.status]}>{record.status}</Badge>
            {record.extensionRequestStatus && record.extensionRequestStatus !== 'NONE' && (
              <Badge className={extensionStatusColors[record.extensionRequestStatus]}>
                Gia hạn: {record.extensionRequestStatus}
              </Badge>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-sm text-slate-500">Ngày mượn</dt><dd className="font-medium">{formatDate(record.borrowDate)}</dd></div>
          <div><dt className="text-sm text-slate-500">Hạn trả</dt><dd className="font-medium">{formatDate(record.dueDate)}</dd></div>
          <div><dt className="text-sm text-slate-500">Ngày trả</dt><dd className="font-medium">{formatDate(record.returnedDate)}</dd></div>
          <div><dt className="text-sm text-slate-500">Số lần gia hạn</dt><dd className="font-medium">{record.extensionCount ?? 0}</dd></div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          {canReturn && <Button onClick={openReturnModal}>Xác nhận trả sách</Button>}
          {canCancel && <Button variant="danger" onClick={() => setShowCancelConfirm(true)}>Hủy phiếu</Button>}
          {canExtend && <Button variant="secondary" onClick={() => setShowExtendModal(true)}>Duyệt gia hạn</Button>}
        </div>

        <h2 className="mt-8 mb-4 text-lg font-semibold">Chi tiết sách</h2>
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
            {/* BorrowDetailResponse: { borrowDetailId, copyId, barcode, bookTitle, returnedAt, itemCondition, status } */}
            {(record.borrowDetails ?? []).map((d) => (
              <tr key={d.borrowDetailId}>
                <td className="px-4 py-2">{d.barcode}</td>
                <td className="px-4 py-2">{d.bookTitle}</td>
                <td className="px-4 py-2">{formatDate(d.returnedAt)}</td>
                <td className="px-4 py-2">{d.itemCondition ?? '—'}</td>
                <td className="px-4 py-2">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal trả sách */}
      <Modal open={showReturnModal} onClose={() => setShowReturnModal(false)} title="Xác nhận trả sách" size="xl">
        <div className="space-y-4">
          {(record.borrowDetails ?? []).map((d, i) => (
            <div key={d.borrowDetailId} className="rounded-lg border p-4">
              <p className="mb-3 font-medium text-slate-700">{d.bookTitle} <span className="font-mono text-slate-500">({d.barcode})</span></p>
              <div className="grid gap-3 sm:grid-cols-3">
                {/* ReturnItemCondition.condition: BookCondition enum */}
                <Select
                  label="Tình trạng"
                  value={returnDetails[i]?.condition ?? 'NORMAL'}
                  onChange={(e) => updateReturnDetail(i, 'condition', e.target.value)}
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="TORN">TORN</option>
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="LOST">LOST</option>
                </Select>
                {returnDetails[i]?.condition !== 'NORMAL' && (
                  <>
                    <Input
                      label="Số tiền phạt (VNĐ)"
                      type="number"
                      value={returnDetails[i]?.fineAmount ?? 0}
                      onChange={(e) => updateReturnDetail(i, 'fineAmount', Number(e.target.value))}
                    />
                    <Input
                      label="Lý do phạt"
                      value={returnDetails[i]?.fineReason ?? ''}
                      onChange={(e) => updateReturnDetail(i, 'fineReason', e.target.value)}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowReturnModal(false)}>Hủy</Button>
            <Button
              loading={confirmReturn.isPending}
              onClick={() => confirmReturn.mutate({ returnItems: returnDetails })}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal duyệt gia hạn */}
      <Modal open={showExtendModal} onClose={() => setShowExtendModal(false)} title="Duyệt gia hạn">
        <div className="space-y-4">
          {/* ProcessExtensionRequest: { isApproved, reason } */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" checked={isApproved} onChange={() => setIsApproved(true)} />
              Chấp nhận
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={!isApproved} onChange={() => setIsApproved(false)} />
              Từ chối
            </label>
          </div>
          {!isApproved && (
            <Textarea
              label="Lý do từ chối"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowExtendModal(false)}>Hủy</Button>
            <Button loading={extendRecord.isPending} onClick={() => extendRecord.mutate()}>Xác nhận</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => cancelRecord.mutate()}
        loading={cancelRecord.isPending}
        title="Hủy phiếu mượn"
        message="Bạn có chắc muốn hủy phiếu mượn này?"
      />
    </div>
  )
}