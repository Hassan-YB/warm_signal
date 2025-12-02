'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OTPVerification from '@/app/components/Auth/OTPVerification'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import toast from 'react-hot-toast'

const ForgotPasswordVerifyPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    const emailParam = searchParams.get('email')

    if (!emailParam) {
      toast.error('Invalid verification link. Please request password reset again.')
      router.push('/forgotpassword')
      return
    }

    setEmail(emailParam)
  }, [searchParams, router])

  if (!email) {
    return (
      <>
        <Breadcrumb pageName='Verify OTP' />
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
      <Breadcrumb pageName='Verify OTP' />
      <div className='min-h-screen bg-slate-100 py-5'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-center items-center py-10'>
            <div className='w-full max-w-md'>
              <OTPVerification
                email={email}
                otpType='password_reset'
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordVerifyPage

