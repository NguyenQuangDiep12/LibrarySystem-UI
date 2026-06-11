import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookApi, bookCopyApi } from '../../apis/apis'
import { getApiData, getPaginatedItems } from '../../utils/helpers'
import { bookCopyStatusColors } from '../../constants/statusColors'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

export default function BookCopiesPage() {
  const [bookId, setBookId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data: booksRes } = useQuery({ queryKey: ['books-all'], queryFn: () => bookApi.getAll({ pageSize: 100 }) })
  const books = getPaginatedItems(booksRes).items

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['book-copies', bookId, status, page],
    queryFn: () =>
      bookCopyApi.getAll({
        bookId: bookId || undefined,
        status: status || undefined,
        page,
        pageSize: 10,
      }),
  })

  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Bản sao sách' }]} />
      <h1 className="text-2xl font-bold text-slate-900">Quản lý bản sao sách</h1>

      <div className="mt-4 flex gap-3">
        <Select value={bookId} onChange={(e) => { setBookId(e.target.value); setPage(1) }} className="max-w-xs">
          <option value="">Tất cả sách</option>
          {books.map((b) => <option key={b.bookId ?? b.id} value={b.bookId ?? b.id}>{b.title}</option>)}
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="max-w-xs">
          <option value="">Tất cả trạng thái</option>
          {Object.keys(bookCopyStatusColors).map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading && <div className="p-6"><TableSkeleton cols={6} /></div>}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && items.length === 0 && <EmptyState />}
        {!isLoading && !isError && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Tên sách</th>
                  <th className="px-4 py-3">Vị trí kệ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Tình trạng</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((copy) => (
                  <tr key={copy.bookCopyId ?? copy.id}>
                    <td className="px-4 py-3 font-mono">{copy.barcode}</td>
                    <td className="px-4 py-3">{copy.bookTitle ?? copy.book?.title}</td>
                    <td className="px-4 py-3">{copy.shelfLocation || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge className={bookCopyStatusColors[copy.status]}>{copy.status}</Badge>
                    </td>
                    <td className="px-4 py-3">{copy.physicalCondition ?? 'Normal'}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/book-copies/${copy.bookCopyId ?? copy.id}`}>
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
