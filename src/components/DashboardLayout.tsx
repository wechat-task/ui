import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'

const skillSubItems = [
  { to: '/dashboard/skills/plaza', label: 'Skill Plaza' },
  { to: '/dashboard/skills/subscriptions', label: 'My Subscriptions' },
  { to: '/dashboard/skills/me', label: 'My Skills' },
]

export function DashboardLayout() {
  const location = useLocation()
  const isSkillActive = location.pathname.startsWith('/dashboard/skills')
  const [skillExpanded, setSkillExpanded] = useState(isSkillActive)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex max-w-7xl mx-auto px-4 py-8">
        {/* Sidebar */}
        <div className="w-64 shrink-0 pr-8 border-r border-slate-200">
          <nav className="space-y-1">
            <NavLink
              to="/dashboard/bots"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Bot Management
            </NavLink>

            {/* Skill Management - expandable group */}
            <div>
              <button
                onClick={() => setSkillExpanded(!skillExpanded)}
                className={`flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors ${
                  isSkillActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="flex-1 text-left">Skill Management</span>
                <svg
                  className={`w-4 h-4 transition-transform ${skillExpanded ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {skillExpanded && (
                <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">
                  {skillSubItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `block px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-medium'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
        {/* Main content */}
        <div className="flex-1 pl-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
