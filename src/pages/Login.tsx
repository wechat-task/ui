import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithPasskey } from '../lib/auth'
import { setUsername as setUsernameApi } from '../lib/api'
import { Button } from '../components/Button'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsernameVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await loginWithPasskey(username || undefined)
      // If new user with no username, set it
      if (username && !response.user?.username) {
        await setUsernameApi(username)
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
          <h1 className="text-2xl font-semibold text-slate-900">Welcome</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in with your Passkey</p>
        </div>

        <div className="border border-slate-200 rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username <span className="text-slate-400">(optional, for new users)</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsernameVal(e.target.value)}
              placeholder="your_name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Authenticating...' : 'Sign in with Passkey'}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            Uses your device&apos;s biometric authentication (fingerprint, face, etc.)
          </p>
        </div>
      </div>
    </div>
  )
}
