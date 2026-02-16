import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [isSign, setIsSign] = useState(false)
  
  const validateToken = () => {
    const token = localStorage.getItem('token')
    const expiresAt = localStorage.getItem('expires_at')
    console.log('isSignin:', isSign)

    if (!token || !expiresAt) {
      setIsSign(false)
      return
    }

    const expiresMs = new Date(expiresAt).getTime()
    const isValid = Date.now() < expiresMs

    setIsSign(isValid)
  }

  useEffect(() => {
    validateToken();
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    localStorage.removeItem('remember_me')
    setIsSign(false)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Vibe Voyage</h1>
        <p className="mt-2 text-sm text-white/70">
          Starter template with Tailwind + React Router
        </p>

        {isSign ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span>You are signed in!</span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-3">
            <Button>
              <Link to="/signin">
                Go to Sign In
              </Link>
            </Button>

            <Button>
              <Link to="/signup">
                Go to Sign Up
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}