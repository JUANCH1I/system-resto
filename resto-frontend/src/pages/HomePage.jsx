"use client"

import { useNavigate } from "react-router-dom"
import LogoutButton from '../components/CerrarSesionButton'

export default function InicioPage() {
  const navigate = useNavigate()

  const opciones = [
    { label: "Diagrama de Mesas", path: "/mesas/diagrama" },
    { label: "ABM de Mesas", path: "/mesas/abm" },
    { label: "ABM de Productos", path: "/productos" },
    { label: "ABM de Categorías", path: "/categorias" },
    { label: "ABM de Sectores", path: "/sectores" },
    { label: "Control de Caja", path: "/caja" },
    { label: "Historial", path: "/historial" },
    { label: "Clientes", path: "/clientes" },
    { label: "Facturas", path: "/facturas" },
    { label: "Historial de Cajas", path: "/historial-cajas" },
    
  ]

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 20px",
        fontFamily: "system-ui",
      }}
    >
      <LogoutButton />
      <h1 style={{ marginBottom: 40, fontWeight: "bold", color: "black" }}>🍽️ Sistema de Restaurante</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        {opciones.map((opcion) => (
          <button
            key={opcion.path}
            onClick={() => navigate(opcion.path)}
            style={{
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              backgroundColor: "#f8f9fa",
              fontSize: "16px",
              fontWeight: "bold",
              color: "black",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
          >
            {opcion.label}
          </button>
        ))}
      </div>
    </div>
  )
}
