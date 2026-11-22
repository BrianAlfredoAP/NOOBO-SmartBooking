import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'
import { clearDemoSession, readDemoSession, saveDemoSession } from '../utils/demo-session.js'
import { apiMe, apiLogout } from '../api/client.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readDemoSession)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!sessionStorage.getItem('noobo-access-token')) {
      setLoading(false)
      return () => { active = false }
    }
    apiMe().then((profile) => {
      if (active) setUser(saveDemoSession({ name: profile.nama, email: profile.email, role: profile.role }))
    }).catch(() => {
      clearDemoSession()
      if (active) setUser(null)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    startDemoSession: (sessionUser) => {
      const safeUser = saveDemoSession(sessionUser)
      setUser(safeUser)
    },
    endDemoSession: async () => {
      await apiLogout().catch(() => {})
      clearDemoSession()
      setUser(null)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

