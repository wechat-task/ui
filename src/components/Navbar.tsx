import { Link, useNavigate } from 'react-router-dom'
import { logout, isAuthenticated } from '../lib/auth'
import { Button } from './Button'

export function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-semibold text-slate-900">
          WeChat Task
        </Link>
        {isAuthenticated() && (
          <Button variant="secondary" onClick={handleLogout}>
            Sign Out
          </Button>
        )}
      </div>
    </nav>
  )
}
