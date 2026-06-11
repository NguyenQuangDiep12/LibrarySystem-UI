import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, RotateCcw } from 'lucide-react'
import { bookApi, categoryApi, authorApi } from '../../apis/apis'
import useDebounce from '../../hooks/useDebounce'
import { getApiData, getPaginatedItems } from '../../utils/helpers'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import { Skeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

export default function HomePage() {
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [page, setPage] = useState(1)
  const debouncedKeyword = useDebounce(keyword)

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  const { data: authorsRes } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorApi.getAll(),
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['books', debouncedKeyword, categoryId, authorId, page],
    queryFn: () =>
      bookApi.getAll({
        keyword: debouncedKeyword || undefined,
        categoryId: categoryId || undefined,
        authorId: authorId || undefined,
        page,
        pageSize: 12,
      }),
  })

  const categories = getApiData(categoriesRes) ?? []
  const authors = getApiData(authorsRes) ?? []
  const { items: books, totalPages, totalRecords } = getPaginatedItems(data)

  const resetFilters = () => {
    setKeyword('')
    setCategoryId('')
    setAuthorId('')
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Tra cứu sách</h1>
        <p className="mt-1 text-slate-500">Khám phá kho sách của thư viện</p>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên sách, ISBN, tác giả..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <Select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.categoryId ?? c.id} value={c.categoryId ?? c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            value={authorId}
            onChange={(e) => { setAuthorId(e.target.value); setPage(1) }}
          >
            <option value="">Tất cả tác giả</option>
            {authors.map((a) => (
              <option key={a.authorId ?? a.id} value={a.authorId ?? a.id}>{a.name}</option>
            ))}
          </Select>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4" />
            Reset bộ lọc
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-4">
              <Skeleton className="mb-3 aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {isError && <ErrorState message="Không thể tải danh sách sách" onRetry={refetch} />}

      {!isLoading && !isError && books.length === 0 && (
        <EmptyState title="Không tìm thấy sách" description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" />
      )}

      {!isLoading && !isError && books.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <Link
                key={book.bookId ?? book.id}
                to={`/books/${book.bookId ?? book.id}`}
                className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-[3/4] overflow-hidden bg-slate-100">
                  <img
                    src={book.coverImage || 'https://via.placeholder.com/300x400?text=No+Cover'}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-primary">{book.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">ISBN: {book.isbn}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className={book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      Còn {book.availableCopies}/{book.totalCopies}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}
