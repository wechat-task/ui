import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithPasskey, registerWithPasskey } from '../lib/auth'
import { Button } from '../components/Button'

type AuthMode = 'login' | 'register'

export function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (mode === 'register') {
        if (!username.trim()) {
          setError('Username is required for registration')
          setLoading(false)
          return
        }
        await registerWithPasskey(username.trim())
      } else {
        await loginWithPasskey()
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'login'
              ? 'Sign in with your Passkey'
              : 'Register with a new Passkey'}
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading
              ? 'Authenticating...'
              : mode === 'login'
                ? 'Sign in with Passkey'
                : 'Register with Passkey'}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            Uses your device&apos;s biometric authentication (fingerprint, face, etc.)
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <>Don&apos;t have an account?{' '}
              <button onClick={() => { setMode('register'); setError('') }} className="text-slate-900 font-medium hover:underline">
                Register
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError('') }} className="text-slate-900 font-medium hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
