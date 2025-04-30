"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [editandoId, setEditandoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [busqueda, setBusqueda] = useState("")

  const fetchCategorias = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categorias`)
      setCategorias(res.data)
    } catch (err) {
      console.error("Error al cargar categorías:", err)
      setError("No se pudieron cargar las categorías. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const resetForm = () => {
    setNombre("")
    setDescripcion("")
    setEditandoId(null)
  }

  const showSuccessMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validación básica
      if (!nombre.trim()) {
        throw new Error("El nombre de la categoría es obligatorio")
      }

      const data = { nombre, descripcion }

      if (editandoId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/categorias/${editandoId}`, data)
        showSuccessMessage("Categoría actualizada correctamente")
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/categorias`, data)
        showSuccessMessage("Categoría creada correctamente")
      }

      resetForm()
      fetchCategorias()
    } catch (err) {
      console.error("Error al guardar categoría:", err)
      setError(err.message || "Error al guardar la categoría. Por favor, intente nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (categoria) => {
    setNombre(categoria.nombre || "")
    setDescripcion(categoria.descripcion || "")
    setEditandoId(categoria.id)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro que desea eliminar esta categoría?")) {
      setSubmitting(true)
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/categorias/${id}`)
        showSuccessMessage("Categoría eliminada correctamente")
        fetchCategorias()
      } catch (err) {
        console.error("Error al eliminar categoría:", err)
        setError("No se pudo eliminar la categoría. Por favor, intente nuevamente.")
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleCancel = () => {
    resetForm()
  }

  // Filtrar categorías por búsqueda
  const categoriasFiltradas = categorias.filter((cat) =>
    busqueda ? cat.nombre.toLowerCase().includes(busqueda.toLowerCase()) : true,
  )

  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
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
    section: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginTop: "0",
      marginBottom: "20px",
      color: "#2c3e50",
      borderBottom: "1px solid #e9ecef",
      paddingBottom: "10px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      marginBottom: "15px",
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
    textarea: {
      padding: "10px 12px",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "14px",
      transition: "border-color 0.2s",
      outline: "none",
      minHeight: "100px",
      resize: "vertical",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
      marginTop: "20px",
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
    buttonDisabled: {
      opacity: 0.65,
      cursor: "not-allowed",
    },
    searchContainer: {
      marginBottom: "20px",
    },
    searchInput: {
      padding: "10px 12px",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "14px",
      width: "100%",
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
    badge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "500",
      backgroundColor: "#e9ecef",
      color: "#495057",
      marginLeft: "8px",
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "20px",
    },
    card: {
      border: "1px solid #e9ecef",
      borderRadius: "8px",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    cardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    },
    cardHeader: {
      padding: "15px",
      borderBottom: "1px solid #e9ecef",
      backgroundColor: "#f8f9fa",
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: "600",
      margin: "0",
      color: "#2c3e50",
    },
    cardBody: {
      padding: "15px",
    },
    cardDescription: {
      fontSize: "14px",
      color: "#6c757d",
      margin: "0 0 15px 0",
      minHeight: "40px",
    },
    cardFooter: {
      padding: "15px",
      borderTop: "1px solid #e9ecef",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Gestión de Categorías</h2>
      </div>

      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>{editandoId ? "Editar Categoría" : "Agregar Nueva Categoría"}</h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="nombre">
                Nombre*
              </label>
              <input
                id="nombre"
                style={styles.input}
                type="text"
                placeholder="Ej: Bebidas"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                style={styles.textarea}
                placeholder="Descripción de la categoría (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>
          <div style={styles.buttonGroup}>
            {editandoId && (
              <button type="button" style={styles.button(false)} onClick={handleCancel} disabled={submitting}>
                Cancelar
              </button>
            )}
            <button
              type="submit"
              style={{
                ...styles.button(true),
                ...(submitting ? styles.buttonDisabled : {}),
              }}
              disabled={submitting}
            >
              {submitting ? "Guardando..." : editandoId ? "Actualizar Categoría" : "Guardar Categoría"}
            </button>
          </div>
        </form>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          Lista de Categorías
          <span style={styles.badge}>{categoriasFiltradas.length}</span>
        </h3>

        <div style={styles.searchContainer}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Buscar categorías..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {loading ? (
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
        ) : categoriasFiltradas.length > 0 ? (
          <div style={styles.cardGrid}>
            {categoriasFiltradas.map((categoria) => (
              <div
                key={categoria.id}
                style={styles.card}
                onMouseOver={(e) => {
                  Object.assign(e.currentTarget.style, styles.cardHover)
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "none"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>{categoria.nombre}</h4>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>{categoria.descripcion || "Sin descripción"}</p>
                </div>
                <div style={styles.cardFooter}>
                  <button
                    style={styles.actionButton("edit")}
                    onClick={() => handleEdit(categoria)}
                    disabled={submitting}
                  >
                    Editar
                  </button>
                  <button
                    style={styles.actionButton("delete")}
                    onClick={() => handleDelete(categoria.id)}
                    disabled={submitting}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>No se encontraron categorías con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
