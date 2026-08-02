import { useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const INTERVAL_MS = 15000

export default function PresenceHeartbeat() {
  const auth = useAuth()
  const user = auth?.user

  useEffect(() => {
    if (!user) return undefined

    let alive = true

    const ping = () => {
      if (!alive) return
      api.heartbeat().catch(() => {})
    }

    ping()
    const id = setInterval(ping, INTERVAL_MS)

    return () => {
      alive = false
      clearInterval(id)
      api.leave().catch(() => {})
    }
  }, [user])

  return null
}
