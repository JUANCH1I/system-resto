export function imprimirFacturaCliente({
  comanda,
  productos,
  subtotal,
  iva,
  servicio,
  propina,
  total,
  cliente,
  metodoPago,
}) {
  const ventana = window.open('', '', 'width=400,height=700')
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura Cliente</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
              color: #333;
              line-height: 1.5;
            }
            .factura-container {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .factura-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #f0f0f0;
            }
            .factura-header h2 {
              margin: 0;
              color: #2c3e50;
              font-size: 22px;
            }
            .factura-header p {
              margin: 5px 0 0;
              color: #7f8c8d;
              font-size: 14px;
            }
            .factura-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              font-size: 14px;
            }
            .factura-info div {
              flex: 1;
            }
            .factura-info strong {
              color: #2c3e50;
            }
            .productos-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .productos-table th {
              background-color: #f8f9fa;
              padding: 8px;
              text-align: left;
              font-weight: 600;
              color: #2c3e50;
              font-size: 14px;
              border-bottom: 2px solid #ddd;
            }
            .productos-table td {
              padding: 8px;
              border-bottom: 1px solid #eee;
              font-size: 14px;
            }
            .productos-table .comentario {
              font-size: 12px;
              color: #7f8c8d;
              font-style: italic;
              padding-top: 3px;
            }
            .totales {
              margin-top: 20px;
              border-top: 2px solid #f0f0f0;
              padding-top: 15px;
            }
            .totales-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .total-final {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px solid #f0f0f0;
              display: flex;
              justify-content: space-between;
            }
            .cliente-info {
              margin-top: 20px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 6px;
              font-size: 14px;
            }
            .cliente-info p {
              margin: 5px 0;
            }
            .disclaimer {
              margin-top: 30px;
              padding: 10px;
              background-color: #fff8f8;
              border: 1px solid #f5c6cb;
              border-radius: 6px;
              color: #721c24;
              text-align: center;
              font-size: 12px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
            }
            @media print {
              body {
                padding: 0;
              }
              .factura-container {
                border: none;
                box-shadow: none;
              }
              .disclaimer {
                border: 1px dashed #721c24;
              }
            }
          </style>
        </head>
        <body>
          <div class="factura-container">
            <div class="factura-header">
              <h2>FACTURA</h2>
              <p>Restaurante Chamuyo</p>
            </div>
            
            <div class="factura-info">
              <div>
                <p><strong>Mesa:</strong> ${comanda.mesa_id}</p>
                <p><strong>Comanda:</strong> #${comanda.id}</p>
              </div>
              <div style="text-align: right;">
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Hora:</strong> ${new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            
            <table class="productos-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th style="text-align: right;">Precio</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productos
                  .map(
                    (p) => `
                  <tr>
                    <td>
                      ${p.nombre}
                      ${
                        p.comentario
                          ? `<div class="comentario">${p.comentario}</div>`
                          : ''
                      }
                    </td>
                    <td>${p.cantidad}</td>
                    <td style="text-align: right;">$${p.precio_unitario}</td>
                    <td style="text-align: right;">$${(
                      p.precio_unitario * p.cantidad
                    ).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            
            <div class="totales">
              <div class="totales-item">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>
              <div class="totales-item">
                <span>IVA (15%):</span>
                <span>$${iva.toFixed(2)}</span>
              </div>
              <div class="totales-item">
                <span>Servicio (10%):</span>
                <span>$${servicio.toFixed(2)}</span>
              </div>
              <div class="totales-item">
                <span>Propina:</span>
                <span>$${Number.parseFloat(propina).toFixed(2)}</span>
              </div>
              <div class="total-final">
                <span>TOTAL:</span>
                <span>$${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="cliente-info">
              <p><strong>Cliente:</strong> ${
                cliente.tipo === 'con_datos'
                  ? `${cliente.nombre} (${cliente.cedula_ruc})`
                  : 'Consumidor final'
              }</p>
              <p><strong>Método de pago:</strong> ${metodoPago}</p>
            </div>
            
            <div class="disclaimer">
              <strong>Este documento no tiene validez tributaria</strong>
            </div>
            
            <div class="footer">
              <p>¡Gracias por su visita!</p>
              <p>Esperamos verle pronto nuevamente</p>
            </div>
          </div>
        </body>
      </html>
    `
  ventana.document.open()
  console.log('HTML generado:', html)
  ventana.document.write(html)

  ventana.document.close()
  ventana.focus()
  setTimeout(() => {
    ventana.print()
    ventana.close()
  }, 500)
}

export function imprimirComanda({
  idMesa,
  fechaComanda,
  seleccionados,
  mesero = '',
}) {
  // Agrupar productos por categoría para mejor organización
  const productosPorCategoria = seleccionados.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Sin categoría'
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(producto)
    return acc
  }, {})

  const comandaHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comanda Mesa ${idMesa}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 10px;
              max-width: 300px;
              margin: 0 auto;
              font-size: 12px;
            }
            .comanda-container {
              border: 1px solid #000;
              padding: 10px;
            }
            .comanda-header {
              text-align: center;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #000;
            }
            .comanda-header h1 {
              margin: 0;
              font-size: 18px;
              font-weight: bold;
            }
            .comanda-header h2 {
              margin: 5px 0;
              font-size: 16px;
              font-weight: bold;
            }
            .comanda-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 12px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .categoria {
              margin-top: 15px;
              margin-bottom: 5px;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 1px solid #000;
            }
            .producto {
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px dotted #ccc;
            }
            .producto-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .cantidad {
              font-size: 14px;
              font-weight: bold;
              background-color: #000;
              color: #fff;
              padding: 2px 6px;
              border-radius: 10px;
              display: inline-block;
              text-align: center;
              min-width: 15px;
            }
            .comentario {
              margin-top: 5px;
              padding: 5px;
              background-color: #f8f8f8;
              border-left: 3px solid #000;
              font-style: italic;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              padding-top: 10px;
              border-top: 1px dashed #000;
            }
            .checkbox {
              width: 15px;
              height: 15px;
              border: 1px solid #000;
              display: inline-block;
              margin-right: 5px;
              vertical-align: middle;
            }
            @media print {
              body {
                padding: 0;
                font-size: 10pt;
              }
              .comanda-container {
                border: none;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="comanda-container">
            <div class="comanda-header">
              <h1>COMANDA</h1>
              <h2>MESA ${idMesa}</h2>
            </div>
            
            <div class="comanda-info">
              <div>
                <strong>Fecha:</strong> ${fechaComanda.split(' ')[0]}
              </div>
              <div>
                <strong>Hora:</strong> ${
                  fechaComanda.split(' ')[1] || new Date().toLocaleTimeString()
                }
              </div>
            </div>
            
            ${mesero ? `<div><strong>Mesero:</strong> ${mesero}</div>` : ''}
            
            ${Object.entries(productosPorCategoria)
              .map(
                ([categoria, productos]) => `
                  <div class="categoria">${categoria}</div>
                  ${productos
                    .map(
                      (p) => `
                      <div class="producto">
                        <div class="producto-header">
                          <span>${p.nombre}</span>
                          <span class="cantidad">${p.cantidad}</span>
                        </div>
                        ${
                          p.comentario
                            ? `<div class="comentario">${p.comentario}</div>`
                            : ''
                        }
                      </div>
                    `
                    )
                    .join('')}
                `
              )
              .join('')}
            
            <div class="footer">
              <p>Impreso: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `

  const ancho = screen.availWidth
  const alto = screen.availHeight
  const printWindow = window.open(
    '',
    'Factura',
    `height=${alto},width=${ancho},left=0,top=0,toolbar=no,menubar=no,resizable=yes,scrollbars=no,location=no,status=no`
  )
  printWindow.document.write(comandaHtml)
  printWindow.document.close()
  printWindow.focus()

  // Pequeño retraso para asegurar que los estilos se carguen correctamente
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 300)
}

/**
 * Función para imprimir un resumen de cierre de caja con formato mejorado
 * @param {Object} caja - Objeto con la información de la caja a imprimir
 */
export function imprimirCierreCaja(caja) {
  try {
    if (!caja) {
      console.error(
        'Error: No se proporcionó información de caja para imprimir'
      )
      return
    }

    const ventana = window.open('', '_blank', 'width=400,height=600')
    if (!ventana) {
      alert(
        'Por favor permita las ventanas emergentes para imprimir el cierre de caja'
      )
      return
    }

    // Formatear fechas y horas
    const formatearFechaHora = (fechaStr) => {
      if (!fechaStr) return '—'
      const fecha = new Date(fechaStr)
      return fecha.toLocaleString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // Formatear moneda
    const formatearMoneda = (valor) => {
      return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(valor || 0)
    }

    // Calcular duración de la caja
    const calcularDuracion = () => {
      if (!caja.fecha_apertura || !caja.fecha_cierre) return '—'

      const apertura = new Date(caja.fecha_apertura)
      const cierre = new Date(caja.fecha_cierre)
      const diff = cierre - apertura

      const horas = Math.floor(diff / (1000 * 60 * 60))
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      return `${horas}h ${minutos}m`
    }

    // Extraer fecha para el encabezado
    const fechaCaja = caja.fecha_apertura
      ? new Date(caja.fecha_apertura).toLocaleDateString('es-EC')
      : '—'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resumen de Cierre de Caja</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
              color: #333;
              line-height: 1.5;
            }
            .container {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #f0f0f0;
            }
            .header h1 {
              margin: 0;
              color: #2c3e50;
              font-size: 22px;
            }
            .header p {
              margin: 5px 0 0;
              color: #7f8c8d;
              font-size: 14px;
            }
            .info-section {
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              color: #2c3e50;
            }
            .info-value {
              text-align: right;
            }
            .divider {
              height: 1px;
              background-color: #f0f0f0;
              margin: 15px 0;
            }
            .totals-section {
              margin-top: 20px;
              border-top: 2px solid #f0f0f0;
              padding-top: 15px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .total-label {
              font-weight: bold;
              color: #2c3e50;
            }
            .total-value {
              text-align: right;
              font-weight: bold;
            }
            .grand-total {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px solid #f0f0f0;
              display: flex;
              justify-content: space-between;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
            }
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .signature-line {
              width: 45%;
              border-top: 1px solid #333;
              padding-top: 5px;
              text-align: center;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 0;
              }
              .container {
                border: none;
                box-shadow: none;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CIERRE DE CAJA</h1>
              <p>Fecha: ${fechaCaja}</p>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Apertura:</span>
                <span class="info-value">${formatearFechaHora(
                  caja.fecha_apertura
                )}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cierre:</span>
                <span class="info-value">${formatearFechaHora(
                  caja.fecha_cierre
                )}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Duración:</span>
                <span class="info-value">${calcularDuracion()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Usuario:</span>
                <span class="info-value">${
                  caja.usuario_nombre || caja.usuario_id || '—'
                }</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Monto Inicial:</span>
                <span class="info-value">${formatearMoneda(
                  caja.monto_inicial
                )}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Monto Final:</span>
                <span class="info-value">${formatearMoneda(
                  caja.monto_final
                )}</span>
              </div>
            </div>
            
            <div class="totals-section">
              <div class="total-row">
                <span class="total-label">Total Facturado:</span>
                <span class="total-value">${formatearMoneda(
                  caja.total || 0
                )}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Efectivo:</span>
                <span class="total-value">${formatearMoneda(
                  caja.efectivo || 0
                )}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Tarjeta:</span>
                <span class="total-value">${formatearMoneda(
                  caja.tarjeta || 0
                )}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Transferencia:</span>
                <span class="total-value">${formatearMoneda(
                  caja.transferencia || 0
                )}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Propinas:</span>
                <span class="total-value">${formatearMoneda(
                  caja.propina || 0
                )}</span>
              </div>
              
              <div class="grand-total">
                <span>TOTAL:</span>
                <span>${formatearMoneda(caja.total || 0)}</span>
              </div>
            </div>
            
            ${
              caja.observaciones
                ? `
            <div class="divider"></div>
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Observaciones:</span>
              </div>
              <div style="margin-top: 5px; font-size: 14px;">
                ${caja.observaciones}
              </div>
            </div>
            `
                : ''
            }
            
            <div class="signature-section">
              <div class="signature-line">
                Entregado por
              </div>
              <div class="signature-line">
                Recibido por
              </div>
            </div>
            
            <div class="footer">
              <p>Documento generado el ${new Date().toLocaleString()}</p>
              <p>Sistema de Gestión de Restaurante</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
              Imprimir
            </button>
          </div>
        </body>
      </html>
    `

    ventana.document.write(html)
    ventana.document.close()
    ventana.focus()

    // Pequeño retraso para asegurar que los estilos se carguen correctamente
    setTimeout(() => {
      ventana.print()
      // No cerramos automáticamente para permitir al usuario ver la vista previa
      // ventana.close()
    }, 300)
  } catch (error) {
    console.error('Error al imprimir cierre de caja:', error)
    alert(
      'Ocurrió un error al generar la impresión. Por favor, intente nuevamente.'
    )
  }
}
