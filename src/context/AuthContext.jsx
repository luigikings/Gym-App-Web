import { createContext, useContext, useEffect, useState } from 'react'
import { listUsers } from '../lib/api'

const AuthContext = createContext(null)

// Nota: aquí solo guardamos "quién está logueado en este dispositivo" para
// no pedir la palabra clave cada vez que se recarga la página. Los datos
// reales del usuario (ejercicios, rutinas, historial...) siempre se leen
// de Supabase, nunca de aquí.
const STORAGE_KEY = 'gym-tracker.current-user-id'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY)
    if (!savedId) {
      setLoading(false)
      return
    }
    listUsers()
      .then((users) => {
        const found = users.find((u) => u.id === savedId)
        setUser(found ?? null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  function login(userRecord) {
    localStorage.setItem(STORAGE_KEY, userRecord.id)
    setUser(userRecord)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
