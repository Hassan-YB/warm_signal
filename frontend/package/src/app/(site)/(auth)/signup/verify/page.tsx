'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OTPVerification from '@/app/components/Auth/OTPVerification'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import toast from 'react-hot-toast'

const SignupVerifyPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [signupData, setSignupData] = useState<{
    first_name: string
    last_name: string
    password: string
    password_confirm: string
  } | null>(null)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const first_name = searchParams.get('first_name') || ''
    const last_name = searchParams.get('last_name') || ''
    const password = searchParams.get('password') || ''
    const password_confirm = searchParams.get('password_confirm') || ''

    if (!emailParam) {
      toast.error('Invalid verification link. Please sign up again.')
      router.push('/signup')
      return
    }

    setEmail(emailParam)
    setSignupData({
      first_name,
      last_name,
      password,
      password_confirm,
    })
  }, [searchParams, router])

  if (!email || !signupData) {
    return (
      <>
        <Breadcrumb pageName='Verify Email' />
        <div className='min-h-screen bg-slate-100'>
          <div className='container mx-auto px-4 pb-8'>
            <div className='flex justify-center'>
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
      <div className='min-h-screen bg-slate-100'>
        <div className='container mx-auto px-4 pb-8'>
          <div className='flex justify-center'>
            <div className='w-full max-w-md'>
              <OTPVerification
                email={email}
                signupData={signupData}
                otpType='signup'
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignupVerifyPage

