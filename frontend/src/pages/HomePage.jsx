import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import QuestionModal from '../components/QuestionModal'
import AdminPanel from '../components/AdminPanel'
import AdminDrawer from '../components/AdminDrawer'
import { formatMsk } from '../utils/time'
import { playNotifySound, unlockAudio } from '../utils/sound'

const statusLabel = {
  open: 'открыт',
  answered: 'отвечен',
  closed: 'закрыт',
}

export default function HomePage() {
  const { user, logout, isAdmin } = useAuth()
  const [profile, setProfile] = useState(null)
  const [questions, setQuestions] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [online, setOnline] = useState({ count: 0, users: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const knownIds = useRef(null)

  const load = async () => {
    setError('')
    try {
      const [p, q] = await Promise.all([api.profile(), api.questions()])
      setProfile(p)
      setQuestions(q)
      knownIds.current = new Set(q.map((item) => item.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  useEffect(() => {
    if (!isAdmin) return undefined

    let alive = true
    const tick = async () => {
      try {
        const data = await api.online()
        if (alive) setOnline(data)
      } catch {
        /* ignore */
      }
    }

    tick()
    const id = setInterval(tick, 10000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return undefined

    let alive = true
    const poll = async () => {
      try {
        const list = await api.questions()
        if (!alive) return

        if (knownIds.current) {
          const fresh = list.filter((q) => !knownIds.current.has(q.id))
          if (fresh.length > 0) {
            unlockAudio()
            playNotifySound()
          }
        }

        knownIds.current = new Set(list.map((q) => q.id))
        setQuestions(list)
      } catch {
        /* ignore */
      }
    }

    const id = setInterval(poll, 4000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [isAdmin])

  const onAsked = (question) => {
    setQuestions((prev) => [question, ...prev])
    setModalOpen(false)
  }

  return (
    <motion.main
      className={`home-page home-compact${isAdmin ? ' home-admin' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <header className="site-header" id="top">
        <motion.div
          className="brand-mark"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          jizer
        </motion.div>
        <div className="header-actions">
          {isAdmin && (
            <span className="online-chip" title="Пользователи онлайн">
              <span className="online-dot" aria-hidden="true" />
              онлайн: {online.count}
            </span>
          )}
          <span className="user-chip">
            {isAdmin ? 'admin' : 'user'} · {user.username}
          </span>
          <ThemeToggle />
          {isAdmin && (
            <button
              type="button"
              className="btn btn-ghost menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-controls="admin-drawer"
            >
              Меню
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>

      <section className="hero hero-compact">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">{profile?.title || 'loading'}</p>
          <h1 className="hero-brand">
            <span className="hero-brand-glow">jizer</span>
          </h1>
          <p className="hero-bio">{profile?.bio}</p>

          {!isAdmin && (
            <motion.button
              type="button"
              className="btn btn-primary hero-cta"
              onClick={() => setModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Задать вопрос
            </motion.button>
          )}
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-plane">
            <div className="hero-scan" />
            <div className="hero-mono">JZ</div>
          </div>
        </motion.div>
      </section>

      {!isAdmin && (
        <div className="user-columns">
          <section className="socials-section" id="socials">
            <h2>Связь</h2>
            <p className="section-lead">Прямые каналы — без лишнего шума.</p>
            <ul className="social-list">
              {(profile?.socials || []).map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <a href={s.url} target="_blank" rel="noreferrer" className="social-link">
                    <span>{s.label}</span>
                    <span className="social-arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </section>

          <section className="questions-section" id="questions">
            <h2>Мои вопросы</h2>
            <p className="section-lead">Статус и ответы появятся здесь.</p>
            {loading && <p className="muted">Загрузка…</p>}
            {error && <p className="form-error">{error}</p>}
            {!loading && questions.length === 0 && (
              <p className="muted">Пока пусто — задайте первый вопрос.</p>
            )}
            <ul className="question-list">
              <AnimatePresence initial={false}>
                {questions.map((q) => (
                  <motion.li
                    key={q.id}
                    className={`question-item status-${q.status}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="question-meta">
                      <span className={`status-pill status-${q.status}`}>
                        {statusLabel[q.status] || q.status}
                      </span>
                      <time dateTime={q.created_at}>{formatMsk(q.created_at)}</time>
                    </div>
                    <p className="question-text">{q.text}</p>
                    {q.answer && (
                      <div className="answer-block">
                        <span className="answer-label">Ответ jizer</span>
                        <p>{q.answer}</p>
                        {q.answered_at && (
                          <time className="answered-time" dateTime={q.answered_at}>
                            {formatMsk(q.answered_at)}
                          </time>
                        )}
                      </div>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        </div>
      )}

      {isAdmin && (
        <section className="online-section" id="online">
          <h2>Онлайн</h2>
          <p className="section-lead">Кто сейчас на сайте.</p>
          <div className="online-stat">
            <span className="online-stat-num">{online.count}</span>
            <span className="online-stat-label">
              {online.count === 1 ? 'человек' : 'человек(а)'} на сайте
            </span>
          </div>
          {online.users?.length > 0 && (
            <ul className="online-users">
              {online.users.map((u) => (
                <li key={u.user_id}>
                  <span className="online-dot" aria-hidden="true" />
                  @{u.username}
                  {u.role === 'admin' ? ' · admin' : ''}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isAdmin && (
        <div id="questions">
          <AdminPanel questions={questions} onUpdated={setQuestions} />
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <QuestionModal onClose={() => setModalOpen(false)} onAsked={onAsked} />
        )}
      </AnimatePresence>

      {isAdmin && (
        <AdminDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onlineCount={online.count}
        />
      )}
    </motion.main>
  )
}
