import { useContext } from 'react'
import { AuthContext } from './AuthContext.js'

// Hook para que cualquier componente acceda a la sesión actual:
// const { usuario, login, logout } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}
