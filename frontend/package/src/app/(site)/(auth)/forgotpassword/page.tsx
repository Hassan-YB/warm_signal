import ForgotPassword from '@/app/components/Auth/ForgotPassword'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password | Signal Trace',
}

const ForgotPasswordPage = () => {
  return (
    <>
      <Breadcrumb pageName='Forgot Password' />
      <div className='min-h-screen bg-slate-100'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-center items-center'>
            <div className='w-full max-w-md'>
              <ForgotPassword />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage

