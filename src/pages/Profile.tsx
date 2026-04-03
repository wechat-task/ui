import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, updateProfile } from '../lib/api'
import type { User } from '../types'
import { Navbar } from '../components/Navbar'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [icon, setIcon] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const data = await getCurrentUser()
      setUser(data)
      setUsername(data.username || '')
      setIcon(data.icon || '')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      const updated = await updateProfile({
        username: username || undefined,
        icon: icon || undefined,
      })
      setUser(updated)
      setSuccess(true)
    } catch {
      // handle error
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-sm text-slate-400">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        </div>

        <Card>
          <div className="space-y-4">
            {user?.icon && (
              <div className="flex justify-center mb-4">
                <img
                  src={user.icon}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border border-slate-200"
                />
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-slate-700 mb-1">
                Avatar URL
              </label>
              <input
                id="icon"
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            {success && (
              <p className="text-sm text-emerald-600">Profile updated successfully.</p>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
