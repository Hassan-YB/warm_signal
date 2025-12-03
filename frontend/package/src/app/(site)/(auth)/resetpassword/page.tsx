'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { auth } from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Loader from '@/app/components/Common/Loader'
import PasswordStrengthMeter, { validatePasswordStrength } from '@/app/components/Common/PasswordStrengthMeter'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import Breadcrumb from '@/app/components/Common/Breadcrumb'

const ResetPasswordPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState({
    password: '',
    password_confirm: '',
  })
  const [loader, setLoader] = useState(false)
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordMatchError, setPasswordMatchError] = useState<string>('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const otpParam = searchParams.get('otp')

    if (!emailParam || !otpParam) {
      toast.error('Invalid reset link. Please request password reset again.')
      router.push('/forgotpassword')
      return
    }

    setEmail(emailParam)
    setOtpCode(otpParam)
  }, [searchParams, router])

  // Real-time password matching validation
  useEffect(() => {
    if (data.password_confirm && data.password !== data.password_confirm) {
      setPasswordMatchError('Passwords do not match')
    } else {
      setPasswordMatchError('')
    }
  }, [data.password, data.password_confirm])

  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (!data.password || !data.password_confirm) {
      return false
    }

    // Check password strength (must be strong - score >= 4)
    const passwordStrength = validatePasswordStrength(data.password, email)
    if (passwordStrength.score < 4 || !passwordStrength.isValid) {
      return false
    }

    // Check passwords match
    if (data.password !== data.password_confirm) {
      return false
    }

    return true
  }, [data.password, data.password_confirm, email])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoader(true)

    if (data.password === '') {
      toast.error('Please enter your new password.')
      setLoader(false)
      return
    }

    if (data.password !== data.password_confirm) {
      toast.error('Passwords do not match.')
      setLoader(false)
      return
    }

    if (!email || !otpCode) {
      toast.error('Invalid reset link. Please request password reset again.')
      setLoader(false)
      router.push('/forgotpassword')
      return
    }

    try {
      const response = await auth.resetPassword({
        email,
        otp_code: otpCode,
        password: data.password,
        password_confirm: data.password_confirm,
      })

      if (response.success) {
        toast.success(response.message || 'Password reset successfully')
        setData({ password: '', password_confirm: '' })
        router.push('/signin')
      } else {
        toast.error(response.message || 'Failed to reset password')
        if (response.errors) {
          Object.keys(response.errors).forEach((key) => {
            const errorValue = response.errors[key]
            if (Array.isArray(errorValue)) {
              toast.error(errorValue[0])
            } else if (typeof errorValue === 'string') {
              toast.error(errorValue)
            }
          })
        }
      }

      setLoader(false)
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred. Please try again.')
      setLoader(false)
    }
  }

  if (!email || !otpCode) {
    return (
      <>
        <Breadcrumb pageName='Reset Password' />
        <div className='min-h-screen bg-slate-100'>
          <div className='container mx-auto px-4 pb-8'>
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
      <Breadcrumb pageName='Reset Password' />
      <div className='bg-slate-100'>
        <div className='container mx-auto px-4 pb-8'>
          <div className='flex justify-center items-center'>
            <div className='w-full max-w-md'>
              <div
                className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm'
                data-wow-delay='.15s'>
                <div className='mb-8'>
                  <h2 className='text-2xl font-bold text-gray-900'>Reset Password</h2>
                  <p className='mt-2 text-sm text-gray-600'>Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className='mb-[22px]'>
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='New password'
                        name='password'
                        value={data?.password}
                        onChange={handleChange}
                        required
                        className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none'
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} className='w-5 h-5' />
                      </button>
                    </div>
                    <PasswordStrengthMeter
                      password={data.password}
                      email={email}
                    />
                  </div>

                  <div className='mb-[22px]'>
                    <div className='relative'>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirm new password'
                        name='password_confirm'
                        value={data?.password_confirm}
                        onChange={handleChange}
                        required
                        className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                          passwordMatchError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                        }`}
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none'
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                        <Icon icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} className='w-5 h-5' />
                      </button>
                    </div>
                    {passwordMatchError && (
                      <p className='mt-1 text-sm text-red-500'>{passwordMatchError}</p>
                    )}
                  </div>
                  <div className='mb-4'>
                    <button
                      type='submit'
                      disabled={loader || !isFormValid}
                      className='flex w-full cursor-pointer items-center justify-center rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 disabled:hover:bg-gray-400'>
                      Save Password {loader && <Loader />}
                    </button>
                  </div>
                </form>

                <div className='text-center'>
                  <p className='text-sm text-gray-600'>
                    Remember your password?{' '}
                    <Link href='/signin' className='font-medium text-primary hover:text-primary/80 transition-colors'>
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPasswordPage

