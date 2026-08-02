import { AnimatePresence, motion } from 'framer-motion'

const LINKS = [
  { id: 'top', label: 'Профиль' },
  { id: 'online', label: 'Онлайн' },
  { id: 'questions', label: 'Вопросы' },
]

export default function AdminDrawer({ open, onClose, onlineCount }) {
  const go = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="drawer-backdrop"
            aria-label="Закрыть меню"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            id="admin-drawer"
            className="admin-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="drawer-head">
              <h2>Меню</h2>
              <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Закрыть">
                ✕
              </button>
            </div>

            <div className="drawer-online">
              <span className="online-dot" aria-hidden="true" />
              <div>
                <strong>{onlineCount}</strong>
                <p>сейчас на сайте</p>
              </div>
            </div>

            <nav className="drawer-nav" aria-label="Навигация админа">
              {LINKS.map((link) => (
                <button key={link.id} type="button" onClick={() => go(link.id)}>
                  {link.label}
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
