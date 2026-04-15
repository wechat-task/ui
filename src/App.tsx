import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { BotDetail } from './pages/BotDetail'
import { Profile } from './pages/Profile'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SkillPlaza } from './pages/SkillPlaza'
import { MySubscriptions } from './pages/MySubscriptions'
import { MySkills } from './pages/MySkills'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="bots" replace />} />
          <Route path="bots" element={<Dashboard />} />
          <Route path="bots/:id" element={<BotDetail />} />
          <Route path="skills" element={<Navigate to="plaza" replace />} />
          <Route path="skills/plaza" element={<SkillPlaza />} />
          <Route path="skills/subscriptions" element={<MySubscriptions />} />
          <Route path="skills/me" element={<MySkills />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
