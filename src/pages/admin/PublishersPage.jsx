import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { publisherApi } from '../../apis/apis'
import { getApiData } from '../../utils/helpers'
import { toast } from '../../stores/toastStore'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../constants/roles'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import { TableSkeleton } from '../../components/ui/Skeleton'

export default function PublishersPage() {
  const { role } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', logoUrl: '' })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['publishers'],
    queryFn: () => publisherApi.getAll(),
  })

  const publishers = getApiData(data) ?? []

  const saveMutation = useMutation({
    mutationFn: () => (editing ? publisherApi.update(editing, form) : publisherApi.create(form)),
    onSuccess: () => {
      toast.success('Lưu thành công')
      queryClient.invalidateQueries({ queryKey: ['publishers'] })
      setModalOpen(false)
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => publisherApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa thành công')
      queryClient.invalidateQueries({ queryKey: ['publishers'] })
      setDeleteId(null)
    },
    onError: (err) => toast.error(err.message || 'Không thể xóa NXB còn sách liên kết'),
  })

  return (
    <div>
      <Breadcrumb items={[{ label: 'Nhà xuất bản' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý nhà xuất bản</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: '', logoUrl: '' }); setModalOpen(true) }}>
          <Plus className="h-4 w-4" /> Thêm NXB
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading && <div className="p-6"><TableSkeleton cols={4} /></div>}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && publishers.length === 0 && <EmptyState />}
        {!isLoading && !isError && publishers.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">Logo</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {publishers.map((p) => (
                <tr key={p.publisherId ?? p.id}>
                  <td className="px-4 py-3">
                    {p.logoUrl && <img src={p.logoUrl} alt="" className="h-8 w-8 object-contain" />}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(p.publisherId ?? p.id); setForm({ name: p.name, logoUrl: p.logoUrl }); setModalOpen(true) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isAdmin(role) && (
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(p.publisherId ?? p.id)}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa NXB' : 'Thêm NXB'}>
        <div className="space-y-4">
          <Input label="Tên NXB" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          {form.logoUrl && <img src={form.logoUrl} alt="" className="h-12 object-contain" />}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Lưu</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Xóa NXB" message="Không thể hoàn tác. NXB còn sách liên kết sẽ bị từ chối." />
    </div>
  )
}
