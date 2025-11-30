'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Logo from '@/app/components/Layout/Header/Logo'
import { useState } from 'react'
import Loader from '@/app/components/Common/Loader'
import { apiRequest, setTokens } from '@/utils/api'

interface SignUpProps {
  onSuccess?: () => void
}

const SignUp = ({ onSuccess }: SignUpProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  })
  const [errors, setErrors] = useState<{
    first_name?: string
    last_name?: string
    email?: string
    password?: string
    password_confirm?: string
    non_field_errors?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const data = await apiRequest('/api/auth/signup/', {
        method: 'POST',
        body: JSON.stringify(formData),
      }, false) // Public endpoint, don't send auth token

      if (data.success) {
        // Store tokens if provided (some signup flows return tokens directly)
        if (data.data?.tokens) {
          setTokens(data.data.tokens.access, data.data.tokens.refresh)
          // Dispatch custom event to notify other components
          window.dispatchEvent(new Event('authStateChanged'))
        }
        toast.success(data.message || 'Successfully registered')
        setLoading(false)
        // Close modal if callback provided
        if (onSuccess) {
          onSuccess()
        }
        // If tokens were provided, redirect to profile, otherwise to signin
        if (data.data?.tokens) {
          router.push('/profile')
        } else {
          router.push('/signin')
        }
      } else {
        // Handle errors
        const fieldErrors: typeof errors = {}
        
        if (data.errors) {
          Object.keys(data.errors).forEach((key) => {
            const errorValue = data.errors[key]
            if (Array.isArray(errorValue)) {
              fieldErrors[key as keyof typeof fieldErrors] = errorValue[0]
            } else if (typeof errorValue === 'string') {
              fieldErrors[key as keyof typeof fieldErrors] = errorValue
            } else if (typeof errorValue === 'object' && errorValue !== null) {
              // Handle nested errors
              const nestedKey = Object.keys(errorValue)[0]
              fieldErrors[key as keyof typeof fieldErrors] = 
                Array.isArray(errorValue[nestedKey]) 
                  ? errorValue[nestedKey][0] 
                  : errorValue[nestedKey]
            }
          })
        }
        
        setErrors(fieldErrors)
        
        // Show general error message
        const errorMessage = data.message || 'Registration failed. Please check your information.'
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

      <form onSubmit={handleSubmit}>
        <div className='mb-[22px]'>
          <input
            type='text'
            placeholder='First Name'
            name='first_name'
            value={formData.first_name}
            onChange={handleChange}
            required
            className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary text-black focus-visible:shadow-none ${
              errors.first_name ? 'border-red-500' : ''
            }`}
          />
          {errors.first_name && (
            <p className='mt-1 text-sm text-red-500'>{errors.first_name}</p>
          )}
        </div>
        <div className='mb-[22px]'>
          <input
            type='text'
            placeholder='Last Name'
            name='last_name'
            value={formData.last_name}
            onChange={handleChange}
            required
            className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary text-black focus-visible:shadow-none ${
              errors.last_name ? 'border-red-500' : ''
            }`}
          />
          {errors.last_name && (
            <p className='mt-1 text-sm text-red-500'>{errors.last_name}</p>
          )}
        </div>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary text-black focus-visible:shadow-none ${
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
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary text-black focus-visible:shadow-none ${
              errors.password ? 'border-red-500' : ''
            }`}
          />
          {errors.password && (
            <p className='mt-1 text-sm text-red-500'>{errors.password}</p>
          )}
        </div>
        <div className='mb-[22px]'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password_confirm'
            value={formData.password_confirm}
            onChange={handleChange}
            required
            className={`w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary text-black focus-visible:shadow-none ${
              errors.password_confirm ? 'border-red-500' : ''
            }`}
          />
          {errors.password_confirm && (
            <p className='mt-1 text-sm text-red-500'>{errors.password_confirm}</p>
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
            className='flex w-full items-center text-18 font-medium justify-center text-white rounded-md bg-primary px-5 py-3 transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
            Sign Up {loading && <Loader />}
          </button>
        </div>
      </form>

      <p className='text-body-secondary mb-4 text-black text-base'>
        By creating an account you are agree with our{' '}
        <Link href='/#' className='text-primary hover:underline'>
          Privacy
        </Link>{' '}
        and{' '}
        <Link href='/#' className='text-primary hover:underline'>
          Policy
        </Link>
      </p>

      <p className='text-body-secondary text-black text-base'>
        Already have an account?{' '}
        <Link href='/signin' className='text-primary hover:underline'>
          Sign In
        </Link>
      </p>
    </>
  )
}

export default SignUp
