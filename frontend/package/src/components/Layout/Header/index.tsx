'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { headerData } from '../Header/Navigation/menuData'
import Logo from './Logo'
import HeaderLink from '../Header/Navigation/HeaderLink'
import MobileHeaderLink from '../Header/Navigation/MobileHeaderLink'
import Signin from '@/app/components/Auth/SignIn'
import SignUp from '@/app/components/Auth/SignUp'
import { useTheme } from 'next-themes'
import { Icon } from '@iconify/react/dist/iconify.js'
import { isAuthenticated } from '@/utils/api'

const Header: React.FC = () => {
  const pathUrl = usePathname()
  const { theme, setTheme } = useTheme()

  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const navbarRef = useRef<HTMLDivElement>(null)
  const signInRef = useRef<HTMLDivElement>(null)
  const signUpRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    setSticky(window.scrollY >= 80)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      signInRef.current &&
      !signInRef.current.contains(event.target as Node)
    ) {
      setIsSignInOpen(false)
    }
    if (
      signUpRef.current &&
      !signUpRef.current.contains(event.target as Node)
    ) {
      setIsSignUpOpen(false)
    }
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false)
    }
  }

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
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [])

  // Update auth state when modals close
  useEffect(() => {
    if (!isSignInOpen && !isSignUpOpen) {
      // Small delay to ensure tokens are saved
      const timer = setTimeout(() => {
        const isAuth = isAuthenticated()
        setAuthenticated(isAuth)
        // Close modals if user becomes authenticated
        if (isAuth) {
          setIsSignInOpen(false)
          setIsSignUpOpen(false)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isSignInOpen, isSignUpOpen])

  // Close modals when authentication state changes to true
  useEffect(() => {
    if (authenticated) {
      setIsSignInOpen(false)
      setIsSignUpOpen(false)
    }
  }, [authenticated])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [navbarOpen, isSignInOpen, isSignUpOpen])

  useEffect(() => {
    if (isSignInOpen || isSignUpOpen || navbarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isSignInOpen, isSignUpOpen, navbarOpen])

  return (
    <header
      className={`z-40 w-full transition-all fixed top-0 duration-300 ${
        sticky ? 'shadow-lg bg-white py-6' : 'shadow-none bg-transparent py-6'
      }`}>
      <div className='lg:py-0 py-2'>
        <div className='container flex items-center justify-between'>
          <Logo />
          <nav className='hidden lg:flex grow items-center gap-8 justify-start md:ml-20'>
            {headerData.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>
          <div className='flex items-center gap-4'>
            {authenticated ? (
              <Link
                href='/profile'
                className='hidden lg:flex items-center gap-2 bg-primary text-white hover:bg-transparent hover:text-primary border border-primary px-6 py-3 rounded-full font-medium text-lg'>
                <Icon icon='fa:user' className='text-xl' />
                Profile
              </Link>
            ) : (
              <>
                <Link
                  href='#'
                  className='hidden lg:block bg-transparent text-primary border hover:bg-primary border-primary hover:text-white px-12 py-5 rounded-full font-medium text-xl'
                  onClick={() => {
                    setIsSignInOpen(true)
                  }}>
                  Sign In
                </Link>
                {isSignInOpen && (
                  <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                    <div
                      ref={signInRef}
                      className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg px-8 pt-14 pb-8 text-center bg-dark_grey/90 backdrop-blur-md'>
                      <button
                        onClick={() => setIsSignInOpen(false)}
                        className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                        aria-label='Close Sign In Modal'>
                        <Icon
                          icon='tabler:currency-xrp'
                          className='text-white hover:text-primary text-24 inline-block me-2'
                        />
                      </button>
                      <Signin onSuccess={() => {
                        setIsSignInOpen(false)
                        // Immediately check auth state
                        setTimeout(() => setAuthenticated(isAuthenticated()), 50)
                      }} />
                    </div>
                  </div>
                )}
                <Link
                  href='#'
                  className='hidden lg:block bg-primary text-white hover:bg-transparent hover:text-primary border border-primary px-12 py-5 rounded-full font-medium text-xl'
                  onClick={() => {
                    setIsSignUpOpen(true)
                  }}>
                  Sign Up
                </Link>
                {isSignUpOpen && (
                  <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                    <div
                      ref={signUpRef}
                      className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-dark_grey/90 backdrop-blur-md px-8 pt-14 pb-8 text-center'>
                      <button
                        onClick={() => setIsSignUpOpen(false)}
                        className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                        aria-label='Close Sign Up Modal'>
                        <Icon
                          icon='tabler:currency-xrp'
                          className='text-white hover:text-primary text-24 inline-block me-2'
                        />
                      </button>
                      <SignUp onSuccess={() => {
                        setIsSignUpOpen(false)
                        // Immediately check auth state
                        setTimeout(() => setAuthenticated(isAuthenticated()), 50)
                      }} />
                    </div>
                  </div>
                )}
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
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-black/50 shadow-lg transform transition-transform duration-300 max-w-xs ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          } z-50`}>
          <div className='flex items-center justify-between p-4'>
            <h2 className='text-lg font-bold text-midnight_text dark:text-midnight_text'>
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
                    href='#'
                    className='bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white'
                    onClick={() => {
                      setIsSignInOpen(true)
                      setNavbarOpen(false)
                    }}>
                    Sign In
                  </Link>
                  <Link
                    href='#'
                    className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                    onClick={() => {
                      setIsSignUpOpen(true)
                      setNavbarOpen(false)
                    }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
        {/* Mobile Sign In Modal */}
        {isSignInOpen && !authenticated && (
          <div className='lg:hidden fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
            <div
              ref={signInRef}
              className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg px-8 pt-14 pb-8 text-center bg-dark_grey/90 backdrop-blur-md'>
              <button
                onClick={() => setIsSignInOpen(false)}
                className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                aria-label='Close Sign In Modal'>
                <Icon
                  icon='tabler:currency-xrp'
                  className='text-white hover:text-primary text-24 inline-block me-2'
                />
              </button>
              <Signin onSuccess={() => {
                setIsSignInOpen(false)
                // Immediately check auth state
                setTimeout(() => setAuthenticated(isAuthenticated()), 50)
              }} />
            </div>
          </div>
        )}
        {/* Mobile Sign Up Modal */}
        {isSignUpOpen && !authenticated && (
          <div className='lg:hidden fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
            <div
              ref={signUpRef}
              className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-dark_grey/90 backdrop-blur-md px-8 pt-14 pb-8 text-center'>
              <button
                onClick={() => setIsSignUpOpen(false)}
                className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                aria-label='Close Sign Up Modal'>
                <Icon
                  icon='tabler:currency-xrp'
                  className='text-white hover:text-primary text-24 inline-block me-2'
                />
              </button>
              <SignUp onSuccess={() => {
                setIsSignUpOpen(false)
                // Immediately check auth state
                setTimeout(() => setAuthenticated(isAuthenticated()), 50)
              }} />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
