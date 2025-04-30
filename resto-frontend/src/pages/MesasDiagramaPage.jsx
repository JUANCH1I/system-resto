'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useCaja } from '../context/CajaContext'

export default function MesasDiagramaPage() {
  const { cajaAbierta, loadingCaja } = useCaja()

  const [mesas, setMesas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sectorActivo, setSectorActivo] = useState('Todos')
  const sectores = ['Todos', ...new Set(mesas.map((m) => m.sector))]
  const mesasFiltradas =
    sectorActivo === 'Todos'
      ? mesas
      : mesas.filter((m) => m.sector === sectorActivo)

  const navigate = useNavigate()

  useEffect(() => {
    if (!loadingCaja && !cajaAbierta) {
      alert('Debe abrir una caja para ver las mesas.')
      navigate('/caja')
    }
  }, [loadingCaja, cajaAbierta])

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${import.meta.env.VITE_API_URL}/mesas`)
      .then((res) => {
        setMesas(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error al cargar mesas:', err)
        setError(
          'No se pudieron cargar las mesas. Por favor, intente nuevamente.'
        )
        setLoading(false)
      })
  }, [])

  const getColor = (estado) => {
    switch (estado) {
      case 'libre':
        return { bg: '#d4edda', border: '#c3e6cb', text: '#155724' }
      case 'ocupada':
        return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
      case 'esperando':
        return { bg: '#fff3cd', border: '#ffeeba', text: '#856404' }
      case 'reservada':
        return { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
      default:
        return { bg: '#f8f9fa', border: '#e9ecef', text: '#495057' }
    }
  }

  const getIcon = (estado) => {
    switch (estado) {
      case 'libre':
        return '✓'
      case 'ocupada':
        return '✗'
      case 'esperando':
        return '⏱'
      case 'reservada':
        return '📅'
      default:
        return '?'
    }
  }

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#2c3e50',
      margin: '0',
    },
    legend: {
      display: 'flex',
      gap: '15px',
      flexWrap: 'wrap',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
    },
    legendColor: (color) => ({
      width: '16px',
      height: '16px',
      borderRadius: '4px',
      backgroundColor: color.bg,
      border: `1px solid ${color.border}`,
      marginRight: '6px',
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '20px',
    },
    mesa: (color) => ({
      backgroundColor: color.bg,
      border: `2px solid ${color.border}`,
      borderRadius: '8px',
      padding: '15px',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden',
    }),
  
    mesaNumero: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#2c3e50',
    },
    mesaEstado: (color) => ({
      fontSize: '14px',
      color: color.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    }),
    mesaIcon: (color) => ({
      position: 'absolute',
      top: '10px',
      right: '10px',
      fontSize: '16px',
      color: color.text,
      opacity: '0.7',
    }),
    mesaCapacidad: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '10px',
      fontSize: '14px',
      color: '#6c757d',
    },
    personIcon: {
      marginRight: '5px',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '300px',
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderLeft: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    errorContainer: {
      padding: '20px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderRadius: '8px',
      textAlign: 'center',
    },
    actionButton: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      marginTop: '10px',
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  }

  // Agrupar mesas por zona (si existe la propiedad)
  const mesasPorZona = mesas.reduce((acc, mesa) => {
    const zona = mesa.zona || 'Sin zona'
    if (!acc[zona]) {
      acc[zona] = []
    }
    acc[zona].push(mesa)
    return acc
  }, {})

  if (loading || loadingCaja) {
    return (
      <div style={styles.loadingContainer}>
        <div
          style={{
            ...styles.loadingSpinner,
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
        </style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>{error}</p>
        <button
          style={styles.actionButton}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Diagrama de Mesas</h2>
        <div style={styles.legend}>
          {['libre', 'ocupada', 'esperando', 'reservada'].map((estado) => {
            const color = getColor(estado)
            return (
              <div key={estado} style={styles.legendItem}>
                <div style={styles.legendColor(color)} />
                <span
                  style={{ color: color.text, textTransform: 'capitalize' }}
                >
                  {estado}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {sectores.map((sector) => (
          <button
            key={sector}
            onClick={() => setSectorActivo(sector)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #ccc',
              backgroundColor: sector === sectorActivo ? '#007bff' : '#f8f9fa',
              color: sector === sectorActivo ? '#fff' : '#343a40',
              cursor: 'pointer',
            }}
          >
            {sector}
          </button>
        ))}
      </div>

      {Object.keys(
        mesasFiltradas.reduce((acc, m) => {
          const z = m.zona || 'Sin zona'
          acc[z] = [...(acc[z] || []), m]
          return acc
        }, {})
      ).length > 1 ? (
        Object.entries(
          mesasFiltradas.reduce((acc, m) => {
            const z = m.zona || 'Sin zona'
            acc[z] = [...(acc[z] || []), m]
            return acc
          }, {})
        ).map(([zona, mesasZona]) => (
          <div key={zona} style={{ marginBottom: '30px' }}>
            <h3
              style={{
                fontSize: '18px',
                marginBottom: '15px',
                color: '#495057',
              }}
            >
              {zona}
            </h3>
            <div style={styles.grid}>
              {mesasZona.map((mesa) => {
                const colorScheme = getColor(mesa.estado)
                return (
                  <div
                    key={mesa.id}
                    style={styles.mesa(colorScheme)}
                    onClick={() => navigate(`/comanda/${mesa.id}?nombre=${mesa.nombre}`)}
                    onMouseOver={(e) => {
                      Object.assign(e.currentTarget.style)
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow =
                        '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={styles.mesaIcon(colorScheme)}>
                      {getIcon(mesa.estado)}
                    </div>
                    <div style={styles.mesaNumero}>{mesa.nombre}</div>
                    <div style={styles.mesaEstado(colorScheme)}>
                      {mesa.estado}
                    </div>
                    {mesa.capacidad && (
                      <div style={styles.mesaCapacidad}>
                        <span style={styles.personIcon}>👤</span>
                        {mesa.capacidad}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      ) : (
        // Si no hay zonas, mostrar todas las mesas juntas
        <div style={styles.grid}>
          {mesasFiltradas.map((mesa) => {
            const colorScheme = getColor(mesa.estado)
            return (
              <div
                key={mesa.id}
                style={styles.mesa(colorScheme)}
                onClick={() => navigate(`/comanda/${mesa.id}?nombre=${mesa.nombre}`)}
                onMouseOver={(e) => {
                  Object.assign(e.currentTarget.style, styles.mesaHover)
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={styles.mesaIcon(colorScheme)}>
                  {getIcon(mesa.estado)}
                </div>
                <div style={styles.mesaNumero}>{mesa.nombre}</div>
                <div style={styles.mesaEstado(colorScheme)}>{mesa.estado}</div>
                {mesa.capacidad && (
                  <div style={styles.mesaCapacidad}>
                    <span style={styles.personIcon}>👤</span>
                    {mesa.capacidad}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {mesas.length === 0 && (
        <div
          style={{ textAlign: 'center', padding: '40px 0', color: '#6c757d' }}
        >
          <p>No hay mesas configuradas en el sistema.</p>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/mesas/abm')}
          >
            Configurar mesas
          </button>
        </div>
      )}
    </div>
  )
}
