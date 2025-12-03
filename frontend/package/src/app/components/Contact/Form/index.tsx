'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { apiRequest } from '@/utils/api'
import toast from 'react-hot-toast'

interface ContactFormProps {
  isHomepage?: boolean
}

const ContactForm = ({ isHomepage = false }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [showThanks, setShowThanks] = useState(false)
  const [loader, setLoader] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    // Validate required fields (phone_number is optional)
    const isValid = 
      formData.first_name.trim() !== '' &&
      formData.last_name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.message.trim() !== ''
    setIsFormValid(isValid)
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const reset = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      message: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoader(true)

    try {
      const response = await apiRequest<{ id: number; message: string }>(
        '/api/support/contact/',
        {
          method: 'POST',
          body: JSON.stringify(formData),
        },
        false // No auth required for contact form
      )

      if (response.success) {
        setSubmitted(true)
        setShowThanks(true)
        reset()
        toast.success(response.message || 'Your message has been received. We will get back to you soon.')

        setTimeout(() => {
          setShowThanks(false)
        }, 5000)
      } else {
        // Handle validation errors
        if (response.errors) {
          Object.values(response.errors).forEach((error: any) => {
            if (Array.isArray(error)) {
              error.forEach((err) => toast.error(err))
            } else {
              toast.error(error)
            }
          })
        } else {
          toast.error(response.message || 'Failed to submit your message. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Contact form error:', error)
      toast.error('An error occurred. Please try again later.')
    } finally {
      setLoader(false)
    }
  }

  return (
    <div className={`${isHomepage ? 'py-20' : 'min-h-screen'} bg-slate-100`}>
      <div className='container mx-auto px-4 pb-8'>
        <div className='flex justify-center'>
          <div className='w-full max-w-2xl'>
            <div className='rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm'>
              <div className='mb-[22px]'>
                <h2 className='text-2xl font-bold text-gray-900 leading-none'>Get in Touch</h2>
                <p className='mt-[10px] text-sm text-gray-600'>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='sm:flex gap-3 mb-[22px]'>
                  <div className='flex-1'>
                    <label
                      htmlFor='first_name'
                      className='block text-sm font-medium text-gray-700 mb-2'>
                      First Name
                    </label>
                    <input
                      id='first_name'
                      type='text'
                      name='first_name'
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder='John'
                      required
                      className='w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    />
                  </div>
                  <div className='flex-1'>
                    <label
                      htmlFor='last_name'
                      className='block text-sm font-medium text-gray-700 mb-2'>
                      Last Name
                    </label>
                    <input
                      id='last_name'
                      type='text'
                      name='last_name'
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder='Doe'
                      required
                      className='w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    />
                  </div>
                </div>
                <div className='sm:flex gap-3 mb-[22px]'>
                  <div className='flex-1'>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                      Email address
                    </label>
                    <input
                      id='email'
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      placeholder='john.doe@example.com'
                      required
                      className='w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    />
                  </div>
                  <div className='flex-1'>
                    <label
                      htmlFor='phone_number'
                      className='block text-sm font-medium text-gray-700 mb-2'>
                      Phone Number
                    </label>
                    <input
                      id='phone_number'
                      type='tel'
                      name='phone_number'
                      placeholder='+1234567890'
                      value={formData.phone_number}
                      onChange={handleChange}
                      className='w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    />
                  </div>
                </div>
                <div className='mb-[22px]'>
                  <label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-2'>
                    Message
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className='w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none'
                    placeholder='Anything else you wanna communicate'></textarea>
                </div>
                <div className='mb-[22px]'>
                  <button
                    type='submit'
                    disabled={!isFormValid || loader}
                    className='rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 disabled:hover:bg-gray-400'>
                    {loader ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
              {showThanks && (
                <div className='mt-[22px] text-white bg-primary rounded-lg px-4 py-3 text-base flex items-center gap-2'>
                  Thank you for contacting us! We will get back to you soon.
                  <div className='w-3 h-3 rounded-full animate-spin border-2 border-solid border-white border-t-transparent'></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactForm
