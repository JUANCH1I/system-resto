import { construirFactura } from './facturaBuilder.js'
import { generarFacturaXml } from './generarFacturaXml.js'
import { signXml } from './firmadorSri.js'
import fs from 'fs' // Agregado para poder guardar el archivo
import path from 'path'

export async function generarFactura(datosFactura) {
  console.log('datosFacturaMain', datosFactura)
  try {
    // 1. Construir objeto de factura
    const facturaObjeto = construirFactura(datosFactura)

    // 2. Convertir el objeto en XML
    const facturaXml = generarFacturaXml(facturaObjeto)

    // 3. Firmar el XML (por ahora en modo Mock)
    const xmlFirmado = await firmarXml(
      path.resolve('src/sri/certificados/1013252787118662625022153733.p12'), // tu ruta real
      facturaXml,
      process.env.PASSWORD_SIGNATURE
    )

    // 4. Devolver el XML firmado
    return xmlFirmado
  } catch (error) {
    console.error('Error al generar la factura:', error)
    throw error
  }
}
