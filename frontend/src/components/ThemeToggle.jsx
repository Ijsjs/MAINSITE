import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      whileTap={{ scale: 0.94 }}
    >
      <span className="theme-toggle-track">
        <motion.span
          className="theme-toggle-thumb"
          animate={{ x: isDark ? 0 : 22 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        />
      </span>
      <span className="theme-toggle-label">{isDark ? 'Тёмная' : 'Светлая'}</span>
    </motion.button>
  )
}
