import { createContext } from 'react'

// Solo el contexto en sí — el componente que lo provee vive en
// AuthProvider.jsx, y el hook para consumirlo en useAuth.js.
export const AuthContext = createContext(null)
