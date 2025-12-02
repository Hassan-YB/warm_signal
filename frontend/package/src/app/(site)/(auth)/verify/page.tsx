'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OTPVerification from '@/app/components/Auth/OTPVerification'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import toast from 'react-hot-toast'
import { auth } from '@/lib/api'

const VerifyPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    const emailParam = searchParams.get('email')

    if (!emailParam) {
      toast.error('Please provide your email address.')
      router.push('/signin')
      return
    }

    setEmail(emailParam)
  }, [searchParams, router])

  const handleVerifySuccess = async (otpCode: string) => {
    // This will be called from OTPVerification component
    // The component will handle the API call
  }

  if (!email) {
    return (
      <>
        <Breadcrumb pageName='Verify Email' />
        <div className='min-h-screen bg-slate-100'>
          <div className='container mx-auto px-4'>
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-md'>
                <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm'>
                  <p className='text-center text-gray-600'>Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Breadcrumb pageName='Verify Email' />
      <div className='min-h-screen bg-slate-100 py-5'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-center items-center py-10'>
            <div className='w-full max-w-md'>
              <VerifyOTPComponent email={email} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Separate component to handle OTP verification for inactive users
const VerifyOTPComponent = ({ email }: { email: string }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useState<(HTMLInputElement | null)[]>([])[0]

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedOtp = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedOtp.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char
        }
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + pastedOtp.length, 5)
      inputRefs[nextIndex]?.focus()
      return
    }

    if (!/^\d$/.test(value) && value !== '') return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1]?.focus()
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    try {
      const response = await auth.resendVerificationOTP({ email })

      if (response.success) {
        toast.success('OTP resent successfully. Please check your email.')
        setCountdown(60)
        setCanResend(false)
        setOtp(['', '', '', '', '', ''])
        inputRefs[0]?.focus()
      } else {
        toast.error(response.message || 'Failed to resend OTP')
      }
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code')
      setLoading(false)
      return
    }

    try {
      const response = await auth.verifyInactiveUserOTP({
        email,
        otp_code: otpCode,
      })

      if (response.success) {
        toast.success(response.message || 'Email verified successfully!')
        if (response.data?.tokens) {
          router.push('/profile')
        } else {
          router.push('/signin')
        }
      } else {
        toast.error(response.message || 'OTP verification failed')
        setOtp(['', '', '', '', '', ''])
        inputRefs[0]?.focus()
      }
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900'>Verify Your Email</h2>
        <p className='mt-2 text-sm text-gray-600'>
          We've sent a 6-digit OTP code to <span className='font-medium'>{email}</span>
        </p>
        <p className='mt-1 text-sm text-gray-500'>
          Please enter the code below to activate your account.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className='mb-6'>
          <div className='flex gap-2 justify-center'>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs[index] = el
                }}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className='w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all'
              />
            ))}
          </div>
        </div>

        <div className='mb-6'>
          <button
            type='submit'
            disabled={loading || otp.join('').length !== 6}
            className='flex w-full items-center justify-center rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'>
            Verify & Activate Account {loading && <span className='ml-2'>...</span>}
          </button>
        </div>

        <div className='text-center space-y-2'>
          <p className='text-sm text-gray-600'>
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                type='button'
                onClick={handleResendOTP}
                disabled={resendLoading}
                className='font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50'>
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <span className='text-gray-500'>
                Resend in {countdown}s
              </span>
            )}
          </p>
          <p className='text-sm text-gray-600'>
            <button
              type='button'
              onClick={() => router.push('/signin')}
              className='font-medium text-primary hover:text-primary/80 transition-colors'>
              Back to Sign In
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}

export default VerifyPage

