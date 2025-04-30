// src/components/RequireAuth.jsx
import { Navigate } from 'react-router-dom'

export default function RequireAuth({ children }) {
  const usuario = localStorage.getItem('usuario')

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return children
}
