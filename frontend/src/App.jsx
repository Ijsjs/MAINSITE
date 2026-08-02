import { Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import AmbientBg from './components/AmbientBg'
import PresenceHeartbeat from './components/PresenceHeartbeat'
import './App.css'

function ProtectedRoute({ children }) {
  const auth = useAuth()
  if (!auth || auth.loading) {
    return (
      <div className="boot">
        <div className="boot-mark">jizer</div>
      </div>
    )
  }
  if (!auth.user) return <Navigate to="/auth" replace />
  return children
}

function PublicOnly({ children }) {
  const auth = useAuth()
  if (!auth || auth.loading) {
    return (
      <div className="boot">
        <div className="boot-mark">jizer</div>
      </div>
    )
  }
  if (auth.user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      <AmbientBg />
      <PresenceHeartbeat />
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicOnly>
                <AuthPage />
              </PublicOnly>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
