import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { bookApi, categoryApi, authorApi, publisherApi } from '../../apis/apis'
import { getApiData } from '../../utils/helpers'
import { toast } from '../../stores/toastStore'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'

const schema = z.object({
  title: z.string().min(1, 'Bắt buộc'),
  isbn: z.string().min(1, 'Bắt buộc'),
  language: z.string().min(1, 'Bắt buộc'),
  description: z.string().min(1, 'Bắt buộc'),
  coverImage: z.string().url('URL không hợp lệ'),
  publisherId: z.string().min(1, 'Chọn nhà xuất bản'),
  authorIds: z.array(z.string()).min(1, 'Chọn ít nhất 1 tác giả'),
  categoryIds: z.array(z.string()).min(1, 'Chọn ít nhất 1 danh mục'),
})

const languages = ['Vietnamese', 'English', 'French', 'Chinese', 'Japanese', 'Korean']

export default function BookFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: bookRes, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: () => bookApi.getById(id),
    enabled: isEdit,
  })

  const { data: categoriesRes } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll() })
  const { data: authorsRes } = useQuery({ queryKey: ['authors'], queryFn: () => authorApi.getAll() })
  const { data: publishersRes } = useQuery({ queryKey: ['publishers'], queryFn: () => publisherApi.getAll() })

  const book = getApiData(bookRes)
  const categories = getApiData(categoriesRes) ?? []
  const authors = getApiData(authorsRes) ?? []
  const publishers = getApiData(publishersRes) ?? []

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    values: book
      ? {
          title: book.title,
          isbn: book.isbn,
          language: book.language,
          description: book.description,
          coverImage: book.coverImage,
          publisherId: String(book.publisherId ?? book.publisher?.publisherId ?? ''),
          authorIds: (book.authors ?? []).map((a) => String(a.authorId ?? a.id)),
          categoryIds: (book.categories ?? []).map((c) => String(c.categoryId ?? c.id)),
        }
      : {
          title: '', isbn: '', language: 'Vietnamese', description: '', coverImage: '',
          publisherId: '', authorIds: [], categoryIds: [],
        },
  })

  const coverImage = watch('coverImage')
  const selectedAuthors = watch('authorIds') ?? []
  const selectedCategories = watch('categoryIds') ?? []

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        publisherId: Number(data.publisherId),
        authorIds: data.authorIds.map(Number),
        categoryIds: data.categoryIds.map(Number),
      }
      return isEdit ? bookApi.update(id, payload) : bookApi.create(payload)
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Cập nhật sách thành công' : 'Thêm sách thành công')
      navigate('/admin/books')
    },
    onError: (err) => toast.error(err.message),
  })

  const toggleMulti = (field, val) => {
    const current = watch(field) ?? []
    setValue(field, current.includes(val) ? current.filter((v) => v !== val) : [...current, val], { shouldValidate: true })
  }

  if (isEdit && isLoading) return <Skeleton className="h-96 w-full rounded-xl" />

  return (
    <div>
      <Breadcrumb items={[{ label: 'Sách', to: '/admin/books' }, { label: isEdit ? 'Sửa sách' : 'Thêm sách' }]} />
      <h1 className="text-2xl font-bold">{isEdit ? 'Sửa sách' : 'Thêm sách mới'}</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-6 max-w-2xl space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <Input label="Tên sách" error={errors.title?.message} {...register('title')} />
        <Input label="ISBN" error={errors.isbn?.message} {...register('isbn')} />
        <Select label="Ngôn ngữ" error={errors.language?.message} {...register('language')}>
          {languages.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
        <Textarea label="Mô tả" error={errors.description?.message} {...register('description')} />
        <Input label="URL ảnh bìa" error={errors.coverImage?.message} {...register('coverImage')} />
        {coverImage && <img src={coverImage} alt="Preview" className="h-40 rounded-lg object-cover" />}

        <Select label="Nhà xuất bản" error={errors.publisherId?.message} {...register('publisherId')}>
          <option value="">Chọn NXB</option>
          {publishers.map((p) => <option key={p.publisherId ?? p.id} value={p.publisherId ?? p.id}>{p.name}</option>)}
        </Select>

        <div>
          <label className="mb-2 block text-sm font-medium">Tác giả *</label>
          <div className="flex flex-wrap gap-2">
            {authors.map((a) => {
              const val = String(a.authorId ?? a.id)
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggleMulti('authorIds', val)}
                  className={`rounded-full px-3 py-1 text-sm border ${selectedAuthors.includes(val) ? 'bg-primary text-white border-primary' : 'border-slate-300'}`}
                >
                  {a.name}
                </button>
              )
            })}
          </div>
          {errors.authorIds && <p className="mt-1 text-xs text-red-600">{errors.authorIds.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Danh mục *</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const val = String(c.categoryId ?? c.id)
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggleMulti('categoryIds', val)}
                  className={`rounded-full px-3 py-1 text-sm border ${selectedCategories.includes(val) ? 'bg-primary text-white border-primary' : 'border-slate-300'}`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
          {errors.categoryIds && <p className="mt-1 text-xs text-red-600">{errors.categoryIds.message}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={isSubmitting || mutation.isPending}>{isEdit ? 'Cập nhật' : 'Tạo mới'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/books')}>Hủy</Button>
        </div>
      </form>
    </div>
  )
}
