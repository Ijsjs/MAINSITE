import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      if (mode === 'login') await login(username, password)
      else await register(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <motion.main
      className="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <header className="auth-top">
        <motion.div
          className="brand-mark"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          jizer
        </motion.div>
        <ThemeToggle />
      </header>

      <div className="auth-stage">
        <motion.div
          className="auth-hero"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">personal space</p>
          <h1 className="auth-title">
            <span className="auth-title-line">вход в</span>
            <span className="auth-title-brand">jizer</span>
          </h1>
          <p className="auth-lead">
            Профиль, соцсети и прямой канал вопросов. Строгий интерфейс — живые анимации.
          </p>
        </motion.div>

        <motion.section
          className="auth-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className={mode === 'login' ? 'active' : ''}
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login')
                setError('')
              }}
            >
              Вход
            </button>
            <button
              type="button"
              role="tab"
              className={mode === 'register' ? 'active' : ''}
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register')
                setError('')
              }}
            >
              Регистрация
            </button>
            <motion.div
              className="auth-tab-indicator"
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{ left: mode === 'login' ? '4px' : '50%' }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              className="auth-form"
              onSubmit={onSubmit}
              initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
              transition={{ duration: 0.28 }}
            >
              <label>
                <span>Никнейм</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="your_name"
                  required
                  minLength={3}
                  maxLength={32}
                  pattern="[a-zA-Z0-9_]+"
                />
              </label>
              <label>
                <span>Пароль</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <motion.button
                type="submit"
                className="btn btn-primary"
                disabled={pending}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
              >
                {pending ? '...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </motion.section>
      </div>
    </motion.main>
  )
}
