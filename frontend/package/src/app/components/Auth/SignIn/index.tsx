'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/app/components/Layout/Header/Logo'
import Loader from '@/app/components/Common/Loader'
import { apiRequest, setTokens } from '@/utils/api'

interface SigninProps {
  onSuccess?: () => void
}

const Signin = ({ onSuccess }: SigninProps) => {
  const router = useRouter()

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; non_field_errors?: string }>({})

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const data = await apiRequest<{ user: any; tokens: { access: string; refresh: string } }>(
        '/api/auth/login/',
        {
          method: 'POST',
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
        },
        false // Public endpoint, don't send auth token
      )

      if (data.success && data.data) {
        // Store tokens
        if (data.data.tokens) {
          setTokens(data.data.tokens.access, data.data.tokens.refresh)
          // Dispatch custom event to notify other components
          window.dispatchEvent(new Event('authStateChanged'))
        }
        toast.success(data.message || 'Login successful')
        setLoading(false)
        // Close modal if callback provided
        if (onSuccess) {
          onSuccess()
        }
        router.push('/profile')
      } else {
        // Handle errors
        const fieldErrors: { email?: string; password?: string; non_field_errors?: string } = {}
        
        if (data.errors) {
          if (data.errors.email) {
            fieldErrors.email = Array.isArray(data.errors.email) ? data.errors.email[0] : data.errors.email
          }
          if (data.errors.password) {
            fieldErrors.password = Array.isArray(data.errors.password) ? data.errors.password[0] : data.errors.password
          }
          if (data.errors.non_field_errors) {
            fieldErrors.non_field_errors = Array.isArray(data.errors.non_field_errors) 
              ? data.errors.non_field_errors[0] 
              : data.errors.non_field_errors
          }
        }
        
        setErrors(fieldErrors)
        
        // Show general error message
        const errorMessage = data.message || 'Login failed. Please check your credentials.'
        toast.error(errorMessage)
        setLoading(false)
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || 'An error occurred. Please try again.')
      console.error(err)
    }
  }

  return (
    <>
      <div className='mb-10 text-center mx-auto inline-block max-w-[160px]'>
        <Logo />
      </div>

      <form onSubmit={loginUser}>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            value={loginData.email}
            onChange={(e) => {
              setLoginData({ ...loginData, email: e.target.value })
              if (errors.email) setErrors({ ...errors, email: undefined })
            }}
            className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black ${
              errors.email ? 'border-red-500' : ''
            }`}
          />
          {errors.email && (
            <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
          )}
        </div>
        <div className='mb-[22px]'>
          <input
            type='password'
            placeholder='Password'
            value={loginData.password}
            onChange={(e) => {
              setLoginData({ ...loginData, password: e.target.value })
              if (errors.password) setErrors({ ...errors, password: undefined })
            }}
            className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary text-black focus-visible:shadow-none ${
              errors.password ? 'border-red-500' : ''
            }`}
          />
          {errors.password && (
            <p className='mt-1 text-sm text-red-500'>{errors.password}</p>
          )}
        </div>
        {errors.non_field_errors && (
          <div className='mb-4'>
            <p className='text-sm text-red-500'>{errors.non_field_errors}</p>
          </div>
        )}
        <div className='mb-9'>
          <button
            type='submit'
            disabled={loading}
            className='bg-primary w-full py-3 rounded-lg text-18 font-medium transition duration-300 ease-in-out border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
            Sign In {loading && <Loader />}
          </button>
        </div>
      </form>

      <Link
        href='/'
        className='mb-2 inline-block text-base text-dark hover:text-primary text-primary dark:hover:text-primary'>
        Forgot Password?
      </Link>
      <p className='text-body-secondary text-black text-base'>
        Not a member yet?{' '}
        <Link href='/signup' className='text-primary hover:underline'>
          Sign Up
        </Link>
      </p>
    </>
  )
}

export default Signin
