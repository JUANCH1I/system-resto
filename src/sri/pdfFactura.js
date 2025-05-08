import PDFDocument from 'pdfkit'
import { parseStringPromise } from 'xml2js'
import bwipjs from 'bwip-js'
import { PassThrough } from 'stream'

/**
 * Genera un PDF de factura a partir de datos proporcionados
 * @param {Object} datos - Datos de la factura
 * @param {string} outputPath - Ruta de salida del PDF
 */
export async function generarPDF(datos) {
  // Crear documento PDF
  console.log('datos', datos)
  const doc = new PDFDocument({
    size: 'A4',
    margin: 30,
    info: {
      Title: `Factura ${datos.numeroFactura}`,
      Author: datos.emisor?.razonSocial || 'Sistema de Facturación',
    },
  })
  const bufferStream = new PassThrough()
  const chunks = []

  // Recoger los datos en chunks
  bufferStream.on('data', (chunk) => chunks.push(chunk))
  bufferStream.on('error', (err) => console.error('PDF stream error:', err))

  // Finalizar
  const endPromise = new Promise((resolve, reject) => {
    bufferStream.on('end', () => resolve(Buffer.concat(chunks)))
  })

  doc.pipe(bufferStream)

  // Generar código de barras
  const barcodeBuffer = await generarCodigoBarras(datos.claveAcceso || '')
  const logoPath = './src/sri/logochamuyo.png'

  // Estilos
  const colorPrimario = '#000000'
  const colorSecundario = '#333333'
  const colorTitulos = '#000000'
  const colorBorde = '#000000'
  const fontTitulo = 'Helvetica-Bold'
  const fontNormal = 'Helvetica'

  // Información de factura (lado derecho)
  doc.font(fontTitulo).fontSize(10).fillColor(colorTitulos)
  doc.text('RUC: ' + (datos.emisor?.ruc || ''), 350, 40, { align: 'right' })

  doc.font(fontTitulo).fontSize(12).fillColor('#000000')
  doc.text('F A C T U R A', 350, 55, { align: 'right' })

  doc.font(fontNormal).fontSize(9).fillColor(colorPrimario)
  doc.text('NRO: ' + (datos.numeroFactura || ''), 350, 70, { align: 'right' })

  doc.fontSize(8).fillColor(colorSecundario)
  doc.text('NÚMERO DE AUTORIZACIÓN', 350, 85, { align: 'right' })
  doc.text(datos.numeroAutorizacion || '', 350, 95, { align: 'right' })

  doc.text('FECHA AUTORIZACIÓN: ' + (datos.fechaAutorizacion || ''), 350, 110, {
    align: 'right',
  })
  doc.text('AMBIENTE: ' + (datos.ambiente || ''), 350, 120, { align: 'right' })
  doc.text('EMISIÓN: ' + (datos.tipoEmision || ''), 350, 130, {
    align: 'right',
  })
  doc.text('CLAVE DE ACCESO:', 350, 140, { align: 'right' })

  // Código de barras
  if (barcodeBuffer) {
    doc.image(barcodeBuffer, 350, 150, { width: 200, align: 'right' })
  }

  // Información del emisor (lado izquierdo)
  doc.font(fontTitulo).fontSize(10).fillColor(colorPrimario)
  doc.text(datos.emisor?.razonSocial || '', 30, 120)

  doc.font(fontNormal).fontSize(9).fillColor(colorSecundario)
  doc.text(datos.emisor?.nombreComercial || '', 30, 135)

  doc.fontSize(8)
  doc.text('Dirección:', 30, 150)
  doc.text(datos.emisor?.direccion || '', 70, 150)

  doc.text('Teléfono:', 30, 165)
  doc.text(datos.emisor?.telefono || '', 70, 165)

  doc.text('Contribuyente especial Nº:', 30, 180)
  doc.text(datos.emisor?.contribuyenteEspecial || '', 130, 180)

  doc.text('Obligado a llevar contabilidad:', 30, 195)
  doc.text(datos.emisor?.obligadoContabilidad || 'NO', 150, 195)

  // Crear caja con bordes redondeados para la información del receptor
  const receptorStartY = 210
  const receptorHeight = 70 // Altura de la caja
  const cornerRadius = 10 // Radio de las esquinas redondeadas

  // Dibujar caja con esquinas redondeadas
  doc
    .roundedRect(30, receptorStartY, 535, receptorHeight, cornerRadius)
    .stroke(colorBorde)

  // Información del receptor dentro de la caja
  doc.fontSize(8)
  doc.text('Identificación:', 40, receptorStartY + 10) // Añadir padding interno
  doc.text(datos.receptor?.identificacion || '', 100, receptorStartY + 10)

  doc.text('Fecha de emisión:', 350, receptorStartY + 10)
  doc.text(datos.fechaEmision || '', 420, receptorStartY + 10)

  doc.text('Razón Social / Nombres:', 40, receptorStartY + 25)
  doc.text(datos.receptor?.razonSocial || '', 140, receptorStartY + 25)

  doc.text('Nombre Comercial / Apellidos:', 40, receptorStartY + 40)
  doc.text(datos.receptor?.nombreComercial || '', 160, receptorStartY + 40)

  doc.text('Dirección:', 40, receptorStartY + 55)
  doc.text(datos.receptor?.direccion || '', 80, receptorStartY + 55)

  doc.text('Teléfono:', 350, receptorStartY + 55)
  doc.text(datos.receptor?.telefono || '', 390, receptorStartY + 55)

  // Tabla de detalles
  const inicioTablaY = 290
  const anchoTabla = 535

  // Cabecera de tabla
  doc.rect(30, inicioTablaY, anchoTabla, 20).stroke()
  doc.fillColor(colorPrimario).font(fontTitulo).fontSize(8)

  doc.text('Cód. Principal', 35, inicioTablaY + 7, {
    width: 60,
    align: 'center',
  })
  doc.text('Cant.', 95, inicioTablaY + 7, { width: 30, align: 'center' })
  doc.text('Descripción', 125, inicioTablaY + 7, {
    width: 180,
    align: 'center',
  })
  doc.text('Detalle Adicional', 305, inicioTablaY + 7, {
    width: 100,
    align: 'center',
  })
  doc.text('P. Unitario', 405, inicioTablaY + 7, { width: 50, align: 'center' })
  doc.text('Des.', 455, inicioTablaY + 7, { width: 30, align: 'center' })
  doc.text('Valor Total', 485, inicioTablaY + 7, { width: 75, align: 'center' })

  // Líneas verticales de la cabecera
  doc
    .moveTo(95, inicioTablaY)
    .lineTo(95, inicioTablaY + 20)
    .stroke()
  doc
    .moveTo(125, inicioTablaY)
    .lineTo(125, inicioTablaY + 20)
    .stroke()
  doc
    .moveTo(305, inicioTablaY)
    .lineTo(305, inicioTablaY + 20)
    .stroke()
  doc
    .moveTo(405, inicioTablaY)
    .lineTo(405, inicioTablaY + 20)
    .stroke()
  doc
    .moveTo(455, inicioTablaY)
    .lineTo(455, inicioTablaY + 20)
    .stroke()
  doc
    .moveTo(485, inicioTablaY)
    .lineTo(485, inicioTablaY + 20)
    .stroke()

  // Contenido de la tabla
  let currentY = inicioTablaY + 20
  const alturaFila = 15

  if (datos.detalles && datos.detalles.length > 0) {
    datos.detalles.forEach((item, index) => {
      // Fondo alternado para las filas (opcional)
      // if (index % 2 === 1) {
      //   doc.rect(30, currentY, anchoTabla, alturaFila).fill("#f9f9f9");
      // }

      doc.rect(30, currentY, anchoTabla, alturaFila).stroke()

      // Líneas verticales
      doc
        .moveTo(95, currentY)
        .lineTo(95, currentY + alturaFila)
        .stroke()
      doc
        .moveTo(125, currentY)
        .lineTo(125, currentY + alturaFila)
        .stroke()
      doc
        .moveTo(305, currentY)
        .lineTo(305, currentY + alturaFila)
        .stroke()
      doc
        .moveTo(405, currentY)
        .lineTo(405, currentY + alturaFila)
        .stroke()
      doc
        .moveTo(455, currentY)
        .lineTo(455, currentY + alturaFila)
        .stroke()
      doc
        .moveTo(485, currentY)
        .lineTo(485, currentY + alturaFila)
        .stroke()

      // Texto
      doc.fillColor(colorPrimario).font(fontNormal).fontSize(8)
      doc.text(item.codigo || '', 35, currentY + 4, {
        width: 60,
        align: 'center',
      })
      doc.text(item.cantidad || '', 95, currentY + 4, {
        width: 30,
        align: 'center',
      })
      doc.text(item.descripcion || '', 125, currentY + 4, { width: 180 })
      doc.text(item.detalleAdicional || '', 305, currentY + 4, { width: 100 })
      doc.text(item.precioUnitario || '', 405, currentY + 4, {
        width: 50,
        align: 'right',
      })
      doc.text(item.descuento || '', 455, currentY + 4, {
        width: 30,
        align: 'right',
      })
      doc.text(item.valorTotal || '', 485, currentY + 4, {
        width: 75,
        align: 'right',
      })

      currentY += alturaFila
    })
  }

  // Información adicional
  currentY += 20
  doc.font(fontTitulo).fontSize(9).fillColor(colorPrimario)
  doc.text('INFORMACIÓN ADICIONAL', 30, currentY)

  // Cuadro de información adicional
  currentY += 15
  const alturaInfoAdicional = 60
  doc.rect(30, currentY, 250, alturaInfoAdicional).stroke()

  doc.font(fontNormal).fontSize(8)
  doc.text('Correo cliente:', 35, currentY + 10)
  doc.text(datos.infoAdicional?.correoCliente || '', 95, currentY + 10)

  doc.text('Dirección cliente:', 35, currentY + 25)
  doc.text(datos.infoAdicional?.direccionCliente || '', 95, currentY + 25)

  // Totales (lado derecho)
  doc.rect(350, currentY, 215, alturaInfoAdicional).stroke()

  // Líneas horizontales para los totales
  for (let i = 1; i < 6; i++) {
    doc
      .moveTo(350, currentY + i * 10)
      .lineTo(565, currentY + i * 10)
      .stroke()
  }

  doc.font(fontTitulo).fontSize(8)
  doc.text('SUBTOTAL 15%', 355, currentY + 2, { width: 110 })
  doc.text(datos.subtotal15 || '', 475, currentY + 2, {
    width: 85,
    align: 'right',
  })

  doc.text('SUBTOTAL SIN IMPUESTOS', 355, currentY + 12, { width: 110 })
  doc.text(datos.subtotal0 || '0.00', 475, currentY + 12, {
    width: 85,
    align: 'right',
  })

  doc.text('DESCUENTO', 355, currentY + 22, { width: 110 })
  doc.text(datos.descuentoValor || '0.00', 475, currentY + 22, {
    width: 85,
    align: 'right',
  })

  doc.text('15%', 355, currentY + 32, { width: 110 })
  doc.text(datos.iva15 || '', 475, currentY + 32, {
    width: 85,
    align: 'right',
  })

  doc.text('SERVICIOS 10%', 355, currentY + 42, { width: 110 })
  doc.text(datos.servicios10 || '', 475, currentY + 42, {
    width: 85,
    align: 'right',
  })

  doc.text('VALOR TOTAL', 355, currentY + 52, { width: 110 })
  doc.text(datos.valorTotal || '', 475, currentY + 52, {
    width: 85,
    align: 'right',
  })

  // Forma de pago
  currentY += alturaInfoAdicional + 20
  doc.font(fontTitulo).fontSize(8)
  doc.text('Forma de pago', 30, currentY)
  doc.text('Valor', 200, currentY)
  doc.text('Plazo', 300, currentY)
  doc.text('Tiempo', 400, currentY)

  currentY += 15
  doc.rect(30, currentY, 535, 20).stroke()

  // Líneas verticales de forma de pago
  doc
    .moveTo(200, currentY)
    .lineTo(200, currentY + 20)
    .stroke()
  doc
    .moveTo(300, currentY)
    .lineTo(300, currentY + 20)
    .stroke()
  doc
    .moveTo(400, currentY)
    .lineTo(400, currentY + 20)
    .stroke()

  if (datos.formaPago && datos.formaPago.length > 0) {
    const pago = datos.formaPago[0]
    doc.font(fontNormal).fontSize(8)
    doc.text(pago.forma || '', 35, currentY + 7, { width: 160 })
    doc.text(pago.valor || '', 205, currentY + 7, { width: 90 })
    doc.text(pago.plazo || '', 305, currentY + 7, { width: 90 })
    doc.text(pago.tiempo || '', 405, currentY + 7, { width: 125 })
  }

  // Pie de página
  const pieY = doc.page.height - 50

  // Línea horizontal al final
  doc
    .moveTo(30, pieY - 10)
    .lineTo(565, pieY - 10)
    .stroke(colorBorde)

  doc.end()

  return new Promise((resolve, reject) => {
    bufferStream.on('end', () => {
      const buffer = Buffer.concat(chunks)
      resolve(buffer) // 👈 retorna el buffer listo
    })
  })
}

/**
 * Genera un código de barras a partir de una clave de acceso
 * @param {string} claveAcceso - Clave de acceso para el código de barras
 * @returns {Promise<Buffer>} - Buffer con la imagen del código de barras
 */
async function generarCodigoBarras(claveAcceso) {
  if (!claveAcceso) return null

  try {
    return await new Promise((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid: 'code128',
          text: claveAcceso,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
          backgroundcolor: 'FFFFFF',
        },
        (err, png) => {
          if (err) reject(err)
          else resolve(png)
        }
      )
    })
  } catch (error) {
    console.error('Error al generar código de barras:', error)
    return null
  }
}

/**
 * Genera un PDF de factura a partir de un archivo XML
 * @param {string} pathXML - Ruta del archivo XML
 * @param {string} outputPath - Ruta de salida del PDF
 * @param {string} logoPath - Ruta opcional al logo de la empresa
 */
export async function generarPDFDesdeXML(pathXML, logoPath = null) {
  const formasPagoMap = {
    '01': 'SIN UTILIZACION DEL SISTEMA FINANCIERO',
    15: 'COMPENSACIÓN DE DEUDAS',
    16: 'TARJETA DE DÉBITO',
    17: 'DINERO ELECTRÓNICO',
    18: 'TARJETA PREPAGO',
    19: 'TARJETA DE CRÉDITO',
    20: 'OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO',
    21: 'ENDOSO DE TÍTULOS',
  }

  try {
    const result = await parseStringPromise(pathXML, { explicitArray: false })
    console.log('result', result)

    const factura = result.factura
    const info = factura.infoTributaria
    const infoFactura = factura.infoFactura
    console.log('infoFactura', infoFactura)
    const detalleRaw = factura.detalles?.detalle
    const detalles = Array.isArray(detalleRaw) ? detalleRaw : [detalleRaw]

    // Transformar datos del XML al formato de la plantilla
    const datos = {
      logoPath: logoPath,
      ambiente: factura.ambiente || 'Producción',
      tipoEmision: factura.tipoEmision || 'Emisión normal',
      numeroFactura: info.estab + '-' + info.ptoEmi + '-' + info.secuencial,
      claveAcceso: info.claveAcceso,
      fechaAutorizacion:
        factura.fechaAutorizacion || new Date().toLocaleString(),
      numeroAutorizacion: info.claveAcceso,
      emisor: {
        ruc: info.ruc,
        razonSocial: info.razonSocial,
        nombreComercial: info.nombreComercial || '',
        direccion: info.dirMatriz || '',
        telefono: infoFactura.telefono || '',
        contribuyenteEspecial: info.contribuyenteEspecial || '',
        obligadoContabilidad: info.obligadoContabilidad || 'NO',
      },
      receptor: {
        razonSocial: infoFactura.razonSocialComprador || '',
        nombreComercial: infoFactura.nombreComercial || '',
        direccion: infoFactura.direccionComprador || '',
        telefono: infoFactura.telefonoComprador || '',
        identificacion: infoFactura.identificacionComprador || '',
        correo: infoFactura.correoComprador || '',
      },
      fechaEmision: infoFactura.fechaEmision || '',
      formaPago: infoFactura.pagos?.pago
        ? Array.isArray(infoFactura.pagos.pago)
          ? infoFactura.pagos.pago.map((p) => ({
              forma: formasPagoMap[p.formaPago] || p.formaPago || '',
              valor: p.total || '',
              plazo: p.plazo || '',
              tiempo: p.unidadTiempo || 'dias',
            }))
          : [
              {
                forma:
                  formasPagoMap[infoFactura.pagos.pago.formaPago] ||
                  infoFactura.pagos.pago.formaPago ||
                  '',
                valor: infoFactura.pagos.pago.total || '',
                plazo: infoFactura.pagos.pago.plazo || '',
                tiempo: infoFactura.pagos.pago.unidadTiempo || 'dias',
              },
            ]
        : [],
      infoAdicional: {
        correoCliente: infoFactura.correoComprador || '',
        direccionCliente: infoFactura.direccionComprador || '',
      },
      detalles: detalles.map((item) => ({
        codigo: item.codigoPrincipal || '',
        cantidad: item.cantidad || '',
        descripcion: item.descripcion || '',
        detalleAdicional: item.detallesAdicionales?.detAdicional?.valor || '',
        precioUnitario: item.precioUnitario || '',
        descuento: item.descuento || '0.00',
        valorTotal: item.precioTotalSinImpuesto || '',
      })),
      subtotal15: infoFactura.totalSinImpuestos || '',
      subtotal0: infoFactura.totalSinImpuestos || '',
      subtotalNoIva: infoFactura.totalSinImpuestos || '',
      descuentoValor: infoFactura.totalDescuento || '',
      iva15: infoFactura.totalConImpuestos.totalImpuesto.valor || '',
      servicios10:
        (Number.parseFloat(infoFactura.totalSinImpuestos || 0) * 0.1).toFixed(
          2
        ) || '',
      valorTotal: infoFactura.importeTotal || '',
      urlDescarga: 'https://facturacionelectronica.samasat.info/sivenin/login',
      usuarioDescarga: infoFactura.identificacionComprador || '',
      claveDescarga: infoFactura.identificacionComprador || '',
    }

    return await generarPDF(datos)
  } catch (error) {
    console.error('Error al generar PDF desde XML:', error)
    throw error
  }
}
