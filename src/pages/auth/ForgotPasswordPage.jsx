import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import authApi from '../../apis/authApi'
import { toast } from '../../stores/toastStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await authApi.forgotPassword(data)
      toast.success('OTP đã được gửi về email của bạn')
      navigate('/verify-otp', { state: { email: data.email } })
    } catch (err) {
      toast.error(err.message || 'Gửi OTP thất bại')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-500">Nhập email đã đăng ký để nhận mã OTP</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Gửi mã OTP
          </Button>
        </form>
      </div>
    </div>
  )
}
