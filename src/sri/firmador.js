export function firmarXmlMock(xml) {
  // Simula la firma insertando un tag
  return xml.replace('</factura>', '<firma>***FIRMA AQUÍ***</firma></factura>')
}
