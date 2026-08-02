import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api'

export default function QuestionModal({ onClose, onAsked }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const q = await api.ask(text.trim())
      onAsked(q)
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-title"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="ask-title">Задать вопрос</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="modal-form">
          <label>
            <span>Ваш вопрос для jizer</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              minLength={5}
              maxLength={2000}
              required
              placeholder="Напишите коротко и по делу…"
              autoFocus
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Отмена
            </button>
            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={pending}
              whileTap={{ scale: 0.98 }}
            >
              {pending ? 'Отправка…' : 'Отправить'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
