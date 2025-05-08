"use client"

export default function PrefacturaButton({ comanda, productos, subtotal, iva, servicio, total }) {
  const imprimirPrefactura = () => {
    const ventana = window.open("", "", "width=600,height=600")
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prefactura</title>
          <style>
          * {
    color: #000 !important;
    font-weight: bold !important;
  }
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 20px;
              max-width: 500px;
              margin: 0 auto;
              color: #333;
              line-height: 1.5;
            }
            .prefactura-container {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .prefactura-header {
              text-align: center;
              padding-bottom: 15px;
              border-bottom: 2px solid #f0f0f0;
            }
            .prefactura-header h2 {
              margin: 0;
              color: #2c3e50;
              font-size: 22px;
            }
            .prefactura-header p {
              margin: 5px 0 0;
              color: #7f8c8d;
              font-size: 14px;
            }
            .prefactura-info {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
            }
            .prefactura-info div {
              flex: 1;
            }
            .prefactura-info strong {
              color: #2c3e50;
            }
            .productos-table {
              width: 100%;
              border-collapse: collapse;
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
            .propina-sugerida {
              margin-top: 20px;
              padding: 10px 15px;
              background-color: #f0f7ff;
              border-radius: 6px;
              font-size: 14px;
              border-left: 4px solid #007bff;
            }
            .datos-facturacion {
              margin-top: 30px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 6px;
              border: 1px dashed #ced4da;
            }
            .datos-facturacion h3 {
              margin-top: 0;
              color: #2c3e50;
              font-size: 16px;
              margin-bottom: 15px;
            }
            .campo-datos {
              margin-bottom: 10px;
            }
            .campo-datos label {
              display: flex;
              flex-direction: row;
              font-size: 14px;
              margin-bottom: 5px;
              color: #495057;
              font-weight: 500;
              justify-content: space-between;
            }
            .campo-datos .linea {
              border-bottom: 1px solid #ced4da;
              padding-bottom: 5px;
              font-size: 14px;
              color: #6c757d;
              width: 70%;
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
              .prefactura-container {
                border: none;
                box-shadow: none;
              }
              .datos-facturacion {
                border: 1px dashed #ced4da;
              }
            }
          </style>
        </head>
        <body>
          <div class="prefactura-container">
            <div class="prefactura-header">
              <h2>PREFACTURA</h2>
              <p>Restaurante Chamuyo</p>
            </div>
            
            <div class="prefactura-info">
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
                    <td style="font-size: 10px;">
                      ${p.nombre}
                    </td>
                    <td style="font-size: 10px;">${p.cantidad}</td>
                    <td style="text-align: right; font-size: 10px;">${(p.precio_unitario / 1.15).toFixed(2)}</td>
                    <td style="text-align: right; font-size: 10px;">${((p.precio_unitario / 1.15) * p.cantidad).toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
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
              <div class="total-final">
                <span>TOTAL:</span>
                <span>$${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="datos-facturacion">
              <h3>Datos de facturación</h3>
              
              <div class="campo-datos">
                <label>Nombre / Razón social:<div class="linea">&nbsp;</div></label>
                
              </div>
              
              <div class="campo-datos">
                <label>Cédula / RUC:<div class="linea">&nbsp;</div></label>
                
              </div>
              
              <div class="campo-datos">
                <label>Correo electrónico:<div class="linea">&nbsp;</div></label>
                
              </div>

              <div class="campo-datos">
                <label>Dirección:<div class="linea">&nbsp;</div></label>
                
              </div>
              
              <div class="campo-datos">
                <label>Teléfono:<div class="linea">&nbsp;</div></label>
                
              </div>

              <div class="campo-datos">
                <label>Propina:<div class="linea">&nbsp;</div></label>
                
              </div>
            </div>
            <div class="footer">
              <p>¡Gracias por su visita!</p>
              <p>Esperamos verle pronto nuevamente</p>
            </div>
          </div>
        </body>
      </html>
    `
    ventana.document.write(html)
    ventana.document.close()
    ventana.focus()
    setTimeout(() => {
      ventana.print()
      ventana.close()
    }, 300)
  }

  return (
    <button
      style={{
        marginBottom: 12,
        padding: "10px 20px",
        border: "none",
        background: "#6c757d",
        color: "white",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "background-color 0.2s, transform 0.1s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "#5a6268"
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "#6c757d"
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(1px)"
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
      }}
      onClick={imprimirPrefactura}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginRight: "8px" }}
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      Imprimir Prefactura
    </button>
  )
}
