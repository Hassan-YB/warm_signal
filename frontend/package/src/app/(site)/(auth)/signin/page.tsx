import Signin from '@/app/components/Auth/SignIn'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Signal Trace',
}

const SigninPage = () => {
  return (
    <>
      <Breadcrumb pageName='Sign In' />
      <div className='min-h-screen bg-slate-100'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-center items-center'>
            <div className='w-full max-w-md'>
              <Signin />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SigninPage
