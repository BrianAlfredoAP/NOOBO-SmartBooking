import { useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'
import { clearDemoSession, readDemoSession, saveDemoSession } from '../utils/demo-session.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readDemoSession)

  const value = useMemo(() => ({
    user,
    startDemoSession: (sessionUser) => {
      const safeUser = saveDemoSession(sessionUser)
      setUser(safeUser)
    },
    endDemoSession: () => {
      clearDemoSession()
      setUser(null)
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

