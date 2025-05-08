"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState({
    desde: new Date(new Date().setDate(1)).toISOString().split("T")[0], // First day of current month
    hasta: new Date().toISOString().split("T")[0], // Today
  })
  const [ventasData, setVentasData] = useState(null)
  const [productosData, setProductosData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("ventas") // "ventas" or "productos"

  const fetchReportes = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch both reports in parallel
      const [ventasRes, productosRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/reportes/ventas`, {
          params: dateRange,
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/reportes/productos-mas-vendidos`, {
          params: dateRange,
        }),
      ])

      setVentasData(ventasRes.data)
      setProductosData(productosRes.data)
    } catch (err) {
      console.error("Error al cargar reportes:", err)
      setError("No se pudieron cargar los reportes. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { // 👈 Solo para mostrar el primer valor de la fecha
    console.log(productosData)
  }, [productosData])

  useEffect(() => {
    fetchReportes()
  }, []) // Fetch on initial load

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchReportes()
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(value || 0)
  }

  // Calculate percentages for payment methods
  const calculatePercentage = (value) => {
    if (!ventasData || !ventasData.total || ventasData.total === 0) return 0
    return ((value / ventasData.total) * 100).toFixed(1)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Reportes</h2>
      </div>

      {/* Date Range Form */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Seleccionar Rango de Fechas</h3>
        <form onSubmit={handleSubmit} style={styles.dateForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Desde:</label>
            <input
              type="date"
              name="desde"
              value={dateRange.desde}
              onChange={handleDateChange}
              style={styles.dateInput}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Hasta:</label>
            <input
              type="date"
              name="hasta"
              value={dateRange.hasta}
              onChange={handleDateChange}
              style={styles.dateInput}
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Cargando..." : "Generar Reportes"}
          </button>
        </form>
      </div>
      

      {error && <div style={styles.errorMessage}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "ventas" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("ventas")}
        >
          Resumen de Ventas
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "productos" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("productos")}
        >
          Productos Más Vendidos
        </button>
      </div>

      {/* Report Content */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Cargando reportes...</p>
        </div>
      ) : (
        <>
          {/* Ventas Tab */}
          {activeTab === "ventas" && ventasData && (
            <div style={styles.reportSection}>
              <div style={styles.summaryCards}>
                <div style={styles.summaryCard}>
                  <h4 style={styles.summaryTitle}>Ventas Totales</h4>
                  <p style={styles.summaryValue}>{formatCurrency(ventasData.total)}</p>
                </div>
                <div style={styles.summaryCard}>
                  <h4 style={styles.summaryTitle}>IVA Total</h4>
                  <p style={styles.summaryValue}>{formatCurrency(ventasData.iva)}</p>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Ventas por Método de Pago</h3>
                <div style={styles.paymentMethodsContainer}>
                  <div style={styles.paymentMethod}>
                    <div style={styles.paymentMethodHeader}>
                      <h4 style={styles.paymentMethodTitle}>Efectivo</h4>
                      <span style={styles.paymentMethodPercentage}>{calculatePercentage(ventasData.efectivo)}%</span>
                    </div>
                    <div style={styles.progressBarContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${calculatePercentage(ventasData.efectivo)}%`,
                          backgroundColor: "#28a745",
                        }}
                      ></div>
                    </div>
                    <p style={styles.paymentMethodValue}>{formatCurrency(ventasData.efectivo)}</p>
                  </div>

                  <div style={styles.paymentMethod}>
                    <div style={styles.paymentMethodHeader}>
                      <h4 style={styles.paymentMethodTitle}>Tarjeta</h4>
                      <span style={styles.paymentMethodPercentage}>{calculatePercentage(ventasData.tarjeta)}%</span>
                    </div>
                    <div style={styles.progressBarContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${calculatePercentage(ventasData.tarjeta)}%`,
                          backgroundColor: "#007bff",
                        }}
                      ></div>
                    </div>
                    <p style={styles.paymentMethodValue}>{formatCurrency(ventasData.tarjeta)}</p>
                  </div>

                  <div style={styles.paymentMethod}>
                    <div style={styles.paymentMethodHeader}>
                      <h4 style={styles.paymentMethodTitle}>Transferencia</h4>
                      <span style={styles.paymentMethodPercentage}>
                        {calculatePercentage(ventasData.transferencia)}%
                      </span>
                    </div>
                    <div style={styles.progressBarContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${calculatePercentage(ventasData.transferencia)}%`,
                          backgroundColor: "#6f42c1",
                        }}
                      ></div>
                    </div>
                    <p style={styles.paymentMethodValue}>{formatCurrency(ventasData.transferencia)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Productos Tab */}
          {activeTab === "productos" && productosData && (
            <div style={styles.reportSection}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Top 10 Productos Más Vendidos</h3>
                {productosData.length > 0 ? (
                  <>
                    <div style={styles.tableContainer}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Posición</th>
                            <th style={styles.th}>Producto</th>
                            <th style={styles.th}>Cantidad Vendida</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosData.map((producto, index) => (
                            <tr key={producto.id} style={styles.tr}>
                              <td style={styles.td}>{index + 1}</td>
                              <td style={styles.td}>{producto.nombre}</td>
                              <td style={styles.tdNumber}>{producto.total_unidades}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={styles.chartContainer}>
                      {productosData.map((producto, index) => {
                        // Calculate percentage of max value for bar width
                        const maxCantidad = Math.max(...productosData.map((p) => p.total_unidades))
                        const percentage = (producto.total_unidades / maxCantidad) * 100

                        return (
                          <div key={producto.id} style={styles.chartItem}>
                            <div style={styles.chartLabel}>{producto.nombre}</div>
                            <div style={styles.chartBarContainer}>
                              <div
                                style={{
                                  ...styles.chartBar,
                                  width: `${percentage}%`,
                                  backgroundColor: getBarColor(index),
                                }}
                              ></div>
                              <span style={styles.chartValue}>{producto.total_unidades}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div style={styles.emptyState}>No hay datos de productos vendidos en el rango seleccionado.</div>
                )}
              </div>
            </div>
          )}
        </>
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

// Helper function to get different colors for chart bars
function getBarColor(index) {
  const colors = [
    "#007bff", // blue
    "#28a745", // green
    "#fd7e14", // orange
    "#6f42c1", // purple
    "#e83e8c", // pink
    "#17a2b8", // teal
    "#ffc107", // yellow
    "#20c997", // cyan
    "#6610f2", // indigo
    "#dc3545", // red
  ]
  return colors[index % colors.length]
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: "0",
    marginBottom: "15px",
  },
  dateForm: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    alignItems: "flex-end",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: "200px",
  },
  label: {
    fontSize: "14px",
    marginBottom: "6px",
    color: "#495057",
    fontWeight: "500",
  },
  dateInput: {
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
  },
  button: {
    padding: "10px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    height: "40px",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px 15px",
    borderRadius: "4px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  tabs: {
    display: "flex",
    marginBottom: "20px",
    borderBottom: "1px solid #dee2e6",
  },
  tabButton: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    color: "#6c757d",
    transition: "all 0.2s ease",
  },
  activeTab: {
    color: "#007bff",
    borderBottomColor: "#007bff",
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
  reportSection: {
    marginBottom: "30px",
  },
  summaryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#6c757d",
    margin: "0 0 10px 0",
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0",
  },
  paymentMethodsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  paymentMethod: {
    marginBottom: "10px",
  },
  paymentMethodHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  paymentMethodTitle: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#495057",
    margin: "0",
  },
  paymentMethodPercentage: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6c757d",
  },
  progressBarContainer: {
    height: "10px",
    backgroundColor: "#e9ecef",
    borderRadius: "5px",
    overflow: "hidden",
    marginBottom: "5px",
  },
  progressBar: {
    height: "100%",
    borderRadius: "5px",
    transition: "width 0.5s ease",
  },
  paymentMethodValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "5px 0 0 0",
    textAlign: "right",
  },
  tableContainer: {
    overflowX: "auto",
    marginBottom: "30px",
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
  },
  tr: {
    borderBottom: "1px solid #e9ecef",
  },
  td: {
    padding: "12px 15px",
    color: "#212529",
  },
  tdNumber: {
    padding: "12px 15px",
    color: "#212529",
    textAlign: "right",
    fontWeight: "600",
  },
  chartContainer: {
    marginTop: "30px",
  },
  chartItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  chartLabel: {
    width: "150px",
    fontSize: "14px",
    color: "#495057",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginRight: "15px",
  },
  chartBarContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  chartBar: {
    height: "20px",
    borderRadius: "4px",
    transition: "width 0.5s ease",
    minWidth: "20px",
  },
  chartValue: {
    marginLeft: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
  },
  emptyState: {
    textAlign: "center",
    padding: "30px 0",
    color: "#6c757d",
    fontSize: "16px",
  },
}
