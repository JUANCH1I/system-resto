// components/LogoutButton.jsx
import { useNavigate } from 'react-router-dom'

export default function LogoutButton({ text = 'Cerrar sesión' }) {
  const navigate = useNavigate()

  const cerrarSesion = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <button
      onClick={cerrarSesion}
      style={{
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {text}
    </button>
  )
}
