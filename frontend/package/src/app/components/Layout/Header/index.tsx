'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import Logo from './Logo'
import HeaderLink from './Navigation/HeaderLink'
import MobileHeaderLink from './Navigation/MobileHeaderLink'
import { Icon } from '@iconify/react/dist/iconify.js'
import { headerItem } from '@/app/types/menu'
import { isAuthenticated } from '@/utils/api'

const Header: React.FC = () => {
  const [headerData, setHeaderData] = useState<headerItem[]>([])

  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setHeaderData(data.HeaderData)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    // Check authentication status on mount
    setAuthenticated(isAuthenticated())
    
    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = () => {
      setAuthenticated(isAuthenticated())
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom auth state change event
    const handleAuthChange = () => {
      setAuthenticated(isAuthenticated())
    }
    window.addEventListener('authStateChanged', handleAuthChange)
    
    // Check auth state when window regains focus (e.g., after logout redirect)
    const handleFocus = () => {
      setAuthenticated(isAuthenticated())
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])


  const handleScroll = () => {
    setSticky(window.scrollY >= 80)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [navbarOpen])

  useEffect(() => {
    if (navbarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [navbarOpen])

  return (
    <header
      className={`z-40 w-full transition-all fixed top-0 duration-300 ${
        sticky ? 'shadow-lg bg-white py-3' : 'shadow-none bg-transparent py-3'
      }`}>
      <div>
        <div className='container flex items-center justify-between'>
          <div>
            <Logo />
          </div>
          <nav className='hidden lg:flex grow items-center gap-8 justify-start md:ml-20'>
            {headerData.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>
          <div className='flex items-center gap-4'>
            {authenticated ? (
              <Link
                href='/profile'
                className='hidden lg:flex items-center gap-2 bg-primary text-white hover:bg-transparent hover:text-primary border border-primary px-6 py-2 rounded-full font-medium text-base'>
                <Icon icon='fa:user' className='text-lg' />
                Profile
              </Link>
            ) : (
              <>
                <Link
                  href='/signin'
                  className='hidden lg:block bg-transparent text-primary border hover:bg-primary border-primary hover:text-white px-6 py-2 rounded-full font-medium text-base'>
                  Sign In
                </Link>
                <Link
                  href='/signup'
                  className='hidden lg:block bg-primary text-white hover:bg-transparent hover:text-primary border border-primary px-6 py-2 rounded-full font-medium text-base'>
                  Sign Up
                </Link>
              </>
            )}
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className='block lg:hidden p-2 rounded-lg'
              aria-label='Toggle mobile menu'>
              <span className='block w-6 h-0.5 bg-black'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
            </button>
          </div>
        </div>
        {navbarOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
        )}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          } z-50`}>
          <div className='flex items-center justify-between p-4'>
            <h2 className='text-lg font-bold text-midnight_text'>
              <Logo />
            </h2>

            {/*  */}
            <button
              onClick={() => setNavbarOpen(false)}
              className="bg-[url('/images/closed.svg')] bg-no-repeat bg-contain w-5 h-5 absolute top-0 right-0 mr-8 mt-8 dark:invert"
              aria-label='Close menu Modal'></button>
          </div>
          <nav className='flex flex-col items-start p-4'>
            {headerData.map((item, index) => (
              <MobileHeaderLink key={index} item={item} />
            ))}
            <div className='mt-4 flex flex-col gap-4 w-full'>
              {authenticated ? (
                <Link
                  href='/profile'
                  className='flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                  onClick={() => {
                    setNavbarOpen(false)
                  }}>
                  <Icon icon='fa:user' className='text-lg' />
                  Profile
                </Link>
              ) : (
                <>
                  <Link
                    href='/signin'
                    className='bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white'
                    onClick={() => {
                      setNavbarOpen(false)
                    }}>
                    Sign In
                  </Link>
                  <Link
                    href='/signup'
                    className='bg-primary text-white  px-4 py-2 rounded-lg hover:bg-blue-700'
                    onClick={() => {
                      setNavbarOpen(false)
                    }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
