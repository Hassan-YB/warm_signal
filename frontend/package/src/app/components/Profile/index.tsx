'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { apiRequest, clearTokens, isAuthenticated } from '@/utils/api'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  date_joined: string
  is_active: boolean
}

type TabType = 'profile' | 'password' | 'logout'

const ProfilePage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/signin')
      return
    }

    // Fetch user profile
    fetchProfile()
  }, [router])

  const fetchProfile = async () => {
    try {
      const response = await apiRequest<{ user: User }>('/api/auth/profile/')
      if (response.success && response.data?.user) {
        const userData = response.data.user
        setUser(userData)
        setProfileData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
        })
      } else {
        toast.error(response.message || 'Failed to fetch profile')
        if (response.errors) {
          // Token might be invalid, redirect to login
          clearTokens()
          router.push('/signin')
        }
      }
    } catch (error: any) {
      toast.error('Failed to fetch profile')
      console.error(error)
      clearTokens()
      router.push('/signin')
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await apiRequest<{ user: User }>('/api/auth/profile/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      })

      if (response.success && response.data?.user) {
        const userData = response.data.user
        setUser(userData)
        toast.success(response.message || 'Profile updated successfully')
      } else {
        const fieldErrors: Record<string, string> = {}
        if (response.errors) {
          Object.keys(response.errors).forEach((key) => {
            const errorValue = response.errors![key]
            if (Array.isArray(errorValue)) {
              fieldErrors[key] = errorValue[0]
            } else if (typeof errorValue === 'string') {
              fieldErrors[key] = errorValue
            }
          })
        }
        setErrors(fieldErrors)
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error: any) {
      toast.error('An error occurred. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await apiRequest('/api/auth/password/change/', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      })

      if (response.success) {
        toast.success(response.message || 'Password changed successfully')
        setPasswordData({
          old_password: '',
          new_password: '',
          new_password_confirm: '',
        })
      } else {
        const fieldErrors: Record<string, string> = {}
        if (response.errors) {
          Object.keys(response.errors).forEach((key) => {
            const errorValue = response.errors![key]
            if (Array.isArray(errorValue)) {
              fieldErrors[key] = errorValue[0]
            } else if (typeof errorValue === 'string') {
              fieldErrors[key] = errorValue
            } else if (typeof errorValue === 'object' && errorValue !== null) {
              const nestedKey = Object.keys(errorValue)[0]
              fieldErrors[key] = Array.isArray(errorValue[nestedKey])
                ? errorValue[nestedKey][0]
                : errorValue[nestedKey]
            }
          })
        }
        setErrors(fieldErrors)
        toast.error(response.message || 'Failed to change password')
      }
    } catch (error: any) {
      toast.error('An error occurred. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await apiRequest('/api/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearTokens()
      // Ensure auth state is updated immediately
      window.dispatchEvent(new Event('authStateChanged'))
      toast.success('Logged out successfully')
      router.push('/signin')
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData({ ...profileData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handlePasswordChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({ ...passwordData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  if (!user) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-10'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Sidebar */}
          <div className='w-full md:w-64 flex-shrink-0'>
            <div className='bg-white rounded-lg shadow-md p-4'>
              <div className='space-y-2'>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}>
                  <Icon icon='fa:user-circle' className='text-xl' />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'password'
                      ? 'bg-primary text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}>
                  <Icon icon='fa:lock' className='text-xl' />
                  Change Password
                </button>
                <button
                  onClick={() => setActiveTab('logout')}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'logout'
                      ? 'bg-red-500 text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}>
                  <Icon icon='mdi:logout' className='text-xl' />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            <div className='bg-white rounded-lg shadow-md p-6 min-h-[500px]'>
              {activeTab === 'profile' && (
                <div>
                  <h2 className='text-3xl font-bold mb-6 text-black'>Update Profile</h2>
                  <form onSubmit={handleProfileUpdate}>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          First Name
                        </label>
                        <input
                          type='text'
                          name='first_name'
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black ${
                            errors.first_name ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.first_name && (
                          <p className='mt-1 text-sm text-red-500'>{errors.first_name}</p>
                        )}
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Last Name
                        </label>
                        <input
                          type='text'
                          name='last_name'
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black ${
                            errors.last_name ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.last_name && (
                          <p className='mt-1 text-sm text-red-500'>{errors.last_name}</p>
                        )}
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Email
                        </label>
                        <input
                          type='email'
                          name='email'
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black ${
                            errors.email ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.email && (
                          <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
                        )}
                      </div>

                      <div className='pt-4'>
                        <button
                          type='submit'
                          disabled={loading}
                          className='bg-primary w-auto px-8 py-3 rounded-lg text-18 font-medium transition duration-300 ease-in-out border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                          {loading ? <Loader /> : 'Update Profile'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h2 className='text-3xl font-bold mb-6 text-black'>Change Password</h2>
                  <form onSubmit={handlePasswordChange}>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Old Password
                        </label>
                        <input
                          type='password'
                          name='old_password'
                          value={passwordData.old_password}
                          onChange={handlePasswordChangeInput}
                          className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black ${
                            errors.old_password ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.old_password && (
                          <p className='mt-1 text-sm text-red-500'>{errors.old_password}</p>
                        )}
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          New Password
                        </label>
                        <input
                          type='password'
                          name='new_password'
                          value={passwordData.new_password}
                          onChange={handlePasswordChangeInput}
                          className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black ${
                            errors.new_password ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.new_password && (
                          <p className='mt-1 text-sm text-red-500'>{errors.new_password}</p>
                        )}
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Confirm New Password
                        </label>
                        <input
                          type='password'
                          name='new_password_confirm'
                          value={passwordData.new_password_confirm}
                          onChange={handlePasswordChangeInput}
                          className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black ${
                            errors.new_password_confirm ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.new_password_confirm && (
                          <p className='mt-1 text-sm text-red-500'>{errors.new_password_confirm}</p>
                        )}
                      </div>

                      <div className='pt-4'>
                        <button
                          type='submit'
                          disabled={loading}
                          className='bg-primary w-auto px-8 py-3 rounded-lg text-18 font-medium transition duration-300 ease-in-out border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                          {loading ? <Loader /> : 'Change Password'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'logout' && (
                <div>
                  <h2 className='text-3xl font-bold mb-6 text-black'>Logout</h2>
                  <div className='space-y-4'>
                    <p className='text-gray-700'>
                      Are you sure you want to logout? You will need to sign in again to access your
                      account.
                    </p>
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className='bg-red-500 w-auto px-8 py-3 rounded-lg text-18 font-medium transition duration-300 ease-in-out border text-white border-red-500 hover:bg-red-600 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
                      {loading ? (
                        <Loader />
                      ) : (
                        <>
                          <Icon icon='mdi:logout' className='text-lg' />
                          Logout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage







