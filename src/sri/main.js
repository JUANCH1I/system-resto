import { construirFactura } from './facturaBuilder.js'
import { generarFacturaXml } from './generarFacturaXml.js'
import { firmarFactura } from './firmadorSri.js'

export async function generarFactura(datosFactura) {
  console.log('datosFacturaMain', datosFactura)
  try {
    // 1. Construir objeto de factura
    const facturaObjeto = construirFactura(datosFactura)

    // 2. Convertir el objeto en XML
    const facturaXml = generarFacturaXml(facturaObjeto)

    // 3. Firmar XML
    const xmlFirmado = await firmarFactura(facturaXml)

    return xmlFirmado
  } catch (error) {
    console.error('Error al generar la factura:', error)
    throw error
  }
}
