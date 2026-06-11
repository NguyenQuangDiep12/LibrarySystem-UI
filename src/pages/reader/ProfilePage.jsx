import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import authApi from '../../apis/authApi'
import { userApi } from '../../apis/apis'
import { useAuth } from '../../contexts/AuthContext'
import { getApiData } from '../../utils/helpers'
import { cardStatusColors, accountStatusColors } from '../../constants/statusColors'
import { toast } from '../../stores/toastStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'

const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  avatarUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
})

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Bắt buộc'),
    newPassword: z.string().min(6, 'Tối thiểu 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export default function ProfilePage() {
  const { userInfo } = useAuth()
  const queryClient = useQueryClient()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // UserProfileResponse: { userId, fullName, email, phone, address, avatarUrl,
  //   role, status, libraryCardCode, cardStatus, createdAt }
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user', userInfo?.userId],
    queryFn: () => userApi.getById(userInfo.userId),
    enabled: !!userInfo?.userId,
  })

  const user = getApiData(data)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: user
      ? {
          fullName: user.fullName || '',
          phone: user.phone || '',
          address: user.address || '',
          avatarUrl: user.avatarUrl || '',
        }
      : undefined,
  })

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) })

  // UpdateProfileRequest: { fullName, phone, address, avatarUrl }
  const updateProfile = useMutation({
    mutationFn: (payload) => userApi.updateMyProfile(payload),
    onSuccess: () => {
      toast.success('Cập nhật hồ sơ thành công')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (err) => toast.error(err.message),
  })

  // ResetPasswordRequest: { password, confirmPassword, oldPassword }
  const resetPassword = useMutation({
    mutationFn: (payload) => authApi.resetPassword(payload),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công')
      setShowPasswordModal(false)
      passwordForm.reset()
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <form
            onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))}
            className="space-y-4"
          >
            <Input
              label="Họ và tên"
              error={profileForm.formState.errors.fullName?.message}
              {...profileForm.register('fullName')}
            />
            <Input label="Email" value={user?.email} disabled className="bg-slate-50" />
            <Input
              label="Số điện thoại"
              error={profileForm.formState.errors.phone?.message}
              {...profileForm.register('phone')}
            />
            <Input
              label="Địa chỉ"
              error={profileForm.formState.errors.address?.message}
              {...profileForm.register('address')}
            />
            <Input
              label="URL Avatar"
              error={profileForm.formState.errors.avatarUrl?.message}
              {...profileForm.register('avatarUrl')}
            />
            {profileForm.watch('avatarUrl') && (
              <img
                src={profileForm.watch('avatarUrl')}
                alt="Avatar preview"
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
            <div className="flex gap-3">
              <Button type="submit" loading={updateProfile.isPending}>Lưu thay đổi</Button>
              <Button type="button" variant="secondary" onClick={() => setShowPasswordModal(true)}>
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Thẻ thư viện</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Mã thẻ</dt>
              {/* UserProfileResponse.libraryCardCode */}
              <dd className="font-medium">{user?.libraryCardCode || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Trạng thái thẻ</dt>
              {/* UserProfileResponse.cardStatus */}
              <dd>
                <Badge className={cardStatusColors[user?.cardStatus] || 'bg-slate-100'}>
                  {user?.cardStatus || '—'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Trạng thái tài khoản</dt>
              {/* UserProfileResponse.status */}
              <dd>
                <Badge className={accountStatusColors[user?.status] || 'bg-slate-100'}>
                  {user?.status || '—'}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Đổi mật khẩu">
        <form
          onSubmit={passwordForm.handleSubmit((d) =>
            resetPassword.mutate({
              // ResetPasswordRequest: { password, confirmPassword, oldPassword }
              oldPassword: d.oldPassword,
              password: d.newPassword,
              confirmPassword: d.newPassword,
            }),
          )}
          className="space-y-4"
        >
          <Input
            label="Mật khẩu cũ"
            type="password"
            error={passwordForm.formState.errors.oldPassword?.message}
            {...passwordForm.register('oldPassword')}
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowPasswordModal(false)}>Hủy</Button>
            <Button type="submit" loading={resetPassword.isPending}>Xác nhận</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}