"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function HistorialCajasPage() {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [ordenarPor, setOrdenarPor] = useState("fecha_apertura") // fecha_apertura, fecha_cierre, monto_final
  const [ordenAscendente, setOrdenAscendente] = useState(false)

  useEffect(() => {
    fetchHistorial()
  }, [])

  const fetchHistorial = async () => {
    setLoading(true)
    setError(null)

    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"))
      if (!usuario?.id) {
        setError("No se encontró información del usuario. Por favor, inicie sesión nuevamente.")
        setLoading(false)
        return
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/cajas/historial/${usuario.id}`)
      setHistorial(res.data)
    } catch (err) {
      console.error("Error al obtener historial de cajas", err)
      setError("No se pudo cargar el historial de cajas. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "—"
    const fecha = new Date(fechaStr)
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha)
  }

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "abierta":
        return { bg: "#d4edda", text: "#155724" }
      case "cerrada":
        return { bg: "#f8d7da", text: "#721c24" }
      default:
        return { bg: "#e9ecef", text: "#495057" }
    }
  }

  const toggleOrden = (campo) => {
    if (ordenarPor === campo) {
      setOrdenAscendente(!ordenAscendente)
    } else {
      setOrdenarPor(campo)
      setOrdenAscendente(true)
    }
  }

  // Filtrar y ordenar el historial
  const historialFiltrado = historial
    .filter((caja) => {
      // Filtro por estado
      if (filtroEstado !== "todos" && caja.estado?.toLowerCase() !== filtroEstado) {
        return false
      }

      // Filtro por fecha
      if (filtroFecha) {
        const fechaApertura = new Date(caja.fecha_apertura).toLocaleDateString()
        const fechaCierre = caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleDateString() : ""
        return fechaApertura.includes(filtroFecha) || fechaCierre.includes(filtroFecha)
      }

      return true
    })
    .sort((a, b) => {
      // Ordenamiento
      let valorA, valorB

      switch (ordenarPor) {
        case "fecha_apertura":
          valorA = new Date(a.fecha_apertura).getTime()
          valorB = new Date(b.fecha_apertura).getTime()
          break
        case "fecha_cierre":
          valorA = a.fecha_cierre ? new Date(a.fecha_cierre).getTime() : 0
          valorB = b.fecha_cierre ? new Date(b.fecha_cierre).getTime() : 0
          break
        case "monto_final":
          valorA = a.monto_final || 0
          valorB = b.monto_final || 0
          break
        default:
          valorA = new Date(a.fecha_apertura).getTime()
          valorB = new Date(b.fecha_apertura).getTime()
      }

      return ordenAscendente ? valorA - valorB : valorB - valorA
    })

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Historial de Cajas</h2>
        <button style={styles.refreshButton} onClick={fetchHistorial}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "6px" }}
          >
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          Actualizar
        </button>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Estado:</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={styles.filterSelect}>
            <option style={styles.filterOption} value="todos">
              Todos
            </option>
            <option style={styles.filterOption} value="abierta">
              Abierta
            </option>
            <option style={styles.filterOption} value="cerrada">
              Cerrada
            </option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Fecha:</label>
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            style={styles.filterInput}
          />
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Cargando historial de cajas...</p>
        </div>
      ) : historialFiltrado.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th} onClick={() => toggleOrden("fecha_apertura")} title="Haga clic para ordenar">
                  Fecha Apertura {ordenarPor === "fecha_apertura" && (ordenAscendente ? "↑" : "↓")}
                </th>
                <th style={styles.th} onClick={() => toggleOrden("fecha_cierre")} title="Haga clic para ordenar">
                  Fecha Cierre {ordenarPor === "fecha_cierre" && (ordenAscendente ? "↑" : "↓")}
                </th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th} onClick={() => toggleOrden("monto_final")} title="Haga clic para ordenar">
                  Monto Final {ordenarPor === "monto_final" && (ordenAscendente ? "↑" : "↓")}
                </th>
                <th style={styles.th}>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {historialFiltrado.map((caja, index) => {
                const estadoColor = getEstadoColor(caja.estado)
                return (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{formatearFecha(caja.fecha_apertura)}</td>
                    <td style={styles.td}>{formatearFecha(caja.fecha_cierre)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.estadoBadge,
                          backgroundColor: estadoColor.bg,
                          color: estadoColor.text,
                        }}
                      >
                        {caja.estado || "Desconocido"}
                      </span>
                    </td>
                    <td style={styles.tdMonto}>{caja.monto_final ? `$${Number(caja.monto_final).toFixed(2)}` : "—"}</td>
                    <td style={styles.td}>
                      <div style={styles.observacionesContainer}>
                        {caja.observaciones || <span style={styles.noData}>Sin observaciones</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#6c757d", marginBottom: "15px" }}
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
          <p style={styles.emptyStateText}>No se encontraron registros de cajas</p>
          <p style={styles.emptyStateSubtext}>
            {filtroEstado !== "todos" || filtroFecha
              ? "Pruebe a cambiar los filtros de búsqueda"
              : "Aún no hay registros de apertura o cierre de caja"}
          </p>
        </div>
      )}

      {historialFiltrado.length > 0 && (
        <div style={styles.summary}>
          <p>
            Mostrando {historialFiltrado.length} de {historial.length} registros
          </p>
        </div>
      )}

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

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0",
  },
  refreshButton: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  filters: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    backgroundColor: "#fff",
    color: "#495057",
    minWidth: "120px",
  },
  filterOption: {
    backgroundColor: "#fff",
    color: "#495057",
  },
  filterInput: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    width: "120px",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    backgroundColor: "#f8f9fa",
    color: "#495057",
    textAlign: "left",
    padding: "12px 15px",
    borderBottom: "2px solid #dee2e6",
    fontWeight: "600",
    cursor: "pointer",
    userSelect: "none",
  },
  tr: {
    borderBottom: "1px solid #e9ecef",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "12px 15px",
    color: "#212529",
    verticalAlign: "middle",
  },
  tdMonto: {
    padding: "12px 15px",
    color: "#212529",
    fontWeight: "600",
    verticalAlign: "middle",
  },
  estadoBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  observacionesContainer: {
    maxWidth: "300px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  noData: {
    color: "#6c757d",
    fontStyle: "italic",
    fontSize: "13px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderLeft: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "15px",
  },
  loadingText: {
    color: "#6c757d",
    fontSize: "16px",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px 15px",
    borderRadius: "4px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    color: "#6c757d",
  },
  emptyStateText: {
    fontSize: "18px",
    fontWeight: "500",
    margin: "0 0 8px 0",
  },
  emptyStateSubtext: {
    fontSize: "14px",
    margin: "0",
    textAlign: "center",
  },
  summary: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "15px",
    fontSize: "14px",
    color: "#6c757d",
  },
}
