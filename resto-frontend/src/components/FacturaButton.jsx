"use client"

export default function FacturaButton({
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
    // Generar número de factura con formato similar al de la imagen
    const facturaNum = `00200100000${comanda.id}`.slice(-10)
    const autorizacionSRI = `AUTORIZACION${comanda.id}45702501179316779900120020010000024`

    // Formatear fecha actual en formato dd/mes/yyyy
    const fechaActual = new Date()
    const opciones = { day: "2-digit", month: "long", year: "numeric" }
    const fechaFormateada = fechaActual.toLocaleDateString("es-ES", opciones).replace(" de ", "/").replace(" de ", "/")

    const ventana = window.open("", "", "width=400,height=700")
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura Cliente</title>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 0;
              size: 80mm 297mm;
            }
            body {
              font-family: 'Courier New', monospace;
              padding: 5mm;
              max-width: 80mm;
              margin: 0 auto;
              color: #000;
              line-height: 1.2;
              font-size: 9pt;
            }
            .logo {
              text-align: center;
              margin-bottom: 5mm;
            }
            .logo img {
              width: 20mm;
              height: 20mm;
              filter: grayscale(100%);
            }
            .header {
              text-align: center;
              margin-bottom: 3mm;
            }
            .header p {
              margin: 1mm 0;
            }
            .ruc {
              font-weight: bold;
              font-size: 10pt;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 1mm;
            }
            .info-row .label {
              font-weight: bold;
              text-align: left;
              width: 40%;
            }
            .info-row .value {
              text-align: right;
              width: 60%;
            }
            .productos {
              width: 100%;
              margin: 3mm 0;
              border-collapse: collapse;
              font-size: 8pt;
            }
            .productos th, .productos td {
              text-align: left;
              padding: 1mm 0;
            }
            .productos th {
              border-bottom: 1px dotted #000;
            }
            .productos td.cantidad {
              text-align: center;
              width: 15%;
            }
            .productos td.precio, .productos td.total {
              text-align: right;
              width: 20%;
            }
            .productos td.descripcion {
              width: 45%;
            }
            .totales {
              margin-top: 3mm;
              text-align: right;
            }
            .totales p {
              margin: 1mm 0;
            }
            .total-final {
              font-weight: bold;
              font-size: 10pt;
            }
            .disclaimer {
              margin-top: 5mm;
              text-align: center;
              font-size: 8pt;
            }
            .footer {
              margin-top: 5mm;
              text-align: center;
              font-size: 8pt;
            }
            .linea {
              border-top: 1px solid #000;
              margin: 5mm 0;
            }
            @media print {
              body {
                padding: 0;
                width: 80mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="logo">
            <!-- Imagen circular con silueta de copas y botella -->
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-04%20at%208.08.10%20PM-gVV7F6HkpW2o7wcPdgThgWa3dkl1ou.jpeg" alt="Logo Chamuyo" onerror="this.style.display='none'">
          </div>
          
          <div class="header">
            <p class="ruc">1793167799001</p>
            <p>CHAMUYO 002</p>
            <p>AV. TOLEDO N24-345 FRANCISCO SALAZAR</p>
            <p>Telf: 0998614132</p>
          </div>
          
          <div class="info-row">
            <span class="label">N° FACTURA:</span>
            <span class="value">${facturaNum}</span>
          </div>
          
          <div class="info-row">
            <span class="label">AUTORIZACIÓN:</span>
            <span class="value">${autorizacionSRI.substring(0, 20)}...</span>
          </div>
          
          <div class="info-row">
            <span class="label">DEL SRI:</span>
            <span class="value"></span>
          </div>
          
          <div class="info-row">
            <span class="label">FECHA DE VENTA:</span>
            <span class="value">${fechaFormateada}</span>
          </div>
          
          ${
            cliente.tipo === "con_datos"
              ? `
          <div class="info-row">
            <span class="label">CLIENTE:</span>
            <span class="value">${cliente.nombre}</span>
          </div>
          
          <div class="info-row">
            <span class="label">RUC/CI:</span>
            <span class="value">${cliente.cedula_ruc}</span>
          </div>
          
          <div class="info-row">
            <span class="label">DIRECCIÓN:</span>
            <span class="value">${cliente.direccion || "-"}</span>
          </div>
          
          <div class="info-row">
            <span class="label">TELÉFONO:</span>
            <span class="value">${cliente.telefono || "-"}</span>
          </div>
          
          <div class="info-row">
            <span class="label">EMAIL:</span>
            <span class="value">${cliente.correo || "-"}</span>
          </div>
          `
              : `
          <div class="info-row">
            <span class="label">CLIENTE:</span>
            <span class="value">CONSUMIDOR FINAL</span>
          </div>
          `
          }
          
          <table class="productos">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>P.Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${productos
                .map(
                  (p) => `
                <tr>
                  <td class="descripcion">${p.nombre}</td>
                  <td class="cantidad">${p.cantidad}</td>
                  <td class="precio">${p.precio_unitario.toFixed(2)}</td>
                  <td class="total">${(p.precio_unitario * p.cantidad).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="totales">
            <p>Descuento: 0.00</p>
            <p>Subtotal 15%: ${subtotal.toFixed(2)}</p>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Servicio 10%: ${servicio.toFixed(2)}</p>
            <p>IVA 15%: ${iva.toFixed(2)}</p>
            <p class="total-final">Total: ${total.toFixed(2)}</p>
          </div>
          
          <div class="disclaimer">
            Este documento no tiene ninguna validez tributaria.
            Su factura electrónica llegará a su correo electrónico.
            En caso de cualquier inquietud o reclamo contáctenos al correo electrónico:
            info@samasatsa.com
          </div>
          
          <div class="footer">
            <p>Descargue su documento en:</p>
            <p>https://facturacion.samasatsa.com</p>
            <p>Usuario: ${cliente.tipo === "con_datos" ? cliente.cedula_ruc : "----------"}</p>
            <p>Clave: ${cliente.tipo === "con_datos" ? cliente.cedula_ruc : "----------"}</p>
          </div>
          
          <div class="linea"></div>
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
      // ventana.close();
    }, 500)
  }

  return (
    <button
      style={{
        marginBottom: 12,
        padding: "10px 20px",
        border: "none",
        background: "#007bff",
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
        e.currentTarget.style.background = "#0069d9"
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "#007bff"
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(1px)"
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
      }}
      onClick={imprimirFactura}
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
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Imprimir factura para cliente
    </button>
  )
}
