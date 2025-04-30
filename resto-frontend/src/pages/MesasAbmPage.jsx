"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function MesasAbmPage() {
  const [mesas, setMesas] = useState([])
  const [form, setForm] = useState({ nombre: "", sector: "", capacidad: "" })
  const [editandoId, setEditandoId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  const fetchMesas = async () => {
    setLoadingData(true)
    setError(null)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/mesas`)
      setMesas(res.data)
    } catch (err) {
      console.error("Error al cargar mesas:", err)
      setError("No se pudieron cargar las mesas. Por favor, intente nuevamente.")
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchMesas()
  }, [])

  const resetForm = () => {
    setForm({ nombre: "", sector: "", capacidad: "" })
    setEditandoId(null)
  }

  const showSuccessMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!form.nombre) {
        throw new Error("El nombre de la mesa es obligatorio")
      }

      if (editandoId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/mesas/${editandoId}`, form)
        showSuccessMessage("Mesa actualizada correctamente")
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/mesas`, form)
        showSuccessMessage("Mesa creada correctamente")
      }

      resetForm()
      fetchMesas()
    } catch (err) {
      console.error("Error al guardar mesa:", err)
      setError(err.message || "Error al guardar la mesa. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (mesa) => {
    setForm({
      nombre: mesa.nombre || "",
      sector: mesa.sector || "",
      capacidad: mesa.capacidad || "",
    })
    setEditandoId(mesa.id)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro que desea eliminar esta mesa?")) {
      setLoading(true)
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/mesas/${id}`)
        showSuccessMessage("Mesa eliminada correctamente")
        fetchMesas()
      } catch (err) {
        console.error("Error al eliminar mesa:", err)
        setError("No se pudo eliminar la mesa. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancel = () => {
    resetForm()
  }

  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "600",
      color: "#2c3e50",
      margin: "0",
    },
    formContainer: {
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "30px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    formTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "20px",
      color: "#2c3e50",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontSize: "14px",
      marginBottom: "6px",
      color: "#495057",
      fontWeight: "500",
    },
    input: {
      padding: "10px 12px",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "14px",
      transition: "border-color 0.2s",
      outline: "none",
    },
    inputFocus: {
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
    },
    button: (primary = true) => ({
      padding: "10px 16px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: primary ? "#007bff" : "#6c757d",
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s",
    }),
    buttonHover: (primary = true) => ({
      backgroundColor: primary ? "#0069d9" : "#5a6268",
    }),
    buttonDisabled: {
      opacity: 0.65,
      cursor: "not-allowed",
    },
    tableContainer: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px",
    },
    tableHeader: {
      backgroundColor: "#f8f9fa",
      color: "#495057",
      textAlign: "left",
      padding: "12px 15px",
      borderBottom: "2px solid #dee2e6",
      fontWeight: "600",
    },
    tableCell: {
      padding: "12px 15px",
      borderBottom: "1px solid #dee2e6",
      color: "#212529",
    },
    tableRow: {
      transition: "background-color 0.2s",
    },
    tableRowHover: {
      backgroundColor: "#f8f9fa",
    },
    actionButton: (color) => ({
      padding: "6px 10px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: color === "edit" ? "#17a2b8" : "#dc3545",
      color: "white",
      fontSize: "12px",
      marginRight: "5px",
      cursor: "pointer",
    }),
    badge: (estado) => {
      const colors = {
        libre: { bg: "#d4edda", text: "#155724" },
        ocupada: { bg: "#f8d7da", text: "#721c24" },
        esperando: { bg: "#fff3cd", text: "#856404" },
        reservada: { bg: "#d1ecf1", text: "#0c5460" },
      }
      const color = colors[estado] || { bg: "#e9ecef", text: "#495057" }
      return {
        backgroundColor: color.bg,
        color: color.text,
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "500",
        display: "inline-block",
        textTransform: "capitalize",
      }
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    },
    loadingSpinner: {
      width: "40px",
      height: "40px",
      border: "4px solid rgba(0, 0, 0, 0.1)",
      borderLeft: "4px solid #3498db",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    errorMessage: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "12px 15px",
      borderRadius: "4px",
      marginBottom: "20px",
    },
    successMessage: {
      backgroundColor: "#d4edda",
      color: "#155724",
      padding: "12px 15px",
      borderRadius: "4px",
      marginBottom: "20px",
    },
    emptyState: {
      textAlign: "center",
      padding: "40px 0",
      color: "#6c757d",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Administrar Mesas</h2>
      </div>

      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.formContainer}>
        <h3 style={styles.formTitle}>{editandoId ? "Editar Mesa" : "Agregar Nueva Mesa"}</h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="nombre">
                Nombre*
              </label>
              <input
                id="nombre"
                style={styles.input}
                placeholder="Ej: Mesa 1"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="sector">
                Sector
              </label>
              <input
                id="sector"
                style={styles.input}
                placeholder="Ej: Terraza"
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="capacidad">
                Capacidad
              </label>
              <input
                id="capacidad"
                style={styles.input}
                placeholder="Ej: 4"
                type="number"
                min="1"
                value={form.capacidad}
                onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
              />
            </div>
          </div>
          <div style={styles.buttonGroup}>
            {editandoId && (
              <button type="button" style={styles.button(false)} onClick={handleCancel} disabled={loading}>
                Cancelar
              </button>
            )}
            <button
              type="submit"
              style={{
                ...styles.button(true),
                ...(loading ? styles.buttonDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? "Guardando..." : editandoId ? "Actualizar Mesa" : "Agregar Mesa"}
            </button>
          </div>
        </form>
      </div>

      {loadingData ? (
        <div style={styles.loadingContainer}>
          <div
            style={{
              ...styles.loadingSpinner,
              animation: "spin 1s linear infinite",
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
      ) : (
        <div style={styles.tableContainer}>
          {mesas.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Nombre</th>
                  <th style={styles.tableHeader}>Sector</th>
                  <th style={styles.tableHeader}>Capacidad</th>
                  <th style={styles.tableHeader}>Estado</th>
                  <th style={styles.tableHeader}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mesas.map((mesa) => (
                  <tr
                    key={mesa.id}
                    style={styles.tableRow}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    <td style={styles.tableCell}>{mesa.nombre}</td>
                    <td style={styles.tableCell}>{mesa.sector || "-"}</td>
                    <td style={styles.tableCell}>{mesa.capacidad || "-"}</td>
                    <td style={styles.tableCell}>
                      <span style={styles.badge(mesa.estado)}>{mesa.estado || "sin estado"}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <button style={styles.actionButton("edit")} onClick={() => handleEdit(mesa)} disabled={loading}>
                        Editar
                      </button>
                      <button
                        style={styles.actionButton("delete")}
                        onClick={() => handleDelete(mesa.id)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyState}>
              <p>No hay mesas configuradas. Agregue una nueva mesa usando el formulario.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
