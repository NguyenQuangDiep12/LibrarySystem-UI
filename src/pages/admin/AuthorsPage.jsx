import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { authorApi } from '../../apis/apis'
import { getApiData } from '../../utils/helpers'
import { toast } from '../../stores/toastStore'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../constants/roles'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import { TableSkeleton } from '../../components/ui/Skeleton'

export default function AuthorsPage() {
  const { role } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editing, setEditing] = useState(null)
  // AuthorRequest: { authorName, biography, authorUrl }
  const [form, setForm] = useState({ authorName: '', biography: '', authorUrl: '' })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorApi.getAll(),
  })

  // AuthorResponse: { authorId, authorName, biography, authorUrl }
  const authors = getApiData(data) ?? []

  const saveMutation = useMutation({
    mutationFn: () => (editing ? authorApi.update(editing, form) : authorApi.create(form)),
    onSuccess: () => {
      toast.success(editing ? 'Cập nhật thành công' : 'Thêm tác giả thành công')
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      closeModal()
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => authorApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa thành công')
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      setDeleteId(null)
    },
    onError: (err) => toast.error(err.message),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ authorName: '', biography: '', authorUrl: '' })
    setModalOpen(true)
  }

  const openEdit = (author) => {
    setEditing(author.authorId)
    setForm({ authorName: author.authorName, biography: author.biography, authorUrl: author.authorUrl })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Tác giả' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý tác giả</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Thêm tác giả</Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading && <div className="p-6"><TableSkeleton cols={4} /></div>}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && authors.length === 0 && <EmptyState />}
        {!isLoading && !isError && authors.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Tiểu sử</th>
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {authors.map((a) => (
                <tr key={a.authorId}>
                  <td className="px-4 py-3 font-medium">{a.authorName}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{a.biography}</td>
                  <td className="px-4 py-3">
                    {a.authorUrl && (
                      <a href={a.authorUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Link</a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                      {isAdmin(role) && (
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(a.authorId)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Sửa tác giả' : 'Thêm tác giả'}>
        <div className="space-y-4">
          {/* AuthorRequest: { authorName, biography, authorUrl } */}
          <Input label="Tên tác giả" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
          <Textarea label="Tiểu sử" value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
          <Input label="URL thông tin" value={form.authorUrl} onChange={(e) => setForm({ ...form, authorUrl: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Lưu</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Xóa tác giả"
        message="Bạn có chắc muốn xóa tác giả này?"
      />
    </div>
  )
}