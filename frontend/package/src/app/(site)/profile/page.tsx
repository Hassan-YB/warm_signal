import ProfilePage from '@/app/components/Profile'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile | Warm Signal',
}

const Profile = () => {
  return (
    <>
      <Breadcrumb pageName='Profile' />
      <ProfilePage />
    </>
  )
}

export default Profile






