'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { auth } from '@/lib/api'
import { clearTokens, isAuthenticated, getRefreshToken } from '@/utils/api'
import Loader from '@/app/components/Common/Loader'
import PasswordStrengthMeter, { validatePasswordStrength } from '@/app/components/Common/PasswordStrengthMeter'
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
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    new_password_confirm: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordMatchError, setPasswordMatchError] = useState<string>('')

  // Real-time password matching validation
  useEffect(() => {
    if (passwordData.new_password_confirm && passwordData.new_password !== passwordData.new_password_confirm) {
      setPasswordMatchError('Passwords do not match')
    } else {
      setPasswordMatchError('')
    }
  }, [passwordData.new_password, passwordData.new_password_confirm])

  // Check if password change form is valid
  const isPasswordFormValid = useMemo(() => {
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.new_password_confirm) {
      return false
    }

    // Check password strength (must be strong - score >= 4)
    const passwordStrength = validatePasswordStrength(
      passwordData.new_password,
      user?.email,
      user?.first_name,
      user?.last_name
    )
    if (passwordStrength.score < 4 || !passwordStrength.isValid) {
      return false
    }

    // Check passwords match
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      return false
    }

    return true
  }, [passwordData, user])

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
      const response = await auth.getProfile()
      if (response.success && response.data?.user) {
        const userData = response.data.user
        setUser(userData)
        setProfileData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
        })
      } else {
        // 401 errors are handled automatically by API client (user will be logged out and redirected)
        // Only show error for non-401 errors
        if (!response.message?.includes('session has expired')) {
          toast.error(response.message || 'Failed to fetch profile')
        }
      }
    } catch (error: any) {
      // 401 errors are handled automatically by API client
      // Only show error for network or other errors
      if (!error.message?.includes('session has expired')) {
        toast.error('Failed to fetch profile')
        console.error(error)
      }
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await auth.updateProfile(profileData)

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
      const response = await auth.changePassword(passwordData)

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
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await auth.logout({ refresh_token: refreshToken })
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
    <div className='min-h-screen bg-slate-100'>
      <div className='container mx-auto px-4 pt-8 pb-8'>
        <div className='flex flex-col md:flex-row gap-6'>
            {/* Sidebar */}
            <div className='w-full md:w-64 flex-shrink-0'>
              <div className='rounded-xl border border-gray-200 bg-white shadow-sm p-4'>
                <h2 className='text-2xl font-bold mb-6 text-gray-900 text-center'>Settings</h2>
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
                    Password
                  </button>
                  <button
                    onClick={() => setActiveTab('logout')}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'logout'
                        ? 'bg-red-500 text-white'
                        : 'text-black hover:bg-gray-100'
                    }`}>
                    <Icon icon='mdi:logout' className='text-xl' />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className='flex-1'>
              <div className='rounded-xl border border-gray-200 bg-white shadow-sm p-8'>
                {activeTab === 'profile' && (
                  <div>
                    <h2 className='text-2xl font-bold mb-2 text-gray-900 flex items-start gap-3 leading-none'>
                      <Icon icon='fa:user-circle' className='text-xl' />
                      Profile
                    </h2>
                    <p className='mb-6 text-sm text-gray-600'>Update your personal information</p>
                  <form onSubmit={handleProfileUpdate}>
                    <div className='space-y-4 max-w-md'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          First Name
                        </label>
                        <input
                          type='text'
                          name='first_name'
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                            errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
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
                          className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                            errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
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
                          className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                            errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
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
                          className='flex items-center justify-center rounded-lg border border-primary bg-primary px-6 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'>
                          {loading ? <Loader /> : 'Save'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h2 className='text-2xl font-bold mb-2 text-gray-900 flex items-center gap-3 leading-none'>
                    <Icon icon='fa:lock' className='text-xl' />
                    Password
                  </h2>
                  <p className='mb-6 text-sm text-gray-600'>Update your password to keep your account secure</p>
                  <form onSubmit={handlePasswordChange}>
                    <div className='space-y-4 max-w-md'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Current Password
                        </label>
                        <div className='relative'>
                          <input
                            type={showPasswords.old_password ? 'text' : 'password'}
                            name='old_password'
                            value={passwordData.old_password}
                            onChange={handlePasswordChangeInput}
                            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                              errors.old_password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                            }`}
                          />
                          <button
                            type='button'
                            onClick={() => setShowPasswords({ ...showPasswords, old_password: !showPasswords.old_password })}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none'
                            aria-label={showPasswords.old_password ? 'Hide password' : 'Show password'}>
                            <Icon icon={showPasswords.old_password ? 'mdi:eye-off' : 'mdi:eye'} className='w-5 h-5' />
                          </button>
                        </div>
                        {errors.old_password && (
                          <p className='mt-1 text-sm text-red-500'>{errors.old_password}</p>
                        )}
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          New Password
                        </label>
                        <div className='relative'>
                          <input
                            type={showPasswords.new_password ? 'text' : 'password'}
                            name='new_password'
                            value={passwordData.new_password}
                            onChange={handlePasswordChangeInput}
                            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                              errors.new_password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                            }`}
                          />
                          <button
                            type='button'
                            onClick={() => setShowPasswords({ ...showPasswords, new_password: !showPasswords.new_password })}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none'
                            aria-label={showPasswords.new_password ? 'Hide password' : 'Show password'}>
                            <Icon icon={showPasswords.new_password ? 'mdi:eye-off' : 'mdi:eye'} className='w-5 h-5' />
                          </button>
                        </div>
                        <PasswordStrengthMeter
                          password={passwordData.new_password}
                          email={user?.email}
                          firstName={user?.first_name}
                          lastName={user?.last_name}
                        />
                        {errors.new_password && (
                          <p className='mt-1 text-sm text-red-500'>{errors.new_password}</p>
                        )}
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Confirm Password
                        </label>
                        <div className='relative'>
                          <input
                            type={showPasswords.new_password_confirm ? 'text' : 'password'}
                            name='new_password_confirm'
                            value={passwordData.new_password_confirm}
                            onChange={handlePasswordChangeInput}
                            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                              errors.new_password_confirm || passwordMatchError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                            }`}
                          />
                          <button
                            type='button'
                            onClick={() => setShowPasswords({ ...showPasswords, new_password_confirm: !showPasswords.new_password_confirm })}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none'
                            aria-label={showPasswords.new_password_confirm ? 'Hide password' : 'Show password'}>
                            <Icon icon={showPasswords.new_password_confirm ? 'mdi:eye-off' : 'mdi:eye'} className='w-5 h-5' />
                          </button>
                        </div>
                        {passwordMatchError && (
                          <p className='mt-1 text-sm text-red-500'>{passwordMatchError}</p>
                        )}
                        {errors.new_password_confirm && (
                          <p className='mt-1 text-sm text-red-500'>{errors.new_password_confirm}</p>
                        )}
                      </div>

                      <div className='pt-4'>
                        <button
                          type='submit'
                          disabled={loading || !isPasswordFormValid}
                          className='flex items-center justify-center rounded-lg border border-primary bg-primary px-6 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 disabled:hover:bg-gray-400'>
                          {loading ? <Loader /> : 'Update'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'logout' && (
                <div>
                  <h2 className='text-2xl font-bold mb-2 text-gray-900 flex items-center gap-3 leading-none'>
                    <Icon icon='mdi:logout' className='text-xl' />
                    Sign Out
                  </h2>
                  <p className='mb-6 text-sm text-gray-600'>Sign out of your account</p>
                  <div className='space-y-4'>
                    <p className='text-gray-700'>
                      Are you sure you want to sign out? You will need to sign in again to access your
                      account.
                    </p>
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className='flex items-center justify-center gap-2 rounded-lg border border-red-500 bg-red-500 px-6 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'>
                      {loading ? (
                        <Loader />
                      ) : (
                        <>
                          <Icon icon='mdi:logout' className='text-lg' />
                          Sign Out
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







