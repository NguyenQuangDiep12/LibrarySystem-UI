import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { categoryApi } from '../../apis/apis'
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

export default function CategoriesPage() {
  const { role } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  const categories = getApiData(data) ?? []

  const saveMutation = useMutation({
    mutationFn: () => (editing ? categoryApi.update(editing, form) : categoryApi.create(form)),
    onSuccess: () => {
      toast.success('Lưu thành công')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setModalOpen(false)
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa thành công')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteId(null)
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div>
      <Breadcrumb items={[{ label: 'Danh mục' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setModalOpen(true) }}>
          <Plus className="h-4 w-4" /> Thêm danh mục
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading && <div className="p-6"><TableSkeleton cols={4} /></div>}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && categories.length === 0 && <EmptyState />}
        {!isLoading && !isError && categories.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((c) => (
                <tr key={c.categoryId ?? c.id}>
                  <td className="px-4 py-3">{c.categoryId ?? c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 max-w-md truncate">{c.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(c.categoryId ?? c.id); setForm({ name: c.name, description: c.description }); setModalOpen(true) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isAdmin(role) && (
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(c.categoryId ?? c.id)}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}>
        <div className="space-y-4">
          <Input label="Tên danh mục" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Lưu</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Xóa danh mục" message="Bạn có chắc muốn xóa?" />
    </div>
  )
}
