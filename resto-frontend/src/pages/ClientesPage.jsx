"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [clienteEditando, setClienteEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    cedula_ruc: "",
    correo: "",
    telefono: "",
    direccion: "",
  })
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/clientes`)
      setClientes(res.data)
    } catch (err) {
      console.error("Error al cargar clientes", err)
      setError("No se pudieron cargar los clientes. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      cedula_ruc: "",
      correo: "",
      telefono: "",
      direccion: "",
    })
    setClienteEditando(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (clienteEditando) {
        await axios.put(`${import.meta.env.VITE_API_URL}/clientes/${clienteEditando.id}`, formData)
        mostrarMensajeExito("Cliente actualizado correctamente")
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/clientes`, formData)
        mostrarMensajeExito("Cliente creado correctamente")
      }
      resetForm()
      setShowForm(false)
      cargarClientes()
    } catch (err) {
      console.error("Error al guardar cliente", err)
      setError("Error al guardar el cliente. Por favor, verifique los datos e intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (cliente) => {
    setFormData({
      nombre: cliente.nombre,
      cedula_ruc: cliente.cedula_ruc,
      correo: cliente.correo || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
    })
    setClienteEditando(cliente)
    setShowForm(true)
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro que desea eliminar este cliente?")) return

    setLoading(true)
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/clientes/${id}`)
      mostrarMensajeExito("Cliente eliminado correctamente")
      cargarClientes()
    } catch (err) {
      console.error("Error al eliminar cliente", err)
      setError("No se pudo eliminar el cliente. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const mostrarMensajeExito = (mensaje) => {
    setSuccessMessage(mensaje)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.cedula_ruc.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Listado de Clientes</h2>
        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nuevo Cliente"}
        </button>
      </div>

      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>{clienteEditando ? "Editar Cliente" : "Nuevo Cliente"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="nombre">
                  Nombre*
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Nombre completo"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="cedula_ruc">
                  Cédula/RUC*
                </label>
                <input
                  type="text"
                  id="cedula_ruc"
                  name="cedula_ruc"
                  value={formData.cedula_ruc}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Cédula o RUC"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="correo">
                  Correo
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Correo electrónico"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="telefono">
                  Teléfono
                </label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Número de teléfono"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="direccion">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Dirección completa"
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button type="button" style={styles.cancelButton} onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" style={styles.submitButton} disabled={loading}>
                {loading ? "Guardando..." : clienteEditando ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre o cédula/RUC"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {loading && !clientesFiltrados.length ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Cargando clientes...</p>
        </div>
      ) : (
        <>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Cédula/RUC</th>
                  <th style={styles.th}>Correo</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Dirección</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} style={styles.tr}>
                    <td style={styles.td}>{cliente.nombre}</td>
                    <td style={styles.td}>{cliente.cedula_ruc}</td>
                    <td style={styles.td}>{cliente.correo || "-"}</td>
                    <td style={styles.td}>{cliente.telefono || "-"}</td>
                    <td style={styles.td}>{cliente.direccion || "-"}</td>
                    <td style={styles.tdActions}>
                      <button style={styles.editButton} onClick={() => handleEdit(cliente)}>
                        Editar
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(cliente.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clientesFiltrados.length === 0 && (
            <div style={styles.emptyState}>
              <p>No se encontraron clientes con ese criterio.</p>
            </div>
          )}
        </>
      )}

      <div style={styles.footer}>
        <p>Total de clientes: {clientesFiltrados.length}</p>
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
  addButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "0",
    marginBottom: "20px",
    color: "#2c3e50",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  formGroup: {
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
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  submitButton: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
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
    maxWidth: "400px",
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
  },
  tr: {
    borderBottom: "1px solid #e9ecef",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "12px 15px",
    color: "#212529",
  },
  tdActions: {
    padding: "8px 15px",
    display: "flex",
    gap: "8px",
  },
  editButton: {
    padding: "6px 12px",
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
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
  emptyState: {
    textAlign: "center",
    padding: "40px 0",
    color: "#6c757d",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "12px 15px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "12px 15px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  footer: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#495057",
  },
}
