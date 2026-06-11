import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import authApi from '../../apis/authApi'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from '../../stores/toastStore'
import { getPasswordStrength } from '../../utils/helpers'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z
  .object({
    fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string(),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')
  const strength = getPasswordStrength(password)

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data
      const result = await authApi.register(payload)
      if (result.success) {
        login(result.data)
        toast.success('Đăng ký thành công!')
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <span className="text-3xl">📚</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Đăng ký tài khoản</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Họ và tên" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Số điện thoại" type="tel" error={errors.phone?.message} {...register('phone')} />
          <div>
            <Input label="Mật khẩu" type="password" error={errors.password?.message} {...register('password')} />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${i <= strength.score ? 'bg-primary' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">Độ mạnh: {strength.label}</p>
              </div>
            )}
          </div>
          <Input label="Xác nhận mật khẩu" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Đăng ký
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
