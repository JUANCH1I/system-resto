"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { imprimirCierreCaja } from "../utils/impresion"
import { useCaja } from "../context/CajaContext"

export default function CajaControlPage() {
  const [cajaAbierta, setCajaAbierta] = useState(null)
  const [montoInicial, setMontoInicial] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const {actualizarEstadoCaja} = useCaja()

  // Obtener usuario del localStorage
  const getUserFromLocalStorage = () => {
    try {
      const userStr = localStorage.getItem("usuario")
      if (!userStr) return null
      return JSON.parse(userStr)
    } catch (err) {
      console.error("Error al obtener usuario del localStorage:", err)
      return null
    }
  }

  const user = getUserFromLocalStorage()

  useEffect(() => {
    cargarCaja()
  }, [])

  const cargarCaja = async () => {
    if (!user || !user.id) {
      setError("No se encontró información del usuario. Por favor, inicie sesión nuevamente.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${import.meta.env.VITE_API_URL_PRODUCTION}/cajas/abierta`)
      setCajaAbierta(res.data)
      console.log("Datos de caja:", res.data)
    } catch (err) {
      console.error("Error al cargar caja:", err)
      setCajaAbierta(null)
      if (err.response && err.response.status !== 404) {
        setError("Error al cargar información de la caja. Por favor, intente nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const abrirCaja = async () => {
    if (!montoInicial || Number.parseFloat(montoInicial) < 0) {
      setError("Por favor, ingrese un monto inicial válido.")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await axios.post(`${import.meta.env.VITE_API_URL_PRODUCTION}/cajas/abrir`, {
        usuario_id: user.id,
        monto_inicial: Number.parseFloat(montoInicial),
        observaciones,
      })
      mostrarMensajeExito("Caja abierta correctamente")
      setMontoInicial("")
      setObservaciones("")
      cargarCaja()
      await actualizarEstadoCaja()
    } catch (err) {
      console.error("Error al abrir caja:", err)
      setError("Error al abrir la caja. Por favor, intente nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const cerrarCaja = async () => {
    if (!confirm("¿Está seguro que desea cerrar la caja? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const res = await axios.post(`${import.meta.env.VITE_API_URL_PRODUCTION}/cajas/cerrar`, {
        id: cajaAbierta.id,
        observaciones,
      })

      // Preparar datos para la impresión
      const datosImpresion = {
        ...res.data,
        total: cajaAbierta.ventas.total,
        efectivo: cajaAbierta.ventas.efectivo,
        tarjeta: cajaAbierta.ventas.tarjeta,
        transferencia: cajaAbierta.ventas.transferencia,
        usuario_nombre: user.nombre || user.username,
      }

      imprimirCierreCaja(datosImpresion)
      mostrarMensajeExito("Caja cerrada correctamente")
      setObservaciones("")
      cargarCaja()
    } catch (err) {
      console.error("Error al cerrar caja:", err)
      setError("Error al cerrar la caja. Por favor, intente nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const mostrarMensajeExito = (mensaje) => {
    setSuccessMessage(mensaje)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // Formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(valor || 0)
  }

  // Calcular tiempo transcurrido desde la apertura
  const calcularTiempoTranscurrido = () => {
    if (!cajaAbierta || !cajaAbierta.fecha_apertura) return "—"

    const apertura = new Date(cajaAbierta.fecha_apertura)
    const ahora = new Date()
    const diff = ahora - apertura

    const horas = Math.floor(diff / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${horas}h ${minutos}m`
  }

  // Calcular porcentaje para gráficos
  const calcularPorcentaje = (valor, total) => {
    if (!total || total === 0) return 0
    return (valor / total) * 100
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Control de Caja</h2>
        {cajaAbierta && (
          <span style={styles.statusBadge}>
            <span style={styles.statusDot}></span>
            Caja Abierta
          </span>
        )}
      </div>

      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Cargando información de la caja...</p>
        </div>
      ) : !user ? (
        <div style={styles.errorMessage}>
          No se encontró información del usuario. Por favor, inicie sesión nuevamente.
        </div>
      ) : cajaAbierta ? (
        <div style={styles.content}>
          {/* Panel principal con información de la caja */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Información de Caja</h3>
              <div style={styles.cardBadge}>ID: {cajaAbierta.id}</div>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Apertura</div>
                  <div style={styles.infoValue}>{new Date(cajaAbierta.fecha_apertura).toLocaleString()}</div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Tiempo Abierta</div>
                  <div style={styles.infoValue}>{calcularTiempoTranscurrido()}</div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Monto Inicial</div>
                  <div style={styles.infoValue}>{formatearMoneda(cajaAbierta.monto_inicial)}</div>
                </div>

                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Usuario</div>
                  <div style={styles.infoValue}>{user.nombre || user.username || user.id}</div>
                </div>
              </div>

              {cajaAbierta.observaciones && (
                <div style={styles.observacionesContainer}>
                  <div style={styles.observacionesLabel}>Observaciones:</div>
                  <div style={styles.observacionesText}>{cajaAbierta.observaciones}</div>
                </div>
              )}
            </div>
          </div>

          {/* Panel de ventas */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Resumen de Ventas</h3>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.totalVentas}>
                <span>Total Facturado:</span>
                <span style={styles.totalVentasValue}>{formatearMoneda(cajaAbierta.ventas?.total || 0)}</span>
              </div>

              <div style={styles.ventasDesglose}>
                {/* Gráfico de barras para métodos de pago */}
                <div style={styles.metodosContainer}>
                  <div style={styles.metodoItem}>
                    <div style={styles.metodoHeader}>
                      <span style={styles.metodoLabel}>Efectivo</span>
                      <span style={styles.metodoValue}>{formatearMoneda(cajaAbierta.ventas?.efectivo || 0)}</span>
                    </div>
                    <div style={styles.metodoBarContainer}>
                      <div
                        style={{
                          ...styles.metodoBar,
                          width: `${calcularPorcentaje(cajaAbierta.ventas?.efectivo || 0, cajaAbierta.ventas?.total || 0)}%`,
                          backgroundColor: "#28a745",
                        }}
                      />
                    </div>
                    <div style={styles.metodoPorcentaje}>
                      {calcularPorcentaje(cajaAbierta.ventas?.efectivo || 0, cajaAbierta.ventas?.total || 0).toFixed(1)}
                      %
                    </div>
                  </div>

                  <div style={styles.metodoItem}>
                    <div style={styles.metodoHeader}>
                      <span style={styles.metodoLabel}>Tarjeta</span>
                      <span style={styles.metodoValue}>{formatearMoneda(cajaAbierta.ventas?.tarjeta || 0)}</span>
                    </div>
                    <div style={styles.metodoBarContainer}>
                      <div
                        style={{
                          ...styles.metodoBar,
                          width: `${calcularPorcentaje(cajaAbierta.ventas?.tarjeta || 0, cajaAbierta.ventas?.total || 0)}%`,
                          backgroundColor: "#007bff",
                        }}
                      />
                    </div>
                    <div style={styles.metodoPorcentaje}>
                      {calcularPorcentaje(cajaAbierta.ventas?.tarjeta || 0, cajaAbierta.ventas?.total || 0).toFixed(1)}%
                    </div>
                  </div>

                  <div style={styles.metodoItem}>
                    <div style={styles.metodoHeader}>
                      <span style={styles.metodoLabel}>Transferencia</span>
                      <span style={styles.metodoValue}>{formatearMoneda(cajaAbierta.ventas?.transferencia || 0)}</span>
                    </div>
                    <div style={styles.metodoBarContainer}>
                      <div
                        style={{
                          ...styles.metodoBar,
                          width: `${calcularPorcentaje(cajaAbierta.ventas?.transferencia || 0, cajaAbierta.ventas?.total || 0)}%`,
                          backgroundColor: "#6f42c1",
                        }}
                      />
                    </div>
                    <div style={styles.metodoPorcentaje}>
                      {calcularPorcentaje(
                        cajaAbierta.ventas?.transferencia || 0,
                        cajaAbierta.ventas?.total || 0,
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>

                {/* Gráfico circular */}
                <div style={styles.pieChartContainer}>
                  <div style={styles.pieChart}>
                    <div
                      style={{
                        ...styles.pieSlice,
                        backgroundColor: "#28a745",
                        transform: `rotate(0deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((2 * Math.PI * calcularPorcentaje(cajaAbierta.ventas?.efectivo || 0, cajaAbierta.ventas?.total || 0)) / 100)}% ${50 - 50 * Math.sin((2 * Math.PI * calcularPorcentaje(cajaAbierta.ventas?.efectivo || 0, cajaAbierta.ventas?.total || 0)) / 100)}%, 50% 50%)`,
                      }}
                    ></div>
                    <div
                      style={{
                        ...styles.pieSlice,
                        backgroundColor: "#007bff",
                        transform: `rotate(${3.6 * calcularPorcentaje(cajaAbierta.ventas?.efectivo || 0, cajaAbierta.ventas?.total || 0)}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((2 * Math.PI * calcularPorcentaje(cajaAbierta.ventas?.tarjeta || 0, cajaAbierta.ventas?.total || 0)) / 100)}% ${50 - 50 * Math.sin((2 * Math.PI * calcularPorcentaje(cajaAbierta.ventas?.tarjeta || 0, cajaAbierta.ventas?.total || 0)) / 100)}%, 50% 50%)`,
                      }}
                    ></div>
                    <div
                      style={{
                        ...styles.pieSlice,
                        backgroundColor: "#6f42c1",
                        transform: `rotate(${3.6 * (calcularPorcentaje(cajaAbierta.ventas?.efectivo || 0, cajaAbierta.ventas?.total || 0) + calcularPorcentaje(cajaAbierta.ventas?.tarjeta || 0, cajaAbierta.ventas?.total || 0))}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 50%)`,
                      }}
                    ></div>
                  </div>
                  <div style={styles.pieLegend}>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, backgroundColor: "#28a745" }}></div>
                      <span>Efectivo</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, backgroundColor: "#007bff" }}></div>
                      <span>Tarjeta</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, backgroundColor: "#6f42c1" }}></div>
                      <span>Transferencia</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.balanceContainer}>
                <div style={styles.balanceItem}>
                  <div style={styles.balanceLabel}>Monto Inicial</div>
                  <div style={styles.balanceValue}>{formatearMoneda(cajaAbierta.monto_inicial)}</div>
                </div>
                <div style={styles.balanceOperator}>+</div>
                <div style={styles.balanceItem}>
                  <div style={styles.balanceLabel}>Ventas</div>
                  <div style={styles.balanceValue}>{formatearMoneda(cajaAbierta.ventas?.total || 0)}</div>
                </div>
                <div style={styles.balanceOperator}>=</div>
                <div style={styles.balanceItem}>
                  <div style={styles.balanceLabel}>Total Esperado</div>
                  <div style={{ ...styles.balanceValue, fontWeight: "bold" }}>
                    {formatearMoneda(Number(cajaAbierta.monto_inicial) + Number(cajaAbierta.ventas?.total || 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de cierre de caja */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Cerrar Caja</h3>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Observaciones:</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  style={styles.textarea}
                  placeholder="Ingrese observaciones (opcional)"
                />
              </div>

              <div style={styles.alertInfo}>
                <div style={styles.alertIcon}>ℹ️</div>
                <div style={styles.alertText}>
                  Al cerrar la caja, se calculará automáticamente el monto final sumando el monto inicial y todas las
                  ventas registradas.
                </div>
              </div>

              <button
                onClick={cerrarCaja}
                style={{
                  ...styles.button,
                  ...styles.closeButton,
                  ...(submitting ? styles.buttonDisabled : {}),
                }}
                disabled={submitting}
              >
                {submitting ? "Procesando..." : "Cerrar Caja"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.content}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Abrir Nueva Caja</h3>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>
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
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
                <p style={styles.emptyStateText}>No hay una caja abierta actualmente.</p>
                <p style={styles.emptyStateSubtext}>Complete el formulario para abrir una nueva caja.</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Monto inicial:</label>
                <input
                  type="number"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  style={styles.input}
                  placeholder="Ingrese el monto inicial"
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Observaciones:</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  style={styles.textarea}
                  placeholder="Ingrese observaciones (opcional)"
                />
              </div>

              <button
                onClick={abrirCaja}
                style={{
                  ...styles.button,
                  ...styles.openButton,
                  ...(submitting ? styles.buttonDisabled : {}),
                }}
                disabled={submitting}
              >
                {submitting ? "Procesando..." : "Abrir Caja"}
              </button>
            </div>
          </div>
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
    maxWidth: "900px",
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
  statusBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#28a745",
    borderRadius: "50%",
    marginRight: "8px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "15px 20px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0",
  },
  cardBadge: {
    backgroundColor: "#e9ecef",
    color: "#495057",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },
  cardBody: {
    padding: "20px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "15px",
  },
  infoItem: {
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "5px",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#212529",
  },
  observacionesContainer: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  },
  observacionesLabel: {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "5px",
  },
  observacionesText: {
    fontSize: "14px",
    color: "#212529",
  },
  totalVentas: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "16px",
    color: "#212529",
  },
  totalVentasValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#28a745",
  },
  ventasDesglose: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
    marginBottom: "20px",
  },
  metodosContainer: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  metodoItem: {
    marginBottom: "5px",
  },
  metodoHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  metodoLabel: {
    fontSize: "14px",
    color: "#495057",
  },
  metodoValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#212529",
  },
  metodoBarContainer: {
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "5px",
  },
  metodoBar: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
  metodoPorcentaje: {
    fontSize: "12px",
    color: "#6c757d",
    textAlign: "right",
  },
  pieChartContainer: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  pieChart: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#e9ecef",
    marginBottom: "15px",
  },
  pieSlice: {
    position: "absolute",
    width: "100%",
    height: "100%",
    transformOrigin: "50% 50%",
  },
  pieLegend: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#495057",
  },
  legendColor: {
    width: "12px",
    height: "12px",
    borderRadius: "3px",
  },
  balanceContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    flexWrap: "wrap",
  },
  balanceItem: {
    textAlign: "center",
    minWidth: "100px",
  },
  balanceLabel: {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "5px",
  },
  balanceValue: {
    fontSize: "16px",
    color: "#212529",
  },
  balanceOperator: {
    fontSize: "20px",
    color: "#6c757d",
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    transition: "border-color 0.2s",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    transition: "border-color 0.2s",
    outline: "none",
    resize: "vertical",
  },
  alertInfo: {
    display: "flex",
    gap: "10px",
    padding: "12px 15px",
    backgroundColor: "#cce5ff",
    color: "#004085",
    borderRadius: "4px",
    marginBottom: "15px",
    fontSize: "14px",
  },
  alertIcon: {
    fontSize: "18px",
  },
  alertText: {
    flex: "1",
  },
  button: {
    width: "100%",
    padding: "12px 20px",
    borderRadius: "4px",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: "10px",
  },
  openButton: {
    backgroundColor: "#28a745",
    color: "white",
  },
  closeButton: {
    backgroundColor: "#dc3545",
    color: "white",
  },
  buttonDisabled: {
    opacity: "0.65",
    cursor: "not-allowed",
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
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "12px 15px",
    borderRadius: "4px",
    marginBottom: "20px",
    fontSize: "14px",
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
    padding: "30px 0",
    color: "#6c757d",
    marginBottom: "20px",
  },
  emptyStateIcon: {
    color: "#6c757d",
    marginBottom: "15px",
  },
  emptyStateText: {
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "5px",
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: "14px",
    color: "#6c757d",
    textAlign: "center",
  },
}
