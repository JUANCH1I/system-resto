import axios from 'axios'
import { parseStringPromise } from 'xml2js'

export async function autorizarComprobante(
  claveAcceso,
  intentos = 5,
  esperaMs = 2000
) {
  for (let i = 0; i < intentos; i++) {
    try {
      const soapBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:aut="http://ec.gob.sri.ws.autorizacion">
          <soapenv:Header/>
          <soapenv:Body>
            <aut:autorizacionComprobante>
              <claveAccesoComprobante>${claveAcceso}</claveAccesoComprobante>
            </aut:autorizacionComprobante>
          </soapenv:Body>
        </soapenv:Envelope>
      `

      const response = await axios.post(
        process.env.URL_PRUEBA_AUTORIZACION,
        soapBody,
        {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            SOAPAction: '',
          },
        }
      )

      const parsed = await parseStringPromise(response.data)

      const respuesta =
        parsed['soap:Envelope']?.['soap:Body']?.[0]?.[
          'ns2:autorizacionComprobanteResponse'
        ]?.[0]?.['RespuestaAutorizacionComprobante']?.[0]

      const autorizacion = respuesta?.autorizaciones?.[0]?.autorizacion?.[0]

      if (autorizacion) {
        return {
          estado: autorizacion.estado?.[0] || null,
          numeroAutorizacion: autorizacion.numeroAutorizacion?.[0] || null,
          claveAccesoConsultada: claveAcceso,
          fechaAutorizacion: autorizacion.fechaAutorizacion?.[0] || null,
          xmlAutorizado: autorizacion.comprobante?.[0] || null,
          raw: parsed,
        }
      }

      // Si no hay autorización, esperar y reintentar
      if (i < intentos - 1) {
        console.log(`⌛ Esperando ${esperaMs}ms antes del intento ${i + 2}...`)
        await new Promise((res) => setTimeout(res, esperaMs))
      }
    } catch (error) {
      console.error('❌ Error en intento de autorización:', error.message)
      if (i === intentos - 1) throw error // lanzar si es el último intento
    }
  }

  // Si tras los intentos no se obtuvo autorización
  return {
    estado: 'NO AUTORIZADO',
    numeroAutorizacion: null,
    fechaAutorizacion: null,
    xmlAutorizado: null,
    raw: null,
  }
}
