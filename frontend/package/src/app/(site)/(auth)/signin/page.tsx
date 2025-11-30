import Signin from '@/app/components/Auth/SignIn'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Warm Signal',
}

const SigninPage = () => {
  return (
    <>
      <Breadcrumb pageName='Sign In' />
      <div className='container mx-auto px-4 py-10'>
        <div className='flex justify-center items-center min-h-[60vh]'>
          <div className='w-full max-w-md'>
            <Signin />
          </div>
        </div>
      </div>
    </>
  )
}

export default SigninPage
