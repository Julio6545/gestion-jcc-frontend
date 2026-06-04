import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [esAdmin, setEsAdmin] = useState(() => localStorage.getItem('esAdmin') === 'true')
  const [usuario, setUsuario] = useState(() => localStorage.getItem('usuario') || '')

  const login = (nombre) => {
    localStorage.setItem('esAdmin', 'true')
    localStorage.setItem('usuario', nombre)
    setEsAdmin(true)
    setUsuario(nombre)
  }

  const logout = () => {
    localStorage.removeItem('esAdmin')
    localStorage.removeItem('usuario')
    setEsAdmin(false)
    setUsuario('')
  }

  return (
    <AuthContext.Provider value={{ esAdmin, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}