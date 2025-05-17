export function construirFactura(datos) {
  return {
    ambiente: datos.emisor.ambiente || '',
    tipoEmision: datos.emisor.tipoEmision || '',
    razonSocial: datos.emisor.razonSocial,
    nombreComercial: datos.emisor.nombreComercial,
    ruc: datos.emisor.ruc,
    claveAcceso: datos.emisor.claveAcceso,
    codDoc: '01', // Código de Factura
    estab: '001',
    ptoEmi: '001',
    secuencial: datos.valores.secuencial,
    dirMatriz: datos.emisor.direccionMatriz,
    fechaEmision: datos.valores.fechaEmision,
    contribuyenteEspecial: datos.emisor.contribuyenteEspecial || '',
    obligadoContabilidad: datos.emisor.obligadoContabilidad || 'NO',
    tipoIdentificacionComprador: datos.cliente.tipoIdentificacion,
    razonSocialComprador: datos.cliente.nombre,
    identificacionComprador: datos.cliente.identificacion,
    direccionComprador: datos.cliente.direccion || 'S/N',
    totalSinImpuestos: datos.valores.totalSinImpuestos,
    totalDescuento: datos.valores.totalDescuento,
    totalConImpuestos: datos.valores.totalConImpuestos, // ✅ ya viene armado
    propina: datos.valores.propina,
    importeTotal: datos.valores.importeTotal,
    moneda: datos.valores.moneda || 'DOLAR',
    detalles: datos.detalles.map((p) => ({
      codigoPrincipal: p.codigoPrincipal,
      descripcion: p.descripcion,
      cantidad: p.cantidad,
      precioUnitario: p.precioUnitario,
      descuento: p.descuento,
      precioTotalSinImpuesto: p.precioTotalSinImpuesto,
      impuestos: p.impuestos, // ✅ usar impuestos que ya vengan calculados
    })),
    pagos: datos.pagos.map((p) => ({
      formaPago: p.formaPago,
      total: p.total,
      plazo: p.plazo,
      tiempo: p.tiempo,
    })),
    infoAdicional: datos.infoAdicional,
  }
}
