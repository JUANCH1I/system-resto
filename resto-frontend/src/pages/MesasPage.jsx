import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function MesasPage() {
  const [mesas, setMesas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL_PRODUCTION}/mesas`).then((res) => {
      setMesas(res.data)
    })
  }, [])

  const getColor = (estado) => {
    switch (estado) {
      case 'libre': return '#d4edda'
      case 'ocupada': return '#f8d7da'
      case 'esperando': return '#fff3cd'
      case 'reservada': return '#d1ecf1'
      default: return '#f0f0f0'
    }
  }

  return (
    <div>
      <h2>Mesas</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            style={{
              backgroundColor: getColor(mesa.estado),
              padding: '20px',
              width: '100px',
              height: '100px',
              textAlign: 'center',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
            onClick={() => navigate(`/comanda/${mesa.id}`)}
          >
            <strong>{mesa.nombre}</strong>
            <br />
            <small>{mesa.estado}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
