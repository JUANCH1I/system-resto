"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function HistorialFacturasPage() {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [ordenarPor, setOrdenarPor] = useState("fecha") // fecha, id, total
  const [ordenAscendente, setOrdenAscendente] = useState(false)

  useEffect(() => {
    cargarFacturas()
  }, [])

  const cargarFacturas = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/facturas`)
      setFacturas(res.data)
    } catch (err) {
      console.error("Error al cargar facturas", err)
      setError("No se pudieron cargar las facturas. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerFactura = (id) => {
    window.open(`/factura/${id}`, "_blank")
  }

  const handleImprimirFactura = (factura) => {
    // Implementación de impresión (podría usar la función existente de imprimirFactura)
    alert(`Imprimiendo factura #${factura.id}`)
  }

  const handleExportarCSV = () => {
    // Implementación básica de exportación a CSV
    const headers = ["ID", "Fecha", "Cliente", "Total"]
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...facturasFiltradas.map((f) =>
          [f.id, new Date(f.fecha).toLocaleString(), f.cliente?.nombre || "Consumidor final", f.total].join(","),
        ),
      ].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `facturas_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtrar y ordenar facturas
  const facturasFiltradas = facturas
    .filter((factura) => {
      const clienteNombre = factura.cliente?.nombre || "Consumidor final"
      const fechaStr = new Date(factura.fecha).toLocaleDateString()
      const idStr = factura.id.toString()

      // Filtro de búsqueda
      const cumpleBusqueda =
        busqueda === "" || clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) || idStr.includes(busqueda)

      // Filtro de fecha
      const cumpleFecha = filtroFecha === "" || fechaStr.includes(filtroFecha)

      return cumpleBusqueda && cumpleFecha
    })
    .sort((a, b) => {
      // Ordenamiento
      let comparacion = 0
      if (ordenarPor === "fecha") {
        comparacion = new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      } else if (ordenarPor === "total") {
        comparacion = a.total - b.total
      } else if (ordenarPor === "id") {
        comparacion = a.id - b.id
      }

      return ordenAscendente ? comparacion : -comparacion
    })

  const toggleOrden = (campo) => {
    if (ordenarPor === campo) {
      setOrdenAscendente(!ordenAscendente)
    } else {
      setOrdenarPor(campo)
      setOrdenAscendente(false)
    }
  }

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr)
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Historial de Facturas</h2>
        <div style={styles.actions}>
          <button style={styles.exportButton} onClick={handleExportarCSV}>
            Exportar a CSV
          </button>
          <button style={styles.refreshButton} onClick={cargarFacturas}>
            Actualizar
          </button>
        </div>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por cliente o número..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.dateFilterContainer}>
          <input
            type="text"
            placeholder="Filtrar por fecha (dd/mm/yyyy)"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Cargando facturas...</p>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.retryButton} onClick={cargarFacturas}>
            Reintentar
          </button>
        </div>
      ) : facturasFiltradas.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No se encontraron facturas con los filtros seleccionados.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th} onClick={() => toggleOrden("id")}>
                  # {ordenarPor === "id" && (ordenAscendente ? "↑" : "↓")}
                </th>
                <th style={styles.th} onClick={() => toggleOrden("fecha")}>
                  Fecha {ordenarPor === "fecha" && (ordenAscendente ? "↑" : "↓")}
                </th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th} onClick={() => toggleOrden("total")}>
                  Total {ordenarPor === "total" && (ordenAscendente ? "↑" : "↓")}
                </th>
                <th style={styles.th}>Método de Pago</th>
                <th style={styles.th}>Estado SRI</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.map((factura) => (
                <tr key={factura.id} style={styles.tr}>
                  <td style={styles.td}>{factura.id}</td>
                  <td style={styles.td}>{formatearFecha(factura.fecha)}</td>
                  <td style={styles.td}>{factura.cedula_ruc || "Consumidor final"}</td>
                  <td style={styles.tdTotal}>${Number(factura.total).toFixed(2)}</td>
                  <td style={styles.td}>
                    {factura.metodo_pago
                      ? Array.isArray(factura.metodo_pago)
                        ? factura.metodo_pago.join(", ")
                        : factura.metodo_pago
                      : "Efectivo"}
                  </td>
                  <td style={styles.td}>{factura.estado_sri}</td>
                   
                  <td style={styles.tdActions}>
                    <button style={styles.viewButton} onClick={() => handleVerFactura(factura.id)}>
                      Ver
                    </button>
                    <button style={styles.printButton} onClick={() => handleImprimirFactura(factura)}>
                      Imprimir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.summary}>
        <p>
          Mostrando {facturasFiltradas.length} de {facturas.length} facturas
        </p>
        <p>Total: ${facturasFiltradas.reduce((sum, factura) => sum + Number(factura.total), 0).toFixed(2)}</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
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
  actions: {
    display: "flex",
    gap: "10px",
  },
  exportButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  refreshButton: {
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
  searchContainer: {
    flex: "1",
    minWidth: "200px",
  },
  searchInput: {
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    width: "100%",
  },
  dateFilterContainer: {
    flex: "1",
    minWidth: "200px",
  },
  dateInput: {
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    width: "100%",
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
  },
  tdTotal: {
    padding: "12px 15px",
    color: "#212529",
    fontWeight: "600",
  },
  tdActions: {
    padding: "8px 15px",
    display: "flex",
    gap: "8px",
  },
  viewButton: {
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  printButton: {
    padding: "6px 12px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 0",
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
  errorContainer: {
    padding: "20px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "6px",
    textAlign: "center",
    marginBottom: "20px",
  },
  errorText: {
    marginBottom: "15px",
  },
  retryButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 0",
    color: "#6c757d",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  summary: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#495057",
  },
}
