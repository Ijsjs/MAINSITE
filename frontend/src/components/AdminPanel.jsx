import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../api'
import { formatMsk } from '../utils/time'

const statusLabel = {
  open: 'открыт',
  answered: 'отвечен',
  closed: 'закрыт',
}

export default function AdminPanel({ questions, onUpdated }) {
  const [drafts, setDrafts] = useState({})
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('open')

  const filtered = questions.filter((q) => (filter === 'all' ? true : q.status === filter))

  const answer = async (id) => {
    const answerText = (drafts[id] || '').trim()
    if (!answerText) return
    setBusyId(id)
    setError('')
    try {
      const updated = await api.answer(id, answerText)
      onUpdated((prev) => prev.map((q) => (q.id === id ? updated : q)))
      setDrafts((d) => ({ ...d, [id]: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const close = async (id) => {
    setBusyId(id)
    setError('')
    try {
      const updated = await api.close(id)
      onUpdated((prev) => prev.map((q) => (q.id === id ? updated : q)))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-head">
        <div>
          <h2>Панель вопросов</h2>
          <p className="section-lead">Ответьте или закройте обращение. Время — МСК.</p>
        </div>
        <div className="filter-tabs">
          {['open', 'answered', 'closed', 'all'].map((f) => (
            <button
              key={f}
              type="button"
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'все' : statusLabel[f]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <ul className="question-list admin-list">
        <AnimatePresence initial={false}>
          {filtered.map((q) => (
            <motion.li
              key={q.id}
              className={`question-item status-${q.status}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="question-meta">
                <span className={`status-pill status-${q.status}`}>
                  {statusLabel[q.status]}
                </span>
                <span className="author">@{q.author_username}</span>
                <time dateTime={q.created_at}>{formatMsk(q.created_at)}</time>
              </div>
              <p className="question-text">{q.text}</p>

              {q.answer && (
                <div className="answer-block">
                  <span className="answer-label">Ваш ответ</span>
                  <p>{q.answer}</p>
                  {q.answered_at && (
                    <time className="answered-time" dateTime={q.answered_at}>
                      {formatMsk(q.answered_at)}
                    </time>
                  )}
                </div>
              )}

              {q.status === 'open' && (
                <div className="admin-actions">
                  <textarea
                    rows={3}
                    placeholder="Напишите ответ…"
                    value={drafts[q.id] || ''}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                    }
                  />
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-ghost danger"
                      disabled={busyId === q.id}
                      onClick={() => close(q.id)}
                    >
                      Закрыть
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={busyId === q.id || !(drafts[q.id] || '').trim()}
                      onClick={() => answer(q.id)}
                    >
                      Ответить
                    </button>
                  </div>
                </div>
              )}

              {q.status === 'answered' && (
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-ghost danger"
                    disabled={busyId === q.id}
                    onClick={() => close(q.id)}
                  >
                    Закрыть вопрос
                  </button>
                </div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {filtered.length === 0 && <p className="muted">Нет вопросов в этой категории.</p>}
    </section>
  )
}
