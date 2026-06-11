import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { borrowApi } from '../../apis/apis'
import useDebounce from '../../hooks/useDebounce'
import { getPaginatedItems, formatDate } from '../../utils/helpers'
import { borrowStatusColors, extensionStatusColors } from '../../constants/statusColors'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

const tabs = [
  { key: '', label: 'Tất cả' },
  { key: 'BORROWING', label: 'Đang mượn', status: 'BORROWING' },
  { key: 'OVERDUE', label: 'Quá hạn', status: 'OVERDUE' },
  { key: 'EXT_PENDING', label: 'Chờ gia hạn', extensionRequestStatus: 'PENDING' },
]

export default function BorrowRecordsPage() {
  const [activeTab, setActiveTab] = useState('')
  const [borrowCode, setBorrowCode] = useState('')
  const [readerName, setReaderName] = useState('')
  const [page, setPage] = useState(1)
  const debouncedCode = useDebounce(borrowCode)
  const debouncedName = useDebounce(readerName)

  const currentTab = tabs.find((t) => t.key === activeTab) ?? tabs[0]

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['borrow-records', activeTab, debouncedCode, debouncedName, page],
    queryFn: () =>
      borrowApi.getAll({
        borrowCode: debouncedCode || undefined,
        readerName: debouncedName || undefined,
        status: currentTab.status,
        extensionRequestStatus: currentTab.extensionRequestStatus,
        page,
        pageSize: 10,
      }),
  })

  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Phiếu mượn' }]} />
      <h1 className="text-2xl font-bold">Phiếu mượn</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setPage(1) }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-primary text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          placeholder="Mã phiếu..."
          value={borrowCode}
          onChange={(e) => { setBorrowCode(e.target.value); setPage(1) }}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          placeholder="Tên bạn đọc..."
          value={readerName}
          onChange={(e) => { setReaderName(e.target.value); setPage(1) }}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
        />
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
                  <th className="px-4 py-3">Mã phiếu</th>
                  <th className="px-4 py-3">Bạn đọc</th>
                  <th className="px-4 py-3">Ngày mượn</th>
                  <th className="px-4 py-3">Hạn trả</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Gia hạn</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* BorrowRecordSummaryResponse: { borrowId, borrowCode, readerId, readerName,
                    borrowDate, dueDate, returnedDate, borrowType, status,
                    extensionCount, extensionRequestStatus, totalBooks } */}
                {items.map((r) => (
                  <tr key={r.borrowId}>
                    <td className="px-4 py-3 font-medium">{r.borrowCode}</td>
                    <td className="px-4 py-3">{r.readerName}</td>
                    <td className="px-4 py-3">{formatDate(r.borrowDate)}</td>
                    <td className="px-4 py-3">{formatDate(r.dueDate)}</td>
                    <td className="px-4 py-3">{r.borrowType === 'IN_LIBRARY' ? 'Tại chỗ' : 'Mang về'}</td>
                    <td className="px-4 py-3"><Badge className={borrowStatusColors[r.status]}>{r.status}</Badge></td>
                    <td className="px-4 py-3">
                      {r.extensionRequestStatus && r.extensionRequestStatus !== 'NONE' && (
                        <Badge className={extensionStatusColors[r.extensionRequestStatus]}>{r.extensionRequestStatus}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/borrow-records/${r.borrowId}`}>
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