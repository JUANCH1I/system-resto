'use client'

import { useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { imprimirComanda } from '../utils/impresion'
import ComandaItem from '../components/ComandaItem'

export default function ComandaPage() {
  const { id: idMesa } = useParams()
  const [searchParams] = useSearchParams()
  const nombreMesa = searchParams.get('nombre') || idMesa
  const [idComanda, setIdComanda] = useState(null)
  const [productos, setProductos] = useState([])
  const [seleccionados, setSeleccionados] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [fechaComanda, setFechaComanda] = useState(
    new Date().toLocaleDateString()
  )
  const [comentarioActivo, setComentarioActivo] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const productosOriginalesRef = useRef([])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/productos/actives`).then((res) => {
      setProductos(res.data)

      // Extraer categorías únicas de los productos
      const cats = [
        'Todos',
        ...new Set(res.data.map((p) => p.categoria || 'Sin categoría')),
      ]
      setCategorias(cats)
    })

    axios
      .get(`${import.meta.env.VITE_API_URL}/mesas/${idMesa}/comanda-activa`)
      .then((res) => {
        const comandaId = res.data.comanda_id
        setIdComanda(comandaId)
        return axios.get(
          `${import.meta.env.VITE_API_URL}/comandas/${comandaId}`
        )
      })
      .then((res) => {
        setSeleccionados(res.data.productos)
        productosOriginalesRef.current = res.data.productos
      })
      .catch(() => {
        // No hay comanda activa, empezamos en blanco
        setSeleccionados([])
      })
  }, [idMesa])

  const agregarProducto = (producto) => {
    const productoExistente = seleccionados.find((p) => p.id === producto.id)

    if (productoExistente) {
      setSeleccionados(
        seleccionados.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      )
    } else {
      console.log('seleccionados', seleccionados)
      console.log('producto', producto)
      setSeleccionados([
        ...seleccionados,
        {
          ...producto,
          id: producto.id,
          producto_id: producto.id,
          cantidad: 1,
          precio_unitario: producto.precio,
          comentario: '',
          descuento: 0, // nuevo
          codigo: producto.codigo,
        },
      ])
    }
  }

  const cambiarCantidad = (index, incremento) => {
    const nuevaLista = [...seleccionados]
    nuevaLista[index].cantidad = Math.max(
      1,
      nuevaLista[index].cantidad + incremento
    )
    setSeleccionados(nuevaLista)
  }

  const eliminarProducto = (index) => {
    setSeleccionados(seleccionados.filter((_, i) => i !== index))
    if (comentarioActivo === index) {
      setComentarioActivo(null)
    }
  }

  const crearComanda = async () => {
    if (idComanda) {
      alert('Ya hay una comanda activa en esta mesa')
      return
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/comandas`, {
        mesa_id: idMesa,
        usuario_id: 1,
        productos: seleccionados.map((p) => ({
          producto_id: p.id,
          cantidad: p.cantidad,
          comentario: p.comentario,
          descuento: p.descuento,
          precio_unitario: p.precio_unitario ?? p.precio,
          codigo: p.codigo,
        })),
      })
      setIdComanda(res.data.comanda_id)
      imprimirComanda({ idMesa, fechaComanda, seleccionados })
    } catch (error) {
      alert('Error al enviar la comanda: ' + error.message)
    }
  }

  const obtenerProductosNuevos = () => {
    return seleccionados.filter((nuevo) => {
      const nuevoId = nuevo.producto_id
      const original = productosOriginalesRef.current.find(
        (p) => p.producto_id === nuevoId
      )

      if (!original) return true
      if (nuevo.cantidad > original.cantidad) return true
      if ((nuevo.comentario || '') !== (original.comentario || '')) return true

      return false
    })
  }

  const guardarComanda = async () => {
    try {
      if (!idComanda) {
        // Crear comanda nueva
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/comandas`,
          {
            mesa_id: idMesa,
            usuario_id: 1,
            productos: seleccionados.map((p) => ({
              producto_id: p.id,
              cantidad: p.cantidad,
              comentario: p.comentario,
              descuento: p.descuento,
              precio_unitario: p.precio_unitario ?? p.precio,
              codigo: p.codigo,
            })),
          }
        )

        setIdComanda(res.data.comanda_id)
        imprimirComanda({ idMesa, fechaComanda, seleccionados })
        productosOriginalesRef.current = [...seleccionados]
      } else {
        // Actualizar comanda existente
        await axios.put(
          `${import.meta.env.VITE_API_URL}/comandas/${idComanda}`,
          {
            productos: seleccionados.map((p) => ({
              producto_id: p.producto_id,
              cantidad: p.cantidad,
              comentario: p.comentario,
              descuento: p.descuento,
              precio_unitario: p.precio_unitario,
              codigo: p.codigo,
            })),
          }
        )

        const nuevos = obtenerProductosNuevos()

        if (nuevos.length > 0) {
          const productosConDiferencias = nuevos.map((nuevo) => {
            const original = productosOriginalesRef.current.find(
              (p) => p.producto_id === nuevo.producto_id
            )

            const cantidadAnterior = original?.cantidad || 0
            const cantidadNueva = nuevo.cantidad - cantidadAnterior

            return {
              ...nuevo,
              cantidad: cantidadNueva,
            }
          })

          imprimirComanda({
            idMesa,
            fechaComanda,
            seleccionados: productosConDiferencias,
          })
        }

        productosOriginalesRef.current = [...seleccionados]
      }
    } catch (error) {
      alert('Error al guardar la comanda: ' + error.message)
    }
  }

  const productosFiltrados = productos.filter((p) => {
    const categoriaOk =
      categoriaActiva === 'Todos' ||
      (p.categoria || 'Sin categoría') === categoriaActiva
    const busquedaOk = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return categoriaOk && busquedaOk
  })

  const calcularTotales = () => {
    const subtotal = seleccionados.reduce((sum, p) => {
      const precio = p.precio_unitario ?? p.precio
      const descuento = Number(p.descuento ?? 0)
      return sum + (precio * p.cantidad - descuento)
    }, 0)
  
    const iva = subtotal * 0.15
    const servicio = (subtotal + iva) * 0.1
    const total = subtotal + iva + servicio 
  
    return { subtotal, iva, servicio, total }
  }
  

  const calcularTotal = () => {
    const subtotal = seleccionados.reduce((sum, p) => {
      const precio = p.precio_unitario ?? p.precio
      const descuento = Number(p.descuento ?? 0) // descuento en valor
      return sum + (precio * p.cantidad - descuento)
    }, 0)
  
    const iva = subtotal * 0.15
    const servicio = (subtotal + iva) * 0.1
    const propinaValue = Number.parseFloat(propina) || 0
    const total = subtotal + iva + servicio + propinaValue
  
    return total.toFixed(2)
  }
  

  const toggleComentario = (index) => {
    setComentarioActivo(comentarioActivo === index ? null : index)
  }

  const { total, subtotal, iva, servicio } = calcularTotales()


  // Estilos
  const styles = {
    container: {
      display: 'flex',
      gap: '20px',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      height: 'calc(100vh - 40px)',
    },
    leftPanel: {
      width: '60%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      overflow: 'hidden',
    },
    rightPanel: {
      width: '50%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      overflow: 'hidden',
      // 👇 NUEVO
      height: '100%',
    },
    header: {
      backgroundColor: '#f8f9fa',
      padding: '15px 20px',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: '#343a40',
    },
    mesaTag: {
      backgroundColor: '#e9ecef',
      color: '#495057',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
    },
    categorias: {
      display: 'flex',
      overflowX: 'auto',
      padding: '10px 15px',
      borderBottom: '1px solid #e9ecef',
      gap: '10px',
    },
    categoriaBtn: (activa) => ({
      padding: '6px 12px',
      borderRadius: '20px',
      border: 'none',
      backgroundColor: activa ? '#007bff' : '#e9ecef',
      color: activa ? 'white' : '#495057',
      cursor: 'pointer',
      fontSize: '14px',
      whiteSpace: 'nowrap',
    }),
    productosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '15px',
      padding: '20px',
      overflowY: 'auto',
    },
    productoCard: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '15px',
      borderRadius: '6px',
      border: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      height: '100px',
    },
    productoCardHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    productoNombre: {
      margin: '0 0 8px 0',
      fontSize: '15px',
      fontWeight: '500',
      color: '#343a40',
    },
    productoPrecio: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      color: '#007bff',
    },

    footer: {
      padding: '15px 20px',
      borderTop: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa',
    },
    totalSection: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'column',
      alignItems: 'end',
      marginBottom: '15px',
    },
    totalLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#343a40',
    },
    totalAmount: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#007bff',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      color: '#6c757d',
    },
    emptyStateText: {
      fontSize: '16px',
      marginTop: '10px',
    },
    buttonRow: {
      display: 'flex',
      gap: '8px',
      marginBottom: '10px',
    },
    actionButton: {
      flex: '1',
      padding: '10px',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      textAlign: 'center',
    },
    buttonDisabled: {
      opacity: 0.65,
      cursor: 'not-allowed',
    },
    productoInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    comentarioPreview: {
      fontSize: '12px',
      color: '#6c757d',
      fontStyle: 'italic',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '150px',
    },
    comandaContent: { padding: '8px', overflowY: 'auto', flex: 1 },
  }

  return (
    <div style={styles.container}>
      {/* Panel de productos (izquierda) */}
      <div style={styles.leftPanel}>
        <div style={styles.header}>
          <h3 style={styles.title}>Productos</h3>
        </div>
        <div style={{ padding: '10px 15px' }}>
          <input
            type='text'
            placeholder='Buscar producto...'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              resize: 'vertical',
              fontSize: '14px',
              backgroundColor: '#fff',
              color: '#495057',
            }}
          />
        </div>

        {/* Categorías */}
        <div style={styles.categorias}>
          {categorias.map((cat) => (
            <button
              key={cat}
              style={styles.categoriaBtn(cat === categoriaActiva)}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        <div style={styles.productosGrid}>
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((p) => (
              <div
                key={p.id}
                style={styles.productoCard}
                onClick={() => agregarProducto(p)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <h4 style={styles.productoNombre}>{p.nombre}</h4>
                <p style={styles.productoPrecio}>${p.precio}</p>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>
                No hay productos en esta categoría
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Panel de comanda (derecha) */}
      <div style={styles.rightPanel}>
        <div style={styles.header}>
          <h3 style={styles.title}>Comanda</h3>
          <span style={styles.mesaTag}>{nombreMesa}</span>
        </div>

        <div style={styles.comandaContent}>
          {seleccionados.length > 0 ? (
            seleccionados.map((p, index) => (
              <ComandaItem
                key={index}
                index={index}
                producto={p}
                comentarioActivo={comentarioActivo}
                setComentarioActivo={setComentarioActivo}
                onChange={(idx, newProducto) => {
                  const nuevos = [...seleccionados]
                  nuevos[idx] = newProducto
                  setSeleccionados(nuevos)
                }}
                onDelete={(idx) => eliminarProducto(idx)}
              />
            ))
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>
                No hay productos seleccionados. Haz clic en los productos para
                agregarlos a la comanda.
              </p>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.totalSection}>
            <span style={styles.totalLabel}>Subtotal:</span>
            <span style={styles.totalAmount}>${subtotal}</span>
  
            <span style={styles.totalLabel}>IVA (15%):</span>
            <span style={styles.totalAmount}>${iva.toFixed(2)}</span>
       
            <span style={styles.totalLabel}>Servicio (10%):</span>
            <span style={styles.totalAmount}>${servicio.toFixed(2)}</span>
            <span style={styles.totalLabel}>Total:</span>
            <span style={styles.totalAmount}>${total.toFixed(2)}</span>
          </div>

          {/* Botones principales */}
          <div style={styles.buttonRow}>
            {!idComanda ? (
              <button
                style={{
                  ...styles.actionButton,
                  backgroundColor: '#28a745',
                  ...(seleccionados.length === 0 ? styles.buttonDisabled : {}),
                }}
                onClick={crearComanda}
                disabled={seleccionados.length === 0}
              >
                Guardar mesa
              </button>
            ) : (
              <>
                <button
                  style={{
                    ...styles.actionButton,
                    backgroundColor: '#17a2b8',
                  }}
                  onClick={guardarComanda}
                >
                  Guardar
                </button>
                <button
                  style={{
                    ...styles.actionButton,
                    backgroundColor: '#ffc107',
                  }}
                  onClick={() => {
                    window.location.href = `/comanda/${idComanda}/cierre`
                  }}
                >
                  Pago
                </button>
                <button
                  style={{
                    ...styles.actionButton,
                    backgroundColor: '#dc3545',
                  }}
                  onClick={async () => {
                    const confirmacion = confirm(
                      '¿Seguro que quieres liberar esta mesa?'
                    )
                    if (!confirmacion) return

                    await axios.patch(
                      `${
                        import.meta.env.VITE_API_URL
                      }/comandas/${idComanda}/cerrar`
                    )
                    alert('Mesa liberada')
                    window.location.href = `/mesas/diagrama`
                  }}
                >
                  Liberar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  )
}
