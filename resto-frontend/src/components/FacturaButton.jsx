'use client'

export  function FacturaButton({
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
  const imprimirFactura = () => {
    console.log(
      comanda,
      productos,
      subtotal,
      iva,
      servicio,
      propina,
      total,
      cliente,
      metodoPago
    )
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
              <p><strong>Método de pago:</strong> ${metodoPago.join(', ')}</p>
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
}
