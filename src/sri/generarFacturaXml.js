import { create } from 'xmlbuilder2'

export function generarFacturaXml(factura) {
  const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele('factura', {
    id: 'comprobante',
    version: '2.1.0',
  })

  // ➡️ infoTributaria
  const infoTributaria = doc.ele('infoTributaria')
  infoTributaria
    .ele('ambiente')
    .txt(factura.ambiente || '')
    .up()
  infoTributaria
    .ele('tipoEmision')
    .txt(factura.tipoEmision || '')
    .up()
  infoTributaria.ele('razonSocial').txt(factura.razonSocial).up()
  infoTributaria
    .ele('nombreComercial')
    .txt(factura.nombreComercial || '')
    .up()
  infoTributaria.ele('ruc').txt(factura.ruc).up()
  infoTributaria.ele('claveAcceso').txt(factura.claveAcceso).up()
  infoTributaria.ele('codDoc').txt(factura.codDoc).up()
  infoTributaria.ele('estab').txt(factura.estab).up()
  infoTributaria.ele('ptoEmi').txt(factura.ptoEmi).up()
  infoTributaria.ele('secuencial').txt(factura.secuencial).up()
  infoTributaria.ele('dirMatriz').txt(factura.dirMatriz).up()

  // ➡️ infoFactura
  const infoFactura = doc.ele('infoFactura')
  infoFactura.ele('fechaEmision').txt(factura.fechaEmision).up()
  if (factura.contribuyenteEspecial)
    infoFactura
      .ele('contribuyenteEspecial')
      .txt(factura.contribuyenteEspecial)
      .up()
  infoFactura
    .ele('obligadoContabilidad')
    .txt(factura.obligadoContabilidad || 'NO')
    .up()
  infoFactura
    .ele('tipoIdentificacionComprador')
    .txt(factura.tipoIdentificacionComprador)
    .up()
  infoFactura.ele('razonSocialComprador').txt(factura.razonSocialComprador).up()
  infoFactura
    .ele('identificacionComprador')
    .txt(factura.identificacionComprador)
    .up()
  if (factura.direccionComprador)
    infoFactura.ele('direccionComprador').txt(factura.direccionComprador).up()
  infoFactura.ele('totalSinImpuestos').txt(factura.totalSinImpuestos).up()
  infoFactura.ele('totalDescuento').txt(factura.totalDescuento).up()

  const totalConImpuestos = infoFactura.ele('totalConImpuestos')
  factura.totalConImpuestos?.forEach((imp) => {
    const totalImpuesto = totalConImpuestos.ele('totalImpuesto')
    totalImpuesto.ele('codigo').txt(imp.codigo).up()
    totalImpuesto.ele('codigoPorcentaje').txt(imp.codigoPorcentaje).up()
    totalImpuesto.ele('baseImponible').txt(imp.baseImponible).up()
    totalImpuesto.ele('valor').txt(imp.valor).up()
    totalImpuesto.up()
  })

  infoFactura.ele('propina').txt(factura.propina).up()
  infoFactura.ele('importeTotal').txt(factura.importeTotal).up()
  infoFactura
    .ele('moneda')
    .txt(factura.moneda || 'DOLAR')
    .up()

  const pagos = infoFactura.ele('pagos')
  factura.pagos?.forEach((pago) => {
    const pagoTag = pagos.ele('pago')
    pagoTag.ele('formaPago').txt(pago.formaPago).up()
    pagoTag.ele('total').txt(pago.total).up()
    pagoTag.ele('plazo').txt(pago.plazo).up()
    pagoTag.ele('unidadTiempo').txt(pago.tiempo).up()
    pagoTag.up()
  })

  // ➡️ detalles
  const detalles = doc.ele('detalles')
  factura.detalles?.forEach((detalle) => {
    const detalleTag = detalles.ele('detalle')
    detalleTag.ele('codigoPrincipal').txt(detalle.codigoPrincipal).up()
    if (detalle.codigoAuxiliar)
      detalleTag.ele('codigoAuxiliar').txt(detalle.codigoAuxiliar).up()
    detalleTag.ele('descripcion').txt(detalle.descripcion).up()
    detalleTag.ele('cantidad').txt(detalle.cantidad).up()
    detalleTag
      .ele('precioUnitario')
      .txt(parseFloat(detalle.precioUnitario))
      .up()
    detalleTag.ele('descuento').txt(parseFloat(detalle.descuento)).up()
    detalleTag
      .ele('precioTotalSinImpuesto')
      .txt(detalle.precioTotalSinImpuesto)
      .up()

    const impuestos = detalleTag.ele('impuestos')
    detalle.impuestos?.forEach((imp) => {
      const impuestoTag = impuestos.ele('impuesto')
      impuestoTag.ele('codigo').txt(imp.codigo).up()
      impuestoTag.ele('codigoPorcentaje').txt(imp.codigoPorcentaje).up()
      impuestoTag.ele('tarifa').txt(imp.tarifa).up()
      impuestoTag.ele('baseImponible').txt(imp.baseImponible).up()
      impuestoTag.ele('valor').txt(imp.valor).up()
      impuestoTag.up()
    })
    detalleTag.up()
  })

  // Terminar
  const xml = doc.end({ prettyPrint: true })
  return xml
}
