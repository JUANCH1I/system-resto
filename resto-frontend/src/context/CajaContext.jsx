'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const CajaContext = createContext()

export function CajaProvider({ children }) {
  const [cajaAbierta, setCajaAbierta] = useState(false)
  const [caja, setCaja] = useState(null)
  const [loadingCaja, setLoadingCaja] = useState(true)

  useEffect(() => {
    fetchCaja()
  }, []) // ❗ Solo una vez al montar el componente

  async function fetchCaja() {
    try {
      const res = await axios.get(`${__API_URL__}/cajas/abierta`)
      setCajaAbierta(true)
      setCaja(res.data)
    } catch (error) {
      console.error('Error al verificar caja:', error)
      setCajaAbierta(false)
      setCaja(null)
    } finally {
      setLoadingCaja(false)
    }
  }

  const actualizarEstadoCaja = async () => {
    try {
      const res = await axios.get(`${__API_URL__}/cajas/abierta`)
      setCajaAbierta(true)
      setCaja(res.data)
    } catch (error) {
      console.error('Error al actualizar estado de caja:', error)
      setCajaAbierta(false)
      setCaja(null)
    }
  }

  return (
    <CajaContext.Provider value={{ cajaAbierta, caja, loadingCaja, actualizarEstadoCaja }}>
      {children}
    </CajaContext.Provider>
  )
}

export function useCaja() {
  const context = useContext(CajaContext)
  if (!context) {
    throw new Error('useCaja debe ser usado dentro de un CajaProvider')
  }
  return context
}
