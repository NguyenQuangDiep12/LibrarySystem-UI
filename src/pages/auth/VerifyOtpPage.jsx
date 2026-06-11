import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import authApi from '../../apis/authApi'
import { toast } from '../../stores/toastStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const COUNTDOWN_SECONDS = 300

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const inputRefs = useRef([])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newValues = [...otpValues]
    newValues[index] = value
    setOtpValues(newValues)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otp = otpValues.join('')
    if (otp.length < 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP')
      return
    }
    setLoading(true)
    try {
      await authApi.verifyOtp({ email, otp })
      toast.success('Mật khẩu mới đã được gửi qua Email')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'OTP không đúng')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    try {
      await authApi.forgotPassword({ email })
      toast.success('OTP mới đã được gửi')
      setCountdown(COUNTDOWN_SECONDS)
    } catch (err) {
      toast.error(err.message || 'Gửi lại OTP thất bại')
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Xác thực OTP</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nhập mã 6 số gửi đến <strong>{email || 'email của bạn'}</strong>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <Input label="Email" value={email} readOnly className="bg-slate-50" />

          <div className="flex justify-between gap-2">
            {otpValues.map((val, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleOtpChange(i, e.target.value.slice(-1))}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-12 rounded-lg border border-slate-300 text-center text-xl font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
              />
            ))}
          </div>

          <p className="text-center text-sm text-slate-500">
            {countdown > 0 ? (
              <>Mã hết hạn sau: <span className="font-medium text-primary">{formatTime(countdown)}</span></>
            ) : (
              <button type="button" onClick={handleResend} className="font-medium text-primary hover:underline">
                Gửi lại OTP
              </button>
            )}
          </p>

          <Button type="submit" className="w-full" loading={loading}>
            Xác thực
          </Button>
        </form>

        <Link to="/login" className="mt-4 block text-center text-sm text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  )
}
