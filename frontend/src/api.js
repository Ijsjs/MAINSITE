const TOKEN_KEY = 'jizer_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const detail = data.detail
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(', ')
      : detail || 'Ошибка запроса'
    throw new Error(message)
  }

  return data
}

export const api = {
  register: (username, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  login: (username, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request('/api/auth/me'),
  profile: () => request('/api/profile'),
  questions: () => request('/api/questions'),
  ask: (text) =>
    request('/api/questions', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  answer: (id, answer) =>
    request(`/api/questions/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),
  close: (id) =>
    request(`/api/questions/${id}/close`, {
      method: 'POST',
    }),
  heartbeat: () =>
    request('/api/presence/heartbeat', {
      method: 'POST',
    }),
  leave: () =>
    request('/api/presence/leave', {
      method: 'POST',
    }),
  online: () => request('/api/presence/online'),
}
