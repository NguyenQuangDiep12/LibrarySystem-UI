import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { bookApi } from '../../apis/apis'
import { useAuth } from '../../contexts/AuthContext'
import { getApiData } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import Breadcrumb from '../../components/ui/Breadcrumb'

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [expanded, setExpanded] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['book', id],
    queryFn: () => bookApi.getById(id),
  })

  const book = getApiData(data)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[3/4] w-full max-w-md rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !book) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ErrorState message="Không tìm thấy sách" onRetry={refetch} />
      </div>
    )
  }

  const available = book.availableCopies > 0
  const description = book.description || ''
  const isLong = description.length > 300

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: 'Trang chủ', to: '/' }, { label: book.title }]} />

      <div className="grid gap-8 rounded-xl border bg-white p-6 shadow-sm lg:grid-cols-2">
        <div className="flex justify-center">
          <img
            src={book.coverImage || 'https://via.placeholder.com/400x600?text=No+Cover'}
            alt={book.title}
            className="max-h-[500px] rounded-xl object-cover shadow-lg"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{book.title}</h1>
          <p className="mt-2 text-slate-500">ISBN: {book.isbn} · Ngôn ngữ: {book.language}</p>

          {book.authors?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Tác giả</p>
              <div className="flex flex-wrap gap-2">
                {book.authors.map((a) => (
                  <Badge key={a.authorId ?? a.id} className="bg-blue-50 text-blue-700">
                    {a.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {book.categories?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Danh mục</p>
              <div className="flex flex-wrap gap-2">
                {book.categories.map((c) => (
                  <Badge key={c.categoryId ?? c.id} className="bg-purple-50 text-purple-700">
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {book.publisher && (
            <div className="mt-4 flex items-center gap-3">
              {book.publisher.logoUrl && (
                <img src={book.publisher.logoUrl} alt="" className="h-8 w-8 rounded object-contain" />
              )}
              <span className="text-sm text-slate-600">{book.publisher.name}</span>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">Mô tả</p>
            <p className={`mt-1 text-sm text-slate-600 ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
              {description}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {expanded ? <><ChevronUp className="h-4 w-4" /> Thu gọn</> : <><ChevronDown className="h-4 w-4" /> Xem thêm</>}
              </button>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Badge className={available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {available ? `Còn ${book.availableCopies} bản` : 'Hết sách'}
            </Badge>
            <span className="text-sm text-slate-500">Tổng: {book.totalCopies} bản sao</span>
          </div>

          <div className="mt-6">
            {!isAuthenticated ? (
              <Link to="/login">
                <Button>Đăng nhập để mượn</Button>
              </Link>
            ) : available ? (
              <Button onClick={() => navigate('/reader/borrow-history')}>Mượn sách</Button>
            ) : (
              <Button variant="secondary" onClick={() => navigate('/reader/borrow-history')}>
                Đặt trước
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
