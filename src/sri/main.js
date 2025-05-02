import { construirFactura } from './facturaBuilder.js'
import { generarFacturaXml } from './generarFacturaXml.js'
import { firmarFactura } from './firmadorSri.js'
import fs from 'fs' // Agregado para poder guardar el archivo
import path from 'path'

export async function generarFactura(datosFactura) {
  console.log('datosFacturaMain', datosFactura)
  try {
    // 1. Construir objeto de factura
    const facturaObjeto = construirFactura(datosFactura)

    // 2. Convertir el objeto en XML
    const facturaXml = generarFacturaXml(facturaObjeto)

    const facturaSinFirmarPath = path.resolve('./factura-sin-firmar.xml')
    fs.writeFileSync(facturaSinFirmarPath, facturaXml, 'utf-8')

    // 3. Firmar XML
    const xmlFirmado = await firmarFactura(facturaSinFirmarPath)

    // 4. Guardar el XML firmado
    const outputPath = path.resolve('./factura-firmada.xml')
    fs.writeFileSync(outputPath, xmlFirmado, { encoding: 'utf8' })

    console.log('✅ XML firmado correctamente:', outputPath)
    return xmlFirmado
  } catch (error) {
    console.error('Error al generar la factura:', error)
    throw error
  }
}
