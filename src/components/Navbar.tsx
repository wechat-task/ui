import { Link, useNavigate } from 'react-router-dom'
import { logout, isAuthenticated } from '../lib/auth'
import { getCurrentUser } from '../lib/api'
import type { User } from '../types'
import { useState, useEffect } from 'react'
import { DropdownMenu } from './DropdownMenu'

function Avatar({ src }: { src?: string }) {
  if (src) {
    return (
      <img src={src} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    </div>
  )
}

export function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      getCurrentUser().then(setUser).catch(() => {})
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-semibold text-slate-900">
          WeChat Task
        </Link>
        {isAuthenticated() && (
          <DropdownMenu
            trigger={
              <div className="flex items-center gap-2">
                <Avatar src={user?.icon} />
                <span className="text-sm text-slate-700">{user?.username || 'User'}</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            }
          >
            <Link
              to="/dashboard/profile"
              className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign Out
            </button>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}
