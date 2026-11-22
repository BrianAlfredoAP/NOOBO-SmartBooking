const SESSION_KEY = 'noobo-demo-session'

export function readDemoSession() {
  try {
    const saved = window.sessionStorage.getItem(SESSION_KEY)
    if (!saved) return null
    const session = JSON.parse(saved)
    return session?.email && ['PEMINJAM', 'LOGISTIK'].includes(session.role)
      ? { name: session.name, email: session.email, role: session.role.toLowerCase() }
      : null
  } catch {
    return null
  }
}

export function saveDemoSession(sessionUser) {
  const safeUser = { name: sessionUser.name, email: sessionUser.email, role: sessionUser.role.toLowerCase() }
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...safeUser, role: safeUser.role.toUpperCase() }))
  } catch {
    // The in-memory preview session still works if browser storage is unavailable.
  }
  return safeUser
}

export function clearDemoSession() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Continue clearing in-memory state if browser storage is unavailable.
  }
}
