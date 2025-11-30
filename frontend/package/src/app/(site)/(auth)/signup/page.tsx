import SignUp from '@/app/components/Auth/SignUp'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Warm Signal',
}

const SignupPage = () => {
  return (
    <>
      <Breadcrumb pageName='Sign Up' />
      <div className='container mx-auto px-4 py-10'>
        <div className='flex justify-center items-center min-h-[60vh]'>
          <div className='w-full max-w-md'>
            <SignUp />
          </div>
        </div>
      </div>
    </>
  )
}

export default SignupPage
