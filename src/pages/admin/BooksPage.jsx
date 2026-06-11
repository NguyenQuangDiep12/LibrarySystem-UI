import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { bookApi, categoryApi, authorApi } from '../../apis/apis'
import useDebounce from '../../hooks/useDebounce'
import { getApiData, getPaginatedItems } from '../../utils/helpers'
import { toast } from '../../stores/toastStore'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../constants/roles'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { TableSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

export default function BooksPage() {
  const { role } = useAuth()
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState(null)
  const debouncedKeyword = useDebounce(keyword)

  // CategoryResponse: { categoryId, categoryName, description }
  const { data: categoriesRes } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll() })
  // AuthorResponse: { authorId, authorName, biography, authorUrl }
  const { data: authorsRes } = useQuery({ queryKey: ['authors'], queryFn: () => authorApi.getAll() })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-books', debouncedKeyword, categoryId, authorId, page],
    queryFn: () =>
      bookApi.getAll({
        keyword: debouncedKeyword || undefined,
        categoryId: categoryId || undefined,
        authorId: authorId || undefined,
        page,
        pageSize: 10,
      }),
  })

  const deleteBook = useMutation({
    mutationFn: (id) => bookApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa sách thành công')
      queryClient.invalidateQueries({ queryKey: ['admin-books'] })
      setDeleteId(null)
    },
    onError: (err) => toast.error(err.message || 'Không thể xóa sách đang được mượn'),
  })

  const categories = getApiData(categoriesRes) ?? []
  const authors = getApiData(authorsRes) ?? []
  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Quản lý sách' }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý sách</h1>
        <Link to="/admin/books/create">
          <Button><Plus className="h-4 w-4" /> Thêm sách mới</Button>
        </Link>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          placeholder="Tìm kiếm..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary lg:col-span-2"
        />
        <Select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}>
          <option value="">Danh mục</option>
          {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
        </Select>
        <Select value={authorId} onChange={(e) => { setAuthorId(e.target.value); setPage(1) }}>
          <option value="">Tác giả</option>
          {authors.map((a) => <option key={a.authorId} value={a.authorId}>{a.authorName}</option>)}
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
                  <th className="px-4 py-3">Tên sách</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3">Ngôn ngữ</th>
                  <th className="px-4 py-3">Tổng BS</th>
                  <th className="px-4 py-3">Còn lại</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* BookResponse: { bookId, title, isbn, totalCopies, availableCopies, language, description, coverImage } */}
                {items.map((book) => (
                  <tr key={book.bookId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{book.title}</td>
                    <td className="px-4 py-3">{book.isbn}</td>
                    <td className="px-4 py-3">{book.language}</td>
                    <td className="px-4 py-3">{book.totalCopies}</td>
                    <td className="px-4 py-3">
                      <Badge className={book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {book.availableCopies}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link to={`/books/${book.bookId}`}><Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button></Link>
                        <Link to={`/admin/books/${book.bookId}/edit`}><Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button></Link>
                        {isAdmin(role) && (
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(book.bookId)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteBook.mutate(deleteId)}
        loading={deleteBook.isPending}
        title="Xóa sách"
        message="Bạn có chắc muốn xóa sách này? Hành động không thể hoàn tác."
      />
    </div>
  )
}