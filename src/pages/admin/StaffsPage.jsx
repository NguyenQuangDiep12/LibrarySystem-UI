import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { userApi } from '../../apis/apis'
import { getPaginatedItems } from '../../utils/helpers'
import { accountStatusColors } from '../../constants/statusColors'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../constants/roles'
import { toast } from '../../stores/toastStore'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import Breadcrumb from '../../components/ui/Breadcrumb'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'

export default function StaffsPage() {
  const { role } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  // CreateStaffRequest: { email, fullName, password, phone, address }
  const [form, setForm] = useState({ email: '', fullName: '', password: '', phone: '', address: '' })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['staffs', page],
    queryFn: () => userApi.getStaffs({ page, pageSize: 10 }),
  })

  const createStaff = useMutation({
    mutationFn: () => userApi.addStaff(form),
    onSuccess: () => {
      toast.success('Thêm nhân viên thành công')
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      setModalOpen(false)
      setForm({ email: '', fullName: '', password: '', phone: '', address: '' })
    },
    onError: (err) => toast.error(err.message),
  })

  // UserListInfoResponse: { id, fullName, email, phone, role, status, cardStatus }
  const { items, totalPages, totalRecords } = getPaginatedItems(data)

  if (!isAdmin(role)) return <Navigate to="/admin/dashboard" replace />

  return (
    <div>
      <Breadcrumb items={[{ label: 'Nhân viên' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
        <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Thêm nhân viên</Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
        {isLoading && <div className="p-6"><TableSkeleton cols={5} /></div>}
        {isError && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && items.length === 0 && <EmptyState />}
        {!isLoading && !isError && items.length > 0 && (
          <>
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3">{s.id}</td>
                    <td className="px-4 py-3 font-medium">{s.fullName}</td>
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3">{s.phone}</td>
                    <td className="px-4 py-3">
                      <Badge className={accountStatusColors[s.status]}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4">
              <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm nhân viên">
        <div className="space-y-4">
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="SĐT" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button loading={createStaff.isPending} onClick={() => createStaff.mutate()}>Tạo</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}