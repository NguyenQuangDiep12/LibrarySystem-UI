import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import authApi from '../../apis/authApi'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../constants/roles'
import { toast } from '../../stores/toastStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [remember, setRemember] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const result = await authApi.login(data)
      if (result.success) {
        login(result.data)
        toast.success('Đăng nhập thành công!')
        const role = result.data.userInfo?.role
        if (role === ROLES.ADMIN) navigate('/admin/statistics')
        else if (role === ROLES.STAFF) navigate('/admin/dashboard')
        else navigate('/reader/profile')
      }
    } catch (err) {
      toast.error(err.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <span className="text-3xl">📚</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mt-1 text-sm text-slate-500">Hệ thống quản lý thư viện</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Mật khẩu" type="password" error={errors.password?.message} {...register('password')} />

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
            Ghi nhớ đăng nhập
          </label>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Đăng nhập
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <Link to="/forgot-password" className="block text-primary hover:underline">
            Quên mật khẩu?
          </Link>
          <p className="text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
