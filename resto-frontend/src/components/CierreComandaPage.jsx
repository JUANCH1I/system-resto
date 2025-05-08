'use client'

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { imprimirFacturaCliente } from '../utils/impresion'
import PrefacturaButton from '../components/PrefacturaButton'
import { useCaja } from '../context/CajaContext'

export default function CierreComandaPage() {
  const { caja } = useCaja()
  const { id } = useParams()
  const navigate = useNavigate()
  const [comanda, setComanda] = useState(null)
  const [productos, setProductos] = useState([])
  const [cliente, setCliente] = useState({
    tipo: 'consumidor_final',
    nombre: '',
    cedula_ruc: '',
    correo: '',
    telefono: '',
    direccion: '',
  })
  const [propina, setPropina] = useState(0)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [propinaPercentage, setPropinaPercentage] = useState(0)
  const [conServicio, setConServicio] = useState(true)

  console.log(caja)

  useEffect(() => {
    const fetchComanda = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL_PRODUCTION}/comandas/${id}`
        )
        setComanda(res.data.comanda)
        setProductos(res.data.productos)
        setConServicio(res.data.comanda.con_servicio ?? true)
      } catch (err) {
        console.error('Error al cargar comanda:', err)
        setError('No se pudo cargar la comanda. Por favor, intente nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchComanda()
  }, [id])

  const calcularTotales = () => {
    const tasaIva = 0.15

    let subtotal = 0
    let totalIva = 0
    let total = 0
    let servicio = 0

    let precioTotalSinImpuesto = 0
    let precioSinIva = 0
    let precioConIva = 0
    let valorIva = 0

    const detallesCalculados = productos.map((p) => {
      const precioConIvaUnitario = p.precio_unitario ?? p.precio
      const cantidad = Number(p.cantidad)
      const descuento = Number(p.descuento ?? 0)

      const precioSinIvaUnitario = +(
        precioConIvaUnitario /
        (1 + tasaIva)
      ).toFixed(2)
      const baseImponible = +(
        precioSinIvaUnitario * cantidad -
        descuento
      ).toFixed(2)
      const baseImponibleTotal = subtotal
      const valorIvaProducto = +(baseImponible * tasaIva).toFixed(2)

      subtotal += baseImponible
      totalIva += valorIvaProducto

      precioTotalSinImpuesto += +(
        precioSinIvaUnitario * cantidad -
        descuento
      ).toFixed(2)
      precioSinIva += +(precioSinIvaUnitario * cantidad).toFixed(2)
      precioConIva += +(precioConIvaUnitario * cantidad).toFixed(2)
      valorIva += valorIvaProducto

      return {
        ...p,
        precioConIva: precioConIvaUnitario,
        precioSinIva: precioSinIvaUnitario,
        baseImponible: baseImponibleTotal,
        valorIva: valorIvaProducto,
        descuento,
        cantidad,
      }
    })

    servicio = conServicio ? +(subtotal * 0.1).toFixed(2) : 0
    total = +(subtotal + totalIva + servicio).toFixed(2)
    const baseImponibleTotal = subtotal

    return {
      subtotal: +subtotal,
      iva: +totalIva,
      servicio,
      total,
      tasaIva,
      precioTotalSinImpuesto: +precioTotalSinImpuesto,
      valorIva: +valorIva,
      precioSinIva: +precioSinIva,
      precioConIva: +precioConIva,
      baseImponible: +baseImponibleTotal,
      detalles: detallesCalculados,
    }
  }

  const {
    subtotal,
    iva,
    servicio,
    total,
    precioTotalSinImpuesto,
    valorIva,
    precioSinIva,
    tasaIva,
    precioConIva,
  } = calcularTotales()

  useEffect(() => {
    if (total >= 50 && cliente.tipo !== 'con_datos') {
      setCliente((prev) => ({ ...prev, tipo: 'con_datos' }))
    }
  }, [total])

  const buscarCliente = async (cedula) => {
    setBuscandoCliente(true)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL_PRODUCTION}/clientes/${cedula}`
      )

      if (res.data) {
        setCliente((prevCliente) => ({
          ...prevCliente,
          tipo: 'con_datos',
          nombre: res.data.nombre || '',
          cedula_ruc: res.data.cedula_ruc || '',
          correo: res.data.correo || '',
          telefono: res.data.telefono || '',
          direccion: res.data.direccion || '',
          tipoIdentificacion: determinarTipoIdentificacion(
            res.data.cedula_ruc || ''
          ),
        }))
      }
    } catch (err) {
      console.log('Cliente no encontrado, continuar con ingreso manual')
      // Si no se encuentra, solo actualizamos la cédula ingresada
      setCliente((prevCliente) => ({
        ...prevCliente,
        cedula_ruc: cedula,
      }))
    } finally {
      setBuscandoCliente(false)
    }
  }

  function determinarTipoIdentificacion(identificacion) {
    if (!identificacion) return '07' // por defecto

    const length = identificacion.length

    if (length === 10) return '05' // Cédula
    if (length === 13) return '04' // RUC

    return '06' // Otro (por ejemplo, pasaporte)
  }

  const handleSubmit = async () => {
    if (submitting) return

    if (cliente.tipo === 'con_datos') {
      if (!cliente.nombre || !cliente.cedula_ruc) {
        alert('Por favor complete los datos del cliente')
        return
      }
    }

    setSubmitting(true)
    setError(null)

    try {
      let clienteId = null
      if (cliente.tipo === 'con_datos') {
        const resCliente = await axios.post(
          `${import.meta.env.VITE_API_URL_PRODUCTION}/clientes`,
          cliente
        )
        clienteId = resCliente.data.id
      }

      productos.map((p) => console.log(p))

      // 🧩 Datos para construir la factura
      const datosFactura = {
        emisor: {
          ambiente: '1', // pruebas
          tipoEmision: '1',
          razonSocial: 'MANFREDI MARIANO DAMIAN CHAMUYO',
          nombreComercial: 'CHAMUYO',
          ruc: '1793167799001',
          direccionMatriz: 'ALFREDO BAQUERIZO N° E7-86 DIEGO DE ALMAGRO',
        },
        cliente: {
          nombre: cliente.nombre || 'Consumidor Final',
          identificacion: cliente.cedula_ruc || '9999999999999',
          tipoIdentificacion: cliente.tipoIdentificacion || '07',
          direccion: cliente.direccion,
        },
        valores: {
          fechaEmision: (() => {
            const fecha = new Date()
            const dia = fecha.getDate().toString().padStart(2, '0')
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
            const anio = fecha.getFullYear()
            return `${dia}/${mes}/${anio}`
          })(),
          totalSinImpuestos: precioTotalSinImpuesto.toFixed(2),
          totalDescuento: productos.reduce(
            (sum, p) => sum + (p.descuento ?? 0),
            0
          ),
          totalIva: valorIva,
          propina: servicio.toFixed(2),
          importeTotal: +(
            productos.reduce((sum, p) => {
              const precioConIvaUnitario = p.precio_unitario ?? p.precio ?? 0
              const cantidad = Number(p.cantidad ?? 1)
              const descuento = Number(p.descuento ?? 0)
              return sum + (precioConIvaUnitario * cantidad - descuento)
            }, 0) + servicio
          ).toFixed(2),
          totalConImpuestos: [
            {
              codigo: '2', // IVA
              codigoPorcentaje: '4', // 2 = tarifa 15%
              baseImponible: subtotal.toFixed(2),
              valor: iva.toFixed(2),
            },
          ],
        },
        detalles: productos.map((p) => ({
          codigoPrincipal: String(p.codigo),
          descripcion: p.nombre,
          cantidad: p.cantidad,
          precioUnitario: +(p.precio_unitario / 1.15).toFixed(2),
          descuento: p.descuento ?? 0.0,
          precioTotalSinImpuesto: (
            (p.precio_unitario / 1.15) *
            p.cantidad
          ).toFixed(2),
          impuestos: [
            {
              codigo: '2',
              codigoPorcentaje: '4',
              tarifa: 15,
              baseImponible: (
                (p.precio_unitario / 1.15) * p.cantidad -
                (p.descuento ?? 0)
              ).toFixed(2),
              valor: ((p.precio_unitario / 1.15) * 0.15).toFixed(2),
            },
          ],
        })),
        pagos: [
          {
            formaPago:
              metodoPago === 'efectivo'
                ? '01'
                : metodoPago === 'tarjeta'
                ? '19'
                : metodoPago === 'transferencia'
                ? '20'
                : '01', // valor por defecto por si algo sale mal
            total: total.toFixed(2),
            plazo: '1',
            tiempo: 'Días',
          },
        ],
        infoAdicional: [
          {
            nombre: 'Correo cliente',
            valor: cliente.correo,
          },
        ],
      }

      // ✅ Ahora enviás todo:
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL_PRODUCTION}/facturas`,
        {
          comanda_id: comanda.id,
          cliente_id: clienteId,
          subtotal,
          iva,
          servicio,
          propina: Number.parseFloat(propina) || 0,
          total,
          metodo_pago: metodoPago,
          caja_id: caja.id,
          datosFactura, // 👈 MÁGIA: datos completos para construir XML
        }
      )

      const { autorizacionSRI, factura_id } = data

      imprimirFacturaCliente({
        comanda,
        productos,
        subtotal,
        iva,
        servicio,
        propina,
        total,
        cliente,
        metodoPago,
        autorizacionSRI,
        factura_id,
        datosFactura,
      })

      navigate('/mesas/diagrama')
    } catch (err) {
      console.error('Error al generar factura:', err)
      setError('No se pudo generar la factura. Por favor, intente nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitCobro = async () => {
    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      let clienteId = null
      if (cliente.tipo === 'con_datos') {
        const resCliente = await axios.post(
          `${import.meta.env.VITE_API_URL_PRODUCTION}/clientes`,
          cliente
        )
        clienteId = resCliente.data.id
      }

       await axios.post(
        `${import.meta.env.VITE_API_URL_PRODUCTION}/facturas/cobrar`,
        {
          comanda_id: comanda.id,
          cliente_id: clienteId,
          subtotal,
          iva,
          servicio,
          propina: Number.parseFloat(propina) || 0,
          total,
          metodo_pago: metodoPago,
          caja_id: caja.id,
        }
      )
      alert('Se ha cobrado el total de la mesa')
    } catch (err) {
      console.error('Error al generar factura:', err)
      setError('No se pudo generar la factura. Por favor, intente nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }
  const handlePropinaPercentageChange = (percentage) => {
    const { subtotal } = calcularTotales()
    setPropinaPercentage(percentage)
    setPropina(((subtotal * percentage) / 100).toFixed(2))
  }

  const handlePropinaValueChange = (value) => {
    setPropina(value)
    const { subtotal } = calcularTotales()
    if (subtotal > 0) {
      setPropinaPercentage(((value / subtotal) * 100).toFixed(1))
    }
  }

  const handleMetodoPagoChange = (metodo, checked) => {
    if (checked) {
      setMetodoPago([...metodoPago.filter((m) => m !== metodo), metodo])
    } else {
      setMetodoPago(metodoPago.filter((m) => m !== metodo))
    }
  }

  const styles = {
    container: {
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
    badge: {
      backgroundColor: '#e9ecef',
      color: '#495057',
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
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
      color: '#343a40',
      borderBottom: '1px solid #e9ecef',
      paddingBottom: '10px',
    },
    radioLabelText: {
      fontSize: '14px',
      color: '#495057',
    },
    checkboxLabelText: {
      fontSize: '14px',
      color: '#495057',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '20px',
    },
    radioGroup: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px',
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    radio: {
      marginRight: '8px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '15px',
    },
    label: {
      fontSize: '14px',
      marginBottom: '6px',
      color: '#343a40',
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
    inputFocus: {
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '20px',
      fontSize: '14px',
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      color: '#495057',
      textAlign: 'left',
      padding: '12px 15px',
      borderBottom: '2px solid #dee2e6',
      fontWeight: '600',
    },
    tableCell: {
      padding: '12px 15px',
      borderBottom: '1px solid #dee2e6',
      color: '#212529',
    },
    totalesGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '10px',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: '14px',
      color: '#495057',
      textAlign: 'right',
    },
    totalValue: {
      fontSize: '14px',
      color: '#212529',
      fontWeight: '500',
      textAlign: 'right',
      minWidth: '100px',
    },
    totalFinal: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#2c3e50',
    },
    propinaContainer: {
      marginTop: '15px',
      marginBottom: '15px',
    },
    propinaButtons: {
      display: 'flex',
      gap: '10px',
      marginBottom: '10px',
    },
    propinaButton: (active) => ({
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      backgroundColor: active ? '#007bff' : '#f8f9fa',
      color: active ? 'white' : '#495057',
      fontSize: '14px',
      cursor: 'pointer',
    }),
    metodoPagoContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    checkbox: {
      marginRight: '8px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '20px',
    },
    button: (primary = true) => ({
      padding: '12px 20px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: primary ? '#28a745' : '#6c757d',
      color: 'white',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }),
    buttonHover: (primary = true) => ({
      backgroundColor: primary ? '#218838' : '#5a6268',
    }),
    buttonDisabled: {
      opacity: 0.65,
      cursor: 'not-allowed',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '300px',
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
    divider: {
      height: '1px',
      backgroundColor: '#e9ecef',
      margin: '20px 0',
    },
  }

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>{error}</div>
        <button
          style={styles.button(false)}
          onClick={() => navigate('/mesas/diagrama')}
        >
          Volver al diagrama de mesas
        </button>
      </div>
    )
  }

  if (!comanda) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          No se encontró la comanda solicitada.
        </div>
        <button
          style={styles.button(false)}
          onClick={() => navigate('/mesas/diagrama')}
        >
          Volver al diagrama de mesas
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Cierre de Comanda</h2>
        <span style={styles.badge}>
          Mesa {comanda.mesa_id} - Comanda #{comanda.id}
        </span>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Detalle de consumo</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Producto</th>
                <th style={styles.tableHeader}>Cantidad</th>
                <th style={styles.tableHeader}>Precio Unit.</th>
                <th style={styles.tableHeader}>Descuento</th>
                <th style={styles.tableHeader}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{producto.nombre}</td>
                  <td style={styles.tableCell}>{producto.cantidad}</td>
                  <td style={styles.tableCell}>
                    ${(producto.precio_unitario / 1.15).toFixed(2)}
                  </td>
                  <td style={styles.tableCell}>${producto.descuento}</td>
                  <td style={styles.tableCell}>
                    $
                    {(
                      (producto.precio_unitario / 1.15) * producto.cantidad -
                      (producto.descuento ?? 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Datos del cliente</h3>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type='radio'
              style={styles.radio}
              checked={cliente.tipo === 'consumidor_final'}
              onChange={() => setCliente({ tipo: 'consumidor_final' })}
              disabled={total >= 50}
            />
            <span style={styles.radioLabelText}>
              {' '}
              Consumidor Final {total >= 50 && ' (no permitido por total)'}
            </span>
          </label>
          <label style={styles.radioLabel}>
            <input
              type='radio'
              style={styles.radio}
              checked={cliente.tipo === 'con_datos'}
              onChange={() => setCliente({ ...cliente, tipo: 'con_datos' })}
            />
            <span style={styles.radioLabelText}>Factura con datos</span>
          </label>
        </div>

        {cliente.tipo === 'con_datos' && (
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='cedula_ruc'>
                Cédula/RUC*
              </label>
              <input
                id='cedula_ruc'
                style={styles.input}
                placeholder='Ingrese cédula o RUC'
                value={cliente.cedula_ruc}
                onChange={(e) => {
                  const value = e.target.value
                  setCliente({ ...cliente, cedula_ruc: value })
                }}
                onBlur={(e) => buscarCliente(e.target.value)}
              />
              {buscandoCliente && (
                <small style={{ color: '#6c757d' }}>Buscando cliente...</small>
              )}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='nombre'>
                Nombre/Razón Social*
              </label>
              <input
                id='nombre'
                style={styles.input}
                placeholder='Ingrese nombre completo'
                value={cliente.nombre}
                onChange={(e) =>
                  setCliente({ ...cliente, nombre: e.target.value })
                }
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='apellido'>
                Apellido*
              </label>
              <input
                id='apellido'
                style={styles.input}
                placeholder='Ingrese Apellido'
                value={cliente.apellido}
                onChange={(e) =>
                  setCliente({ ...cliente, apellido: e.target.value })
                }
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='correo'>
                Correo electrónico
              </label>
              <input
                id='correo'
                style={styles.input}
                placeholder='Ingrese correo (opcional)'
                value={cliente.correo}
                onChange={(e) =>
                  setCliente({ ...cliente, correo: e.target.value })
                }
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='telefono'>
                Teléfono
              </label>
              <input
                id='telefono'
                style={styles.input}
                placeholder='Ingrese teléfono (opcional)'
                value={cliente.telefono}
                onChange={(e) =>
                  setCliente({ ...cliente, telefono: e.target.value })
                }
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor='direccion'>
                Dirección
              </label>
              <input
                id='direccion'
                style={styles.input}
                placeholder='Ingrese dirección (opcional)'
                value={cliente.direccion}
                onChange={(e) =>
                  setCliente({ ...cliente, direccion: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </div>

      <div style={styles.metodoPagoContainer}>
        <label style={styles.checkboxGroup}>
          <input
            type='radio'
            name='metodoPago'
            value='efectivo'
            checked={metodoPago === 'efectivo'}
            onChange={() => setMetodoPago('efectivo')}
          />
          <span style={styles.checkboxLabelText}>Efectivo</span>
        </label>

        <label style={styles.checkboxGroup}>
          <input
            type='radio'
            name='metodoPago'
            value='tarjeta'
            checked={metodoPago === 'tarjeta'}
            onChange={() => setMetodoPago('tarjeta')}
          />
          <span style={styles.checkboxLabelText}>
            Tarjeta de crédito/débito
          </span>
        </label>

        <label style={styles.checkboxGroup}>
          <input
            type='radio'
            name='metodoPago'
            value='transferencia'
            checked={metodoPago === 'transferencia'}
            onChange={() => setMetodoPago('transferencia')}
          />
          <span style={styles.checkboxLabelText}>Transferencia bancaria</span>
        </label>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Totales</h3>
        <div style={styles.totalesGrid}>
          <div style={styles.totalLabel}>Subtotal:</div>
          <div style={styles.totalValue}>${subtotal}</div>

          <div style={styles.totalLabel}>IVA (15%):</div>
          <div style={styles.totalValue}>${iva.toFixed(2)}</div>

          <div style={styles.totalLabel}>Servicio (10%):</div>
          <div style={styles.totalValue}>${servicio.toFixed(2)}</div>

          <div style={styles.divider}></div>
          <div style={styles.divider}></div>

          <div style={styles.propinaContainer}>
            <div style={styles.label}>Propina:</div>
            <div style={styles.propinaButtons}>
              {[0, 5, 10, 15, 20].map((percent) => (
                <button
                  key={percent}
                  style={styles.propinaButton(propinaPercentage == percent)}
                  onClick={() => handlePropinaPercentageChange(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>
            <input
              type='number'
              style={styles.input}
              value={propina}
              onChange={(e) => handlePropinaValueChange(e.target.value)}
              min='0'
              step='0.01'
            />
          </div>
          <div></div>

          <div style={styles.divider}></div>
          <div style={styles.divider}></div>

          <div style={{ ...styles.totalLabel, ...styles.totalFinal }}>
            TOTAL:
          </div>
          <div style={{ ...styles.totalValue, ...styles.totalFinal }}>
            ${total.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={{
            ...styles.button(false),
            ...(submitting ? styles.buttonDisabled : {}),
          }}
          onClick={() => navigate('/mesas/diagrama')}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          style={{
            ...styles.button(true),
            ...(submitting ? styles.buttonDisabled : {}),
          }}
          onClick={handleSubmitCobro}
          disabled={submitting || metodoPago.length === 0}
        >
          {submitting ? 'Procesando...' : 'Finalizar y cobrar'}
        </button>
        <button
          style={{
            ...styles.button(true),
            ...(submitting ? styles.buttonDisabled : {}),
          }}
          onClick={handleSubmit}
          disabled={submitting || metodoPago.length === 0}
        >
          {submitting ? 'Procesando...' : 'Finalizar y facturar'}
        </button>
        <PrefacturaButton
          comanda={comanda}
          productos={productos}
          subtotal={subtotal}
          iva={iva}
          servicio={servicio}
          total={total}
        />
      </div>
    </div>
  )
}
