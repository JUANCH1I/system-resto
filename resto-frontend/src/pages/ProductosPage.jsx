'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    iva: 0.15,
    iva_incluido: false,
    categoria_id: '',
    imagen: '',
    codigo: '',
  })
  const [editandoId, setEditandoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        axios.get(`${__API_URL__}/productos`),
        axios.get(`${__API_URL__}/categorias`),
      ])
      setProductos(productosRes.data)
      setCategorias(categoriasRes.data)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError(
        'No se pudieron cargar los datos. Por favor, intente nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setForm({
      nombre: '',
      precio: '',
      iva: 0.15,
      iva_incluido: false,
      categoria_id: '',
      imagen: '',
      active: true,
    })
    setEditandoId(null)
  }

  const showSuccessMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validación básica
      if (!form.nombre) {
        throw new Error('El nombre del producto es obligatorio')
      }
      if (
        !form.precio ||
        isNaN(Number.parseFloat(form.precio)) ||
        Number.parseFloat(form.precio) <= 0
      ) {
        throw new Error('El precio debe ser un número mayor que cero')
      }

      if (!editandoId) {
        // Generar código único con prefijo
        const count = productos.length + 1
        const codigo = `PROD-${count.toString().padStart(4, '0')}`
        form.codigo = codigo
      }

      if (editandoId) {
        await axios.put(
          `${__API_URL__}/productos/${editandoId}`,
          form
        )
        showSuccessMessage('Producto actualizado correctamente')
      } else {
        await axios.post(`${__API_URL__}/productos`, form)
        showSuccessMessage('Producto creado correctamente')
      }

      resetForm()
      fetchData()
    } catch (err) {
      console.error('Error al guardar producto:', err)
      setError(
        err.message ||
        'Error al guardar el producto. Por favor, intente nuevamente.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (producto) => {
    setForm({
      nombre: producto.nombre || '',
      precio: producto.precio || '',
      iva: producto.iva || 0.15,
      iva_incluido: producto.iva_incluido || false,
      categoria_id: producto.categoria_id || '',
      imagen: producto.imagen || '',
      active: producto.active || false,
    })
    setEditandoId(producto.id)
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto?')) {
      setSubmitting(true)
      try {
        await axios.delete(`${__API_URL__}/productos/${id}`)
        showSuccessMessage('Producto eliminado correctamente')
        fetchData()
      } catch (err) {
        console.error('Error al eliminar producto:', err)
        setError(
          'No se pudo eliminar el producto. Por favor, intente nuevamente.'
        )
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleCancel = () => {
    resetForm()
  }

  // Filtrar productos
  const productosFiltrados = productos
    .filter((p) => (filtroCategoria ? p.categoria_id == filtroCategoria : true))
    .filter((p) =>
      busqueda ? p.nombre.toLowerCase().includes(busqueda.toLowerCase()) : true
    )

  const getCategoriaName = (id) => {
    const categoria = categorias.find((c) => c.id == id)
    return categoria ? categoria.nombre : '-'
  }

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
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
    section: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginTop: '0',
      marginBottom: '20px',
      color: '#2c3e50',
      borderBottom: '1px solid #e9ecef',
      paddingBottom: '10px',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '15px',
    },
    statusDot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      position: "absolute",
      top: "10px",
      right: "10px",
      boxShadow: "0 0 3px rgba(0,0,0,0.3)",
    },

    label: {
      fontSize: '14px',
      marginBottom: '6px',
      color: '#495057',
      fontWeight: '500',
    },
    input: {
      padding: '10px 12px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '14px',
      transition: 'border-color 0.2s',
      outline: 'none',
    },
    select: {
      padding: '10px 12px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '14px',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '10px',
    },
    checkbox: {
      marginRight: '8px',
    },
    checkboxLabelText: {
      fontSize: '14px',
      color: '#495057',
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '20px',
    },
    button: (primary = true) => ({
      padding: '10px 16px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: primary ? '#007bff' : '#6c757d',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }),
    buttonDisabled: {
      opacity: 0.65,
      cursor: 'not-allowed',
    },
    filterContainer: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    searchInput: {
      padding: '10px 12px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '14px',
      flex: '1',
      minWidth: '200px',
    },
    filterSelect: {
      padding: '10px 12px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '14px',
      backgroundColor: '#fff',
      minWidth: '150px',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '20px',
    },
    productCard: {
      position: "relative",
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    productCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    },
    productImage: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
    },
    productContent: {
      padding: '15px',
    },
    productName: {
      fontSize: '16px',
      fontWeight: '600',
      margin: '0 0 8px 0',
      color: '#2c3e50',
    },
    productPrice: {
      fontSize: '18px',
      fontWeight: '700',
      margin: '0 0 10px 0',
      color: '#007bff',
    },
    productCategory: {
      fontSize: '14px',
      color: '#6c757d',
      margin: '0 0 15px 0',
    },
    productActions: {
      display: 'flex',
      gap: '10px',
    },
    actionButton: (color) => ({
      padding: '6px 10px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: color === 'edit' ? '#17a2b8' : '#dc3545',
      color: 'white',
      fontSize: '12px',
      cursor: 'pointer',
      flex: '1',
      textAlign: 'center',
    }),
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderLeft: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px 15px',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '12px 15px',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 0',
      color: '#6c757d',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#e9ecef',
      color: '#495057',
      marginLeft: '8px',
    },
    filterOption: {
      color: "#2c3e50",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Gestión de Productos</h2>
      </div>

      {successMessage && (
        <div style={styles.successMessage}>{successMessage}</div>
      )}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          {editandoId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='nombre'>
                Nombre*
              </label>
              <input
                id='nombre'
                style={styles.input}
                type='text'
                placeholder='Ej: Hamburguesa Clásica'
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='precio'>
                Precio*
              </label>
              <input
                id='precio'
                style={styles.input}
                type='number'
                step='0.01'
                min='0'
                placeholder='Ej: 9.99'
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='categoria'>
                Categoría
              </label>
              <select
                id='categoria'
                style={styles.select}
                value={form.categoria_id}
                onChange={(e) =>
                  setForm({ ...form, categoria_id: e.target.value })
                }
              >
                <option value=''>Seleccione una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='imagen'>
                URL de Imagen
              </label>
              <input
                id='imagen'
                style={styles.input}
                type='text'
                placeholder='https://ejemplo.com/imagen.jpg'
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='iva'>
                IVA
              </label>
              <select
                id='iva'
                style={styles.select}
                value={form.iva}
                onChange={(e) =>
                  setForm({ ...form, iva: Number.parseFloat(e.target.value) })
                }
              >
                <option value='0'>0%</option>
                <option value='0.15'>15%</option>
                <option value='0.8'>8%</option>
                <option value='0.5'>5%</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>&nbsp;
                <input
                  type='checkbox'
                  style={styles.checkbox}
                  checked={form.iva_incluido}
                  onChange={(e) =>
                    setForm({ ...form, iva_incluido: e.target.checked })
                  }
                />
                <span style={styles.checkboxLabelText}>Precio incluye IVA</span>
              </label>
              <label style={styles.label}>&nbsp;
                <input
                  type='checkbox'
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />
                <span style={styles.checkboxLabelText}>Activo</span>
              </label>
            </div>
          </div>
          <div style={styles.buttonGroup}>
            {editandoId && (
              <button
                type='button'
                style={styles.button(false)}
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancelar
              </button>
            )}
            <button
              type='submit'
              style={{
                ...styles.button(true),
                ...(submitting ? styles.buttonDisabled : {}),
              }}
              disabled={submitting}
            >
              {submitting
                ? 'Guardando...'
                : editandoId
                  ? 'Actualizar Producto'
                  : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          Lista de Productos
          <span style={styles.badge}>{productosFiltrados.length}</span>
        </h3>

        <div style={styles.filterContainer}>
          <input
            type='text'
            style={styles.searchInput}
            placeholder='Buscar por nombre...'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            style={styles.filterSelect}
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value=''>Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id} style={styles.filterOption}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
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
        ) : productosFiltrados.length > 0 ? (
          <div style={styles.productGrid}>
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                style={styles.productCard}
                onMouseOver={(e) => {
                  Object.assign(e.currentTarget.style, styles.productCardHover)
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ ...styles.statusDot, backgroundColor: producto.active ? "green" : "red" }} />

                <div style={styles.productContent}>
                  <p style={styles.productCategory}>
                    Código: {producto.codigo || '-'}
                  </p>

                  <h4 style={styles.productName}>{producto.nombre}</h4>
                  <p style={styles.productPrice}>
                    ${Number.parseFloat(producto.precio).toFixed(2)}
                  </p>
                  <p style={styles.productCategory}>
                    Categoría: {getCategoriaName(producto.categoria_id)}
                  </p>
                  <div style={styles.productActions}>
                    <button
                      style={styles.actionButton('edit')}
                      onClick={() => handleEdit(producto)}
                      disabled={submitting}
                    >
                      Editar
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>No se encontraron productos con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
