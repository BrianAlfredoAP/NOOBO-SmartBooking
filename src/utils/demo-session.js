import { demoUser } from '../data/demo-user.js'

const SESSION_KEY = 'noobo-demo-session'

export function readDemoSession() {
  try {
    const saved = window.sessionStorage.getItem(SESSION_KEY)
    if (!saved) return null
    const session = JSON.parse(saved)
    if (session.name !== demoUser.name || session.email !== demoUser.email || session.role !== demoUser.role) {
      window.sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return { name: demoUser.name, email: demoUser.email, role: demoUser.role }
  } catch {
    return null
  }
}

export function saveDemoSession(sessionUser) {
  const safeUser = { name: sessionUser.name, email: sessionUser.email, role: sessionUser.role }
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
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
